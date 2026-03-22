"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Brain,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertTriangle,
  Radio,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { NewsItem, NewsResponse } from "@/app/api/news/route";
import type { Mover, MarketMoversResponse } from "@/app/api/market-movers/route";

const SOURCE_STYLE: Record<string, { color: string; bg: string; text: string }> = {
  // Cyber security — industry & market
  darkreading:       { color: "#f43f5e", bg: "rgba(244,63,94,0.12)",   text: "Dark Reading" },
  securityweek:      { color: "#fb7185", bg: "rgba(251,113,133,0.12)", text: "SecurityWeek" },
  scmagazine:        { color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",  text: "SC Magazine" },
  helpnetsec:        { color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  text: "Help Net Security" },
  infosecmag:        { color: "#14b8a6", bg: "rgba(20,184,166,0.12)",  text: "Infosecurity Mag" },
  therecord:         { color: "#34d399", bg: "rgba(52,211,153,0.12)",  text: "The Record" },
  krebs:             { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  text: "Krebs on Security" },
  csoonline:         { color: "#22d3ee", bg: "rgba(34,211,238,0.12)",  text: "CSO Online" },
  // AI tools & products
  producthunt:       { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  text: "Product Hunt" },
  bensbites:         { color: "#4ade80", bg: "rgba(74,222,128,0.12)",  text: "Ben's Bites" },
  therundown:        { color: "#0d9488", bg: "rgba(13,148,136,0.12)",  text: "The Rundown AI" },
  reddit_aitools:    { color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",  text: "r/AItools" },
  reddit_artificial: { color: "#a3e635", bg: "rgba(163,230,53,0.12)",  text: "r/artificial" },
  reddit_llama:      { color: "#34d399", bg: "rgba(52,211,153,0.12)",  text: "r/LocalLLaMA" },
  ainews:            { color: "#14b8a6", bg: "rgba(20,184,166,0.12)",  text: "AI News" },
  hackernews:        { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  text: "Hacker News" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "lige nu";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}t`;
  return `${Math.floor(hrs / 24)}d`;
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const style = SOURCE_STYLE[item.sourceId] ?? { color: "#57534e", bg: "#f7f5f2", text: item.source };

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="uv-card-1" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Number */}
          <span style={{ fontSize: 12, color: "var(--text-3)", minWidth: 20, paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {String(index + 1).padStart(2, "0")}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: style.color,
                backgroundColor: style.bg,
                padding: "2px 7px",
                borderRadius: 20,
              }}>
                {style.text}
              </span>

              {false && (
                <span>
                  {/* severity removed */}
                </span>
              )}

              <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
                <Clock style={{ width: 10, height: 10 }} />
                {timeAgo(item.publishedAt)}
              </span>
            </div>

            {/* Title */}
            <p style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#f4f1ee",
              lineHeight: 1.45,
              marginBottom: item.summary ? 5 : 0,
              fontFamily: item.sourceId === "nvd" ? "monospace" : "inherit",
            }}>
              {item.title}
            </p>

            {/* Summary */}
            {item.summary && (
              <p style={{
                fontSize: 12,
                color: "var(--text-2)",
                lineHeight: 1.5,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
                {item.summary}
              </p>
            )}
          </div>

          <ExternalLink style={{ width: 13, height: 13, color: "var(--text-3)", flexShrink: 0, marginTop: 3 }} />
        </div>
      </div>
    </a>
  );
}

interface NewsPanelProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  items: NewsItem[];
  loading: boolean;
  allSources: { id: string; label: string }[];
}

function NewsPanel({ title, icon, accentColor, items, loading, allSources }: NewsPanelProps) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? items : items.filter(i => i.sourceId === filter);
  const activeSources = allSources.filter(s => items.some(i => i.sourceId === s.id));

  return (
    <div className="section-panel">
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface-2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              backgroundColor: accentColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
            }}>
              {icon}
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                {loading ? "Henter nyheder..." : `${items.length} artikler · ${activeSources.length} kilder`}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e" }} />
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>Live</span>
          </div>
        </div>

        {/* Source filter */}
        {!loading && activeSources.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 20,
                border: "1px solid",
                borderColor: filter === "all" ? accentColor : "var(--border)",
                backgroundColor: filter === "all" ? accentColor : "transparent",
                color: filter === "all" ? "white" : "var(--text-2)",
                cursor: "pointer", fontWeight: filter === "all" ? 600 : 400,
              }}
            >
              Alle
            </button>
            {activeSources.map(s => {
              const count = items.filter(i => i.sourceId === s.id).length;
              const active = filter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  style={{
                    fontSize: 12, padding: "3px 10px", borderRadius: 20,
                    border: "1px solid",
                    borderColor: active ? accentColor : "var(--border)",
                    backgroundColor: active ? accentColor : "transparent",
                    color: active ? "white" : "var(--text-2)",
                    cursor: "pointer", fontWeight: active ? 600 : 400,
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {s.label}
                  <span style={{ opacity: 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 680, overflowY: "auto" }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 16px", animation: "pulse 1.5s ease-in-out infinite" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 20, height: 12, backgroundColor: "var(--border)", borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, backgroundColor: "var(--border)", borderRadius: 4, marginBottom: 8, width: "60%" }} />
                    <div style={{ height: 14, backgroundColor: "var(--surface-2)", borderRadius: 4, marginBottom: 6, width: "85%" }} />
                    <div style={{ height: 12, backgroundColor: "var(--surface-2)", borderRadius: 4, width: "70%" }} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>
            <AlertTriangle style={{ width: 28, height: 28, margin: "0 auto 8px" }} />
            <p style={{ fontSize: 14 }}>Ingen artikler fundet</p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <NewsCard key={`${item.url}-${i}`} item={item} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

function MoverRow({ m, rank, positive }: { m: Mover; rank: number; positive: boolean }) {
  const color = positive ? "#4ade80" : "#f43f5e";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 14px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 11, color: "#57534e", minWidth: 16, fontVariantNumeric: "tabular-nums" }}>
        {rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f1ee" }}>{m.symbol}</span>
          <span style={{ fontSize: 11, color: "#78716c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e7e5e4" }}>
          {m.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {m.currency}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
          {positive ? <TrendingUp style={{ width: 11, height: 11 }} /> : <TrendingDown style={{ width: 11, height: 11 }} />}
          {positive ? "+" : ""}{m.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function MarketMoversPanel({ movers, loading }: { movers: MarketMoversResponse | null; loading: boolean }) {
  return (
    <div className="uv-card-1" style={{ marginBottom: 0 }}>
      <div className="uv-card-1-inner">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Gainers */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp style={{ width: 14, height: 14, color: "#4ade80" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>Top 10 Stigninger</span>
            </div>
            {loading ? (
              <div style={{ padding: "20px 14px", color: "#57534e", fontSize: 13 }}>Henter data…</div>
            ) : (movers?.gainers ?? []).map((m, i) => (
              <MoverRow key={m.symbol} m={m} rank={i + 1} positive={true} />
            ))}
          </div>
          {/* Losers */}
          <div>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingDown style={{ width: 14, height: 14, color: "#f43f5e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f43f5e" }}>Top 10 Fald</span>
            </div>
            {loading ? (
              <div style={{ padding: "20px 14px", color: "#57534e", fontSize: 13 }}>Henter data…</div>
            ) : (movers?.losers ?? []).map((m, i) => (
              <MoverRow key={m.symbol} m={m} rank={i + 1} positive={false} />
            ))}
          </div>
        </div>
        {movers && (
          <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 11, color: "#57534e" }}>
            Største bevægelser i dag · Top globale aktier · Opdateret {new Date(movers.fetchedAt).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardTab() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [movers, setMovers] = useState<MarketMoversResponse | null>(null);
  const [moversLoading, setMoversLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed");
      const json: NewsResponse = await res.json();
      setData(json);
      setLastFetched(new Date());
    } catch {
      // keep old data
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovers = useCallback(async () => {
    setMoversLoading(true);
    try {
      const res = await fetch("/api/market-movers");
      if (res.ok) setMovers(await res.json());
    } catch {
      // keep old data
    } finally {
      setMoversLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchMovers();
  }, [fetchNews, fetchMovers]);

  const cyberSources = [
    { id: "darkreading",   label: "Dark Reading" },
    { id: "securityweek",  label: "SecurityWeek" },
    { id: "scmagazine",    label: "SC Magazine" },
    { id: "helpnetsec",    label: "Help Net Security" },
    { id: "infosecmag",    label: "Infosecurity Mag" },
    { id: "therecord",     label: "The Record" },
    { id: "krebs",         label: "Krebs" },
    { id: "csoonline",     label: "CSO Online" },
  ];

  const aiSources = [
    { id: "producthunt",       label: "Product Hunt" },
    { id: "bensbites",         label: "Ben's Bites" },
    { id: "therundown",        label: "The Rundown AI" },
    { id: "reddit_aitools",    label: "r/AItools" },
    { id: "reddit_artificial", label: "r/artificial" },
    { id: "reddit_llama",      label: "r/LocalLLaMA" },
    { id: "ainews",            label: "AI News" },
    { id: "hackernews",        label: "Hacker News" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Radio style={{ width: 14, height: 14, color: "var(--text-3)" }} />
            <span style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Nyhedsoverblik
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: 0, lineHeight: 1.2 }}>
            Intelligence Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 4 }}>
            Cyber Security markedet og nye AI-tools — 16 kilder
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastFetched && (
            <span style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock style={{ width: 12, height: 12 }} />
              {timeAgo(lastFetched.toISOString())} siden
            </span>
          )}
          <button
            onClick={fetchNews}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text-2)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 500,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} className={loading ? "spin" : ""} />
            Opdater
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Cyber Security", value: data?.cybersecurity.length ?? 0, color: "#f43f5e", sub: "marked & industri" },
          { label: "AI & Tools",     value: data?.ai.length ?? 0,            color: "#2dd4bf", sub: "nye produkter & tech" },
          { label: "Aktive kilder",  value: loading ? "—" : 16,              color: "#34d399", sub: "RSS, API & Reddit" },
        ].map(stat => (
          <div key={stat.label} className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 6,
                backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: stat.color }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                {loading && stat.value === 0
                  ? <div className="uv-loader-bounce" style={{ width: 40, height: 30, margin: 0 }} />
                  : stat.value
                }
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Market movers */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <TrendingUp style={{ width: 16, height: 16, color: "#2dd4bf" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            Dagens Markedsbevægelser
          </h2>
          <span style={{ fontSize: 12, color: "#57534e" }}>— top globale aktier</span>
        </div>
        <MarketMoversPanel movers={movers} loading={moversLoading} />
      </div>

      {/* Two column news */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        <NewsPanel
          title="Cyber Security — Marked & Industri"
          icon={<Shield style={{ width: 14, height: 14 }} />}
          accentColor="#b91c1c"
          items={data?.cybersecurity ?? []}
          loading={loading}
          allSources={cyberSources}
        />
        <NewsPanel
          title="AI Tools & Ny Teknologi"
          icon={<Brain style={{ width: 14, height: 14 }} />}
          accentColor="#0d9488"
          items={data?.ai ?? []}
          loading={loading}
          allSources={aiSources}
        />
      </div>

    </div>
  );
}
