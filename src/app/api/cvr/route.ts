import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const vat    = req.nextUrl.searchParams.get("vat");

  if (!search && !vat) return NextResponse.json({ error: "Mangler søgeord eller CVR-nummer" }, { status: 400 });

  const query = vat
    ? `vat=${encodeURIComponent(vat)}`
    : `search=${encodeURIComponent(search!)}`;

  try {
    const res = await fetch(
      `https://cvrapi.dk/api?${query}&country=dk`,
      {
        headers: {
          "User-Agent": "TJHUBApp/1.0 - private development use",
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (res.status === 404) return NextResponse.json({ error: "Virksomhed ikke fundet" }, { status: 404 });
    if (res.status === 429) return NextResponse.json({ error: "For mange forespørgsler — prøv igen om lidt" }, { status: 429 });
    if (!res.ok) return NextResponse.json({ error: `Opslag fejlede (${res.status})` }, { status: res.status });

    const data = await res.json();
    const results = Array.isArray(data) ? data : [data];
    return NextResponse.json({ results });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Opslag fejlede" }, { status: 500 });
  }
}
