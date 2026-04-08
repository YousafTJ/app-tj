import { NextRequest, NextResponse } from "next/server";

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase() ?? "";
  const action = req.nextUrl.searchParams.get("action") ?? "quote";
  const q      = req.nextUrl.searchParams.get("q") ?? "";

  try {
    // ── Search / autocomplete ──────────────────────────────────────────────
    if (action === "search") {
      if (!q) return NextResponse.json({ results: [] });
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`,
        { headers: YF_HEADERS }
      );
      const data = await res.json();
      const results = (data?.quotes ?? [])
        .filter((x: { quoteType: string }) => ["EQUITY", "ETF", "INDEX", "MUTUALFUND"].includes(x.quoteType))
        .slice(0, 8)
        .map((x: { symbol: string; shortname?: string; longname?: string; exchange?: string; quoteType: string }) => ({
          symbol:   x.symbol,
          name:     x.shortname || x.longname || x.symbol,
          exchange: x.exchange ?? "",
          type:     x.quoteType,
        }));
      return NextResponse.json({ results });
    }

    // ── Current quote ──────────────────────────────────────────────────────
    if (action === "quote") {
      if (!symbol) return NextResponse.json({ error: "Mangler symbol" }, { status: 400 });

      const [chartRes, summaryRes] = await Promise.all([
        fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`, { headers: YF_HEADERS }),
        fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,price,defaultKeyStatistics`, { headers: YF_HEADERS }),
      ]);

      const chart   = await chartRes.json();
      const summary = await summaryRes.json();

      const meta  = chart?.chart?.result?.[0]?.meta;
      if (!meta) return NextResponse.json({ error: "Aktie ikke fundet" }, { status: 404 });

      const price    = summary?.quoteSummary?.result?.[0]?.price ?? {};
      const detail   = summary?.quoteSummary?.result?.[0]?.summaryDetail ?? {};
      const keyStats = summary?.quoteSummary?.result?.[0]?.defaultKeyStatistics ?? {};

      const currentPrice  = meta.regularMarketPrice ?? 0;
      const previousClose = meta.chartPreviousClose ?? currentPrice;
      const closes = (chart?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? []).filter((v: number | null) => v != null);

      return NextResponse.json({
        symbol:       meta.symbol,
        name:         price?.longName || price?.shortName || meta.symbol,
        currency:     meta.currency ?? "USD",
        exchange:     meta.exchangeName ?? "",
        currentPrice,
        previousClose,
        change:        currentPrice - previousClose,
        changePercent: previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
        volume:        meta.regularMarketVolume ?? 0,
        marketCap:     price?.marketCap?.raw,
        pe:            detail?.trailingPE?.raw,
        eps:           keyStats?.trailingEps?.raw,
        week52High:    detail?.fiftyTwoWeekHigh?.raw,
        week52Low:     detail?.fiftyTwoWeekLow?.raw,
        dividendYield: detail?.dividendYield?.raw,
        closes,
      }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" } });
    }

    // ── News ───────────────────────────────────────────────────────────────
    if (action === "news") {
      if (!symbol) return NextResponse.json({ news: [] });
      const res = await fetch(
        `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`,
        { headers: { ...YF_HEADERS, Accept: "application/rss+xml, */*" } }
      );
      const xml = await res.text();
      const items: { title: string; link: string; pubDate: string }[] = [];
      const re = /<item>([\s\S]*?)<\/item>/g;
      let m;
      while ((m = re.exec(xml)) !== null && items.length < 8) {
        const b   = m[1];
        const get = (tag: string) => {
          const r = b.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "si"));
          return r ? r[1].trim() : "";
        };
        const title = get("title");
        const link  = get("link") || get("guid");
        if (title && link) items.push({ title, link, pubDate: get("pubDate") });
      }
      return NextResponse.json({ news: items }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
    }

    return NextResponse.json({ error: "Ukendt action" }, { status: 400 });
  } catch (err) {
    console.error("Stock API error:", err);
    return NextResponse.json({ error: "Fejl ved hentning af data" }, { status: 500 });
  }
}
