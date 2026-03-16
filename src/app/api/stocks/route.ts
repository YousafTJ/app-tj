import axios from "axios";
import { NextResponse } from "next/server";

export type StockQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketCap?: number;
  volume?: number;
  avgVolume?: number;
  high52?: number;
  low52?: number;
  open?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  peRatio?: number;
  exchange: string;
  marketState: string;
};

export type StockNews = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  thumbnail?: string;
};

export type StockResponse = {
  quote: StockQuote;
  news: StockNews[];
  sparkline: number[];
};

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const API_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

// ─── Crumb cache (Yahoo Finance kræver crumb + cookie siden 2024) ─────────────
let crumbCache: { crumb: string; cookie: string; ts: number } | null = null;

async function getYahooCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (crumbCache && Date.now() - crumbCache.ts < 30 * 60 * 1000) {
    return crumbCache;
  }
  try {
    // Hent cookies fra Yahoo Finance
    const r1 = await axios.get("https://finance.yahoo.com/", {
      headers: BROWSER_HEADERS,
      timeout: 10000,
      maxRedirects: 5,
    });
    const raw: string[] = Array.isArray(r1.headers["set-cookie"])
      ? r1.headers["set-cookie"]
      : [];
    const cookie = raw.map(c => c.split(";")[0]).join("; ");

    // Hent crumb
    const r2 = await axios.get("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { ...API_HEADERS, Cookie: cookie },
      timeout: 8000,
    });
    const crumb = String(r2.data);
    crumbCache = { crumb, cookie, ts: Date.now() };
    return crumbCache;
  } catch {
    return null;
  }
}

// ─── Symbol lookup ────────────────────────────────────────────────────────────
async function findSymbol(q: string): Promise<string> {
  if (/^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(q.trim())) return q.trim().toUpperCase();
  try {
    const auth = await getYahooCrumb();
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=5&newsCount=0`,
      {
        headers: auth ? { ...API_HEADERS, Cookie: auth.cookie } : API_HEADERS,
        timeout: 8000,
      }
    );
    const quotes = data?.quotes ?? [];
    const equity = quotes.find((r: { quoteType?: string; symbol?: string }) =>
      r.quoteType === "EQUITY" && r.symbol
    ) ?? quotes[0];
    return equity?.symbol ?? q.toUpperCase();
  } catch {
    return q.toUpperCase();
  }
}

// ─── Quote via v7 (med crumb) ─────────────────────────────────────────────────
async function fetchQuoteV7(symbol: string, auth: { crumb: string; cookie: string }): Promise<StockQuote | null> {
  const fields = "regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow,regularMarketOpen,regularMarketPreviousClose,regularMarketDayHigh,regularMarketDayLow,trailingPE,fullExchangeName,marketState,longName,shortName,currency";
  const { data } = await axios.get(
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbol}&fields=${fields}&crumb=${encodeURIComponent(auth.crumb)}`,
    { headers: { ...API_HEADERS, Cookie: auth.cookie }, timeout: 8000 }
  );
  const r = data?.quoteResponse?.result?.[0];
  if (!r) return null;
  return {
    symbol: r.symbol,
    name: r.longName ?? r.shortName ?? r.symbol,
    price: r.regularMarketPrice ?? 0,
    change: r.regularMarketChange ?? 0,
    changePercent: r.regularMarketChangePercent ?? 0,
    currency: r.currency ?? "USD",
    marketCap: r.marketCap,
    volume: r.regularMarketVolume,
    avgVolume: r.averageDailyVolume3Month,
    high52: r.fiftyTwoWeekHigh,
    low52: r.fiftyTwoWeekLow,
    open: r.regularMarketOpen,
    previousClose: r.regularMarketPreviousClose,
    dayHigh: r.regularMarketDayHigh,
    dayLow: r.regularMarketDayLow,
    peRatio: r.trailingPE,
    exchange: r.fullExchangeName ?? "",
    marketState: r.marketState ?? "CLOSED",
  };
}

// ─── Quote via v8/chart (fallback — ingen crumb nødvendig) ───────────────────
async function fetchQuoteV8(symbol: string): Promise<StockQuote | null> {
  const { data } = await axios.get(
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
    { headers: API_HEADERS, timeout: 8000 }
  );
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta || !meta.regularMarketPrice) return null;
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? 0;
  const price = meta.regularMarketPrice ?? 0;
  const change = meta.regularMarketChange ?? (price - prev);
  const changePct = meta.regularMarketChangePercent ?? (prev ? ((price - prev) / prev) * 100 : 0);
  return {
    symbol: meta.symbol,
    name: meta.longName ?? meta.shortName ?? meta.symbol,
    price,
    change,
    changePercent: changePct,
    currency: meta.currency ?? "USD",
    volume: meta.regularMarketVolume,
    previousClose: prev,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
    open: meta.regularMarketOpen,
    high52: meta.fiftyTwoWeekHigh,
    low52: meta.fiftyTwoWeekLow,
    exchange: meta.fullExchangeName ?? meta.exchangeName ?? "",
    marketState: meta.marketState ?? "CLOSED",
  };
}

async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const auth = await getYahooCrumb();
    if (auth) return await fetchQuoteV7(symbol, auth);
  } catch {
    // fall through to v8
  }
  try {
    return await fetchQuoteV8(symbol);
  } catch {
    return null;
  }
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
async function fetchSparkline(symbol: string): Promise<number[]> {
  try {
    const auth = await getYahooCrumb();
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`,
      {
        headers: auth ? { ...API_HEADERS, Cookie: auth.cookie } : API_HEADERS,
        timeout: 8000,
      }
    );
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    return closes
      .filter((v: number | null) => v != null)
      .map((v: number) => Math.round(v * 100) / 100);
  } catch {
    return [];
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────
async function fetchNews(symbol: string): Promise<StockNews[]> {
  try {
    const auth = await getYahooCrumb();
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&quotesCount=0&newsCount=12`,
      {
        headers: auth ? { ...API_HEADERS, Cookie: auth.cookie } : API_HEADERS,
        timeout: 8000,
      }
    );
    const items = data?.news ?? [];
    return items.slice(0, 10).map((n: {
      title?: string; link?: string; providerPublishTime?: number;
      publisher?: string; summary?: string;
      thumbnail?: { resolutions?: { url?: string }[] };
    }) => ({
      title: n.title ?? "",
      url: n.link ?? "",
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : new Date().toISOString(),
      source: n.publisher ?? "Yahoo Finance",
      summary: n.summary,
      thumbnail: n.thumbnail?.resolutions?.[0]?.url,
    }));
  } catch {
    return [];
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ error: "Mangler søgeord" }, { status: 400 });

  const symbol = await findSymbol(q);
  const [quote, sparkline, news] = await Promise.all([
    fetchQuote(symbol),
    fetchSparkline(symbol),
    fetchNews(symbol),
  ]);

  if (!quote) {
    return NextResponse.json({ error: `Fandt ingen aktie for "${q}"` }, { status: 404 });
  }

  return NextResponse.json({ quote, sparkline, news } satisfies StockResponse);
}
