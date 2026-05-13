"use client";

import { useState, useCallback } from "react";

type Status = "idle" | "valid" | "error";

function tokenize(json: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const consume = (re: RegExp, color: string) => {
    const m = json.slice(i).match(re);
    if (!m) return false;
    tokens.push(<span key={key++} style={{ color }}>{m[0]}</span>);
    i += m[0].length;
    return true;
  };

  while (i < json.length) {
    const ch = json[i];
    if (ch === '"') {
      // Detect string — check if it's a key (followed by :)
      const m = json.slice(i).match(/^"(?:[^"\\]|\\.)*"/);
      if (m) {
        const after = json.slice(i + m[0].length).trimStart();
        const isKey = after.startsWith(":");
        tokens.push(<span key={key++} style={{ color: isKey ? "#e2b96e" : "#a3e3a3" }}>{m[0]}</span>);
        i += m[0].length;
      } else { tokens.push(<span key={key++}>{ch}</span>); i++; }
    } else if (consume(/^-?\d+\.?\d*(?:[eE][+-]?\d+)?/, "#79d4f0")) {
      // number
    } else if (consume(/^(?:true|false)/, "#ff9580")) {
      // bool
    } else if (consume(/^null/, "#b8a4e5")) {
      // null
    } else if ("{[]}:,".includes(ch)) {
      tokens.push(<span key={key++} style={{ color: "rgba(255,255,255,0.45)" }}>{ch}</span>);
      i++;
    } else if (ch === "\n" || ch === "\r") {
      tokens.push(<br key={key++} />);
      i++;
    } else if (ch === " ") {
      tokens.push(<span key={key++}>&nbsp;</span>);
      i++;
    } else {
      tokens.push(<span key={key++}>{ch}</span>);
      i++;
    }
  }
  return tokens;
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.keys(obj as object).sort().map(k => [k, sortKeys((obj as Record<string, unknown>)[k])])
    );
  }
  return obj;
}

export default function JSONFormatterTab() {
  const [raw, setRaw]           = useState("");
  const [formatted, setFormatted] = useState("");
  const [status, setStatus]     = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [indent, setIndent]     = useState(2);
  const [sorted, setSorted]     = useState(false);
  const [copied, setCopied]     = useState(false);

  const format = useCallback((input: string, ind: number, sort: boolean) => {
    if (!input.trim()) { setStatus("idle"); setFormatted(""); return; }
    try {
      let parsed = JSON.parse(input);
      if (sort) parsed = sortKeys(parsed);
      const out = JSON.stringify(parsed, null, ind);
      setFormatted(out);
      setStatus("valid");
      setErrorMsg("");
      setErrorLine(null);
    } catch (e: unknown) {
      setStatus("error");
      setFormatted("");
      const msg = String(e);
      setErrorMsg(msg.replace("SyntaxError: JSON.parse: ", "").replace("SyntaxError: ", ""));
      // Try to extract line number from error message
      const lineMatch = msg.match(/line (\d+)/i);
      setErrorLine(lineMatch ? parseInt(lineMatch[1]) : null);
    }
  }, []);

  function handleInput(v: string) {
    setRaw(v);
    format(v, indent, sorted);
  }

  function handleIndent(n: number) {
    setIndent(n);
    format(raw, n, sorted);
  }

  function handleSort(s: boolean) {
    setSorted(s);
    format(raw, indent, s);
  }

  function minify() {
    try {
      const out = JSON.stringify(JSON.parse(raw));
      setRaw(out);
      setFormatted(out);
      setStatus("valid");
      setErrorMsg(""); setErrorLine(null);
    } catch { /* ignore */ }
  }

  async function copy() {
    const text = status === "valid" ? formatted : raw;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function clear() {
    setRaw(""); setFormatted(""); setStatus("idle");
    setErrorMsg(""); setErrorLine(null);
  }

  const lineCount = raw.split("\n").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>JSON formatter</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Indsæt JSON → øjeblikkeligt formateret, syntax-highlighted og valideret med linje-fejl.
        </p>
      </div>

      {/* Toolbar */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Status badge */}
            {status !== "idle" && (
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99,
                background: status === "valid" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                border: `1.5px solid ${status === "valid" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                color: status === "valid" ? "#4ade80" : "#f87171",
              }}>
                {status === "valid" ? "✓ Gyldig JSON" : "✕ Ugyldig JSON"}
              </span>
            )}
            {raw && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{lineCount} linjer</span>}

            <div style={{ flex: 1 }} />

            {/* Indent selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Indrykning:</span>
              {[2, 4].map(n => (
                <button key={n} onClick={() => handleIndent(n)} style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                  background: indent === n ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${indent === n ? "rgba(91,66,243,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: indent === n ? "#a78bfa" : "var(--text-3)",
                }}>{n}</button>
              ))}
            </div>

            {/* Sort keys */}
            <button onClick={() => handleSort(!sorted)} style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
              background: sorted ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${sorted ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: sorted ? "#fbbf24" : "var(--text-3)",
            }}>Sortér nøgler</button>

            {/* Minify */}
            <button onClick={minify} disabled={status !== "valid"} style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)",
              color: "var(--text-2)", opacity: status !== "valid" ? 0.4 : 1,
            }}>Minify</button>

            {/* Copy */}
            <button onClick={copy} disabled={status === "idle" || !raw} style={{
              fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 6, cursor: "pointer",
              background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: copied ? "#4ade80" : "var(--text-2)",
            }}>{copied ? "✓ Kopieret" : "Kopiér"}</button>

            {/* Clear */}
            {raw && (
              <button onClick={clear} style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                background: "rgba(248,113,113,0.08)", border: "1.5px solid rgba(248,113,113,0.2)", color: "#f87171",
              }}>Ryd</button>
            )}
          </div>
        </div>
      </div>

      {/* Error bar */}
      {status === "error" && errorMsg && (
        <div style={{
          padding: "12px 16px", borderRadius: 10,
          background: "rgba(248,113,113,0.08)", border: "1.5px solid rgba(248,113,113,0.25)",
        }}>
          <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>
            ⚠️ {errorLine !== null ? `Linje ${errorLine}: ` : ""}{errorMsg}
          </span>
        </div>
      )}

      {/* Editor split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Input */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Input</p>
          <textarea
            value={raw}
            onChange={e => handleInput(e.target.value)}
            placeholder={'{\n  "name": "value"\n}'}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 400, padding: "14px 16px",
              background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: "#e2e8f0", fontSize: 13,
              fontFamily: "ui-monospace,SFMono-Regular,monospace",
              resize: "vertical", outline: "none", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Output */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Output</p>
          <div style={{
            minHeight: 400, padding: "14px 16px",
            background: "#0d0d10", border: `1.5px solid ${status === "valid" ? "rgba(74,222,128,0.2)" : status === "error" ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12, fontSize: 13,
            fontFamily: "ui-monospace,SFMono-Regular,monospace",
            lineHeight: 1.6, overflowX: "auto", wordBreak: "break-all",
          }}>
            {status === "valid"
              ? <code style={{ display: "block", whiteSpace: "pre-wrap" }}>{tokenize(formatted)}</code>
              : status === "error"
              ? <span style={{ color: "#f87171", opacity: 0.6 }}>— Ugyldig JSON —</span>
              : <span style={{ color: "rgba(255,255,255,0.2)" }}>Output vises her...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
