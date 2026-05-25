"use client";

import React, { useState, useMemo, useCallback } from "react";

type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL" | "UNKNOWN";

interface LogEntry {
  id: number;
  raw: string;
  level: LogLevel;
  timestamp: string;
  source: string;
  message: string;
}

interface LevelConfig {
  color: string;
  bg: string;
  border: string;
  label: string;
}

const LEVEL_CONFIG: Record<LogLevel, LevelConfig> = {
  TRACE: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", label: "TRACE" },
  DEBUG: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", label: "DEBUG" },
  INFO:  { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", label: "INFO" },
  WARN:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)", label: "WARN" },
  ERROR: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", label: "ERROR" },
  FATAL: { color: "#e879f9", bg: "rgba(232,121,249,0.1)", border: "rgba(232,121,249,0.3)", label: "FATAL" },
  UNKNOWN: { color: "#94a3b8", bg: "rgba(148,163,184,0.05)", border: "rgba(148,163,184,0.2)", label: "???" },
};

const LOG_LEVEL_PATTERNS: [LogLevel, RegExp][] = [
  ["FATAL", /\b(FATAL|CRITICAL)\b/i],
  ["ERROR", /\b(ERROR|ERR|SEVERE)\b/i],
  ["WARN",  /\b(WARN|WARNING)\b/i],
  ["INFO",  /\b(INFO|INFORMATION)\b/i],
  ["DEBUG", /\b(DEBUG|DBG)\b/i],
  ["TRACE", /\b(TRACE|TRC|VERBOSE)\b/i],
];

function detectLevel(line: string): LogLevel {
  for (const [level, pattern] of LOG_LEVEL_PATTERNS) {
    if (pattern.test(line)) return level;
  }
  return "UNKNOWN";
}

const TS_PATTERNS = [
  /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,
  /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  /(\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?)/,
];

function extractTimestamp(line: string): string {
  for (const p of TS_PATTERNS) {
    const m = line.match(p);
    if (m) return m[1];
  }
  return "";
}

const SOURCE_PATTERNS = [
  /\[([^\]]{1,60})\]/,
  /(?:at |from |source[:= ])([a-zA-Z0-9_.$/]+)/,
  /([a-zA-Z][a-zA-Z0-9_.$/]{5,60})\s*[-:]/,
];

function extractSource(line: string): string {
  for (const p of SOURCE_PATTERNS) {
    const m = line.match(p);
    if (m) return m[1];
  }
  return "";
}

function parseLog(raw: string): LogEntry[] {
  const lines = raw.split(/\r?\n/);
  return lines
    .filter(l => l.trim().length > 0)
    .map((line, i) => ({
      id: i,
      raw: line,
      level: detectLevel(line),
      timestamp: extractTimestamp(line),
      source: extractSource(line),
      message: line.trim(),
    }));
}

function groupErrors(entries: LogEntry[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of entries) {
    if (e.level === "ERROR" || e.level === "FATAL") {
      // extract key part of message (first 80 chars stripped of timestamps/ids)
      const key = e.message
        .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\s]*/g, "")
        .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27}\b/gi, "<uuid>")
        .replace(/\b\d{5,}\b/g, "<id>")
        .trim()
        .slice(0, 80);
      map[key] = (map[key] || 0) + 1;
    }
  }
  return map;
}

const SAMPLE_LOG = `2024-03-15 08:12:01.123 INFO  [main] Application started successfully
2024-03-15 08:12:02.456 DEBUG [http-nio-8080] Processing request GET /api/users
2024-03-15 08:12:02.789 INFO  [http-nio-8080] Response: 200 OK (12ms)
2024-03-15 08:12:05.001 WARN  [scheduler] Job 'dailyReport' took longer than expected: 3200ms
2024-03-15 08:12:07.333 ERROR [db-pool] Connection timeout after 5000ms - retrying (1/3)
2024-03-15 08:12:09.444 ERROR [db-pool] Connection timeout after 5000ms - retrying (2/3)
2024-03-15 08:12:11.555 ERROR [db-pool] Connection timeout after 5000ms - failed permanently
2024-03-15 08:12:11.556 ERROR [http-nio-8080] Request failed: java.sql.SQLException: Unable to acquire connection
2024-03-15 08:12:15.000 INFO  [health-check] System health: OK
2024-03-15 08:12:20.100 DEBUG [cache] Cache miss for key: user:12345
2024-03-15 08:12:20.200 INFO  [cache] Loaded user:12345 from database
2024-03-15 08:12:25.999 WARN  [auth] Failed login attempt for user: unknown@email.com
2024-03-15 08:12:30.000 INFO  [main] Scheduled task completed: cleanupSessions`;

export default function LogFilterTab() {
  const [rawLog, setRawLog] = useState("");
  const [keyword, setKeyword] = useState("");
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    new Set(["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "UNKNOWN"])
  );
  const [showGroups, setShowGroups] = useState(false);

  const entries = useMemo(() => parseLog(rawLog), [rawLog]);

  const levelCounts = useMemo(() => {
    const counts: Record<LogLevel, number> = {
      TRACE: 0, DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0, UNKNOWN: 0,
    };
    for (const e of entries) counts[e.level]++;
    return counts;
  }, [entries]);

  const maxCount = useMemo(() => Math.max(...Object.values(levelCounts), 1), [levelCounts]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (!enabledLevels.has(e.level)) return false;
      if (keyword.trim()) {
        return e.message.toLowerCase().includes(keyword.toLowerCase());
      }
      return true;
    });
  }, [entries, enabledLevels, keyword]);

  const errorGroups = useMemo(() => groupErrors(entries), [entries]);

  const toggleLevel = useCallback((level: LogLevel) => {
    setEnabledLevels(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  const highlightKeyword = (text: string) => {
    if (!keyword.trim()) return text;
    const lower = text.toLowerCase();
    const kwLower = keyword.toLowerCase();
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    let idx = lower.indexOf(kwLower, cursor);
    while (idx !== -1) {
      if (idx > cursor) parts.push(text.slice(cursor, idx));
      parts.push(
        <mark key={idx} style={{ background: "rgba(251,191,36,0.35)", color: "inherit", borderRadius: 2 }}>
          {text.slice(idx, idx + keyword.length)}
        </mark>
      );
      cursor = idx + keyword.length;
      idx = lower.indexOf(kwLower, cursor);
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return <>{parts}</>;
  };

  const activeLevels = (Object.keys(LEVEL_CONFIG) as LogLevel[]).filter(
    l => l !== "UNKNOWN" && levelCounts[l] > 0
  );

  return (
    <div style={{ padding: "24px 0", maxWidth: 960, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        📊 Log Filter
      </h2>
      <p style={{ color: "var(--text-2)", marginBottom: 8, fontSize: 14, lineHeight: 1.65 }}>
        Universal log-parser der virker med alle log-formater (Java, Node, Python, Nginx, Docker m.fl.).
        Niveauer auto-detekteres ud fra nøgleord i linjen — du behøver ikke formatere noget manuelt.
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", fontSize: 13, color: "var(--text-3)" }}>
        <span>📌 Klik på et niveau i oversigten for at skjule/vise</span>
        <span>🔍 Søgefeltet fremhæver alle forekomster i teksten</span>
        <span>🔴 Fejl-grupperingen viser hvilke fejl der gentager sig</span>
      </div>

      {/* Input */}
      <div className="uv-card-1" style={{ marginBottom: 20 }}>
        <div className="uv-card-1-inner" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>Log-output</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="uv-btn"
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => setRawLog(SAMPLE_LOG)}
              >
                Eksempel
              </button>
              {rawLog && (
                <button
                  className="uv-btn"
                  style={{ fontSize: 12, padding: "4px 10px", background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                  onClick={() => { setRawLog(""); setKeyword(""); }}
                >
                  Ryd
                </button>
              )}
            </div>
          </div>
          <textarea
            className="uv-input"
            value={rawLog}
            onChange={e => setRawLog(e.target.value)}
            placeholder={"Indsæt log-linjer her...\n\n2024-03-15 08:12:01 INFO  Starting application\n2024-03-15 08:12:05 ERROR Database connection failed"}
            style={{
              minHeight: 160,
              fontFamily: "monospace",
              fontSize: 12,
              resize: "vertical",
            }}
          />
          {entries.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>
              {entries.length} linjer parset
            </span>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <>
          {/* Level frequency bars */}
          <div className="uv-card-1" style={{ marginBottom: 16 }}>
            <div className="uv-card-1-inner">
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  Niveau-oversigt — <span style={{ color: "var(--text-2)", fontWeight: 400 }}>{entries.length} linjer</span>
                </p>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>Klik for at skjule/vise et niveau</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(Object.keys(LEVEL_CONFIG) as LogLevel[]).map(level => {
                  const count = levelCounts[level];
                  if (count === 0) return null;
                  const cfg = LEVEL_CONFIG[level];
                  const pct = (count / maxCount) * 100;
                  const active = enabledLevels.has(level);
                  return (
                    <div
                      key={level}
                      onClick={() => toggleLevel(level)}
                      style={{
                        cursor: "pointer",
                        opacity: active ? 1 : 0.4,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.06)"}`,
                        background: active ? cfg.bg : "transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{
                        minWidth: 58, fontSize: 10, fontWeight: 800, color: cfg.color,
                        fontFamily: "monospace", textAlign: "center", letterSpacing: "0.05em",
                        background: `${cfg.color}20`, borderRadius: 4, padding: "2px 6px",
                      }}>
                        {cfg.label}
                      </span>
                      <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: cfg.color,
                            borderRadius: 6,
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                      <span style={{ minWidth: 28, fontSize: 12, fontWeight: 600, color: cfg.color, textAlign: "right" }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              className="uv-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="🔍 Søg i log-linjer..."
              style={{ flex: 1, minWidth: 200, fontSize: 13 }}
            />
            <button
              className="uv-btn"
              style={{
                fontSize: 12,
                padding: "6px 14px",
                background: showGroups ? "rgba(248,113,113,0.2)" : undefined,
                color: showGroups ? "#f87171" : undefined,
              }}
              onClick={() => setShowGroups(v => !v)}
            >
              🔴 Fejl-gruppering
            </button>
            <button
              className="uv-btn"
              style={{ fontSize: 12, padding: "6px 14px" }}
              onClick={() => setEnabledLevels(new Set(["TRACE","DEBUG","INFO","WARN","ERROR","FATAL","UNKNOWN"]))}
            >
              Vis alle
            </button>
            <button
              className="uv-btn"
              style={{ fontSize: 12, padding: "6px 14px" }}
              onClick={() => setEnabledLevels(new Set(["WARN","ERROR","FATAL"]))}
            >
              Kun fejl
            </button>
          </div>

          {/* Error groups */}
          {showGroups && Object.keys(errorGroups).length > 0 && (
            <div className="uv-card-1" style={{ marginBottom: 16 }}>
              <div className="uv-card-1-inner">
                <p style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 10 }}>
                  🔴 Fejl-grupper ({Object.keys(errorGroups).length} unikke)
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(errorGroups)
                    .sort((a, b) => b[1] - a[1])
                    .map(([msg, count]) => (
                      <div
                        key={msg}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 10px",
                          background: "rgba(248,113,113,0.08)",
                          borderRadius: 6,
                          border: "1px solid rgba(248,113,113,0.2)",
                        }}
                      >
                        <span style={{
                          minWidth: 28, height: 24, display: "flex", alignItems: "center",
                          justifyContent: "center", background: "#f87171", color: "#fff",
                          borderRadius: 12, fontSize: 11, fontWeight: 700,
                        }}>
                          {count}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "monospace" }}>
                          {msg}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Log lines */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 0 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Viser <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> af {entries.length} linjer
                </span>
                {keyword && (
                  <span style={{ fontSize: 11, color: "#fbbf24", background: "rgba(251,191,36,0.12)", borderRadius: 4, padding: "2px 8px" }}>
                    søger: &quot;{keyword}&quot;
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)" }}>
                    Ingen linjer matcher filteret
                  </div>
                ) : (
                  filtered.map(entry => {
                    const cfg = LEVEL_CONFIG[entry.level];
                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "9px 16px",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          borderLeft: `4px solid ${cfg.color}`,
                          background: cfg.bg,
                          alignItems: "flex-start",
                        }}
                      >
                        <span style={{
                          fontSize: 10, fontWeight: 800, color: cfg.color,
                          fontFamily: "monospace", letterSpacing: "0.04em",
                          background: `${cfg.color}22`, borderRadius: 4, padding: "2px 6px",
                          minWidth: 50, textAlign: "center", flexShrink: 0,
                        }}>
                          {cfg.label}
                        </span>
                        {entry.timestamp && (
                          <span style={{
                            fontSize: 11, color: "var(--text-3)", fontFamily: "monospace",
                            paddingTop: 3, minWidth: 90, whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {entry.timestamp}
                          </span>
                        )}
                        <span style={{ fontSize: 12.5, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all", flex: 1, lineHeight: 1.55 }}>
                          {highlightKeyword(entry.message)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
