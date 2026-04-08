"use client";

import { useState } from "react";

// ─── Provider data ─────────────────────────────────────────────────────────────

interface Provider {
  id: string; name: string; domain: string;
  color: string; bg: string; initials: string;
  network: "TDC" | "Telenor" | "3" | "Ukendt";
  networkLabel: string; coverage: number; fiveG: boolean;
}

const PROVIDERS: Provider[] = [
  { id: "cbb",     name: "CBB Mobil",   domain: "cbb.dk",         color: "#e30613", bg: "#fff0f0", initials: "CB",
    network: "Telenor", networkLabel: "Telenor-nettet",        coverage: 99.5, fiveG: true  },
  { id: "telmore", name: "Telmore",     domain: "telmore.dk",     color: "#0072bc", bg: "#f0f7ff", initials: "TM",
    network: "TDC",     networkLabel: "TDC NET",               coverage: 99.9, fiveG: true  },
  { id: "norlys",  name: "Norlys",      domain: "norlys.dk",      color: "#00b388", bg: "#f0fdf8", initials: "NL",
    network: "Telenor", networkLabel: "TT-nettet",             coverage: 99.5, fiveG: true  },
  { id: "telenor", name: "Telenor",     domain: "telenor.dk",     color: "#009bde", bg: "#f0faff", initials: "TN",
    network: "Telenor", networkLabel: "Telenor eget net (TT-Netværket)", coverage: 99.5, fiveG: true  },
  { id: "yousee",  name: "YouSee",      domain: "yousee.dk",      color: "#c8102e", bg: "#fff0f2", initials: "YS",
    network: "TDC",     networkLabel: "TDC NET",               coverage: 99.9, fiveG: true  },
  { id: "3mobil",  name: "3 Mobil",     domain: "3.dk",           color: "#ff6600", bg: "#fff7f0", initials: "3",
    network: "3",       networkLabel: "3 eget net",            coverage: 99.0, fiveG: true  },
  { id: "lyca",    name: "Lyca Mobile", domain: "lycamobile.dk",  color: "#8b1a4a", bg: "#fdf0f5", initials: "LY",
    network: "Telenor", networkLabel: "TT-nettet",             coverage: 99.5, fiveG: false },
  { id: "lebara",  name: "Lebara",      domain: "lebara.dk",      color: "#e40046", bg: "#fff0f4", initials: "LE",
    network: "Telenor", networkLabel: "TT-nettet",             coverage: 99.5, fiveG: false },
  { id: "andet",   name: "Andet",       domain: "",               color: "#6b7280", bg: "#f3f4f6", initials: "?",
    network: "Ukendt",  networkLabel: "Afhænger af selskab",   coverage: 99.0, fiveG: false },
];

const NET_INFO: Record<string, { color: string; bars: number; desc: string }> = {
  TDC:     { color: "#003087", bars: 5, desc: "Danmarks største net — 99,9% dækning, 5G+" },
  Telenor: { color: "#009bde", bars: 4, desc: "Næststørste net (deles med Telia via TT) — 99,5% dækning, 5G" },
  "3":     { color: "#ff6600", bars: 4, desc: "Stærkt i byerne — 99% dækning, 5G" },
  Ukendt:  { color: "#9ca3af", bars: 3, desc: "Netværk afhænger af valgt selskab" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubEntry { price: number; dataGb: number; unlimited: boolean; }
interface Plan { providerId: string; subs: SubEntry[]; tvPrice: number; }

const newSub = (): SubEntry => ({ price: 0, dataGb: 10, unlimited: false });
const emptyPlan = (): Plan => ({ providerId: "", subs: [newSub()], tvPrice: 0 });

// ─── Coverage map operators ───────────────────────────────────────────────────

interface CoverageOperator {
  id: string;
  name: string;
  color: string;
  bg: string;
  buildUrl: (lat: number, lng: number) => string;
}

const COVERAGE_OPERATORS: CoverageOperator[] = [
  {
    id: "tdcnet",
    name: "TDC NET",
    color: "#003087",
    bg: "#eef2ff",
    buildUrl: () => "https://www.tdcnet.dk/daekningskort",
  },
  {
    id: "telenor",
    name: "Telenor",
    color: "#009bde",
    bg: "#e0f4ff",
    buildUrl: (lat, lng) => `https://daekning.telenor.dk/?lat=${lat}&lng=${lng}`,
  },
  {
    id: "3",
    name: "3 (Hi3G)",
    color: "#ff6600",
    bg: "#fff3e8",
    buildUrl: () => "https://www.3.dk/daekningskort/",
  },
];

// ─── Address coverage section ─────────────────────────────────────────────────

interface CoverageResult {
  lat: number;
  lng: number;
  name: string;
}

function CoverageSection() {
  const [address, setAddress]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<CoverageResult | null>(null);
  const [error, setError]       = useState<string | null>(null);

  async function handleCheck() {
    const trimmed = address.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = `https://dawa.aws.dk/adresser?q=${encodeURIComponent(trimmed)}&struktur=mini`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Netværksfejl ved opslag");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError("Adressen blev ikke fundet. Prøv en mere præcis adresse.");
      } else {
        const first = data[0];
        setResult({ lat: first.y, lng: first.x, name: first.betegnelse });
      }
    } catch {
      setError("Der opstod en fejl. Tjek din forbindelse og prøv igen.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleCheck();
  }

  return (
    <div style={{
      background: "var(--bg, #fff)",
      border: "1.5px solid #e5e7eb",
      borderRadius: 20,
      padding: "28px 32px",
      marginBottom: 32,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontSize: 18, fontWeight: 800, color: "var(--text, #111827)",
          margin: "0 0 4px", letterSpacing: "-0.3px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>📍</span> Dækning på din adresse
        </h2>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          Indtast din adresse og se dækningskort for alle tre netværk
        </p>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="F.eks. Rådhuspladsen 1, København"
          style={{
            flex: 1, minWidth: 220,
            padding: "11px 16px", borderRadius: 12,
            fontSize: 14, fontWeight: 500,
            border: "1.5px solid #e5e7eb",
            outline: "none", boxSizing: "border-box",
            background: "var(--bg, #fff)",
            color: "var(--text, #111827)",
          }}
        />
        <button
          onClick={handleCheck}
          disabled={loading || !address.trim()}
          style={{
            padding: "11px 22px", borderRadius: 12, border: "none",
            background: loading || !address.trim() ? "#e5e7eb" : "#3b82f6",
            color: loading || !address.trim() ? "#9ca3af" : "#fff",
            fontSize: 14, fontWeight: 700, cursor: loading || !address.trim() ? "not-allowed" : "pointer",
            transition: "all 0.15s", whiteSpace: "nowrap",
            letterSpacing: "-0.1px",
          }}
        >
          {loading ? "Slår op…" : "Tjek dækning"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16, padding: "12px 16px", borderRadius: 12,
          background: "#fff1f2", border: "1.5px solid #fecdd3",
          color: "#be123c", fontSize: 13, fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Resolved address */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 12,
            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
          }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#15803d", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fundet adresse</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#166534", margin: 0 }}>{result.name}</p>
            </div>
          </div>

          {/* Operator cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {COVERAGE_OPERATORS.map(op => (
              <a
                key={op.id}
                href={op.buildUrl(result.lat, result.lng)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  padding: "16px 18px", borderRadius: 14,
                  background: op.bg,
                  border: `1.5px solid ${op.color}33`,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 16px ${op.color}28`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                <span style={{
                  fontSize: 13, fontWeight: 800, color: op.color,
                  letterSpacing: "-0.2px",
                }}>{op.name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: op.color,
                  opacity: 0.85,
                }}>
                  Åbn dækningskort →
                </span>
              </a>
            ))}
          </div>

          {/* Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{
              fontSize: 12, color: "#6b7280", margin: 0,
              padding: "10px 14px", borderRadius: 10,
              background: "#f9fafb", border: "1px solid #e5e7eb",
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, color: "#374151" }}>ℹ️ Om kortene: </span>
              Alle tre kort viser den faktiske 4G/5G-dækning på adressen
            </p>
            <p style={{
              fontSize: 12, color: "#374151", margin: 0,
              padding: "10px 14px", borderRadius: 10,
              background: "#fffbeb", border: "1px solid #fde68a",
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700 }}>⭐ Anbefaling: </span>
              TDC NET har 99,9% dækning — bedst til indendørs. Telenor 99,5%. 3 er stærkest i byerne.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProviderLogo({ p, size = 44 }: { p: Provider; size?: number }) {
  const [err, setErr] = useState(false);
  if (!p.domain || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10,
        background: p.bg, border: `1.5px solid ${p.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, color: p.color, fontSize: size * 0.32,
        letterSpacing: "-0.5px",
      }}>{p.initials}</div>
    );
  }
  return (
    <img
      src={`https://logo.clearbit.com/${p.domain}`}
      alt={p.name}
      onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 4, border: "1.5px solid #e5e7eb" }}
    />
  );
}

function NetworkBars({ bars, color }: { bars: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 5, borderRadius: 2, height: 5 + i * 4,
          background: i <= bars ? color : "#e5e7eb",
        }} />
      ))}
    </div>
  );
}

const DATA_OPTIONS = [5, 10, 20, 30, 50, 100, 200];

function PlanSelector({
  label, plan, setPlan, accent,
}: {
  label: string; plan: Plan; setPlan: (p: Plan) => void; accent: string;
}) {
  const provider = PROVIDERS.find(p => p.id === plan.providerId);

  function setCount(n: number) {
    const current = plan.subs;
    const newSubs = Array.from({ length: n }, (_, i) =>
      i < current.length ? current[i] : { ...current[current.length - 1] ?? newSub() }
    );
    setPlan({ ...plan, subs: newSubs });
  }

  function updateSub(i: number, patch: Partial<SubEntry>) {
    const subs = plan.subs.map((s, j) => j === i ? { ...s, ...patch } : s);
    setPlan({ ...plan, subs });
  }

  const totalMonthly = plan.subs.reduce((sum, s) => sum + s.price, 0) + plan.tvPrice;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 }} />
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>{label}</h3>
        {totalMonthly > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 800, color: accent }}>
            {totalMonthly.toLocaleString("da-DK")} kr./mdr.
          </span>
        )}
      </div>

      {/* Provider grid */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Vælg selskab</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PROVIDERS.map(p => {
            const selected = plan.providerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlan({ ...plan, providerId: p.id })}
                style={{
                  padding: "10px 8px", borderRadius: 12, cursor: "pointer", border: "none",
                  outline: selected ? `2px solid ${accent}` : "2px solid #e5e7eb",
                  background: selected ? `${accent}0d` : "#fafafa",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                  transition: "all 0.15s",
                  boxShadow: selected ? `0 0 0 3px ${accent}20` : "none",
                }}
              >
                <ProviderLogo p={p} size={38} />
                <span style={{ fontSize: 9.5, fontWeight: 700, color: selected ? accent : "#4b5563", textAlign: "center", lineHeight: 1.3 }}>
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {provider && (
        <>
          {/* Network badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", borderRadius: 12,
            background: `${NET_INFO[provider.network].color}0a`,
            border: `1.5px solid ${NET_INFO[provider.network].color}22`,
          }}>
            <NetworkBars bars={NET_INFO[provider.network].bars} color={NET_INFO[provider.network].color} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: NET_INFO[provider.network].color, margin: 0 }}>
                {provider.networkLabel}
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>{provider.coverage}% befolkningsdækning</p>
            </div>
            {provider.fiveG && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                background: provider.color, color: "#fff", letterSpacing: "0.05em",
              }}>5G</span>
            )}
          </div>

          {/* Count selector */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Antal abonnementer</p>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3,4,5,6].map(n => {
                const active = plan.subs.length === n;
                return (
                  <button key={n} onClick={() => setCount(n)} style={{
                    width: 40, height: 40, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer",
                    border: "none",
                    outline: active ? `2px solid ${accent}` : "2px solid #e5e7eb",
                    background: active ? `${accent}10` : "#fafafa",
                    color: active ? accent : "#374151",
                    transition: "all 0.12s",
                  }}>{n}</button>
                );
              })}
            </div>
          </div>

          {/* TV-pakke */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>TV-pakke (valgfri)</p>
            <div style={{ position: "relative", maxWidth: 180 }}>
              <input
                type="number"
                value={plan.tvPrice || ""}
                onChange={e => setPlan({ ...plan, tvPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                style={{
                  width: "100%", padding: "9px 38px 9px 12px", borderRadius: 9,
                  fontSize: 15, fontWeight: 700, border: "1.5px solid #e5e7eb",
                  outline: "none", boxSizing: "border-box",
                  background: "#fff", color: "#111827",
                }}
              />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>kr./mdr.</span>
            </div>
          </div>

          {/* Per-subscription rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {plan.subs.length === 1 ? "Abonnement" : `${plan.subs.length} abonnementer`}
            </p>
            {plan.subs.map((sub, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 12,
                background: "#fafafa", border: "1.5px solid #e5e7eb",
              }}>
                {plan.subs.length > 1 && (
                  <p style={{ fontSize: 11, fontWeight: 700, color: accent, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Abonnement {i + 1}
                  </p>
                )}
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {/* Price */}
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Pris/mdr.</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={sub.price || ""}
                        onChange={e => updateSub(i, { price: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        style={{
                          width: "100%", padding: "9px 38px 9px 12px", borderRadius: 9,
                          fontSize: 15, fontWeight: 700, border: `1.5px solid ${accent}33`,
                          outline: "none", boxSizing: "border-box",
                          background: "#fff", color: "#111827",
                        }}
                      />
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>kr.</span>
                    </div>
                  </div>

                  {/* Data */}
                  <div style={{ flex: 2, minWidth: 160 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Data</label>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {DATA_OPTIONS.map(gb => {
                        const active = sub.dataGb === gb && !sub.unlimited;
                        return (
                          <button key={gb} onClick={() => updateSub(i, { dataGb: gb, unlimited: false })} style={{
                            padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
                            border: "none", outline: active ? `2px solid ${accent}` : "1.5px solid #e5e7eb",
                            background: active ? `${accent}12` : "#fff",
                            color: active ? accent : "#374151", transition: "all 0.12s",
                          }}>{gb} GB</button>
                        );
                      })}
                      <button onClick={() => updateSub(i, { unlimited: true })} style={{
                        padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        border: "none", outline: sub.unlimited ? `2px solid ${accent}` : "1.5px solid #e5e7eb",
                        background: sub.unlimited ? `${accent}12` : "#fff",
                        color: sub.unlimited ? accent : "#374151", transition: "all 0.12s",
                      }}>∞</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function MobilTab() {
  const [current, setCurrent] = useState<Plan>(emptyPlan());
  const [next, setNext]       = useState<Plan>(emptyPlan());

  const currProvider = PROVIDERS.find(p => p.id === current.providerId);
  const nextProvider = PROVIDERS.find(p => p.id === next.providerId);

  const currMonthly = current.subs.reduce((s, x) => s + x.price, 0) + current.tvPrice;
  const nextMonthly = next.subs.reduce((s, x) => s + x.price, 0) + next.tvPrice;
  const monthlyDiff = nextMonthly - currMonthly;
  const yearlyDiff  = monthlyDiff * 12;

  const currData  = current.subs.some(s => s.unlimited) ? Infinity : current.subs.reduce((s, x) => s + x.dataGb, 0);
  const nextData  = next.subs.some(s => s.unlimited) ? Infinity : next.subs.reduce((s, x) => s + x.dataGb, 0);
  const dataDiff  = nextData === Infinity ? Infinity : currData === Infinity ? -Infinity : nextData - currData;

  const sameNet   = currProvider?.network === nextProvider?.network;
  const ready     = currProvider && nextProvider && currMonthly > 0 && nextMonthly > 0;

  const savingColor = monthlyDiff < 0 ? "#16a34a" : monthlyDiff > 0 ? "#ea580c" : "#374151";
  const savingBg    = monthlyDiff < 0 ? "#f0fdf4" : monthlyDiff > 0 ? "#fff7ed" : "#f9fafb";
  const savingBorder= monthlyDiff < 0 ? "#bbf7d0" : monthlyDiff > 0 ? "#fed7aa" : "#e5e7eb";

  return (
    <div style={{
      background: "#fff",
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid #f0f0f0",
        padding: "20px 32px",
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <span style={{ fontSize: 22 }}>📱</span>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>Mobilabonnement-sammenligner</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Vælg selskaber og se hvad du sparer</p>
        </div>
      </div>

      <div style={{ padding: "32px 32px 80px" }}>

        {/* ─── Address coverage section ──────────────────────────────────────────── */}
        <CoverageSection />

        {/* Two-column selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 0, alignItems: "start" }}>
          {/* Current plan */}
          <div style={{
            background: "#fff", borderRadius: "16px 0 0 16px",
            border: "1.5px solid #e5e7eb", borderRight: "none",
            padding: 28,
          }}>
            <PlanSelector label="Nuværende løsning" plan={current} setPlan={setCurrent} accent="#6366f1" />
          </div>

          {/* VS divider */}
          <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            paddingTop: 70,
            background: "#fafafa", borderTop: "1.5px solid #e5e7eb", borderBottom: "1.5px solid #e5e7eb",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#f3f4f6", border: "1.5px solid #e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#9ca3af",
            }}>VS</div>
          </div>

          {/* New plan */}
          <div style={{
            background: "#fff", borderRadius: "0 16px 16px 0",
            border: "1.5px solid #e5e7eb", borderLeft: "none",
            padding: 28,
          }}>
            <PlanSelector label="Ny løsning" plan={next} setPlan={setNext} accent="#10b981" />
          </div>
        </div>

        {/* ─── Results ─────────────────────────────────────────────────────────── */}
        {ready ? (
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Big verdict */}
            <div style={{
              background: savingBg, border: `1.5px solid ${savingBorder}`,
              borderRadius: 20, padding: "28px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
            }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {monthlyDiff < 0 ? "Du sparer" : monthlyDiff > 0 ? "Du betaler mere" : "Samme udgift"}
                </p>
                <p style={{ fontSize: 48, fontWeight: 900, color: savingColor, margin: 0, lineHeight: 1, letterSpacing: "-1px" }}>
                  {monthlyDiff === 0 ? "0 kr./mdr." : `${Math.abs(monthlyDiff).toLocaleString("da-DK")} kr./mdr.`}
                </p>
                {monthlyDiff !== 0 && (
                  <p style={{ fontSize: 15, color: "#6b7280", margin: "6px 0 0" }}>
                    Det er <b style={{ color: savingColor }}>{Math.abs(yearlyDiff).toLocaleString("da-DK")} kr. om året</b>
                  </p>
                )}
              </div>

              {/* Provider comparison */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <ProviderLogo p={currProvider!} size={56} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "8px 0 2px" }}>{currProvider!.name}</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>{currMonthly.toLocaleString("da-DK")} kr.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 20, color: savingColor }}>→</div>
                  {monthlyDiff !== 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                      background: savingColor + "15", color: savingColor,
                      border: `1px solid ${savingColor}30`,
                    }}>
                      {monthlyDiff < 0 ? `−${Math.abs(monthlyDiff)} kr.` : `+${monthlyDiff} kr.`}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <ProviderLogo p={nextProvider!} size={56} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "8px 0 2px" }}>{nextProvider!.name}</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>{nextMonthly.toLocaleString("da-DK")} kr.</p>
                </div>
              </div>
            </div>

            {/* Detail grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                {
                  title: "Data samlet",
                  curr: currData === Infinity ? "∞ GB" : `${currData} GB`,
                  next: nextData === Infinity ? "∞ GB" : `${nextData} GB`,
                  note: nextData === Infinity ? "Ubegrænset" : dataDiff === 0 ? "Samme mængde" : dataDiff > 0 ? `+${dataDiff} GB mere` : `${Math.abs(dataDiff)} GB mindre`,
                  color: dataDiff > 0 || nextData === Infinity ? "#16a34a" : dataDiff < 0 ? "#ea580c" : "#374151",
                },
                {
                  title: "Abonnementer",
                  curr: `${current.subs.length}`,
                  next: `${next.subs.length}`,
                  note: current.subs.length === next.subs.length ? "Samme antal" : next.subs.length > current.subs.length ? `${next.subs.length - current.subs.length} flere` : `${current.subs.length - next.subs.length} færre`,
                  color: "#374151",
                },
                {
                  title: "5G",
                  curr: currProvider!.fiveG ? "Ja ✓" : "Nej",
                  next: nextProvider!.fiveG ? "Ja ✓" : "Nej",
                  note: !currProvider!.fiveG && nextProvider!.fiveG ? "Du får 5G! 🎉" : currProvider!.fiveG && !nextProvider!.fiveG ? "Du mister 5G ⚠️" : currProvider!.fiveG ? "Begge har 5G" : "Ingen 5G",
                  color: !currProvider!.fiveG && nextProvider!.fiveG ? "#16a34a" : currProvider!.fiveG && !nextProvider!.fiveG ? "#ea580c" : "#374151",
                },
              ].map(stat => (
                <div key={stat.title} style={{
                  background: "#fff", borderRadius: 14, padding: "18px 20px",
                  border: "1.5px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.title}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#374151" }}>{stat.curr}</span>
                    <span style={{ fontSize: 14, color: "#d1d5db" }}>→</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.next}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{stat.note}</p>
                </div>
              ))}
            </div>

            {/* Network comparison */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid #e5e7eb" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
                <span>📡</span> Netværksoverblik
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
                {/* Current net */}
                {[currProvider, nextProvider].map((prov, idx) => {
                  if (!prov) return null;
                  const net = NET_INFO[prov.network];
                  const isNext = idx === 1;
                  return (
                    <div key={idx} style={{
                      padding: "16px 18px", borderRadius: 12,
                      background: isNext && !sameNet ? "#f0fdf4" : "#fafafa",
                      border: `1.5px solid ${isNext && !sameNet ? "#bbf7d0" : "#e5e7eb"}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <ProviderLogo p={prov} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{prov.name}</span>
                      </div>
                      <NetworkBars bars={net.bars} color={net.color} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: net.color, margin: "8px 0 2px" }}>{prov.networkLabel}</p>
                      <p style={{ fontSize: 11, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{net.desc}</p>
                    </div>
                  );
                })}
                {/* Middle badge */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    display: "inline-block", padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: sameNet ? "#f0fdf4" : "#eff6ff",
                    color: sameNet ? "#16a34a" : "#2563eb",
                    border: `1px solid ${sameNet ? "#bbf7d0" : "#bfdbfe"}`,
                    whiteSpace: "nowrap",
                  }}>
                    {sameNet ? "Samme net" : "Nyt netværk"}
                  </div>
                </div>
              </div>
            </div>

            {/* Yearly savings */}
            {yearlyDiff !== 0 && (
              <div style={{ background: savingBg, borderRadius: 16, padding: "22px 32px", border: `1.5px solid ${savingBorder}`, display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 28 }}>💰</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {monthlyDiff < 0 ? "Samlet besparelse om året" : "Samlet merpris om året"}
                  </p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: savingColor, margin: 0, letterSpacing: "-0.5px" }}>
                    {Math.abs(yearlyDiff).toLocaleString("da-DK")} kr.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div style={{ marginTop: 48, textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 8px" }}>
              Vælg begge selskaber og udfyld priser
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
              Sammenligningen vises herunder automatisk
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
