"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const card = { padding: "20px 22px" } as const;

// ════════════════════════════════════════════════════════════════════════════
// 1. PASSWORD STRENGTH CHECKER
// ════════════════════════════════════════════════════════════════════════════

function formatCrackTime(seconds: number): string {
  if (seconds < 1)          return "Under 1 sekund";
  if (seconds < 60)         return `${Math.round(seconds)} sekunder`;
  if (seconds < 3600)       return `${Math.round(seconds / 60)} minutter`;
  if (seconds < 86400)      return `${Math.round(seconds / 3600)} timer`;
  if (seconds < 2592000)    return `${Math.round(seconds / 86400)} dage`;
  if (seconds < 31536000)   return `${Math.round(seconds / 2592000)} måneder`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} år`;
  return `${(seconds / 3153600000).toExponential(1)} århundreder`;
}

function analyzePassword(pw: string) {
  const hasLower   = /[a-z]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  const hasDigit   = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  let charspace = 0;
  if (hasLower)   charspace += 26;
  if (hasUpper)   charspace += 26;
  if (hasDigit)   charspace += 10;
  if (hasSpecial) charspace += 32;
  if (charspace === 0) charspace = 26;
  const entropy      = pw.length * Math.log2(charspace);
  const crackSeconds = Math.pow(2, entropy) / 1e10;
  let strengthLabel: string; let color: string; let score: number;
  if (entropy < 28)      { strengthLabel = "Meget svagt";  color = "#ef4444"; score = 12; }
  else if (entropy < 40) { strengthLabel = "Svagt";         color = "#f97316"; score = 30; }
  else if (entropy < 60) { strengthLabel = "Acceptabelt";   color = "#facc15"; score = 55; }
  else if (entropy < 90) { strengthLabel = "Stærkt";        color = "#a3e635"; score = 78; }
  else                   { strengthLabel = "Meget stærkt";  color = "#00DDEB"; score = 100; }
  const checks = [
    { label: "Mindst 8 tegn",         ok: pw.length >= 8 },
    { label: "Mindst 12 tegn",        ok: pw.length >= 12 },
    { label: "Store bogstaver (A–Z)", ok: hasUpper },
    { label: "Små bogstaver (a–z)",   ok: hasLower },
    { label: "Tal (0–9)",             ok: hasDigit },
    { label: "Specialtegn (!@#...)",  ok: hasSpecial },
  ];
  return { entropy, crackSeconds, strengthLabel, color, score, checks };
}

function PasswordChecker() {
  const [pw, setPw]   = useState("");
  const [show, setShow] = useState(false);
  const info = useMemo(() => pw ? analyzePassword(pw) : null, [pw]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Indtast et password..."
            className="uv-input"
            style={{ width: "100%", fontSize: 16, fontFamily: "monospace", boxSizing: "border-box" }}
          />
        </div>
        <button onClick={() => setShow(s => !s)} style={{
          padding: "8px 14px", borderRadius: 10, cursor: "pointer", flexShrink: 0,
          background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)",
          color: "var(--text-2)", fontSize: 18,
        }}>{show ? "🙈" : "👁️"}</button>
      </div>

      {info && (
        <>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>Styrke</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: info.color }}>{info.strengthLabel}</span>
            </div>
            <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${info.score}%`, background: `linear-gradient(90deg, ${info.color}99, ${info.color})`, transition: "width 0.4s ease" }} />
            </div>
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 12, background: `${info.color}10`, border: `1.5px solid ${info.color}30` }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Estimeret tid at cracke (offline GPU-angreb)
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: info.color, margin: 0 }}>{formatCrackTime(info.crackSeconds)}</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: "4px 0 0" }}>~{info.entropy.toFixed(0)} bits entropi · {pw.length} tegn</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {info.checks.map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: c.ok ? "rgba(163,230,53,0.07)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${c.ok ? "rgba(163,230,53,0.25)" : "rgba(255,255,255,0.07)"}` }}>
                <span style={{ fontSize: 14 }}>{c.ok ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 12, color: c.ok ? "#a3e635" : "var(--text-3)", fontWeight: c.ok ? 600 : 400 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {!pw && <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, textAlign: "center", padding: "12px 0" }}>Skriv et password for at se styrken</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. DATA → CHART
// ════════════════════════════════════════════════════════════════════════════

type ChartType = "bar" | "line" | "area";

function parseValues(raw: string): { name: string; value: number }[] | null {
  const lines = raw.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 1) return null;
  const result: { name: string; value: number }[] = [];
  for (const line of lines) {
    const parts = line.split(/[,;\t]|  +/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 1) {
      const v = parseFloat(parts[0].replace(",", "."));
      if (!isNaN(v)) result.push({ name: `${result.length + 1}`, value: v });
    } else {
      const v = parseFloat(parts[parts.length - 1].replace(",", "."));
      if (!isNaN(v)) result.push({ name: parts[0], value: v });
    }
  }
  return result.length >= 1 ? result : null;
}

function isLabelList(raw: string): boolean {
  const lines = raw.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
  return lines.length > 0 && lines.every(l => isNaN(parseFloat(l.replace(",", "."))));
}

function parseLabels(raw: string): string[] {
  return raw.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
}

const TOOLTIP_STYLE = { background: "#ffffff", border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 10, color: "#1c1917" };
const AXIS_TICK   = { fill: "#a8a29e", fontSize: 12 };
const GRID_STROKE = "rgba(255,255,255,0.06)";

function DataChart() {
  const [raw1, setRaw1]         = useState("");
  const [raw2, setRaw2]         = useState("");
  const [label1, setLabel1]     = useState("Dataset A");
  const [label2, setLabel2]     = useState("Dataset B");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [submitted, setSubmitted] = useState(false);

  const EXAMPLE1        = "Jan,12000\nFeb,18500\nMar,15200\nApr,21000\nMaj,19800\nJun,24600";
  const EXAMPLE2_LABELS = "Januar\nFebruar\nMarts\nApril\nMaj\nJuni";

  const parsed1      = useMemo(() => submitted ? parseValues(raw1) : null, [raw1, submitted]);
  const raw2IsLabels = submitted && raw2.trim() !== "" && isLabelList(raw2);
  const labels2      = useMemo(() => submitted && raw2IsLabels ? parseLabels(raw2) : null, [raw2, raw2IsLabels, submitted]);
  const parsed2      = useMemo(() => submitted && !raw2IsLabels ? parseValues(raw2) : null, [raw2, raw2IsLabels, submitted]);

  const chartData = useMemo(() => {
    if (!submitted) return null;
    const lA = label1 || "A";
    const lB = label2 || "B";
    if (parsed1 && labels2) return parsed1.map((d, i) => ({ name: labels2[i] ?? d.name, [lA]: d.value }));
    if (parsed1 && parsed2) {
      const len = Math.max(parsed1.length, parsed2.length);
      return Array.from({ length: len }, (_, i) => ({
        name: parsed1[i]?.name ?? parsed2[i]?.name ?? `${i + 1}`,
        [lA]: parsed1[i]?.value ?? null,
        [lB]: parsed2[i]?.value ?? null,
      }));
    }
    if (parsed1) return parsed1.map(d => ({ name: d.name, [lA]: d.value }));
    if (parsed2) return parsed2.map(d => ({ name: d.name, [lB]: d.value }));
    return null;
  }, [parsed1, parsed2, labels2, label1, label2, submitted]);

  const hasBoth = !!(parsed1 && parsed2 && !raw2IsLabels);
  const lA = label1 || "A";
  const lB = label2 || "B";
  const types: { id: ChartType; label: string; icon: string }[] = [
    { id: "bar", label: "Søjler", icon: "📊" },
    { id: "line", label: "Linje", icon: "📈" },
    { id: "area", label: "Areal", icon: "🌊" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { raw: raw1, setRaw: setRaw1, label: label1, setLabel: setLabel1, example: EXAMPLE1,        placeholder: "Indsæt tal:\n1200\n4000\n500\n\nEller: Label,Værdi\nJan,12000",              color: "#a78bfa", num: "A", badge: null as string | null },
          { raw: raw2, setRaw: setRaw2, label: label2, setLabel: setLabel2, example: EXAMPLE2_LABELS, placeholder: "Indsæt X-akse navne (tekst):\nJanuar\nFebruar\n\nEller 2. datasæt:\n9000",  color: "#00DDEB", num: "B", badge: raw2IsLabels ? "X-akse" : (raw2.trim() ? "Datasæt" : null) },
        ].map(ds => (
          <div key={ds.num} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: ds.color, flexShrink: 0 }} />
              <input value={ds.label} onChange={e => { ds.setLabel(e.target.value); setSubmitted(false); }}
                placeholder={ds.num === "A" ? "Navn på data" : "Navn på X-akse eller 2. datasæt"}
                className="uv-input" style={{ flex: 1, fontSize: 13, fontWeight: 600 }} />
              {ds.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, flexShrink: 0,
                  background: ds.badge === "X-akse" ? "rgba(0,221,235,0.15)" : "rgba(167,139,250,0.15)",
                  color: ds.badge === "X-akse" ? "#00DDEB" : "#a78bfa",
                  border: `1px solid ${ds.badge === "X-akse" ? "rgba(0,221,235,0.3)" : "rgba(167,139,250,0.3)"}`,
                }}>{ds.badge}</span>
              )}
            </div>
            <textarea value={ds.raw} onChange={e => { ds.setRaw(e.target.value); setSubmitted(false); }}
              placeholder={ds.placeholder} className="uv-input" rows={7}
              style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }} />
            {!ds.raw && (
              <button onClick={() => { ds.setRaw(ds.example); setSubmitted(false); }}
                style={{ alignSelf: "flex-start", padding: "4px 12px", borderRadius: 99, cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", color: "var(--text-3)", fontSize: 11 }}>
                💡 Eksempel
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {types.map(t => (
            <button key={t.id} onClick={() => setChartType(t.id)} style={{
              padding: "6px 14px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: chartType === t.id ? "rgba(91,66,243,0.25)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${chartType === t.id ? "rgba(91,66,243,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: chartType === t.id ? "#a78bfa" : "var(--text-2)",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
        <button onClick={() => setSubmitted(true)} disabled={!raw1.trim() && !raw2.trim()} className="uv-btn" style={{ marginLeft: "auto", flexShrink: 0 }}>
          <span className="uv-btn-text"><span>📊 Lav graf</span></span>
        </button>
      </div>

      {submitted && !chartData && (
        <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
          Kunne ikke læse dataen. Brug formatet: <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: 4 }}>Label,Værdi</code> én per linje.
        </p>
      )}

      {chartData && (
        <>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#a78bfa" }} />
              <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{lA}</span>
            </div>
            {hasBoth && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#00DDEB" }} />
                <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{lB}</span>
              </div>
            )}
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="bG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#5B42F3" /></linearGradient>
                    <linearGradient id="bG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00DDEB" /><stop offset="100%" stopColor="#0891b2" /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey={lA} fill="url(#bG1)" radius={[5,5,0,0]} />
                  {hasBoth && <Bar dataKey={lB} fill="url(#bG2)" radius={[5,5,0,0]} />}
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line dataKey={lA} stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: "#5B42F3", r: 4 }} activeDot={{ r: 6 }} />
                  {hasBoth && <Line dataKey={lB} stroke="#00DDEB" strokeWidth={2.5} dot={{ fill: "#0891b2", r: 4 }} activeDot={{ r: 6 }} />}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="aG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} /><stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} /></linearGradient>
                    <linearGradient id="aG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00DDEB" stopOpacity={0.35} /><stop offset="100%" stopColor="#00DDEB" stopOpacity={0.02} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area dataKey={lA} stroke="#a78bfa" strokeWidth={2.5} fill="url(#aG1)" />
                  {hasBoth && <Area dataKey={lB} stroke="#00DDEB" strokeWidth={2.5} fill="url(#aG2)" />}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN TAB
// ════════════════════════════════════════════════════════════════════════════

type ToolId = "password" | "chart";

const TOOLS: { id: ToolId; label: string; icon: string; description: string }[] = [
  { id: "password", label: "Password-styrke", icon: "🔐", description: "Tjek dit password" },
  { id: "chart",    label: "Data → Graf",      icon: "📊", description: "Indsæt data, få en graf" },
];

export default function ToolsTab() {
  const [active, setActive] = useState<ToolId>("password");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Værktøjer</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Hurtige hverdagstools</p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, cursor: "pointer",
            background: active === t.id ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${active === t.id ? "rgba(91,66,243,0.5)" : "rgba(255,255,255,0.08)"}`,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: active === t.id ? "#a78bfa" : "#1c1917", margin: 0 }}>{t.label}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{t.description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={card}>
          {active === "password" && <PasswordChecker />}
          {active === "chart"    && <DataChart />}
        </div>
      </div>
    </div>
  );
}
