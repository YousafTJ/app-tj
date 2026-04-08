import { NextResponse } from "next/server";
import axios from "axios";

export interface NewsItem {
  title: string;
  url: string;
  summary?: string;
  publishedAt: string;
  source: string;
  sourceId: string;
  category: "cybersecurity" | "ai";
}

export interface NewsResponse {
  cybersecurity: NewsItem[];
  ai: NewsItem[];
  lastUpdated: string;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
};

const REDDIT_HEADERS = {
  "User-Agent": "intellihub-aggregator/1.0 (personal news reader)",
  Accept: "application/rss+xml, application/xml, */*",
};

function parseXmlDate(d: string): string {
  try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim().slice(0, 300);
}

function extractItems(xml: string) {
  const items: { title: string; link: string; description: string; pubDate: string }[] = [];
  const re = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1] || m[2];
    const get = (tag: string) => {
      const r = b.match(new RegExp(`<${tag}(?:[^>]*)>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "si"));
      return r ? r[1].trim() : "";
    };
    const linkEl = b.match(/<link>([^<\s]+)<\/link>|<link[^>]+href="([^"]+)"/i);
    const link = linkEl ? (linkEl[1] || linkEl[2] || "").trim() : "";
    items.push({
      title: get("title"),
      link,
      description: get("description") || get("summary") || get("content:encoded") || get("content"),
      pubDate: get("pubDate") || get("dc:date") || get("published") || get("updated"),
    });
  }
  return items.slice(0, 10);
}

async function fetchRss(
  url: string,
  sourceId: string,
  sourceName: string,
  category: "cybersecurity" | "ai",
  headers = HEADERS
): Promise<NewsItem[]> {
  try {
    const res = await axios.get(url, { headers, timeout: 9000 });
    return extractItems(res.data)
      .filter(i => i.title && i.link)
      .map(i => ({
        title: stripHtml(i.title),
        url: i.link,
        summary: i.description ? stripHtml(i.description) : undefined,
        publishedAt: i.pubDate ? parseXmlDate(i.pubDate) : new Date().toISOString(),
        source: sourceName,
        sourceId,
        category,
      }));
  } catch {
    return [];
  }
}

// Hacker News Algolia Search API — targeted searches for AI tools & LLMs
async function fetchHNAlgolia(query: string): Promise<NewsItem[]> {
  try {
    const res = await axios.get("https://hn.algolia.com/api/v1/search", {
      params: { query, tags: "story", hitsPerPage: 12, numericFilters: "points>10" },
      timeout: 8000,
    });
    return (res.data?.hits ?? []).slice(0, 8).map((h: Record<string, unknown>) => ({
      title: (h.title as string) || "",
      url: (h.url as string) || `https://news.ycombinator.com/item?id=${h.objectID}`,
      summary: `${h.points || 0} point · ${h.num_comments || 0} kommentarer`,
      publishedAt: h.created_at as string || new Date().toISOString(),
      source: "Hacker News",
      sourceId: "hackernews",
      category: "ai" as const,
    }));
  } catch {
    return [];
  }
}

// Product Hunt — uses their public RSS feed (top products today)
// Filters for AI-related entries
async function fetchProductHuntAI(): Promise<NewsItem[]> {
  try {
    const res = await axios.get("https://www.producthunt.com/feed", {
      headers: HEADERS, timeout: 9000,
    });
    const items = extractItems(res.data);
    const aiKeywords = [
      "ai", "gpt", "llm", "automation", "agent", "copilot", "model",
      "generator", "assistant", "chatbot", "workflow", "claude", "openai",
    ];
    return items
      .filter(i => {
        const t = (i.title + " " + i.description).toLowerCase();
        return aiKeywords.some(k => t.includes(k));
      })
      .filter(i => i.title && i.link)
      .slice(0, 8)
      .map(i => ({
        title: stripHtml(i.title),
        url: i.link,
        summary: i.description ? stripHtml(i.description) : undefined,
        publishedAt: i.pubDate ? parseXmlDate(i.pubDate) : new Date().toISOString(),
        source: "Product Hunt",
        sourceId: "producthunt",
        category: "ai" as const,
      }));
  } catch {
    return [];
  }
}

export async function GET() {
  // ── CYBER SECURITY: 8 market/industry sources ─────────────────────────────
  const cyberFeeds: [string, string, string][] = [
    ["https://www.darkreading.com/rss.xml",              "darkreading",  "Dark Reading"],
    ["https://feeds.feedburner.com/Securityweek",        "securityweek", "SecurityWeek"],
    ["https://www.scmagazine.com/feed/",                 "scmagazine",   "SC Magazine"],
    ["https://www.helpnetsecurity.com/feed/",            "helpnetsec",   "Help Net Security"],
    ["https://www.infosecurity-magazine.com/rss/news/",  "infosecmag",   "Infosecurity Magazine"],
    ["https://therecord.media/feed",                     "therecord",    "The Record"],
    ["https://krebsonsecurity.com/feed/",                "krebs",        "Krebs on Security"],
    ["https://www.csoonline.com/feed/",                  "csoonline",    "CSO Online"],
  ];

  // ── AI TOOLS: 8 sources — targeted at new tools, LLMs, products ──────────
  // Strategy: Algolia HN search (targeted queries) + newsletters + Reddit communities
  const aiRedditFeeds: [string, string, string][] = [
    ["https://www.reddit.com/r/AItools/top.rss?t=day&limit=10",     "reddit_aitools",    "r/AItools"],
    ["https://www.reddit.com/r/LocalLLaMA/top.rss?t=day&limit=10",  "reddit_llama",      "r/LocalLLaMA"],
    ["https://www.reddit.com/r/ChatGPT/top.rss?t=day&limit=10",     "reddit_chatgpt",    "r/ChatGPT"],
  ];

  const aiNewsletterFeeds: [string, string, string][] = [
    ["https://bensbites.beehiiv.com/feed",     "bensbites",  "Ben's Bites"],
    ["https://www.therundown.ai/feed",         "therundown", "The Rundown AI"],
  ];

  const [
    cyberResults,
    hnTools,
    hnLlms,
    phAI,
    redditResults,
    newsletterResults,
  ] = await Promise.all([
    Promise.allSettled(cyberFeeds.map(([u, id, n]) => fetchRss(u, id, n, "cybersecurity"))),
    fetchHNAlgolia("AI tool new launch"),
    fetchHNAlgolia("LLM new model release"),
    fetchProductHuntAI(),
    Promise.allSettled(aiRedditFeeds.map(([u, id, n]) => fetchRss(u, id, n, "ai", REDDIT_HEADERS))),
    Promise.allSettled(aiNewsletterFeeds.map(([u, id, n]) => fetchRss(u, id, n, "ai"))),
  ]);

  const resolve = <T>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === "fulfilled" ? r.value : [];

  function limitPerSource(items: NewsItem[], max: number): NewsItem[] {
    const counts: Record<string, number> = {};
    return items.filter(item => {
      counts[item.sourceId] = (counts[item.sourceId] || 0) + 1;
      return counts[item.sourceId] <= max;
    });
  }

  // Deduplicate by URL
  function dedupe(items: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return items.filter(i => {
      if (seen.has(i.url)) return false;
      seen.add(i.url);
      return true;
    });
  }

  const cyberRaw = cyberResults
    .flatMap(r => resolve(r))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const cybersecurity = limitPerSource(cyberRaw, 2).slice(0, 16);

  const aiRaw = dedupe([
    ...hnTools,
    ...hnLlms,
    ...phAI,
    ...redditResults.flatMap(r => resolve(r)),
    ...newsletterResults.flatMap(r => resolve(r)),
  ]).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const ai = limitPerSource(aiRaw, 3).slice(0, 22);

  return NextResponse.json(
    { cybersecurity, ai, lastUpdated: new Date().toISOString() } satisfies NewsResponse,
    { headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=1200" } }
  );
}
