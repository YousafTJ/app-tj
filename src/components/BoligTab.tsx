"use client";

import { useState } from "react";
import {
  ExternalLink,
  Home as HomeIcon,
  MapPin,
  BedDouble,
  Banknote,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import type { Apartment, ApartmentResponse } from "@/app/api/apartments/route";

const VESTEGNEN_BYER = [
  "Glostrup", "Albertslund", "Ishøj", "Taastrup",
  "Brøndby", "Hvidovre", "Rødovre", "Vallensbæk", "Greve",
];

const SOURCE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  lejebolig:   { color: "#1d4ed8", bg: "#eff6ff", label: "Lejebolig.dk" },
  boligportal: { color: "#0f766e", bg: "#f0fdfa", label: "Boligportal.dk" },
};

function ApartmentCard({ apt }: { apt: Apartment }) {
  const style = SOURCE_STYLE[apt.sourceId] ?? { color: "#a8a29e", bg: "rgba(255,255,255,0.1)", label: apt.source };
  return (
    <a href={apt.url} target="_blank" rel="noopener noreferrer" className="uv-card-3">
      <div className="uv-card-3-inner">
        {apt.imageUrl ? (
          <div style={{ height: 140, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={apt.imageUrl} alt={apt.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </div>
        ) : (
          <div style={{ height: 80, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HomeIcon style={{ width: 28, height: 28, color: style.color, opacity: 0.4 }} />
          </div>
        )}
        <div style={{ padding: "14px 16px" }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: style.color, border: `1px solid ${style.color}40`, padding: "2px 8px", borderRadius: 20, marginBottom: 8, textTransform: "uppercase" as const }}>
            {style.label}
          </span>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f4f1ee", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {apt.title}
          </p>
          {apt.address && apt.address !== apt.title && (
            <p style={{ fontSize: 12, color: "#a8a29e", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin style={{ width: 10, height: 10, flexShrink: 0 }} />
              {apt.address}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {apt.rooms != null && (
              <span style={{ fontSize: 11, color: "#a8a29e", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                <BedDouble style={{ width: 10, height: 10 }} />{apt.rooms} vær.
              </span>
            )}
            {apt.size != null && (
              <span style={{ fontSize: 11, color: "#a8a29e", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                <Maximize2 style={{ width: 10, height: 10 }} />{apt.size} m²
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
              {apt.priceFormatted}<span style={{ fontSize: 11, fontWeight: 400, color: "#57534e", marginLeft: 3 }}>/ md.</span>
            </span>
            <ExternalLink style={{ width: 13, height: 13, color: "#57534e" }} />
          </div>
        </div>
      </div>
    </a>
  );
}

export default function BoligTab() {
  const [rooms, setRooms] = useState("2");
  const [maxRent, setMaxRent] = useState("8000");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApartmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string>("all");

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setData(null);
    setActiveSource("all");

    const params = new URLSearchParams({
      maxRent,
      ...(rooms !== "0" ? { minRooms: rooms } : {}),
    });

    try {
      const res = await fetch(`/api/apartments?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApartmentResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const roomsLabel = rooms === "0" ? "alle størrelser" : `${rooms}+ værelser`;

  const filteredResults =
    data?.results.filter(r =>
      activeSource === "all" ? true : r.sourceId === activeSource
    ) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
          Boligsøgning — Vestegnen
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: "0 0 10px" }}>
          Søger i {VESTEGNEN_BYER.join(", ")} og omegn
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {VESTEGNEN_BYER.map(by => (
            <span key={by} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              border: "1px solid var(--border)", color: "var(--text-3)",
            }}>
              {by}
            </span>
          ))}
        </div>
      </div>

      {/* Search form */}
      <div style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "24px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 18,
          marginBottom: 20,
        }}>
          {/* Min. værelser */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <BedDouble style={{ width: 13, height: 13 }} />
              Min. antal værelser
            </label>
            <select
              value={rooms}
              onChange={e => setRooms(e.target.value)}
              className="uv-input"
            >
              <option value="0">Ligegyldigt</option>
              <option value="1">1+ værelse</option>
              <option value="2">2+ værelser</option>
              <option value="3">3+ værelser</option>
              <option value="4">4+ værelser</option>
              <option value="5">5+ værelser</option>
            </select>
          </div>

          {/* Max husleje */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <Banknote style={{ width: 13, height: 13 }} />
              Maks. husleje pr. måned
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={maxRent}
                onChange={e => setMaxRent(e.target.value)}
                min="1000"
                max="100000"
                step="500"
                placeholder="8000"
                className="uv-input"
                style={{ paddingRight: "42px" }}
              />
              <span style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12, color: "var(--text-3)",
                pointerEvents: "none",
              }}>
                kr.
              </span>
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 7 }}>Hurtige presets:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { label: "1-vær. u. 6.000", r: "1", rent: "6000" },
              { label: "2-vær. u. 8.000", r: "2", rent: "8000" },
              { label: "2-vær. u. 10.000", r: "2", rent: "10000" },
              { label: "3-vær. u. 12.000", r: "3", rent: "12000" },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => { setRooms(p.r); setMaxRent(p.rent); }}
                style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 20,
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  color: "var(--text-2)", cursor: "pointer",
                  transition: "all 0.1s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="uv-btn"
        >
          <span className="uv-btn-text"><span>{loading ? "Henter boliger…" : "Søg på Vestegnen"}</span></span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "48px 24px", textAlign: "center",
          border: "1px dashed var(--border)", borderRadius: 16,
          color: "var(--text-3)", gap: 14,
        }}>
          <div className="uv-loader-bounce" />
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", margin: "0 0 4px" }}>
              Henter lejeboliger på Vestegnen…
            </p>
            <p style={{ fontSize: 13 }}>Søger på Lejebolig.dk og Boligportal.dk</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", borderRadius: 12,
          background: "var(--red-light)", border: "1px solid var(--red-light)",
          color: "var(--red)",
        }}>
          <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>Fejl ved hentning</p>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Stats bar */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {data.total === 0
                  ? "Ingen resultater fundet"
                  : `${data.total} bolig${data.total !== 1 ? "er" : ""} fundet på Vestegnen`}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>
                {roomsLabel} · maks. {parseInt(maxRent).toLocaleString("da-DK")} kr./md.
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[{ sourceId: "all", name: "Alle", count: data.total }, ...data.bySource].map(s => {
                const sStyle = SOURCE_STYLE[s.sourceId] ?? { color: "var(--text)", bg: "var(--surface-2)" };
                const isActive = activeSource === s.sourceId;
                return (
                  <button
                    key={s.sourceId}
                    onClick={() => setActiveSource(s.sourceId)}
                    style={{
                      fontSize: 12, padding: "5px 12px", borderRadius: 20,
                      border: isActive ? "none" : "1px solid var(--border)",
                      backgroundColor: isActive ? (s.sourceId === "all" ? "var(--text)" : sStyle.bg) : "transparent",
                      color: isActive ? (s.sourceId === "all" ? "var(--bg)" : sStyle.color) : "var(--text-2)",
                      cursor: "pointer", fontWeight: isActive ? 600 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {s.name} ({s.count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* No results */}
          {filteredResults.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "40px 24px", textAlign: "center",
              border: "1px dashed var(--border)", borderRadius: 16,
              color: "var(--text-3)",
            }}>
              <HomeIcon style={{ width: 32, height: 32, marginBottom: 10, opacity: 0.4 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>
                Ingen boliger matchede dine kriterier
              </p>
              <p style={{ fontSize: 13, maxWidth: 380 }}>
                Prøv at hæve maksprisen eller vælge færre værelser.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
                {data.bySource.map(s => (
                  <a key={s.sourceId} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: 13, fontWeight: 600, padding: "8px 16px",
                      borderRadius: 9, border: "1px solid var(--border)",
                      color: "var(--text)", textDecoration: "none",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    Åbn {s.name} direkte <ExternalLink style={{ width: 12, height: 12 }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          {filteredResults.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}>
              {filteredResults.map((apt, i) => (
                <ApartmentCard key={`${apt.sourceId}-${i}`} apt={apt} />
              ))}
            </div>
          )}

          {/* Footer links */}
          <div style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Søg selv direkte:</span>
            {data.bySource.map(s => {
              const sStyle = SOURCE_STYLE[s.sourceId] ?? { color: "var(--text-2)", bg: "var(--surface-2)" };
              return (
                <a key={s.sourceId} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                    color: sStyle.color, backgroundColor: sStyle.bg,
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {s.name} <ExternalLink style={{ width: 10, height: 10 }} />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Initial empty state */}
      {!data && !loading && !error && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "48px 24px", textAlign: "center",
          border: "1px dashed var(--border)", borderRadius: 16,
          color: "var(--text-3)",
        }}>
          <HomeIcon style={{ width: 36, height: 36, marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>
            Klar til at søge på Vestegnen
          </p>
          <p style={{ fontSize: 13, maxWidth: 380 }}>
            Vælg antal værelser og maksimal husleje — vi henter annoncer fra {VESTEGNEN_BYER.join(", ")} og omegn.
          </p>
        </div>
      )}
    </div>
  );
}
