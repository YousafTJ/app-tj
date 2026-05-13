"use client";

import { useState } from "react";

interface Job {
  id: number | string;
  title: string;
  company: string;
  company_logo?: string | null;
  location: string;
  tags: string[];
  url: string;
  date: string;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "I dag";
  if (days === 1) return "I går";
  if (days < 7)  return `${days} dage siden`;
  if (days < 30) return `${Math.floor(days / 7)} uger siden`;
  return `${Math.floor(days / 30)} mdr. siden`;
}

function salary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Fra ${fmt(min)}`;
  if (max) return `Op til ${fmt(max)}`;
  return null;
}

export default function JobRadarTab() {
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState<number | string | null>(null);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(""); setJobs([]);
    try {
      const res  = await fetch(`/api/jobs?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      const list: Job[] = data.jobs ?? [];
      if (list.length === 0) setError("Ingen stillinger fundet — prøv andre nøgleord.");
      setJobs(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = ["javascript", "python", "marketing", "design", "sales", "react", "devops"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Job-radar</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Søg på teknologi eller rolle og se aktuelle remote-stillinger via RemoteOK.
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="f.eks. javascript, python, marketing..."
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={search} disabled={loading || !query.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Søger..." : "📡 Søg"}</span></span>
            </button>
          </div>
          {/* Quick tags */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); }}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, cursor: "pointer",
                  background: "rgba(91,66,243,0.08)", border: "1.5px solid rgba(91,66,243,0.2)", color: "#a78bfa",
                }}>
                {s}
              </button>
            ))}
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>📡</p>
          <p style={{ margin: 0 }}>Henter stillinger...</p>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, fontWeight: 600 }}>
            {jobs.length} remote-stillinger fundet
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map(job => {
              const isOpen = expanded === job.id;
              const sal    = salary(job.salary_min, job.salary_max);
              return (
                <div key={job.id} className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      {/* Logo */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {job.company_logo
                          ? <img src={job.company_logo} alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
                          : <span style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{(job.company ?? "?")[0]}</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 3px",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {job.title}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 8px" }}>{job.company}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {job.location && (
                            <Chip text={`📍 ${job.location}`} color="rgba(0,221,235,0.08)" border="rgba(0,221,235,0.2)" textColor="#00DDEB" />
                          )}
                          {sal && (
                            <Chip text={`💰 ${sal}`} color="rgba(74,222,128,0.1)" border="rgba(74,222,128,0.25)" textColor="#4ade80" />
                          )}
                          {job.tags.slice(0, 3).map(tag => (
                            <Chip key={tag} text={tag} color="rgba(91,66,243,0.08)" border="rgba(91,66,243,0.2)" textColor="#a78bfa" />
                          ))}
                          <Chip text={timeAgo(job.date)} color="rgba(255,255,255,0.04)" border="rgba(255,255,255,0.08)" textColor="var(--text-3)" />
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                        <a href={job.url} target="_blank" rel="noopener noreferrer"
                          className="uv-btn" style={{ fontSize: 12, textDecoration: "none" }}>
                          <span className="uv-btn-text"><span>Se stilling →</span></span>
                        </a>
                        {job.description && (
                          <button onClick={() => setExpanded(isOpen ? null : job.id)}
                            style={{ fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>
                            {isOpen ? "Luk ▲" : "Beskrivelse ▼"}
                          </button>
                        )}
                      </div>
                    </div>

                    {isOpen && job.description && (
                      <p style={{
                        fontSize: 13, color: "var(--text-2)", margin: "14px 0 0",
                        lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14,
                        display: "-webkit-box", WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {job.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Chip({ text, color, border, textColor }: { text: string; color: string; border: string; textColor: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99,
      background: color, border: `1.5px solid ${border}`, color: textColor,
    }}>{text}</span>
  );
}
