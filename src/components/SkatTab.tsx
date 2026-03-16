"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";

// ─── 2025 Danish Tax Constants ────────────────────────────────────────────────
const TAX_2025 = {
  year: 2025,
  amBidragRate: 0.08,           // Arbejdsmarkedsbidrag 8%
  personfradrag: 49_700,        // Personfradrag (18+)
  personfradragUnder18: 38_000,
  bundskatRate: 0.1201,         // Bundskat 12,01%
  topskatRate: 0.15,            // Topskat 15%
  topskatGraense: 611_800,      // Topskattegrænse (personlig indkomst)
  beskFradragRate: 0.1065,      // Beskæftigelsesfradrag 10,65%
  beskFradragMax: 46_700,       // Max beskæftigelsesfradrag
  skatteloft: 0.5207,           // Skatteloft 52,07% (ekskl. kirkeskat og AM-bidrag)
  aktieIndkomstGraense: 67_500, // Aktieindkomst grænse (lav sats)
  aktieIndkomstLavSats: 0.27,   // 27% under grænsen
  aktieIndkomstHoejSats: 0.42,  // 42% over grænsen
  rentefradragVaerdi: 0.3317,   // Rentefradrag skatteværdi ~33,17% (bundskat+gns. kommuneskat)
};

// 2025 kommuneskatteprocenter (inkl. evt. sundhedsbidrag). Kilde: SKAT.dk
const KOMMUNER: { navn: string; sats: number }[] = [
  { navn: "Gennemsnit (25,10%)", sats: 25.10 },
  { navn: "Gentofte", sats: 22.00 },
  { navn: "Lyngby-Taarbæk", sats: 22.80 },
  { navn: "Frederiksberg", sats: 22.80 },
  { navn: "København", sats: 23.80 },
  { navn: "Helsingør", sats: 24.30 },
  { navn: "Aarhus", sats: 24.52 },
  { navn: "Silkeborg", sats: 25.10 },
  { navn: "Odense", sats: 25.30 },
  { navn: "Aalborg", sats: 25.40 },
  { navn: "Horsens", sats: 25.80 },
  { navn: "Vejle", sats: 25.80 },
  { navn: "Viborg", sats: 26.00 },
  { navn: "Herning", sats: 26.10 },
  { navn: "Roskilde", sats: 26.50 },
  { navn: "Kolding", sats: 26.60 },
  { navn: "Esbjerg", sats: 26.70 },
  { navn: "Randers", sats: 26.70 },
  { navn: "Slagelse", sats: 26.70 },
  { navn: "Manuel indtastning", sats: -1 },
];

function kr(n: number) {
  return n.toLocaleString("da-DK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " kr.";
}
function pct(n: number, decimals = 2) {
  return n.toFixed(decimals).replace(".", ",") + "%";
}

interface TaxResult {
  bruttoIndkomst: number;
  amBidrag: number;
  personligIndkomst: number;
  beskFradrag: number;
  skattepligtigIndkomst: number;
  personfradrag: number;
  bundskatGrundlag: number;
  bundskat: number;
  kommuneskatGrundlag: number;
  kommuneskat: number;
  kirkeskat: number;
  topskat: number;
  aktieIndkomstSkat: number;
  rentefradragSkattevaerdi: number;
  totalSkat: number;
  nettoUdbetaling: number;
  effektivSkattesats: number;
  marginalSkattesats: number;
  skatteloftKorrektion: number;
}

function beregnSkat(params: {
  bruttoIndkomst: number;
  kommuneSats: number;
  kirkeSats: number;
  renteudgifter: number;
  kapitalIndkomst: number;
  aktieIndkomst: number;
}): TaxResult {
  const { bruttoIndkomst, kommuneSats, kirkeSats, renteudgifter, kapitalIndkomst, aktieIndkomst } = params;
  const t = TAX_2025;
  const kommSats = kommuneSats / 100;
  const kirkSats = kirkeSats / 100;

  // 1. AM-bidrag
  const amBidrag = bruttoIndkomst * t.amBidragRate;
  const personligIndkomst = bruttoIndkomst - amBidrag; // = bruttoIndkomst * 0.92

  // 2. Beskæftigelsesfradrag (på personlig indkomst/lønindkomst)
  const beskFradrag = Math.min(personligIndkomst * t.beskFradragRate, t.beskFradragMax);

  // 3. Skattepligtig indkomst (grundlag for kommuneskat)
  //    = personlig indkomst - beskæftigelsesfradrag - netto renteudgifter + kapitalindkomst
  const nettoRenter = Math.max(0, renteudgifter - kapitalIndkomst);
  const posKapital = Math.max(0, kapitalIndkomst - renteudgifter);
  const skattepligtigIndkomst = personligIndkomst - beskFradrag - nettoRenter + posKapital;

  // 4. Bundskat (på personlig indkomst + positiv kapitalindkomst)
  const bundskatGrundlag = Math.max(0, personligIndkomst + posKapital - t.personfradrag);
  let bundskat = bundskatGrundlag * t.bundskatRate;

  // 5. Kommuneskat (på skattepligtig indkomst - personfradrag)
  const kommuneskatGrundlag = Math.max(0, skattepligtigIndkomst - t.personfradrag);
  let kommuneskat = kommuneskatGrundlag * kommSats;

  // 6. Kirkeskat (samme grundlag som kommuneskat)
  const kirkeskat = kommuneskatGrundlag * kirkSats;

  // 7. Skatteloft: bundskat% + kommuneSats% må max være 52,07% af bundskatGrundlag
  let skatteloftKorrektion = 0;
  const kombineredeProc = t.bundskatRate + kommSats;
  if (kombineredeProc > t.skatteloft) {
    // Bundskat reduceres med det overskydende
    skatteloftKorrektion = (kombineredeProc - t.skatteloft) * bundskatGrundlag;
    bundskat = Math.max(0, bundskat - skatteloftKorrektion);
  }

  // 8. Topskat (15% af personlig indkomst over topskattegrænsen)
  const topskat = Math.max(0, (personligIndkomst - t.topskatGraense) * t.topskatRate);

  // 9. Aktieindkomstskat
  let aktieIndkomstSkat = 0;
  if (aktieIndkomst > 0) {
    if (aktieIndkomst <= t.aktieIndkomstGraense) {
      aktieIndkomstSkat = aktieIndkomst * t.aktieIndkomstLavSats;
    } else {
      aktieIndkomstSkat = t.aktieIndkomstGraense * t.aktieIndkomstLavSats
        + (aktieIndkomst - t.aktieIndkomstGraense) * t.aktieIndkomstHoejSats;
    }
  }

  // 10. Rentefradragets skatteværdi (informativt — allerede indregnet i kommuneskat)
  //     Skatteværdi = netto renteudgifter × (kommuneSats + bundskat%) ≈ 33%
  const rentefradragSkattevaerdi = nettoRenter * (kommSats + t.bundskatRate);

  const totalSkat = amBidrag + bundskat + kommuneskat + kirkeskat + topskat + aktieIndkomstSkat;
  const nettoUdbetaling = bruttoIndkomst - totalSkat;
  const effektivSkattesats = bruttoIndkomst > 0 ? (totalSkat / bruttoIndkomst) * 100 : 0;

  // Marginalskattesats på lønindkomst (inkl. AM-bidrag)
  // Under topskattegrænsen: AM-bidrag + bundskat + kommuneskat = 8% + 12,01% + kommuneSats%
  // Men AM-bidrag beregnes af brutto, de andre af personlig indkomst
  // Effektiv marginal = 1 - (1-0.08) * (1 - 0.1201 - kommSats)
  let marginalSkattesats: number;
  if (personligIndkomst > t.topskatGraense) {
    // Over topskat: 8% + (12.01% + kommuneSats% + 15%) * 0.92
    marginalSkattesats = (1 - (1 - t.amBidragRate) * (1 - t.bundskatRate - kommSats - t.topskatRate)) * 100;
  } else {
    marginalSkattesats = (1 - (1 - t.amBidragRate) * (1 - t.bundskatRate - kommSats)) * 100;
  }

  return {
    bruttoIndkomst, amBidrag, personligIndkomst, beskFradrag,
    skattepligtigIndkomst, personfradrag: t.personfradrag, bundskatGrundlag,
    bundskat, kommuneskatGrundlag, kommuneskat, kirkeskat, topskat,
    aktieIndkomstSkat, rentefradragSkattevaerdi, totalSkat, nettoUdbetaling,
    effektivSkattesats, marginalSkattesats, skatteloftKorrektion,
  };
}

function Row({ label, value, color, bold, indent, info }: {
  label: string; value: string; color?: string; bold?: boolean; indent?: boolean; info?: string;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      paddingLeft: indent ? 16 : 0,
    }}>
      <span style={{ fontSize: 13, color: bold ? "#e7e5e4" : "#a8a29e", fontWeight: bold ? 600 : 400, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        {info && (
          <span title={info} style={{ cursor: "help", color: "#57534e" }}>
            <Info style={{ width: 12, height: 12 }} />
          </span>
        )}
      </span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: color ?? "#e7e5e4", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#5B42F3", textTransform: "uppercase", letterSpacing: "0.08em", padding: "14px 0 4px", marginTop: 4 }}>
      {children}
    </div>
  );
}

export default function SkatTab() {
  const [bruttoIndkomst, setBruttoIndkomst] = useState(600_000);
  const [kommuneIdx, setKommuneIdx] = useState(0);
  const [manuelKommune, setManuelKommune] = useState(25.1);
  const [kirkeMedlem, setKirkeMedlem] = useState(true);
  const [kirkeSats, setKirkeSats] = useState(0.72);
  const [renteudgifter, setRenteudgifter] = useState(0);
  const [kapitalIndkomst, setKapitalIndkomst] = useState(0);
  const [aktieIndkomst, setAktieIndkomst] = useState(0);

  const kommuneSats = useMemo(() => {
    const k = KOMMUNER[kommuneIdx];
    return k.sats === -1 ? manuelKommune : k.sats;
  }, [kommuneIdx, manuelKommune]);

  const result = useMemo(() => beregnSkat({
    bruttoIndkomst,
    kommuneSats,
    kirkeSats: kirkeMedlem ? kirkeSats : 0,
    renteudgifter,
    kapitalIndkomst,
    aktieIndkomst,
  }), [bruttoIndkomst, kommuneSats, kirkeMedlem, kirkeSats, renteudgifter, kapitalIndkomst, aktieIndkomst]);

  const isTopSkatYder = result.personligIndkomst > TAX_2025.topskatGraense;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Skatteberegner 2025</h2>
      <p style={{ color: "var(--text-2)", marginBottom: 24 }}>
        Præcis dansk skatteberegning baseret på gældende satser fra SKAT.dk
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── VENSTRE: Input ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Lønindkomst */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4f1ee", marginBottom: 16, margin: "0 0 16px" }}>
                Indkomst
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#a8a29e" }}>Bruttoløn (årsindkomst)</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      className="uv-input"
                      value={bruttoIndkomst}
                      onChange={e => setBruttoIndkomst(Number(e.target.value))}
                      min={0}
                      step={1000}
                      style={{ paddingRight: 40 }}
                    />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#57534e" }}>kr.</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#57534e" }}>
                    ≈ {kr(Math.round(bruttoIndkomst / 12))} / måned
                  </span>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#a8a29e" }}>Renteudgifter (realkreditlån, banklån)</span>
                  <div style={{ position: "relative" }}>
                    <input type="number" className="uv-input" value={renteudgifter}
                      onChange={e => setRenteudgifter(Number(e.target.value))} min={0} step={1000}
                      style={{ paddingRight: 40 }} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#57534e" }}>kr.</span>
                  </div>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#a8a29e" }}>Kapitalindkomst (bankrenter, udlejning m.v.)</span>
                  <div style={{ position: "relative" }}>
                    <input type="number" className="uv-input" value={kapitalIndkomst}
                      onChange={e => setKapitalIndkomst(Number(e.target.value))} step={1000}
                      style={{ paddingRight: 40 }} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#57534e" }}>kr.</span>
                  </div>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#a8a29e" }}>Aktieindkomst (udbytte + realiserede gevinster)</span>
                  <div style={{ position: "relative" }}>
                    <input type="number" className="uv-input" value={aktieIndkomst}
                      onChange={e => setAktieIndkomst(Number(e.target.value))} min={0} step={1000}
                      style={{ paddingRight: 40 }} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#57534e" }}>kr.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Kommune og kirkeskat */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4f1ee", margin: "0 0 16px" }}>
                Kommuneskat & Kirkeskat
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#a8a29e" }}>Kommune (2025-satser)</span>
                  <select
                    className="uv-input"
                    value={kommuneIdx}
                    onChange={e => setKommuneIdx(Number(e.target.value))}
                    style={{ appearance: "auto" }}
                  >
                    {KOMMUNER.map((k, i) => (
                      <option key={k.navn} value={i}>
                        {k.navn}{k.sats !== -1 ? ` — ${k.sats.toFixed(2)}%` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {KOMMUNER[kommuneIdx].sats === -1 && (
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "#a8a29e" }}>Manuel kommuneskatteprocent</span>
                    <div style={{ position: "relative" }}>
                      <input type="number" className="uv-input" value={manuelKommune}
                        onChange={e => setManuelKommune(Number(e.target.value))}
                        min={0} max={35} step={0.1} style={{ paddingRight: 28 }} />
                      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#57534e" }}>%</span>
                    </div>
                  </label>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#a8a29e" }}>Medlem af folkekirken</span>
                  <button
                    onClick={() => setKirkeMedlem(!kirkeMedlem)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: "none",
                      background: kirkeMedlem ? "linear-gradient(144deg, #AF40FF, #5B42F3)" : "var(--border)",
                      position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 3, left: kirkeMedlem ? 23 : 3,
                      width: 18, height: 18, backgroundColor: "white",
                      borderRadius: "50%", transition: "left 0.2s ease",
                    }} />
                  </button>
                </div>

                {kirkeMedlem && (
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "#a8a29e" }}>Kirkeskatteprocent (typisk 0,60–1,00%)</span>
                    <div style={{ position: "relative" }}>
                      <input type="number" className="uv-input" value={kirkeSats}
                        onChange={e => setKirkeSats(Number(e.target.value))}
                        min={0} max={2} step={0.01} style={{ paddingRight: 28 }} />
                      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#57534e" }}>%</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Satser info */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#5B42F3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Gældende satser 2025
              </p>
              {[
                ["AM-bidrag", "8,00%"],
                ["Bundskat", "12,01%"],
                ["Topskat (over 611.800 kr.)", "15,00%"],
                ["Beskæftigelsesfradrag", "10,65% (max 46.700 kr.)"],
                ["Personfradrag", "49.700 kr."],
                ["Aktieindkomst under 67.500 kr.", "27,00%"],
                ["Aktieindkomst over 67.500 kr.", "42,00%"],
                ["Skatteloft (ekskl. kirkeskat)", "52,07%"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 12, color: "#78716c" }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#2dd4bf" }}>{v}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: "#57534e", marginTop: 10 }}>
                Kilde: SKAT.dk · Satser gælder for indkomståret 2025
              </p>
            </div>
          </div>
        </div>

        {/* ── HØJRE: Resultat ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Nøgletal */}
          <div className="uv-card-2">
            <div style={{ padding: 24, background: "rgba(0,0,0,0.55)", borderRadius: "inherit" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Årsresultat {TAX_2025.year}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Nettoudbetaling</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#4ade80", lineHeight: 1 }}>
                    {kr(Math.round(result.nettoUdbetaling))}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    ≈ {kr(Math.round(result.nettoUdbetaling / 12))} / måned
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Total skat</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#f43f5e", lineHeight: 1 }}>
                    {kr(Math.round(result.totalSkat))}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    ≈ {kr(Math.round(result.totalSkat / 12))} / måned
                  </p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Effektiv skattesats</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#fbbf24" }}>{pct(result.effektivSkattesats)}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Marginalskattesats</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: isTopSkatYder ? "#f43f5e" : "#2dd4bf" }}>
                    {pct(result.marginalSkattesats)}
                  </p>
                </div>
              </div>
              {isTopSkatYder && (
                <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(244,63,94,0.15)", borderRadius: 8, fontSize: 12, color: "#fca5a5" }}>
                  ⚠️ Topskatteyder — du betaler topskat af {kr(Math.round(result.personligIndkomst - TAX_2025.topskatGraense))} over grænsen
                </div>
              )}
            </div>
          </div>

          {/* Detaljeret beregning */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4f1ee", margin: "0 0 4px" }}>Detaljeret beregning</h3>

              <SectionTitle>Indkomstopgørelse</SectionTitle>
              <Row label="Bruttoindkomst (løn)" value={kr(result.bruttoIndkomst)} bold />
              <Row label="AM-bidrag (8%)" value={"− " + kr(Math.round(result.amBidrag))} color="#f43f5e" indent info="Arbejdsmarkedsbidrag — indbetales automatisk af din arbejdsgiver" />
              <Row label="Personlig indkomst" value={kr(Math.round(result.personligIndkomst))} bold />
              <Row label={`Beskæftigelsesfradrag (10,65%, max ${kr(TAX_2025.beskFradragMax)})`}
                value={"− " + kr(Math.round(result.beskFradrag))} color="#4ade80" indent
                info="Automatisk fradrag for lønmodtagere" />
              {(renteudgifter > 0 || kapitalIndkomst > 0) && (
                <Row
                  label={kapitalIndkomst > renteudgifter ? "Netto kapitalindkomst (+)" : "Netto renteudgifter (−)"}
                  value={(kapitalIndkomst > renteudgifter ? "+ " : "− ") + kr(Math.abs(kapitalIndkomst - renteudgifter))}
                  color={kapitalIndkomst > renteudgifter ? "#f43f5e" : "#4ade80"}
                  indent
                />
              )}
              <Row label="Skattepligtig indkomst" value={kr(Math.round(result.skattepligtigIndkomst))} bold />
              <Row label={`Personfradrag (${kr(TAX_2025.personfradrag)})`}
                value={"− " + kr(TAX_2025.personfradrag)} color="#4ade80" indent
                info="Alle over 18 år har et personfradrag på 49.700 kr. (2025)" />

              <SectionTitle>Skatteberegning</SectionTitle>
              <Row label={`Bundskat (12,01% af ${kr(Math.round(result.bundskatGrundlag))})`}
                value={kr(Math.round(result.bundskat))} color="#f43f5e"
                info="Statslig bundskat — betales til staten" />
              <Row label={`Kommuneskat (${pct(kommuneSats, 2)} af ${kr(Math.round(result.kommuneskatGrundlag))})`}
                value={kr(Math.round(result.kommuneskat))} color="#f43f5e"
                info="Betales til din kommune" />
              {kirkeMedlem && (
                <Row label={`Kirkeskat (${pct(kirkeSats, 2)})`}
                  value={kr(Math.round(result.kirkeskat))} color="#f43f5e"
                  info="Betales til folkekirken — kun for medlemmer" />
              )}
              {isTopSkatYder && (
                <Row label={`Topskat (15% af ${kr(Math.round(result.personligIndkomst - TAX_2025.topskatGraense))} over grænsen)`}
                  value={kr(Math.round(result.topskat))} color="#f43f5e"
                  info="Topskat betales af personlig indkomst over 611.800 kr. (2025)" />
              )}
              {result.skatteloftKorrektion > 0 && (
                <Row label="Skatteloftskorrektion (52,07%)"
                  value={"− " + kr(Math.round(result.skatteloftKorrektion))} color="#4ade80"
                  info="Skatteloftet begrænser den samlede skat til max 52,07% af personlig indkomst" />
              )}
              {aktieIndkomst > 0 && (
                <Row label={`Aktieindkomstskat (27/42% af ${kr(aktieIndkomst)})`}
                  value={kr(Math.round(result.aktieIndkomstSkat))} color="#f43f5e" />
              )}

              <SectionTitle>Resultat</SectionTitle>
              <Row label="Total skat" value={kr(Math.round(result.totalSkat))} bold color="#f43f5e" />
              <Row label="Nettoudbetaling" value={kr(Math.round(result.nettoUdbetaling))} bold color="#4ade80" />
              <Row label="Effektiv skattesats" value={pct(result.effektivSkattesats)} />
              <Row label="Marginalskattesats" value={pct(result.marginalSkattesats)} />

              {renteudgifter > 0 && (
                <>
                  <SectionTitle>Fradragsinfo</SectionTitle>
                  <Row label="Rentefradragets skatteværdi"
                    value={kr(Math.round(result.rentefradragSkattevaerdi))}
                    color="#2dd4bf"
                    info={`Renteudgifter reducerer kommuneskat + bundskat med ca. ${pct((kommuneSats + 12.01), 1)}. Ikke al renteudgift er lig med skat sparet.`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Indberetning til SKAT */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4f1ee", margin: "0 0 16px" }}>
                Hvad skal du indberette til SKAT?
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: "12px 14px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#4ade80", marginBottom: 6 }}>
                    ✓ Indberettes automatisk af din arbejdsgiver / bank
                  </p>
                  <ul style={{ fontSize: 12, color: "#78716c", paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <li>Lønindkomst og AM-bidrag (fra arbejdsgiver via felt 11/12)</li>
                    <li>Bankrenter og realkreditrenter (fra pengeinstitut)</li>
                    <li>Aktieindkomst fra dansk værdipapirdepot (fra bank)</li>
                    <li>Pensionsindbetalinger (fra arbejdsgiver/pensionsselskab)</li>
                    <li>A-skat (trækkes automatisk fra din løn)</li>
                  </ul>
                </div>

                <div style={{ padding: "12px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>
                    ⚠ Skal selv indberettes (årsopgørelse)
                  </p>
                  <ul style={{ fontSize: 12, color: "#78716c", paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <li>Befordringsfradrag — kørsel til/fra arbejde over 24 km/dag (felt 51)</li>
                    <li>Fagforeningskontingent — max 7.000 kr. (felt 48)</li>
                    <li>Håndværkerfradrag / serviceydelser i hjemmet (ServiceFradrag, max 25.900 kr.)</li>
                    <li>Gaver til godkendte velgørende foreninger — max 18.300 kr. (felt 53)</li>
                    <li>Aktieindkomst fra udenlandsk depot</li>
                    <li>Renteudgifter på udenlandsk lån</li>
                    <li>Underskud i virksomhed / fremført underskud</li>
                  </ul>
                </div>

                <div style={{ padding: "12px 14px", background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#2dd4bf", marginBottom: 6 }}>
                    📅 Vigtige datoer
                  </p>
                  <ul style={{ fontSize: 12, color: "#78716c", paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <li><strong style={{ color: "#e7e5e4" }}>Forskudsopgørelsen</strong> — tilpas løbende på skat.dk/forskudsopgoerelse så du betaler det rigtige beløb</li>
                    <li><strong style={{ color: "#e7e5e4" }}>1. marts</strong> — årsopgørelsen for {TAX_2025.year - 1} er klar på skat.dk</li>
                    <li><strong style={{ color: "#e7e5e4" }}>1. maj</strong> — frist for at rette i årsopgørelsen</li>
                    <li><strong style={{ color: "#e7e5e4" }}>1. juli</strong> — frist for selvstændige / komplekse sager</li>
                  </ul>
                </div>

                <p style={{ fontSize: 11, color: "#57534e", marginTop: 4 }}>
                  Beregningen er vejledende og baseret på 2025-satser. Individuelle forhold kan påvirke resultatet.
                  Konsulter en revisor eller SKAT direkte for bindende svar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
