import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export type Car = {
  title: string;
  year?: number;
  km?: number;
  price: number;
  priceFormatted: string;
  location?: string;
  imageUrl?: string;
  url: string;
  source: string;
  sourceId: string;
};

export type CarResponse = {
  total: number;
  results: Car[];
  bySource: { sourceId: string; name: string; count: number; url: string }[];
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'da-DK,da;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

function formatPrice(price: number): string {
  return price.toLocaleString('da-DK') + ' kr.';
}

function parsePrice(str: string): number {
  const digits = str.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

// ─── Extract JSON from __NEXT_DATA__ script tag ───────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNextData(html: string): Record<string, any> | null {
  try {
    const $ = cheerio.load(html);
    const raw = $('#__NEXT_DATA__').html();
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

// ─── BilBasen ─────────────────────────────────────────────────────────────────
async function scrapeBilBasen(
  make: string, maxPrice: number, minYear: number, maxKm: number
): Promise<Car[]> {
  const params = new URLSearchParams({ PriceFrom: '0', PriceTo: String(maxPrice), YearFrom: String(minYear) });
  if (make) params.set('Make', make);
  if (maxKm) params.set('MileageTo', String(maxKm));

  const searchUrl = `https://www.bilbasen.dk/brugt/bil?${params}`;

  try {
    const { data: html } = await axios.get(searchUrl, { headers: HEADERS, timeout: 15000 });

    // ── Strategy 1: __NEXT_DATA__ ────────────────────────────────────────────
    const next = extractNextData(html);
    if (next) {
      // Try multiple known paths in BilBasen's pageProps
      const listings =
        next?.props?.pageProps?.listings ??
        next?.props?.pageProps?.searchResult?.listings ??
        next?.props?.pageProps?.initialData?.listings ??
        next?.props?.pageProps?.data?.listings ??
        [];

      if (Array.isArray(listings) && listings.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return listings.map((l: any) => {
          const price = l.price ?? l.pris ?? 0;
          const year = l.year ?? l.modelYear ?? l.aargang;
          const km = l.mileage ?? l.kilometerstand ?? l.km;
          const title = l.heading ?? l.title ?? [l.make, l.model, l.variant].filter(Boolean).join(' ');
          const path = l.url ?? l.path ?? l.permalink ?? '';
          const imgUrl = l.images?.[0]?.url ?? l.images?.[0] ?? l.imageUrl ?? '';
          return {
            title,
            year: year ? parseInt(year) : undefined,
            km: km ? parseInt(String(km).replace(/\D/g, '')) : undefined,
            price,
            priceFormatted: formatPrice(price),
            imageUrl: typeof imgUrl === 'string' && imgUrl.startsWith('http') ? imgUrl : undefined,
            url: path.startsWith('http') ? path : `https://www.bilbasen.dk${path}`,
            source: 'BilBasen.dk',
            sourceId: 'bilbasen',
          };
        }).filter((c: Car) => c.price > 0);
      }
    }

    // ── Strategy 2: JSON embedded in <script> with listing data ─────────────
    const scriptMatches = html.match(/"listings"\s*:\s*(\[[\s\S]{50,}\])/);
    if (scriptMatches) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const listings = JSON.parse(scriptMatches[1]) as any[];
        if (listings.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return listings.map((l: any) => ({
            title: l.heading ?? l.title ?? l.make ?? 'Ukendt',
            year: l.year ?? l.modelYear,
            km: l.mileage,
            price: l.price ?? 0,
            priceFormatted: formatPrice(l.price ?? 0),
            imageUrl: l.images?.[0]?.url,
            url: (l.url ?? l.path ?? '').startsWith('http') ? (l.url ?? l.path) : `https://www.bilbasen.dk${l.url ?? l.path ?? ''}`,
            source: 'BilBasen.dk',
            sourceId: 'bilbasen',
          })).filter((c: Car) => c.price > 0);
        }
      } catch { /* ignore */ }
    }

    // ── Strategy 3: cheerio CSS fallback ────────────────────────────────────
    const $ = cheerio.load(html);
    const cars: Car[] = [];

    const selectors = [
      '[data-testid*="listing"]',
      '[class*="ListingCard"]',
      '[class*="listingCard"]',
      '[class*="listing-card"]',
      'article[class*="listing"]',
      '.bb-listing-clickable',
      '[class*="CarCard"]',
    ];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, [class*="heading"], [class*="Heading"], [class*="title"]').first().text().trim();
        if (!title || title.length < 4) return;
        const priceText = $el.find('[class*="price"], [class*="Price"]').first().text();
        const price = parsePrice(priceText);
        if (!price || price < 5000) return;
        const href = $el.find('a').first().attr('href') ?? '';
        const carUrl = href.startsWith('http') ? href : `https://www.bilbasen.dk${href}`;
        const imgUrl = $el.find('img').first().attr('src') ?? $el.find('img').first().attr('data-src') ?? '';
        const body = $el.text();
        const yearMatch = body.match(/\b(19[89]\d|20[012]\d)\b/);
        const kmMatch = body.match(/(\d[\d.,]*)\s*km/i);
        cars.push({
          title,
          year: yearMatch ? parseInt(yearMatch[1]) : undefined,
          km: kmMatch ? parseInt(kmMatch[1].replace(/[.,]/g, '')) : undefined,
          price,
          priceFormatted: formatPrice(price),
          imageUrl: imgUrl.startsWith('http') ? imgUrl : undefined,
          url: carUrl || searchUrl,
          source: 'BilBasen.dk',
          sourceId: 'bilbasen',
        });
      });
      if (cars.length > 0) break;
    }

    return cars.slice(0, 40);
  } catch {
    return [];
  }
}

// ─── DBA ─────────────────────────────────────────────────────────────────────
async function scrapeDBA(
  make: string, maxPrice: number, minYear: number, maxKm: number
): Promise<Car[]> {
  const makePart = make ? `/maerke-${make.toLowerCase()}` : '';
  const params = new URLSearchParams();
  if (maxPrice) params.set('pris_til', String(maxPrice));
  if (minYear) params.set('aargang_fra', String(minYear));
  if (maxKm) params.set('km_til', String(maxKm));

  const searchUrl = `https://www.dba.dk/biler/biler${makePart}/?${params}`;

  try {
    const { data: html } = await axios.get(searchUrl, { headers: HEADERS, timeout: 15000 });

    // ── Strategy 1: __NEXT_DATA__ ────────────────────────────────────────────
    const next = extractNextData(html);
    if (next) {
      const listings =
        next?.props?.pageProps?.listings ??
        next?.props?.pageProps?.items ??
        next?.props?.pageProps?.initialData?.items ??
        next?.props?.pageProps?.searchResult?.ads ??
        [];

      if (Array.isArray(listings) && listings.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return listings.map((l: any) => {
          const price = l.price ?? l.pris ?? 0;
          const year = l.year ?? l.aargang;
          const km = l.mileage ?? l.kilometerstand;
          const title = l.heading ?? l.title ?? l.name ?? 'Ukendt';
          const path = l.url ?? l.path ?? l.adUrl ?? '';
          const imgUrl = l.images?.[0]?.url ?? l.imageUrl ?? l.image ?? '';
          return {
            title,
            year: year ? parseInt(year) : undefined,
            km: km ? parseInt(String(km).replace(/\D/g, '')) : undefined,
            price,
            priceFormatted: formatPrice(price),
            location: l.zipCode ? `${l.zipCode} ${l.city ?? ''}`.trim() : l.location,
            imageUrl: typeof imgUrl === 'string' && imgUrl.startsWith('http') ? imgUrl : undefined,
            url: path.startsWith('http') ? path : `https://www.dba.dk${path}`,
            source: 'DBA.dk',
            sourceId: 'dba',
          };
        }).filter((c: Car) => c.price > 0);
      }
    }

    // ── Strategy 2: cheerio CSS fallback ────────────────────────────────────
    const $ = cheerio.load(html);
    const cars: Car[] = [];

    const selectors = [
      'li.dbaListing',
      '[class*="listing-item"]',
      '[class*="ListingItem"]',
      'article[class*="ad"]',
      '[data-ad-id]',
    ];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const $el = $(el);
        const title = $el.find('h3, h2, .listingLink, a[class*="title"], [class*="heading"]').first().text().trim();
        if (!title || title.length < 4) return;
        const priceText = $el.find('[class*="price"], [class*="Price"]').first().text();
        const price = parsePrice(priceText);
        if (!price || price < 5000) return;
        const href = $el.find('a').first().attr('href') ?? '';
        const carUrl = href.startsWith('http') ? href : `https://www.dba.dk${href}`;
        const imgUrl = $el.find('img').first().attr('src') ?? $el.find('img').first().attr('data-src') ?? '';
        const body = $el.text();
        const yearMatch = body.match(/\b(19[89]\d|20[012]\d)\b/);
        const kmMatch = body.match(/(\d[\d.,]*)\s*km/i);
        const locationMatch = body.match(/\d{4}\s+[A-ZÆØÅa-zæøå][a-zæøå]{2,}/);
        cars.push({
          title,
          year: yearMatch ? parseInt(yearMatch[1]) : undefined,
          km: kmMatch ? parseInt(kmMatch[1].replace(/[.,]/g, '')) : undefined,
          price,
          priceFormatted: formatPrice(price),
          location: locationMatch?.[0]?.trim(),
          imageUrl: imgUrl.startsWith('http') ? imgUrl : undefined,
          url: carUrl || searchUrl,
          source: 'DBA.dk',
          sourceId: 'dba',
        });
      });
      if (cars.length > 0) break;
    }

    return cars.slice(0, 40);
  } catch {
    return [];
  }
}

// ─── Client-side filter — always apply regardless of what the site returned ───
function applyFilters(cars: Car[], make: string, maxPrice: number, minYear: number, maxKm: number): Car[] {
  return cars.filter(car => {
    if (car.price > maxPrice) return false;
    if (car.year != null && car.year < minYear) return false;
    if (maxKm && car.km != null && car.km > maxKm) return false;
    if (make) {
      const makeNorm = make.toLowerCase().replace(/-/g, ' ');
      const titleNorm = car.title.toLowerCase();
      if (!titleNorm.includes(makeNorm) && !titleNorm.includes(make.toLowerCase())) return false;
    }
    return true;
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get('make') ?? '';
  const maxPrice = parseInt(searchParams.get('maxPrice') ?? '300000');
  const minYear = parseInt(searchParams.get('minYear') ?? '2015');
  const maxKm = parseInt(searchParams.get('maxKm') ?? '0');

  // Build direct search URLs
  const bilbasenParams = new URLSearchParams({ PriceFrom: '0', PriceTo: String(maxPrice), YearFrom: String(minYear) });
  if (make) bilbasenParams.set('Make', make);
  if (maxKm) bilbasenParams.set('MileageTo', String(maxKm));
  const bilbasenUrl = `https://www.bilbasen.dk/brugt/bil?${bilbasenParams}`;

  const makePart = make ? `/maerke-${make.toLowerCase()}` : '';
  const dbaParams = new URLSearchParams({ pris_til: String(maxPrice), aargang_fra: String(minYear) });
  if (maxKm) dbaParams.set('km_til', String(maxKm));
  const dbaUrl = `https://www.dba.dk/biler/biler${makePart}/?${dbaParams}`;

  const bilhandelUrl = `https://www.bilhandel.dk/brugte-biler?${[
    make ? `make=${make}` : '',
    `priceMax=${maxPrice}`,
    `yearMin=${minYear}`,
    maxKm ? `mileageMax=${maxKm}` : '',
  ].filter(Boolean).join('&')}`;

  const [bilbasenResult, dbaResult] = await Promise.allSettled([
    scrapeBilBasen(make, maxPrice, minYear, maxKm),
    scrapeDBA(make, maxPrice, minYear, maxKm),
  ]);

  const rawBilbasen = bilbasenResult.status === 'fulfilled' ? bilbasenResult.value : [];
  const rawDBA = dbaResult.status === 'fulfilled' ? dbaResult.value : [];

  // Always apply our own filters to catch anything the site didn't filter
  const bilbasenCars = applyFilters(rawBilbasen, make, maxPrice, minYear, maxKm);
  const dbaCars = applyFilters(rawDBA, make, maxPrice, minYear, maxKm);

  const allResults = [...bilbasenCars, ...dbaCars].sort((a, b) => a.price - b.price);

  return NextResponse.json({
    total: allResults.length,
    results: allResults,
    bySource: [
      { sourceId: 'bilbasen', name: 'BilBasen.dk', count: bilbasenCars.length, url: bilbasenUrl },
      { sourceId: 'dba',      name: 'DBA.dk',      count: dbaCars.length,      url: dbaUrl },
      { sourceId: 'bilhandel', name: 'Bilhandel.dk', count: 0,                 url: bilhandelUrl },
    ],
  } satisfies CarResponse);
}
