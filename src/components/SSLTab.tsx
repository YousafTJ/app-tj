"use client";

import { useState } from "react";

interface SSLResult {
  valid: boolean;
  daysLeft: number;
  issuer: string;
  issuerCN: string | null;
  subject: string;
  validFrom: string;
  validTo: string;
  protocol: string | null;
  fingerprint: string | null;
  serialNumber: string | null;
  authError: string | null;
  error?: string;
}

function StatusBadge({ daysLeft, valid }: { daysLeft: number; valid: boolean }) {
  if (!valid || daysLeft <= 0) {
    return <Chip text="UDLØBET" color="rgba(248,113,113,0.15)" border="#f87171" textColor="#f87171" />;
  }
  if (daysLeft <= 14) {
    return <Chip text={`⚠️ Udløber om ${daysLeft} dage`} color="rgba(251,191,36,0.12)" border="#fbbf24" textColor="#fbbf24" />;
  }
  if (daysLeft <= 30) {
    return <Chip text={`${daysLeft} dage tilbage`} color="rgba(251,191,36,0.08)" border="rgba(251,191,36,0.3)" textColor="#fbbf24" />;
  }
  return <Chip text={`✓ Gyldig — ${daysLeft} dage tilbage`} color="rgba(74,222,128,0.1)" border="rgba(74,222,128,0.3)" textColor="#4ade80" />;
}

export default function SSLTab() {
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<SSLResult | null>(null);
  const [error, setError]     = useState("");

  async function check() {
    const domain = input.trim().replace(/^https?:\/\//i, "").split("/")[0];
    if (!domain) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`/api/ssl?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Fejl");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const ringPct = result
    ? Math.min(Math.max(result.daysLeft, 0) / 365, 1)
    : 0;
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const ringColor = !result
    ? "rgba(255,255,255,0.1)"
    : result.daysLeft <= 0
    ? "#f87171"
    : result.daysLeft <= 14
    ? "#fbbf24"
    : result.daysLeft <= 30
    ? "#fb923c"
    : "#4ade80";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>SSL-certifikat tjekker</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Tjek gyldighed, udløbsdato og detaljer for ethvert SSL-certifikat.
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder="f.eks. google.com eller https://example.com"
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={check} disabled={loading || !input.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Tjekker..." : "🔒 Tjek"}</span></span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🔐</p>
          <p style={{ margin: 0 }}>Forbinder til serveren...</p>
        </div>
      )}

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
          {/* Ring */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "24px 20px", textAlign: "center", minWidth: 180 }}>
              <div style={{ position: "relative", width: 128, height: 128, margin: "0 auto 16px" }}>
                <svg width={128} height={128} viewBox="0 0 128 128">
                  <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={12} />
                  <circle cx={64} cy={64} r={r} fill="none"
                    stroke={ringColor} strokeWidth={12}
                    strokeLinecap="round"
                    strokeDasharray={`${ringPct * circumference} ${circumference}`}
                    strokeDashoffset={circumference / 4}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px", transition: "stroke-dasharray 0.5s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>
                    {result.daysLeft > 0 ? result.daysLeft : "0"}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>dage</span>
                </div>
              </div>
              <StatusBadge daysLeft={result.daysLeft} valid={result.valid} />
            </div>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Certifikat</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Row label="Domæne"   value={result.subject} />
                  <Row label="Udsteder" value={result.issuer} />
                  {result.issuerCN && result.issuerCN !== result.issuer && (
                    <Row label="Udsteder CN" value={result.issuerCN} />
                  )}
                  <Row label="Gyldig fra" value={result.validFrom} />
                  <Row label="Udløber"    value={result.validTo} />
                  {result.protocol && <Row label="TLS-version" value={result.protocol} />}
                </div>
              </div>
            </div>

            {(result.fingerprint || result.serialNumber) && (
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Tekniske detaljer</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.serialNumber && <Row label="Serienummer" value={result.serialNumber} mono />}
                    {result.fingerprint  && <Row label="Fingeraftryk" value={result.fingerprint}  mono />}
                  </div>
                </div>
              </div>
            )}

            {result.authError && (
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "14px 18px", background: "rgba(248,113,113,0.06)" }}>
                  <p style={{ fontSize: 13, color: "#f87171", margin: 0, fontWeight: 600 }}>
                    ⚠️ Autorisationsfejl: {result.authError}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
      padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
      <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: mono ? 11 : 13, fontWeight: 600, color: "var(--text)", textAlign: "right",
        wordBreak: "break-all", fontFamily: mono ? "monospace" : undefined,
      }}>{value}</span>
    </div>
  );
}

function Chip({ text, color, border, textColor }: { text: string; color: string; border: string; textColor: string }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 700, padding: "4px 10px",
      borderRadius: 99, background: color, border: `1.5px solid ${border}`, color: textColor,
    }}>{text}</span>
  );
}
