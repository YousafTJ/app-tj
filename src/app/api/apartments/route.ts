import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export interface Apartment {
  title: string;
  address: string;
  price: number;
  priceFormatted: string;
  rooms?: number;
  size?: number; // m²
  url: string;
  imageUrl?: string;
  source: string;
  sourceId: string;
}

export interface ApartmentSearchParams {
  zipCode: string;
  minRooms?: number;
  maxRent: number;
}

export interface ApartmentResponse {
  results: Apartment[];
  bySource: { sourceId: string; name: string; count: number; url: string }[];
  total: number;
  params: ApartmentSearchParams;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "da-DK,da;q=0.9,en-US;q=0.8",
  "Cache-Control": "no-cache",
};

function formatPrice(p: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(p);
}

// Parse Danish price strings like "5.500,-" or "6.000 kr." → number
function parseDanishPrice(s: string): number {
  // Remove everything except digits and dots, then remove dots (thousands separators)
  const cleaned = s.replace(/[^\d.]/g, "").replace(/\./g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

// ── LEJEBOLIG.DK ─────────────────────────────────────────────────────────────
async function scrapeLejeBolig(params: ApartmentSearchParams): Promise<Apartment[]> {
  try {
    const url = new URL("https://www.lejebolig.dk/lejligheder");
    url.searchParams.set("zipCodes", params.zipCode);
    url.searchParams.set("maxRent", String(params.maxRent));
    if (params.minRooms) url.searchParams.set("rooms", String(params.minRooms));

    const res = await axios.get(url.toString(), { headers: HEADERS, timeout: 14000 });
    const $ = cheerio.load(res.data);
    const results: Apartment[] = [];

    $(".lease-item").each((_, el) => {
      const titleText = $(el).find(".lease-description h2").first().text().trim();
      // Skip dummy/locked listings (Lorem ipsum placeholders)
      if (!titleText || titleText.toLowerCase().includes("lorem")) return;

      const addressText = $(el)
        .find(".lease-sub-header div, .lease-sub-header")
        .first()
        .text()
        .trim();

      const priceText = $(el).find(".lease-specs .rent div, .lease-specs .rent").first().text().trim();
      const price = parseDanishPrice(priceText);

      // Size and rooms from .lease-spec spans
      const specSpans = $(el).find(".lease-spec span");
      let size: number | undefined;
      let rooms: number | undefined;

      specSpans.each((i, span) => {
        const txt = $(span).text().trim();
        const m2Match = txt.match(/(\d+)\s*m²/i);
        const roomMatch = txt.match(/^(\d+)\s*vær/i);
        if (m2Match) size = parseInt(m2Match[1], 10);
        else if (roomMatch) rooms = parseInt(roomMatch[1], 10);
        // Also try plain numbers — first is typically size (m²), second rooms
        else if (/^\d+$/.test(txt)) {
          const n = parseInt(txt, 10);
          if (i === 0 && !size) size = n;
          else if (i === 1 && !rooms) rooms = n;
        }
      });

      const linkEl = $(el).find('a[href^="/lejebolig/"]').first();
      const href = linkEl.attr("href") || "";
      const productUrl = href.startsWith("http") ? href : `https://www.lejebolig.dk${href}`;

      const imgEl = $(el).find("img").first();
      const rawImg = imgEl.attr("src") || imgEl.attr("data-src");
      // Exclude locked/placeholder images
      const imageUrl =
        rawImg && !rawImg.includes("bolig-locked") && rawImg.startsWith("http")
          ? rawImg
          : undefined;

      if (price >= 500 && price <= params.maxRent) {
        results.push({
          title: titleText,
          address: addressText || `Postnr. ${params.zipCode}`,
          price,
          priceFormatted: formatPrice(price),
          rooms: rooms || undefined,
          size: size || undefined,
          url: productUrl || url.toString(),
          imageUrl,
          source: "Lejebolig.dk",
          sourceId: "lejebolig",
        });
      }
    });

    return results;
  } catch {
    return [];
  }
}

// ── BOLIGPORTAL.DK ───────────────────────────────────────────────────────────
// Card text format: "2 værelser på 70 m²Nørrebro, Blågårds Plads6.500 kr.2 dage siden"
async function scrapeBoligPortal(params: ApartmentSearchParams): Promise<Apartment[]> {
  try {
    // Boligportal uses city-slug in the URL; map zipcode → city slug
    const zipCity: Record<string, string> = {
      "1": "københavn", "2": "københavn", "27": "brønshøj", "272": "vanløse",
      "28": "lyngby", "29": "hellerup", "30": "helsingør", "34": "hillerød",
      "40": "roskilde", "50": "odense", "52": "odense", "60": "kolding",
      "64": "sønderborg", "67": "esbjerg", "70": "fredericia", "71": "vejle",
      "74": "herning", "75": "holstebro", "80": "aarhus", "82": "aarhus",
      "87": "horsens", "88": "viborg", "89": "randers", "90": "aalborg",
      "92": "aalborg",
    };
    const prefix = params.zipCode.substring(0, 2);
    const citySlug = zipCity[prefix] || "københavn";

    const url = new URL(`https://www.boligportal.dk/lejligheder/${citySlug}/`);
    url.searchParams.set("maxRent", String(params.maxRent));
    if (params.minRooms) url.searchParams.set("minRooms", String(params.minRooms));

    const res = await axios.get(url.toString(), {
      headers: { ...HEADERS, Referer: "https://www.boligportal.dk/" },
      timeout: 14000,
    });
    const $ = cheerio.load(res.data);
    const results: Apartment[] = [];

    $("a.AdCardSrp__Link").each((_, el) => {
      const href = $(el).attr("href") || "";
      const productUrl = href.startsWith("http") ? href : `https://www.boligportal.dk${href}`;

      const fullText = $(el).text().replace(/\s+/g, " ").trim();

      // Pattern: "N værelse(r) på M m²<address><price> kr."
      const match = fullText.match(
        /(\d+)\s+værelse(?:r)?\s+på\s+(\d+)\s*m²\s*(.+?)\s*(\d[\d.]+)\s*kr\./i
      );

      let rooms: number | undefined;
      let size: number | undefined;
      let address = "";
      let price = 0;

      if (match) {
        rooms = parseInt(match[1], 10);
        size = parseInt(match[2], 10);
        address = match[3].trim();
        price = parseDanishPrice(match[4]);
      } else {
        // Fallback: try to find price anywhere in text
        const priceMatch = fullText.match(/(\d[\d.]+)\s*kr\./i);
        if (priceMatch) price = parseDanishPrice(priceMatch[1]);
      }

      const imgEl = $(el).find("img").first();
      const imageUrl = imgEl.attr("src") || imgEl.attr("data-src");

      // Title from address or href slug
      const titleFromHref = href
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/-id-\d+$/, "")
        .replace(/-/g, " ") || "Lejlighed";

      const title = address
        ? `${rooms ? rooms + "-vær. " : ""}${size ? size + " m² " : ""}— ${address}`
        : titleFromHref;

      if (price >= 1000 && price <= params.maxRent) {
        results.push({
          title,
          address: address || citySlug,
          price,
          priceFormatted: formatPrice(price),
          rooms: rooms || undefined,
          size: size || undefined,
          url: productUrl,
          imageUrl,
          source: "Boligportal.dk",
          sourceId: "boligportal",
        });
      }
    });

    return results;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params: ApartmentSearchParams = {
    zipCode: sp.get("zipCode") || "2200",
    minRooms: sp.get("minRooms") ? parseInt(sp.get("minRooms")!) : undefined,
    maxRent: parseInt(sp.get("maxRent") || "10000"),
  };

  if (!params.maxRent || params.maxRent < 1000) {
    return NextResponse.json({ error: "maxRent is required (minimum 1000)" }, { status: 400 });
  }

  const [lejeBoligResult, boligPortalResult] = await Promise.allSettled([
    scrapeLejeBolig(params),
    scrapeBoligPortal(params),
  ]);

  const resolve = (r: PromiseSettledResult<Apartment[]>) =>
    r.status === "fulfilled" ? r.value : [];

  const lejeBoligItems = resolve(lejeBoligResult);
  const boligPortalItems = resolve(boligPortalResult);

  const results = [...lejeBoligItems, ...boligPortalItems].sort(
    (a, b) => a.price - b.price
  );

  const sourceLinks = [
    {
      sourceId: "lejebolig",
      name: "Lejebolig.dk",
      url: `https://www.lejebolig.dk/lejligheder?zipCodes=${params.zipCode}&maxRent=${params.maxRent}${params.minRooms ? `&rooms=${params.minRooms}` : ""}`,
      count: lejeBoligItems.length,
    },
    {
      sourceId: "boligportal",
      name: "Boligportal.dk",
      url: `https://www.boligportal.dk/lejligheder/`,
      count: boligPortalItems.length,
    },
  ];

  return NextResponse.json({
    results: results.slice(0, 60),
    bySource: sourceLinks,
    total: results.length,
    params,
  } satisfies ApartmentResponse);
}
