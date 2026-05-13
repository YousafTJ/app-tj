"use client";

import { useState } from "react";

interface Tech {
  name: string;
  category: string;
  icon: string;
  confidence: "definite" | "likely";
}

interface ScanResult {
  url: string;
  status: number;
  server: string | null;
  powered: string | null;
  detected: Tech[];
  error?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  CMS:           { bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)", text: "#c084fc" },
  Framework:     { bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)", text: "#60a5fa" },
  "E-handel":    { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)", text: "#4ade80" },
  Analytics:     { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
  Hosting:       { bg: "rgba(0,221,235,0.08)",  border: "rgba(0,221,235,0.25)", text: "#00DDEB" },
  Server:        { bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", text: "#94a3b8" },
  Backend:       { bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.3)", text: "#fb923c" },
  CSS:           { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", text: "#f87171" },
  "Chat / CRM":  { bg: "rgba(91,66,243,0.12)",  border: "rgba(91,66,243,0.3)", text: "#a78bfa" },
  Betaling:      { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)", text: "#34d399" },
  Bibliotek:     { bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)", text: "#9ca3af" },
};

function CategoryBlock({ category, techs }: { category: string; techs: Tech[] }) {
  const color = CATEGORY_COLORS[category] ?? { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", text: "var(--text-2)" };
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, color: color.text, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
        {category}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {techs.map(t => (
          <div key={t.name} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 14px", borderRadius: 10,
            background: color.bg, border: `1.5px solid ${color.border}`,
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: 6, display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", fontSize: 10, fontWeight: 900,
              color: color.text, flexShrink: 0, fontFamily: "monospace",
            }}>{t.icon.slice(0, 2)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TechStackTab() {
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ScanResult | null>(null);
  const [error, setError]     = useState("");

  async function scan() {
    const url = input.trim();
    if (!url) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`/api/tech-stack?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Fejl");
      setResult(data);
      if (data.detected.length === 0) setError("Ingen kendte teknologier detekteret — siden kan bruge obfuskeret kode.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  // Group detected techs by category
  const grouped = result
    ? result.detected.reduce<Record<string, Tech[]>>((acc, t) => {
        (acc[t.category] ??= []).push(t);
        return acc;
      }, {})
    : {};

  const totalCount = result?.detected.length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Tech-stack detektor</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Skriv en URL og se hvad en hjemmeside er bygget med — CMS, framework, analytics, CRM og meget mere.
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && scan()}
              placeholder="f.eks. shopify.com, dr.dk, vercel.com..."
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={scan} disabled={loading || !input.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Scanner..." : "🔭 Scan"}</span></span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🔭</p>
          <p style={{ margin: 0 }}>Analyserer teknologi-stack...</p>
        </div>
      )}

      {result && totalCount > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Summary bar */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 2px" }}>Skannet</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>
                    {result.url}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {result.server && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                      background: "rgba(148,163,184,0.08)", border: "1.5px solid rgba(148,163,184,0.2)", color: "#94a3b8",
                    }}>{result.server}</span>
                  )}
                  <span style={{
                    fontSize: 13, fontWeight: 800, padding: "5px 14px", borderRadius: 99,
                    background: "linear-gradient(144deg,#AF40FF,#5B42F3)", color: "#fff",
                  }}>{totalCount} teknologier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grouped results */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {Object.entries(grouped).map(([cat, techs]) => (
                  <CategoryBlock key={cat} category={cat} techs={techs} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
