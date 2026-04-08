"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Section = "stocks" | "currency" | "invest";

const CURRENCY_INFO: Record<string, { flag: string; name: string }> = {
  EUR: { flag: "🇪🇺", name: "Euro" },
  USD: { flag: "🇺🇸", name: "Amerikansk dollar" },
  GBP: { flag: "🇬🇧", name: "Britisk pund" },
  SEK: { flag: "🇸🇪", name: "Svensk krone" },
  NOK: { flag: "🇳🇴", name: "Norsk krone" },
  CHF: { flag: "🇨🇭", name: "Schweizisk franc" },
  JPY: { flag: "🇯🇵", name: "Japansk yen" },
  PLN: { flag: "🇵🇱", name: "Polsk zloty" },
  CZK: { flag: "🇨🇿", name: "Tjekkisk krone" },
  CNY: { flag: "🇨🇳", name: "Kinesisk yuan" },
  CAD: { flag: "🇨🇦", name: "Canadisk dollar" },
  AUD: { flag: "🇦🇺", name: "Australsk dollar" },
  DKK: { flag: "🇩🇰", name: "Dansk krone" },
  HUF: { flag: "🇭🇺", name: "Ungarsk forint" },
  ISK: { flag: "🇮🇸", name: "Islandsk krone" },
};

const CURRENCIES = Object.keys(CURRENCY_INFO);

type SearchResult = { symbol: string; name: string; exchange: string; type: string };

type StockQuote = {
  symbol: string; name: string; currency: string; exchange: string;
  currentPrice: number; previousClose: number; change: number; changePercent: number;
  volume: number; marketCap?: number; pe?: number; eps?: number;
  week52High?: number; week52Low?: number; dividendYield?: number;
  closes: number[];
};

type NewsItem = { title: string; link: string; pubDate: string };
type RateData  = { base: string; date: string; rates: Record<string, number> };
type HistEntry = { date: string; price: number };

function fmt(v: number | undefined | null, d = 2): string {
  if (v == null) return "—";
  return v.toLocaleString("da-DK", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtCap(v: number): string {
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `${(v / 1e6).toFixed(2)}M`;
  return String(v);
}

// ─── Stock Search ─────────────────────────────────────────────────────────────

function StockSearch() {
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSug, setShowSug]       = useState(false);
  const [quote, setQuote]           = useState<StockQuote | null>(null);
  const [news, setNews]             = useState<NewsItem[]>([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stock?action=search&symbol=_&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setShowSug(true);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function loadStock(symbol: string, name: string) {
    setQuery(name || symbol);
    setShowSug(false);
    setSuggestions([]);
    setLoading(true);
    try {
      const [qRes, nRes] = await Promise.all([
        fetch(`/api/stock?action=quote&symbol=${symbol}`),
        fetch(`/api/stock?action=news&symbol=${symbol}`),
      ]);
      const qData = await qRes.json();
      const nData = await nRes.json();
      if (qData.currentPrice) setQuote(qData);
      setNews(nData.news ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  const pos = (quote?.change ?? 0) >= 0;
  const sparkData = quote?.closes.map((p, i) => ({ i, price: p })) ?? [];

  const POPULAR = [
    { symbol: "AAPL",    name: "Apple" },
    { symbol: "NVDA",    name: "NVIDIA" },
    { symbol: "MSFT",    name: "Microsoft" },
    { symbol: "TSLA",    name: "Tesla" },
    { symbol: "NVO",     name: "Novo Nordisk" },
    { symbol: "AMZN",    name: "Amazon" },
    { symbol: "GOOG",    name: "Alphabet" },
    { symbol: "^GSPC",   name: "S&P 500" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search bar */}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) { setSuggestions([]); setShowSug(false); setQuote(null); }}}
          onFocus={() => suggestions.length > 0 && setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder="Søg aktie, ETF eller indeks (f.eks. Apple, AAPL, NVO)…"
          className="uv-input"
          style={{ width: "100%", fontSize: 15, boxSizing: "border-box" }}
        />
        {showSug && suggestions.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30,
            borderRadius: 10, overflow: "hidden",
            background: "rgba(20,19,18,0.98)", border: "1.5px solid rgba(91,66,243,0.35)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}>
            {suggestions.map(s => (
              <button key={s.symbol} onMouseDown={() => loadStock(s.symbol, s.name)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", cursor: "pointer", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: "rgba(91,66,243,0.2)", color: "#a78bfa", flexShrink: 0 }}>{s.symbol}</span>
                <span style={{ fontSize: 13, color: "#1c1917", flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: 10, color: "var(--text-3)" }}>{s.exchange}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular chips */}
      {!quote && !loading && (
        <div>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Populære</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {POPULAR.map(s => (
              <button key={s.symbol} onClick={() => loadStock(s.symbol, s.name)} style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "var(--text-2)",
              }}>{s.symbol}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <p style={{ color: "var(--text-3)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>Henter aktiedata…</p>}

      {quote && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Price header */}
          <div style={{
            padding: "20px 24px", borderRadius: 16,
            background: pos ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
            border: `1.5px solid ${pos ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#1c1917" }}>{quote.symbol}</span>
                <span style={{ fontSize: 11, color: "var(--text-3)", padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.07)" }}>{quote.exchange}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 12px" }}>{quote.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 38, fontWeight: 900, color: "#1c1917", lineHeight: 1 }}>
                  {fmt(quote.currentPrice)} {quote.currency}
                </span>
                <span style={{
                  padding: "4px 12px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                  background: pos ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: pos ? "#22c55e" : "#ef4444",
                }}>
                  {pos ? "▲" : "▼"} {fmt(Math.abs(quote.change))} ({fmt(Math.abs(quote.changePercent))}%)
                </span>
              </div>
            </div>

            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
              {[
                { label: "Markedsværdi", value: quote.marketCap ? fmtCap(quote.marketCap) : "—" },
                { label: "P/E",          value: fmt(quote.pe) },
                { label: "EPS",          value: fmt(quote.eps) },
                { label: "Udbytte",      value: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : "—" },
                { label: "52u høj",      value: fmt(quote.week52High) },
                { label: "52u lav",      value: fmt(quote.week52Low) },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 10, color: "var(--text-3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{m.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline chart */}
          {sparkData.length > 1 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 18px" }}>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={pos ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={pos ? "#22c55e" : "#ef4444"} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="i" hide />
                      <YAxis domain={["auto", "auto"]} tick={{ fill: "#a8a29e", fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
                      <Tooltip contentStyle={{ background: "#ffffff", border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 10, color: "#1c1917" }} formatter={(v) => [`${fmt(Number(v))} ${quote.currency}`, "Pris"]} labelFormatter={() => ""} />
                      <Area dataKey="price" stroke={pos ? "#22c55e" : "#ef4444"} strokeWidth={2} fill="url(#sGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* News */}
          {news.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", margin: "0 0 8px" }}>📰 Seneste nyheder</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {news.slice(0, 6).map((n, i) => (
                  <a key={i} href={n.link} target="_blank" rel="noreferrer" style={{
                    display: "block", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)",
                    textDecoration: "none",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", margin: "0 0 3px", lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{new Date(n.pubDate).toLocaleDateString("da-DK")}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Currency Converter ────────────────────────────────────────────────────────

function CurrencyConverter() {
  const [base, setBase]     = useState("DKK");
  const [amount, setAmount] = useState(1000);
  const [rates, setRates]   = useState<RateData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/currency?base=${base}`)
      .then(r => r.json())
      .then(d => { if (d.rates) setRates(d); })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, [base]);

  const sorted = useMemo(() => {
    if (!rates) return [];
    const priority = ["EUR", "USD", "GBP", "SEK", "NOK", "CHF", "JPY", "PLN", "CZK", "CNY", "CAD", "AUD", "HUF", "ISK"];
    const entries = Object.entries(rates.rates);
    return [
      ...priority.filter(c => rates.rates[c]).map(c => [c, rates.rates[c]] as [string, number]),
      ...entries.filter(([c]) => !priority.includes(c)).sort((a, b) => a[0].localeCompare(b[0])),
    ];
  }, [rates]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Beløb</label>
          <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="uv-input" style={{ width: 130, fontSize: 16, fontWeight: 700 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Fra valuta</label>
          <select value={base} onChange={e => setBase(e.target.value)} className="uv-input" style={{ fontSize: 14, fontWeight: 600, width: 140 }}>
            {CURRENCIES.map(c => (
              <option key={c} value={c} style={{ background: "#ffffff" }}>
                {CURRENCY_INFO[c]?.flag} {c} — {CURRENCY_INFO[c]?.name}
              </option>
            ))}
          </select>
        </div>
        {rates && <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Kurs fra: {rates.date}</p>}
      </div>

      {loading && <p style={{ color: "var(--text-3)", fontSize: 13 }}>Henter kurser…</p>}

      {rates && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8 }}>
          {sorted.map(([currency, rate]) => {
            const info = CURRENCY_INFO[currency];
            const converted = amount * rate;
            return (
              <div key={currency} style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{info?.flag ?? "🌍"}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#1c1917", margin: 0 }}>{currency}</p>
                    <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0 }}>{info?.name ?? currency}</p>
                  </div>
                </div>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#a78bfa", margin: 0 }}>
                  {converted >= 1000
                    ? converted.toLocaleString("da-DK", { maximumFractionDigits: 0 })
                    : converted.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-3)", margin: "2px 0 0" }}>
                  1 {base} = {rate >= 0.01 ? rate.toFixed(4) : rate.toExponential(3)} {currency}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Investment Calculator ────────────────────────────────────────────────────

function InvestmentCalc() {
  const [symbol, setSymbol]     = useState("");
  const [symbolName, setSymbolName] = useState("");
  const [amount, setAmount]     = useState(10000);
  const [years, setYears]       = useState(10);
  const [history, setHistory]   = useState<HistEntry[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [suggestions, setSugs]  = useState<SearchResult[]>([]);
  const [showSug, setShowSug]   = useState(false);

  useEffect(() => {
    if (symbol.length < 2) { setSugs([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stock?action=search&symbol=_&q=${encodeURIComponent(symbol)}`);
        const data = await res.json();
        setSugs(data.results ?? []);
        setShowSug(true);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [symbol]);

  async function calculate() {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setHistory([]);
    try {
      const res = await fetch(`/api/stock/history?symbol=${symbol}&years=${years + 1}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setHistory(data.history ?? []);
    } catch {
      setError("Kunne ikke hente historisk data");
    }
    setLoading(false);
  }

  const result = useMemo(() => {
    if (history.length < 2) return null;
    const now = new Date();
    const targetDate = new Date(now.getFullYear() - years, now.getMonth(), 1);
    const targetStr = targetDate.toISOString().slice(0, 7);
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const entry = sorted.find(h => h.date >= targetStr) ?? sorted[0];
    const latest = sorted[sorted.length - 1];
    if (!entry || !latest || entry.date === latest.date) return null;
    const ratio = latest.price / entry.price;
    const currentValue = amount * ratio;
    const gain = currentValue - amount;
    const gainPct = (ratio - 1) * 100;
    const annualReturn = (Math.pow(ratio, 1 / years) - 1) * 100;
    const chartData = sorted.filter(h => h.date >= entry.date).map(h => ({
      date: h.date,
      value: Math.round(amount * (h.price / entry.price)),
    }));
    return { currentValue, gain, gainPct, annualReturn, chartData, entryDate: entry.date };
  }, [history, years, amount]);

  const isGain = (result?.gain ?? 0) >= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0 }}>
        Se hvad din investering ville være værd i dag, hvis du investerede for X år siden.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Ticker */}
        <div style={{ position: "relative" }}>
          <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Aktie / ETF (ticker)</label>
          <input
            value={symbol}
            onChange={e => { setSymbol(e.target.value.toUpperCase()); setSymbolName(""); }}
            onBlur={() => setTimeout(() => setShowSug(false), 150)}
            placeholder="f.eks. AAPL, MSFT, NVO, ^GSPC"
            className="uv-input"
            style={{ width: "100%", boxSizing: "border-box", fontSize: 14, textTransform: "uppercase" }}
          />
          {showSug && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, marginTop: 4, borderRadius: 10, background: "rgba(20,19,18,0.98)", border: "1.5px solid rgba(91,66,243,0.35)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", overflow: "hidden" }}>
              {suggestions.map(s => (
                <button key={s.symbol} onMouseDown={() => { setSymbol(s.symbol); setSymbolName(s.name); setShowSug(false); setSugs([]); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px", cursor: "pointer", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: "rgba(91,66,243,0.2)", color: "#a78bfa" }}>{s.symbol}</span>
                  <span style={{ fontSize: 13, color: "#1c1917" }}>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Amount */}
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Investeret beløb</label>
            <div style={{ position: "relative" }}>
              <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="uv-input" style={{ width: "100%", boxSizing: "border-box", paddingRight: 44, fontSize: 15, fontWeight: 700 }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-3)" }}>kr.</span>
            </div>
          </div>
          {/* Years */}
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              År siden: <span style={{ color: "#a78bfa" }}>{years} år</span>
            </label>
            <input type="range" min={1} max={30} value={years} onChange={e => setYears(parseInt(e.target.value))} style={{ width: "100%", marginTop: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>1 år</span>
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>30 år</span>
            </div>
          </div>
        </div>

        <button onClick={calculate} disabled={!symbol || loading} className="uv-btn">
          <span className="uv-btn-text"><span>{loading ? "Beregner…" : "📈 Beregn"}</span></span>
        </button>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            padding: "24px 28px", borderRadius: 20,
            background: isGain ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
            border: `1.5px solid ${isGain ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 12px" }}>
              {symbolName || symbol} — investeret {years} år siden ({result.entryDate})
            </p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Investeret</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#1c1917", margin: 0 }}>{amount.toLocaleString("da-DK")} kr.</p>
              </div>
              <span style={{ fontSize: 24, color: "var(--text-3)", marginBottom: 2 }}>→</span>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Værdi i dag</p>
                <p style={{ fontSize: 30, fontWeight: 900, color: isGain ? "#22c55e" : "#ef4444", margin: 0 }}>
                  {Math.round(result.currentValue).toLocaleString("da-DK")} kr.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { label: "Gevinst/tab",    value: `${isGain ? "+" : ""}${Math.round(result.gain).toLocaleString("da-DK")} kr.` },
                { label: "Samlet afkast",  value: `${isGain ? "+" : ""}${result.gainPct.toFixed(1)}%` },
                { label: "Årligt afkast",  value: `${isGain ? "+" : ""}${result.annualReturn.toFixed(1)}%/år` },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 2px" }}>{s.label}</p>
                  <p style={{ fontSize: 17, fontWeight: 800, color: isGain ? "#22c55e" : "#ef4444", margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {result.chartData.length > 1 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 18px" }}>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 8px" }}>Investeringens vækst (kr.)</p>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData}>
                      <defs>
                        <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isGain ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={isGain ? "#22c55e" : "#ef4444"} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: "#a8a29e", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: "#a8a29e", fontSize: 10 }} axisLine={false} tickLine={false} width={70} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "#ffffff", border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 10, color: "#1c1917" }}
                        formatter={(v) => [`${Number(v).toLocaleString("da-DK")} kr.`, "Værdi"]} />
                      <Area dataKey="value" stroke={isGain ? "#22c55e" : "#ef4444"} strokeWidth={2.5} fill="url(#iGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StocksTab() {
  const [section, setSection] = useState<Section>("stocks");

  const sections = [
    { id: "stocks"   as Section, label: "📈 Aktier",      desc: "Søg aktier, ETF'er og indeks" },
    { id: "currency" as Section, label: "💱 Valuta",      desc: "Live valutakurser og omregner" },
    { id: "invest"   as Section, label: "🧮 Investering", desc: "Hvad hvis jeg investerede?" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Aktier & Investering</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Aktiekurser, valuta og investeringsberegner</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, cursor: "pointer",
            background: section === s.id ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${section === s.id ? "rgba(91,66,243,0.5)" : "rgba(255,255,255,0.08)"}`,
          }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: section === s.id ? "#a78bfa" : "#1c1917", margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{s.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          {section === "stocks"   && <StockSearch />}
          {section === "currency" && <CurrencyConverter />}
          {section === "invest"   && <InvestmentCalc />}
        </div>
      </div>
    </div>
  );
}
