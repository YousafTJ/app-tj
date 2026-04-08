"use client";

import { useState } from "react";

interface QuizQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
interface Flashcard { front: string; back: string; }
interface LearnResult {
  title: string;
  image: string;
  excerpt: string;
  what: string;
  why: string;
  facts: string[];
  quiz: QuizQ[];
  flashcards: Flashcard[];
}

// ─── Flashcard with flip ──────────────────────────────────────────────────────
function FlipCard({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{ cursor: "pointer", perspective: 1000, height: 140 }}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* Front */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          borderRadius: 14,
          background: "rgba(91,66,243,0.1)",
          border: "1.5px solid rgba(91,66,243,0.3)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "16px 20px", textAlign: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Spørgsmål</span>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1c1917", margin: 0, lineHeight: 1.5 }}>{card.front}</p>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>Klik for svar →</span>
        </div>
        {/* Back */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: 14,
          background: "rgba(163,230,53,0.08)",
          border: "1.5px solid rgba(163,230,53,0.25)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "16px 20px", textAlign: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 11, color: "#a3e635", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Svar</span>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1c1917", margin: 0, lineHeight: 1.5 }}>{card.back}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function Quiz({ questions }: { questions: QuizQ[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAll, setShowAll] = useState(false);

  const answered = Object.keys(answers).length;
  const correct  = Object.entries(answers).filter(([i, a]) => questions[Number(i)].correct === a).length;
  const done     = answered === questions.length;

  function pick(qi: number, opt: number) {
    if (qi in answers) return;
    setAnswers(a => ({ ...a, [qi]: opt }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Score bar */}
      {answered > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>Score:</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: done ? (correct >= 4 ? "#a3e635" : correct >= 2 ? "#facc15" : "#f87171") : "#a78bfa" }}>
            {correct} / {answered}
          </span>
          {done && (
            <span style={{ fontSize: 13, color: "var(--text-2)", marginLeft: 4 }}>
              {correct === 5 ? "🏆 Perfekt!" : correct >= 3 ? "👍 Godt klaret!" : "📖 Prøv igen!"}
            </span>
          )}
        </div>
      )}

      {questions.map((q, qi) => {
        const picked = answers[qi];
        const revealed = picked !== undefined || showAll;
        return (
          <div key={qi} style={{
            padding: "16px 18px", borderRadius: 14,
            background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.07)",
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: "0 0 12px", lineHeight: 1.4 }}>
              <span style={{ color: "#a78bfa", marginRight: 8 }}>{qi + 1}.</span>
              {q.question}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {q.options.map((opt, oi) => {
                const isCorrect = oi === q.correct;
                const isPicked  = oi === picked;
                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.08)";
                let color = "var(--text-2)";
                if (revealed) {
                  if (isCorrect)            { bg = "rgba(163,230,53,0.12)"; border = "1.5px solid rgba(163,230,53,0.35)"; color = "#a3e635"; }
                  else if (isPicked)        { bg = "rgba(248,113,113,0.1)";  border = "1.5px solid rgba(248,113,113,0.35)"; color = "#f87171"; }
                }
                return (
                  <button
                    key={oi}
                    onClick={() => pick(qi, oi)}
                    disabled={revealed}
                    style={{
                      padding: "9px 12px", borderRadius: 9, cursor: revealed ? "default" : "pointer",
                      background: bg, border, color,
                      fontSize: 13, fontWeight: isPicked || (revealed && isCorrect) ? 700 : 400,
                      textAlign: "left", transition: "all 0.2s",
                    }}
                  >
                    <span style={{ opacity: 0.5, marginRight: 6 }}>{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "10px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>
                💡 {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!done && answered < questions.length && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            alignSelf: "flex-start", padding: "7px 18px", borderRadius: 99, cursor: "pointer",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-3)", fontSize: 12,
          }}
        >Vis svar</button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LearnTab() {
  const [topic, setTopic]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<LearnResult | null>(null);
  const [error, setError]     = useState("");
  const [section, setSection] = useState<"overview" | "quiz" | "flashcards">("overview");

  const SUGGESTIONS = ["Inflation", "Fotosyntese", "Anden Verdenskrig", "Sort hul", "DNA", "Kvantemekanik"];

  async function search(t = topic) {
    const q = t.trim();
    if (!q) return;
    setLoading(true); setError(""); setResult(null); setSection("overview");
    try {
      const res = await fetch(`/api/learn?topic=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
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
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Lær om et emne</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Skriv et emne og få en forklaring, quiz og flashcards genereret automatisk
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder='Skriv et emne, f.eks. "Inflation" eller "DNA"'
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={() => search()} disabled={loading || !topic.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text">
                <span>{loading ? "Henter…" : "🧠 Lær det"}</span>
              </span>
            </button>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setTopic(s); search(s); }}
                style={{
                  padding: "4px 13px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-2)",
                }}
              >{s}</button>
            ))}
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "12px 0 0" }}>{error}</p>}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "56px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 36, margin: "0 0 12px" }}>🧠</p>
          <p style={{ margin: 0 }}>Henter Wikipedia og genererer quiz + flashcards…</p>
          <p style={{ fontSize: 12, margin: "6px 0 0", color: "var(--text-3)" }}>Kan tage 5–10 sekunder</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Title + image */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            {result.image && (
              <img
                src={result.image}
                alt={result.title}
                style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 12, flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.08)" }}
              />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 4px" }}>{result.title}</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>{result.excerpt}</p>
            </div>
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["overview", "quiz", "flashcards"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                style={{
                  padding: "8px 18px", borderRadius: 99, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: section === s ? "rgba(91,66,243,0.25)" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${section === s ? "rgba(91,66,243,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: section === s ? "#a78bfa" : "var(--text-2)",
                }}
              >
                {s === "overview" ? "📖 Oversigt" : s === "quiz" ? "❓ Quiz" : "🃏 Flashcards"}
              </button>
            ))}
          </div>

          {/* Overview */}
          {section === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* What + Why */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Hvad er det?", text: result.what, icon: "🔍" },
                  { label: "Hvorfor vigtigt?", text: result.why, icon: "💡" },
                ].map(b => (
                  <div key={b.label} className="uv-card-1">
                    <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                        {b.icon} {b.label}
                      </p>
                      <p style={{ fontSize: 14, color: "#1c1917", margin: 0, lineHeight: 1.6 }}>{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Facts */}
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                    ⚡ 3 hurtige facts
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.facts.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{
                          flexShrink: 0, width: 24, height: 24, borderRadius: 99,
                          background: "linear-gradient(144deg, #AF40FF, #5B42F3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 800, color: "white",
                        }}>{i + 1}</span>
                        <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz */}
          {section === "quiz" && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 18px" }}>
                  ❓ Quiz — {result.quiz.length} spørgsmål
                </p>
                <Quiz questions={result.quiz} />
              </div>
            </div>
          )}

          {/* Flashcards */}
          {section === "flashcards" && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 6px" }}>
                  🃏 Flashcards
                </p>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 18px" }}>Klik på et kort for at vende det</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {result.flashcards.map((c, i) => <FlipCard key={i} card={c} />)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
