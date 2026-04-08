"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Pencil, X, Save, Send } from "lucide-react";

type Priority = "high" | "medium" | "low";

interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

const PRIORITY_CONFIG = {
  high:   { label: "Høj",    color: "#f43f5e", bg: "rgba(244,63,94,0.15)" },
  medium: { label: "Mellem", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  low:    { label: "Lav",    color: "#22c55e", bg: "rgba(34,197,94,0.15)"  },
};

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem("todos");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

export default function TodoTab() {
  const [todos, setTodos]   = useState<Todo[]>([]);
  const [ready, setReady]   = useState(false);

  // Add form
  const [newTitle, setNewTitle]       = useState("");
  const [newDesc, setNewDesc]         = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [showForm, setShowForm]       = useState(false);

  // Edit state
  const [editId, setEditId]           = useState<string | null>(null);
  const [editTitle, setEditTitle]     = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");

  // Filter
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Telegram
  const [tgStatus, setTgStatus]   = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [tgMessage, setTgMessage] = useState("");

  useEffect(() => {
    setTodos(loadTodos());
    setReady(true);
  }, []);

  function update(next: Todo[]) {
    setTodos(next);
    saveTodos(next);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      priority: newPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    update([todo, ...todos]);
    setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setShowForm(false);
  }

  function handleToggle(id: string) {
    update(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function startEdit(todo: Todo) {
    setEditId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description ?? "");
    setEditPriority(todo.priority);
  }

  function handleSaveEdit(id: string) {
    if (!editTitle.trim()) return;
    update(todos.map(t => t.id === id
      ? { ...t, title: editTitle.trim(), description: editDesc.trim() || undefined, priority: editPriority }
      : t
    ));
    setEditId(null);
  }

  function handleDelete(id: string) {
    update(todos.filter(t => t.id !== id));
  }

  async function sendToTelegram() {
    const active = todos.filter(t => !t.completed);
    if (active.length === 0) { setTgMessage("Ingen aktive opgaver at sende"); setTgStatus("err"); return; }

    setTgStatus("sending");

    let chatId: string = localStorage.getItem("tg_chat_id") ?? "";
    if (!chatId) {
      const setupRes = await fetch("/api/telegram?action=setup");
      const setup    = await setupRes.json();
      if (!setupRes.ok || !setup.chat_id) {
        setTgMessage(setup.error ?? "Kunne ikke finde dit chat ID — send /start til @TJ_app_bot og prøv igen");
        setTgStatus("err"); return;
      }
      chatId = String(setup.chat_id);
      localStorage.setItem("tg_chat_id", chatId);
    }

    const now  = new Date().toLocaleString("da-DK", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const high = active.filter(t => t.priority === "high");
    const med  = active.filter(t => t.priority === "medium");
    const low  = active.filter(t => t.priority === "low");

    let msg = `📋 *To-do liste* (${now})\n`;
    if (high.length) msg += `\n🔴 *Høj prioritet:*\n` + high.map(t => `• ${t.title}`).join("\n");
    if (med.length)  msg += `\n🟡 *Medium prioritet:*\n` + med.map(t => `• ${t.title}`).join("\n");
    if (low.length)  msg += `\n🟢 *Lav prioritet:*\n` + low.map(t => `• ${t.title}`).join("\n");
    msg += `\n\n_${active.length} opgave${active.length !== 1 ? "r" : ""} i alt_`;

    const res  = await fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, message: msg }) });
    const data = await res.json();
    if (!res.ok) { setTgMessage(data.error ?? "Fejl ved afsendelse"); setTgStatus("err"); return; }
    setTgMessage(`Sendt! ${active.length} opgave${active.length !== 1 ? "r" : ""} til Telegram`);
    setTgStatus("ok");
    setTimeout(() => setTgStatus("idle"), 4000);
  }

  const filtered = todos.filter(t => {
    if (filter === "active")    return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount    = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>To-do liste</h2>
          <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 14 }}>
            {activeCount} aktiv{activeCount !== 1 ? "e" : ""} · {completedCount} afsluttet{completedCount !== 1 ? "e" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={sendToTelegram}
            disabled={tgStatus === "sending" || todos.length === 0}
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
          <button onClick={() => setShowForm(v => !v)} className="uv-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus style={{ width: 16, height: 16 }} />
            <span className="uv-btn-text"><span>Ny opgave</span></span>
          </button>
        </div>
      </div>

      {/* Telegram status */}
      {(tgStatus === "ok" || tgStatus === "err") && tgMessage && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", borderRadius: 10, marginBottom: 16,
          backgroundColor: tgStatus === "ok" ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)",
          border: `1px solid ${tgStatus === "ok" ? "rgba(34,197,94,0.3)" : "rgba(244,63,94,0.3)"}`,
          color: tgStatus === "ok" ? "#4ade80" : "#f87171", fontSize: 13,
        }}>
          {tgStatus === "ok" ? "✅" : "⚠️"} {tgMessage}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="uv-card-1" style={{ marginBottom: 20 }}>
          <div className="uv-card-1-inner" style={{ padding: 20 }}>
            <form onSubmit={handleAdd}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Opgave titel..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Beskrivelse (valgfrit)..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>Prioritet:</span>
                  {(["high", "medium", "low"] as const).map(p => (
                    <button key={p} type="button" onClick={() => setNewPriority(p)} style={{
                      ...priorityBtnStyle,
                      color: PRIORITY_CONFIG[p].color,
                      backgroundColor: newPriority === p ? PRIORITY_CONFIG[p].bg : "transparent",
                      border: `1px solid ${newPriority === p ? PRIORITY_CONFIG[p].color : "rgba(255,255,255,0.1)"}`,
                    }}>
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>Annuller</button>
                    <button type="submit" disabled={!newTitle.trim()} className="uv-btn">
                      <span className="uv-btn-text"><span>Tilføj</span></span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "active", "completed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer",
            border: "1px solid",
            borderColor: filter === f ? "rgba(91,66,243,0.6)" : "rgba(255,255,255,0.08)",
            backgroundColor: filter === f ? "rgba(91,66,243,0.15)" : "transparent",
            color: filter === f ? "#a78bfa" : "var(--text-2)",
          }}>
            {f === "all" ? `Alle (${todos.length})` : f === "active" ? `Aktive (${activeCount})` : `Afsluttede (${completedCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {!ready ? null : filtered.length === 0 ? (
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: "var(--text-2)", fontSize: 15 }}>
              {filter === "completed" ? "Ingen afsluttede opgaver endnu" :
               filter === "active"    ? "Ingen aktive opgaver" :
                                        "Ingen opgaver endnu — tilføj din første!"}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(todo => (
            <div key={todo.id} className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
                {editId === todo.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus style={inputStyle} />
                    <input type="text" placeholder="Beskrivelse..." value={editDesc} onChange={e => setEditDesc(e.target.value)} style={inputStyle} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>Prioritet:</span>
                      {(["high", "medium", "low"] as const).map(p => (
                        <button key={p} type="button" onClick={() => setEditPriority(p)} style={{
                          ...priorityBtnStyle,
                          color: PRIORITY_CONFIG[p].color,
                          backgroundColor: editPriority === p ? PRIORITY_CONFIG[p].bg : "transparent",
                          border: `1px solid ${editPriority === p ? PRIORITY_CONFIG[p].color : "rgba(255,255,255,0.1)"}`,
                        }}>
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        <button onClick={() => setEditId(null)} style={cancelBtnStyle}><X style={{ width: 14, height: 14 }} /> Annuller</button>
                        <button onClick={() => handleSaveEdit(todo.id)} disabled={!editTitle.trim()} className="uv-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Save style={{ width: 14, height: 14 }} />
                          <span className="uv-btn-text"><span>Gem</span></span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => handleToggle(todo.id)} style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${todo.completed ? "#5B42F3" : "rgba(255,255,255,0.2)"}`,
                      backgroundColor: todo.completed ? "#5B42F3" : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {todo.completed && <Check style={{ width: 13, height: 13, color: "white" }} />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 500,
                        color: todo.completed ? "var(--text-2)" : "var(--text)",
                        textDecoration: todo.completed ? "line-through" : "none",
                        margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p style={{ fontSize: 12, color: "var(--text-2)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, flexShrink: 0,
                      color: PRIORITY_CONFIG[todo.priority].color,
                      backgroundColor: PRIORITY_CONFIG[todo.priority].bg,
                    }}>
                      {PRIORITY_CONFIG[todo.priority].label}
                    </span>
                    <button onClick={() => startEdit(todo)} style={iconBtnStyle} title="Rediger">
                      <Pencil style={{ width: 14, height: 14 }} />
                    </button>
                    <button onClick={() => handleDelete(todo.id)} style={{ ...iconBtnStyle, color: "#f43f5e" }} title="Slet">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box",
};

const priorityBtnStyle: React.CSSProperties = {
  padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
};

const cancelBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer",
};

const iconBtnStyle: React.CSSProperties = {
  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
  backgroundColor: "transparent", color: "var(--text-2)", cursor: "pointer", flexShrink: 0,
};
