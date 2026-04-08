"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Printer, ShoppingCart, Check, Send } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Frugt & Grønt",     emoji: "🥦", color: "#a3e635", order: 0 },
  { name: "Mejeri & Æg",       emoji: "🥛", color: "#facc15", order: 1 },
  { name: "Kød & Fisk",        emoji: "🥩", color: "#f87171", order: 2 },
  { name: "Brød & Korn",       emoji: "🍞", color: "#fb923c", order: 3 },
  { name: "Frost",             emoji: "🧊", color: "#00DDEB", order: 4 },
  { name: "Dåser & Konserves", emoji: "🥫", color: "#a78bfa", order: 5 },
  { name: "Drikkevarer",       emoji: "🧃", color: "#3b82f6", order: 6 },
  { name: "Snacks & Slik",     emoji: "🍫", color: "#e879f9", order: 7 },
  { name: "Hygiejne",          emoji: "🧴", color: "#10b981", order: 8 },
  { name: "Rengøring",         emoji: "🧹", color: "#57534e", order: 9 },
  { name: "Andet",             emoji: "📦", color: "#a8a29e", order: 10 },
] as const;

type CategoryName = typeof CATEGORIES[number]["name"];

const UNITS = ["stk.", "kg", "g", "l", "dl", "pakke", "dåse", "flaske", "pose"];

const SUGGESTIONS: Record<CategoryName, string[]> = {
  "Frugt & Grønt":     ["Bananer", "Æbler", "Gulerødder", "Tomater", "Salat", "Løg", "Kartofler", "Agurk", "Peberfrugt", "Spinat"],
  "Mejeri & Æg":       ["Mælk", "Smør", "Ost", "Yoghurt", "Fløde", "Æg", "Skyr", "Cremefraiche"],
  "Kød & Fisk":        ["Hakket oksekød", "Kyllingefilet", "Bacon", "Laks", "Rejer", "Pølser", "Koteletter"],
  "Brød & Korn":       ["Rugbrød", "Franskbrød", "Havregryn", "Pasta", "Ris", "Mel", "Cornflakes"],
  "Frost":             ["Frossen spinat", "Frosne ærter", "Pizza", "Frosne rejer", "Is"],
  "Dåser & Konserves": ["Tomat på dåse", "Bønner", "Tun", "Kokosmælk", "Majs"],
  "Drikkevarer":       ["Appelsinjuice", "Vand", "Sodavand", "Øl", "Vin", "Kaffe", "Te"],
  "Snacks & Slik":     ["Chips", "Chokolade", "Nødder", "Popcorn", "Kiks"],
  "Hygiejne":          ["Tandpasta", "Shampoo", "Sæbe", "Deodorant", "Toiletpapir"],
  "Rengøring":         ["Opvaskemiddel", "Rengøringsmiddel", "Svamp", "Vaskepulver", "Afspænding"],
  "Andet":             [],
};

interface Item {
  id: string;
  name: string;
  qty: string;
  unit: string;
  category: CategoryName;
  checked: boolean;
}

function getCat(name: CategoryName) {
  return CATEGORIES.find(c => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ShoppingListTab() {
  const [items, setItems] = useState<Item[]>([
    { id: "1", name: "Mælk",             qty: "1", unit: "l",    category: "Mejeri & Æg",   checked: false },
    { id: "2", name: "Rugbrød",          qty: "1", unit: "stk.", category: "Brød & Korn",   checked: false },
    { id: "3", name: "Hakket oksekød",   qty: "500", unit: "g",  category: "Kød & Fisk",    checked: false },
    { id: "4", name: "Tomater",          qty: "4", unit: "stk.", category: "Frugt & Grønt", checked: false },
  ]);

  const [name, setName]         = useState("");
  const [qty, setQty]           = useState("1");
  const [unit, setUnit]         = useState("stk.");
  const [category, setCategory] = useState<CategoryName>("Frugt & Grønt");
  const [showSugg, setShowSugg] = useState(false);
  const [listTitle, setListTitle] = useState("Indkøbsliste");
  const [sortByCat, setSortByCat] = useState(true);
  const [tgStatus, setTgStatus]   = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [tgMessage, setTgMessage] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  function addItem(itemName = name) {
    const n = itemName.trim();
    if (!n) return;
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      name: n, qty, unit, category, checked: false,
    }]);
    setName(""); setQty("1");
    setShowSugg(false);
    nameRef.current?.focus();
  }

  function toggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function clearChecked() {
    setItems(prev => prev.filter(i => !i.checked));
  }

  const suggestions = SUGGESTIONS[category]
    .filter(s => s.toLowerCase().includes(name.toLowerCase()) && !items.find(i => i.name.toLowerCase() === s.toLowerCase()))
    .slice(0, 6);

  // Group by category in store order
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.name),
  })).filter(g => g.items.length > 0);

  const displayItems = sortByCat
    ? grouped.flatMap(g => g.items)
    : items;

  const checkedCount = items.filter(i => i.checked).length;

  // ─── Telegram ───────────────────────────────────────────────────────────────

  async function sendToTelegram() {
    if (items.length === 0) { setTgMessage("Ingen varer at sende"); setTgStatus("err"); return; }

    setTgStatus("sending");

    let chatId: number | string = typeof window !== "undefined" ? localStorage.getItem("tg_chat_id") ?? "" : "";
    if (!chatId) {
      const setupRes = await fetch("/api/telegram?action=setup");
      const setup    = await setupRes.json();
      if (!setupRes.ok || !setup.chat_id) {
        setTgMessage(setup.error ?? "Kunne ikke finde dit chat ID — send /start til @TJ_app_bot og prøv igen");
        setTgStatus("err"); return;
      }
      chatId = setup.chat_id;
      localStorage.setItem("tg_chat_id", String(chatId));
    }

    const today = new Date().toLocaleDateString("da-DK", { day: "2-digit", month: "long", year: "numeric" });
    let msg = `🛒 *${listTitle}* (${today})\n`;
    for (const group of grouped) {
      const remaining = group.items.filter(i => !i.checked);
      if (remaining.length === 0) continue;
      msg += `\n${group.emoji} *${group.name}:*\n`;
      msg += remaining.map(i => `• ${i.name} — ${i.qty} ${i.unit}`).join("\n");
    }
    msg += `\n\n_${items.filter(i => !i.checked).length} varer tilbage_`;

    const res  = await fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, message: msg }) });
    const data = await res.json();
    if (!res.ok) { setTgMessage(data.error ?? "Fejl ved afsendelse"); setTgStatus("err"); return; }
    setTgMessage(`Sendt! ${items.length} varer afsendt til Telegram`);
    setTgStatus("ok");
    setTimeout(() => setTgStatus("idle"), 4000);
  }

  // ─── Print ──────────────────────────────────────────────────────────────────

  function printList() {
    const groupedRows = grouped.map(g => `
      <tr class="cat-header">
        <td colspan="3">${g.emoji} ${g.name}</td>
      </tr>
      ${g.items.map(i => `
        <tr class="${i.checked ? "checked" : ""}">
          <td class="check">${i.checked ? "☑" : "☐"}</td>
          <td>${i.name}</td>
          <td class="qty">${i.qty} ${i.unit}</td>
        </tr>
      `).join("")}
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8"/>
  <title>${listTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 14px; color: #111; padding: 32px; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .subtitle { color: #888; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    tr.cat-header td { background: #f5f5f5; padding: 8px 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #333; border-top: 2px solid #111; }
    tr td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
    td.check { width: 28px; font-size: 16px; color: #555; }
    td.qty { text-align: right; color: #888; font-size: 13px; width: 80px; }
    tr.checked td { text-decoration: line-through; color: #aaa; }
    .footer { margin-top: 32px; font-size: 11px; color: #aaa; text-align: center; }
    .stats { display: flex; gap: 24px; margin-bottom: 24px; }
    .stat { background: #f9f9f9; border-radius: 8px; padding: 10px 16px; }
    .stat-val { font-size: 20px; font-weight: 800; }
    .stat-lbl { font-size: 11px; color: #888; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>${listTitle}</h1>
  <p class="subtitle">Genereret ${new Date().toLocaleDateString("da-DK", { day: "2-digit", month: "long", year: "numeric" })} · ${items.length} varer</p>
  <div class="stats">
    <div class="stat"><div class="stat-val">${items.length}</div><div class="stat-lbl">Varer i alt</div></div>
    <div class="stat"><div class="stat-val">${grouped.length}</div><div class="stat-lbl">Kategorier</div></div>
    <div class="stat"><div class="stat-val">${checkedCount}</div><div class="stat-lbl">Allerede hentet</div></div>
  </div>
  <table><tbody>${groupedRows}</tbody></table>
  <p class="footer">TJHUB · Indkøbsliste</p>
</body>
</html>`;

    const win = window.open("", "_blank", "width=700,height=900");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Indkøbsliste</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Kategorisér dine varer og print listen ud</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setSortByCat(s => !s)}
            style={{
              padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: sortByCat ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${sortByCat ? "#5B42F3" : "rgba(255,255,255,0.1)"}`,
              color: sortByCat ? "#a78bfa" : "var(--text-2)",
            }}
          >
            {sortByCat ? "Sorteret efter kategori" : "Sorteret efter tilføjelse"}
          </button>
          <button
            onClick={sendToTelegram}
            disabled={tgStatus === "sending" || items.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: tgStatus === "ok" ? "rgba(34,197,94,0.15)" : "rgba(0,136,204,0.12)",
              border: `1.5px solid ${tgStatus === "ok" ? "rgba(34,197,94,0.4)" : "rgba(0,136,204,0.3)"}`,
              color: tgStatus === "ok" ? "#4ade80" : "#38bdf8",
            }}
          >
            <Send style={{ width: 14, height: 14 }} />
            {tgStatus === "sending" ? "Sender..." : tgStatus === "ok" ? "Sendt!" : "Send til Telegram"}
          </button>
          <button onClick={printList} disabled={items.length === 0} className="uv-btn">
            <Printer style={{ width: 15, height: 15 }} />
            <span className="uv-btn-text"><span>Print</span></span>
          </button>
        </div>
      </div>

      {/* Telegram status */}
      {(tgStatus === "ok" || tgStatus === "err") && tgMessage && (
        <div style={{
          padding: "10px 16px", borderRadius: 10,
          backgroundColor: tgStatus === "ok" ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)",
          border: `1px solid ${tgStatus === "ok" ? "rgba(34,197,94,0.3)" : "rgba(244,63,94,0.3)"}`,
          color: tgStatus === "ok" ? "#4ade80" : "#f87171", fontSize: 13,
        }}>
          {tgStatus === "ok" ? "✅" : "⚠️"} {tgMessage}
        </div>
      )}

      {/* Listens titel */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500, flexShrink: 0 }}>Listenavn:</label>
            <input
              value={listTitle}
              onChange={e => setListTitle(e.target.value)}
              className="uv-input"
              style={{ fontSize: 14, fontWeight: 600, flex: 1 }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 24, alignItems: "start" }}>
        {/* Add form */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
              <Plus style={{ width: 16, height: 16, color: "#5B42F3" }} />
              Tilføj vare
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Kategori */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>Kategori</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.name}
                      onClick={() => { setCategory(c.name); setShowSugg(false); }}
                      style={{
                        fontSize: 11, padding: "4px 9px", borderRadius: 20, cursor: "pointer",
                        border: category === c.name ? "none" : `1px solid ${c.color}40`,
                        background: category === c.name ? c.color + "25" : "transparent",
                        color: c.color, fontWeight: category === c.name ? 700 : 400,
                      }}
                    >
                      {c.emoji} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navn + autocomplete */}
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>Varenavn</label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={e => { setName(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                  onKeyDown={e => e.key === "Enter" && addItem()}
                  placeholder="Fx Mælk, Æbler..."
                  className="uv-input"
                  style={{ fontSize: 13 }}
                />
                {showSugg && suggestions.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4,
                    background: "#ffffff", border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 10,
                    overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}>
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onMouseDown={() => addItem(s)}
                        style={{
                          width: "100%", padding: "10px 14px", textAlign: "left",
                          background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)",
                          color: "#1c1917", fontSize: 13, cursor: "pointer",
                        }}
                      >
                        {getCat(category).emoji} {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Antal + enhed */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>Antal</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    min="0" step="0.1"
                    className="uv-input"
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>Enhed</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="uv-input" style={{ fontSize: 13 }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={() => addItem()} disabled={!name.trim()} className="uv-btn">
                <span className="uv-btn-text"><span>Tilføj</span></span>
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Progress */}
          {items.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-3)" }}>Fremgang</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: checkedCount === items.length ? "#a3e635" : "#1c1917" }}>
                    {checkedCount} / {items.length} varer
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    background: checkedCount === items.length ? "#a3e635" : "linear-gradient(90deg, #AF40FF, #00DDEB)",
                    width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%`,
                    transition: "width 0.3s",
                  }} />
                </div>
                {checkedCount > 0 && (
                  <button onClick={clearChecked} style={{
                    marginTop: 10, fontSize: 12, color: "#f87171", background: "none", border: "none",
                    cursor: "pointer", padding: 0,
                  }}>
                    Fjern {checkedCount} afkrydsede varer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Items grouped by category */}
          {items.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-3)" }}>
              <ShoppingCart style={{ width: 32, height: 32, margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Ingen varer endnu — tilføj den første til venstre</p>
            </div>
          )}

          {sortByCat ? (
            grouped.map(group => (
              <div key={group.name} className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
                  <p style={{
                    fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: group.color, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span>{group.emoji}</span> {group.name}
                    <span style={{ fontWeight: 400, color: "var(--text-3)", textTransform: "none", letterSpacing: 0 }}>
                      ({group.items.filter(i => !i.checked).length} tilbage)
                    </span>
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {group.items.map(item => (
                      <ItemRow key={item.id} item={item} onToggle={toggle} onRemove={remove} />
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                {displayItems.map(item => (
                  <ItemRow key={item.id} item={item} onToggle={toggle} onRemove={remove} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, onToggle, onRemove }: { item: Item; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
  const cat = getCat(item.category);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 8,
      background: item.checked ? "rgba(255,255,255,0.02)" : "transparent",
      opacity: item.checked ? 0.5 : 1,
      transition: "all 0.2s",
    }}>
      <button
        onClick={() => onToggle(item.id)}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          border: `1.5px solid ${item.checked ? cat.color : "rgba(255,255,255,0.2)"}`,
          background: item.checked ? cat.color + "22" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {item.checked && <Check style={{ width: 12, height: 12, color: cat.color }} />}
      </button>

      <span style={{
        flex: 1, fontSize: 14, color: "#1c1917",
        textDecoration: item.checked ? "line-through" : "none",
        fontWeight: 500,
      }}>
        {item.name}
      </span>

      <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>
        {item.qty} {item.unit}
      </span>

      <button onClick={() => onRemove(item.id)} style={{
        background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
        color: "var(--text-3)", fontSize: 16, lineHeight: 1, flexShrink: 0,
      }}>×</button>
    </div>
  );
}
