"use client";

import { useState, useRef, useEffect } from "react";
import {
  ExternalLink,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import type { SearchResponse } from "@/app/api/search/route";

const STORE_META: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  google_shopping: { color: "#1d4ed8", bg: "#eff6ff",  label: "Google Shopping", emoji: "🛒" },
  proshop:         { color: "#c2410c", bg: "#fff7ed",  label: "Proshop.dk",       emoji: "⚡" },
  komplett:        { color: "#15803d", bg: "#f0fdf4",  label: "Komplett.dk",      emoji: "💚" },
  power:           { color: "#b45309", bg: "#fffbeb",  label: "Power.dk",         emoji: "🔋" },
  dba:             { color: "#6d28d9", bg: "#f5f3ff",  label: "DBA.dk",           emoji: "🏷️" },
};

const SUGGESTIONS = [
  "iPhone 16 Pro", "Samsung Galaxy S25", "PlayStation 5",
  "AirPods Pro", "MacBook Air M3", "RTX 4080", "Dyson V15", "iPad Pro",
];

export default function PrisJagtTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSearch(searchQuery?: string) {
    const q = (searchQuery ?? query).trim();
    if (!q || loading) return;
    if (searchQuery) setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setData(null);
    setExpandedStores(new Set());
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch {
      setError("Søgningen fejlede. Tjek forbindelsen og prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  function toggleStore(id: string) {
    setExpandedStores(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
          Prisjagt
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Søg på et produkt og find den billigste pris på tværs af 5 kilder
        </p>
      </div>

      {/* Search bar */}
      <div style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", maxWidth: 640 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Søg fx iPhone 16 Pro, PS5..."
              className="uv-input"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="uv-btn"
            style={{ flexShrink: 0, padding: "12px 24px" }}
          >
            <span className="uv-btn-text"><span>{loading ? "Søger…" : "Søg"}</span></span>
          </button>
        </div>

        {/* Suggestions */}
        {!data && !loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                style={{
                  fontSize: 13, padding: "5px 12px", borderRadius: 20,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text-2)", cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: 20 }}>
          <div className="uv-loader-fire" />
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>Søger 5 kilder...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px", borderRadius: 10,
          border: "1px solid var(--red-light)", backgroundColor: "var(--red-light)",
          maxWidth: 640,
        }}>
          <AlertCircle style={{ width: 16, height: 16, color: "var(--red)", flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--red)", flex: 1, margin: 0 }}>{error}</p>
          <button
            onClick={() => handleSearch()}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, color: "var(--red)", background: "none",
              border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            Prøv igen
          </button>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Result meta */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "var(--text-2)" }}>Resultater for</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>"{data.query}"</span>
              <span style={{
                fontSize: 12, padding: "2px 8px", borderRadius: 20,
                backgroundColor: "var(--accent-light)", color: "#93c5fd", fontWeight: 500,
              }}>
                {data.totalFound} fundet
              </span>
            </div>
            <button
              onClick={() => handleSearch()}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 13, color: "var(--text-2)", background: "none",
                border: "none", cursor: "pointer", padding: 0,
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
              Opdater
            </button>
          </div>

          {/* Winner card */}
          {data.cheapest ? (
            <div className="uv-card-2" style={{ padding: "3px" }}>
              <div style={{
                background: "rgba(5, 6, 45, 0.9)",
                borderRadius: "calc(1rem - 3px)",
                padding: "20px 24px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Trophy style={{ width: 22, height: 22, color: "#FFCC70" }} />
                  </div>

                  {data.cheapest.imageUrl && (
                    <div style={{
                      width: 72, height: 72, borderRadius: 8, overflow: "hidden",
                      border: "1px solid var(--border)", flexShrink: 0,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}>
                      <img
                        src={data.cheapest.imageUrl}
                        alt={data.cheapest.title}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                        onError={e => ((e.target as HTMLElement).style.display = "none")}
                      />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#FFCC70", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      Billigste pris fundet
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f4f1ee", marginBottom: 10, lineHeight: 1.4 }}>
                      {data.cheapest.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
                        {data.cheapest.priceFormatted}
                      </span>
                      <span style={{
                        fontSize: 13, fontWeight: 500,
                        color: STORE_META[data.cheapest.storeId]?.color ?? "var(--text-2)",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        padding: "4px 10px", borderRadius: 20,
                      }}>
                        {STORE_META[data.cheapest.storeId]?.emoji} {data.cheapest.store}
                      </span>
                    </div>
                  </div>

                  <a
                    href={data.cheapest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uv-btn"
                    style={{ flexShrink: 0, textDecoration: "none" }}
                  >
                    <ShoppingCart style={{ width: 16, height: 16 }} />
                    <span className="uv-btn-text"><span>Køb nu</span></span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: 40, textAlign: "center" }}>
                <AlertCircle style={{ width: 28, height: 28, color: "var(--text-3)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text-2)", fontSize: 14 }}>Ingen resultater. Prøv et andet søgeord.</p>
              </div>
            </div>
          )}

          {/* Per-store grid */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
              Priser per butik
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {data.byStore.map(store => {
                const meta = STORE_META[store.storeId] ?? { color: "var(--text-2)", bg: "var(--surface-2)", label: store.storeName, emoji: "🏪" };
                const isExpanded = expandedStores.has(store.storeId);

                return (
                  <div className="uv-card-1" key={store.storeId}>
                    <div className="uv-card-1-inner">
                      {/* Store label */}
                      <div style={{
                        padding: "10px 14px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>
                          {meta.emoji} {store.storeName}
                        </span>
                        {store.results.length > 0 && (
                          <span style={{ fontSize: 11, color: meta.color, opacity: 0.7 }}>
                            {store.results.length} fundet
                          </span>
                        )}
                      </div>

                      <div style={{ padding: 14 }}>
                        {store.error ? (
                          <p style={{ fontSize: 13, color: "var(--red)", display: "flex", alignItems: "center", gap: 5 }}>
                            <AlertCircle style={{ width: 13, height: 13 }} />
                            Kunne ikke hente data
                          </p>
                        ) : !store.cheapest ? (
                          <p style={{ fontSize: 13, color: "var(--text-3)" }}>Ingen resultater</p>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                                  {store.cheapest.title.length > 60
                                    ? store.cheapest.title.slice(0, 60) + "…"
                                    : store.cheapest.title}
                                </p>
                                <p style={{ fontSize: 20, fontWeight: 800, color: meta.color }}>
                                  {store.cheapest.priceFormatted}
                                </p>
                              </div>
                              {store.cheapest.imageUrl && (
                                <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                                  <img src={store.cheapest.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                    onError={e => ((e.target as HTMLElement).style.display = "none")} />
                                </div>
                              )}
                            </div>

                            <a
                              href={store.cheapest.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                padding: "8px", borderRadius: 8, width: "100%",
                                border: "1px solid var(--border)",
                                backgroundColor: "rgba(255,255,255,0.05)",
                                color: "var(--text-2)",
                                fontSize: 13, fontWeight: 500,
                                textDecoration: "none", marginBottom: 8,
                                transition: "background-color 0.15s",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                            >
                              <ExternalLink style={{ width: 13, height: 13 }} />
                              Se tilbud
                            </a>

                            {store.results.length > 1 && (
                              <>
                                <button
                                  onClick={() => toggleStore(store.storeId)}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                                    width: "100%", padding: "4px",
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: 12, color: "var(--text-3)",
                                  }}
                                >
                                  {isExpanded ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                                  {isExpanded ? "Skjul" : `${store.results.length - 1} mere`}
                                </button>

                                {isExpanded && (
                                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
                                    {store.results.slice(1).map((r, i) => (
                                      <a
                                        key={i}
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: "flex", alignItems: "center", justifyContent: "space-between",
                                          padding: "6px 8px", borderRadius: 6,
                                          textDecoration: "none",
                                          transition: "background-color 0.1s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                      >
                                        <span style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                          {r.title.length > 40 ? r.title.slice(0, 40) + "…" : r.title}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{r.priceFormatted}</span>
                                          <ExternalLink style={{ width: 11, height: 11, color: "var(--text-3)" }} />
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All results table */}
          {data.allResults.length > 0 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                Alle resultater — billigst til dyrest
              </h3>
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255,255,255,0.04)" }}>
                          {["#", "Produkt", "Butik", "Pris", ""].map((h, i) => (
                            <th key={i} style={{
                              padding: "10px 16px", textAlign: i >= 3 ? "right" : "left",
                              fontSize: 11, fontWeight: 600, color: "var(--text-3)",
                              textTransform: "uppercase", letterSpacing: "0.05em",
                              whiteSpace: "nowrap",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.allResults.map((r, i) => {
                          const meta = STORE_META[r.storeId] ?? { color: "var(--text-2)", bg: "var(--surface-2)", label: r.store, emoji: "🏪" };
                          return (
                            <tr
                              key={i}
                              style={{
                                borderBottom: "1px solid var(--border)",
                                backgroundColor: i === 0 ? "rgba(255, 204, 0, 0.1)" : "transparent",
                                transition: "background-color 0.1s",
                              }}
                              onMouseEnter={e => {
                                if (i !== 0) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = i === 0 ? "rgba(255, 204, 0, 0.1)" : "transparent";
                              }}
                            >
                              <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-3)" }}>
                                {i === 0 ? <Trophy style={{ width: 14, height: 14, color: "#d97706" }} /> : i + 1}
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {r.imageUrl && (
                                    <div style={{ width: 28, height: 28, borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                                      <img src={r.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                        onError={e => ((e.target as HTMLElement).style.display = "none")} />
                                    </div>
                                  )}
                                  <span style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                                    {r.title}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                <span style={{
                                  fontSize: 12, fontWeight: 500,
                                  color: meta.color, backgroundColor: "rgba(255,255,255,0.08)",
                                  padding: "2px 8px", borderRadius: 20,
                                  whiteSpace: "nowrap",
                                }}>
                                  {meta.emoji} {r.store}
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px", textAlign: "right" }}>
                                <span style={{
                                  fontSize: i === 0 ? 16 : 14,
                                  fontWeight: 700,
                                  color: i === 0 ? "#d97706" : "var(--text)",
                                }}>
                                  {r.priceFormatted}
                                </span>
                              </td>
                              <td style={{ padding: "10px 16px", textAlign: "right" }}>
                                <a href={r.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink style={{ width: 13, height: 13, color: "var(--text-3)" }} />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div style={{ paddingTop: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 500 }}>
            {Object.entries(STORE_META).map(([id, meta]) => (
              <div key={id} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
              }}>
                <span>{meta.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: meta.color }}>{meta.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 16 }}>
            Søg på et produkt ovenfor for at sammenligne priser
          </p>
        </div>
      )}
    </div>
  );
}
