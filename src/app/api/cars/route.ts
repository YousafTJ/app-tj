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
  'Cache-Control': 'no-cache',
};

function formatPrice(price: number): string {
  return price.toLocaleString('da-DK') + ' kr.';
}

function parsePrice(str: string): number {
  const digits = str.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

async function scrapeBilBasen(
  make: string, maxPrice: string, minYear: string, maxKm: string
): Promise<Car[]> {
  const params = new URLSearchParams({ PriceFrom: '0' });
  if (make) params.set('Make', make);
  if (maxPrice) params.set('PriceTo', maxPrice);
  if (minYear) params.set('YearFrom', minYear);
  if (maxKm) params.set('MileageTo', maxKm);

  const searchUrl = `https://www.bilbasen.dk/brugt/bil?${params}`;

  try {
    const { data } = await axios.get(searchUrl, { headers: HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);
    const cars: Car[] = [];

    // BilBasen listing selectors
    $('article, .listing, [class*="ListingCard"], [class*="listingCard"]').each((_, el) => {
      const $el = $(el);

      const titleEl = $el
        .find('h2, h3, [class*="headline"], [class*="Headline"], [class*="title"], [class*="Title"]')
        .first();
      const title = titleEl.text().trim();
      if (!title || title.length < 4) return;

      const priceEl = $el
        .find('[class*="price"], [class*="Price"], [class*="pris"]')
        .first();
      const price = parsePrice(priceEl.text());
      if (!price || price < 5000) return;

      const linkEl = $el.find('a[href*="/brugt/bil/"]').first();
      const href = linkEl.attr('href') ?? '';
      const carUrl = href.startsWith('http') ? href : `https://www.bilbasen.dk${href}`;

      const imgEl = $el.find('img').first();
      const imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';

      const bodyText = $el.text();
      const yearMatch = bodyText.match(/\b(19[89]\d|20[012]\d)\b/);
      const kmMatch = bodyText.match(/(\d[\d.,]*)\s*km/i);

      cars.push({
        title,
        year: yearMatch ? parseInt(yearMatch[1]) : undefined,
        km: kmMatch ? parseInt(kmMatch[1].replace(/[.,]/g, '')) : undefined,
        price,
        priceFormatted: formatPrice(price),
        imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
        url: carUrl || searchUrl,
        source: 'BilBasen.dk',
        sourceId: 'bilbasen',
      });
    });

    return cars.slice(0, 40);
  } catch {
    return [];
  }
}

async function scrapeDBA(
  make: string, maxPrice: string, minYear: string
): Promise<Car[]> {
  const makePart = make ? `/maerke-${make.toLowerCase()}` : '';
  const params = new URLSearchParams();
  if (maxPrice) params.set('pris_til', maxPrice);
  if (minYear) params.set('aargang_fra', minYear);

  const searchUrl = `https://www.dba.dk/biler/biler${makePart}/?${params}`;

  try {
    const { data } = await axios.get(searchUrl, { headers: HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);
    const cars: Car[] = [];

    $('li.dbaListing, [class*="listing-item"], article').each((_, el) => {
      const $el = $(el);

      const titleEl = $el.find('h3, h2, .listingLink, a[class*="title"]').first();
      const title = titleEl.text().trim();
      if (!title || title.length < 4) return;

      const priceText = $el.find('[class*="price"], [class*="Price"]').first().text();
      const price = parsePrice(priceText);
      if (!price || price < 5000) return;

      const linkEl = $el.find('a').first();
      const href = linkEl.attr('href') ?? '';
      const carUrl = href.startsWith('http') ? href : `https://www.dba.dk${href}`;

      const imgEl = $el.find('img').first();
      const imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';

      const bodyText = $el.text();
      const yearMatch = bodyText.match(/\b(19[89]\d|20[012]\d)\b/);
      const kmMatch = bodyText.match(/(\d[\d.,]*)\s*km/i);
      const locationMatch = bodyText.match(/\d{4}\s+[A-ZÆØÅa-zæøå][a-zæøå]{2,}/);

      cars.push({
        title,
        year: yearMatch ? parseInt(yearMatch[1]) : undefined,
        km: kmMatch ? parseInt(kmMatch[1].replace(/[.,]/g, '')) : undefined,
        price,
        priceFormatted: formatPrice(price),
        location: locationMatch?.[0]?.trim(),
        imageUrl: imageUrl.startsWith('http') ? imageUrl : undefined,
        url: carUrl || searchUrl,
        source: 'DBA.dk',
        sourceId: 'dba',
      });
    });

    return cars.slice(0, 40);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get('make') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '300000';
  const minYear = searchParams.get('minYear') ?? '2015';
  const maxKm = searchParams.get('maxKm') ?? '';

  // Build direct search URLs for fallback links
  const bilbasenParams = new URLSearchParams({ PriceFrom: '0', PriceTo: maxPrice, YearFrom: minYear });
  if (make) bilbasenParams.set('Make', make);
  if (maxKm) bilbasenParams.set('MileageTo', maxKm);
  const bilbasenUrl = `https://www.bilbasen.dk/brugt/bil?${bilbasenParams}`;

  const makePart = make ? `/maerke-${make.toLowerCase()}` : '';
  const dbaParams = new URLSearchParams({ pris_til: maxPrice, aargang_fra: minYear });
  const dbaUrl = `https://www.dba.dk/biler/biler${makePart}/?${dbaParams}`;

  const bilhandelParts = [`priceMax=${maxPrice}`, `yearMin=${minYear}`];
  if (make) bilhandelParts.unshift(`make=${make}`);
  const bilhandelUrl = `https://www.bilhandel.dk/brugte-biler?${bilhandelParts.join('&')}`;

  const [bilbasenResult, dbaResult] = await Promise.allSettled([
    scrapeBilBasen(make, maxPrice, minYear, maxKm),
    scrapeDBA(make, maxPrice, minYear),
  ]);

  const bilbasenCars = bilbasenResult.status === 'fulfilled' ? bilbasenResult.value : [];
  const dbaCars = dbaResult.status === 'fulfilled' ? dbaResult.value : [];

  const allResults = [...bilbasenCars, ...dbaCars].sort((a, b) => a.price - b.price);

  const response: CarResponse = {
    total: allResults.length,
    results: allResults,
    bySource: [
      { sourceId: 'bilbasen', name: 'BilBasen.dk', count: bilbasenCars.length, url: bilbasenUrl },
      { sourceId: 'dba', name: 'DBA.dk', count: dbaCars.length, url: dbaUrl },
      { sourceId: 'bilhandel', name: 'Bilhandel.dk', count: 0, url: bilhandelUrl },
    ],
  };

  return NextResponse.json(response);
}
