"use client";

import { useState, useRef } from "react";
import type { StockResponse, StockQuote, StockNews } from "@/app/api/stocks/route";
import { Search, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 260, h = 64, pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const color = positive ? "#2dd4bf" : "#f43f5e";
  const fillId = `sf-${positive ? "g" : "r"}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polygon
        points={`${pad},${h} ${pts.join(" ")} ${w - pad},${h}`}
        fill={`url(#${fillId})`}
      />
    </svg>
  );
}

function fmt(n: number | undefined, decimals = 2) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString("da-DK", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{ fontSize: 13, color: "#78716c" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#e7e5e4" }}>{value}</span>
    </div>
  );
}

function NewsCard({ n }: { n: StockNews }) {
  const date = new Date(n.publishedAt).toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noopener noreferrer"
      className="uv-card-1"
      style={{ textDecoration: "none", display: "block", cursor: "pointer" }}
    >
      <div className="uv-card-1-inner" style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
        {n.thumbnail && (
          <img
            src={n.thumbnail}
            alt=""
            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f4f1ee", margin: 0, lineHeight: 1.4, marginBottom: 6 }}>
            {n.title}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#2dd4bf", fontWeight: 500 }}>{n.source}</span>
            <span style={{ fontSize: 12, color: "#57534e" }}>{date}</span>
          </div>
          {n.summary && (
            <p style={{ fontSize: 12, color: "#78716c", margin: "6px 0 0", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {n.summary}
            </p>
          )}
        </div>
        <ExternalLink style={{ width: 14, height: 14, color: "#57534e", flexShrink: 0, marginTop: 2 }} />
      </div>
    </a>
  );
}

function QuoteCard({ quote, sparkline }: { quote: StockQuote; sparkline: number[] }) {
  const pos = quote.change >= 0;
  const stateColor = quote.marketState === "REGULAR" ? "#4ade80" : "#f59e0b";
  const stateLabel = quote.marketState === "REGULAR" ? "Åbent" : quote.marketState === "PRE" ? "Pre-market" : "Lukket";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, marginBottom: 24, alignItems: "start" }}>
      {/* Left: price + meta */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2dd4bf",
            background: "rgba(45,212,191,0.1)", padding: "2px 10px", borderRadius: 99 }}>
            {quote.symbol}
          </span>
          <span style={{ fontSize: 12, color: "#78716c" }}>{quote.exchange}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: stateColor,
            background: `${stateColor}18`, padding: "2px 8px", borderRadius: 99 }}>
            {stateLabel}
          </span>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#a8a29e", margin: "0 0 12px" }}>
          {quote.name}
        </h2>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: "#f4f1ee", letterSpacing: "-1px" }}>
            {quote.price.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style={{ fontSize: 18, fontWeight: 500, color: "#78716c", marginLeft: 6 }}>{quote.currency}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6,
            color: pos ? "#4ade80" : "#f43f5e",
            background: pos ? "rgba(74,222,128,0.1)" : "rgba(244,63,94,0.1)",
            padding: "4px 12px", borderRadius: 99 }}>
            {pos ? <TrendingUp style={{ width: 15, height: 15 }} /> : <TrendingDown style={{ width: 15, height: 15 }} />}
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              {pos ? "+" : ""}{quote.change.toFixed(2)} ({pos ? "+" : ""}{quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Right: sparkline */}
      <div style={{ paddingTop: 8 }}>
        <Sparkline data={sparkline} positive={pos} />
        <p style={{ fontSize: 11, color: "#57534e", textAlign: "right", margin: "4px 0 0" }}>30 dage</p>
      </div>
    </div>
  );
}

export default function AktieTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StockResponse | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q = query) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/stocks?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Fejl"); return; }
      setResult(data as StockResponse);
    } catch {
      setError("Noget gik galt. Prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  const suggestions = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "NOVO-B.CO"];

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Aktiesøgning</h2>
      <p style={{ color: "var(--text-2)", marginBottom: 24 }}>
        Søg på ticker eller virksomhedsnavn — f.eks. <em>Apple</em> eller <em>AAPL</em>
      </p>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          ref={inputRef}
          className="uv-input"
          placeholder="Apple, AAPL, Novo Nordisk…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{ flex: 1 }}
        />
        <button className="uv-btn" onClick={() => search()} disabled={loading}>
          <span className="uv-btn-text">
            <span>{loading ? "Søger…" : "Søg"}</span>
          </span>
        </button>
      </div>

      {/* Quick picks */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => { setQuery(s); search(s); }}
            style={{
              fontSize: 12, fontWeight: 600, color: "#2dd4bf",
              background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.25)",
              borderRadius: 99, padding: "4px 12px", cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loader */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="uv-loader-bounce" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)",
          borderRadius: 12, padding: "14px 20px", color: "#f43f5e", fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div>
          {/* Quote card */}
          <div className="uv-card-1" style={{ marginBottom: 24 }}>
            <div className="uv-card-1-inner" style={{ padding: 28 }}>
              <QuoteCard quote={result.quote} sparkline={result.sparkline} />

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <div>
                  <StatRow label="Åbningskurs" value={result.quote.open != null ? fmt(result.quote.open) + " " + result.quote.currency : "—"} />
                  <StatRow label="Forrige luk" value={result.quote.previousClose != null ? fmt(result.quote.previousClose) + " " + result.quote.currency : "—"} />
                  <StatRow label="Dagshøj" value={result.quote.dayHigh != null ? fmt(result.quote.dayHigh) + " " + result.quote.currency : "—"} />
                  <StatRow label="Dagslavpunkt" value={result.quote.dayLow != null ? fmt(result.quote.dayLow) + " " + result.quote.currency : "—"} />
                </div>
                <div>
                  <StatRow label="52-ugers høj" value={result.quote.high52 != null ? fmt(result.quote.high52) + " " + result.quote.currency : "—"} />
                  <StatRow label="52-ugers lav" value={result.quote.low52 != null ? fmt(result.quote.low52) + " " + result.quote.currency : "—"} />
                  <StatRow label="Markedsværdi" value={result.quote.marketCap != null ? fmt(result.quote.marketCap) + " " + result.quote.currency : "—"} />
                  <StatRow label="P/E" value={result.quote.peRatio != null ? result.quote.peRatio.toFixed(2) : "—"} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px", marginTop: 0 }}>
                <StatRow label="Volumen" value={result.quote.volume != null ? fmt(result.quote.volume, 0) : "—"} />
                <StatRow label="Gns. volumen (3M)" value={result.quote.avgVolume != null ? fmt(result.quote.avgVolume, 0) : "—"} />
              </div>
            </div>
          </div>

          {/* News */}
          {result.news.length > 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
                Nyheder om {result.quote.name}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.news.map((n, i) => (
                  <NewsCard key={i} n={n} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
