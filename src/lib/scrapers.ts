import axios from "axios";
import * as cheerio from "cheerio";

export interface ProductResult {
  title: string;
  price: number;
  priceFormatted: string;
  store: string;
  storeId: string;
  url: string;
  imageUrl?: string;
  inStock: boolean;
  currency: string;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "da-DK,da;q=0.9,en-US;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function parsePrice(priceStr: string): number {
  if (!priceStr) return Infinity;
  const cleaned = priceStr.replace(/[^\d,\.]/g, "").replace(",", ".");
  const parts = cleaned.split(".");
  let normalized = cleaned;
  if (parts.length === 2 && parts[1].length === 3) {
    normalized = parts[0] + parts[1];
  } else if (parts.length === 2) {
    normalized = cleaned;
  }
  return parseFloat(normalized) || Infinity;
}

function formatPrice(price: number): string {
  if (!isFinite(price)) return "N/A";
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// --- SERPAPI (Google Shopping) ---
export async function searchSerpApi(query: string): Promise<ProductResult[]> {
  const apiKey = "44497db21a49a554535ee912d316bbea0fe42a670ddcc2034d254c1b5e44dd74";
  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google_shopping",
        q: query,
        gl: "dk",
        hl: "da",
        api_key: apiKey,
        num: 20,
      },
      timeout: 15000,
    });

    const results: ProductResult[] = [];
    const shoppingResults = response.data?.shopping_results || [];

    for (const item of shoppingResults) {
      const priceStr = item.price || item.extracted_price?.toString() || "";
      const price =
        typeof item.extracted_price === "number"
          ? item.extracted_price
          : parsePrice(priceStr);

      if (price === Infinity) continue;

      results.push({
        title: item.title || query,
        price,
        priceFormatted: formatPrice(price),
        store: item.source || "Google Shopping",
        storeId: "google_shopping",
        url: item.link || item.product_link || "#",
        imageUrl: item.thumbnail,
        inStock: true,
        currency: "DKK",
      });
    }

    return results.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error("SerpAPI error:", err);
    return [];
  }
}

// --- PROSHOP.DK ---
export async function searchProshop(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.proshop.dk/?s=${encodeURIComponent(query)}`;
    const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(response.data);
    const results: ProductResult[] = [];

    $(".site-product-item").each((_, el) => {
      const titleEl = $(el).find(".site-product-item-title a");
      const priceEl = $(el).find(".site-currency-lg, .site-currency-md");
      const imgEl = $(el).find("img");
      const linkEl = $(el).find("a").first();

      const title = titleEl.text().trim();
      const priceText = priceEl.first().text().trim();
      const price = parsePrice(priceText);
      const href = linkEl.attr("href") || "";
      const productUrl = href.startsWith("http")
        ? href
        : `https://www.proshop.dk${href}`;

      if (title && price !== Infinity) {
        results.push({
          title,
          price,
          priceFormatted: formatPrice(price),
          store: "Proshop.dk",
          storeId: "proshop",
          url: productUrl,
          imageUrl: imgEl.attr("src"),
          inStock: !$(el).find(".sold-out").length,
          currency: "DKK",
        });
      }
    });

    return results.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error("Proshop scraper error:", err);
    return [];
  }
}

// --- KOMPLETT.DK ---
export async function searchKomplett(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.komplett.dk/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(response.data);
    const results: ProductResult[] = [];

    $(".product-card, [data-productid]").each((_, el) => {
      const titleEl = $(el).find(".product-title, h2, .title");
      const priceEl = $(el).find(".product-price-now, .price, [class*='price']");
      const imgEl = $(el).find("img");
      const linkEl = $(el).find("a[href]").first();

      const title = titleEl.first().text().trim();
      const priceText = priceEl.first().text().trim();
      const price = parsePrice(priceText);
      const href = linkEl.attr("href") || "";
      const productUrl = href.startsWith("http")
        ? href
        : `https://www.komplett.dk${href}`;

      if (title && price !== Infinity) {
        results.push({
          title,
          price,
          priceFormatted: formatPrice(price),
          store: "Komplett.dk",
          storeId: "komplett",
          url: productUrl,
          imageUrl: imgEl.attr("src"),
          inStock: !$(el).find(".sold-out, .not-in-stock").length,
          currency: "DKK",
        });
      }
    });

    return results.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error("Komplett scraper error:", err);
    return [];
  }
}

// --- POWER.DK ---
export async function searchPower(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.power.dk/search/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        ...HEADERS,
        Referer: "https://www.power.dk/",
      },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data);
    const results: ProductResult[] = [];

    $("[class*='ProductCard'], [class*='product-card'], article[data-sku]").each(
      (_, el) => {
        const titleEl = $(el).find(
          "[class*='title'], [class*='Title'], h2, h3"
        );
        const priceEl = $(el).find("[class*='price'], [class*='Price']");
        const imgEl = $(el).find("img");
        const linkEl = $(el).find("a[href]").first();

        const title = titleEl.first().text().trim();
        const priceText = priceEl.first().text().trim();
        const price = parsePrice(priceText);
        const href = linkEl.attr("href") || "";
        const productUrl = href.startsWith("http")
          ? href
          : `https://www.power.dk${href}`;

        if (title && price !== Infinity) {
          results.push({
            title,
            price,
            priceFormatted: formatPrice(price),
            store: "Power.dk",
            storeId: "power",
            url: productUrl,
            imageUrl: imgEl.attr("src"),
            inStock: true,
            currency: "DKK",
          });
        }
      }
    );

    return results.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error("Power scraper error:", err);
    return [];
  }
}

// --- DBA.DK ---
export async function searchDba(query: string): Promise<ProductResult[]> {
  try {
    const url = `https://www.dba.dk/soeg/?soeg=${encodeURIComponent(query)}`;
    const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(response.data);
    const results: ProductResult[] = [];

    $(".dba-listing-item, [data-cy='result-list-item']").each((_, el) => {
      const titleEl = $(el).find(
        ".listing-item__main-info h2, [class*='title'], h2, h3"
      );
      const priceEl = $(el).find(
        ".price, [class*='price'], [class*='Price']"
      );
      const imgEl = $(el).find("img");
      const linkEl = $(el).find("a[href]").first();

      const title = titleEl.first().text().trim();
      const priceText = priceEl.first().text().trim();
      const price = parsePrice(priceText);
      const href = linkEl.attr("href") || "";
      const productUrl = href.startsWith("http")
        ? href
        : `https://www.dba.dk${href}`;

      if (title && price !== Infinity) {
        results.push({
          title,
          price,
          priceFormatted: formatPrice(price),
          store: "DBA.dk",
          storeId: "dba",
          url: productUrl,
          imageUrl: imgEl.attr("src"),
          inStock: true,
          currency: "DKK",
        });
      }
    });

    return results.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error("DBA scraper error:", err);
    return [];
  }
}
