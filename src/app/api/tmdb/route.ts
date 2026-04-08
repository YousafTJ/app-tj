import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.themoviedb.org/3";
const KEY  = process.env.TMDB_API_KEY ?? "";

function build(path: string, params: Record<string, string>) {
  const sp = new URLSearchParams({ api_key: KEY, language: "da-DK", ...params });
  return `${BASE}${path}?${sp}`;
}

export async function GET(req: NextRequest) {
  if (!KEY) return NextResponse.json({ error: "TMDB_API_KEY er ikke sat i .env.local" }, { status: 503 });

  const p      = req.nextUrl.searchParams;
  const action = p.get("action") ?? "";

  try {
    let url: string;

    if (action === "trending") {
      url = build("/trending/all/week", { region: "DK" });

    } else if (action === "discover") {
      const type  = p.get("type") === "tv" ? "tv" : "movie";
      const extra: Record<string, string> = {
        with_watch_providers: "8",   // Netflix provider ID
        watch_region: "DK",
        sort_by: p.get("sort") ?? "popularity.desc",
        page: p.get("page") ?? "1",
      };
      if (p.get("genre"))           extra.with_genres        = p.get("genre")!;
      if (p.get("vote_count_gte"))  extra["vote_count.gte"]  = p.get("vote_count_gte")!;
      url = build(`/discover/${type}`, extra);

    } else if (action === "search") {
      url = build("/search/multi", {
        query: p.get("q") ?? "",
        page: p.get("page") ?? "1",
        include_adult: "false",
        region: "DK",
      });

    } else if (action === "detail") {
      const id   = p.get("id");
      const type = p.get("type") === "tv" ? "tv" : "movie";
      if (!id) return NextResponse.json({ error: "Mangler id" }, { status: 400 });
      url = build(`/${type}/${id}`, {
        append_to_response: "credits,reviews,watch/providers",
      });

    } else if (action === "genres") {
      const type = p.get("type") === "tv" ? "tv" : "movie";
      url = build(`/genre/${type}/list`, {});

    } else {
      return NextResponse.json({ error: "Ukendt action" }, { status: 400 });
    }

    const res  = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("TMDb error:", err);
    return NextResponse.json({ error: "TMDb-fejl" }, { status: 500 });
  }
}
