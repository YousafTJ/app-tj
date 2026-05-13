"use client";

import { useState } from "react";

interface GeoResult {
  query: string;
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  asname: string;
  proxy: boolean;
  hosting: boolean;
  mobile: boolean;
  error?: string;
}

const FLAG_URL = (cc: string) => `https://flagcdn.com/32x24/${cc.toLowerCase()}.png`;

function Tag({ label, on, onColor, offColor }: { label: string; on: boolean; onColor: string; offColor: string }) {
  const color  = on ? onColor : offColor;
  const bg     = on ? `${onColor}18` : "rgba(255,255,255,0.04)";
  const border = on ? `${onColor}40` : "rgba(255,255,255,0.08)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
      background: bg, border: `1.5px solid ${border}`, color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}: {on ? "JA" : "Nej"}
    </span>
  );
}

export default function IPGeoTab() {
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<GeoResult | null>(null);
  const [error, setError]     = useState("");

  async function lookup(overrideIp?: string) {
    const ip = (overrideIp ?? input).trim();
    setLoading(true); setError(""); setResult(null);
    try {
      const qs  = ip ? `?ip=${encodeURIComponent(ip)}` : "";
      const res  = await fetch(`/api/ip-geo${qs}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Fejl");
      setResult(data);
      if (!overrideIp && !input) setInput(data.query);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const isRisky = result && (result.proxy || result.hosting);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>IP-geolocation</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Slå en IP-adresse op — land, by, ISP, ASN og VPN/proxy-detektion.
        </p>
      </div>

      {/* Search */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="f.eks. 8.8.8.8 — lad feltet stå tomt for din egen IP"
              className="uv-input"
              style={{ flex: 1, fontSize: 15, fontFamily: "monospace" }}
            />
            <button onClick={() => lookup()} disabled={loading} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text"><span>{loading ? "Slår op..." : "🌍 Slå op"}</span></span>
            </button>
          </div>
          <button
            onClick={() => { setInput(""); lookup(""); }}
            style={{ marginTop: 10, fontSize: 12, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            → Brug min egen IP-adresse
          </button>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🌍</p>
          <p style={{ margin: 0 }}>Geolokaliserer...</p>
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Hero card */}
          <div className="uv-card-1" style={{ overflow: "visible" }}>
            <div className="uv-card-1-inner" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <img
                  src={FLAG_URL(result.countryCode)}
                  alt={result.country}
                  style={{ width: 48, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: "0 0 2px" }}>
                    {result.city}{result.city && result.regionName ? ", " : ""}{result.regionName}
                  </p>
                  <p style={{ fontSize: 15, color: "var(--text-2)", margin: "0 0 10px" }}>{result.country}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <Tag label="VPN/Proxy" on={result.proxy}   onColor="#f87171"  offColor="#4ade80" />
                    <Tag label="Datacenter" on={result.hosting} onColor="#fbbf24"  offColor="#4ade80" />
                    <Tag label="Mobil"      on={result.mobile}  onColor="#60a5fa"  offColor="var(--text-3)" />
                  </div>
                </div>
                <div style={{
                  padding: "8px 14px", borderRadius: 10,
                  background: isRisky ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.08)",
                  border: `1.5px solid ${isRisky ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.2)"}`,
                  textAlign: "center", flexShrink: 0,
                }}>
                  <p style={{ fontSize: 20, margin: "0 0 2px" }}>{isRisky ? "⚠️" : "✅"}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: isRisky ? "#f87171" : "#4ade80", margin: 0 }}>
                    {isRisky ? "Mistænkelig" : "Normal"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoCard title="IP-adresse" value={result.query} mono />
            <InfoCard title="Postnummer" value={result.zip || "Ukendt"} />
            <InfoCard title="Tidszone" value={result.timezone} />
            <InfoCard title="Koordinater" value={`${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`} mono />
          </div>

          {/* Network */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Netværk</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.isp    && <NetRow label="ISP"           value={result.isp} />}
                {result.org    && <NetRow label="Organisation"  value={result.org} />}
                {result.as     && <NetRow label="ASN"           value={result.as}  mono />}
                {result.asname && <NetRow label="AS-navn"       value={result.asname} />}
              </div>
            </div>
          </div>

          {/* Map link */}
          <a
            href={`https://www.openstreetmap.org/?mlat=${result.lat}&mlon=${result.lon}#map=10/${result.lat}/${result.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 13, fontWeight: 600, color: "#60a5fa", textDecoration: "none",
              padding: "10px 16px", borderRadius: 10,
              background: "rgba(96,165,250,0.08)", border: "1.5px solid rgba(96,165,250,0.2)",
              alignSelf: "flex-start",
            }}
          >
            🗺️ Vis på OpenStreetMap →
          </a>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, value, mono }: { title: string; value: string; mono?: boolean }) {
  return (
    <div className="uv-card-1">
      <div className="uv-card-1-inner" style={{ padding: "14px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{title}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: mono ? "monospace" : undefined }}>{value}</p>
      </div>
    </div>
  );
}

function NetRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
      padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
      <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "right",
        fontFamily: mono ? "monospace" : undefined }}>{value}</span>
    </div>
  );
}
