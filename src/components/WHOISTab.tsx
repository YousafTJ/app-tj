"use client";

import { useState } from "react";

interface WHOISResult {
  domain: string;
  registered: string | null;
  expires: string | null;
  updated: string | null;
  ageDays: number | null;
  daysUntilExpiry: number | null;
  registrar: string | null;
  nameservers: string[];
  status: string[];
  error?: string;
}

function formatAge(days: number | null): string {
  if (days === null) return "Ukendt";
  const years  = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0 && months > 0) return `${years} år, ${months} mdr.`;
  if (years > 0) return `${years} år`;
  if (months > 0) return `${months} mdr.`;
  return `${days} dage`;
}

function ExpiryBar({ days }: { days: number | null }) {
  if (days === null) return null;
  const pct = Math.min(Math.max(days, 0) / 365, 1);
  const color = days < 30 ? "#f87171" : days < 90 ? "#fbbf24" : "#4ade80";
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: color, borderRadius: 99,
          transition: "width 0.6s ease" }} />
      </div>
      <p style={{ fontSize: 11, color, fontWeight: 600, margin: "4px 0 0" }}>
        {days <= 0 ? "UDLØBET" : days <= 30 ? `⚠️ Udløber om ${days} dage` : `${days} dage til fornyelse`}
      </p>
    </div>
  );
}

export default function WHOISTab() {
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<WHOISResult | null>(null);
  const [error, setError]     = useState("");

  async function lookup() {
    const domain = input.trim().replace(/^https?:\/\//i, "").split("/")[0];
    if (!domain) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Fejl");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>WHOIS-opslag</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Se registreringsdato, udløb, registrar og navneservere for ethvert domæne.
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="f.eks. google.com, dr.dk, github.io..."
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={lookup} disabled={loading || !input.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Slår op..." : "🌐 Slå op"}</span></span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🌐</p>
          <p style={{ margin: 0 }}>Henter WHOIS-data...</p>
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            <KpiCard label="Domæne alder" value={formatAge(result.ageDays)} icon="📅" />
            <KpiCard label="Registreret" value={result.registered ?? "Ukendt"} icon="📝" />
            <KpiCard label="Udløber" value={result.expires ?? "Ukendt"} icon="⏳"
              sub={<ExpiryBar days={result.daysUntilExpiry} />} />
            <KpiCard label="Sidst opdateret" value={result.updated ?? "Ukendt"} icon="🔄" />
          </div>

          {/* Registrar */}
          {result.registrar && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Registrar</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>{result.registrar}</p>
              </div>
            </div>
          )}

          {/* Nameservers */}
          {result.nameservers.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                  Navneservere ({result.nameservers.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.nameservers.map(ns => (
                    <div key={ns} style={{ display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 14 }}>🖥️</span>
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: "var(--text)" }}>{ns}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {result.status.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                  Registreringsstatus
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.status.map(s => {
                    const isLocked = s.toLowerCase().includes("lock") || s.toLowerCase().includes("prohibited");
                    return (
                      <span key={s} style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                        background: isLocked ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${isLocked ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.1)"}`,
                        color: isLocked ? "#4ade80" : "var(--text-2)",
                      }}>{s}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, sub }: { label: string; value: string; icon: string; sub?: React.ReactNode }) {
  return (
    <div className="uv-card-1">
      <div className="uv-card-1-inner" style={{ padding: "16px 18px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
          {icon} {label}
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>{value}</p>
        {sub}
      </div>
    </div>
  );
}
