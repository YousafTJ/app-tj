"use client";

import { useState, useRef } from "react";
import { ExternalLink, MessageSquare, ArrowUp, BookOpen, Globe, Search } from "lucide-react";
import type { ResearchResponse, RedditPost, WikipediaResult, AuthoritativeResult } from "@/app/api/research/route";

const SUGGESTIONS = [
  "quantum computing", "klimaforandringer", "ChatGPT", "CRISPR",
  "nordlys Danmark", "sort hul", "inflation 2025", "Ukrainekrigen",
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);
  if (y > 0) return `${y}å siden`;
  if (mo > 0) return `${mo}mo siden`;
  if (d > 0) return `${d}d siden`;
  return "i dag";
}

function fmtScore(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function sourceBadgeColor(source: string): { color: string; bg: string } {
  const s = source.toLowerCase();
  if (s.includes("wikipedia")) return { color: "#2dd4bf", bg: "rgba(45,212,191,0.1)" };
  if (s.includes("britannica")) return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" };
  if (s.includes("gov") || s.includes("who") || s.includes("nhs") || s.includes("un.org"))
    return { color: "#4ade80", bg: "rgba(74,222,128,0.1)" };
  if (s.includes("edu")) return { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" };
  if (s.includes("bbc") || s.includes("reuters") || s.includes("apnews"))
    return { color: "#38bdf8", bg: "rgba(56,189,248,0.1)" };
  return { color: "#78716c", bg: "rgba(255,255,255,0.06)" };
}

// ─── Reddit card ─────────────────────────────────────────────────────────────
function RedditCard({ p, i }: { p: RedditPost; i: number }) {
  const isExternal = !p.url.includes("reddit.com");
  return (
    <div className="uv-card-1" style={{ display: "block" }}>
      <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Rank */}
          <span style={{ fontSize: 11, color: "#44403c", minWidth: 18, paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Subreddit + time */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
              <a
                href={`https://reddit.com/r/${p.subreddit}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, fontWeight: 600, color: "#f97316",
                  background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 99,
                  textDecoration: "none" }}
              >
                r/{p.subreddit}
              </a>
              {p.flair && (
                <span style={{ fontSize: 10, color: "#78716c", background: "rgba(255,255,255,0.06)",
                  padding: "2px 7px", borderRadius: 99 }}>
                  {p.flair}
                </span>
              )}
              <span style={{ fontSize: 11, color: "#44403c", marginLeft: "auto" }}>{timeAgo(p.created)}</span>
            </div>

            {/* Title */}
            <a href={p.permalink} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f4f1ee", lineHeight: 1.45,
                marginBottom: p.selftext ? 6 : 10 }}>
                {p.title}
              </p>
            </a>

            {/* Selftext excerpt */}
            {p.selftext && (
              <p style={{ fontSize: 12, color: "#78716c", lineHeight: 1.5, marginBottom: 10,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {p.selftext}
              </p>
            )}

            {/* Footer: score + comments + external link */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12,
                color: "#f97316", fontWeight: 600 }}>
                <ArrowUp style={{ width: 13, height: 13 }} />
                {fmtScore(p.score)}
              </span>
              <a href={p.permalink} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12,
                  color: "#78716c", textDecoration: "none" }}>
                <MessageSquare style={{ width: 13, height: 13 }} />
                {p.numComments.toLocaleString("da-DK")} svar
              </a>
              {isExternal && (
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                    color: "#57534e", textDecoration: "none", marginLeft: "auto" }}>
                  <ExternalLink style={{ width: 11, height: 11 }} />
                  {p.domain}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wikipedia card ───────────────────────────────────────────────────────────
function WikiCard({ w }: { w: WikipediaResult }) {
  const [expanded, setExpanded] = useState(false);
  const short = w.extract.slice(0, 380);
  const hasMore = w.extract.length > 380;

  return (
    <div className="uv-card-1">
      <div className="uv-card-1-inner" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {w.thumbnail && (
            <img src={w.thumbnail} alt={w.title}
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BookOpen style={{ width: 14, height: 14, color: "#2dd4bf" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#2dd4bf",
                background: "rgba(45,212,191,0.1)", padding: "2px 8px", borderRadius: 99,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Wikipedia · {w.language === "da" ? "Dansk" : "Engelsk"}
              </span>
            </div>
            <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f4f1ee", marginBottom: 8,
                lineHeight: 1.3 }}>
                {w.title}
              </h3>
            </a>
            <p style={{ fontSize: 13, color: "#a8a29e", lineHeight: 1.65, marginBottom: hasMore ? 8 : 0 }}>
              {expanded ? w.extract : short}{!expanded && hasMore ? "…" : ""}
            </p>
            {hasMore && (
              <button onClick={() => setExpanded(!expanded)}
                style={{ fontSize: 12, color: "#5B42F3", background: "none", border: "none",
                  cursor: "pointer", padding: 0, fontWeight: 600 }}>
                {expanded ? "Vis mindre" : "Læs mere"}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a href={w.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 600, color: "#78716c", textDecoration: "none",
              background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.08)" }}>
            <ExternalLink style={{ width: 12, height: 12 }} />
            Åbn på Wikipedia
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Authoritative source card ────────────────────────────────────────────────
function AuthCard({ a, i }: { a: AuthoritativeResult; i: number }) {
  const { color, bg } = sourceBadgeColor(a.source);
  return (
    <a href={a.url} target="_blank" rel="noopener noreferrer"
      className="uv-card-1" style={{ display: "block", textDecoration: "none" }}>
      <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#44403c", minWidth: 18, paddingTop: 2 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <Globe style={{ width: 11, height: 11, color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color, background: bg,
                padding: "2px 8px", borderRadius: 99, maxWidth: 200,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.source}
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#f4f1ee", lineHeight: 1.4,
              marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {a.title}
            </p>
            {a.excerpt && (
              <p style={{ fontSize: 12, color: "#78716c", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {a.excerpt}
              </p>
            )}
          </div>
          <ExternalLink style={{ width: 13, height: 13, color: "#44403c", flexShrink: 0, marginTop: 2 }} />
        </div>
      </div>
    </a>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────
export default function ResearchTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "reddit" | "sources" | "wiki">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q = query) {
    const t = q.trim();
    if (!t) return;
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("all");
    try {
      const res = await fetch(`/api/research?q=${encodeURIComponent(t)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fejl"); return; }
      setResult(data as ResearchResponse);
    } catch {
      setError("Søgning fejlede. Prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  const TABS: { id: typeof activeTab; label: string; count?: number }[] = [
    { id: "all",     label: "Alle" },
    { id: "wiki",    label: "Wikipedia", count: result?.wikipedia ? 1 : 0 },
    { id: "sources", label: "Kilder",    count: result?.authoritative.length },
    { id: "reddit",  label: "Reddit",    count: result?.reddit.length },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Research</h2>
      <p style={{ color: "var(--text-2)", marginBottom: 24 }}>
        Søg og få svar fra Reddit, Wikipedia og autoritære webkilder på én gang
      </p>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          ref={inputRef}
          className="uv-input"
          placeholder="Hvad vil du vide mere om?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{ flex: 1 }}
        />
        <button className="uv-btn" onClick={() => search()} disabled={loading}>
          <span className="uv-btn-text"><span>{loading ? "Søger…" : "Søg"}</span></span>
          <Search style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Suggestions */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => { setQuery(s); search(s); }}
            style={{ fontSize: 12, color: "#78716c", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "4px 12px",
              cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Loader */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="uv-loader-bounce" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)",
          borderRadius: 12, padding: "14px 20px", color: "#f43f5e", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: 13, fontWeight: 600, padding: "8px 16px",
                  background: "none", border: "none", cursor: "pointer",
                  color: activeTab === tab.id ? "#f4f1ee" : "#57534e",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#5B42F3" : "transparent"}`,
                  marginBottom: -1, transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span style={{ fontSize: 11, background: activeTab === tab.id ? "#5B42F3" : "rgba(255,255,255,0.08)",
                    color: activeTab === tab.id ? "white" : "#78716c",
                    padding: "1px 7px", borderRadius: 99 }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* "Alle" view: 3-column layout */}
          {activeTab === "all" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Left column: Wikipedia + Authoritative */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Wikipedia */}
                {result.wikipedia && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#2dd4bf",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Encyklopædi
                    </p>
                    <WikiCard w={result.wikipedia} />
                  </div>
                )}

                {/* Authoritative sources */}
                {result.authoritative.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Autoritære kilder
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.authoritative.map((a, i) => (
                        <AuthCard key={i} a={a} i={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Reddit */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#f97316",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Reddit — Fællesskabsdiskussioner
                </p>
                {result.reddit.length === 0 ? (
                  <div className="uv-card-1">
                    <div className="uv-card-1-inner" style={{ padding: 24, textAlign: "center", color: "#57534e" }}>
                      Ingen Reddit-resultater
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.reddit.map((p, i) => (
                      <RedditCard key={p.id} p={p} i={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Individual tabs */}
          {activeTab === "wiki" && (
            result.wikipedia
              ? <WikiCard w={result.wikipedia} />
              : <p style={{ color: "#57534e" }}>Ingen Wikipedia-artikel fundet</p>
          )}

          {activeTab === "sources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.authoritative.length === 0
                ? <p style={{ color: "#57534e" }}>Ingen autoritære kilder fundet</p>
                : result.authoritative.map((a, i) => <AuthCard key={i} a={a} i={i} />)
              }
            </div>
          )}

          {activeTab === "reddit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.reddit.length === 0
                ? <p style={{ color: "#57534e" }}>Ingen Reddit-resultater</p>
                : result.reddit.map((p, i) => <RedditCard key={p.id} p={p} i={i} />)
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}
