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

// Vestegnen municipalities + zip codes used to filter scraped results
const VESTEGNEN_TERMS = [
  "glostrup", "albertslund", "ishøj", "taastrup", "høje-taastrup",
  "brøndby", "hvidovre", "rødovre", "vallensbæk", "greve",
  "hedehusene", "brøndby strand", "avedøre",
  "2600", "2605", "2610", "2620", "2625", "2630", "2635", "2640", "2650", "2660", "2670",
];

function isVestegnen(apt: Apartment): boolean {
  const haystack = `${apt.title} ${apt.address}`.toLowerCase();
  return VESTEGNEN_TERMS.some(t => haystack.includes(t));
}

function formatPrice(p: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(p);
}

// Parse Danish price strings like "5.500,-" or "6.000 kr." → number
function parseDanishPrice(s: string): number {
  const cleaned = s.replace(/[^\d.]/g, "").replace(/\./g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

// ── LEJEBOLIG.DK ─────────────────────────────────────────────────────────────
// Correct URL pattern: /lejligheder/[city] — fetches city-specific pages
const VESTEGNEN_CITIES = [
  "glostrup", "albertslund", "hvidovre", "taastrup",
  "br%C3%B8ndby", "r%C3%B8dovre", "ish%C3%B8j", "vallensb%C3%A6k", "greve",
];

function parseLejeBoligPage($: ReturnType<typeof cheerio.load>, city: string, params: ApartmentSearchParams): Apartment[] {
  const results: Apartment[] = [];

  $('a[href^="/lejebolig/"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const fullText = $(el).text().replace(/\s+/g, " ").trim();
    if (!fullText || fullText.toLowerCase().includes("lorem")) return;

    const titleText = $(el).find("h1, h2, h3, h4").first().text().trim()
      || fullText.split(" ").slice(0, 8).join(" ");

    const cityMatch = fullText.match(/lejlighed\s+i\s+([^,\d]+?)(?:\s{2,}|\d|$)/i);
    const addressText = cityMatch ? cityMatch[1].trim() : city;

    const priceMatch = fullText.match(/(\d[\d.]{2,}),-/);
    const price = priceMatch ? parseDanishPrice(priceMatch[1]) : 0;

    const sizeMatch = fullText.match(/(\d+)\s*m²/i);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : undefined;

    const roomsMatch = fullText.match(/(\d+)\s+vær(?:elser?|\.)/i);
    const rooms = roomsMatch ? parseInt(roomsMatch[1], 10) : undefined;

    const imgEl = $(el).find("img").first();
    const rawImg = imgEl.attr("src") || imgEl.attr("data-src");
    const imageUrl = rawImg && !rawImg.includes("bolig-locked") && rawImg.startsWith("http") ? rawImg : undefined;

    if (price >= 500 && price <= params.maxRent && titleText) {
      results.push({
        title: titleText,
        address: addressText,
        price,
        priceFormatted: formatPrice(price),
        rooms,
        size,
        url: `https://www.lejebolig.dk${href}`,
        imageUrl,
        source: "Lejebolig.dk",
        sourceId: "lejebolig",
      });
    }
  });

  return results;
}

async function scrapeLejeBolig(params: ApartmentSearchParams): Promise<Apartment[]> {
  const fetches = VESTEGNEN_CITIES.map(async (city) => {
    try {
      const url = new URL(`https://www.lejebolig.dk/lejligheder/${city}`);
      if (params.minRooms) url.searchParams.set("rooms", String(params.minRooms));
      const res = await axios.get(url.toString(), { headers: HEADERS, timeout: 14000 });
      const $ = cheerio.load(res.data);
      return parseLejeBoligPage($, decodeURIComponent(city), params);
    } catch {
      return [];
    }
  });

  const all = (await Promise.all(fetches)).flat();
  const seen = new Set<string>();
  return all.filter(apt => {
    if (seen.has(apt.url)) return false;
    seen.add(apt.url);
    return true;
  });
}

// ── BOLIGPORTAL.DK ───────────────────────────────────────────────────────────
// Searches each major Vestegnen city and combines results
async function scrapeBoligPortal(params: ApartmentSearchParams): Promise<Apartment[]> {
  const vestegnSlugs = ["glostrup-2600", "hvidovre-2650", "albertslund-2620", "rodovre-2610"];

  const fetches = vestegnSlugs.map(async (slug) => {
    try {
      const url = new URL(`https://www.boligportal.dk/lejeboliger/${slug}/`);
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
          const priceMatch = fullText.match(/(\d[\d.]+)\s*kr\./i);
          if (priceMatch) price = parseDanishPrice(priceMatch[1]);
        }

        const imgEl = $(el).find("img").first();
        const imageUrl = imgEl.attr("src") || imgEl.attr("data-src");

        const titleFromHref = href
          .split("/").filter(Boolean).pop()
          ?.replace(/-id-\d+$/, "").replace(/-/g, " ") || "Lejlighed";

        const title = address
          ? `${rooms ? rooms + "-vær. " : ""}${size ? size + " m² " : ""}— ${address}`
          : titleFromHref;

        if (price >= 1000 && price <= params.maxRent) {
          results.push({
            title,
            address: address || slug,
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
  });

  const allResults = (await Promise.all(fetches)).flat();
  // Deduplicate by URL
  const seen = new Set<string>();
  return allResults.filter(apt => {
    if (seen.has(apt.url)) return false;
    seen.add(apt.url);
    return true;
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params: ApartmentSearchParams = {
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
  const boligPortalItems = resolve(boligPortalResult).filter(isVestegnen);

  const results = [...lejeBoligItems, ...boligPortalItems].sort(
    (a, b) => a.price - b.price
  );

  const sourceLinks = [
    {
      sourceId: "lejebolig",
      name: "Lejebolig.dk",
      url: `https://www.lejebolig.dk/lejligheder?maxRent=${params.maxRent}${params.minRooms ? `&rooms=${params.minRooms}` : ""}`,
      count: lejeBoligItems.length,
    },
    {
      sourceId: "boligportal",
      name: "Boligportal.dk",
      url: `https://www.boligportal.dk/lejeboliger/glostrup-2600/`,
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
