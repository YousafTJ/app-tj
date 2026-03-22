"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Check, Pencil, X, Save, AlertCircle } from "lucide-react";
import type { Todo } from "@/app/api/todos/route";

const PRIORITY_CONFIG = {
  high:   { label: "Høj",    color: "#f43f5e", bg: "rgba(244,63,94,0.15)" },
  medium: { label: "Mellem", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  low:    { label: "Lav",    color: "#22c55e", bg: "rgba(34,197,94,0.15)"  },
};

export default function TodoTab() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Todo["priority"]>("medium");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<Todo["priority"]>("medium");
  const [saving, setSaving] = useState(false);

  // Filter
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Fejl ved hentning");
      const data = await res.json();
      setTodos(data);
    } catch {
      setError("Ingen forbindelse til serveren — er CosmosDB emulatoren kørende på localhost:8081?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  async function apiError(res: Response, fallback: string): Promise<string> {
    try {
      const data = await res.json();
      return data?.error ?? fallback;
    } catch {
      if (res.status === 0 || !res.status) return "Ingen forbindelse til serveren";
      if (res.status >= 500) return `Serverfejl (${res.status}) — tjek CosmosDB forbindelsen`;
      if (res.status === 404) return "Opgaven blev ikke fundet";
      if (res.status === 400) return "Ugyldigt input";
      return `${fallback} (${res.status})`;
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDesc, priority: newPriority }),
      });
      if (!res.ok) { setError(await apiError(res, "Kunne ikke oprette opgaven")); return; }
      const created = await res.json();
      setTodos(prev => [created, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setNewPriority("medium");
      setShowForm(false);
    } catch {
      setError("Ingen forbindelse til serveren — er CosmosDB emulatoren kørende?");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      const res = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todo.id, completed: !todo.completed }),
      });
      if (!res.ok) { setError(await apiError(res, `Kunne ikke markere "${todo.title}"`)); return; }
      const updated = await res.json();
      setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));
    } catch {
      setError("Ingen forbindelse til serveren");
    }
  }

  function startEdit(todo: Todo) {
    setEditId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description ?? "");
    setEditPriority(todo.priority);
  }

  async function handleSaveEdit(id: string) {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle, description: editDesc, priority: editPriority }),
      });
      if (!res.ok) { setError(await apiError(res, `Kunne ikke gemme ændringer`)); setSaving(false); return; }
      const updated = await res.json();
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
      setEditId(null);
    } catch {
      setError("Ingen forbindelse til serveren");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const todo = todos.find(t => t.id === id);
    try {
      const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
      if (!res.ok) { setError(await apiError(res, `Kunne ikke slette "${todo?.title ?? "opgaven"}"`)); return; }
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      setError("Ingen forbindelse til serveren");
    }
  }

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
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
        <button
          onClick={() => setShowForm(v => !v)}
          className="uv-btn"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          <span className="uv-btn-text"><span>Ny opgave</span></span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 10, marginBottom: 16,
          backgroundColor: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)",
          color: "#f43f5e", fontSize: 14,
        }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: "auto", color: "inherit", background: "none", border: "none", cursor: "pointer" }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
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
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      style={{
                        ...priorityBtnStyle,
                        color: PRIORITY_CONFIG[p].color,
                        backgroundColor: newPriority === p ? PRIORITY_CONFIG[p].bg : "transparent",
                        border: `1px solid ${newPriority === p ? PRIORITY_CONFIG[p].color : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>
                      Annuller
                    </button>
                    <button type="submit" disabled={adding || !newTitle.trim()} className="uv-btn">
                      <span className="uv-btn-text"><span>{adding ? "Tilføjer..." : "Tilføj"}</span></span>
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
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer",
              border: "1px solid",
              borderColor: filter === f ? "rgba(91,66,243,0.6)" : "rgba(255,255,255,0.08)",
              backgroundColor: filter === f ? "rgba(91,66,243,0.15)" : "transparent",
              color: filter === f ? "#a78bfa" : "var(--text-2)",
            }}
          >
            {f === "all" ? `Alle (${todos.length})` : f === "active" ? `Aktive (${activeCount})` : `Afsluttede (${completedCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-2)" }}>
          <div className="uv-spinner" style={{ margin: "0 auto 12px" }} />
          Henter opgaver...
        </div>
      ) : filtered.length === 0 ? (
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: "var(--text-2)", fontSize: 15 }}>
              {filter === "completed" ? "Ingen afsluttede opgaver endnu" :
               filter === "active" ? "Ingen aktive opgaver" :
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
                  /* Edit mode */
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      autoFocus
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Beskrivelse..."
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      style={inputStyle}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>Prioritet:</span>
                      {(["high", "medium", "low"] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setEditPriority(p)}
                          style={{
                            ...priorityBtnStyle,
                            color: PRIORITY_CONFIG[p].color,
                            backgroundColor: editPriority === p ? PRIORITY_CONFIG[p].bg : "transparent",
                            border: `1px solid ${editPriority === p ? PRIORITY_CONFIG[p].color : "rgba(255,255,255,0.1)"}`,
                          }}
                        >
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        <button onClick={() => setEditId(null)} style={cancelBtnStyle}>
                          <X style={{ width: 14, height: 14 }} /> Annuller
                        </button>
                        <button
                          onClick={() => handleSaveEdit(todo.id)}
                          disabled={saving || !editTitle.trim()}
                          className="uv-btn"
                          style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <Save style={{ width: 14, height: 14 }} />
                          <span className="uv-btn-text"><span>{saving ? "Gemmer..." : "Gem"}</span></span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(todo)}
                      style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${todo.completed ? "#5B42F3" : "rgba(255,255,255,0.2)"}`,
                        backgroundColor: todo.completed ? "#5B42F3" : "transparent",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {todo.completed && <Check style={{ width: 13, height: 13, color: "white" }} />}
                    </button>

                    {/* Content */}
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

                    {/* Priority badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, flexShrink: 0,
                      color: PRIORITY_CONFIG[todo.priority].color,
                      backgroundColor: PRIORITY_CONFIG[todo.priority].bg,
                    }}>
                      {PRIORITY_CONFIG[todo.priority].label}
                    </span>

                    {/* Actions */}
                    <button
                      onClick={() => startEdit(todo)}
                      style={iconBtnStyle}
                      title="Rediger"
                    >
                      <Pencil style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      style={{ ...iconBtnStyle, color: "#f43f5e" }}
                      title="Slet"
                    >
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
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const priorityBtnStyle: React.CSSProperties = {
  padding: "4px 12px",
  borderRadius: 99,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

const cancelBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "transparent",
  color: "var(--text-2)",
  fontSize: 13, cursor: "pointer",
};

const iconBtnStyle: React.CSSProperties = {
  width: 30, height: 30,
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 6,
  backgroundColor: "transparent",
  color: "var(--text-2)",
  cursor: "pointer",
  flexShrink: 0,
};
