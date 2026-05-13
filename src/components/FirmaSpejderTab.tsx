"use client";

import { useState, useRef, useEffect } from "react";

interface Suggestion { name: string; domain: string; logo: string; }
interface CVROwner { name: string; type?: string; shares?: number; }
interface CVRData {
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
  creditstartdate?: string;
  creditdays?: number;
  creditmax?: number;
  owners?: CVROwner[];
}

const EMP_LABELS: Record<string, string> = {
  "0": "0 (Solo)","1-4": "1–4","5-9": "5–9","10-19": "10–19","20-49": "20–49",
  "50-99": "50–99","100-199": "100–199","200-499": "200–499","500-999": "500–999",
  "1000-1999": "1.000–1.999","2000-4999": "2.000–4.999",
  "5000-9999": "5.000–9.999","10000+": "10.000+",
};

const REV_ESTIMATES: Record<string, string> = {
  "0": "< 500.000 kr.","1-4": "500k – 5M kr.","5-9": "3M – 20M kr.",
  "10-19": "10M – 60M kr.","20-49": "30M – 150M kr.","50-99": "80M – 400M kr.",
  "100-199": "200M – 800M kr.","200-499": "500M – 2B kr.","500-999": "1B – 5B kr.",
  "1000-1999": "3B – 10B kr.","2000-4999": "8B – 25B kr.",
  "5000-9999": "20B – 60B kr.","10000+": "50B+ kr.",
};

const EMP_STEPS = ["0","1-4","5-9","10-19","20-49","50-99","100-199","200-499","500-999","1000-1999","2000-4999","5000-9999","10000+"];

const INDUSTRY_SECTORS: Record<string, string> = {
  "1": "Landbrug & fiskeri","2": "Råstofudvinding","3": "Fremstilling",
  "4": "Energi & forsyning","5": "Bygge & anlæg","6": "Handel",
  "7": "Transport","8": "Overnatning & restauration","9": "Information & kommunikation",
  "10": "Finans & forsikring","11": "Fast ejendom","12": "Liberale erhverv",
  "13": "Administrative tjenesteydelser","14": "Offentlig administration",
  "15": "Undervisning","16": "Sundhed & social","17": "Kultur & fritid",
  "18": "Andre serviceydelser","19": "Privathusholdninger",
};

function getSector(code?: number): string | null {
  if (!code) return null;
  const prefix = String(code).slice(0, 2);
  const n = parseInt(prefix);
  if (n <= 3) return "Landbrug & Fremstilling";
  if (n <= 9) return "Handel & Bygge";
  if (n <= 33) return "Industri & Fremstilling";
  if (n <= 39) return "Energi & Forsyning";
  if (n <= 43) return "Bygge & Anlæg";
  if (n <= 47) return "Detail & Engros";
  if (n <= 56) return "Transport & Restauration";
  if (n <= 63) return "IT & Kommunikation";
  if (n <= 68) return "Finans & Ejendom";
  if (n <= 82) return "Konsulentvirksomhed";
  if (n <= 84) return "Offentlig Sektor";
  if (n <= 88) return "Uddannelse & Sundhed";
  return "Serviceerhverv";
}

function formatCVR(vat: number) {
  const s = String(vat).padStart(8, "0");
  return `${s.slice(0,4)} ${s.slice(4)}`;
}

function companyAge(startdate?: string) {
  if (!startdate) return null;
  return new Date().getFullYear() - new Date(startdate).getFullYear();
}

function companyStage(age: number | null) {
  if (age === null) return null;
  if (age < 3)  return { label: "Startup", color: "#f87171" };
  if (age < 10) return { label: "Vækstvirksomhed", color: "#fb923c" };
  if (age < 25) return { label: "Etableret", color: "#4ade80" };
  return { label: "Moden virksomhed", color: "#00DDEB" };
}

function formatDKK(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(".", ",")} mia. kr.`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1).replace(".", ",")} mio. kr.`;
  if (n >= 1_000)         return `${Math.round(n / 1_000).toLocaleString("da-DK")} t. kr.`;
  return `${n.toLocaleString("da-DK")} kr.`;
}

export default function FirmaSpejderTab() {
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected]     = useState<Suggestion | null>(null);
  const [cvrData, setCvrData]       = useState<CVRData | null>(null);
  const [loading, setLoading]       = useState(false);
  const [showDrop, setShowDrop]     = useState(false);
  const [directQuery, setDirectQuery] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/firma?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const s = data.suggestions ?? [];
        setSuggestions(s);
        setShowDrop(s.length > 0);
      } catch { /* ignore */ }
    }, 200);
  }, [query]);

  async function fetchCVR(name: string) {
    setCvrData(null); setLoading(true);
    try {
      const res = await fetch(`/api/cvr?search=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (res.ok && data.results?.[0]) setCvrData(data.results[0]);
    } catch { /* no CVR */ }
    finally { setLoading(false); }
  }

  function pickSuggestion(s: Suggestion) {
    setSelected(s); setQuery(s.name); setSuggestions([]); setShowDrop(false);
    fetchCVR(s.name);
  }

  async function searchDirect() {
    const n = directQuery.trim();
    if (!n) return;
    const fakeSuggestion: Suggestion = {
      name: n,
      domain: n.toLowerCase().replace(/\s+/g, "") + ".dk",
      logo: `https://logo.clearbit.com/${n.toLowerCase().replace(/\s+/g, "")}.dk`,
    };
    setSelected(fakeSuggestion);
    fetchCVR(n);
  }

  const age   = companyAge(cvrData?.startdate);
  const stage = companyStage(age);
  const empIdx = EMP_STEPS.indexOf(cvrData?.employees ?? "");
  const sector = getSector(cvrData?.industrycode);
  const ownersWithShares = (cvrData?.owners ?? []).filter(o => o.shares != null && o.shares > 0);
  const colors = ["#5B42F3","#AF40FF","#00DDEB","#4ade80","#f59e0b","#f87171","#a78bfa"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Firma-spejder</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Skriv et firmanavn — få logo, CVR-nummer, branche, ansatte, ejere og kreditprofil øjeblikkeligt.
        </p>
      </div>

      {/* Search — overflow: visible to allow dropdown to escape card */}
      <div className="uv-card-1" style={{ overflow: "visible" }}>
        <div className="uv-card-1-inner" style={{ padding: "20px 22px", overflow: "visible" }}>
          <div style={{ position: "relative", zIndex: 100 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null); setCvrData(null); }}
                onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                placeholder="Skriv firmanavn, f.eks. Novo Nordisk, Ørsted, Mærsk..."
                className="uv-input"
                style={{ flex: 1, fontSize: 15 }}
              />
            </div>

            {/* Dropdown */}
            {showDrop && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                zIndex: 9999,
                background: "#1c1917",
                border: "1.5px solid rgba(251,191,36,0.4)",
                borderRadius: 14, overflow: "hidden",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}>
                {suggestions.map((s, i) => (
                  <button
                    key={s.domain}
                    onMouseDown={() => pickSuggestion(s)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 18px", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left",
                      borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: "rgba(255,255,255,0.08)", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <img src={s.logo} alt=""
                        onError={e => { e.currentTarget.style.display = "none"; }}
                        style={{ width: 28, height: 28, objectFit: "contain" }}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#f4f1ee", margin: 0 }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: "#78716c", margin: 0 }}>{s.domain}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct CVR search */}
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Eller søg direkte:</span>
            <input
              value={directQuery}
              onChange={e => setDirectQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchDirect()}
              placeholder="Firmanavn eller CVR..."
              className="uv-input"
              style={{ flex: 1, fontSize: 13, padding: "6px 12px" }}
            />
            <button onClick={searchDirect} disabled={!directQuery.trim()} className="uv-btn" style={{ fontSize: 12 }}>
              <span className="uv-btn-text"><span>Søg</span></span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 28, margin: "0 0 8px" }}>🔭</p>
          <p style={{ margin: 0 }}>Henter firmadata...</p>
        </div>
      )}

      {/* Company result */}
      {selected && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Hero card */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                {/* Logo */}
                <div style={{
                  width: 80, height: 80, borderRadius: 18, flexShrink: 0, overflow: "hidden",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected.logo
                    ? <img src={selected.logo} alt=""
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        style={{ width: 64, height: 64, objectFit: "contain" }} />
                    : <span style={{ fontSize: 32, fontWeight: 900, color: "white" }}>{selected.name[0]}</span>}
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: 0 }}>
                      {cvrData?.name ?? selected.name}
                    </h2>
                    {stage && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        background: `${stage.color}20`, color: stage.color,
                        border: `1.5px solid ${stage.color}50`,
                      }}>{stage.label}</span>
                    )}
                    {cvrData && !cvrData.enddate && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1.5px solid rgba(74,222,128,0.3)" }}>✓ Aktiv</span>
                    )}
                    {cvrData?.enddate && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1.5px solid rgba(248,113,113,0.3)" }}>Ophørt</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {cvrData?.vat && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>CVR {formatCVR(cvrData.vat)}</span>
                    )}
                    {cvrData?.companydesc && (
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{cvrData.companydesc}</span>
                    )}
                    {selected.domain && (
                      <a href={`https://${selected.domain}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none" }}>🌐 {selected.domain}</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Only show the rest if we have CVR data */}
          {cvrData && (
            <>
              {/* Big KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                <BigKpi icon="🔢" label="CVR-nummer" value={formatCVR(cvrData.vat)} highlight />
                {age !== null && <BigKpi icon="📅" label="Alder" value={`${age} år`} sub={`Stiftet ${cvrData.startdate?.slice(0,4)}`} />}
                {cvrData.employees && <BigKpi icon="👥" label="Ansatte" value={EMP_LABELS[cvrData.employees] ?? cvrData.employees} />}
                {cvrData.creditmax != null && cvrData.creditmax > 0 && (
                  <BigKpi icon="💳" label="Kreditgrænse" value={formatDKK(cvrData.creditmax)} />
                )}
                {cvrData.creditdays != null && (
                  <BigKpi icon="📆" label="Kreditdage" value={`${cvrData.creditdays} dage`} />
                )}
                {cvrData.industrycode && <BigKpi icon="🏭" label="Branchekode" value={String(cvrData.industrycode)} />}
              </div>

              {/* Estimated revenue */}
              {cvrData.employees && REV_ESTIMATES[cvrData.employees] && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                          💰 Estimeret omsætning (baseret på medarbej.)
                        </p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0 }}>
                          {REV_ESTIMATES[cvrData.employees]}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-3)", fontStyle: "italic" }}>Estimat — ikke officielle tal</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Company timeline */}
              {cvrData.startdate && age !== null && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "18px 22px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Tidslinje</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#5B42F3", margin: "0 auto 4px" }} />
                        <p style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, margin: 0 }}>Stiftet</p>
                        <p style={{ fontSize: 12, color: "var(--text)", fontWeight: 700, margin: 0 }}>{cvrData.startdate.slice(0,4)}</p>
                      </div>
                      <div style={{ flex: 1, height: 3, background: "linear-gradient(90deg, #5B42F3, #AF40FF, #00DDEB)", borderRadius: 99, margin: "0 8px", position: "relative" }}>
                        <div style={{
                          position: "absolute", top: "50%", left: `${Math.min((age / (age + 5)) * 100, 92)}%`,
                          transform: "translate(-50%, -50%)",
                          width: 14, height: 14, borderRadius: "50%",
                          background: stage?.color ?? "#00DDEB",
                          border: "2px solid #1c1917",
                          boxShadow: `0 0 8px ${stage?.color ?? "#00DDEB"}`,
                        }} />
                      </div>
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#00DDEB", margin: "0 auto 4px" }} />
                        <p style={{ fontSize: 11, color: "#00DDEB", fontWeight: 700, margin: 0 }}>I dag</p>
                        <p style={{ fontSize: 12, color: "var(--text)", fontWeight: 700, margin: 0 }}>{new Date().getFullYear()}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: "12px 0 0", textAlign: "center" }}>
                      {age} år i branchen · {stage?.label}
                    </p>
                  </div>
                </div>
              )}

              {/* 2-column info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Address */}
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 18px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>📍 Adresse</p>
                    {cvrData.address && <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 2px", fontWeight: 600 }}>{cvrData.address}</p>}
                    <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>{[cvrData.zipcode, cvrData.city].filter(Boolean).join(" ")}</p>
                    {cvrData.city && (
                      <a href={`https://maps.google.com/?q=${encodeURIComponent([cvrData.address, cvrData.zipcode, cvrData.city].filter(Boolean).join(", "))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "#60a5fa", marginTop: 6, display: "block" }}>
                        → Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 18px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>📞 Kontakt</p>
                    {cvrData.phone && <p style={{ fontSize: 13, color: "var(--text)", margin: "0 0 4px" }}>📱 {cvrData.phone}</p>}
                    {cvrData.email && <p style={{ fontSize: 12, color: "#60a5fa", margin: 0, wordBreak: "break-all" }}>✉️ {cvrData.email}</p>}
                    {!cvrData.phone && !cvrData.email && <p style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic", margin: 0 }}>Ikke offentligt</p>}
                  </div>
                </div>
              </div>

              {/* Industry */}
              {cvrData.industrydesc && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 22px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>🏭 Branche</p>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{cvrData.industrydesc}</p>
                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Kode: {cvrData.industrycode}</p>
                      </div>
                      {sector && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, flexShrink: 0,
                          background: "rgba(91,66,243,0.15)", color: "#a78bfa", border: "1.5px solid rgba(91,66,243,0.3)",
                        }}>{sector}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Employee size bar */}
              {empIdx >= 0 && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 22px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                      👥 Virksomhedsstørrelse
                    </p>
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 50, marginBottom: 8 }}>
                      {EMP_STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1 }}>
                          <div style={{
                            height: i === empIdx ? 50 : i < empIdx ? 30 : 12,
                            borderRadius: 4,
                            background: i === empIdx
                              ? "linear-gradient(to top,#5B42F3,#AF40FF)"
                              : i < empIdx ? "rgba(91,66,243,0.3)" : "rgba(255,255,255,0.06)",
                            transition: "height 0.4s ease",
                          }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "var(--text-3)" }}>Solo</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#a78bfa" }}>{EMP_LABELS[cvrData.employees!]} ansatte</span>
                      <span style={{ fontSize: 10, color: "var(--text-3)" }}>10.000+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit profile */}
              {(cvrData.creditmax != null || cvrData.creditdays != null) && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 22px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>💳 Kreditprofil</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                      {cvrData.creditmax != null && cvrData.creditmax > 0 && (
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px" }}>KREDITGRÆNSE</p>
                          <p style={{ fontSize: 18, fontWeight: 900, color: "#4ade80", margin: 0 }}>{formatDKK(cvrData.creditmax)}</p>
                        </div>
                      )}
                      {cvrData.creditdays != null && (
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px" }}>KREDITDAGE</p>
                          <p style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24", margin: 0 }}>{cvrData.creditdays} dage</p>
                        </div>
                      )}
                      {cvrData.creditstartdate && (
                        <div>
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px" }}>KREDITSTART</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>{cvrData.creditstartdate.slice(0, 10)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Owners */}
              {cvrData.owners && cvrData.owners.length > 0 && !cvrData.protected && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "16px 22px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
                      🏛️ Ejere & Interessenter ({cvrData.owners.length})
                    </p>

                    {/* Donut chart if shares available */}
                    {ownersWithShares.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                        <svg width={90} height={90} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                          {(() => {
                            const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r;
                            const total = ownersWithShares.reduce((s, o) => s + (o.shares ?? 0), 0);
                            let cum = 0;
                            return ownersWithShares.map((o, i) => {
                              const pct = (o.shares ?? 0) / total;
                              const dash = pct * circ;
                              const offset = -cum * circ + circ / 4;
                              cum += pct;
                              return (
                                <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                                  stroke={colors[i % colors.length]} strokeWidth={16}
                                  strokeDasharray={`${dash} ${circ - dash}`}
                                  strokeDashoffset={offset}
                                  style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
                                />
                              );
                            });
                          })()}
                          <circle cx={50} cy={50} r={24} fill="#1c1917" />
                        </svg>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {ownersWithShares.map((o, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 9, height: 9, borderRadius: "50%", background: colors[i % colors.length] }} />
                              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{o.name}</span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: colors[i % colors.length] }}>{o.shares}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {cvrData.owners.map((o, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 14px", borderRadius: 10,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                        }}>
                          <span style={{ fontSize: 16 }}>{o.type === "PERSON" || o.type === "person" ? "👤" : "🏢"}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>{o.name}</span>
                          {o.shares != null && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 64, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.min(o.shares, 100)}%`, background: `linear-gradient(90deg, #5B42F3, #AF40FF)`, borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: "#a78bfa", minWidth: 34, textAlign: "right" }}>{o.shares}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {cvrData.protected && (
                <div className="uv-card-1">
                  <div className="uv-card-1-inner" style={{ padding: "14px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>🔒 Ejeroplysninger er beskyttede i CVR</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* No CVR data but have Clearbit */}
          {!cvrData && !loading && selected && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "20px 22px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, fontStyle: "italic" }}>
                  Ingen CVR-data fundet — virksomheden er muligvis ikke registreret i Danmark.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BigKpi({ icon, label, value, sub, highlight }: { icon: string; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 14,
      background: highlight ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${highlight ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.08)"}`,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 900, color: highlight ? "#fbbf24" : "var(--text)", margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--text-3)", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}
