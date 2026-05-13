"use client";

import { useState, useRef } from "react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Header { key: string; value: string; enabled: boolean; }
interface HistoryEntry {
  method: Method; url: string; status: number; time: number;
  ts: number; body?: string;
}

/* ── cURL parser ────────────────────────────────────────────────────── */
function parseCurl(curl: string): { url: string; method: Method; headers: Header[]; body: string } | null {
  try {
    const cleaned = curl.replace(/\\\n\s*/g, " ").trim();
    if (!cleaned.startsWith("curl ")) return null;

    let url = "";
    let method: Method = "GET";
    const headers: Header[] = [];
    let body = "";

    const parts = cleaned.match(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\S+/g) ?? [];
    let i = 1;
    while (i < parts.length) {
      const p = parts[i].replace(/^['"]|['"]$/g, "");
      if ((p === "-X" || p === "--request") && parts[i + 1]) {
        method = parts[++i].replace(/^['"]|['"]$/g, "") as Method;
      } else if ((p === "-H" || p === "--header") && parts[i + 1]) {
        const h = parts[++i].replace(/^['"]|['"]$/g, "");
        const col = h.indexOf(":");
        if (col > 0) headers.push({ key: h.slice(0, col).trim(), value: h.slice(col + 1).trim(), enabled: true });
      } else if ((p === "-d" || p === "--data" || p === "--data-raw") && parts[i + 1]) {
        body = parts[++i].replace(/^['"]|['"]$/g, "");
        if (method === "GET") method = "POST";
      } else if (!p.startsWith("-") && (p.startsWith("http://") || p.startsWith("https://"))) {
        url = p;
      }
      i++;
    }
    return url ? { url, method, headers, body } : null;
  } catch { return null; }
}

/* ── JSON Path evaluator (simple dot / bracket notation) ─────────────── */
function jsonPath(obj: unknown, path: string): unknown {
  if (!path.trim()) return obj;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/* ── Code generators ─────────────────────────────────────────────────── */
function genFetch(url: string, method: Method, headers: Header[], body: string): string {
  const hdrs = headers.filter(h => h.enabled && h.key);
  const hObj = Object.fromEntries(hdrs.map(h => [h.key, h.value]));
  const opts: string[] = [`  method: "${method}"`];
  if (hdrs.length) opts.push(`  headers: ${JSON.stringify(hObj, null, 4)}`);
  if (body) opts.push(`  body: ${JSON.stringify(body)}`);
  return `const res = await fetch("${url}", {\n${opts.join(",\n")}\n});\nconst data = await res.json();\nconsole.log(data);`;
}

function genPython(url: string, method: Method, headers: Header[], body: string): string {
  const hdrs = headers.filter(h => h.enabled && h.key);
  const hLines = hdrs.length ? `headers=${JSON.stringify(Object.fromEntries(hdrs.map(h => [h.key, h.value])))}, ` : "";
  const bodyLine = body ? `json=${body}, ` : "";
  return `import requests\n\nres = requests.${method.toLowerCase()}(\n  "${url}",\n  ${hLines}${bodyLine}\n)\nprint(res.json())`;
}

function genCurl(url: string, method: Method, headers: Header[], body: string): string {
  const hParts = headers.filter(h => h.enabled && h.key).map(h => `-H "${h.key}: ${h.value}"`).join(" \\\n  ");
  const bodyPart = body ? `\\\n  -d '${body}'` : "";
  return `curl -X ${method} "${url}" \\\n  ${hParts}${bodyPart}`.trim();
}

/* ── Syntax highlight JSON output ─────────────────────────────────────── */
function highlightJSON(str: string): string {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
      match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span style="color:#e2b96e">${match}</span>`;
          return `<span style="color:#a3e3a3">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span style="color:#ff9580">${match}</span>`;
        if (/null/.test(match))       return `<span style="color:#b8a4e5">${match}</span>`;
        return `<span style="color:#79d4f0">${match}</span>`;
      }
    );
}

/* ──────────────────────────────────────────────────────────────────────── */

export default function APITesterTab() {
  const [url, setUrl]             = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod]       = useState<Method>("GET");
  const [headers, setHeaders]     = useState<Header[]>([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [body, setBody]           = useState("");
  const [sending, setSending]     = useState(false);
  const [response, setResponse]   = useState<{ status: number; statusText: string; headers: Record<string, string>; body: string; time: number } | null>(null);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState<"response" | "headers" | "code">("response");
  const [codeLang, setCodeLang]   = useState<"fetch" | "python" | "curl">("fetch");
  const [jsonPathQ, setJsonPathQ] = useState("");
  const [jsonPathResult, setJsonPathResult] = useState<string | null>(null);
  const [history, setHistory]     = useState<HistoryEntry[]>([]);
  const [curlInput, setCurlInput] = useState("");
  const [curlError, setCurlError] = useState("");
  const [showCurlModal, setShowCurlModal] = useState(false);
  const [diffMode, setDiffMode]   = useState(false);
  const [diffSnapshot, setDiffSnapshot] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function send() {
    const trimUrl = url.trim();
    if (!trimUrl) return;
    setSending(true); setError(""); setResponse(null); setJsonPathResult(null);
    abortRef.current = new AbortController();
    const t0 = performance.now();
    try {
      const hdrs: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key).forEach(h => { hdrs[h.key] = h.value; });
      const opts: RequestInit = { method, headers: hdrs, signal: abortRef.current.signal };
      if (body && method !== "GET" && method !== "DELETE") opts.body = body;
      const res = await fetch(trimUrl, opts);
      const time = Math.round(performance.now() - t0);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch { /* not JSON */ }
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: pretty, time });
      setHistory(h => [{ method, url: trimUrl, status: res.status, time, ts: Date.now(), body: pretty }, ...h.slice(0, 9)]);
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Request fejlede");
      }
    } finally {
      setSending(false);
    }
  }

  function evalJsonPath() {
    if (!response) return;
    try {
      const parsed = JSON.parse(response.body);
      const res    = jsonPath(parsed, jsonPathQ);
      setJsonPathResult(JSON.stringify(res, null, 2));
    } catch {
      setJsonPathResult("Fejl: Ugyldigt JSON eller path");
    }
  }

  function importCurl() {
    const parsed = parseCurl(curlInput);
    if (!parsed) { setCurlError("Ugyldigt cURL-format"); return; }
    setUrl(parsed.url); setMethod(parsed.method);
    if (parsed.headers.length) setHeaders(parsed.headers);
    if (parsed.body) setBody(parsed.body);
    setCurlInput(""); setCurlError(""); setShowCurlModal(false);
  }

  function addHeader() { setHeaders(h => [...h, { key: "", value: "", enabled: true }]); }
  function removeHeader(i: number) { setHeaders(h => h.filter((_, idx) => idx !== i)); }
  function updateHeader(i: number, field: keyof Header, val: string | boolean) {
    setHeaders(h => h.map((hh, idx) => idx === i ? { ...hh, [field]: val } : hh));
  }

  const statusColor = !response ? "#fff"
    : response.status < 300 ? "#4ade80"
    : response.status < 400 ? "#fbbf24"
    : "#f87171";

  const isJSON = response && (response.headers["content-type"] ?? "").includes("json");

  const codeSnippets: Record<string, string> = {
    fetch:  genFetch(url, method, headers, body),
    python: genPython(url, method, headers, body),
    curl:   genCurl(url, method, headers, body),
  };

  function takeDiffSnapshot() { setDiffSnapshot(response?.body ?? null); setDiffMode(true); }
  function diffLines(): { a?: string; b?: string; changed: boolean }[] {
    if (!diffSnapshot || !response) return [];
    const aLines = diffSnapshot.split("\n");
    const bLines = response.body.split("\n");
    const max = Math.max(aLines.length, bLines.length);
    return Array.from({ length: max }, (_, i) => ({
      a: aLines[i], b: bLines[i], changed: aLines[i] !== bLines[i],
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>API tester</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
            Mini HTTP-klient — cURL import, JSONPath queries, kode-generator og response diff.
          </p>
        </div>
        <button onClick={() => setShowCurlModal(true)} style={{
          fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
          background: "rgba(251,191,36,0.1)", border: "1.5px solid rgba(251,191,36,0.3)", color: "#fbbf24",
        }}>📋 Import cURL</button>
      </div>

      {/* cURL import modal */}
      {showCurlModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={() => setShowCurlModal(false)}>
          <div style={{
            background: "#16161a", border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: 24, width: "100%", maxWidth: 560,
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>Indsæt cURL-kommando</p>
            <textarea
              value={curlInput}
              onChange={e => { setCurlInput(e.target.value); setCurlError(""); }}
              placeholder={"curl -X POST \"https://api.example.com/data\" \\\n  -H \"Authorization: Bearer TOKEN\" \\\n  -d '{\"key\": \"value\"}'"}
              style={{
                width: "100%", minHeight: 140, padding: "12px 14px", boxSizing: "border-box",
                background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#e2e8f0", fontSize: 12,
                fontFamily: "monospace", resize: "vertical", outline: "none",
              }}
            />
            {curlError && <p style={{ color: "#f87171", fontSize: 12, margin: "6px 0 0" }}>{curlError}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={importCurl} className="uv-btn" style={{ flex: 1 }}>
                <span className="uv-btn-text"><span>Importer</span></span>
              </button>
              <button onClick={() => setShowCurlModal(false)} style={{
                padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.1)", color: "var(--text-2)", cursor: "pointer", fontSize: 13,
              }}>Annuller</button>
            </div>
          </div>
        </div>
      )}

      {/* URL bar */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {/* Method */}
            <select
              value={method}
              onChange={e => setMethod(e.target.value as Method)}
              style={{
                padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.12)", color: "#a78bfa",
                outline: "none", flexShrink: 0,
              }}
            >
              {(["GET","POST","PUT","PATCH","DELETE"] as Method[]).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="https://api.example.com/endpoint"
              className="uv-input"
              style={{ flex: 1, fontSize: 14, fontFamily: "monospace" }}
            />
            <button onClick={send} disabled={sending || !url.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{sending ? "Sender..." : "▶ Send"}</span></span>
            </button>
            {sending && (
              <button onClick={() => abortRef.current?.abort()} style={{
                padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: "rgba(248,113,113,0.1)", border: "1.5px solid rgba(248,113,113,0.3)",
                color: "#f87171", cursor: "pointer",
              }}>✕ Stop</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: Request */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Headers */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Headers</p>
                <button onClick={addHeader} style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
                  background: "rgba(91,66,243,0.1)", border: "1.5px solid rgba(91,66,243,0.25)", color: "#a78bfa",
                }}>+ Tilføj</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {headers.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={e => updateHeader(i, "enabled", e.target.checked)}
                      style={{ accentColor: "#5B42F3", flexShrink: 0 }}
                    />
                    <input value={h.key}   onChange={e => updateHeader(i, "key",   e.target.value)} placeholder="Nøgle"
                      style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "#0d0d10",
                        border: "1.5px solid rgba(255,255,255,0.08)", color: "var(--text)", fontSize: 12, outline: "none" }} />
                    <input value={h.value} onChange={e => updateHeader(i, "value", e.target.value)} placeholder="Værdi"
                      style={{ flex: 2, padding: "5px 8px", borderRadius: 6, background: "#0d0d10",
                        border: "1.5px solid rgba(255,255,255,0.08)", color: "var(--text)", fontSize: 12, outline: "none" }} />
                    <button onClick={() => removeHeader(i)} style={{
                      background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14, flexShrink: 0,
                    }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          {method !== "GET" && method !== "DELETE" && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Body</p>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={'{\n  "key": "value"\n}'}
                  spellCheck={false}
                  style={{
                    width: "100%", minHeight: 160, padding: "10px 12px", boxSizing: "border-box",
                    background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "#e2e8f0", fontSize: 12,
                    fontFamily: "monospace", resize: "vertical", outline: "none", lineHeight: 1.5,
                  }}
                />
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Historik</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {history.slice(0, 6).map((h, i) => (
                    <button key={i} onClick={() => { setUrl(h.url); setMethod(h.method); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                        borderRadius: 7, background: "rgba(255,255,255,0.03)",
                        border: "1.5px solid rgba(255,255,255,0.06)", cursor: "pointer", textAlign: "left",
                      }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", width: 40, flexShrink: 0 }}>{h.method}</span>
                      <span style={{ fontSize: 11, color: "var(--text-2)", flex: 1,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.url}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: h.status < 300 ? "#4ade80" : "#f87171" }}>{h.status}</span>
                      <span style={{ fontSize: 10, color: "var(--text-3)" }}>{h.time}ms</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Response */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10,
              background: "rgba(248,113,113,0.08)", border: "1.5px solid rgba(248,113,113,0.25)" }}>
              <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {response && (
            <>
              {/* Status bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 15, fontWeight: 900, padding: "4px 14px", borderRadius: 99,
                  background: `${statusColor}18`, border: `1.5px solid ${statusColor}40`, color: statusColor,
                }}>{response.status} {response.statusText}</span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{response.time} ms</span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {new Blob([response.body]).size > 1024
                    ? `${(new Blob([response.body]).size / 1024).toFixed(1)} KB`
                    : `${new Blob([response.body]).size} B`}
                </span>
                <div style={{ flex: 1 }} />
                <button onClick={takeDiffSnapshot} title="Gem snapshot til diff" style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                  background: diffMode ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${diffMode ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: diffMode ? "#fbbf24" : "var(--text-3)",
                }}>📸 Snapshot</button>
                {diffMode && diffSnapshot && (
                  <button onClick={() => { setDiffMode(false); setDiffSnapshot(null); }} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                    background: "rgba(248,113,113,0.08)", border: "1.5px solid rgba(248,113,113,0.2)", color: "#f87171",
                  }}>Ryd diff</button>
                )}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 4 }}>
                {(["response", "headers", "code"] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                    background: activeTab === t ? "rgba(91,66,243,0.18)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${activeTab === t ? "rgba(91,66,243,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: activeTab === t ? "#a78bfa" : "var(--text-3)",
                  }}>{t === "response" ? "Response" : t === "headers" ? "Headers" : "Kode"}</button>
                ))}
              </div>

              {/* Response tab */}
              {activeTab === "response" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* JSONPath */}
                  {isJSON && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={jsonPathQ}
                        onChange={e => setJsonPathQ(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && evalJsonPath()}
                        placeholder="JSONPath: data.0.title  eller  items"
                        style={{
                          flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 12,
                          background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0", fontFamily: "monospace", outline: "none",
                        }}
                      />
                      <button onClick={evalJsonPath} style={{
                        fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 7,
                        background: "rgba(91,66,243,0.12)", border: "1.5px solid rgba(91,66,243,0.25)",
                        color: "#a78bfa", cursor: "pointer",
                      }}>Query</button>
                    </div>
                  )}

                  {jsonPathResult && (
                    <div style={{ padding: "10px 14px", borderRadius: 8,
                      background: "rgba(91,66,243,0.06)", border: "1.5px solid rgba(91,66,243,0.2)" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", margin: "0 0 6px" }}>JSONPath resultat</p>
                      <pre style={{ margin: 0, fontSize: 12, color: "#4ade80", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                        {jsonPathResult}
                      </pre>
                    </div>
                  )}

                  {/* Diff view */}
                  {diffMode && diffSnapshot && diffSnapshot !== response.body ? (
                    <div style={{
                      minHeight: 300, maxHeight: 500, overflowY: "auto",
                      background: "#0d0d10", border: "1.5px solid rgba(251,191,36,0.25)",
                      borderRadius: 10, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6,
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", padding: "8px 14px 4px", margin: 0 }}>Diff: snapshot → nuværende</p>
                      {diffLines().map((line, i) => (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr",
                          background: line.changed ? "rgba(251,191,36,0.06)" : "transparent",
                          borderLeft: line.changed ? "3px solid #fbbf24" : "3px solid transparent",
                        }}>
                          <div style={{ padding: "1px 10px", color: line.changed ? "#f87171" : "rgba(255,255,255,0.35)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line.a ?? ""}</div>
                          <div style={{ padding: "1px 10px", color: line.changed ? "#4ade80" : "rgba(255,255,255,0.35)", whiteSpace: "pre-wrap", wordBreak: "break-all", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>{line.b ?? ""}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        minHeight: 300, maxHeight: 500, overflowY: "auto", overflowX: "auto",
                        background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.08)",
                        borderRadius: 10, padding: "14px 16px",
                        fontSize: 12, fontFamily: "monospace", lineHeight: 1.6, color: "#e2e8f0",
                      }}
                      dangerouslySetInnerHTML={{ __html: isJSON ? `<pre style="margin:0;white-space:pre-wrap;word-break:break-word">${highlightJSON(response.body)}</pre>` : `<pre style="margin:0;white-space:pre-wrap;word-break:break-word">${response.body.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>` }}
                    />
                  )}
                </div>
              )}

              {/* Headers tab */}
              {activeTab === "headers" && (
                <div style={{
                  background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, overflow: "hidden",
                }}>
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <span style={{ fontSize: 12, color: "#e2b96e", fontFamily: "monospace", flexShrink: 0, width: 200 }}>{k}</span>
                      <span style={{ fontSize: 12, color: "#a3e3a3", fontFamily: "monospace", wordBreak: "break-all" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Code tab */}
              {activeTab === "code" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["fetch", "python", "curl"] as const).map(l => (
                      <button key={l} onClick={() => setCodeLang(l)} style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 6, cursor: "pointer",
                        background: codeLang === l ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${codeLang === l ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
                        color: codeLang === l ? "#fbbf24" : "var(--text-3)",
                      }}>{l === "fetch" ? "JS fetch" : l === "python" ? "Python" : "cURL"}</button>
                    ))}
                    <button onClick={() => navigator.clipboard.writeText(codeSnippets[codeLang])} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer", marginLeft: "auto",
                      background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)", color: "var(--text-3)",
                    }}>Kopiér</button>
                  </div>
                  <pre style={{
                    margin: 0, padding: "14px 16px", borderRadius: 10,
                    background: "#0d0d10", border: "1.5px solid rgba(255,255,255,0.08)",
                    fontSize: 12, fontFamily: "monospace", color: "#e2e8f0",
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    overflowX: "auto",
                  }}>{codeSnippets[codeLang]}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
