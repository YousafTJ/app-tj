import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ suggestions: [] });

  try {
    const res = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "TJHUBApp/1.0" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return NextResponse.json({ suggestions: [] });
    const data = await res.json();
    return NextResponse.json({ suggestions: Array.isArray(data) ? data : [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
