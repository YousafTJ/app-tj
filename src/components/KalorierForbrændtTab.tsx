"use client";

import { useState, useEffect, useRef } from "react";

interface Activity { id: string; category: string; label: string; icon: string; met: number; }

const ACTIVITIES: Activity[] = [
  // Cardio
  { id: "walk-slow",    category: "Cardio",    label: "Gå (rolig)",          icon: "🚶",   met: 2.5 },
  { id: "walk-fast",    category: "Cardio",    label: "Gå (hurtig)",         icon: "🚶‍♂️",   met: 4.3 },
  { id: "nordic-walk",  category: "Cardio",    label: "Nordic walking",      icon: "🥢",   met: 5.0 },
  { id: "jog",          category: "Cardio",    label: "Jogging",             icon: "🏃",   met: 7.0 },
  { id: "run",          category: "Cardio",    label: "Løb (10 km/t)",       icon: "🏃‍♂️",   met: 9.8 },
  { id: "sprint",       category: "Cardio",    label: "Sprint/intervaller",  icon: "⚡",   met: 14.5 },
  { id: "bike-easy",    category: "Cardio",    label: "Cykling (let)",       icon: "🚴",   met: 6.0 },
  { id: "bike-hard",    category: "Cardio",    label: "Cykling (intenst)",   icon: "🚴‍♂️",   met: 12.0 },
  { id: "spinning",     category: "Cardio",    label: "Spinning",            icon: "🎡",   met: 8.5 },
  { id: "elliptical",   category: "Cardio",    label: "Crosstrainer",        icon: "🔄",   met: 5.0 },
  { id: "rope",         category: "Cardio",    label: "Hoppereb",            icon: "🪢",   met: 11.0 },
  { id: "stairs",       category: "Cardio",    label: "Trapper",             icon: "🪜",   met: 8.0 },
  { id: "rollerblades", category: "Cardio",    label: "Rulleskøjter",        icon: "🛼",   met: 7.5 },
  { id: "triathlon",    category: "Cardio",    label: "Triatlon",            icon: "🏅",   met: 10.0 },
  // Styrke
  { id: "gym-light",    category: "Styrke",    label: "Styrketræning (let)", icon: "🏋️",   met: 3.5 },
  { id: "gym-hard",     category: "Styrke",    label: "Styrketræning (tungt)",icon: "💪",  met: 6.0 },
  { id: "hiit",         category: "Styrke",    label: "HIIT / Crossfit",     icon: "🔥",   met: 9.0 },
  { id: "kettlebell",   category: "Styrke",    label: "Kettlebells",         icon: "🔔",   met: 8.0 },
  { id: "bodyweight",   category: "Styrke",    label: "Kropsøvelser",        icon: "🤸",   met: 4.0 },
  { id: "calisthenics", category: "Styrke",    label: "Calisthenics",        icon: "🧱",   met: 5.5 },
  { id: "trx",          category: "Styrke",    label: "TRX / Suspension",    icon: "🪝",   met: 4.0 },
  // Kampsport
  { id: "boxing",       category: "Kampsport", label: "Boksning",            icon: "🥊",   met: 9.0 },
  { id: "kickboxing",   category: "Kampsport", label: "Kickboxing",          icon: "🦵",   met: 10.0 },
  { id: "mma",          category: "Kampsport", label: "MMA",                 icon: "🥋",   met: 10.5 },
  { id: "muaythai",     category: "Kampsport", label: "Muay Thai",           icon: "🔴",   met: 10.0 },
  { id: "judo",         category: "Kampsport", label: "Judo",                icon: "🟡",   met: 10.3 },
  { id: "karate",       category: "Kampsport", label: "Karate",              icon: "🟠",   met: 10.0 },
  { id: "wrestling",    category: "Kampsport", label: "Brydning",            icon: "🤼",   met: 8.0 },
  { id: "bjj",          category: "Kampsport", label: "Brasiliansk Jiujitsu",icon: "⬛",   met: 9.5 },
  { id: "fencing",      category: "Kampsport", label: "Fægtning",            icon: "🤺",   met: 6.0 },
  { id: "taekwondo",    category: "Kampsport", label: "Taekwondo",           icon: "🔵",   met: 10.0 },
  // Holdsport
  { id: "football",     category: "Holdsport", label: "Fodbold",             icon: "⚽",   met: 7.0 },
  { id: "basketball",   category: "Holdsport", label: "Basketball",          icon: "🏀",   met: 6.5 },
  { id: "handball",     category: "Holdsport", label: "Håndbold",            icon: "🤾",   met: 8.0 },
  { id: "volleyball",   category: "Holdsport", label: "Volleyball",          icon: "🏐",   met: 4.0 },
  { id: "beachvb",      category: "Holdsport", label: "Beach volleyball",    icon: "🏖️",   met: 8.0 },
  { id: "rugby",        category: "Holdsport", label: "Rugby",               icon: "🏉",   met: 8.3 },
  { id: "icehockey",    category: "Holdsport", label: "Ishockey",            icon: "🏒",   met: 8.0 },
  { id: "fieldhockey",  category: "Holdsport", label: "Hockeystav",          icon: "🏑",   met: 7.0 },
  { id: "baseball",     category: "Holdsport", label: "Baseball",            icon: "⚾",   met: 5.0 },
  // Vand & Natur
  { id: "swim",         category: "Vand & Natur", label: "Svømning",         icon: "🏊",   met: 7.0 },
  { id: "swim-fast",    category: "Vand & Natur", label: "Svømning (intenst)",icon: "🏊‍♂️",  met: 10.0 },
  { id: "rowing",       category: "Vand & Natur", label: "Roning",           icon: "🚣",   met: 8.5 },
  { id: "kayak",        category: "Vand & Natur", label: "Kajak",            icon: "🛶",   met: 5.0 },
  { id: "sup",          category: "Vand & Natur", label: "SUP (Stand Up Paddle)",icon: "🏄‍♂️",met: 6.0 },
  { id: "surfing",      category: "Vand & Natur", label: "Surfing",          icon: "🌊",   met: 5.0 },
  { id: "waterpolo",    category: "Vand & Natur", label: "Vandpolo",         icon: "🤽",   met: 10.0 },
  { id: "hiking",       category: "Vand & Natur", label: "Vandring",         icon: "⛰️",   met: 5.3 },
  { id: "climbing",     category: "Vand & Natur", label: "Klatring",         icon: "🧗",   met: 8.0 },
  { id: "skiing",       category: "Vand & Natur", label: "Alpint skiløb",    icon: "⛷️",   met: 7.0 },
  { id: "snowboard",    category: "Vand & Natur", label: "Snowboard",        icon: "🏂",   met: 6.0 },
  { id: "crosscountry", category: "Vand & Natur", label: "Langrend",         icon: "🎿",   met: 9.0 },
  { id: "mtnbike",      category: "Vand & Natur", label: "Mountain biking",  icon: "🚵",   met: 8.5 },
  // Racket
  { id: "tennis",       category: "Racket",    label: "Tennis",              icon: "🎾",   met: 7.3 },
  { id: "badminton",    category: "Racket",    label: "Badminton",           icon: "🏸",   met: 5.5 },
  { id: "squash",       category: "Racket",    label: "Squash",              icon: "🟡",   met: 12.1 },
  { id: "padel",        category: "Racket",    label: "Padel",               icon: "🎾",   met: 7.5 },
  { id: "tabletennis",  category: "Racket",    label: "Bordtennis",          icon: "🏓",   met: 4.0 },
  // Wellness
  { id: "yoga",         category: "Wellness",  label: "Yoga",                icon: "🧘",   met: 2.5 },
  { id: "pilates",      category: "Wellness",  label: "Pilates",             icon: "🤸‍♀️",   met: 3.0 },
  { id: "dance",        category: "Wellness",  label: "Dans",                icon: "💃",   met: 4.5 },
  { id: "stretching",   category: "Wellness",  label: "Udstrækning",         icon: "🙆",   met: 2.0 },
  { id: "golf",         category: "Wellness",  label: "Golf",                icon: "⛳",   met: 3.5 },
  { id: "bowling",      category: "Wellness",  label: "Bowling",             icon: "🎳",   met: 3.0 },
];

const CATEGORIES = ["Cardio", "Styrke", "Kampsport", "Holdsport", "Vand & Natur", "Racket", "Wellness"];

const CATEGORY_ICONS: Record<string, string> = {
  Cardio: "🏃", Styrke: "💪", Kampsport: "🥊", Holdsport: "⚽",
  "Vand & Natur": "🌊", Racket: "🎾", Wellness: "🧘",
};

const INTENSITY = [
  { id: "low",      label: "Let",       multi: 0.8, color: "#4ade80" },
  { id: "moderate", label: "Moderat",   multi: 1.0, color: "#facc15" },
  { id: "hard",     label: "Intenst",   multi: 1.2, color: "#fb923c" },
  { id: "max",      label: "Maksimalt", multi: 1.5, color: "#f87171" },
];

const EQUIVALENTS = [
  { label: "Æbler (52 kcal)",          kcalPer: 52,  icon: "🍎" },
  { label: "Skiver brød (70 kcal)",    kcalPer: 70,  icon: "🍞" },
  { label: "Cola (33 cl, 139 kcal)",   kcalPer: 139, icon: "🥤" },
  { label: "Chokoladebarer (250 kcal)", kcalPer: 250, icon: "🍫" },
];

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  useEffect(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    const start = performance.now();
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * ease));
      if (t < 1) frame.current = requestAnimationFrame(step);
    }
    frame.current = requestAnimationFrame(step);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [target, duration]);
  return value;
}

export default function KalorierForbrændtTab() {
  const [cat, setCat]             = useState("Cardio");
  const [actId, setActId]         = useState("jog");
  const [weight, setWeight]       = useState(75);
  const [duration, setDuration]   = useState(30);
  const [intensity, setIntensity] = useState("moderate");

  const activity = ACTIVITIES.find(a => a.id === actId) ?? ACTIVITIES.find(a => a.category === cat) ?? ACTIVITIES[2];
  const intMeta  = INTENSITY.find(i => i.id === intensity) ?? INTENSITY[1];
  const kcal     = Math.round(activity.met * weight * (duration / 60) * intMeta.multi);
  const displayed = useCountUp(kcal, 600);

  const ringPct        = Math.min(kcal / 2000, 1);
  const r              = 54;
  const circumference  = 2 * Math.PI * r;
  const ringColor      = kcal < 200 ? "#4ade80" : kcal < 500 ? "#facc15" : kcal < 800 ? "#fb923c" : "#f87171";

  function selectCat(c: string) {
    setCat(c);
    const first = ACTIVITIES.find(a => a.category === c);
    if (first) setActId(first.id);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Kalorier-forbrændt</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Vælg aktivitet, varighed og intensitet — se præcis kalorieforbrænding.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Category tabs */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Aktivitet</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => selectCat(c)} style={{
                    fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 99, cursor: "pointer",
                    background: cat === c ? "linear-gradient(144deg,#AF40FF,#5B42F3)" : "rgba(255,255,255,0.05)",
                    color: cat === c ? "#fff" : "var(--text-3)",
                    border: cat === c ? "none" : "1.5px solid rgba(255,255,255,0.08)",
                  }}>{CATEGORY_ICONS[c]} {c}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 7 }}>
                {ACTIVITIES.filter(a => a.category === cat).map(a => (
                  <button key={a.id} onClick={() => setActId(a.id)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    padding: "10px 8px", borderRadius: 12, cursor: "pointer",
                    background: actId === a.id ? "rgba(91,66,243,0.18)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${actId === a.id ? "rgba(91,66,243,0.5)" : "rgba(255,255,255,0.07)"}`,
                    color: actId === a.id ? "#a78bfa" : "var(--text-2)",
                  }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
                    <span style={{ fontSize: 9, color: "var(--text-3)" }}>MET {a.met}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weight + duration */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Vægt</p>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "var(--text)" }}>{weight} kg</span>
                  </div>
                  <input type="range" min={40} max={150} step={1} value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#5B42F3" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>40 kg</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>150 kg</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Varighed</p>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "var(--text)" }}>{duration} min</span>
                  </div>
                  <input type="range" min={5} max={180} step={5} value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#5B42F3" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>5 min</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>3 timer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Intensitet</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {INTENSITY.map(lv => (
                  <button key={lv.id} onClick={() => setIntensity(lv.id)} style={{
                    padding: "10px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                    background: intensity === lv.id ? `${lv.color}20` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${intensity === lv.id ? lv.color : "rgba(255,255,255,0.07)"}`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: lv.color, margin: "0 auto 5px" }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: intensity === lv.id ? lv.color : "var(--text-2)", margin: 0 }}>{lv.label}</p>
                    <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0 }}>×{lv.multi}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div style={{ minWidth: 220 }}>
          <div className="uv-card-1" style={{ position: "sticky", top: 100 }}>
            <div className="uv-card-1-inner" style={{ padding: "24px 20px", textAlign: "center" }}>
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
                  <span style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{displayed}</span>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>kcal</span>
                </div>
              </div>

              <p style={{ fontSize: 18, margin: "0 0 2px" }}>{activity.icon}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>{activity.label}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 16px" }}>{duration} min · {weight} kg · {intMeta.label}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <StatRow label="Fedt forbrændt"    value={`≈ ${(kcal / 7700 * 1000).toFixed(0)} gram`} color="#f59e0b" />
                <StatRow label="Forbrændingsrate"  value={`${Math.round(kcal / duration)} kcal/min`}   color="#60a5fa" />
                <StatRow label="af dagsbehov (2000)" value={`${Math.round(kcal / 2000 * 100)}%`}       color={ringColor} />
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Svarer til</p>
                {EQUIVALENTS.map(eq => {
                  const n = Math.round(kcal / eq.kcalPer * 10) / 10;
                  return (
                    <div key={eq.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-2)" }}>{eq.icon} {eq.label.split(" (")[0]}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>× {n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
