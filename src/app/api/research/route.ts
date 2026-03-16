import axios from "axios";
import { NextResponse } from "next/server";

export type RedditPost = {
  id: string;
  title: string;
  url: string;
  permalink: string;
  subreddit: string;
  score: number;
  numComments: number;
  selftext?: string;
  domain: string;
  created: string;
  flair?: string;
};

export type WikipediaResult = {
  title: string;
  extract: string;
  url: string;
  thumbnail?: string;
  language: "da" | "en";
};

export type AuthoritativeResult = {
  title: string;
  url: string;
  excerpt: string;
  source: string;
  icon?: string;
};

export type ResearchResponse = {
  query: string;
  reddit: RedditPost[];
  wikipedia: WikipediaResult | null;
  authoritative: AuthoritativeResult[];
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Reddit ───────────────────────────────────────────────────────────────────
async function fetchReddit(q: string): Promise<RedditPost[]> {
  try {
    const { data } = await axios.get(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=8&type=link`,
      {
        headers: {
          "User-Agent": "TJHUBResearch/1.0 (research aggregator)",
          "Accept": "application/json",
        },
        timeout: 8000,
      }
    );

    const posts = data?.data?.children ?? [];
    return posts
      .map((c: { data: Record<string, unknown> }) => {
        const p = c.data;
        return {
          id: p.id as string,
          title: p.title as string,
          url: (p.url as string) ?? `https://reddit.com${p.permalink}`,
          permalink: `https://reddit.com${p.permalink as string}`,
          subreddit: p.subreddit as string,
          score: (p.score as number) ?? 0,
          numComments: (p.num_comments as number) ?? 0,
          selftext: p.selftext ? (p.selftext as string).slice(0, 280) : undefined,
          domain: p.domain as string,
          created: new Date((p.created_utc as number) * 1000).toISOString(),
          flair: p.link_flair_text as string | undefined,
        };
      })
      .filter((p: RedditPost) => p.score > 0);
  } catch {
    return [];
  }
}

// ─── Wikipedia (dansk → engelsk fallback) ────────────────────────────────────
async function fetchWikipedia(q: string): Promise<WikipediaResult | null> {
  // Try Danish first
  for (const lang of ["da", "en"] as const) {
    try {
      // 1. Search for best matching title
      const searchRes = await axios.get(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=1&origin=*`,
        { headers: { "User-Agent": UA }, timeout: 6000 }
      );
      const title = searchRes.data?.query?.search?.[0]?.title;
      if (!title) continue;

      // 2. Fetch page summary via REST API
      const summaryRes = await axios.get(
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { headers: { "User-Agent": UA }, timeout: 6000 }
      );
      const s = summaryRes.data;
      if (!s?.extract) continue;

      return {
        title: s.title,
        extract: s.extract,
        url: s.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        thumbnail: s.thumbnail?.source,
        language: lang,
      };
    } catch {
      continue;
    }
  }
  return null;
}

// ─── DuckDuckGo Instant Answer → authoritative links ─────────────────────────
async function fetchDuckDuckGo(q: string): Promise<AuthoritativeResult[]> {
  try {
    const { data } = await axios.get(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
      { headers: { "User-Agent": UA }, timeout: 8000 }
    );

    const results: AuthoritativeResult[] = [];

    // Abstract (Wikipedia / Britannica etc.)
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading ?? q,
        url: data.AbstractURL,
        excerpt: data.Abstract.slice(0, 400),
        source: data.AbstractSource ?? "Wikipedia",
        icon: data.Image ? `https://duckduckgo.com${data.Image}` : undefined,
      });
    }

    // Direct "Results" (official pages, gov sites etc.)
    type DDGItem = { FirstURL?: string; Text?: string; Icon?: { URL?: string } };
    const directResults: DDGItem[] = data.Results ?? [];
    for (const r of directResults.slice(0, 4)) {
      if (!r.FirstURL || !r.Text) continue;
      const domain = new URL(r.FirstURL).hostname.replace(/^www\./, "");
      results.push({
        title: r.Text.split(" - ")[0]?.trim() ?? domain,
        url: r.FirstURL,
        excerpt: r.Text.slice(0, 300),
        source: domain,
      });
    }

    // Related topics (encyclopedia-style sub-entries)
    type DDGTopic = { FirstURL?: string; Text?: string; Topics?: DDGTopic[] };
    const topics: DDGTopic[] = data.RelatedTopics ?? [];
    const flatTopics: DDGTopic[] = [];
    for (const t of topics) {
      if (t.Topics) flatTopics.push(...t.Topics);
      else flatTopics.push(t);
    }
    for (const t of flatTopics.slice(0, 5)) {
      if (!t.FirstURL || !t.Text) continue;
      const domain = new URL(t.FirstURL).hostname.replace(/^www\./, "");
      results.push({
        title: t.Text.split(" - ")[0]?.trim().slice(0, 80) ?? domain,
        url: t.FirstURL,
        excerpt: t.Text.slice(0, 240),
        source: domain,
      });
    }

    return results.slice(0, 8);
  } catch {
    return [];
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ error: "Mangler søgeord" }, { status: 400 });

  const [reddit, wikipedia, authoritative] = await Promise.all([
    fetchReddit(q),
    fetchWikipedia(q),
    fetchDuckDuckGo(q),
  ]);

  return NextResponse.json({
    query: q,
    reddit,
    wikipedia,
    authoritative,
  } satisfies ResearchResponse);
}
