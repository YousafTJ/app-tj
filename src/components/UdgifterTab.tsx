"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Printer, FileText, Tag, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

type Category = "Bolig" | "Mad & Drikke" | "Transport" | "Underholdning" | "Sundhed" | "Abonnementer" | "Tøj" | "Andet";

const CATEGORIES: { name: Category; color: string; bg: string; emoji: string }[] = [
  { name: "Bolig",          color: "#3b82f6", bg: "rgba(59,130,246,0.15)",  emoji: "🏠" },
  { name: "Mad & Drikke",   color: "#22c55e", bg: "rgba(34,197,94,0.15)",   emoji: "🍽️" },
  { name: "Transport",      color: "#f97316", bg: "rgba(249,115,22,0.15)",  emoji: "🚗" },
  { name: "Underholdning",  color: "#a855f7", bg: "rgba(168,85,247,0.15)",  emoji: "🎮" },
  { name: "Sundhed",        color: "#ef4444", bg: "rgba(239,68,68,0.15)",   emoji: "❤️" },
  { name: "Abonnementer",   color: "#06b6d4", bg: "rgba(6,182,212,0.15)",   emoji: "📱" },
  { name: "Tøj",            color: "#ec4899", bg: "rgba(236,72,153,0.15)",  emoji: "👗" },
  { name: "Andet",          color: "#a8a29e", bg: "rgba(168,162,158,0.15)", emoji: "📦" },
];

type Expense = {
  id: string;
  name: string;
  price: number;
  category: Category;
  note: string;
};

function getCat(name: Category) {
  return CATEGORIES.find(c => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}

// ─── Spild-kalkulator ────────────────────────────────────────────────────────

const SPILD_PRESETS = [
  { label: "Kaffe ☕", daily: 40 },
  { label: "Takeout 🍔", daily: 120 },
  { label: "Cigaretter 🚬", daily: 60 },
  { label: "Snacks 🍫", daily: 25 },
  { label: "Energidrik ⚡", daily: 30 },
];

function SpildKalkulator() {
  const [items, setItems] = useState<{ label: string; amount: string; freq: "daily" | "weekly" | "monthly" }[]>([
    { label: "Kaffe ☕", amount: "40", freq: "daily" },
    { label: "Takeout 🍔", amount: "120", freq: "weekly" },
  ]);

  function toYearly(amount: number, freq: string) {
    if (freq === "daily") return amount * 365;
    if (freq === "weekly") return amount * 52;
    return amount * 12;
  }

  function addItem(preset?: { label: string; daily: number }) {
    setItems(prev => [...prev, {
      label: preset?.label ?? "",
      amount: preset ? String(preset.daily) : "",
      freq: "daily",
    }]);
  }

  function update(i: number, field: "label" | "amount" | "freq", val: string) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function remove(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  const totalYearly = items.reduce((sum, item) => {
    const n = parseFloat(item.amount.replace(",", ".")) || 0;
    return sum + toYearly(n, item.freq);
  }, 0);

  function fmt(n: number) {
    return n.toLocaleString("da-DK", { maximumFractionDigits: 0 }) + " kr.";
  }

  const freqLabel = { daily: "/ dag", weekly: "/ uge", monthly: "/ mdr." };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Presets */}
      <div>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontWeight: 500 }}>Hurtig tilføj</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SPILD_PRESETS.map(p => (
            <button key={p.label} onClick={() => addItem(p)} style={{
              fontSize: 12, padding: "5px 12px", borderRadius: 20,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-2)", cursor: "pointer",
            }}>{p.label}</button>
          ))}
          <button onClick={() => addItem()} style={{
            fontSize: 12, padding: "5px 12px", borderRadius: 20,
            border: "1px dashed var(--border)", background: "transparent",
            color: "var(--text-3)", cursor: "pointer",
          }}>+ Tilpasset</button>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px auto", gap: 8, alignItems: "center" }}>
            <input
              value={item.label}
              onChange={e => update(i, "label", e.target.value)}
              placeholder="Beskrivelse"
              className="uv-input"
              style={{ fontSize: 13 }}
            />
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={item.amount}
                onChange={e => update(i, "amount", e.target.value)}
                placeholder="0"
                className="uv-input"
                style={{ fontSize: 13, paddingRight: 32 }}
              />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--text-3)", pointerEvents: "none" }}>kr.</span>
            </div>
            <select
              value={item.freq}
              onChange={e => update(i, "freq", e.target.value as "daily" | "weekly" | "monthly")}
              className="uv-input"
              style={{ fontSize: 13 }}
            >
              <option value="daily">Per dag</option>
              <option value="weekly">Per uge</option>
              <option value="monthly">Per mdr.</option>
            </select>
            <button onClick={() => remove(i)} style={{
              background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6,
              width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Trash2 style={{ width: 13, height: 13, color: "#f87171" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Result */}
      {items.length > 0 && totalYearly > 0 && (
        <div style={{
          padding: "20px 24px", borderRadius: 14,
          background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)",
        }}>
          <p style={{ fontSize: 12, color: "#f87171", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>Du spilder om året</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: "#1c1917", margin: "0 0 12px" }}>{fmt(totalYearly)}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {items.map((item, i) => {
              const n = parseFloat(item.amount.replace(",", ".")) || 0;
              const yearly = toYearly(n, item.freq);
              if (!yearly) return null;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--text-3)" }}>{item.label || "Uden navn"} ({item.amount} kr. {freqLabel[item.freq]})</span>
                  <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>{fmt(yearly)} / år</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aktie-vurdering ─────────────────────────────────────────────────────────

interface StockData {
  symbol: string; name: string; sector: string; industry: string;
  pe: number | null; peg: number | null; eps: number | null;
  week52High: number | null; week52Low: number | null;
  dividendYield: number | null; sectorPe: number | null;
}

function peLabel(pe: number | null, sectorPe: number | null): { text: string; color: string; desc: string } {
  if (!pe) return { text: "N/A", color: "#a8a29e", desc: "Ingen data" };
  if (!sectorPe) return { text: "—", color: "#a8a29e", desc: "Ingen sektordata" };
  const ratio = pe / sectorPe;
  if (ratio < 0.8) return { text: "Billig", color: "#a3e635", desc: `P/E ${pe.toFixed(1)} er ${Math.round((1 - ratio) * 100)}% under sektorgennemsnit` };
  if (ratio < 1.1) return { text: "Fair", color: "#facc15", desc: `P/E ${pe.toFixed(1)} er tæt på sektorgennemsnit (${sectorPe})` };
  if (ratio < 1.5) return { text: "Dyr", color: "#fb923c", desc: `P/E ${pe.toFixed(1)} er ${Math.round((ratio - 1) * 100)}% over sektorgennemsnit` };
  return { text: "Meget dyr", color: "#f87171", desc: `P/E ${pe.toFixed(1)} er ${Math.round((ratio - 1) * 100)}% over sektorgennemsnit` };
}

function AktieVurdering() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StockData | null>(null);
  const [error, setError] = useState("");

  async function lookup() {
    const s = symbol.trim().toUpperCase();
    if (!s) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`/api/stock?symbol=${s}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Fejl");
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const verdict = data ? peLabel(data.pe, data.sectorPe) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
        Indtast et aktiesymbol (fx <b style={{ color: "var(--text-2)" }}>AAPL</b>, <b style={{ color: "var(--text-2)" }}>MSFT</b>, <b style={{ color: "var(--text-2)" }}>IBM</b>) og se om aktien er billig eller dyr ift. sektoren.
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && lookup()}
          placeholder="AAPL"
          maxLength={10}
          className="uv-input"
          style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, maxWidth: 160 }}
        />
        <button onClick={lookup} disabled={loading || !symbol.trim()} className="uv-btn">
          <span className="uv-btn-text"><span>{loading ? "Henter..." : "Slå op"}</span></span>
        </button>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>}

      {data && verdict && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#1c1917", margin: 0 }}>{data.symbol}</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>{data.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0" }}>{data.sector} · {data.industry}</p>
            </div>
            {/* Verdict badge */}
            <div style={{
              padding: "10px 20px", borderRadius: 12, textAlign: "center",
              background: `${verdict.color}18`, border: `1.5px solid ${verdict.color}`,
            }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: verdict.color, margin: 0 }}>{verdict.text}</p>
              <p style={{ fontSize: 11, color: verdict.color, margin: "2px 0 0", opacity: 0.8 }}>Vurdering</p>
            </div>
          </div>

          {/* P/E explanation */}
          <div style={{
            padding: "14px 18px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.07)",
          }}>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>{verdict.desc}</p>
          </div>

          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {[
              { label: "P/E ratio", value: data.pe?.toFixed(1) ?? "N/A", color: verdict.color },
              { label: "Sektor P/E", value: data.sectorPe?.toFixed(0) ?? "N/A", color: "#a8a29e" },
              { label: "PEG ratio", value: data.peg?.toFixed(2) ?? "N/A", color: "#a8a29e" },
              { label: "EPS", value: data.eps != null ? `$${data.eps.toFixed(2)}` : "N/A", color: "#a8a29e" },
              { label: "52w High", value: data.week52High != null ? `$${data.week52High}` : "N/A", color: "#a3e635" },
              { label: "52w Low", value: data.week52Low != null ? `$${data.week52Low}` : "N/A", color: "#f87171" },
              { label: "Udbytte", value: data.dividendYield != null ? `${(data.dividendYield * 100).toFixed(2)}%` : "Ingen", color: "#facc15" },
            ].map(m => (
              <div key={m.label} className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: m.color, margin: 0 }}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
            Data fra Alpha Vantage · Kun til vejledning, ikke investeringsrådgivning
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Budget Planner ──────────────────────────────────────────────────────────

type BudgetItem = { id: string; label: string; amount: string; };

const INCOME_PRESETS  = ["Løn", "Freelance", "Studiestøtte", "Udlejning", "Side hustle"];
const EXPENSE_PRESETS = ["Husleje", "Mad", "Transport", "Forsikringer", "El & vand", "Telefon"];

function mkItem(label = "", amount = ""): BudgetItem {
  return { id: Date.now().toString() + Math.random(), label, amount };
}

function BudgetPlanner() {
  const [incomes,  setIncomes]  = useState<BudgetItem[]>([mkItem("Løn", "30000")]);
  const [expenses, setExpenses] = useState<BudgetItem[]>([mkItem("Husleje", "8500"), mkItem("Mad", "2500")]);

  function addItem(setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>, label = "") {
    setter(prev => [...prev, mkItem(label)]);
  }
  function updateItem(setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>, id: string, field: "label" | "amount", val: string) {
    setter(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  }
  function removeItem(setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>, id: string) {
    setter(prev => prev.filter(i => i.id !== id));
  }

  const toNum = (s: string) => Math.max(0, parseFloat(s.replace(",", ".")) || 0);
  const totalIncome  = incomes.reduce((s, i) => s + toNum(i.amount), 0);
  const totalExpense = expenses.reduce((s, i) => s + toNum(i.amount), 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  function fmt(n: number) {
    return n.toLocaleString("da-DK", { maximumFractionDigits: 0 }) + " kr.";
  }

  // Bar chart data — per category
  const chartData = [
    ...incomes.filter(i => toNum(i.amount) > 0).map(i => ({ name: i.label || "Indtægt", value: toNum(i.amount), type: "income" })),
    ...expenses.filter(i => toNum(i.amount) > 0).map(i => ({ name: i.label || "Udgift", value: -toNum(i.amount), type: "expense" })),
  ];

  function ItemList({
    items, setter, color, presets,
  }: {
    items: BudgetItem[];
    setter: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
    color: string;
    presets: string[];
  }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 130px auto", gap: 8, alignItems: "center" }}>
            <input
              value={item.label}
              onChange={e => updateItem(setter, item.id, "label", e.target.value)}
              placeholder="Beskrivelse"
              className="uv-input"
              style={{ fontSize: 13 }}
            />
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={item.amount}
                onChange={e => updateItem(setter, item.id, "amount", e.target.value)}
                placeholder="0"
                className="uv-input"
                style={{ fontSize: 13, paddingRight: 32 }}
              />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--text-3)", pointerEvents: "none" }}>kr.</span>
            </div>
            <button onClick={() => removeItem(setter, item.id)} style={{
              background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6,
              width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X style={{ width: 12, height: 12, color: "#f87171" }} />
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {presets.map(p => (
            <button key={p} onClick={() => addItem(setter, p)} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              border: `1px solid ${color}40`, background: "transparent",
              color, cursor: "pointer",
            }}>{p}</button>
          ))}
          <button onClick={() => addItem(setter)} style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 20,
            border: "1px dashed var(--border)", background: "transparent",
            color: "var(--text-3)", cursor: "pointer",
          }}>+ Tilpasset</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Indtægter */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#a3e635", margin: "0 0 12px" }}>💰 Indtægter</p>
          <ItemList items={incomes} setter={setIncomes} color="#a3e635" presets={INCOME_PRESETS} />
        </div>
        {/* Udgifter */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f87171", margin: "0 0 12px" }}>💸 Udgifter</p>
          <ItemList items={expenses} setter={setExpenses} color="#f87171" presets={EXPENSE_PRESETS} />
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Indtægter", value: fmt(totalIncome), color: "#a3e635" },
          { label: "Udgifter",  value: fmt(totalExpense), color: "#f87171" },
          { label: balance >= 0 ? "Rådighedsbeløb" : "Underskud", value: fmt(Math.abs(balance)), color: balance >= 0 ? "#00DDEB" : "#f87171" },
        ].map(s => (
          <div key={s.label} className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "14px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Savings rate */}
      {totalIncome > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Opsparingsrate</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: savingsRate >= 20 ? "#a3e635" : savingsRate >= 10 ? "#facc15" : "#f87171" }}>
              {savingsRate.toFixed(1)}%
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: savingsRate >= 20 ? "#a3e635" : savingsRate >= 10 ? "#facc15" : "#f87171",
              width: `${Math.max(0, Math.min(100, savingsRate))}%`,
              transition: "width 0.4s",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
            {savingsRate >= 20 ? "🟢 Fremragende — du sparer mere end 20%" : savingsRate >= 10 ? "🟡 Okay — prøv at nå 20%" : savingsRate > 0 ? "🔴 Under 10% — se om du kan skære ned" : "🔴 Underskud — udgifter overstiger indtægter"}
          </p>
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Oversigt</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fill: "#57534e", fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#57534e", fontSize: 11 }} tickFormatter={v => `${Math.abs(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => { const n = Number(v); return [fmt(Math.abs(n)), n > 0 ? "Indtægt" : "Udgift"]; }}
                contentStyle={{ background: "#ffffff", border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 8 }}
                labelStyle={{ color: "#1c1917" }}
              />
              <ReferenceLine y={0} stroke="#3d3a36" />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.type === "income" ? "#a3e635" : "#f87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Abonnement-tracker ───────────────────────────────────────────────────────

type BillingCycle = "monthly" | "yearly" | "weekly";

interface Sub {
  id: string;
  name: string;
  amount: string;
  cycle: BillingCycle;
  color: string;
  category: string;
}

const SUB_COLORS = ["#AF40FF", "#5B42F3", "#00DDEB", "#f59e0b", "#10b981", "#f43f5e", "#3b82f6", "#e879f9"];

const SUB_PRESETS: Omit<Sub, "id">[] = [
  { name: "Netflix",    amount: "149",  cycle: "monthly", color: "#f43f5e", category: "Streaming" },
  { name: "Spotify",   amount: "99",   cycle: "monthly", color: "#10b981", category: "Musik" },
  { name: "Disney+",   amount: "89",   cycle: "monthly", color: "#3b82f6", category: "Streaming" },
  { name: "HBO Max",   amount: "109",  cycle: "monthly", color: "#AF40FF", category: "Streaming" },
  { name: "iCloud",    amount: "29",   cycle: "monthly", color: "#57534e", category: "Opbevaring" },
  { name: "ChatGPT",   amount: "140",  cycle: "monthly", color: "#10b981", category: "AI" },
  { name: "GitHub",    amount: "0",    cycle: "monthly", color: "#1c1917", category: "Udvikling" },
  { name: "Adobe CC",  amount: "599",  cycle: "monthly", color: "#f43f5e", category: "Kreativt" },
];

function toMonthly(amount: number, cycle: BillingCycle) {
  if (cycle === "weekly")  return amount * 52 / 12;
  if (cycle === "yearly")  return amount / 12;
  return amount;
}

function AbonnementTracker() {
  const [subs, setSubs] = useState<Sub[]>([
    { id: "1", ...SUB_PRESETS[0] },
    { id: "2", ...SUB_PRESETS[1] },
    { id: "3", ...SUB_PRESETS[4] },
  ]);
  const [colorIdx, setColorIdx] = useState(0);

  function addPreset(preset: Omit<Sub, "id">) {
    if (subs.find(s => s.name === preset.name)) return;
    setSubs(prev => [...prev, { id: Date.now().toString(), ...preset }]);
  }

  function addCustom() {
    setSubs(prev => [...prev, {
      id: Date.now().toString(),
      name: "", amount: "", cycle: "monthly",
      color: SUB_COLORS[colorIdx % SUB_COLORS.length],
      category: "Andet",
    }]);
    setColorIdx(c => c + 1);
  }

  function update(id: string, field: keyof Sub, val: string) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  }

  function remove(id: string) {
    setSubs(prev => prev.filter(s => s.id !== id));
  }

  const toNum = (s: string) => Math.max(0, parseFloat(s.replace(",", ".")) || 0);

  const totalMonthly = subs.reduce((sum, s) => sum + toMonthly(toNum(s.amount), s.cycle), 0);
  const totalYearly  = totalMonthly * 12;

  // Group by category
  const byCategory = Object.entries(
    subs.reduce<Record<string, number>>((acc, s) => {
      const cat = s.category || "Andet";
      acc[cat] = (acc[cat] ?? 0) + toMonthly(toNum(s.amount), s.cycle);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  function fmt(n: number) {
    return n.toLocaleString("da-DK", { maximumFractionDigits: 0 }) + " kr.";
  }

  const cycleLabel: Record<BillingCycle, string> = { monthly: "/ mdr.", yearly: "/ år", weekly: "/ uge" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Quick-add presets */}
      <div>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontWeight: 500 }}>Hurtig tilføj</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUB_PRESETS.map(p => {
            const active = !!subs.find(s => s.name === p.name);
            return (
              <button key={p.name} onClick={() => active ? remove(subs.find(s => s.name === p.name)!.id) : addPreset(p)} style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 20,
                border: `1px solid ${active ? p.color : p.color + "40"}`,
                background: active ? p.color + "22" : "transparent",
                color: p.color, cursor: "pointer", fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
              }}>
                {active ? "✓ " : ""}{p.name}
              </button>
            );
          })}
          <button onClick={addCustom} style={{
            fontSize: 12, padding: "5px 12px", borderRadius: 20,
            border: "1px dashed var(--border)", background: "transparent",
            color: "var(--text-3)", cursor: "pointer",
          }}>+ Tilpasset</button>
        </div>
      </div>

      {/* Subscription list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {subs.map(s => (
          <div key={s.id} style={{
            display: "grid", gridTemplateColumns: "16px 1fr 120px 110px auto",
            gap: 8, alignItems: "center",
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <input
              value={s.name}
              onChange={e => update(s.id, "name", e.target.value)}
              placeholder="Navn"
              className="uv-input"
              style={{ fontSize: 13, background: "transparent", border: "none", padding: "4px 0", outline: "none", color: "#1c1917" }}
            />
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={s.amount}
                onChange={e => update(s.id, "amount", e.target.value)}
                placeholder="0"
                className="uv-input"
                style={{ fontSize: 13, paddingRight: 32 }}
              />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--text-3)", pointerEvents: "none" }}>kr.</span>
            </div>
            <select value={s.cycle} onChange={e => update(s.id, "cycle", e.target.value)} className="uv-input" style={{ fontSize: 12 }}>
              <option value="monthly">Månedlig</option>
              <option value="yearly">Årlig</option>
              <option value="weekly">Ugentlig</option>
            </select>
            <button onClick={() => remove(s.id)} style={{
              background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6,
              width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X style={{ width: 12, height: 12, color: "#f87171" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      {subs.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="uv-card-2" style={{ padding: "3px" }}>
              <div style={{ background: "rgba(5,6,45,0.88)", borderRadius: "calc(1rem - 3px)", padding: "16px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#FFCC70", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Per måned</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>{fmt(totalMonthly)}</p>
              </div>
            </div>
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Per år</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: "#f87171", margin: 0 }}>{fmt(totalYearly)}</p>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fordeling ({subs.length} abonnementer)
            </p>
            {byCategory.map(([cat, monthly], i) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{cat}</span>
                  <span style={{ fontSize: 13, color: "#1c1917", fontWeight: 600 }}>
                    {fmt(monthly)} / mdr. · <span style={{ color: "#f87171" }}>{fmt(monthly * 12)} / år</span>
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    background: SUB_COLORS[i % SUB_COLORS.length],
                    width: `${(monthly / totalMonthly) * 100}%`,
                    transition: "width 0.4s",
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Insight */}
          <div style={{
            padding: "14px 18px", borderRadius: 12,
            background: "rgba(91,66,243,0.08)", border: "1.5px solid rgba(91,66,243,0.2)",
          }}>
            <p style={{ fontSize: 13, color: "#a78bfa", margin: 0 }}>
              💡 Du bruger <b>{fmt(totalYearly)}</b> om året på abonnementer — svarende til{" "}
              <b>{Math.round((totalMonthly / 30000) * 100)}%</b> af en gennemsnitsløn.
              {subs.length >= 5 && " Har du husket at tjekke hvilke du faktisk bruger? 🤔"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Udgifter ────────────────────────────────────────────────────────────────

export default function UdgifterTab() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", name: "Husleje",        price: 8500, category: "Bolig",        note: "" },
    { id: "2", name: "Netflix",        price: 149,  category: "Abonnementer", note: "" },
    { id: "3", name: "Dagligvarer",    price: 2200, category: "Mad & Drikke", note: "Ugentlig indkøb" },
    { id: "4", name: "Månedskort DSB", price: 630,  category: "Transport",    note: "" },
  ]);
  const [name, setName]       = useState("");
  const [price, setPrice]     = useState("");
  const [category, setCategory] = useState<Category>("Andet");
  const [note, setNote]       = useState("");
  const [filterCat, setFilterCat] = useState<Category | "Alle">("Alle");
  const [editId, setEditId]   = useState<string | null>(null);
  const titleRef              = useRef<HTMLInputElement>(null);
  const [budgetTitle, setBudgetTitle] = useState("Månedlige udgifter");
  const [budgetMonth, setBudgetMonth] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString("da-DK", { month: "long" })} ${now.getFullYear()}`;
  });

  function addExpense() {
    const p = parseFloat(price.replace(",", "."));
    if (!name.trim() || isNaN(p) || p <= 0) return;

    if (editId) {
      setExpenses(prev => prev.map(e =>
        e.id === editId ? { ...e, name: name.trim(), price: p, category, note } : e
      ));
      setEditId(null);
    } else {
      setExpenses(prev => [...prev, {
        id: Date.now().toString(),
        name: name.trim(), price: p, category, note,
      }]);
    }
    setName(""); setPrice(""); setNote("");
    setCategory("Andet");
  }

  function startEdit(e: Expense) {
    setEditId(e.id);
    setName(e.name);
    setPrice(String(e.price));
    setCategory(e.category);
    setNote(e.note);
    titleRef.current?.focus();
  }

  function cancelEdit() {
    setEditId(null);
    setName(""); setPrice(""); setNote(""); setCategory("Andet");
  }

  function removeExpense(id: string) {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (editId === id) cancelEdit();
  }

  const total = expenses.reduce((s, e) => s + e.price, 0);
  const filtered = filterCat === "Alle" ? expenses : expenses.filter(e => e.category === filterCat);

  // Group by category for summary
  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.name).reduce((s, e) => s + e.price, 0),
    count: expenses.filter(e => e.category === cat.name).length,
  })).filter(c => c.count > 0);

  function fmt(n: number) {
    return n.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kr.";
  }

  function printPDF() {
    const rows = expenses.map(e => {
      const cat = getCat(e.category);
      return `
        <tr>
          <td>${e.name}</td>
          <td>${cat.emoji} ${e.category}</td>
          <td>${e.note || "—"}</td>
          <td class="price">${fmt(e.price)}</td>
        </tr>`;
    }).join("");

    const catRows = byCategory.map(c =>
      `<tr><td>${c.emoji} ${c.name} (${c.count} poster)</td><td class="price">${fmt(c.total)}</td><td class="pct">${((c.total / total) * 100).toFixed(1)}%</td></tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8"/>
  <title>${budgetTitle} — ${budgetMonth}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 40px; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 32px; }
    h2 { font-size: 15px; font-weight: 700; margin: 28px 0 10px; color: #333; border-bottom: 2px solid #111; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    thead tr { background: #f5f5f5; }
    th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    td.price { text-align: right; font-weight: 700; white-space: nowrap; }
    td.pct { text-align: right; color: #888; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    .total-row { background: #111; color: #fff; }
    .total-row td { padding: 12px; font-size: 15px; font-weight: 800; border: none; }
    .total-row td.price { color: #fff; }
    .footer { margin-top: 48px; font-size: 11px; color: #aaa; text-align: center; }
    @media print {
      body { padding: 20px; }
      h2 { break-before: auto; }
    }
  </style>
</head>
<body>
  <h1>${budgetTitle}</h1>
  <p class="subtitle">Periode: ${budgetMonth} &nbsp;·&nbsp; Genereret: ${new Date().toLocaleDateString("da-DK", { day:"2-digit", month:"long", year:"numeric" })}</p>

  <h2>Alle udgifter</h2>
  <table>
    <thead><tr><th>Beskrivelse</th><th>Kategori</th><th>Note</th><th style="text-align:right">Beløb</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">Total</td>
        <td class="price">${fmt(total)}</td>
      </tr>
    </tfoot>
  </table>

  <h2>Oversigt per kategori</h2>
  <table>
    <thead><tr><th>Kategori</th><th style="text-align:right">Beløb</th><th style="text-align:right">Andel</th></tr></thead>
    <tbody>${catRows}</tbody>
  </table>

  <p class="footer">Udskrevet fra TJHUB · tjhub.app</p>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Udgiftsoversigt</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Tilføj og administrér dine udgifter — eksportér som PDF</p>
        </div>
        <button
          onClick={printPDF}
          disabled={expenses.length === 0}
          className="uv-btn"
          style={{ flexShrink: 0 }}
        >
          <Printer style={{ width: 15, height: 15 }} />
          <span className="uv-btn-text"><span>Udskriv PDF</span></span>
        </button>
      </div>

      {/* Budget title + period */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>
                <FileText style={{ width: 11, height: 11, display: "inline", marginRight: 4 }} />
                Titel på oversigten
              </label>
              <input
                type="text"
                value={budgetTitle}
                onChange={e => setBudgetTitle(e.target.value)}
                className="uv-input"
                style={{ fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>
                Periode / måned
              </label>
              <input
                type="text"
                value={budgetMonth}
                onChange={e => setBudgetMonth(e.target.value)}
                className="uv-input"
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px,400px) 1fr", gap: 24, alignItems: "start" }}>
        {/* Add form */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
              <Plus style={{ width: 16, height: 16, color: "#5B42F3" }} />
              {editId ? "Rediger udgift" : "Tilføj udgift"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>
                  Beskrivelse
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addExpense()}
                  placeholder="Fx Husleje, Netflix..."
                  className="uv-input"
                  style={{ fontSize: 13 }}
                />
              </div>

              {/* Price */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>
                  Beløb (kr.)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addExpense()}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    className="uv-input"
                    style={{ fontSize: 13, paddingRight: 42 }}
                  />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-3)", pointerEvents: "none" }}>
                    kr.
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>
                  <Tag style={{ width: 11, height: 11, display: "inline", marginRight: 4 }} />
                  Kategori
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setCategory(c.name)}
                      style={{
                        fontSize: 11, padding: "4px 10px", borderRadius: 20,
                        border: category === c.name ? "none" : `1px solid ${c.color}40`,
                        background: category === c.name ? c.bg : "transparent",
                        color: c.color,
                        cursor: "pointer",
                        fontWeight: category === c.name ? 700 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {c.emoji} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>
                  Note (valgfri)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addExpense()}
                  placeholder="Fx månedlig, årlig..."
                  className="uv-input"
                  style={{ fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  onClick={addExpense}
                  disabled={!name.trim() || !price}
                  className="uv-btn"
                  style={{ flex: 1 }}
                >
                  <span className="uv-btn-text"><span>{editId ? "Gem ændringer" : "Tilføj"}</span></span>
                </button>
                {editId && (
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: "10px 16px", borderRadius: 99,
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--text-2)", cursor: "pointer", fontSize: 13,
                    }}
                  >
                    Annuller
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: summary + list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Total + category summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Total */}
            <div className="uv-card-2" style={{ padding: "3px" }}>
              <div style={{ background: "rgba(5,6,45,0.88)", borderRadius: "calc(1rem - 3px)", padding: "18px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#FFCC70", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Samlet total
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                  {fmt(total)}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                  {expenses.length} poster
                </p>
              </div>
            </div>

            {/* Top category */}
            {byCategory[0] && (
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Største kategori
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", lineHeight: 1.2 }}>
                    {byCategory.sort((a,b) => b.total - a.total)[0].emoji}{" "}
                    {byCategory.sort((a,b) => b.total - a.total)[0].name}
                  </p>
                  <p style={{ fontSize: 13, color: byCategory.sort((a,b) => b.total - a.total)[0].color, marginTop: 4, fontWeight: 600 }}>
                    {fmt(byCategory.sort((a,b) => b.total - a.total)[0].total)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          {byCategory.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Fordeling
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...byCategory].sort((a, b) => b.total - a.total).map(c => (
                    <div key={c.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: c.color, fontWeight: 500 }}>{c.emoji} {c.name}</span>
                        <span style={{ fontSize: 12, color: "#1c1917", fontWeight: 600 }}>{fmt(c.total)}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          background: c.color,
                          width: `${(c.total / total) * 100}%`,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button
              onClick={() => setFilterCat("Alle")}
              style={{
                fontSize: 12, padding: "4px 12px", borderRadius: 20,
                border: filterCat === "Alle" ? "none" : "1px solid var(--border)",
                background: filterCat === "Alle" ? "var(--text)" : "transparent",
                color: filterCat === "Alle" ? "var(--bg)" : "var(--text-2)",
                cursor: "pointer", fontWeight: filterCat === "Alle" ? 700 : 400,
              }}
            >
              Alle ({expenses.length})
            </button>
            {byCategory.map(c => (
              <button
                key={c.name}
                onClick={() => setFilterCat(c.name)}
                style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 20,
                  border: filterCat === c.name ? "none" : `1px solid ${c.color}40`,
                  background: filterCat === c.name ? c.bg : "transparent",
                  color: c.color, cursor: "pointer",
                  fontWeight: filterCat === c.name ? 700 : 400,
                }}
              >
                {c.emoji} {c.name} ({c.count})
              </button>
            ))}
          </div>

          {/* Expense list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-3)" }}>
                Ingen udgifter endnu — tilføj den første ovenfor
              </div>
            )}
            {filtered.map(e => {
              const cat = getCat(e.category);
              const isEditing = editId === e.id;
              return (
                <div
                  key={e.id}
                  className="uv-card-1"
                  style={{ opacity: isEditing ? 0.5 : 1, transition: "opacity 0.2s" }}
                >
                  <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Category dot */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: cat.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {cat.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1c1917" }}>{e.name}</span>
                          <span style={{
                            fontSize: 10, padding: "1px 7px", borderRadius: 20,
                            color: cat.color, border: `1px solid ${cat.color}40`,
                            fontWeight: 600, letterSpacing: "0.03em",
                          }}>
                            {e.category}
                          </span>
                        </div>
                        {e.note && (
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>{e.note}</span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#1c1917" }}>
                          {fmt(e.price)}
                        </span>
                        <button
                          onClick={() => startEdit(e)}
                          style={{
                            background: "rgba(255,255,255,0.06)", border: "none",
                            borderRadius: 6, width: 28, height: 28,
                            cursor: "pointer", fontSize: 13, color: "var(--text-2)",
                          }}
                          title="Rediger"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => removeExpense(e.id)}
                          style={{
                            background: "rgba(239,68,68,0.1)", border: "none",
                            borderRadius: 6, width: 28, height: 28,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          title="Slet"
                        >
                          <Trash2 style={{ width: 13, height: 13, color: "#f87171" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total footer */}
          {filtered.length > 0 && (
            <div style={{
              display: "flex", justifyContent: "flex-end",
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", marginRight: 12 }}>
                {filterCat === "Alle" ? "Samlet total" : filterCat}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#1c1917" }}>
                {fmt(filtered.reduce((s, e) => s + e.price, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Budget Planner */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1c1917", margin: "0 0 4px" }}>
            📅 Budget Planner
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 20px" }}>
            Sammenlign dine månedlige indtægter og udgifter — se rådighedsbeløb og opsparingsrate
          </p>
          <BudgetPlanner />
        </div>
      </div>

      {/* Abonnement-tracker */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1c1917", margin: "0 0 4px" }}>
            📱 Abonnement-tracker
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 20px" }}>
            Hvad koster dine løbende abonnementer samlet? Mange glemmer hvad de betaler 😅
          </p>
          <AbonnementTracker />
        </div>
      </div>

      {/* Spild-kalkulator */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1c1917", margin: "0 0 4px" }}>
            💳 Hvor meget spilder du?
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 20px" }}>
            Tilføj dine daglige vaner og se hvad det koster om året
          </p>
          <SpildKalkulator />
        </div>
      </div>

      {/* Aktie-vurdering */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1c1917", margin: "0 0 4px" }}>
            📉 Hvor dyr er denne aktie?
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 20px" }}>
            Slå op på P/E ratio og sammenlign med sektorgennemsnittet
          </p>
          <AktieVurdering />
        </div>
      </div>

    </div>
  );
}
