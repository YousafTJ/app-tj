"use client";

import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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
  const [pw, setPw]     = useState("");
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
// 2. FILE → CHART (Excel / CSV / Sheets upload)
// ════════════════════════════════════════════════════════════════════════════

type ChartType = "bar" | "line" | "area";
type ParsedSheet = { headers: string[]; rows: Record<string, string | number>[] };

const COLORS = ["#a78bfa", "#00DDEB", "#f59e0b", "#34d399", "#f87171", "#60a5fa", "#fb923c", "#4ade80"];
const TOOLTIP_STYLE = { background: "#ffffff", border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 10, color: "#1c1917", fontSize: 12 };
const AXIS_TICK     = { fill: "#a8a29e", fontSize: 11 };

function parseFile(file: File): Promise<ParsedSheet[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb   = XLSX.read(data, { type: "binary" });
        const sheets: ParsedSheet[] = wb.SheetNames.map(name => {
          const ws  = wb.Sheets[name];
          const raw = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, { defval: "" });
          if (raw.length === 0) return { headers: [], rows: [] };
          const headers = Object.keys(raw[0]);
          return { headers, rows: raw };
        });
        resolve(sheets);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

function isNumericCol(rows: Record<string, string | number>[], col: string): boolean {
  return rows.every(r => r[col] === "" || !isNaN(Number(r[col])));
}

function FileChart() {
  const inputRef                   = useRef<HTMLInputElement>(null);
  const [sheets, setSheets]        = useState<ParsedSheet[]>([]);
  const [sheetIdx, setSheetIdx]    = useState(0);
  const [labelCol, setLabelCol]    = useState<string>("");
  const [valueCols, setValueCols]  = useState<string[]>([]);
  const [chartType, setChartType]  = useState<ChartType>("bar");
  const [fileName, setFileName]    = useState<string>("");
  const [error, setError]          = useState<string>("");
  const [loading, setLoading]      = useState(false);

  const sheet      = sheets[sheetIdx] ?? null;
  const numCols    = sheet ? sheet.headers.filter(h => h !== labelCol && isNumericCol(sheet.rows, h)) : [];
  const chartData  = useMemo(() => {
    if (!sheet || !labelCol) return null;
    return sheet.rows.map(r => {
      const point: Record<string, string | number> = { name: String(r[labelCol]) };
      valueCols.forEach(col => { point[col] = Number(r[col]) || 0; });
      return point;
    });
  }, [sheet, labelCol, valueCols]);

  async function handleFile(f: File) {
    setError(""); setLoading(true);
    try {
      const parsed = await parseFile(f);
      setSheets(parsed);
      setFileName(f.name);
      setSheetIdx(0);
      const firstSheet = parsed[0];
      if (firstSheet && firstSheet.headers.length > 0) {
        const labelGuess  = firstSheet.headers[0];
        const numericCols = firstSheet.headers.filter(h => h !== labelGuess && isNumericCol(firstSheet.rows, h));
        setLabelCol(labelGuess);
        setValueCols(numericCols.slice(0, 3));
      }
    } catch {
      setError("Kunne ikke læse filen. Prøv at gemme som .xlsx eller .csv og upload igen.");
    }
    setLoading(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function toggleValueCol(col: string) {
    setValueCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  }

  const types: { id: ChartType; icon: string; label: string }[] = [
    { id: "bar",  icon: "📊", label: "Søjler" },
    { id: "line", icon: "📈", label: "Linje"  },
    { id: "area", icon: "🌊", label: "Areal"  },
  ];

  // ── Upload drop zone ──────────────────────────────────────────────────────
  if (sheets.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2.5px dashed #e8e5e1", borderRadius: 16, padding: "52px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            cursor: "pointer", textAlign: "center", transition: "border-color 0.15s",
            background: "#fafaf9",
          }}
        >
          <span style={{ fontSize: 44 }}>📂</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", margin: "0 0 6px" }}>Upload Excel, CSV eller Sheets-fil</p>
            <p style={{ fontSize: 13, color: "#78716c", margin: 0 }}>Træk og slip her, eller klik for at vælge</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {[".xlsx", ".xls", ".csv", ".ods"].map(ext => (
              <span key={ext} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(167,139,250,0.12)", color: "#7c3aed", border: "1px solid rgba(167,139,250,0.3)" }}>{ext}</span>
            ))}
          </div>
          {loading && <p style={{ fontSize: 13, color: "#a8a29e", margin: 0 }}>Indlæser…</p>}
          {error  && <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>}
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.ods" onChange={onInput} style={{ display: "none" }} />
        <p style={{ fontSize: 12, color: "#a8a29e", margin: 0, textAlign: "center" }}>
          Tip: Eksporter Google Sheets som .xlsx eller .csv fra Filer → Download
        </p>
      </div>
    );
  }

  // ── Config + chart ────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* File info + reset */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(167,139,250,0.08)", border: "1.5px solid rgba(167,139,250,0.25)" }}>
        <span style={{ fontSize: 20 }}>📄</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</p>
          <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>{sheet?.rows.length ?? 0} rækker · {sheet?.headers.length ?? 0} kolonner</p>
        </div>
        <button onClick={() => { setSheets([]); setFileName(""); setError(""); setValueCols([]); setLabelCol(""); }}
          style={{ padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, background: "#ffffff", border: "1.5px solid #e8e5e1", color: "#78716c", flexShrink: 0 }}>
          ✕ Skift fil
        </button>
      </div>

      {/* Sheet selector (if multiple) */}
      {sheets.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sheets.map((_, i) => (
            <button key={i} onClick={() => { setSheetIdx(i); }} style={{
              padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: sheetIdx === i ? 700 : 400,
              background: sheetIdx === i ? "rgba(167,139,250,0.15)" : "#ffffff",
              border: `1.5px solid ${sheetIdx === i ? "rgba(167,139,250,0.5)" : "#e8e5e1"}`,
              color: sheetIdx === i ? "#7c3aed" : "#57534e",
            }}>Ark {i + 1}</button>
          ))}
        </div>
      )}

      {/* Column config */}
      {sheet && sheet.headers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Label column */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#57534e", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>X-akse (label)</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {sheet.headers.map(h => (
                <button key={h} onClick={() => { setLabelCol(h); setValueCols(numCols.filter(c => c !== h).slice(0, 3)); }} style={{
                  padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: labelCol === h ? 700 : 400,
                  background: labelCol === h ? "rgba(251,191,36,0.15)" : "#ffffff",
                  border: `1.5px solid ${labelCol === h ? "rgba(251,191,36,0.6)" : "#e8e5e1"}`,
                  color: labelCol === h ? "#92400e" : "#57534e",
                }}>{h}</button>
              ))}
            </div>
          </div>
          {/* Value columns */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#57534e", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Værdier (Y-akse)</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {numCols.map((h, i) => {
                const active = valueCols.includes(h);
                const col    = COLORS[i % COLORS.length];
                return (
                  <button key={h} onClick={() => toggleValueCol(h)} style={{
                    padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 400,
                    background: active ? `${col}18` : "#ffffff",
                    border: `1.5px solid ${active ? col + "88" : "#e8e5e1"}`,
                    color: active ? col : "#57534e",
                  }}>{h}</button>
                );
              })}
              {numCols.length === 0 && <p style={{ fontSize: 12, color: "#a8a29e", margin: 0 }}>Ingen numeriske kolonner fundet</p>}
            </div>
          </div>
        </div>
      )}

      {/* Chart type + render */}
      {chartData && valueCols.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            {types.map(t => (
              <button key={t.id} onClick={() => setChartType(t.id)} style={{
                padding: "6px 14px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: chartType === t.id ? "rgba(167,139,250,0.18)" : "#ffffff",
                border: `1.5px solid ${chartType === t.id ? "rgba(167,139,250,0.55)" : "#e8e5e1"}`,
                color: chartType === t.id ? "#7c3aed" : "#57534e",
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
          <div style={{ height: 340, borderRadius: 12, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                  {valueCols.map((col, i) => (
                    <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[5,5,0,0]} />
                  ))}
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                  {valueCols.map((col, i) => (
                    <Line key={col} dataKey={col} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                  {valueCols.map((col, i) => (
                    <Area key={col} dataKey={col} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
                      fill={COLORS[i % COLORS.length]} fillOpacity={0.12} />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}

      {chartData && valueCols.length === 0 && (
        <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>Vælg mindst én numerisk kolonne som Y-akse</p>
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
  { id: "chart",    label: "Fil → Graf",       icon: "📊", description: "Upload Excel/CSV og få grafer" },
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
          {active === "chart"    && <FileChart />}
        </div>
      </div>
    </div>
  );
}
