import axios from "axios";
import { NextResponse } from "next/server";

export type Mover = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  volume: number;
  marketCap?: number;
};

export type MarketMoversResponse = {
  gainers: Mover[];
  losers: Mover[];
  fetchedAt: string;
};

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
};

function mapQuote(r: Record<string, unknown>): Mover {
  return {
    symbol: r.symbol as string,
    name: (r.longName ?? r.shortName ?? r.symbol) as string,
    price: (r.regularMarketPrice as number) ?? 0,
    change: (r.regularMarketChange as number) ?? 0,
    changePercent: (r.regularMarketChangePercent as number) ?? 0,
    currency: (r.currency as string) ?? "USD",
    volume: (r.regularMarketVolume as number) ?? 0,
    marketCap: r.marketCap as number | undefined,
  };
}

async function fetchScreener(scrId: string): Promise<Mover[]> {
  try {
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=${scrId}&count=10&region=US&lang=en-US`,
      { headers: HEADERS, timeout: 10000 }
    );
    const quotes: Record<string, unknown>[] = data?.finance?.result?.[0]?.quotes ?? [];
    return quotes.map(mapQuote);
  } catch {
    return [];
  }
}

// Cache results for 5 minutes to avoid hammering Yahoo Finance
let cache: { data: MarketMoversResponse; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const [gainers, losers] = await Promise.all([
    fetchScreener("day_gainers"),
    fetchScreener("day_losers"),
  ]);

  const result: MarketMoversResponse = {
    gainers,
    losers,
    fetchedAt: new Date().toISOString(),
  };

  cache = { data: result, ts: Date.now() };
  return NextResponse.json(result);
}
