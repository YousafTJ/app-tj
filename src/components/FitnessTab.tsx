"use client";

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FitnessView = "styrke" | "calisthenics";

// ─── Strength standards ────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  name: string;
  emoji: string;
  type: "barbell" | "bodyweight";
  standards?: { beginner: number; novice: number; intermediate: number; advanced: number; elite: number };
  repStandards?: { beginner: number; novice: number; intermediate: number; advanced: number; elite: number };
}

const EXERCISES: Exercise[] = [
  { id: "bench",    name: "Bænkpres",      emoji: "🏋️", type: "barbell",    standards:    { beginner: 0.5,  novice: 0.75, intermediate: 1.0,  advanced: 1.25, elite: 1.5  } },
  { id: "squat",    name: "Squat",          emoji: "🦵", type: "barbell",    standards:    { beginner: 0.75, novice: 1.0,  intermediate: 1.25, advanced: 1.5,  elite: 2.0  } },
  { id: "deadlift", name: "Dødløft",        emoji: "💀", type: "barbell",    standards:    { beginner: 1.0,  novice: 1.25, intermediate: 1.5,  advanced: 2.0,  elite: 2.5  } },
  { id: "ohp",      name: "Overhead Press", emoji: "🎯", type: "barbell",    standards:    { beginner: 0.3,  novice: 0.45, intermediate: 0.6,  advanced: 0.75, elite: 1.0  } },
  { id: "row",      name: "Barbell Row",    emoji: "🚣", type: "barbell",    standards:    { beginner: 0.5,  novice: 0.75, intermediate: 1.0,  advanced: 1.25, elite: 1.5  } },
  { id: "pullups",  name: "Pull-ups",       emoji: "🔝", type: "bodyweight", repStandards: { beginner: 1,    novice: 5,    intermediate: 10,   advanced: 15,   elite: 20   } },
  { id: "pushups",  name: "Push-ups",       emoji: "🤸", type: "bodyweight", repStandards: { beginner: 10,   novice: 20,   intermediate: 30,   advanced: 50,   elite: 75   } },
  { id: "dips",     name: "Dips",           emoji: "💺", type: "bodyweight", repStandards: { beginner: 3,    novice: 8,    intermediate: 15,   advanced: 25,   elite: 40   } },
];

type Level = "Begynder" | "Novice" | "Mellemniveau" | "Avanceret" | "Elite";
const LEVELS: Level[] = ["Begynder", "Novice", "Mellemniveau", "Avanceret", "Elite"];
const LEVEL_PCT  = [0, 50, 75, 90, 97]; // approx % of trainees below this level
const LEVEL_CFG: Record<Level, { color: string; bg: string; border: string; emoji: string }> = {
  "Begynder":     { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", emoji: "🌱" },
  "Novice":       { color: "#a3e635", bg: "rgba(163,230,53,0.1)",  border: "rgba(163,230,53,0.3)",  emoji: "💪" },
  "Mellemniveau": { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.3)",  emoji: "⚡" },
  "Avanceret":    { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", emoji: "🔥" },
  "Elite":        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  emoji: "👑" },
};

function getLevel(value: number, s: Record<string, number>): { level: Level; segmentPct: number } {
  if (value >= s.elite)        return { level: "Elite",        segmentPct: Math.min(100, ((value - s.elite)        / s.elite) * 100 + 100) };
  if (value >= s.advanced)     return { level: "Avanceret",    segmentPct: ((value - s.advanced)     / (s.elite        - s.advanced))     * 100 };
  if (value >= s.intermediate) return { level: "Mellemniveau", segmentPct: ((value - s.intermediate) / (s.advanced     - s.intermediate)) * 100 };
  if (value >= s.novice)       return { level: "Novice",       segmentPct: ((value - s.novice)       / (s.intermediate - s.novice))       * 100 };
  return                              { level: "Begynder",     segmentPct: (value / s.novice) * 100 };
}

function levelIndex(l: Level) { return LEVELS.indexOf(l); }

// ─── Calisthenics milestones ──────────────────────────────────────────────────

interface Milestone {
  id: string;
  name: string;
  description: string;
  tip: string;
  level: 1 | 2 | 3 | 4 | 5;
}

const MILESTONES: Milestone[] = [
  // Level 1 — Fundament
  { id: "pushup_10",   name: "10 push-ups",                  description: "10 rene push-ups uden pause",                  tip: "Hold core stram — krop som en planke",                    level: 1 },
  { id: "pullup_1",    name: "1 pull-up",                    description: "Første rene pull-up med fuldt stræk",           tip: "Start med negative pull-ups (3-5s ned)",                  level: 1 },
  { id: "plank_30",    name: "30s plank",                    description: "30 sekunder planke med neutral rygsøjle",       tip: "Pres navel mod ryg og spænd ballerne",                    level: 1 },
  { id: "squat_20",    name: "20 bodyweight squats",         description: "20 dybe squats med hæle i gulv",                tip: "Knæene følger tæernes retning",                           level: 1 },

  // Level 2 — Basis
  { id: "pushup_20",   name: "20 push-ups",                  description: "20 rene push-ups i træk",                       tip: "Fuld ROM — bryst rører gulvet",                           level: 2 },
  { id: "pullup_5",    name: "5 pull-ups",                   description: "5 rene pull-ups med fuldt stræk",               tip: "Træk scapula ned inden du trækker dig op",                level: 2 },
  { id: "dip_5",       name: "5 parallelle dips",            description: "5 rene dips på parallelle stænger",             tip: "Albuer peger bagud, læn let fremad",                      level: 2 },
  { id: "lsit_10",     name: "10s L-sit",                    description: "10 sekunder L-sit hold (paralletter/gulv)",     tip: "Start med tuck L-sit og stræk gradvist",                  level: 2 },
  { id: "pistol_1",    name: "1 pistol squat pr. ben",       description: "Pistol squat med kontrol ned og op",            tip: "Brug en stang til assistance i starten",                  level: 2 },

  // Level 3 — Mellemniveau
  { id: "muscleup_1",  name: "1 muscle-up",                  description: "Første rene muscle-up (kipping ok)",            tip: "10+ pull-ups og 10+ dips er minimum forudsætning",        level: 3 },
  { id: "pullup_10",   name: "10 pull-ups",                  description: "10 pull-ups i træk med kontrol",                tip: "Arbejd med slow negatives og paused reps",                level: 3 },
  { id: "handstand_w", name: "30s wall handstand",           description: "30 sekunder handstand mod væggen",              tip: "Hænder skulderbredde, arme låst, se på hænderne",         level: 3 },
  { id: "diamond_10",  name: "10 diamond push-ups",          description: "10 tæt-arm push-ups med fuld ROM",              tip: "Tommelfingre og pegefingre danner en diamant",            level: 3 },
  { id: "tuck_pl",     name: "5s tuck planche",              description: "5 sekunder tuck planche hold",                  tip: "Lær planche lean og protraction af scapula først",        level: 3 },

  // Level 4 — Avanceret
  { id: "muscleup_5",  name: "5 strict muscle-ups",          description: "5 strict muscle-ups i træk",                    tip: "Strict = ingen kip, langsom og kontrolleret",             level: 4 },
  { id: "handstand_f", name: "10s fritstående handstand",    description: "10 sekunder fritstående handstand balance",      tip: "Øv HS balance mod væggen med fingerspidskontrol",         level: 4 },
  { id: "tuck_fl",     name: "5s tuck front lever",          description: "5 sekunder tuck front lever hold",              tip: "Depress og retract scapula fuldt ud",                     level: 4 },
  { id: "hspu_wall",   name: "1 wall handstand push-up",     description: "Handstand push-up mod væggen (fuld ROM)",        tip: "Start med negatives fra lockout ned til hoveder",         level: 4 },
  { id: "pullup_15",   name: "15 weighted pull-ups / 20 bw", description: "15 pull-ups med vægt eller 20 bodyweight",      tip: "Tilsæt 2.5–5 kg via bælte og byg gradvist",              level: 4 },

  // Level 5 — Elite
  { id: "front_lever", name: "5s fuld front lever",          description: "5 sekunder fuld front lever med strakt krop",   tip: "Progrér: tuck → advanced tuck → straddle → full",        level: 5 },
  { id: "planche_f",   name: "3s fuld planche",              description: "3 sekunder fuld planche hold med strakt krop",  tip: "Progrér: tuck → straddle → full. Tager 1–3 år+",         level: 5 },
  { id: "human_flag",  name: "5s human flag",                description: "5 sekunder human flag på en vertikal stang",    tip: "Lateral core styrke + triceps/lats push-pull",            level: 5 },
  { id: "oap",         name: "1 one-arm pull-up pr. arm",    description: "En-arms pull-up på hvert arm",                  tip: "Archer pull-ups → assisted OAP → full OAP",              level: 5 },
  { id: "hs_30",       name: "30s fritstående handstand",    description: "30 sekunder fritstående handstand",             tip: "Daglig HS-træning i 10–15 min er nøglen",                level: 5 },
];

const CALI_LEVELS = [
  { level: 1 as const, name: "Fundament",    emoji: "🌱", color: "#94a3b8", desc: "Byg grundlæggende styrke og body control" },
  { level: 2 as const, name: "Basis",        emoji: "💪", color: "#a3e635", desc: "Solid styrkebase og første skills" },
  { level: 3 as const, name: "Mellemniveau", emoji: "⚡", color: "#38bdf8", desc: "Imponerende skill moves begynder at poppe op" },
  { level: 4 as const, name: "Avanceret",    emoji: "🔥", color: "#a78bfa", desc: "Kræver dedikeret daglig træning i årevis" },
  { level: 5 as const, name: "Elite",        emoji: "👑", color: "#f59e0b", desc: "World-class niveau — toppen af calisthenics" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function FitnessTab() {
  const [view, setView] = useState<FitnessView>("styrke");

  // Strength state
  const [exId, setExId]         = useState("bench");
  const [bodyweight, setBW]     = useState("");
  const [weight, setWeight]     = useState("");
  const [reps, setReps]         = useState("");

  // Calisthenics state
  const [checked, setChecked]   = useState<Set<string>>(new Set());
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cali_achievements");
      if (raw) setChecked(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  function toggleMilestone(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("cali_achievements", JSON.stringify([...next]));
      return next;
    });
  }

  const ex = EXERCISES.find(e => e.id === exId)!;

  // ── Strength calculation ──────────────────────────────────────────────────

  const bwNum     = parseFloat(bodyweight) || 0;
  const wNum      = parseFloat(weight) || 0;
  const repsNum   = parseInt(reps) || 0;

  let result: { level: Level; segmentPct: number; oneRM?: number; ratio?: number; next?: { level: Level; target: string } } | null = null;

  if (ex.type === "barbell" && bwNum > 0 && wNum > 0 && repsNum > 0 && ex.standards) {
    const oneRM = Math.round(wNum * (1 + repsNum / 30));
    const ratio = oneRM / bwNum;
    const { level, segmentPct } = getLevel(ratio, ex.standards);
    const idx  = levelIndex(level);
    const nextLevel = LEVELS[Math.min(idx + 1, 4)];
    const nextTarget = idx < 4
      ? `${Math.round(Object.values(ex.standards)[idx + 1] * bwNum)} kg 1RM`
      : "Du er på toppen!";
    result = { level, segmentPct, oneRM, ratio, next: { level: nextLevel, target: nextTarget } };
  } else if (ex.type === "bodyweight" && repsNum > 0 && ex.repStandards) {
    const { level, segmentPct } = getLevel(repsNum, ex.repStandards);
    const idx  = levelIndex(level);
    const nextLevel = LEVELS[Math.min(idx + 1, 4)];
    const nextReps = idx < 4 ? `${Object.values(ex.repStandards)[idx + 1]} reps` : "Du er på toppen!";
    result = { level, segmentPct, next: { level: nextLevel, target: nextReps } };
  }

  // ── Calisthenics analysis ─────────────────────────────────────────────────

  const totalMilestones   = MILESTONES.length;
  const doneCount         = MILESTONES.filter(m => checked.has(m.id)).length;
  const overallPct        = Math.round((doneCount / totalMilestones) * 100);

  // Current cali level = highest level where all previous are 100% + some in this
  let caliLevel = 1;
  for (const cl of CALI_LEVELS) {
    const inLevel = MILESTONES.filter(m => m.level === cl.level);
    const doneInLevel = inLevel.filter(m => checked.has(m.id)).length;
    if (doneInLevel === inLevel.length) caliLevel = cl.level + 1;
  }
  caliLevel = Math.min(caliLevel, 5);
  const currentCaliLvl = CALI_LEVELS[caliLevel - 1];

  // Next milestones to focus on
  const nextMilestones = MILESTONES
    .filter(m => !checked.has(m.id) && m.level === caliLevel)
    .slice(0, 3);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Fitness</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Vurder din styrke og track dine calisthenics-fremskridt</p>
        </div>
        {/* View switcher */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          {([["styrke", "🏋️ Styrke"], ["calisthenics", "🤸 Calisthenics"]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: view === v ? "rgba(91,66,243,0.3)" : "transparent",
              border: `1.5px solid ${view === v ? "rgba(91,66,243,0.6)" : "transparent"}`,
              color: view === v ? "#a78bfa" : "var(--text-2)",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STYRKE VIEW ─────────────────────────────────────────────────────── */}
      {view === "styrke" && (
        <>
          {/* Exercise picker */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
              <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Vælg øvelse</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EXERCISES.map(e => (
                  <button key={e.id} onClick={() => { setExId(e.id); setReps(""); setWeight(""); }} style={{
                    padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: exId === e.id ? "rgba(91,66,243,0.25)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${exId === e.id ? "#5B42F3" : "rgba(255,255,255,0.1)"}`,
                    color: exId === e.id ? "#a78bfa" : "var(--text-2)",
                  }}>
                    {e.emoji} {e.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${ex.type === "barbell" ? 3 : 1}, 1fr)`, gap: 14 }}>
                {ex.type === "barbell" && (
                  <>
                    <InputField label="Din kropsvægt (kg)" value={bodyweight} onChange={setBW} placeholder="80" />
                    <InputField label="Løftet vægt (kg)" value={weight} onChange={setWeight} placeholder="100" />
                  </>
                )}
                <InputField
                  label={ex.type === "barbell" ? "Antal reps" : "Antal reps (max sæt)"}
                  value={reps}
                  onChange={setReps}
                  placeholder={ex.type === "barbell" ? "5" : "15"}
                />
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "24px 26px" }}>
                {/* Level badge + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                    background: LEVEL_CFG[result.level].bg,
                    border: `2px solid ${LEVEL_CFG[result.level].border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  }}>
                    {LEVEL_CFG[result.level].emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: LEVEL_CFG[result.level].color, margin: 0 }}>
                      {result.level}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: "3px 0 0" }}>
                      {result.ratio
                        ? `Estimeret 1RM: ${result.oneRM} kg · Ratio: ${result.ratio.toFixed(2)}x kropsvægt`
                        : `${repsNum} reps`}
                      {" · "}
                      {LEVEL_PCT[levelIndex(result.level)]}% af alle trænende
                    </p>
                  </div>
                </div>

                {/* Gauge */}
                <StrengthGauge
                  current={result.level}
                  segmentPct={result.segmentPct}
                  standards={ex.standards ?? ex.repStandards!}
                  bodyweight={bwNum}
                  isBodyweight={ex.type === "bodyweight"}
                />

                {/* Next target */}
                {result.next && result.level !== "Elite" && (
                  <div style={{
                    marginTop: 18, padding: "12px 16px", borderRadius: 10,
                    background: "rgba(91,66,243,0.08)", border: "1px solid rgba(91,66,243,0.2)",
                  }}>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Næste niveau: {LEVEL_CFG[result.next.level].emoji} {result.next.level}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: 0 }}>
                      Mål: {result.next.target}
                    </p>
                  </div>
                )}
                {result.level === "Elite" && (
                  <div style={{
                    marginTop: 18, padding: "12px 16px", borderRadius: 10,
                    background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", margin: 0 }}>
                      👑 Du er i world-class kategori! Topniveauet inden for {ex.name.toLowerCase()}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standards table */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: "0 0 14px" }}>
                📊 Styrkestandarder for {ex.emoji} {ex.name}
                {bwNum > 0 && ex.type === "barbell" && <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 13 }}> ved {bwNum} kg kropsvægt</span>}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LEVELS.map((lvl, i) => {
                  const val = ex.standards
                    ? bwNum > 0
                      ? `${Math.round(Object.values(ex.standards)[i] * bwNum)} kg 1RM (${Object.values(ex.standards)[i]}x BW)`
                      : `${Object.values(ex.standards)[i]}x kropsvægt`
                    : `${Object.values(ex.repStandards!)[i]} reps`;
                  return (
                    <div key={lvl} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", borderRadius: 9,
                      background: result?.level === lvl ? LEVEL_CFG[lvl].bg : "rgba(255,255,255,0.02)",
                      border: `1px solid ${result?.level === lvl ? LEVEL_CFG[lvl].border : "rgba(255,255,255,0.06)"}`,
                    }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{LEVEL_CFG[lvl].emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: result?.level === lvl ? 700 : 500, color: result?.level === lvl ? LEVEL_CFG[lvl].color : "var(--text-2)", minWidth: 120 }}>
                        {lvl}
                      </span>
                      <span style={{ fontSize: 13, color: "#1c1917", fontFamily: "monospace" }}>{val}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>top {100 - LEVEL_PCT[i]}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CALISTHENICS VIEW ───────────────────────────────────────────────── */}
      {view === "calisthenics" && loaded && (
        <>
          {/* Overall progress */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "22px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, flexShrink: 0,
                  background: `rgba(${hexToRgb(currentCaliLvl.color)}, 0.12)`,
                  border: `2px solid ${currentCaliLvl.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                }}>
                  {currentCaliLvl.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: currentCaliLvl.color, margin: 0 }}>
                      {currentCaliLvl.name}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Niveau {caliLevel}</p>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 12px" }}>
                    {doneCount} / {totalMilestones} milestones opnået · {overallPct}% af roadmap
                  </p>
                  <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99, width: `${overallPct}%`,
                      background: `linear-gradient(90deg, ${currentCaliLvl.color}88, ${currentCaliLvl.color})`,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              </div>

              {/* Next focus */}
              {nextMilestones.length > 0 && (
                <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "rgba(91,66,243,0.07)", border: "1px solid rgba(91,66,243,0.18)" }}>
                  <p style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                    🎯 Fokusér på dette nu
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {nextMilestones.map(m => (
                      <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#5B42F3", fontSize: 16, flexShrink: 0, marginTop: 1 }}>▸</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#1c1917", margin: 0 }}>{m.name}</p>
                          <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>{m.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {doneCount === totalMilestones && (
                <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", margin: 0 }}>
                    👑 Du har klaret HELE roadmap! Du er en calisthenics elite-atlet!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Level roadmap */}
          {CALI_LEVELS.map(cl => {
            const levelMilestones = MILESTONES.filter(m => m.level === cl.level);
            const doneCnt = levelMilestones.filter(m => checked.has(m.id)).length;
            const pct     = Math.round((doneCnt / levelMilestones.length) * 100);
            const isActive = cl.level === caliLevel;

            return (
              <div key={cl.level} className="uv-card-1" style={{
                border: isActive ? `1.5px solid ${cl.color}40` : undefined,
              }}>
                <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                  {/* Level header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: `rgba(${hexToRgb(cl.color)}, 0.12)`, border: `1.5px solid ${cl.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    }}>{cl.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: cl.color }}>
                          Niveau {cl.level}: {cl.name}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${cl.color}20`, border: `1px solid ${cl.color}40`, color: cl.color }}>
                            DIT NIVEAU
                          </span>
                        )}
                        {pct === 100 && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
                            ✓ FÆRDIG
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: cl.color, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{doneCnt}/{levelMilestones.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {levelMilestones.map(m => {
                      const isDone = checked.has(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                            background: isDone ? `rgba(${hexToRgb(cl.color)}, 0.07)` : "rgba(255,255,255,0.02)",
                            border: `1px solid ${isDone ? cl.color + "30" : "rgba(255,255,255,0.05)"}`,
                            opacity: isDone ? 1 : 0.8,
                            transition: "all 0.15s",
                          }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
                            background: isDone ? cl.color : "transparent",
                            border: `1.5px solid ${isDone ? cl.color : "rgba(255,255,255,0.2)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, color: "white",
                          }}>
                            {isDone && "✓"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: isDone ? cl.color : "#1c1917", margin: 0, textDecoration: isDone ? "line-through" : "none" }}>
                              {m.name}
                            </p>
                            <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>
                              {m.description}
                            </p>
                            {!isDone && (
                              <p style={{ fontSize: 11, color: "#5B42F3", margin: "3px 0 0", fontStyle: "italic" }}>
                                💡 {m.tip}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── Strength gauge ───────────────────────────────────────────────────────────

function StrengthGauge({ current, segmentPct, standards, bodyweight, isBodyweight }: {
  current: Level;
  segmentPct: number;
  standards: Record<string, number>;
  bodyweight: number;
  isBodyweight: boolean;
}) {
  const idx = levelIndex(current);
  // Position as % of full bar: each level = 20%
  const barPct = (idx * 20) + (segmentPct / 100) * 20;

  return (
    <div>
      {/* Bar */}
      <div style={{ position: "relative", height: 14, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 99,
          background: "linear-gradient(90deg, #94a3b8, #a3e635 25%, #38bdf8 50%, #a78bfa 75%, #f59e0b)",
          opacity: 0.3,
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${Math.min(barPct, 100)}%`,
          background: "linear-gradient(90deg, #94a3b8, #a3e635 25%, #38bdf8 50%, #a78bfa 75%, #f59e0b)",
          borderRadius: 99, transition: "width 0.5s ease",
        }} />
        {/* Marker */}
        <div style={{
          position: "absolute", top: -2, bottom: -2,
          left: `calc(${Math.min(barPct, 98)}% - 3px)`,
          width: 6, borderRadius: 3,
          background: "white", boxShadow: "0 0 8px rgba(255,255,255,0.8)",
        }} />
      </div>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {LEVELS.map((lvl, i) => (
          <span key={lvl} style={{
            fontSize: 10, fontWeight: current === lvl ? 800 : 500,
            color: current === lvl ? LEVEL_CFG[lvl].color : "var(--text-3)",
            textAlign: i === 0 ? "left" : i === 4 ? "right" : "center",
            flex: 1,
          }}>
            {lvl}
          </span>
        ))}
      </div>
      {/* Targets */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        {Object.values(standards).map((v, i) => (
          <span key={i} style={{
            fontSize: 10, color: "var(--text-3)", fontFamily: "monospace",
            textAlign: i === 0 ? "left" : i === 4 ? "right" : "center", flex: 1,
          }}>
            {isBodyweight ? `${v}r` : bodyweight > 0 ? `${Math.round(v * bodyweight)}kg` : `${v}x`}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function InputField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", fontWeight: 600, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min="0"
        className="uv-input"
        style={{ fontSize: 18, fontWeight: 700, textAlign: "center" }}
      />
    </div>
  );
}
