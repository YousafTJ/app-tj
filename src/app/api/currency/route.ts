import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = (req.nextUrl.searchParams.get("base") ?? "DKK").toUpperCase();

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    const data = await res.json();

    if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });

    return NextResponse.json(
      { base: data.base, date: data.date, rates: data.rates },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (err) {
    console.error("Currency API error:", err);
    return NextResponse.json({ error: "Kunne ikke hente valutakurser" }, { status: 500 });
  }
}
