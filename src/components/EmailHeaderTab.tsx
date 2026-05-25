"use client";

import { useState, useMemo } from "react";

interface HopEntry {
  from: string;
  by: string;
  timestamp: string;
  delay: string;
  protocol: string;
}

interface AuthResult {
  protocol: "SPF" | "DKIM" | "DMARC";
  status: "pass" | "fail" | "neutral" | "softfail" | "none" | "unknown";
  detail: string;
}

interface RedFlag {
  id: string;
  icon: string;
  label: string;
  severity: "critical" | "warn" | "info";
}

interface ParsedHeader {
  from: string;
  to: string;
  subject: string;
  date: string;
  messageId: string;
  returnPath: string;
  replyTo: string;
  xMailer: string;
  contentType: string;
  hops: HopEntry[];
  auth: AuthResult[];
  senderIp: string;
  rdns: string;
  flags: RedFlag[];
}

const PROTO_DESC: Record<string, string> = {
  SPF:   "Kontrollerer om afsender-IP er autoriseret af domænets DNS-record",
  DKIM:  "Verificerer digital signatur — sikrer at mailen ikke er ændret undervejs",
  DMARC: "Tjekker at SPF/DKIM stemmer overens med den synlige From-adresse",
};

const STATUS_COLOR: Record<string, string> = {
  pass: "#34d399",
  fail: "#f87171",
  neutral: "#94a3b8",
  softfail: "#fbbf24",
  none: "#94a3b8",
  unknown: "#94a3b8",
};

const STATUS_ICON: Record<string, string> = {
  pass: "✅",
  fail: "❌",
  neutral: "⚪",
  softfail: "⚠️",
  none: "⚪",
  unknown: "❓",
};

function parseReceivedHop(received: string): HopEntry {
  const fromMatch = received.match(/from\s+(\S+)/i);
  const byMatch = received.match(/by\s+(\S+)/i);
  const protoMatch = received.match(/with\s+(\S+)/i);
  const tsMatch = received.match(/;\s*(.+)$/);

  return {
    from: fromMatch?.[1] || "?",
    by: byMatch?.[1] || "?",
    protocol: protoMatch?.[1] || "SMTP",
    timestamp: tsMatch?.[1]?.trim() || "",
    delay: "",
  };
}

function parseAuthHeader(line: string): AuthResult[] {
  const results: AuthResult[] = [];
  const spfMatch = line.match(/spf=(\w+)/i);
  const dkimMatch = line.match(/dkim=(\w+)/i);
  const dmarcMatch = line.match(/dmarc=(\w+)/i);
  const spfDetail = line.match(/(?:smtp\.mailfrom|envelope-from)=([^\s;]+)/i);
  const dkimDetail = line.match(/header\.(?:d|from)=([^\s;]+)/i);

  if (spfMatch) results.push({
    protocol: "SPF",
    status: spfMatch[1].toLowerCase() as AuthResult["status"],
    detail: spfDetail?.[1] || spfMatch[1],
  });
  if (dkimMatch) results.push({
    protocol: "DKIM",
    status: dkimMatch[1].toLowerCase() as AuthResult["status"],
    detail: dkimDetail?.[1] || dkimMatch[1],
  });
  if (dmarcMatch) results.push({
    protocol: "DMARC",
    status: dmarcMatch[1].toLowerCase() as AuthResult["status"],
    detail: dmarcMatch[1],
  });

  return results;
}

function extractIp(text: string): string {
  const m = text.match(/\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?/);
  return m?.[1] || "";
}

function isDatacenterIp(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  // Common datacenter ranges (simplified heuristic)
  if (parts[0] === 192 && parts[1] === 168) return false; // private
  if (parts[0] === 10) return false; // private
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false; // private
  return true; // Public IP — could be datacenter
}

function parseEmailHeader(raw: string): ParsedHeader {
  const lines: string[] = [];
  // Unfold header lines (lines starting with whitespace are continuation of previous)
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s+/.test(line) && lines.length > 0) {
      lines[lines.length - 1] += " " + line.trim();
    } else {
      lines.push(line);
    }
  }

  const getHeader = (name: string) => {
    const re = new RegExp(`^${name}:\\s*(.+)$`, "im");
    const m = raw.match(re);
    return m?.[1]?.trim() || "";
  };

  const getAllHeaders = (name: string): string[] => {
    const re = new RegExp(`^${name}:\\s*(.+)$`, "gim");
    const results: string[] = [];
    let m;
    while ((m = re.exec(raw)) !== null) results.push(m[1].trim());
    return results;
  };

  const from = getHeader("From");
  const to = getHeader("To");
  const subject = getHeader("Subject");
  const date = getHeader("Date");
  const messageId = getHeader("Message-ID");
  const returnPath = getHeader("Return-Path");
  const replyTo = getHeader("Reply-To");
  const xMailer = getHeader("X-Mailer") || getHeader("X-Sending-MTA");
  const contentType = getHeader("Content-Type");

  // Auth
  const authHeaders = getAllHeaders("Authentication-Results");
  const authLine = authHeaders.join(" ");
  const auth = authHeaders.length > 0 ? parseAuthHeader(authLine) : [];

  // If no Auth-Results, check Received-SPF
  const receivedSpf = getHeader("Received-SPF");
  if (receivedSpf && !auth.find(a => a.protocol === "SPF")) {
    const statusMatch = receivedSpf.match(/^(\w+)/);
    auth.push({
      protocol: "SPF",
      status: (statusMatch?.[1]?.toLowerCase() || "unknown") as AuthResult["status"],
      detail: receivedSpf.slice(0, 80),
    });
  }

  // Hops from Received headers
  const receivedHeaders = getAllHeaders("Received");
  const hops: HopEntry[] = receivedHeaders.reverse().map(r => parseReceivedHop(r));

  // Compute delays
  for (let i = 1; i < hops.length; i++) {
    try {
      const t1 = new Date(hops[i - 1].timestamp).getTime();
      const t2 = new Date(hops[i].timestamp).getTime();
      const diffSec = Math.abs(t2 - t1) / 1000;
      if (!isNaN(diffSec)) {
        hops[i].delay = diffSec < 60 ? `+${Math.round(diffSec)}s` : `+${Math.round(diffSec / 60)}m`;
      }
    } catch { /* ignore */ }
  }

  // Extract sender IP from first Received
  const firstReceived = receivedHeaders[receivedHeaders.length - 1] || "";
  const senderIp = extractIp(firstReceived);
  const rdnsMatch = firstReceived.match(/from\s+(\S+)\s+\(/);
  const rdns = rdnsMatch?.[1] || "";

  // Red flags
  const flags: RedFlag[] = [];

  const spfResult = auth.find(a => a.protocol === "SPF");
  const dkimResult = auth.find(a => a.protocol === "DKIM");
  const dmarcResult = auth.find(a => a.protocol === "DMARC");

  if (spfResult && (spfResult.status === "fail" || spfResult.status === "softfail")) {
    flags.push({ id: "spf-fail", icon: "🔴", label: `SPF ${spfResult.status} — Afsender-IP er ikke autoriseret`, severity: "critical" });
  }
  if (dkimResult && dkimResult.status === "fail") {
    flags.push({ id: "dkim-fail", icon: "🔴", label: "DKIM fail — Digital signatur er ugyldig eller mangler", severity: "critical" });
  }
  if (dmarcResult && dmarcResult.status === "fail") {
    flags.push({ id: "dmarc-fail", icon: "🔴", label: "DMARC fail — Email opfylder ikke domænets mail-politik", severity: "critical" });
  }
  if (hops.length > 5) {
    flags.push({ id: "many-hops", icon: "⚠️", label: `Mange hops (${hops.length}) — unormalt routingmønster`, severity: "warn" });
  }
  if (returnPath && from) {
    const fpDomain = from.match(/@([^>]+)/)?.[1]?.toLowerCase();
    const rpDomain = returnPath.match(/@([^>]+)/)?.[1]?.toLowerCase();
    if (fpDomain && rpDomain && fpDomain !== rpDomain) {
      flags.push({ id: "domain-mismatch", icon: "🔴", label: `From/Return-Path mismatch: ${fpDomain} vs ${rpDomain}`, severity: "critical" });
    }
  }
  if (senderIp && isDatacenterIp(senderIp)) {
    flags.push({ id: "datacenter-ip", icon: "⚠️", label: `Afsender-IP (${senderIp}) er et offentligt/datacenter IP`, severity: "warn" });
  }
  if (!spfResult && !dkimResult) {
    flags.push({ id: "no-auth", icon: "⚠️", label: "Ingen SPF eller DKIM authentication resultater fundet", severity: "warn" });
  }

  return { from, to, subject, date, messageId, returnPath, replyTo, xMailer, contentType, hops, auth, senderIp, rdns, flags };
}

const SAMPLE_HEADER = `Delivered-To: recipient@example.com
Received: from mail-wr1-f68.google.com (mail-wr1-f68.google.com [209.85.221.68])
        by mx.example.com with ESMTPS id a12si34567890wrx.123.2024.03.15.08.30.01
        for <recipient@example.com>; Fri, 15 Mar 2024 08:30:01 -0700
Received-SPF: pass (google.com: domain of sender@gmail.com designates 209.85.221.68 as permitted sender) client-ip=209.85.221.68
Authentication-Results: mx.example.com;
       dkim=pass header.i=@gmail.com header.s=20230601 header.b=abc123;
       spf=pass (google.com: domain of sender@gmail.com designates 209.85.221.68 as permitted sender) smtp.mailfrom=sender@gmail.com;
       dmarc=pass (p=NONE sp=QUARANTINE dis=NONE) header.from=gmail.com
Received: from mail-sender.gmail.com ([10.0.0.1])
        by smtp.gmail.com with ESMTPSA id g5sm678901qkg.52.2024.03.15.08.29.59
        for <recipient@example.com>; Fri, 15 Mar 2024 08:29:59 -0700
MIME-Version: 1.0
From: John Doe <sender@gmail.com>
Date: Fri, 15 Mar 2024 15:29:58 +0000
Message-ID: <CAHx=abc123@mail.gmail.com>
Subject: Vigtigt møde i morgen
To: recipient@example.com
Return-Path: <sender@gmail.com>
Content-Type: text/plain; charset="UTF-8"
X-Mailer: Gmail`;

const FLAG_COLOR: Record<string, string> = {
  critical: "#f87171",
  warn: "#fbbf24",
  info: "#60a5fa",
};
const FLAG_BG: Record<string, string> = {
  critical: "rgba(248,113,113,0.1)",
  warn: "rgba(251,191,36,0.1)",
  info: "rgba(96,165,250,0.1)",
};

export default function EmailHeaderTab() {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedHeader | null>(null);

  const analyze = () => {
    if (!raw.trim()) return;
    setParsed(parseEmailHeader(raw));
  };

  const score = useMemo(() => {
    if (!parsed) return 0;
    let s = 100;
    for (const f of parsed.flags) {
      if (f.severity === "critical") s -= 25;
      else if (f.severity === "warn") s -= 10;
    }
    return Math.max(0, s);
  }, [parsed]);

  const scoreColor = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  const scoreLabel = score >= 80 ? "Legitim" : score >= 50 ? "Mistænksom" : "Farlig / spoofing";

  return (
    <div style={{ padding: "24px 0", maxWidth: 960, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        📧 Email Header Analyzer
      </h2>
      <p style={{ color: "var(--text-2)", marginBottom: 4, fontSize: 14, lineHeight: 1.6 }}>
        Indsæt råe email-headers og få øjeblikkelig analyse af sikkerhed og routing.
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { icon: "🔐", text: "SPF · DKIM · DMARC — autentificeringsresultater" },
          { icon: "🚩", text: "Røde flag — mismatch, spoofing, usædvanlig routing" },
          { icon: "📍", text: "Hop-kæde — hvilke mailservere videresendte mailen" },
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>
                Indsæt email-headers
              </span>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-3)" }}>
                Åbn mailen → Vis kildekode / Show original → kopier alt tekst
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="uv-btn" style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => { setRaw(SAMPLE_HEADER); setParsed(parseEmailHeader(SAMPLE_HEADER)); }}>
                Eksempel
              </button>
              {raw && (
                <button className="uv-btn" style={{ fontSize: 12, padding: "4px 10px", background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                  onClick={() => { setRaw(""); setParsed(null); }}>
                  Ryd
                </button>
              )}
            </div>
          </div>
          <textarea
            className="uv-input"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={"Indsæt email headers her...\n\nDelivered-To: you@example.com\nReceived: from mail.sender.com...\nFrom: sender@domain.com\n..."}
            style={{ minHeight: 180, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
          />
          <button className="uv-btn" onClick={analyze} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
            Analyser
          </button>
        </div>
      </div>

      {parsed && (
        <>
          {/* Score + metadata */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginBottom: 16 }}>
            {/* Score */}
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 120 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Sikkerhedsscore
                </span>
                <div style={{
                  width: 76, height: 76, borderRadius: "50%",
                  border: `4px solid ${scoreColor}`,
                  background: `${scoreColor}12`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", marginTop: 2 }}>/ 100</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: scoreColor,
                  background: `${scoreColor}18`, padding: "2px 10px", borderRadius: 20,
                  border: `1px solid ${scoreColor}40`,
                }}>
                  {scoreLabel}
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="uv-card-1">
              <div className="uv-card-1-inner" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  📋 Besked-metadata
                </p>
                {[
                  ["Fra", parsed.from],
                  ["Til", parsed.to],
                  ["Emne", parsed.subject],
                  ["Dato", parsed.date],
                  ["Message-ID", parsed.messageId],
                  parsed.returnPath ? ["Return-Path", parsed.returnPath] : null,
                  parsed.replyTo ? ["Reply-To", parsed.replyTo] : null,
                  parsed.xMailer ? ["Mailer", parsed.xMailer] : null,
                ].filter((x): x is [string, string] => x !== null).map(([label, val]) => (
                  <div key={label} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                    <span style={{ minWidth: 90, color: "var(--text-3)", fontWeight: 600, flexShrink: 0 }}>{label}</span>
                    <span style={{ color: "var(--text-2)", wordBreak: "break-all" }}>{val || "–"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Red flags */}
          {parsed.flags.length > 0 && (
            <div className="uv-card-1" style={{ marginBottom: 16 }}>
              <div className="uv-card-1-inner">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                    🚩 Røde flag
                  </p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: "rgba(248,113,113,0.15)", color: "#f87171",
                    border: "1px solid rgba(248,113,113,0.3)",
                  }}>
                    {parsed.flags.length} {parsed.flags.length === 1 ? "fund" : "fund"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>
                    {parsed.flags.filter(f => f.severity === "critical").length} kritiske · {parsed.flags.filter(f => f.severity === "warn").length} advarsler
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {parsed.flags.map(f => (
                    <div key={f.id} style={{
                      display: "flex", gap: 12, alignItems: "center",
                      padding: "10px 14px", borderRadius: 10,
                      background: FLAG_BG[f.severity],
                      border: `1px solid ${FLAG_COLOR[f.severity]}40`,
                      borderLeft: `4px solid ${FLAG_COLOR[f.severity]}`,
                    }}>
                      <span style={{ fontSize: 18 }}>{f.icon}</span>
                      <span style={{ fontSize: 13, color: FLAG_COLOR[f.severity], fontWeight: 600, flex: 1 }}>{f.label}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 10,
                        background: `${FLAG_COLOR[f.severity]}20`,
                        color: FLAG_COLOR[f.severity],
                        fontWeight: 700, textTransform: "uppercase", flexShrink: 0,
                      }}>
                        {f.severity === "critical" ? "Kritisk" : f.severity === "warn" ? "Advarsel" : "Info"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Auth results */}
          {parsed.auth.length > 0 && (
            <div className="uv-card-1" style={{ marginBottom: 16 }}>
              <div className="uv-card-1-inner">
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>
                    🔐 Autentificering — SPF · DKIM · DMARC
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                    Tre protokoller der tilsammen verificerer om mailen er ægte og uændret
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {parsed.auth.map((a, i) => (
                    <div key={i} style={{
                      flex: 1, minWidth: 200,
                      padding: "14px 16px", borderRadius: 12,
                      background: `${STATUS_COLOR[a.status]}10`,
                      border: `1px solid ${STATUS_COLOR[a.status]}40`,
                      borderTop: `3px solid ${STATUS_COLOR[a.status]}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{STATUS_ICON[a.status]}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: STATUS_COLOR[a.status] }}>{a.protocol}</span>
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 10,
                              background: `${STATUS_COLOR[a.status]}25`, color: STATUS_COLOR[a.status],
                              fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>
                              {a.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 6px", lineHeight: 1.5 }}>
                        {PROTO_DESC[a.protocol] || ""}
                      </p>
                      <div style={{
                        padding: "6px 10px", borderRadius: 8,
                        background: "rgba(0,0,0,0.15)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0, wordBreak: "break-all", fontFamily: "monospace" }}>{a.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Routing chain */}
          {parsed.hops.length > 0 && (
            <div className="uv-card-1" style={{ marginBottom: 16 }}>
              <div className="uv-card-1-inner">
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                      📍 Routing Kæde
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: parsed.hops.length > 5 ? "rgba(251,191,36,0.15)" : "rgba(96,165,250,0.15)",
                      color: parsed.hops.length > 5 ? "#fbbf24" : "#60a5fa",
                      border: `1px solid ${parsed.hops.length > 5 ? "rgba(251,191,36,0.3)" : "rgba(96,165,250,0.3)"}`,
                    }}>
                      {parsed.hops.length} hop{parsed.hops.length > 5 ? " ⚠️ unormalt mange" : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>
                    Mailens rejse fra afsender til modtager — første hop er oprindelsen
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {parsed.hops.map((hop, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      {i < parsed.hops.length - 1 && (
                        <div style={{
                          position: "absolute", left: 15, top: "100%",
                          width: 2, height: 12, background: "rgba(255,255,255,0.1)",
                        }} />
                      )}
                      <div style={{
                        display: "flex", gap: 12, alignItems: "flex-start",
                        marginBottom: i < parsed.hops.length - 1 ? 12 : 0,
                        padding: "12px 14px", borderRadius: 10,
                        background: i === 0
                          ? "rgba(52,211,153,0.07)"
                          : i === parsed.hops.length - 1
                          ? "rgba(96,165,250,0.07)"
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${i === 0 ? "rgba(52,211,153,0.25)" : i === parsed.hops.length - 1 ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: i === 0 ? "rgba(52,211,153,0.2)" : i === parsed.hops.length - 1 ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.06)",
                          border: `2px solid ${i === 0 ? "#34d399" : i === parsed.hops.length - 1 ? "#60a5fa" : "rgba(255,255,255,0.15)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                          color: i === 0 ? "#34d399" : i === parsed.hops.length - 1 ? "#60a5fa" : "var(--text-3)",
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          {(i === 0 || i === parsed.hops.length - 1) && parsed.hops.length > 1 && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: i === 0 ? "#34d399" : "#60a5fa",
                                background: i === 0 ? "rgba(52,211,153,0.15)" : "rgba(96,165,250,0.15)",
                                padding: "1px 8px", borderRadius: 10,
                              }}>
                                {i === 0 ? "Oprindelse" : "Destination"}
                              </span>
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                            <div>
                              <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fra</span>
                              <p style={{ fontSize: 12, color: "var(--text)", margin: "2px 0 0", fontFamily: "monospace" }}>{hop.from}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Modtaget af</span>
                              <p style={{ fontSize: 12, color: "var(--text-2)", margin: "2px 0 0", fontFamily: "monospace" }}>{hop.by}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Protokol</span>
                              <p style={{ fontSize: 12, color: "var(--text-2)", margin: "2px 0 0" }}>{hop.protocol}</p>
                            </div>
                          </div>
                          {hop.timestamp && (
                            <p style={{ fontSize: 11, color: "var(--text-3)", margin: "5px 0 0" }}>
                              🕒 {hop.timestamp}
                              {hop.delay && (
                                <span style={{ marginLeft: 8, color: "#fbbf24", fontWeight: 700 }}>{hop.delay}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sender IP info */}
          {parsed.senderIp && (
            <div className="uv-card-1">
              <div className="uv-card-1-inner">
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>
                    🌍 Afsender IP
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                    Oprindelses-IP fra første Received-header — kan bruges til geolokation og reputationstjek
                  </p>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{
                    padding: "12px 16px", borderRadius: 10, flex: "0 0 auto",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>IP-adresse</span>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "monospace", margin: "4px 0 0" }}>
                      {parsed.senderIp}
                    </p>
                  </div>
                  {parsed.rdns && (
                    <div style={{
                      padding: "12px 16px", borderRadius: 10, flex: "1 1 180px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                      <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reverse DNS (rDNS)</span>
                      <p style={{ fontSize: 13, color: "var(--text-2)", fontFamily: "monospace", margin: "4px 0 0" }}>
                        {parsed.rdns}
                      </p>
                    </div>
                  )}
                  <div style={{
                    padding: "12px 16px", borderRadius: 10, flex: "0 0 auto",
                    background: isDatacenterIp(parsed.senderIp) ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)",
                    border: `1px solid ${isDatacenterIp(parsed.senderIp) ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.3)"}`,
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: "4px 0 0", color: isDatacenterIp(parsed.senderIp) ? "#fbbf24" : "#34d399" }}>
                      {isDatacenterIp(parsed.senderIp) ? "⚠️ Offentlig / datacenter IP" : "✅ Privat IP"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
