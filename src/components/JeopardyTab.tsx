"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, Plus, Trash2, Trophy } from "lucide-react";
import { JEOPARDY_CATEGORIES, type JeopardyClue } from "@/lib/jeopardy-data";

// ── Types ────────────────────────────────────────────────────────────────────
interface Team {
  name: string;
  score: number;
  color: string;
}

type UsedKey = string; // `${catIdx}-${clueIdx}`

// ── Constants ─────────────────────────────────────────────────────────────────
const TEAM_COLORS = ["#5B42F3", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

const STORAGE_KEYS = {
  teams: "jp_teams",
  used:  "jp_used",
  phase: "jp_phase",
};

const POINT_STYLE: Record<number, { color: string; dimColor: string }> = {
  100: { color: "#22c55e", dimColor: "rgba(34,197,94,0.4)"   },
  200: { color: "#60a5fa", dimColor: "rgba(96,165,250,0.4)"  },
  300: { color: "#fbbf24", dimColor: "rgba(251,191,36,0.4)"  },
  400: { color: "#f87171", dimColor: "rgba(248,113,113,0.4)" },
  500: { color: "#a78bfa", dimColor: "rgba(167,139,250,0.4)" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadState() {
  try {
    const teams = JSON.parse(localStorage.getItem(STORAGE_KEYS.teams) ?? "null");
    const used  = new Set<UsedKey>(JSON.parse(localStorage.getItem(STORAGE_KEYS.used)  ?? "null") ?? []);
    const phase = (localStorage.getItem(STORAGE_KEYS.phase) ?? "setup") as "setup" | "game";
    return { teams, used, phase };
  } catch { return { teams: null, used: new Set<UsedKey>(), phase: "setup" as const }; }
}

function saveState(teams: Team[], used: Set<UsedKey>, phase: string) {
  localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
  localStorage.setItem(STORAGE_KEYS.used,  JSON.stringify([...used]));
  localStorage.setItem(STORAGE_KEYS.phase, phase);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function JeopardyTab() {
  const [phase, setPhase]       = useState<"setup" | "game">("setup");
  const [teams, setTeams]       = useState<Team[]>([
    { name: "Hold 1", score: 0, color: TEAM_COLORS[0] },
    { name: "Hold 2", score: 0, color: TEAM_COLORS[1] },
  ]);
  const [used,      setUsed]    = useState<Set<UsedKey>>(new Set());
  const [active,    setActive]  = useState<{ catIdx: number; clueIdx: number; clue: JeopardyClue } | null>(null);
  const [revealed,  setRevealed]= useState(false);
  const [buzzer,    setBuzzer]  = useState<number>(0); // index of team answering

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved.teams && saved.teams.length > 0) {
      setTeams(saved.teams);
      setUsed(saved.used);
      setPhase(saved.phase);
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    saveState(teams, used, phase);
  }, [teams, used, phase]);

  // ── Setup helpers ─────────────────────────────────────────────────────────
  function updateTeamName(i: number, name: string) {
    setTeams(prev => prev.map((t, idx) => idx === i ? { ...t, name } : t));
  }

  function addTeam() {
    if (teams.length >= 6) return;
    const color = TEAM_COLORS[teams.length];
    setTeams(prev => [...prev, { name: `Hold ${prev.length + 1}`, score: 0, color }]);
  }

  function removeTeam(i: number) {
    if (teams.length <= 2) return;
    setTeams(prev => prev.filter((_, idx) => idx !== i));
  }

  function startGame() {
    setPhase("game");
    setBuzzer(0);
  }

  function resetGame() {
    setUsed(new Set());
    setTeams(prev => prev.map(t => ({ ...t, score: 0 })));
    setActive(null);
    setRevealed(false);
    setBuzzer(0);
  }

  function fullReset() {
    localStorage.removeItem(STORAGE_KEYS.teams);
    localStorage.removeItem(STORAGE_KEYS.used);
    localStorage.removeItem(STORAGE_KEYS.phase);
    setTeams([
      { name: "Hold 1", score: 0, color: TEAM_COLORS[0] },
      { name: "Hold 2", score: 0, color: TEAM_COLORS[1] },
    ]);
    setUsed(new Set());
    setPhase("setup");
    setActive(null);
    setRevealed(false);
  }

  // ── Game helpers ──────────────────────────────────────────────────────────
  function openClue(catIdx: number, clueIdx: number, clue: JeopardyClue) {
    const key: UsedKey = `${catIdx}-${clueIdx}`;
    if (used.has(key)) return;
    setActive({ catIdx, clueIdx, clue });
    setRevealed(false);
  }

  function closeClue(outcome: "correct" | "wrong" | "skip") {
    if (!active) return;
    const key: UsedKey = `${active.catIdx}-${active.clueIdx}`;

    if (outcome !== "skip") {
      const delta = outcome === "correct" ? active.clue.points : -active.clue.points;
      setTeams(prev => prev.map((t, i) => i === buzzer ? { ...t, score: t.score + delta } : t));
    }

    setUsed(prev => new Set([...prev, key]));
    setActive(null);
    setRevealed(false);
    // Advance buzzer to next team for next question
    if (outcome === "correct") setBuzzer(b => (b + 1) % teams.length);
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalClues = JEOPARDY_CATEGORIES.reduce((s, c) => s + c.clues.length, 0);
  const maxScore   = JEOPARDY_CATEGORIES.reduce((s, c) => s + c.clues.reduce((ss, cl) => ss + cl.points, 0), 0);
  const leading    = [...teams].sort((a, b) => b.score - a.score)[0];

  // ══════════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Jeopardy — Opsætning</h2>
        <p style={{ color: "var(--text-2)", marginBottom: 28, fontSize: 14 }}>Opret holdene og giv dem navne</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {teams.map((team, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: team.color, flexShrink: 0 }} />
              <input
                type="text"
                value={team.name}
                onChange={e => updateTeamName(i, e.target.value)}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "var(--text)", fontSize: 14, outline: "none",
                }}
              />
              <button
                onClick={() => removeTeam(i)}
                disabled={teams.length <= 2}
                style={{ ...iconBtnSm, opacity: teams.length <= 2 ? 0.3 : 1, color: "#f87171" }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={addTeam}
            disabled={teams.length >= 6}
            style={{ ...outlineBtn, display: "flex", alignItems: "center", gap: 6, opacity: teams.length >= 6 ? 0.4 : 1 }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Tilføj hold
          </button>
          <button onClick={startGame} className="uv-btn" style={{ marginLeft: "auto" }}>
            <span className="uv-btn-text"><span>Start spil</span></span>
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GAME SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Jeopardy</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {used.size} / {totalClues} spørgsmål brugt
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={resetGame} style={{ ...outlineBtn, fontSize: 12 }}>
            <RotateCcw style={{ width: 13, height: 13 }} /> Nulstil point
          </button>
          <button onClick={fullReset} style={{ ...outlineBtn, fontSize: 12, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
            Ny kamp
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(used.size / totalClues) * 100}%`, background: "linear-gradient(90deg,#5B42F3,#AF40FF)", transition: "width 0.3s", borderRadius: 99 }} />
      </div>

      {/* Scoreboard */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {teams.map((team, i) => (
          <button
            key={i}
            onClick={() => setBuzzer(i)}
            style={{
              flex: "1 1 120px",
              padding: "12px 16px", borderRadius: 12,
              border: `2px solid ${buzzer === i ? team.color : "rgba(255,255,255,0.08)"}`,
              backgroundColor: buzzer === i ? `${team.color}1a` : "rgba(255,255,255,0.03)",
              cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: team.color }} />
              {buzzer === i && <span style={{ fontSize: 10, fontWeight: 700, color: team.color, letterSpacing: 1 }}>AKTIV</span>}
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</p>
            <p style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 0", color: team.score < 0 ? "#f87171" : "var(--text)" }}>
              {team.score < 0 ? "-" : ""}{Math.abs(team.score).toLocaleString("da")}
            </p>
          </button>
        ))}
      </div>

      {/* Board */}
      <div style={{ overflowX: "auto", paddingBottom: 12 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${JEOPARDY_CATEGORIES.length}, 1fr)`,
          gap: 6,
          minWidth: `${JEOPARDY_CATEGORIES.length * 120}px`,
        }}>
          {/* Category headers */}
          {JEOPARDY_CATEGORIES.map((cat, ci) => (
            <div key={ci} style={{
              padding: "12px 8px", borderRadius: 10, textAlign: "center",
              background: "linear-gradient(135deg, rgba(91,66,243,0.22), rgba(175,64,255,0.18))",
              border: "1px solid rgba(91,66,243,0.4)",
              minHeight: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{cat.icon}</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
            </div>
          ))}

          {/* Clue cells */}
          {[0, 1, 2, 3, 4].map(clueIdx =>
            JEOPARDY_CATEGORIES.map((cat, catIdx) => {
              const clue   = cat.clues[clueIdx];
              const key: UsedKey = `${catIdx}-${clueIdx}`;
              const isUsed = used.has(key);
              const ps     = POINT_STYLE[clue.points];

              return (
                <div
                  key={key}
                  className={`jp-cell${isUsed ? " jp-used" : ""}`}
                  onClick={() => openClue(catIdx, clueIdx, clue)}
                  style={{
                    height: 80,
                    backgroundColor: isUsed ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isUsed ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
                    cursor: isUsed ? "default" : "pointer",
                    borderRadius: 10,
                    transition: "background 0.15s, transform 0.15s",
                  }}
                >
                  {isUsed ? (
                    <span style={{ fontSize: 20, color: "rgba(255,255,255,0.1)" }}>—</span>
                  ) : (
                    <span style={{
                      fontSize: 24, fontWeight: 900,
                      color: ps.color,
                      textShadow: `0 0 20px ${ps.color}60`,
                    }}>
                      {clue.points}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Leaderboard footer (shown when all done) */}
      {used.size === totalClues && (
        <div style={{ marginTop: 24, padding: 24, borderRadius: 14, background: "rgba(91,66,243,0.1)", border: "1px solid rgba(91,66,243,0.3)", textAlign: "center" }}>
          <Trophy style={{ width: 32, height: 32, color: "#fbbf24", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Spillet er slut!</p>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 16px" }}>
            Vinder: <strong style={{ color: leading.color }}>{leading.name}</strong> med {leading.score.toLocaleString("da")} point
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[...teams].sort((a, b) => b.score - a.score).map((t, i) => (
              <div key={i} style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${t.color}40` }}>
                <span style={{ fontSize: 12, color: t.color, fontWeight: 700 }}>#{i + 1} {t.name}</span>
                <span style={{ fontSize: 14, color: "var(--text)", marginLeft: 10, fontWeight: 800 }}>{t.score.toLocaleString("da")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Clue Modal ────────────────────────────────────────────────────────── */}
      {active && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              maxWidth: 600, width: "100%",
              backgroundColor: "#f5f4f2",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20, padding: 28,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: 99, color: POINT_STYLE[active.clue.points].color, backgroundColor: `${POINT_STYLE[active.clue.points].color}1a`, border: `1px solid ${POINT_STYLE[active.clue.points].color}40` }}>
                  {active.clue.points} point
                </span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {JEOPARDY_CATEGORIES[active.catIdx].icon} {JEOPARDY_CATEGORIES[active.catIdx].name}
                </span>
              </div>
              <button onClick={() => closeClue("skip")} style={iconBtnSm}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Clue text */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#5B42F3", textTransform: "uppercase", margin: "0 0 10px" }}>LEDETRÅD</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", lineHeight: 1.5, margin: "0 0 24px" }}>
              {active.clue.clue}
            </p>

            {/* Team selector */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "var(--text-3)", textTransform: "uppercase", margin: "0 0 8px" }}>HOLD DER SVARER</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {teams.map((team, i) => (
                <button
                  key={i}
                  onClick={() => setBuzzer(i)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${buzzer === i ? team.color : "rgba(255,255,255,0.1)"}`,
                    backgroundColor: buzzer === i ? `${team.color}1a` : "transparent",
                    color: buzzer === i ? team.color : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>

            {/* Reveal / Score buttons */}
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                style={{ width: "100%", padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-2)" }}
              >
                Vis svar
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#a78bfa", textTransform: "uppercase", margin: "0 0 8px" }}>SVAR</p>
                <p style={{ fontSize: 17, color: "#a78bfa", fontWeight: 500, margin: "0 0 20px", lineHeight: 1.5 }}>{active.clue.answer}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <button
                    onClick={() => closeClue("wrong")}
                    style={{ padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}
                  >
                    ✗ Forkert<br />
                    <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>−{active.clue.points} til {teams[buzzer]?.name}</span>
                  </button>
                  <button
                    onClick={() => closeClue("skip")}
                    style={{ padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-2)" }}
                  >
                    ○ Spring over<br />
                    <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>Ingen point</span>
                  </button>
                  <button
                    onClick={() => closeClue("correct")}
                    style={{ padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}
                  >
                    ✓ Rigtigt<br />
                    <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>+{active.clue.points} til {teams[buzzer]?.name}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const outlineBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.12)",
  backgroundColor: "transparent", color: "var(--text-2)",
};

const iconBtnSm: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 30, height: 30, borderRadius: 7, cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "transparent", color: "var(--text-2)",
};
