"use client";

import { useState, useMemo } from "react";

type Mode = "csv2json" | "json2csv";
type Separator = "," | ";" | "\t";

const SEP_LABELS: { value: Separator; label: string }[] = [
  { value: ",", label: "Komma (,)" },
  { value: ";", label: "Semikolon (;)" },
  { value: "\t", label: "Tab (\\t)" },
];

function parseCsv(text: string, sep: Separator): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  return lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === sep && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells;
  });
}

function csvToJson(text: string, sep: Separator): { result: string; error: string | null } {
  try {
    const rows = parseCsv(text, sep);
    if (rows.length < 2) {
      return { result: "", error: "CSV skal have mindst én header-række og én data-række." };
    }
    const headers = rows[0];
    const objects = rows.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = (row[i] ?? "").trim();
      });
      return obj;
    });
    return { result: JSON.stringify(objects, null, 2), error: null };
  } catch (e) {
    return { result: "", error: "Kunne ikke parse CSV: " + (e as Error).message };
  }
}

function jsonToCsv(text: string, sep: Separator): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return { result: "", error: "JSON skal være et array af objekter ([ {...}, {...} ])." };
    }
    if (parsed.length === 0) {
      return { result: "", error: "JSON-arrayet er tomt." };
    }
    const headers = Array.from(
      new Set(parsed.flatMap((obj) => (typeof obj === "object" && obj !== null ? Object.keys(obj) : [])))
    );
    const escape = (v: unknown): string => {
      const s = v === null || v === undefined ? "" : String(v);
      if (s.includes(sep) || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const headerRow = headers.map(escape).join(sep);
    const dataRows = parsed.map((obj) =>
      headers.map((h) => escape((obj as Record<string, unknown>)[h])).join(sep)
    );
    return { result: [headerRow, ...dataRows].join("\n"), error: null };
  } catch (e) {
    return { result: "", error: "Ugyldig JSON: " + (e as Error).message };
  }
}

function detectSeparator(text: string): Separator {
  const counts: Record<Separator, number> = { ",": 0, ";": 0, "\t": 0 };
  const lines = text.split(/\r?\n/).slice(0, 5);
  for (const line of lines) {
    counts[","] += (line.match(/,/g) || []).length;
    counts[";"] += (line.match(/;/g) || []).length;
    counts["\t"] += (line.match(/\t/g) || []).length;
  }
  if (counts[";"] > counts[","] && counts[";"] > counts["\t"]) return ";";
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"] ) return "\t";
  return ",";
}

function highlightJson(json: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(true|false|null)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(json)) !== null) {
    if (match.index > last) {
      tokens.push(json.slice(last, match.index));
    }
    if (match[1]) {
      // key
      const key = match[1].replace(/:\s*$/, "");
      const colon = match[1].slice(key.length);
      tokens.push(
        <span key={match.index + "k"} style={{ color: "#f59e0b" }}>
          {key}
        </span>
      );
      tokens.push(colon);
    } else if (match[2]) {
      tokens.push(
        <span key={match.index + "s"} style={{ color: "#f9f8f6" }}>
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      tokens.push(
        <span key={match.index + "n"} style={{ color: "#60a5fa" }}>
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      tokens.push(
        <span key={match.index + "b"} style={{ color: "#f87171" }}>
          {match[4]}
        </span>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < json.length) tokens.push(json.slice(last));
  return tokens;
}

const CSV_PLACEHOLDER = `navn,alder,by
Alice,30,København
Bob,25,Aarhus
Carol,35,Odense`;

const JSON_PLACEHOLDER = `[
  { "navn": "Alice", "alder": 30, "by": "København" },
  { "navn": "Bob", "alder": 25, "by": "Aarhus" }
]`;

export default function CsvJsonTab() {
  const [mode, setMode] = useState<Mode>("csv2json");
  const [csvInput, setCsvInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [csvSep, setCsvSep] = useState<Separator>(",");
  const [jsonSep, setJsonSep] = useState<Separator>(",");
  const [copiedOutput, setCopiedOutput] = useState(false);

  const csvResult = useMemo(() => {
    if (!csvInput.trim()) return { result: "", error: null };
    return csvToJson(csvInput, csvSep);
  }, [csvInput, csvSep]);

  const jsonResult = useMemo(() => {
    if (!jsonInput.trim()) return { result: "", error: null };
    return jsonToCsv(jsonInput, jsonSep);
  }, [jsonInput, jsonSep]);

  const csvPreviewRows = useMemo(() => {
    if (!csvInput.trim() || csvResult.error) return null;
    const rows = parseCsv(csvInput, csvSep);
    if (rows.length < 2) return null;
    return { headers: rows[0], data: rows.slice(1, 11) };
  }, [csvInput, csvSep, csvResult.error]);

  function handleAutoDetect() {
    if (csvInput.trim()) {
      setCsvSep(detectSeparator(csvInput));
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 1500);
    });
  }

  function handleDownload(text: string, filename: string, mime: string) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeOutput = mode === "csv2json" ? csvResult.result : jsonResult.result;
  const activeError = mode === "csv2json" ? csvResult.error : jsonResult.error;

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
        CSV ↔ JSON Konverter
      </h2>

      {/* Mode tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          background: "#f9f8f6",
          border: "1px solid #e8e5e1",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {(
          [
            { value: "csv2json", label: "CSV → JSON" },
            { value: "json2csv", label: "JSON → CSV" },
          ] as { value: Mode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.value}
            className="uv-btn"
            onClick={() => setMode(tab.value)}
            style={{
              padding: "7px 20px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 7,
              cursor: "pointer",
              background: mode === tab.value ? "#fff" : "transparent",
              color: mode === tab.value ? "var(--text)" : "var(--text-3)",
              boxShadow: mode === tab.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "csv2json" ? (
        <div>
          {/* CSV Input */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-2)",
                marginBottom: 6,
              }}
            >
              CSV-input
            </label>
            <textarea
              className="uv-input"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={CSV_PLACEHOLDER}
              rows={7}
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

          {/* Separator + auto-detect */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
              Separator:
            </span>
            {SEP_LABELS.map((s) => (
              <label
                key={s.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13.5,
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="csvSep"
                  value={s.value}
                  checked={csvSep === s.value}
                  onChange={() => setCsvSep(s.value as Separator)}
                  style={{ accentColor: "#1c1917" }}
                />
                {s.label}
              </label>
            ))}
            <button
              className="uv-btn"
              onClick={handleAutoDetect}
              style={{
                padding: "5px 14px",
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid #e8e5e1",
                borderRadius: 6,
                background: "#f9f8f6",
                color: "var(--text-2)",
                cursor: "pointer",
              }}
            >
              Auto-detektér
            </button>
          </div>

          {/* Preview table */}
          {csvPreviewRows && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-2)",
                  marginBottom: 8,
                }}
              >
                Preview (første {Math.min(csvPreviewRows.data.length, 10)} rækker)
              </div>
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #e8e5e1",
                  borderRadius: 8,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f9f8f6" }}>
                      {csvPreviewRows.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "var(--text)",
                            borderBottom: "1px solid #e8e5e1",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreviewRows.data.map((row, ri) => (
                      <tr
                        key={ri}
                        style={{
                          borderBottom:
                            ri < csvPreviewRows.data.length - 1
                              ? "1px solid #f0ede9"
                              : "none",
                        }}
                      >
                        {csvPreviewRows.headers.map((_, ci) => (
                          <td
                            key={ci}
                            style={{
                              padding: "7px 12px",
                              color: "var(--text-2)",
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* JSON Input */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-2)",
                marginBottom: 6,
              }}
            >
              JSON-input (array af objekter)
            </label>
            <textarea
              className="uv-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={JSON_PLACEHOLDER}
              rows={7}
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

          {/* Separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
              Separator:
            </span>
            {SEP_LABELS.map((s) => (
              <label
                key={s.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13.5,
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="jsonSep"
                  value={s.value}
                  checked={jsonSep === s.value}
                  onChange={() => setJsonSep(s.value as Separator)}
                  style={{ accentColor: "#1c1917" }}
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {activeError && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#dc2626",
            fontSize: 13.5,
          }}
        >
          {activeError}
        </div>
      )}

      {/* Output */}
      {activeOutput && !activeError && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
              Output
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="uv-btn"
                onClick={() => handleCopy(activeOutput)}
                style={{
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1px solid #e8e5e1",
                  borderRadius: 6,
                  background: copiedOutput ? "#f0fdf4" : "#f9f8f6",
                  color: copiedOutput ? "#16a34a" : "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                {copiedOutput ? "Kopieret!" : "Kopier"}
              </button>
              <button
                className="uv-btn"
                onClick={() =>
                  handleDownload(
                    activeOutput,
                    mode === "csv2json" ? "output.json" : "output.csv",
                    mode === "csv2json" ? "application/json" : "text/csv"
                  )
                }
                style={{
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1px solid #e8e5e1",
                  borderRadius: 6,
                  background: "#f9f8f6",
                  color: "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                Download {mode === "csv2json" ? ".json" : ".csv"}
              </button>
            </div>
          </div>

          <div
            className="uv-card-1"
            style={{
              background: "#1c1917",
              border: "1px solid #2d2926",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <pre
              style={{
                margin: 0,
                padding: "16px 18px",
                overflowX: "auto",
                fontSize: 13,
                lineHeight: 1.6,
                fontFamily: "monospace",
                color: "#f9f8f6",
                whiteSpace: "pre",
              }}
            >
              <code>
                {mode === "csv2json" ? highlightJson(activeOutput) : activeOutput}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
