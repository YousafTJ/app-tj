"use client";

import { useState } from "react";

const QUOTES = [
  (w: string) => `Universet har talt — ${w} er dit svar.`,
  (w: string) => `Din indre stemme vidste det hele tiden: ${w}.`,
  (w: string) => `Lodtrækningen peger klart på ${w}.`,
  (w: string) => `${w} vinder. Ingen fortrydelse tilladt.`,
  (w: string) => `Tilfældighederne favoriserer ${w} i dag.`,
  (w: string) => `${w} — nu stopper du med at tvivle.`,
  (w: string) => `Det kosmiske flip siger: ${w}.`,
  (w: string) => `Statistikken er klar: ${w}.`,
];

export default function BeslutningTab() {
  const [choice1, setChoice1] = useState("");
  const [choice2, setChoice2] = useState("");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult]   = useState<{ winner: string; loser: string; quote: string } | null>(null);
  const [animKey, setAnimKey] = useState(0);

  function flip() {
    const a = choice1.trim();
    const b = choice2.trim();
    if (!a || !b || flipping) return;
    setFlipping(true);
    setResult(null);
    setAnimKey(k => k + 1);

    setTimeout(() => {
      const isA   = Math.random() < 0.5;
      const winner = isA ? a : b;
      const loser  = isA ? b : a;
      const quote  = QUOTES[Math.floor(Math.random() * QUOTES.length)](winner);
      setResult({ winner, loser, quote });
      setFlipping(false);
    }, 1500);
  }

  function reset() {
    setResult(null);
    setChoice1("");
    setChoice2("");
  }

  const canFlip = choice1.trim() && choice2.trim() && !flipping;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <style>{`
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg)    scale(1); }
          25%  { transform: rotateY(540deg)  scale(1.15); }
          60%  { transform: rotateY(1260deg) scale(1.1); }
          85%  { transform: rotateY(1710deg) scale(1.05); }
          100% { transform: rotateY(1800deg) scale(1); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
          Beslutningshjælper
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Skriv to valg ind og lad mønten afgøre det. Perfekt mod beslutningslammelse.
        </p>
      </div>

      {/* Inputs */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputRow
              label="A" color="linear-gradient(144deg, #AF40FF, #5B42F3)"
              value={choice1} onChange={setChoice1} placeholder="Første valg..."
              onEnter={flip}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>eller</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>
            <InputRow
              label="B" color="linear-gradient(144deg, #00DDEB, #5B42F3)"
              value={choice2} onChange={setChoice2} placeholder="Andet valg..."
              onEnter={flip}
            />

            <button
              onClick={flip}
              disabled={!canFlip}
              className="uv-btn"
              style={{ alignSelf: "center", marginTop: 8, minWidth: 200 }}
            >
              <span className="uv-btn-text">
                <span>{flipping ? "Flipper mønten..." : "🪙 Flip mønten"}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Coin + result */}
      {(flipping || result) && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "12px 0 8px" }}>

          {/* Coin */}
          <div style={{ perspective: 1000 }}>
            <div
              key={animKey}
              style={{
                width: 130, height: 130, borderRadius: "50%",
                background: result
                  ? (result.winner === choice1.trim()
                    ? "linear-gradient(144deg, #AF40FF, #5B42F3)"
                    : "linear-gradient(144deg, #00DDEB, #5B42F3)")
                  : "linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 40px rgba(91,66,243,0.45), 0 0 0 6px rgba(91,66,243,0.12)",
                animation: flipping
                  ? "coinSpin 1.5s cubic-bezier(0.4,0,0.2,1) forwards"
                  : "none",
                fontSize: result ? 32 : 40,
                fontWeight: 900,
                color: "white",
                userSelect: "none",
                letterSpacing: "-1px",
              }}
            >
              {flipping ? "🪙" : (result?.winner === choice1.trim() ? "A" : "B")}
            </div>
          </div>

          {/* Result card */}
          {result && (
            <div
              style={{
                animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
                textAlign: "center", maxWidth: 440, width: "100%",
              }}
            >
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "28px 24px" }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px" }}>
                    Vinderen er
                  </p>
                  <p style={{ fontSize: 36, fontWeight: 900, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                    {result.winner}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 20px", fontStyle: "italic" }}>
                    "{result.quote}"
                  </p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      onClick={flip}
                      className="uv-btn"
                      style={{ minWidth: 120 }}
                    >
                      <span className="uv-btn-text"><span>🔄 Prøv igen</span></span>
                    </button>
                    <button
                      onClick={reset}
                      style={{
                        fontSize: 13, color: "var(--text-3)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1.5px solid rgba(255,255,255,0.1)",
                        borderRadius: 99, padding: "8px 18px", cursor: "pointer",
                      }}
                    >
                      Ny beslutning
                    </button>
                  </div>
                </div>
              </div>

              {/* Loser */}
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12, fontStyle: "italic" }}>
                {result.loser} må vente til næste gang.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InputRow({ label, color, value, onChange, placeholder, onEnter }: {
  label: string; color: string; value: string;
  onChange: (v: string) => void; placeholder: string; onEnter: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 900, color: "white",
      }}>
        {label}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter()}
        placeholder={placeholder}
        className="uv-input"
        style={{ flex: 1, fontSize: 15 }}
      />
    </div>
  );
}
