"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// SQL Keywords for formatting and highlighting
// ---------------------------------------------------------------------------

const MAJOR_KEYWORDS = [
  "DELETE FROM",
  "INSERT INTO",
  "CREATE TABLE",
  "ALTER TABLE",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "FULL OUTER JOIN",
  "CROSS JOIN",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "VALUES",
  "SELECT",
  "UPDATE",
  "DELETE",
  "INSERT",
  "CREATE",
  "ALTER",
  "DROP",
  "FROM",
  "WHERE",
  "JOIN",
  "SET",
  "ON",
];

const HIGHLIGHT_KEYWORDS = [
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "FULL",
  "CROSS",
  "ON",
  "AND",
  "OR",
  "NOT",
  "IN",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "IS",
  "NULL",
  "AS",
  "GROUP",
  "BY",
  "ORDER",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "ALTER",
  "ADD",
  "COLUMN",
  "DROP",
  "INDEX",
  "UNIQUE",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "DEFAULT",
  "NOT NULL",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "WITH",
  "UNION",
  "ALL",
  "INTERSECT",
  "EXCEPT",
  "ASC",
  "DESC",
  "NULLS",
  "FIRST",
  "LAST",
  "TOP",
  "ROWNUM",
  "TRUNCATE",
  "TRANSACTION",
  "COMMIT",
  "ROLLBACK",
  "BEGIN",
  "IF",
  "THEN",
  "ELSE",
  "END",
  "CONSTRAINT",
  "CHECK",
  "CAST",
  "CONVERT",
  "COALESCE",
  "NULLIF",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
];

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

function formatSql(raw: string): string {
  // Build a regex that matches major keywords (longest first to avoid partial matches)
  const sorted = [...MAJOR_KEYWORDS].sort((a, b) => b.length - a.length);
  const pattern = sorted.map((kw) => kw.replace(/\s+/g, "\\s+")).join("|");
  const re = new RegExp(`(?<![\\w.])(?:${pattern})(?![\\w])`, "gi");

  // Normalize whitespace
  let sql = raw.trim().replace(/[ \t]+/g, " ");

  // Split into tokens preserving strings and comments
  const segments = tokenizeForFormat(sql);

  // Reconstruct with newlines before major keywords (only outside strings/comments)
  let result = "";
  for (const seg of segments) {
    if (seg.type === "code") {
      const replaced = seg.value.replace(re, (match) => `\n${match.toUpperCase()}`);
      result += replaced;
    } else {
      result += seg.value;
    }
  }

  // Clean up: split into lines, trim each, remove blank lines at start
  const lines = result
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i) => !(i === 0 && l === ""));

  // Add indent to continuation lines (lines that don't start with a major keyword)
  const majorRe = new RegExp(
    `^(?:${sorted.map((kw) => kw.replace(/\s+/g, "\\s+")).join("|")})(?:\\s|$)`,
    "i"
  );

  const indented = lines.map((line, i) => {
    if (i === 0) return line;
    if (majorRe.test(line)) return line;
    return "  " + line;
  });

  return indented.join("\n");
}

function minifySql(raw: string): string {
  // Remove single-line comments
  let sql = raw.replace(/--[^\n]*/g, " ");
  // Remove multi-line comments
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  // Collapse whitespace
  sql = sql.replace(/\s+/g, " ").trim();
  return sql;
}

// ---------------------------------------------------------------------------
// Tokenizer for format (splits into code / string / comment segments)
// ---------------------------------------------------------------------------

type SegType = "code" | "string" | "block-comment" | "line-comment";

interface Segment {
  type: SegType;
  value: string;
}

function tokenizeForFormat(sql: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  let codeStart = 0;

  const flush = (end: number) => {
    if (end > codeStart) {
      segments.push({ type: "code", value: sql.slice(codeStart, end) });
    }
  };

  while (i < sql.length) {
    // String literal
    if (sql[i] === "'") {
      flush(i);
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue; }
        if (sql[j] === "'") { j++; break; }
        j++;
      }
      segments.push({ type: "string", value: sql.slice(i, j) });
      i = j;
      codeStart = i;
      continue;
    }
    // Block comment
    if (sql[i] === "/" && sql[i + 1] === "*") {
      flush(i);
      const end = sql.indexOf("*/", i + 2);
      const j = end === -1 ? sql.length : end + 2;
      segments.push({ type: "block-comment", value: sql.slice(i, j) });
      i = j;
      codeStart = i;
      continue;
    }
    // Line comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      flush(i);
      const nl = sql.indexOf("\n", i + 2);
      const j = nl === -1 ? sql.length : nl;
      segments.push({ type: "line-comment", value: sql.slice(i, j) });
      i = j;
      codeStart = i;
      continue;
    }
    i++;
  }
  flush(sql.length);
  return segments;
}

// ---------------------------------------------------------------------------
// Syntax highlighter — returns React nodes
// ---------------------------------------------------------------------------

interface Token {
  type: "keyword" | "string" | "number" | "comment" | "plain";
  value: string;
}

function tokenizeSql(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    // Block comment
    if (sql[i] === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      const j = end === -1 ? sql.length : end + 2;
      tokens.push({ type: "comment", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    // Line comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i + 2);
      const j = nl === -1 ? sql.length : nl;
      tokens.push({ type: "comment", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    // String
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue; }
        if (sql[j] === "'") { j++; break; }
        j++;
      }
      tokens.push({ type: "string", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    // Number
    if (/[0-9]/.test(sql[i]) && (i === 0 || /[\s,(=<>+\-*\/]/.test(sql[i - 1]))) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ type: "number", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    // Keyword (word boundary check)
    if (/[A-Za-z_]/.test(sql[i])) {
      // Read the full word (or multi-word up to 3 words)
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++;
      const word = sql.slice(i, j);

      // Try two-word keyword first (e.g. "GROUP BY")
      let matched = false;
      if (/\s/.test(sql[j] ?? "")) {
        let k = j;
        while (k < sql.length && sql[k] === " ") k++;
        let m = k;
        while (m < sql.length && /[A-Za-z0-9_]/.test(sql[m])) m++;
        const twoWord = word + " " + sql.slice(k, m);
        if (HIGHLIGHT_KEYWORDS.includes(twoWord.toUpperCase())) {
          tokens.push({ type: "keyword", value: sql.slice(i, m) });
          i = m;
          matched = true;
        }
      }
      if (!matched) {
        if (HIGHLIGHT_KEYWORDS.includes(word.toUpperCase())) {
          tokens.push({ type: "keyword", value: word });
        } else {
          tokens.push({ type: "plain", value: word });
        }
        i = j;
      }
      continue;
    }
    // Plain character
    tokens.push({ type: "plain", value: sql[i] });
    i++;
  }
  return tokens;
}

function renderHighlighted(sql: string): React.ReactNode {
  const tokens = tokenizeSql(sql);
  const COLOR: Record<Token["type"], string> = {
    keyword: "#60a5fa",
    string: "#34d399",
    number: "#00DDEB",
    comment: "#78716c",
    plain: "#1c1917",
  };
  return (
    <>
      {tokens.map((tok, idx) => (
        <span key={idx} style={{ color: COLOR[tok.type] }}>
          {tok.value}
        </span>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Validation warnings
// ---------------------------------------------------------------------------

function validateSql(sql: string): string[] {
  const warnings: string[] = [];
  const stripped = sql.replace(/'(?:[^'\\]|\\.)*'/g, "''").replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  for (const ch of stripped) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
  }
  if (depth > 0) warnings.push(`Ubalancerede parenteser: ${depth} åbne parentes${depth !== 1 ? "er" : ""} mangler lukning.`);
  if (depth < 0) warnings.push(`Ubalancerede parenteser: ${Math.abs(depth)} lukkende parentes${Math.abs(depth) !== 1 ? "er" : ""} uden åbning.`);

  const trimmed = sql.trimEnd();
  if (trimmed.length > 0 && !trimmed.endsWith(";")) {
    warnings.push("Manglende semikolon (;) i slutningen af SQL-sætningen.");
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SqlFormatterTab() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const warnings = input.trim() ? validateSql(input) : [];

  function handleFormat() {
    if (!input.trim()) return;
    setOutput(formatSql(input));
  }

  function handleMinify() {
    if (!input.trim()) return;
    setOutput(minifySql(input));
  }

  function handleCopy() {
    const text = output || input;
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <h2
        style={{
          margin: "0 0 20px 0",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        SQL Formatter
      </h2>

      {/* Input */}
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-2)",
            marginBottom: 6,
          }}
        >
          SQL-input
        </label>
        <textarea
          className="uv-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
          }}
          placeholder={
            "SELECT u.id, u.name, COUNT(o.id) AS order_count\nFROM users u LEFT JOIN orders o ON u.id = o.user_id\nWHERE u.active = 1 GROUP BY u.id, u.name ORDER BY order_count DESC LIMIT 10;"
          }
          rows={8}
          spellCheck={false}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 14px",
            fontSize: 13.5,
            fontFamily: "monospace",
            border: "1px solid #e8e5e1",
            borderRadius: 8,
            background: "#fff",
            color: "var(--text)",
            resize: "vertical",
            outline: "none",
          }}
        />
      </div>

      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {warnings.map((w, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fffbeb",
                border: "1px solid #fcd34d",
                borderRadius: 20,
                padding: "5px 12px",
                fontSize: 13,
                color: "#92400e",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ⚠
              </span>
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <button
          className="uv-btn"
          onClick={handleFormat}
          style={{
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid #e8e5e1",
            borderRadius: 8,
            background: "#1c1917",
            color: "#f9f8f6",
            cursor: "pointer",
          }}
        >
          Formatér SQL
        </button>
        <button
          className="uv-btn"
          onClick={handleMinify}
          style={{
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid #e8e5e1",
            borderRadius: 8,
            background: "#f9f8f6",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Minificer
        </button>
        <button
          className="uv-btn"
          onClick={handleCopy}
          style={{
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid #e8e5e1",
            borderRadius: 8,
            background: copied ? "#f0fdf4" : "#f9f8f6",
            color: copied ? "#16a34a" : "var(--text-2)",
            cursor: "pointer",
          }}
        >
          {copied ? "Kopieret!" : "Kopier"}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-2)",
              marginBottom: 8,
            }}
          >
            Resultat
          </div>
          <div
            className="uv-card-1"
            style={{
              background: "#fafaf9",
              border: "1px solid #e8e5e1",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <pre
              style={{
                margin: 0,
                padding: "16px 18px",
                overflowX: "auto",
                fontSize: 13.5,
                lineHeight: 1.7,
                fontFamily: "monospace",
                whiteSpace: "pre",
                background: "transparent",
              }}
            >
              <code>{renderHighlighted(output)}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Input highlighted preview when no output yet */}
      {!output && input.trim() && (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-2)",
              marginBottom: 8,
            }}
          >
            Preview (klik Formatér eller Minificer for at transformere)
          </div>
          <div
            className="uv-card-1"
            style={{
              background: "#fafaf9",
              border: "1px solid #e8e5e1",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <pre
              style={{
                margin: 0,
                padding: "16px 18px",
                overflowX: "auto",
                fontSize: 13.5,
                lineHeight: 1.7,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                background: "transparent",
              }}
            >
              <code>{renderHighlighted(input)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
