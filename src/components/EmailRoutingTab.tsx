"use client";

import { useState } from "react";

type StepStatus = "ok" | "warn" | "fail" | "skip";

interface RoutingStep {
  id: string;
  icon: string;
  label: string;
  short: string;
  status: StepStatus;
  detail: string;
  tip: string;
}

interface SimResult {
  domain: string;
  steps: RoutingStep[];
  score: number;
  scoreLabel: string;
  scoreColor: string;
  verdict: string;
}

const STATUS_ICON: Record<StepStatus, string> = {
  ok: "✅",
  warn: "⚠️",
  fail: "❌",
  skip: "⏭️",
};

const STATUS_COLOR: Record<StepStatus, string> = {
  ok:   "#34d399",
  warn: "#fbbf24",
  fail: "#f87171",
  skip: "#94a3b8",
};

const STATUS_BG: Record<StepStatus, string> = {
  ok:   "rgba(52,211,153,0.1)",
  warn: "rgba(251,191,36,0.1)",
  fail: "rgba(248,113,113,0.1)",
  skip: "rgba(148,163,184,0.07)",
};

// Deterministic hash so each domain always gets the same (but varied) result
function domainHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Simulated presets based on known domain patterns
function simulateDomain(domain: string): SimResult {
  const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*/, "");

  // Determine "quality" based on domain heuristics (pure simulation)
  const hasGoogle = d.includes("google") || d.includes("gmail");
  const hasMicrosoft = d.includes("microsoft") || d.includes("outlook") || d.includes("hotmail");
  const isLocalhost = d === "localhost" || d.startsWith("127.");
  const isTempDomain = /\.tk$|\.ml$|\.cf$|\.gq$/.test(d);

  // For generic domains: vary SPF/DKIM/DMARC deterministically based on domain string
  const h = domainHash(d);
  const STATUSES: StepStatus[] = ["ok", "warn", "fail"];
  const genericSpf:   StepStatus = STATUSES[h % 3];
  const genericDkim:  StepStatus = STATUSES[(h >> 4) % 3];
  const genericDmarc: StepStatus = STATUSES[(h >> 8) % 3];

  // MX step
  const mxStep: RoutingStep = {
    id: "mx",
    icon: "📬",
    label: "MX Record",
    short: "Mail Exchange",
    status: isLocalhost ? "fail" : isTempDomain ? "warn" : "ok",
    detail: isLocalhost
      ? `Ingen MX record fundet for "${d}" — localhost kan ikke modtage email.`
      : isTempDomain
      ? `MX record fundet, men domænet "${d}" er en gratis/temp-udbyder. Lavt omdømme.`
      : hasGoogle
      ? `MX records peger på Google Workspace (aspmx.l.google.com). Prioritet: 1, 5, 10, 20.`
      : hasMicrosoft
      ? `MX records peger på Microsoft Exchange Online (mail.protection.outlook.com). Prioritet: 0.`
      : `MX record fundet. Mailserveren er klar til at modtage post på "${d}".`,
    tip: isLocalhost
      ? "Tilføj en MX record til din DNS der peger på en mailserver."
      : isTempDomain
      ? "Brug et dedikeret domæne med godt omdømme for bedre leveringsrate."
      : "MX records ser korrekte ud.",
  };

  // SPF step
  const spfStatus: StepStatus = isLocalhost ? "fail" : isTempDomain ? "warn" : hasGoogle || hasMicrosoft ? "ok" : genericSpf;
  const spfStep: RoutingStep = {
    id: "spf",
    icon: "🔐",
    label: "SPF",
    short: "Sender Policy Framework",
    status: spfStatus,
    detail: isLocalhost
      ? `Ingen SPF record fundet for "${d}".`
      : hasGoogle
      ? `SPF record: "v=spf1 include:_spf.google.com ~all"\nTilladte afsendere: Google Workspace IPs. Soft fail (~all) for ukendte.`
      : hasMicrosoft
      ? `SPF record: "v=spf1 include:spf.protection.outlook.com -all"\nStreng afvisning (-all) for uautoriserede afsendere.`
      : isTempDomain
      ? `SPF record fundet, men for bred: "v=spf1 +all" — tillader alle afsendere. Kritisk fejl.`
      : genericSpf === "ok"
      ? `SPF record: "v=spf1 include:_spf.${d} -all"\nStreng afvisning (-all) for uautoriserede afsendere. Korrekt konfigureret.`
      : genericSpf === "warn"
      ? `SPF record fundet: "v=spf1 include:mail.${d} ~all"\nSoft fail (~all). Overvej -all for strammere kontrol.`
      : `Ingen SPF record fundet for "${d}". Alle afsendere er potentielt uautoriserede.`,
    tip: isLocalhost
      ? 'Tilføj en TXT record: "v=spf1 include:din-mailserver.dk -all"'
      : isTempDomain
      ? 'Erstat "+all" med "-all" for at forhindre spoofing.'
      : hasGoogle || hasMicrosoft
      ? "SPF er korrekt konfigureret."
      : genericSpf === "ok"
      ? "SPF er korrekt konfigureret med streng -all politik."
      : genericSpf === "warn"
      ? 'Overvej at ændre ~all til -all for strengere afvisning.'
      : 'Tilføj en TXT record: "v=spf1 include:din-mailserver.dk -all"',
  };

  // DKIM step
  const dkimStatus: StepStatus = isLocalhost ? "fail" : isTempDomain ? "fail" : hasGoogle || hasMicrosoft ? "ok" : genericDkim;
  const dkimStep: RoutingStep = {
    id: "dkim",
    icon: "🖊️",
    label: "DKIM",
    short: "DomainKeys Identified Mail",
    status: dkimStatus,
    detail: isLocalhost
      ? `Ingen DKIM signatur fundet for "${d}".`
      : hasGoogle
      ? `DKIM signatur: Gyldig ✓\nSelector: "google"\nNøgle: RSA-2048\nHeader: DKIM-Signature: v=1; a=rsa-sha256; d=${d}; s=google`
      : hasMicrosoft
      ? `DKIM signatur: Gyldig ✓\nSelector: "selector1"\nNøgle: RSA-2048\nHeader: DKIM-Signature: v=1; a=rsa-sha256; d=${d}; s=selector1`
      : isTempDomain
      ? `Ingen DKIM record fundet. Email kan ikke verificeres som ægte.`
      : genericDkim === "ok"
      ? `DKIM signatur: Gyldig ✓\nSelector: "mail"\nNøgle: RSA-2048\nHeader: DKIM-Signature: v=1; a=rsa-sha256; d=${d}; s=mail`
      : genericDkim === "warn"
      ? `DKIM TXT record fundet for selector "mail" på "${d}._domainkey.${d}"\nNøgletype: RSA-1024 — overvej at opgradere til 2048-bit.`
      : `Ingen DKIM record fundet for "${d}". Email kan ikke verificeres som ægte.`,
    tip: isLocalhost
      ? "Opsæt DKIM i din mailserver og tilføj en TXT record på default._domainkey."
      : isTempDomain
      ? "DKIM er kritisk for leveringsrate — sæt det op straks."
      : hasGoogle || hasMicrosoft
      ? "DKIM er korrekt konfigureret."
      : genericDkim === "ok"
      ? "DKIM er korrekt konfigureret med RSA-2048."
      : genericDkim === "warn"
      ? "Opgradér nøglelængde til RSA-2048 for bedre sikkerhed."
      : "Opsæt DKIM og tilføj en TXT record på default._domainkey.dit-domæne.",
  };

  // DMARC step
  const dmarcStatus: StepStatus = isLocalhost ? "fail" : isTempDomain ? "fail" : hasGoogle || hasMicrosoft ? "ok" : genericDmarc;
  const dmarcStep: RoutingStep = {
    id: "dmarc",
    icon: "🛡️",
    label: "DMARC",
    short: "Domain-based Message Authentication",
    status: dmarcStatus,
    detail: isLocalhost
      ? `Ingen DMARC record fundet for "${d}".`
      : hasGoogle
      ? `DMARC record: "v=DMARC1; p=reject; rua=mailto:dmarc@${d}; pct=100"\nPolicy: REJECT — stærk beskyttelse mod spoofing.`
      : hasMicrosoft
      ? `DMARC record: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${d}; pct=100"\nPolicy: QUARANTINE — mistænkelig email sendes til spam.`
      : isTempDomain
      ? `Ingen DMARC record fundet. Ingen beskyttelse mod domæne-spoofing.`
      : genericDmarc === "ok"
      ? `DMARC record: "v=DMARC1; p=quarantine; rua=mailto:dmarc@${d}; pct=100"\nPolicy: QUARANTINE — aktiv beskyttelse. Mistænkelig email sendes til spam.`
      : genericDmarc === "warn"
      ? `DMARC record: "v=DMARC1; p=none; rua=mailto:admin@${d}"\nPolicy: NONE — moniteringstilstand. Ingen aktiv afvisning. Overvej quarantine/reject.`
      : `Ingen DMARC record fundet for "${d}". Ingen beskyttelse mod domæne-spoofing.`,
    tip: isLocalhost
      ? 'Tilføj en TXT record på _dmarc: "v=DMARC1; p=quarantine; rua=mailto:dmarc@ditdomæne.dk"'
      : isTempDomain
      ? "DMARC skal sættes op med mindst p=quarantine."
      : hasGoogle || hasMicrosoft
      ? "DMARC er korrekt konfigureret med stærk policy."
      : genericDmarc === "ok"
      ? "DMARC er konfigureret med aktiv quarantine-beskyttelse."
      : genericDmarc === "warn"
      ? 'Skift fra p=none til p=quarantine og derefter p=reject efterhånden som du validerer.'
      : 'Tilføj TXT record på _dmarc: "v=DMARC1; p=quarantine; rua=mailto:dmarc@ditdomæne.dk"',
  };

  const steps = [mxStep, spfStep, dkimStep, dmarcStep];
  const okCount = steps.filter(s => s.status === "ok").length;
  const warnCount = steps.filter(s => s.status === "warn").length;
  const failCount = steps.filter(s => s.status === "fail").length;

  const score = Math.round((okCount * 25) + (warnCount * 10));
  const scoreColor = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  const scoreLabel = score >= 90 ? "Fremragende" : score >= 70 ? "God" : score >= 40 ? "Middel" : "Kritisk";
  const verdict = failCount > 0
    ? `${failCount} kritisk${failCount > 1 ? "e" : ""} fejl — email risikerer at blive afvist eller markeret som spam.`
    : warnCount > 0
    ? `${warnCount} advarsel${warnCount > 1 ? "er" : ""} — email kan nå frem, men med reduceret omdømme.`
    : "Alle tjek bestået — mail er konfigureret korrekt og bør leveres pålideligt.";

  return { domain: d, steps, score, scoreLabel, scoreColor, verdict };
}

export default function EmailRoutingTab() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<SimResult | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const runSim = () => {
    if (!domain.trim()) return;
    setResult(simulateDomain(domain));
    setExpandedStep(null);
  };

  return (
    <div style={{ padding: "24px 0", maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        📮 Email Routing Simulator
      </h2>
      <p style={{ color: "var(--text-2)", marginBottom: 4, fontSize: 14, lineHeight: 1.6 }}>
        Simulér mail-leveringsflowet for et domæne og se om email vil nå frem — og hvorfor ikke.
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { icon: "📬", text: "MX — modtager domænet overhovedet email?" },
          { icon: "🔏", text: "SPF / DKIM / DMARC — er afsender verificeret?" },
          { icon: "💡", text: "Konkrete tips til at rette konfigurationsfejl" },
        ].map(item => (
          <span key={item.icon} style={{
            fontSize: 12, color: "var(--text-3)", display: "flex", gap: 6, alignItems: "center",
          }}>
            <span>{item.icon}</span><span>{item.text}</span>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="uv-card-1" style={{ marginBottom: 20 }}>
        <div className="uv-card-1-inner" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>Indtast domæne</span>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-3)" }}>
              Skriv et domænenavn (f.eks. gmail.com) eller klik på et eksempel herunder
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="uv-input"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runSim()}
            placeholder="Indtast domæne, f.eks. gmail.com eller ditfirma.dk"
            style={{ flex: 1, minWidth: 240 }}
          />
          <button className="uv-btn" onClick={runSim} style={{ padding: "8px 20px" }}>
            Simulér
          </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["gmail.com", "outlook.com", "tempmail.tk", "localhost"].map(ex => (
            <button
              key={ex}
              onClick={() => { setDomain(ex); setResult(simulateDomain(ex)); setExpandedStep(null); }}
              style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
                color: "var(--text-2)", cursor: "pointer",
              }}
            >
              {ex}
            </button>
          ))}
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* Score card */}
          <div className="uv-card-1" style={{ marginBottom: 20 }}>
            <div className="uv-card-1-inner" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Leveringsscore
                </span>
                <div style={{
                  width: 82, height: 82, borderRadius: "50%",
                  border: `4px solid ${result.scoreColor}`,
                  background: `${result.scoreColor}10`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: result.scoreColor, lineHeight: 1 }}>{result.score}</span>
                  <span style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", marginTop: 2 }}>/ 100</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: result.scoreColor,
                  background: `${result.scoreColor}18`, padding: "2px 10px", borderRadius: 20,
                  border: `1px solid ${result.scoreColor}40`,
                }}>
                  {result.scoreLabel}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, color: "var(--text-2)", lineHeight: 1.6,
                  padding: "10px 14px", borderRadius: 10,
                  background: `${result.scoreColor}08`,
                  border: `1px solid ${result.scoreColor}25`,
                  marginBottom: 8,
                }}>
                  {result.verdict}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  Domæne analyseret: <span style={{ fontFamily: "monospace", color: "var(--text-2)" }}>{result.domain}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flow steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {result.steps.map((step, idx) => {
              const isLast = idx === result.steps.length - 1;
              const expanded = expandedStep === step.id;
              return (
                <div key={step.id} style={{ position: "relative" }}>
                  {/* Connector line */}
                  {!isLast && (
                    <div style={{
                      position: "absolute", left: 27, top: "100%",
                      width: 2, height: 16, background: "rgba(255,255,255,0.1)", zIndex: 1,
                    }} />
                  )}
                  <div
                    style={{
                      marginBottom: isLast ? 0 : 16,
                      borderRadius: 12,
                      border: `1px solid ${expanded ? STATUS_COLOR[step.status] : "rgba(255,255,255,0.08)"}`,
                      background: expanded ? STATUS_BG[step.status] : "rgba(255,255,255,0.03)",
                      overflow: "hidden",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      onClick={() => setExpandedStep(expanded ? null : step.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px", cursor: "pointer",
                      }}
                    >
                      {/* Status bubble */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: STATUS_BG[step.status],
                        border: `2px solid ${STATUS_COLOR[step.status]}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {STATUS_ICON[step.status]}
                      </div>

                      {/* Labels */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                            {step.icon} {step.label}
                          </span>
                          <span style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 10,
                            background: STATUS_BG[step.status], color: STATUS_COLOR[step.status],
                            border: `1px solid ${STATUS_COLOR[step.status]}`, fontWeight: 600,
                          }}>
                            {step.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{step.short}</div>
                      </div>

                      <span style={{ color: "var(--text-3)", fontSize: 18, marginLeft: 8 }}>
                        {expanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {expanded && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                          <pre style={{
                            background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 14px",
                            fontSize: 12, color: "var(--text-2)", fontFamily: "monospace",
                            whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0,
                          }}>
                            {step.detail}
                          </pre>
                          <div style={{
                            display: "flex", gap: 8, alignItems: "flex-start",
                            background: STATUS_BG[step.status],
                            border: `1px solid ${STATUS_COLOR[step.status]}`,
                            borderRadius: 8, padding: "8px 12px",
                          }}>
                            <span style={{ fontSize: 14 }}>💡</span>
                            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{step.tip}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {(["ok", "warn", "fail"] as StepStatus[]).map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{STATUS_ICON[s]}</span>
                <span style={{ fontSize: 12, color: STATUS_COLOR[s], fontWeight: 600 }}>
                  {s === "ok" ? "Konfigureret korrekt" : s === "warn" ? "Advarsel" : "Fejl / mangler"}
                </span>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="uv-card-1" style={{ marginTop: 20 }}>
            <div className="uv-card-1-inner">
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                ℹ️ Hvad er disse protokoller?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["📬 MX Record", "Angiver hvilken mailserver der modtager email til domænet."],
                  ["🔐 SPF", "Definerer hvilke IP-adresser der må sende email på vegne af domænet."],
                  ["🖊️ DKIM", "Tilføjer en digital signatur til emails så modtageren kan verificere afsenderen."],
                  ["🛡️ DMARC", "Bygger på SPF+DKIM og fortæller mailserveren hvad den skal gøre ved fejl."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                    <span style={{ color: "var(--text)", fontWeight: 600, minWidth: 100 }}>{title}</span>
                    <span style={{ color: "var(--text-3)" }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
