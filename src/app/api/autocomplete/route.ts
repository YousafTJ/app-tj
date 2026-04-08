import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json([], { status: 400 });

  try {
    const res = await fetch(
      `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await res.json();
    // data = ["query", ["suggestion1", "suggestion2", ...]]
    const suggestions: string[] = data[1] ?? [];
    return NextResponse.json(suggestions.slice(0, 8));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
