"use client";

import { useState } from "react";

interface Contact { phone: string; name?: string; title?: string; }
interface TechStack {
  hosting?: string;
  server?: string;
  cms?: string;
  plugins?: string[];
  frameworks?: string[];
  analytics?: string[];
}
interface DkimResult { selector: string; found: boolean; value?: string; }
interface DnsInfo {
  ip?: string;
  ipGeo?: { country?: string; city?: string; org?: string; isp?: string };
  nameservers?: string[];
  mx?: string[];
  mailProvider?: string;
  dkim?: DkimResult[];
  txt?: string[];
  spf?: string;
  dmarc?: string;
  ssl?: { valid: boolean };
}
interface DomainResult {
  url: string; hostname: string; statusCode: number | null;
  mailOnly?: boolean;
  contacts: Contact[];
  tech?: TechStack | null;
  dnsInfo?: DnsInfo;
}

export default function DomainCheckTab() {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<DomainResult | null>(null);
  const [error, setError]     = useState("");

  async function check() {
    let u = url.trim();
    if (!u) return;
    // If input looks like an email, extract the domain
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) {
      u = u.split("@")[1];
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`/api/domain-check?url=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const tech = result?.tech;
  const dns  = result?.dnsInfo;
  const hasTech = !result?.mailOnly && tech && (
    tech.hosting || tech.server || tech.cms ||
    (tech.frameworks?.length ?? 0) > 0 ||
    (tech.analytics?.length ?? 0) > 0 ||
    (tech.plugins?.length ?? 0) > 0
  );
  const hasDns = dns && (
    dns.ip || (dns.nameservers?.length ?? 0) > 0 ||
    (dns.mx?.length ?? 0) > 0 || dns.spf || dns.dmarc
  );
  const hasMail = dns && (
    (dns.mx?.length ?? 0) > 0 || dns.spf || dns.dmarc ||
    (dns.dkim?.length ?? 0) > 0
  );

  // Mail security score 0-4
  const mailScore = hasMail ? [
    (dns!.mx?.length ?? 0) > 0,
    !!dns!.spf,
    !!dns!.dmarc,
    (dns!.dkim?.length ?? 0) > 0,
  ].filter(Boolean).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Domæne-tjek</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Indsæt en hjemmeside eller e-mailadresse og få DNS-info, mailserver, teknologi og kontaktpersoner
        </p>
      </div>

      {/* Input */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder="example.com eller navn@example.com"
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
            />
            <button onClick={check} disabled={loading || !url.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text">
                <span>{loading ? "Søger..." : "🔍 Analyser"}</span>
              </span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🔍</p>
          <p style={{ margin: 0 }}>Henter DNS-info og scanner siden...</p>
        </div>
      )}

      {result && (
        <>
          {/* Status bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {result.mailOnly ? (
              <span style={{
                padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                background: "rgba(251,191,36,0.15)", color: "#fbbf24",
                border: "1.5px solid rgba(251,191,36,0.35)",
              }}>
                ✉️ Mail-only domæne
              </span>
            ) : (
              <span style={{
                padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                background: result.statusCode === 200 ? "rgba(163,230,53,0.15)" : "rgba(248,113,113,0.15)",
                color: result.statusCode === 200 ? "#a3e635" : "#f87171",
                border: `1.5px solid ${result.statusCode === 200 ? "rgba(163,230,53,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
                {result.statusCode === 200 ? "✓ Online" : `HTTP ${result.statusCode}`}
              </span>
            )}
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>{result.hostname}</span>
            {dns?.ip && (
              <span style={{
                padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                background: "rgba(0,221,235,0.1)", border: "1.5px solid rgba(0,221,235,0.25)", color: "#00DDEB",
              }}>
                IP: {dns.ip}
              </span>
            )}
            {dns?.ssl?.valid && (
              <span style={{
                padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                background: "rgba(163,230,53,0.12)", border: "1.5px solid rgba(163,230,53,0.3)", color: "#a3e635",
              }}>
                🔒 HTTPS/HSTS
              </span>
            )}
          </div>

          {/* DNS info */}
          {hasDns && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 18px" }}>
                  🌐 DNS & Netværk
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* IP + Geo */}
                  {dns!.ip && (
                    <DnsRow label="IP-adresse" value={
                      dns!.ipGeo
                        ? `${dns!.ip} — ${[dns!.ipGeo.city, dns!.ipGeo.country].filter(Boolean).join(", ")}${dns!.ipGeo.org ? ` · ${dns!.ipGeo.org}` : ""}`
                        : dns!.ip
                    } mono />
                  )}

                  {/* ISP */}
                  {dns!.ipGeo?.isp && dns!.ipGeo.isp !== dns!.ipGeo.org && (
                    <DnsRow label="ISP" value={dns!.ipGeo.isp} />
                  )}

                  {/* Nameservers */}
                  {(dns!.nameservers?.length ?? 0) > 0 && (
                    <DnsMultiRow label="Navneservere" values={dns!.nameservers!} mono />
                  )}

                  {/* MX */}
                  {(dns!.mx?.length ?? 0) > 0 && (
                    <DnsMultiRow label="Mail (MX)" values={dns!.mx!} mono />
                  )}

                  {/* SPF */}
                  {dns!.spf && (
                    <DnsRow label="SPF" value={dns!.spf} mono truncate />
                  )}

                  {/* DMARC */}
                  {dns!.dmarc && (
                    <DnsRow label="DMARC" value={dns!.dmarc} mono truncate />
                  )}

                  {/* Other TXT */}
                  {(dns!.txt?.length ?? 0) > 0 && (
                    <DnsMultiRow label="TXT poster" values={dns!.txt!} mono truncate />
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Mail section */}
          {hasMail && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: 0 }}>
                    ✉️ Mail-opsætning
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: i < mailScore
                          ? (mailScore === 4 ? "#4ade80" : mailScore >= 3 ? "#facc15" : "#f87171")
                          : "rgba(255,255,255,0.1)",
                        border: `1.5px solid ${i < mailScore ? "transparent" : "rgba(255,255,255,0.15)"}`,
                      }} />
                    ))}
                    <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 4, color:
                      mailScore === 4 ? "#4ade80" : mailScore >= 3 ? "#facc15" : mailScore >= 2 ? "#fb923c" : "#f87171"
                    }}>
                      {mailScore === 4 ? "Sikker" : mailScore === 3 ? "God" : mailScore === 2 ? "Delvis" : "Svag"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Mail provider */}
                  {dns!.mailProvider && (
                    <MailCheckRow label="Udbyder" value={dns!.mailProvider} status="info" />
                  )}

                  {/* MX */}
                  <MailCheckRow
                    label="MX-record"
                    value={(dns!.mx?.length ?? 0) > 0 ? dns!.mx![0] : undefined}
                    status={(dns!.mx?.length ?? 0) > 0 ? "ok" : "missing"}
                    missingText="Ingen MX-records fundet"
                  />

                  {/* SPF */}
                  <MailCheckRow
                    label="SPF"
                    value={dns!.spf}
                    status={dns!.spf ? "ok" : "missing"}
                    missingText="Ingen SPF-record — afsendere kan ikke verificeres"
                  />

                  {/* DMARC */}
                  <MailCheckRow
                    label="DMARC"
                    value={dns!.dmarc}
                    status={dns!.dmarc ? "ok" : "missing"}
                    missingText="Ingen DMARC-record — risiko for spoofing"
                  />

                  {/* DKIM */}
                  {(dns!.dkim?.length ?? 0) > 0 ? (
                    dns!.dkim!.map(d => (
                      <MailCheckRow
                        key={d.selector}
                        label={`DKIM (${d.selector})`}
                        value={d.value}
                        status="ok"
                      />
                    ))
                  ) : (
                    <MailCheckRow
                      label="DKIM"
                      status="missing"
                      missingText="Ingen DKIM-nøgle fundet (tjekket 11 selektorer)"
                    />
                  )}

                  {/* Extra MX records */}
                  {(dns!.mx?.length ?? 0) > 1 && (
                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0,221,235,0.04)", border: "1px solid rgba(0,221,235,0.1)" }}>
                      <span style={{ fontSize: 11, color: "#00DDEB", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Alle MX-records
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
                        {dns!.mx!.map((m, i) => (
                          <span key={i} style={{ fontSize: 12, fontFamily: "monospace", color: "#1c1917" }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tech stack — only for domains with a website */}
          {!result.mailOnly && <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 18px" }}>
                🔍 Teknologi &amp; hosting
              </p>

              {hasTech ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {tech!.hosting   && <TechRow label="Hosting"    value={tech!.hosting} />}
                  {tech!.server    && <TechRow label="Server"     value={tech!.server} />}
                  {tech!.cms       && <TechRow label="CMS"        value={tech!.cms} />}
                  {(tech!.frameworks?.length ?? 0) > 0 && (
                    <ChipRow label="Frameworks &amp; biblioteker" chips={tech!.frameworks!} color="rgba(91,66,243,0.18)" borderColor="rgba(91,66,243,0.35)" textColor="#a78bfa" />
                  )}
                  {(tech!.analytics?.length ?? 0) > 0 && (
                    <ChipRow label="Analytics &amp; tracking" chips={tech!.analytics!} color="rgba(251,146,60,0.12)" borderColor="rgba(251,146,60,0.3)" textColor="#fb923c" />
                  )}
                  {(tech!.plugins?.length ?? 0) > 0 && (
                    <ChipRow label="Plugins" chips={tech!.plugins!} color="rgba(34,197,94,0.1)" borderColor="rgba(34,197,94,0.3)" textColor="#4ade80" />
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, fontStyle: "italic" }}>
                  Ingen teknologi detekteret
                </p>
              )}
            </div>
          </div>}

          {/* Contacts — only for domains with a website */}
          {!result.mailOnly && (result.contacts.length > 0 ? (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 18px" }}>
                  📞 {result.contacts.length} telefonnummer{result.contacts.length !== 1 ? "r" : ""} fundet
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.contacts.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "14px 18px", borderRadius: 12,
                      background: "rgba(91,66,243,0.07)", border: "1.5px solid rgba(91,66,243,0.2)",
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(144deg, #AF40FF, #5B42F3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                      }}>👤</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {c.name ? (
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: "0 0 2px" }}>{c.name}</p>
                        ) : (
                          <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 2px", fontStyle: "italic" }}>Ukendt navn</p>
                        )}
                        {c.title && (
                          <p style={{ fontSize: 12, color: "#a78bfa", margin: "0 0 2px", fontWeight: 600, textTransform: "capitalize" }}>
                            {c.title}
                          </p>
                        )}
                      </div>
                      <div style={{
                        padding: "7px 16px", borderRadius: 10, flexShrink: 0,
                        background: "rgba(0,0,0,0.3)", border: "1.5px solid rgba(167,139,250,0.3)",
                      }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#a78bfa", margin: 0, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                          {c.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 28, margin: "0 0 10px" }}>📭</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)", margin: "0 0 4px" }}>
                  Ingen telefonnumre fundet
                </p>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
                  Siden indeholder ikke synlige danske telefonnumre
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── DNS sub-components ───────────────────────────────────────────────────────

function DnsRow({ label, value, mono, truncate }: { label: string; value: string; mono?: boolean; truncate?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "9px 14px", borderRadius: 10, background: "rgba(0,221,235,0.04)", border: "1px solid rgba(0,221,235,0.1)" }}>
      <span style={{ fontSize: 11, color: "#00DDEB", fontWeight: 700, minWidth: 90, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 1 }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, fontWeight: 500, color: "#1c1917",
        fontFamily: mono ? "monospace" : undefined,
        wordBreak: "break-all",
        overflow: truncate ? "hidden" : undefined,
        textOverflow: truncate ? "ellipsis" : undefined,
        whiteSpace: truncate ? "nowrap" : undefined,
        flex: 1,
      }}>
        {value}
      </span>
    </div>
  );
}

function DnsMultiRow({ label, values, mono, truncate }: { label: string; values: string[]; mono?: boolean; truncate?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "9px 14px", borderRadius: 10, background: "rgba(0,221,235,0.04)", border: "1px solid rgba(0,221,235,0.1)" }}>
      <span style={{ fontSize: 11, color: "#00DDEB", fontWeight: 700, minWidth: 90, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 1 }}>
        {label}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
        {values.map((v, i) => (
          <span key={i} style={{
            fontSize: 13, fontWeight: 500, color: "#1c1917",
            fontFamily: mono ? "monospace" : undefined,
            overflow: truncate ? "hidden" : undefined,
            textOverflow: truncate ? "ellipsis" : undefined,
            whiteSpace: truncate ? "nowrap" : "break-spaces",
            wordBreak: "break-all",
          }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Mail sub-component ───────────────────────────────────────────────────────

function MailCheckRow({ label, value, status, missingText }: {
  label: string;
  value?: string;
  status: "ok" | "missing" | "info";
  missingText?: string;
}) {
  const colors = {
    ok:      { bg: "rgba(74,222,128,0.07)", border: "rgba(74,222,128,0.2)", dot: "#4ade80", label: "#4ade80" },
    missing: { bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.2)", dot: "#f87171", label: "#f87171" },
    info:    { bg: "rgba(0,221,235,0.06)", border: "rgba(0,221,235,0.18)", dot: "#00DDEB", label: "#00DDEB" },
  }[status];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: colors.bg, border: `1px solid ${colors.border}` }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.dot, flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        {value ? (
          <p style={{ fontSize: 12, fontFamily: "monospace", color: "#1c1917", margin: "3px 0 0", wordBreak: "break-all" }}>
            {value}
          </p>
        ) : missingText ? (
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: "3px 0 0", fontStyle: "italic" }}>{missingText}</p>
        ) : null}
      </div>
    </div>
  );
}

// ─── Tech sub-components ──────────────────────────────────────────────────────

function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, minWidth: 80, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1c1917" }}>
        {value}
      </span>
    </div>
  );
}

function ChipRow({ label, chips, color, borderColor, textColor }: {
  label: string;
  chips: string[];
  color: string;
  borderColor: string;
  textColor: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {chips.map((chip, i) => (
          <span key={i} style={{
            fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
            background: color, border: `1.5px solid ${borderColor}`, color: textColor,
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
