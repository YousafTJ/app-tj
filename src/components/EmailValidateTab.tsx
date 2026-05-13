"use client";

import { useState } from "react";

interface ValidateResult {
  email: string;
  domain: string;
  valid: boolean;
  score: number;
  format: boolean;
  formatReason?: string;
  hasMx: boolean;
  mxRecords: string[];
  disposable: boolean;
  error?: string;
}

const SCORE_LABELS = ["Ugyldig", "Risikabel", "Sandsynlig", "Gyldig"];
const SCORE_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#4ade80"];

export default function EmailValidateTab() {
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ValidateResult | null>(null);
  const [error, setError]     = useState("");

  async function validate() {
    const email = input.trim();
    if (!email) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`/api/email-validate?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok && data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result ? SCORE_COLORS[Math.min(result.score, 3)] : "#fff";
  const scoreLabel = result ? SCORE_LABELS[Math.min(result.score, 3)] : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Email-validering</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Tjek format, MX-record og om domænet er en kendt disposable-udbyder.
        </p>
      </div>

      {/* Input */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && validate()}
              placeholder="f.eks. kontakt@firma.dk"
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
              type="email"
            />
            <button onClick={validate} disabled={loading || !input.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Tjekker..." : "✉️ Valider"}</span></span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>📬</p>
          <p style={{ margin: 0 }}>Validerer...</p>
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Score banner */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: `${scoreColor}18`, border: `2px solid ${scoreColor}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>
                  {result.valid ? "✅" : result.score >= 2 ? "⚠️" : "❌"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: scoreColor, margin: "0 0 2px" }}>
                    {scoreLabel}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
                    {result.email}
                  </p>
                </div>
                {/* Score dots */}
                <div style={{ display: "flex", gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: i < result.score ? scoreColor : "rgba(255,255,255,0.1)",
                    }} />
                  ))}
                </div>
              </div>

              {/* Bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${(result.score / 3) * 100}%`,
                    background: scoreColor, borderRadius: 99, transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Checks */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Tjek-resultat</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <CheckRow
                  ok={result.format}
                  label="Format"
                  ok_text="Korrekt email-format"
                  fail_text={result.formatReason ?? "Ugyldigt format"}
                />
                <CheckRow
                  ok={result.hasMx}
                  label="MX-record"
                  ok_text={`Domænet ${result.domain} har mail-server`}
                  fail_text={`Ingen MX-record fundet for ${result.domain}`}
                />
                <CheckRow
                  ok={!result.disposable}
                  label="Disposable"
                  ok_text="Ikke en kendt engangsmail-udbyder"
                  fail_text="Kendt disposable/engangsmail-domæne"
                />
              </div>
            </div>
          </div>

          {/* MX records */}
          {result.mxRecords.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                  Mail-servere ({result.mxRecords.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.mxRecords.map(mx => (
                    <div key={mx} style={{ display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 13 }}>📮</span>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text)" }}>{mx}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckRow({ ok, label, ok_text, fail_text }: { ok: boolean; label: string; ok_text: string; fail_text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 10,
      background: ok ? "rgba(74,222,128,0.05)" : "rgba(248,113,113,0.05)",
      border: `1.5px solid ${ok ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{ok ? "✅" : "❌"}</span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginRight: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 13, color: ok ? "#4ade80" : "#f87171", fontWeight: 500 }}>
          {ok ? ok_text : fail_text}
        </span>
      </div>
    </div>
  );
}
