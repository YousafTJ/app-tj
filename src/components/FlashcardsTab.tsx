"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { FLASHCARD_TOPICS, type FlashcardTopic } from "@/lib/flashcards-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsTab() {
  const [selectedTopic, setSelectedTopic] = useState<FlashcardTopic | null>(null);
  const [cards, setCards] = useState(selectedTopic?.cards ?? []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());

  function openTopic(topic: FlashcardTopic) {
    setSelectedTopic(topic);
    setCards(topic.cards);
    setIndex(0);
    setFlipped(false);
    setDone(new Set());
  }

  function closeTopic() {
    setSelectedTopic(null);
    setFlipped(false);
  }

  function next() {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(i + 1, cards.length - 1)), flipped ? 250 : 0);
  }

  function prev() {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.max(i - 1, 0)), flipped ? 250 : 0);
  }

  function markDone() {
    setDone(prev => new Set([...prev, index]));
    if (index < cards.length - 1) next();
  }

  function doShuffle() {
    setCards(shuffle(cards));
    setIndex(0);
    setFlipped(false);
    setDone(new Set());
  }

  function reset() {
    setCards(selectedTopic!.cards);
    setIndex(0);
    setFlipped(false);
    setDone(new Set());
  }

  // ── Topic selection ──────────────────────────────────────────────────────────
  if (!selectedTopic) {
    return (
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Flashkort</h2>
        <p style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>
          Vælg et emne og test din viden — klik på kortet for at vende det
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {FLASHCARD_TOPICS.map(t => (
            <button
              key={t.topic}
              onClick={() => openTopic(t)}
              className="uv-card-1"
              style={{ textAlign: "left", cursor: "pointer", background: "none", border: "none", padding: 0, width: "100%" }}
            >
              <div className="uv-card-1-inner" style={{ padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>{t.topic}</p>
                <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>{t.cards.length} kort</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Card study mode ──────────────────────────────────────────────────────────
  const card = cards[index];
  const progress = Math.round(((index + 1) / cards.length) * 100);
  const allDone = done.size === cards.length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={closeTopic} style={backBtnStyle}>
          <ChevronLeft style={{ width: 16, height: 16 }} /> Emner
        </button>
        <span style={{ fontSize: 20, }}>{selectedTopic.icon}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>{selectedTopic.topic}</h2>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-2)" }}>
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #5B42F3, #AF40FF)", transition: "width 0.3s ease", borderRadius: 99 }} />
      </div>

      {/* Flip card */}
      <div
        className="fc-scene"
        onClick={() => setFlipped(f => !f)}
        style={{ height: 280, maxWidth: 600, margin: "0 auto 32px", position: "relative" }}
      >
        <div className={`fc-card${flipped ? " flipped" : ""}`}>
          {/* Front — spørgsmål */}
          <div className="fc-face" style={{ background: "linear-gradient(135deg, #1a1917 0%, #222120 100%)", border: "1px solid rgba(91,66,243,0.4)", boxShadow: "0 0 40px rgba(91,66,243,0.12)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#5B42F3", textTransform: "uppercase", marginBottom: 16 }}>
              SPØRGSMÅL
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
              {card.q}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 20 }}>Klik for at se svaret</p>
          </div>

          {/* Back — svar */}
          <div className="fc-face fc-face-back" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2d1f5e 100%)", border: "1px solid rgba(167,139,250,0.4)", boxShadow: "0 0 40px rgba(167,139,250,0.15)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#a78bfa", textTransform: "uppercase", marginBottom: 16 }}>
              SVAR
            </div>
            <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
              {card.a}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={prev} disabled={index === 0} style={navBtnStyle} title="Forrige">
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </button>

        <button onClick={markDone} disabled={done.has(index)} style={{
          ...navBtnStyle,
          backgroundColor: done.has(index) ? "rgba(34,197,94,0.15)" : "transparent",
          borderColor: done.has(index) ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)",
          color: done.has(index) ? "#22c55e" : "var(--text-2)",
          padding: "8px 18px", gap: 6,
        }}>
          {done.has(index) ? "✓ Kan det" : "Kan det"}
        </button>

        <button onClick={doShuffle} style={navBtnStyle} title="Bland kort">
          <Shuffle style={{ width: 16, height: 16 }} />
        </button>

        <button onClick={reset} style={navBtnStyle} title="Nulstil">
          <RotateCcw style={{ width: 16, height: 16 }} />
        </button>

        <button onClick={next} disabled={index === cards.length - 1} style={navBtnStyle} title="Næste">
          <ChevronRight style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Done state */}
      {allDone && (
        <div style={{ textAlign: "center", marginTop: 32, padding: "24px", borderRadius: 14, backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#22c55e", margin: 0 }}>Du har gennemgået alle {cards.length} kort!</p>
          <button onClick={reset} style={{ marginTop: 12, ...navBtnStyle, padding: "8px 20px" }}>
            Start forfra
          </button>
        </div>
      )}

      {/* Done count */}
      {done.size > 0 && !allDone && (
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-2)" }}>
          {done.size} af {cards.length} markeret som lært
        </p>
      )}
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "transparent",
  color: "var(--text-2)", fontSize: 13, cursor: "pointer",
};

const navBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "8px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "transparent",
  color: "var(--text-2)", fontSize: 13, cursor: "pointer",
};
