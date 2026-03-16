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

const ZIPCODES = [
  { zip: "1000", label: "1000 — København K" },
  { zip: "1100", label: "1100 — København K" },
  { zip: "1400", label: "1400 — København K" },
  { zip: "1500", label: "1500 — København V" },
  { zip: "1600", label: "1600 — København V" },
  { zip: "1700", label: "1700 — København V" },
  { zip: "1800", label: "1800 — Frederiksberg" },
  { zip: "1900", label: "1900 — Frederiksberg" },
  { zip: "2000", label: "2000 — Frederiksberg" },
  { zip: "2100", label: "2100 — København Ø" },
  { zip: "2150", label: "2150 — Nordhavn" },
  { zip: "2200", label: "2200 — København N" },
  { zip: "2300", label: "2300 — København S" },
  { zip: "2400", label: "2400 — København NV" },
  { zip: "2450", label: "2450 — København SV" },
  { zip: "2500", label: "2500 — Valby" },
  { zip: "2600", label: "2600 — Glostrup" },
  { zip: "2700", label: "2700 — Brønshøj" },
  { zip: "2720", label: "2720 — Vanløse" },
  { zip: "2800", label: "2800 — Lyngby" },
  { zip: "2900", label: "2900 — Hellerup" },
  { zip: "3000", label: "3000 — Helsingør" },
  { zip: "3400", label: "3400 — Hillerød" },
  { zip: "4000", label: "4000 — Roskilde" },
  { zip: "4200", label: "4200 — Slagelse" },
  { zip: "4700", label: "4700 — Næstved" },
  { zip: "5000", label: "5000 — Odense C" },
  { zip: "5200", label: "5200 — Odense V" },
  { zip: "6000", label: "6000 — Kolding" },
  { zip: "6400", label: "6400 — Sønderborg" },
  { zip: "6700", label: "6700 — Esbjerg" },
  { zip: "7000", label: "7000 — Fredericia" },
  { zip: "7100", label: "7100 — Vejle" },
  { zip: "7400", label: "7400 — Herning" },
  { zip: "7500", label: "7500 — Holstebro" },
  { zip: "8000", label: "8000 — Aarhus C" },
  { zip: "8200", label: "8200 — Aarhus N" },
  { zip: "8210", label: "8210 — Aarhus V" },
  { zip: "8260", label: "8260 — Viby J" },
  { zip: "8700", label: "8700 — Horsens" },
  { zip: "8800", label: "8800 — Viborg" },
  { zip: "8900", label: "8900 — Randers" },
  { zip: "9000", label: "9000 — Aalborg" },
  { zip: "9200", label: "9200 — Aalborg SV" },
  { zip: "9400", label: "9400 — Nørresundby" },
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
        {/* Image */}
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
          {/* Source badge */}
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: style.color, border: `1px solid ${style.color}40`, padding: "2px 8px", borderRadius: 20, marginBottom: 8, textTransform: "uppercase" as const }}>
            {style.label}
          </span>
          {/* Title */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f4f1ee", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {apt.title}
          </p>
          {apt.address && apt.address !== apt.title && (
            <p style={{ fontSize: 12, color: "#a8a29e", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin style={{ width: 10, height: 10, flexShrink: 0 }} />
              {apt.address}
            </p>
          )}
          {/* Specs */}
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
          {/* Price */}
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
  const [zipCode, setZipCode] = useState("2200");
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
      zipCode,
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

  const zipLabel = ZIPCODES.find(z => z.zip === zipCode)?.label ?? zipCode;
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
          Boligsøgning
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Søg efter lejeboliger og se rigtige annoncer direkte i appen
        </p>
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
          {/* Postnummer */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <MapPin style={{ width: 13, height: 13 }} />
              Postnummer
            </label>
            <select
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              className="uv-input"
            >
              {ZIPCODES.map(z => (
                <option key={z.zip} value={z.zip}>{z.label}</option>
              ))}
            </select>
          </div>

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
              { label: "1-vær. u. 6.000", zip: "2200", r: "1", rent: "6000" },
              { label: "2-vær. u. 9.000", zip: "2200", r: "2", rent: "9000" },
              { label: "3-vær. u. 12.000", zip: "2200", r: "3", rent: "12000" },
              { label: "Aarhus 2-vær.", zip: "8000", r: "2", rent: "9000" },
              { label: "Odense billig", zip: "5000", r: "2", rent: "7000" },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => { setZipCode(p.zip); setRooms(p.r); setMaxRent(p.rent); }}
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
          <span className="uv-btn-text"><span>{loading ? "Henter boliger…" : "Søg efter boliger"}</span></span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "48px 24px", textAlign: "center",
          border: "1px dashed var(--border)", borderRadius: 16,
          color: "var(--text-3)",
          gap: 14,
        }}>
          <div className="uv-loader-bounce" />
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", margin: "0 0 4px" }}>
              Henter lejeboliger…
            </p>
            <p style={{ fontSize: 13 }}>
              Søger på Lejebolig.dk og Boligportal.dk
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
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
                  : `${data.total} bolig${data.total !== 1 ? "er" : ""} fundet`}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>
                {zipLabel} · {roomsLabel} · maks.{" "}
                {parseInt(maxRent).toLocaleString("da-DK")} kr./md.
              </p>
            </div>

            {/* Source counts */}
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
                Prøv at hæve maksprisen, vælge færre værelser, eller søg i et andet postnummer.
              </p>
              {/* Fallback links */}
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
                {data.bySource.map(s => (
                  <a
                    key={s.sourceId}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13, fontWeight: 600, padding: "8px 16px",
                      borderRadius: 9, border: "1px solid var(--border)",
                      color: "var(--text)", textDecoration: "none",
                      display: "flex", alignItems: "center", gap: 5,
                      transition: "box-shadow 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgb(0 0 0 / 0.3)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    Åbn {s.name} direkte
                    <ExternalLink style={{ width: 12, height: 12 }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Listing grid */}
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

          {/* Direct links footer */}
          <div style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
              Søg selv direkte:
            </span>
            {data.bySource.map(s => {
              const sStyle = SOURCE_STYLE[s.sourceId] ?? { color: "var(--text-2)", bg: "var(--surface-2)" };
              return (
                <a
                  key={s.sourceId}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "4px 12px",
                    borderRadius: 20,
                    color: sStyle.color, backgroundColor: sStyle.bg,
                    textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {s.name}
                  <ExternalLink style={{ width: 10, height: 10 }} />
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
            Klar til at søge
          </p>
          <p style={{ fontSize: 13, maxWidth: 380 }}>
            Vælg postnummer, antal værelser og maksimal husleje — vi henter rigtige annoncer fra Lejebolig.dk og Boligportal.dk.
          </p>
        </div>
      )}
    </div>
  );
}
