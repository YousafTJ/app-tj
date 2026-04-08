"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: "movie" | "tv" | "person";
}

interface CastMember {
  id: number; name: string; character: string; profile_path: string | null;
}

interface Review {
  id: string; author: string; content: string; created_at: string;
  author_details: { rating: number | null };
}

interface TmdbDetail extends TmdbItem {
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  genres?: { id: number; name: string }[];
  credits?: { cast: CastMember[] };
  reviews?: { results: Review[]; total_results: number };
  "watch/providers"?: {
    results?: { DK?: { flatrate?: { provider_id: number; provider_name: string; logo_path: string }[]; link?: string } };
  };
}

interface Genre { id: number; name: string; }
type MediaType = "movie" | "tv";

const IMG = "https://image.tmdb.org/t/p/";

async function tmdb(params: Record<string, string>) {
  const res = await fetch(`/api/tmdb?${new URLSearchParams(params)}`);
  return res.json();
}

function getType(item: TmdbItem): MediaType {
  if (item.media_type === "tv") return "tv";
  if (item.media_type === "movie") return "movie";
  return item.name != null ? "tv" : "movie";
}

// ── Rating badge ──────────────────────────────────────────────────────────────

function RatingBadge({ v, small }: { v: number; small?: boolean }) {
  const pct   = Math.round(v * 10);
  const color = pct >= 70 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  return (
    <span style={{
      fontSize: small ? 10 : 12, fontWeight: 800,
      padding: small ? "1px 6px" : "3px 8px", borderRadius: 6,
      background: color + "18", color, border: `1px solid ${color}30`,
    }}>★ {v.toFixed(1)}</span>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "#f3f4f6", border: "1.5px solid #e5e7eb" }}>
      <div style={{ aspectRatio: "2/3", background: "#e5e7eb" }} />
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ height: 12, borderRadius: 4, background: "#e5e7eb" }} />
        <div style={{ height: 10, borderRadius: 4, background: "#e5e7eb", width: "55%" }} />
      </div>
    </div>
  );
}

// ── Media card ────────────────────────────────────────────────────────────────

function MediaCard({ item, onClick }: { item: TmdbItem; onClick: () => void }) {
  const title  = item.title || item.name || "?";
  const year   = (item.release_date || item.first_air_date || "").slice(0, 4);
  const type   = getType(item);
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        background: "#fff", border: "1.5px solid #e5e7eb",
        boxShadow: hover ? "0 8px 28px rgba(0,0,0,0.13)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all 0.18s ease",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "2/3", background: "#f3f4f6", overflow: "hidden" }}>
        {item.poster_path ? (
          <img
            src={`${IMG}w342${item.poster_path}`}
            alt={title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#d1d5db" }}>
            {type === "tv" ? "📺" : "🎬"}
          </div>
        )}
        <div style={{
          position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 800,
          padding: "2px 7px", borderRadius: 5, letterSpacing: "0.05em", textTransform: "uppercase",
          background: type === "tv" ? "#7c3aed" : "#e50914", color: "#fff",
        }}>{type === "tv" ? "Serie" : "Film"}</div>
        {item.vote_average > 0 && (
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <RatingBadge v={item.vote_average} small />
          </div>
        )}
      </div>
      <div style={{ padding: "11px 13px 13px" }}>
        <p style={{
          fontSize: 12, fontWeight: 700, color: "#111827", margin: "0 0 3px", lineHeight: 1.35,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
        }}>{title}</p>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{year || "–"}</p>
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({ id, type, onClose }: { id: number; type: MediaType; onClose: () => void }) {
  const [detail,  setDetail]  = useState<TmdbDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    setShowAllReviews(false);
    tmdb({ action: "detail", id: String(id), type }).then(d => {
      setDetail(d);
      setLoading(false);
    });
  }, [id, type]);

  const title     = detail?.title || detail?.name || "…";
  const year      = (detail?.release_date || detail?.first_air_date || "").slice(0, 4);
  const runtime   = type === "movie" ? detail?.runtime : detail?.episode_run_time?.[0];
  const netflixDK = detail?.["watch/providers"]?.results?.DK?.flatrate?.find(p => p.provider_id === 8);
  const cast      = detail?.credits?.cast?.slice(0, 8) ?? [];
  const allReviews = detail?.reviews?.results ?? [];
  const reviews   = showAllReviews ? allReviews : allReviews.slice(0, 3);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", width: "min(580px, 96vw)", height: "100vh",
        background: "#fff", overflowY: "auto",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.18)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "sticky", top: 16, float: "right", marginRight: 16, zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.95)", border: "1.5px solid #e5e7eb",
          cursor: "pointer", fontSize: 20, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
        }}>×</button>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>Henter detaljer…</p>
          </div>
        ) : detail ? (
          <>
            {/* Backdrop */}
            {detail.backdrop_path && (
              <div style={{ position: "relative", height: 240, overflow: "hidden", flexShrink: 0 }}>
                <img src={`${IMG}w780${detail.backdrop_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, #fff 100%)" }} />
              </div>
            )}

            <div style={{ padding: detail.backdrop_path ? "0 28px 48px" : "60px 28px 48px", marginTop: detail.backdrop_path ? -32 : 0 }}>

              {/* Poster + meta */}
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
                {detail.poster_path && (
                  <img src={`${IMG}w185${detail.poster_path}`} alt="" style={{
                    width: 88, flexShrink: 0, borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
                  }} />
                )}
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <h2 style={{ fontSize: 21, fontWeight: 900, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{title}</h2>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    {year && <span style={{ fontSize: 13, color: "#6b7280" }}>{year}</span>}
                    {runtime && <span style={{ fontSize: 13, color: "#6b7280" }}>· {runtime} min</span>}
                    {type === "tv" && detail.number_of_seasons && (
                      <span style={{ fontSize: 13, color: "#6b7280" }}>· {detail.number_of_seasons} sæson{detail.number_of_seasons !== 1 ? "er" : ""}</span>
                    )}
                    {detail.vote_average > 0 && <RatingBadge v={detail.vote_average} />}
                  </div>

                  {netflixDK ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "#e5091412", border: "1px solid #e5091435" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e50914", display: "inline-block" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#e50914" }}>Tilgængelig på Netflix DK</span>
                    </div>
                  ) : (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>Ikke bekræftet på Netflix DK</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Genres */}
              {(detail.genres ?? []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {detail.genres!.map(g => (
                    <span key={g.id} style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 11px", borderRadius: 99,
                      background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
                    }}>{g.name}</span>
                  ))}
                </div>
              )}

              {/* Tagline */}
              {detail.tagline && (
                <p style={{ fontSize: 13, fontStyle: "italic", color: "#6b7280", margin: "0 0 10px" }}>"{detail.tagline}"</p>
              )}

              {/* Overview */}
              {detail.overview && (
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: "0 0 28px" }}>{detail.overview}</p>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Medvirkende</p>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
                    {cast.map(c => (
                      <div key={c.id} style={{ flexShrink: 0, width: 68, textAlign: "center" }}>
                        {c.profile_path ? (
                          <img src={`${IMG}w92${c.profile_path}`} alt={c.name} style={{
                            width: 52, height: 52, borderRadius: "50%", objectFit: "cover",
                            display: "block", margin: "0 auto 6px", border: "2px solid #f3f4f6",
                          }} />
                        ) : (
                          <div style={{
                            width: 52, height: 52, borderRadius: "50%", background: "#f3f4f6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 6px", fontSize: 20,
                          }}>👤</div>
                        )}
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#374151", margin: 0, lineHeight: 1.3 }}>{c.name}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0", lineHeight: 1.3 }}>{c.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Anmeldelser {allReviews.length > 0 && `(${detail.reviews!.total_results})`}
                  </p>
                  {allReviews.length > 3 && (
                    <button onClick={() => setShowAllReviews(s => !s)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: "#e50914",
                    }}>{showAllReviews ? "Vis færre" : `Vis alle ${allReviews.length}`}</button>
                  )}
                </div>

                {allReviews.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Ingen anmeldelser fundet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ padding: "14px 16px", borderRadius: 12, background: "#fafafa", border: "1.5px solid #e5e7eb" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{r.author}</span>
                          {r.author_details.rating != null && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 6, background: "#f59e0b18", color: "#d97706", border: "1px solid #d97706" + "30" }}>
                              ★ {r.author_details.rating}/10
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                            {new Date(r.created_at).toLocaleDateString("da-DK")}
                          </span>
                        </div>
                        <p style={{
                          fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.55,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 5, WebkitBoxOrient: "vertical" as const,
                        }}>{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 28 }}>
            <p style={{ color: "#9ca3af" }}>Kunne ikke hente detaljer</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type SortOption = "popularity.desc" | "vote_average.desc" | "release_date.desc";

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: "popularity.desc",   label: "Populære",      icon: "🔥" },
  { id: "vote_average.desc", label: "Bedst bedømt",  icon: "⭐" },
  { id: "release_date.desc", label: "Nyeste",        icon: "🆕" },
];

export default function NetflixTab() {
  const [mediaType,   setMediaType]   = useState<MediaType>("movie");
  const [genres,      setGenres]      = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [sort,        setSort]        = useState<SortOption>("popularity.desc");
  const [items,       setItems]       = useState<TmdbItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [query,       setQuery]       = useState("");
  const [debouncedQ,  setDebouncedQ]  = useState("");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [selected,    setSelected]    = useState<{ id: number; type: MediaType } | null>(null);
  const [noKey,       setNoKey]       = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const topRef      = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(query), 420);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Fetch genres
  useEffect(() => {
    tmdb({ action: "genres", type: mediaType }).then(d => setGenres(d.genres ?? []));
  }, [mediaType]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedQ, mediaType, activeGenre, sort]);

  // Fetch items
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = debouncedQ
      ? { action: "search", q: debouncedQ, page: String(page) }
      : {
          action: "discover", type: mediaType, sort, page: String(page),
          ...(activeGenre ? { genre: String(activeGenre) } : {}),
          // For best-rated: require at least 100 votes so obscure titles don't dominate
          ...(sort === "vote_average.desc" ? { vote_count_gte: "100" } : {}),
        };

    tmdb(params).then(d => {
      if (d.error?.includes("TMDB_API_KEY")) { setNoKey(true); setLoading(false); return; }
      const results: TmdbItem[] = (d.results ?? []).filter((x: TmdbItem) =>
        debouncedQ ? (x.media_type === "movie" || x.media_type === "tv") : true
      );
      setItems(results);
      setTotalPages(Math.min(d.total_pages ?? 1, 20));
      setLoading(false);
    });
  }, [debouncedQ, mediaType, activeGenre, sort, page]);

  function goPage(n: number) {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Pagination window
  const pageNumbers: number[] = (() => {
    const total = Math.min(totalPages, 20);
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 4) return [1,2,3,4,5];
    if (page >= total - 3) return [total-4, total-3, total-2, total-1, total];
    return [page-2, page-1, page, page+1, page+2];
  })();

  if (noKey) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔑</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>TMDb API-nøgle mangler</h2>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: "0 0 20px" }}>
            Tilføj din gratis TMDb API-nøgle til <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>.env.local</code>:
          </p>
          <div style={{ background: "#1e1e2e", borderRadius: 10, padding: "14px 18px", textAlign: "left", marginBottom: 20 }}>
            <code style={{ fontSize: 13, color: "#cdd6f4", fontFamily: "monospace" }}>TMDB_API_KEY="din-nøgle-her"</code>
          </div>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>
            Hent en gratis nøgle på <strong style={{ color: "#374151" }}>themoviedb.org</strong> → Account → API
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} style={{ background: "#fff", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid #f0f0f0", padding: "18px 32px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        position: "sticky", top: 0, zIndex: 20, background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "#e50914",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🎬</div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>Streaming</h1>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Netflix DK · TMDb</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 420, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søg film eller serie…"
            style={{
              width: "100%", padding: "9px 36px 9px 36px", borderRadius: 10,
              border: "1.5px solid #e5e7eb", outline: "none", fontSize: 14,
              background: "#fafafa", color: "#111827", boxSizing: "border-box",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#9ca3af", lineHeight: 1,
            }}>×</button>
          )}
        </div>

        {/* Type toggle (only in browse mode) */}
        {!debouncedQ && (
          <div style={{ display: "flex", gap: 3, background: "#f3f4f6", borderRadius: 10, padding: 3, flexShrink: 0 }}>
            {(["movie", "tv"] as MediaType[]).map(t => (
              <button key={t} onClick={() => { setMediaType(t); setActiveGenre(null); }} style={{
                padding: "6px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
                border: "none",
                background: mediaType === t ? "#fff" : "transparent",
                color: mediaType === t ? "#111827" : "#6b7280",
                boxShadow: mediaType === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.14s",
              }}>{t === "movie" ? "🎬 Film" : "📺 Serier"}</button>
            ))}
          </div>
        )}

        {/* Sort (only in browse mode) */}
        {!debouncedQ && (
          <div style={{ display: "flex", gap: 3, background: "#f3f4f6", borderRadius: 10, padding: 3, flexShrink: 0 }}>
            {SORT_OPTIONS.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)} style={{
                padding: "6px 14px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer",
                border: "none",
                background: sort === s.id ? "#fff" : "transparent",
                color: sort === s.id ? "#111827" : "#6b7280",
                boxShadow: sort === s.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.14s", whiteSpace: "nowrap",
              }}>{s.icon} {s.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Genre chips ────────────────────────────────────────────────────── */}
      {!debouncedQ && genres.length > 0 && (
        <div style={{
          padding: "12px 32px", display: "flex", gap: 7, overflowX: "auto",
          borderBottom: "1px solid #f0f0f0", scrollbarWidth: "none",
        }}>
          {[{ id: 0, name: "Alle" }, ...genres].map(g => {
            const active = g.id === 0 ? activeGenre === null : activeGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id === 0 ? null : (activeGenre === g.id ? null : g.id))}
                style={{
                  flexShrink: 0, padding: "5px 14px", borderRadius: 99, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  border: "none", outline: active ? "2px solid #e50914" : "1.5px solid #e5e7eb",
                  background: active ? "#e5091412" : "#fafafa",
                  color: active ? "#e50914" : "#374151",
                  transition: "all 0.12s",
                }}
              >{g.name}</button>
            );
          })}
        </div>
      )}

      {/* ── Results info ───────────────────────────────────────────────────── */}
      {debouncedQ && !loading && (
        <div style={{ padding: "12px 32px 0" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Søgeresultater for <strong style={{ color: "#111827" }}>"{debouncedQ}"</strong> — alle titler fra TMDb
          </p>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "24px 32px 80px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 16 }}>
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40 }}>🎬</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Ingen resultater</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              {debouncedQ ? `Intet fundet for "${debouncedQ}"` : "Prøv et andet filter"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 16 }}>
              {items.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelected({ id: item.id, type: getType(item) })}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 36, flexWrap: "wrap" }}>
                <button onClick={() => goPage(page - 1)} disabled={page === 1} style={{
                  padding: "8px 18px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: page === 1 ? "default" : "pointer",
                  border: "none", background: page === 1 ? "#f3f4f6" : "#111827",
                  color: page === 1 ? "#9ca3af" : "#fff",
                }}>← Forrige</button>

                {pageNumbers[0] > 1 && (
                  <>
                    <button onClick={() => goPage(1)} style={{ width: 36, height: 36, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", background: "#f3f4f6", color: "#374151" }}>1</button>
                    {pageNumbers[0] > 2 && <span style={{ color: "#9ca3af", fontSize: 13 }}>…</span>}
                  </>
                )}
                {pageNumbers.map(n => (
                  <button key={n} onClick={() => goPage(n)} style={{
                    width: 36, height: 36, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    border: "none", background: page === n ? "#e50914" : "#f3f4f6",
                    color: page === n ? "#fff" : "#374151",
                  }}>{n}</button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span style={{ color: "#9ca3af", fontSize: 13 }}>…</span>}
                    <button onClick={() => goPage(totalPages)} style={{ width: 36, height: 36, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", background: "#f3f4f6", color: "#374151" }}>{totalPages}</button>
                  </>
                )}

                <button onClick={() => goPage(page + 1)} disabled={page === totalPages} style={{
                  padding: "8px 18px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: page === totalPages ? "default" : "pointer",
                  border: "none", background: page === totalPages ? "#f3f4f6" : "#111827",
                  color: page === totalPages ? "#9ca3af" : "#fff",
                }}>Næste →</button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <DetailPanel id={selected.id} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
