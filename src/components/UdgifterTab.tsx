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

    </div>
  );
}
