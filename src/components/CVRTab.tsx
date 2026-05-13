"use client";

import { useState } from "react";

/* ── Types ──────────────────────────────────────────────────────────── */
interface CVROwner { name: string; type?: string; shares?: number; }
interface ProductionUnit {
  pno: number;
  main: boolean;
  name: string;
  address?: string;
  zipcode?: string;
  city?: string;
  startdate?: string;
  employees?: string;
}
interface CVRCompany {
  vat: number;
  name: string;
  address?: string;
  zipcode?: string;
  city?: string;
  protected?: boolean;
  phone?: string;
  email?: string;
  startdate?: string;
  enddate?: string | null;
  employees?: string;
  industrycode?: number;
  industrydesc?: string;
  companydesc?: string;
  type?: string;
  owners?: CVROwner[];
  productionunits?: ProductionUnit[];
}

/* ── Static maps ─────────────────────────────────────────────────────── */
const EMPLOYEE_RANGES = [
  { range: "0",         min: 0,     label: "0" },
  { range: "1-4",       min: 1,     label: "1–4" },
  { range: "5-9",       min: 5,     label: "5–9" },
  { range: "10-19",     min: 10,    label: "10–19" },
  { range: "20-49",     min: 20,    label: "20–49" },
  { range: "50-99",     min: 50,    label: "50–99" },
  { range: "100-199",   min: 100,   label: "100–199" },
  { range: "200-499",   min: 200,   label: "200–499" },
  { range: "500-999",   min: 500,   label: "500–999" },
  { range: "1000-1999", min: 1000,  label: "1.000–1.999" },
  { range: "2000-4999", min: 2000,  label: "2.000–4.999" },
  { range: "5000-9999", min: 5000,  label: "5.000–9.999" },
  { range: "10000+",    min: 10000, label: "10.000+" },
];

const COMPANY_TYPE_INFO: Record<string, { long: string; desc: string; color: string }> = {
  AS:   { long: "Aktieselskab",             desc: "Kræver min. 400.000 kr. Kapital fordelt i aktier.",        color: "#5B42F3" },
  APS:  { long: "Anpartsselskab",           desc: "Kræver min. 40.000 kr. Kapital fordelt i anparter.",      color: "#AF40FF" },
  IS:   { long: "Interessentskab",          desc: "Min. 2 deltagere. Alle hæfter personligt og ubegrænset.", color: "#00DDEB" },
  KS:   { long: "Kommanditselskab",         desc: "Mindst én komplementar med ubegrænset hæftelse.",         color: "#fbbf24" },
  ENK:  { long: "Enkeltmandsvirksomhed",    desc: "Ingen minimumskapital. Personlig og ubegrænset hæftelse.", color: "#4ade80" },
  PS:   { long: "Partnerselskab",           desc: "Kombination af I/S og K/S. Bruges ofte af advokater.",    color: "#fb923c" },
  FORA: { long: "Forening",                 desc: "Non-profit organisation med vedtægter.",                   color: "#60a5fa" },
  FOND: { long: "Erhvervsdrivende fond",    desc: "Selvejende institution med erhvervsmæssigt formål.",      color: "#f87171" },
  IVS:  { long: "Iværksætterselskab",       desc: "Afviklet selskabsform. Kræver ikke 1 kr. i kapital.",    color: "#94a3b8" },
};

function getNaceSection(code?: number): { label: string; emoji: string } | null {
  if (!code) return null;
  const prefix = Math.floor(code / 10000);
  if (prefix >= 1  && prefix <= 3)  return { label: "Landbrug, skovbrug og fiskeri",        emoji: "🌾" };
  if (prefix >= 5  && prefix <= 9)  return { label: "Råstofindvinding",                       emoji: "⛏️" };
  if (prefix >= 10 && prefix <= 33) return { label: "Industri og fremstilling",               emoji: "🏭" };
  if (prefix === 35)                return { label: "Energiforsyning",                         emoji: "⚡" };
  if (prefix >= 36 && prefix <= 39) return { label: "Vandforsyning og renovation",            emoji: "💧" };
  if (prefix >= 41 && prefix <= 43) return { label: "Bygge og anlæg",                         emoji: "🏗️" };
  if (prefix >= 45 && prefix <= 47) return { label: "Handel og reparation",                   emoji: "🛒" };
  if (prefix >= 49 && prefix <= 53) return { label: "Transport og oplagring",                 emoji: "🚚" };
  if (prefix >= 55 && prefix <= 56) return { label: "Overnatning og restauranter",            emoji: "🍽️" };
  if (prefix >= 58 && prefix <= 63) return { label: "Information og kommunikation",           emoji: "💻" };
  if (prefix >= 64 && prefix <= 66) return { label: "Finans og forsikring",                   emoji: "🏦" };
  if (prefix === 68)                return { label: "Fast ejendom",                            emoji: "🏠" };
  if (prefix >= 69 && prefix <= 75) return { label: "Liberale erhverv og vidensservice",      emoji: "🎓" };
  if (prefix >= 77 && prefix <= 82) return { label: "Administrative serviceydelser",          emoji: "📋" };
  if (prefix === 84)                return { label: "Offentlig administration og forsvar",    emoji: "🏛️" };
  if (prefix === 85)                return { label: "Undervisning",                            emoji: "📚" };
  if (prefix >= 86 && prefix <= 88) return { label: "Sundhed og socialvæsen",                emoji: "🏥" };
  if (prefix >= 90 && prefix <= 93) return { label: "Kultur, fritid og underholdning",       emoji: "🎭" };
  if (prefix >= 94 && prefix <= 96) return { label: "Andre serviceydelser",                   emoji: "🔧" };
  return { label: "Øvrige",                                                                    emoji: "🏢" };
}

function getSmeClass(range?: string): { label: string; color: string; desc: string } | null {
  if (!range) return null;
  const idx = EMPLOYEE_RANGES.findIndex(r => r.range === range);
  if (idx < 0) return null;
  const min = EMPLOYEE_RANGES[idx].min;
  if (min < 10)  return { label: "Mikrovirksomhed",  color: "#4ade80",  desc: "Under 10 ansatte — EU-definition" };
  if (min < 50)  return { label: "Lille virksomhed", color: "#facc15",  desc: "10–49 ansatte — EU-definition" };
  if (min < 250) return { label: "Mellemstor",       color: "#fb923c",  desc: "50–249 ansatte — EU-definition" };
  return         { label: "Stor virksomhed",          color: "#f87171",  desc: "250+ ansatte — EU-definition" };
}

function formatCVR(vat: number) {
  const s = String(vat).padStart(8, "0");
  return `${s.slice(0, 4)} ${s.slice(4)}`;
}

function exactAge(startdate?: string, enddate?: string | null): { years: number; months: number; days: number; total: number } | null {
  if (!startdate) return null;
  const from = new Date(startdate);
  const to   = enddate ? new Date(enddate) : new Date();
  const total = Math.floor((to.getTime() - from.getTime()) / 86400000);
  const years  = Math.floor(total / 365.25);
  const months = Math.floor((total % 365.25) / 30.44);
  const days   = Math.floor(total % 30.44);
  return { years, months, days, total };
}

function formatDate(iso?: string | null) {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Donut ──────────────────────────────────────────────────────────── */
function OwnershipDonut({ owners }: { owners: CVROwner[] }) {
  const withShares = owners.filter(o => o.shares != null && o.shares > 0);
  if (withShares.length === 0) return null;
  const r = 40, cx = 50, cy = 50, circumference = 2 * Math.PI * r;
  const colors = ["#5B42F3", "#AF40FF", "#00DDEB", "#4ade80", "#f59e0b", "#f87171", "#60a5fa"];
  const total  = withShares.reduce((s, o) => s + (o.shares ?? 0), 0);
  let cumulative = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
        {withShares.map((o, i) => {
          const pct    = (o.shares ?? 0) / total;
          const dash   = pct * circumference;
          const gap    = circumference - dash;
          const offset = cumulative * circumference;
          cumulative  += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[i % colors.length]} strokeWidth={14}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset + circumference / 4}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
            />
          );
        })}
        <text x={50} y={46} textAnchor="middle" style={{ fontSize: 10, fill: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
          {withShares.length}
        </text>
        <text x={50} y={57} textAnchor="middle" style={{ fontSize: 8, fill: "rgba(255,255,255,0.35)" }}>ejere</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {withShares.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[i % colors.length], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-2)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: colors[i % colors.length], marginLeft: "auto", paddingLeft: 6 }}>{o.shares}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function CVRTab() {
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [companies, setCompanies] = useState<CVRCompany[]>([]);
  const [selected, setSelected] = useState<CVRCompany | null>(null);
  const [error, setError]       = useState("");

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(""); setCompanies([]); setSelected(null);
    const isVat = /^\d{8}$/.test(q.replace(/\s/g, ""));
    const param = isVat ? `vat=${q.replace(/\s/g, "")}` : `search=${encodeURIComponent(q)}`;
    try {
      const res  = await fetch(`/api/cvr?${param}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      const results: CVRCompany[] = data.results ?? [];
      if (results.length === 0) throw new Error("Ingen virksomheder fundet");
      if (results.length === 1) setSelected(results[0]);
      else setCompanies(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const s = selected;
  const empIdx   = s ? EMPLOYEE_RANGES.findIndex(r => r.range === s.employees) : -1;
  const age      = exactAge(s?.startdate, s?.enddate ?? undefined);
  const nace     = getNaceSection(s?.industrycode);
  const sme      = getSmeClass(s?.employees);
  const typeInfo = s?.type ? COMPANY_TYPE_INFO[s.type.toUpperCase().replace("/", "")] : null;
  const isActive = s && !s.enddate;
  const addressQ = s ? encodeURIComponent(`${s.address}, ${s.zipcode} ${s.city}, Danmark`) : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>CVR-opslag</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Komplet virksomhedsprofil — identitet, ejere, branche, adresse, produktion og meget mere.
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="CVR-nummer (12345678) eller firmanavn..."
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={search} disabled={loading || !query.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Søger..." : "🔍 Slå op"}</span></span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🏢</p>
          <p style={{ margin: 0 }}>Henter CVR-data...</p>
        </div>
      )}

      {/* Multiple results */}
      {companies.length > 1 && !s && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, margin: 0 }}>{companies.length} virksomheder fundet — vælg en:</p>
          {companies.map(c => (
            <button key={c.vat} onClick={() => setSelected(c)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
              <div className="uv-card-1" style={{ transition: "transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                <div className="uv-card-1-inner" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 3px" }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                      CVR {formatCVR(c.vat)} · {[c.zipcode, c.city].filter(Boolean).join(" ")}
                      {c.enddate && <span style={{ color: "#f87171", marginLeft: 8 }}>· Ophørt</span>}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, flexShrink: 0 }}>{c.companydesc}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail view */}
      {s && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {companies.length > 1 && (
            <button onClick={() => setSelected(null)} style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
              ← Tilbage til resultater
            </button>
          )}

          {/* ── HERO ─────────────────────────────────────────────────── */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "24px 26px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: 0, lineHeight: 1.1 }}>{s.name}</h2>
                    {isActive
                      ? <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 99, background: "rgba(74,222,128,0.14)", color: "#4ade80", border: "1.5px solid rgba(74,222,128,0.3)", flexShrink: 0 }}>✓ Aktiv</span>
                      : <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 99, background: "rgba(248,113,113,0.14)", color: "#f87171", border: "1.5px solid rgba(248,113,113,0.3)", flexShrink: 0 }}>Ophørt {s.enddate?.slice(0,4)}</span>}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 14px" }}>
                    {s.companydesc} · CVR {formatCVR(s.vat)}
                    {s.type && ` · ${s.type}`}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {sme && (
                      <Chip text={sme.label} color={`${sme.color}15`} border={`${sme.color}35`} textColor={sme.color} />
                    )}
                    {nace && (
                      <Chip text={`${nace.emoji} ${nace.label}`} color="rgba(91,66,243,0.1)" border="rgba(91,66,243,0.25)" textColor="#a78bfa" />
                    )}
                    {s.protected && (
                      <Chip text="🔒 Adressebeskyttet" color="rgba(251,191,36,0.08)" border="rgba(251,191,36,0.25)" textColor="#fbbf24" />
                    )}
                  </div>
                </div>

                {/* CVR box */}
                <div style={{
                  textAlign: "center", padding: "16px 20px", borderRadius: 14,
                  background: "rgba(91,66,243,0.1)", border: "2px solid rgba(91,66,243,0.3)", flexShrink: 0,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>CVR-nummer</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {formatCVR(s.vat)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4-col KPI grid ───────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            <KpiCard icon="📅" label="Stiftet" value={s.startdate ? new Date(s.startdate).getFullYear().toString() : "–"} sub={s.startdate ? formatDate(s.startdate) : undefined} />
            {age && <KpiCard icon="⏱️" label="Alder" value={`${age.years} år`} sub={`${age.months} mdr. ${age.days} dage`} />}
            {s.enddate && <KpiCard icon="🔴" label="Ophørt" value={new Date(s.enddate).getFullYear().toString()} sub={formatDate(s.enddate)} />}
            <KpiCard icon="👥" label="Ansatte" value={EMPLOYEE_RANGES.find(r => r.range === s.employees)?.label ?? s.employees ?? "–"} sub={sme?.desc} />
            {s.industrycode && <KpiCard icon="🏭" label="Branchekode" value={String(s.industrycode)} sub={s.industrydesc?.slice(0, 30)} />}
            {s.city && <KpiCard icon="📍" label="By" value={s.city} sub={s.zipcode ?? undefined} />}
            {s.productionunits && <KpiCard icon="🏗️" label="P-enheder" value={String(s.productionunits.length)} sub="Produktionssteder" />}
            {s.owners && !s.protected && <KpiCard icon="👤" label="Registr. ejere" value={String(s.owners.length)} />}
          </div>

          {/* ── Company type info ────────────────────────────────────── */}
          {typeInfo && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `${typeInfo.color}18`, border: `2px solid ${typeInfo.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 900, color: typeInfo.color, fontFamily: "monospace",
                  }}>{s.type}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>{typeInfo.long}</p>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>{typeInfo.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Timeline bar ─────────────────────────────────────────── */}
          {age && s.startdate && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                  Virksomhedshistorik
                </p>
                <div style={{ position: "relative" }}>
                  {/* Track */}
                  <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: "100%",
                      background: isActive
                        ? "linear-gradient(90deg, #5B42F3, #AF40FF, #00DDEB)"
                        : "linear-gradient(90deg, #5B42F3, #f87171)",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Stiftet {s.startdate.slice(0,4)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#4ade80" : "#f87171" }}>
                      {isActive ? `Aktiv siden ${age.years} år` : `Ophørt ${s.enddate?.slice(0,4)} efter ${age.years} år`}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{isActive ? new Date().getFullYear() : s.enddate?.slice(0,4)}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                  <MiniStat label="Totalt dage" value={age.total.toLocaleString("da-DK")} />
                  <MiniStat label="År" value={String(age.years)} />
                  <MiniStat label="Måneder" value={String(age.months + age.years * 12)} />
                  <MiniStat label="Status" value={isActive ? "Aktiv" : "Ophørt"} color={isActive ? "#4ade80" : "#f87171"} />
                </div>
              </div>
            </div>
          )}

          {/* ── Contact & Address ─────────────────────────────────────── */}
          {(s.phone || s.email || s.address) && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                  Kontakt og adresse
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {s.address && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", fontWeight: 600 }}>BESØGSADRESSE</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>{s.address}</p>
                      <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 10px" }}>{[s.zipcode, s.city].filter(Boolean).join(" ")}</p>
                      <a
                        href={`https://maps.google.com/?q=${addressQ}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
                        🗺️ Åbn i Google Maps →
                      </a>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(74,222,128,0.06)", border: "1.5px solid rgba(74,222,128,0.15)", cursor: "pointer" }}>
                          <span style={{ fontSize: 16 }}>📱</span>
                          <div>
                            <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0, fontWeight: 700 }}>TELEFON</p>
                            <p style={{ fontSize: 14, color: "#4ade80", margin: 0, fontWeight: 700 }}>{s.phone}</p>
                          </div>
                        </div>
                      </a>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(96,165,250,0.06)", border: "1.5px solid rgba(96,165,250,0.15)", cursor: "pointer" }}>
                          <span style={{ fontSize: 16 }}>✉️</span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0, fontWeight: 700 }}>EMAIL</p>
                            <p style={{ fontSize: 13, color: "#60a5fa", margin: 0, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Industry ─────────────────────────────────────────────── */}
          {(s.industrydesc || nace) && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                  Branche og industri
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {s.industrydesc && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", fontWeight: 600 }}>BRANCHEBESKRIVELSE</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>{s.industrydesc}</p>
                    </div>
                  )}
                  {s.industrycode && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", fontWeight: 600 }}>DB07 BRANCHEKODE</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", margin: 0, fontFamily: "monospace" }}>{s.industrycode}</p>
                    </div>
                  )}
                  {nace && (
                    <div style={{ gridColumn: "1/-1" }}>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px", fontWeight: 600 }}>NACE SEKTOR</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)", margin: 0 }}>
                        {nace.emoji} {nace.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Employee size visualization ───────────────────────────── */}
          {empIdx >= 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                    Virksomhedsstørrelse
                  </p>
                  {sme && (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 99,
                      background: `${sme.color}15`, border: `1.5px solid ${sme.color}35`, color: sme.color }}>
                      {sme.label}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", marginBottom: 6 }}>
                  {EMPLOYEE_RANGES.map((r, i) => (
                    <div key={r.range} style={{ flex: 1 }}>
                      <div style={{
                        width: "100%",
                        height: i === empIdx ? 48 : i < empIdx ? 30 : 12,
                        borderRadius: 4,
                        background: i === empIdx
                          ? "linear-gradient(to top, #5B42F3, #AF40FF)"
                          : i < empIdx ? "rgba(91,66,243,0.3)" : "rgba(255,255,255,0.06)",
                        transition: "height 0.4s ease",
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>Solo</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
                    {EMPLOYEE_RANGES[empIdx].label} ansatte
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>10.000+</span>
                </div>
                {sme && <p style={{ fontSize: 11, color: "var(--text-3)", margin: "8px 0 0", textAlign: "center" }}>{sme.desc}</p>}
              </div>
            </div>
          )}

          {/* ── Ownership ────────────────────────────────────────────── */}
          {s.owners && s.owners.length > 0 && !s.protected && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
                  Ejere og interessenter ({s.owners.length})
                </p>
                <OwnershipDonut owners={s.owners} />
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 16 }}>
                  {s.owners.map((o, i) => {
                    const isCompany = o.type === "VIRKSOMHED";
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                          background: isCompany ? "rgba(91,66,243,0.12)" : "rgba(74,222,128,0.08)",
                          border: `1.5px solid ${isCompany ? "rgba(91,66,243,0.25)" : "rgba(74,222,128,0.2)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        }}>{isCompany ? "🏢" : "👤"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</p>
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
                            {isCompany ? "Juridisk person" : "Fysisk person"}
                          </p>
                        </div>
                        {o.shares != null && (
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ height: 4, width: 80, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 4 }}>
                              <div style={{ height: "100%", width: `${Math.min(o.shares, 100)}%`, background: "linear-gradient(90deg,#5B42F3,#AF40FF)", borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 900, color: "#a78bfa" }}>{o.shares}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Ownership summary */}
                {s.owners.some(o => o.shares != null) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                    <MiniStat label="Privatpersoner"
                      value={String(s.owners.filter(o => o.type === "PERSON").length)} />
                    <MiniStat label="Virksomheder"
                      value={String(s.owners.filter(o => o.type === "VIRKSOMHED").length)} />
                    <MiniStat label="Opl. andel"
                      value={`${s.owners.reduce((sum, o) => sum + (o.shares ?? 0), 0)}%`} />
                  </div>
                )}
              </div>
            </div>
          )}
          {s.protected && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "14px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>🔒 Ejeroplysninger er beskyttede</p>
              </div>
            </div>
          )}

          {/* ── Production units ─────────────────────────────────────── */}
          {s.productionunits && s.productionunits.length > 0 && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                  Produktionsenheder / P-numre ({s.productionunits.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {s.productionunits.map((pu, i) => {
                    const puAge = exactAge(pu.startdate);
                    return (
                      <div key={i} style={{
                        padding: "14px 16px", borderRadius: 12,
                        background: pu.main ? "rgba(91,66,243,0.07)" : "rgba(255,255,255,0.02)",
                        border: `1.5px solid ${pu.main ? "rgba(91,66,243,0.25)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>{pu.name}</p>
                              {pu.main && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: "rgba(91,66,243,0.15)", color: "#a78bfa", border: "1.5px solid rgba(91,66,243,0.3)" }}>Hoved</span>}
                            </div>
                            {(pu.address || pu.city) && (
                              <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 4px" }}>
                                📍 {[pu.address, pu.zipcode, pu.city].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end", flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#a78bfa", fontWeight: 700 }}>P-{pu.pno}</span>
                            {pu.employees && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{EMPLOYEE_RANGES.find(r => r.range === pu.employees)?.label ?? pu.employees} ans.</span>}
                          </div>
                        </div>
                        {pu.startdate && (
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "6px 0 0" }}>
                            Oprettet {formatDate(pu.startdate)}{puAge ? ` · ${puAge.years} år aktivt` : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── External links ────────────────────────────────────────── */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "16px 22px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                Eksterne registre
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <ExtLink href={`https://virk.dk/virksomhed/cvr/${s.vat}`} label="Virk.dk" icon="🏛️" />
                <ExtLink href={`https://datacvr.virk.dk/enhed/virksomhed/${s.vat}`} label="CVR-register" icon="📋" />
                <ExtLink href={`https://www.cvr.dk/firma/${s.vat}`} label="CVR.dk" icon="🔍" />
                <ExtLink href={`https://proff.dk/firma/${encodeURIComponent(s.name.toLowerCase().replace(/\s+/g, "-"))}-${s.vat}`} label="Proff.dk" icon="📊" />
                {s.address && <ExtLink href={`https://maps.google.com/?q=${addressQ}`} label="Google Maps" icon="🗺️" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */
function KpiCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="uv-card-1">
      <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>
          {icon} {label}
        </p>
        <p style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", margin: 0, lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ fontSize: 10, color: "var(--text-3)", margin: "3px 0 0", lineHeight: 1.3 }}>{sub}</p>}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
      <p style={{ fontSize: 10, color: "var(--text-3)", margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 900, color: color ?? "var(--text)", margin: 0 }}>{value}</p>
    </div>
  );
}

function Chip({ text, color, border, textColor }: { text: string; color: string; border: string; textColor: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: color, border: `1.5px solid ${border}`, color: textColor }}>
      {text}
    </span>
  );
}

function ExtLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 12, fontWeight: 600, color: "var(--text-2)", textDecoration: "none",
      padding: "7px 13px", borderRadius: 8,
      background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.09)",
      transition: "border-color 0.15s",
    }}>{icon} {label} →</a>
  );
}
