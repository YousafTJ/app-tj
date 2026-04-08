import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
  const years  = Math.min(parseInt(req.nextUrl.searchParams.get("years") ?? "10"), 30);

  if (!symbol) return NextResponse.json({ error: "Mangler symbol" }, { status: 400 });

  const range    = years <= 2 ? "2y" : years <= 5 ? "5y" : years <= 10 ? "10y" : "max";
  const interval = years <= 2 ? "1wk" : "1mo";

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }
    );
    const data   = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return NextResponse.json({ error: "Ikke fundet" }, { status: 404 });

    const timestamps: number[] = result.timestamp ?? [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];

    const history = timestamps
      .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 7), price: closes[i] }))
      .filter((d): d is { date: string; price: number } => d.price != null && d.price > 0);

    return NextResponse.json(
      { symbol, history },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (err) {
    console.error("History API error:", err);
    return NextResponse.json({ error: "Fejl ved hentning af historisk data" }, { status: 500 });
  }
}
