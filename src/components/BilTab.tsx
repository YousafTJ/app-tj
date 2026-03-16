"use client";

import { useState } from "react";
import {
  ExternalLink,
  MapPin,
  Gauge,
  Banknote,
  Calendar,
  Car,
  AlertCircle,
} from "lucide-react";
import type { Car as CarType, CarResponse } from "@/app/api/cars/route";

const MAKES = [
  { value: "", label: "Alle mærker" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "toyota", label: "Toyota" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes-benz", label: "Mercedes-Benz" },
  { value: "ford", label: "Ford" },
  { value: "audi", label: "Audi" },
  { value: "skoda", label: "Skoda" },
  { value: "peugeot", label: "Peugeot" },
  { value: "hyundai", label: "Hyundai" },
  { value: "kia", label: "Kia" },
  { value: "renault", label: "Renault" },
  { value: "volvo", label: "Volvo" },
  { value: "opel", label: "Opel" },
  { value: "nissan", label: "Nissan" },
  { value: "honda", label: "Honda" },
  { value: "seat", label: "SEAT" },
  { value: "citroen", label: "Citroën" },
  { value: "mazda", label: "Mazda" },
  { value: "fiat", label: "Fiat" },
  { value: "suzuki", label: "Suzuki" },
  { value: "tesla", label: "Tesla" },
  { value: "mitsubishi", label: "Mitsubishi" },
  { value: "subaru", label: "Subaru" },
  { value: "lexus", label: "Lexus" },
  { value: "jeep", label: "Jeep" },
  { value: "mini", label: "MINI" },
  { value: "porsche", label: "Porsche" },
  { value: "land-rover", label: "Land Rover" },
];

const SOURCE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  bilbasen: { color: "#0057b8", bg: "#eff6ff", label: "BilBasen.dk" },
  dba:      { color: "#b45309", bg: "#fffbeb", label: "DBA.dk" },
  bilhandel:{ color: "#065f46", bg: "#ecfdf5", label: "Bilhandel.dk" },
};

function CarCard({ car }: { car: CarType }) {
  const style = SOURCE_STYLE[car.sourceId] ?? { color: "#a8a29e", bg: "rgba(255,255,255,0.1)", label: car.source };

  return (
    <a href={car.url} target="_blank" rel="noopener noreferrer" className="uv-card-3">
      <div className="uv-card-3-inner">
        {/* Image */}
        {car.imageUrl ? (
          <div style={{ height: 140, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={car.imageUrl}
              alt={car.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        ) : (
          <div style={{ height: 80, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car style={{ width: 28, height: 28, color: style.color, opacity: 0.4 }} />
          </div>
        )}

        <div style={{ padding: "14px 16px" }}>
          {/* Source badge */}
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: style.color, border: `1px solid ${style.color}40`, padding: "2px 8px", borderRadius: 20, marginBottom: 8, textTransform: "uppercase" as const }}>
            {style.label}
          </span>

          {/* Title */}
          <p style={{
            fontSize: 13, fontWeight: 600, color: "#f4f1ee",
            margin: "0 0 8px", lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}>
            {car.title}
          </p>

          {/* Specs row */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {car.year != null && (
              <span style={{ fontSize: 11, color: "#a8a29e", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                <Calendar style={{ width: 10, height: 10 }} />
                {car.year}
              </span>
            )}
            {car.km != null && (
              <span style={{ fontSize: 11, color: "#a8a29e", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                <Gauge style={{ width: 10, height: 10 }} />
                {car.km.toLocaleString("da-DK")} km
              </span>
            )}
            {car.location && (
              <span style={{ fontSize: 11, color: "#a8a29e", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin style={{ width: 10, height: 10 }} />
                {car.location}
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
              {car.priceFormatted}
            </span>
            <ExternalLink style={{ width: 13, height: 13, color: "#57534e" }} />
          </div>
        </div>
      </div>
    </a>
  );
}

export default function BilTab() {
  const [make, setMake] = useState("");
  const [maxPrice, setMaxPrice] = useState("300000");
  const [minYear, setMinYear] = useState("2015");
  const [maxKm, setMaxKm] = useState("");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string>("all");

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setData(null);
    setActiveSource("all");

    const params = new URLSearchParams({ maxPrice, minYear });
    if (make) params.set("make", make);
    if (maxKm) params.set("maxKm", maxKm);

    try {
      const res = await fetch(`/api/cars?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CarResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  const makeLabel = MAKES.find(m => m.value === make)?.label ?? "Alle mærker";

  const filteredResults =
    data?.results.filter(r =>
      activeSource === "all" ? true : r.sourceId === activeSource
    ) ?? [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1994 }, (_, i) => currentYear - i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
          Bilsøgning
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Søg efter brugte biler og se rigtige annoncer direkte i appen
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
          {/* Mærke */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <Car style={{ width: 13, height: 13 }} />
              Bilmærke
            </label>
            <select
              value={make}
              onChange={e => setMake(e.target.value)}
              className="uv-input"
            >
              {MAKES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Maks. pris */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <Banknote style={{ width: 13, height: 13 }} />
              Maks. pris
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                min="10000"
                max="5000000"
                step="10000"
                placeholder="300000"
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

          {/* Min. årgang */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <Calendar style={{ width: 13, height: 13 }} />
              Min. årgang
            </label>
            <select
              value={minYear}
              onChange={e => setMinYear(e.target.value)}
              className="uv-input"
            >
              {years.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          {/* Maks. km */}
          <div>
            <label style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7,
            }}>
              <Gauge style={{ width: 13, height: 13 }} />
              Maks. kilometerstand
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={maxKm}
                onChange={e => setMaxKm(e.target.value)}
                min="0"
                max="500000"
                step="10000"
                placeholder="Ingen grænse"
                className="uv-input"
                style={{ paddingRight: "42px" }}
              />
              <span style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12, color: "var(--text-3)",
                pointerEvents: "none",
              }}>
                km
              </span>
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 7 }}>Hurtige presets:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { label: "VW u. 150k, 2018+", make: "volkswagen", price: "150000", year: "2018", km: "" },
              { label: "Toyota u. 200k", make: "toyota", price: "200000", year: "2016", km: "" },
              { label: "BMW u. 250k, lav km", make: "bmw", price: "250000", year: "2017", km: "100000" },
              { label: "Elbil Tesla u. 400k", make: "tesla", price: "400000", year: "2019", km: "" },
              { label: "Billig familiebil u. 100k", make: "", price: "100000", year: "2013", km: "200000" },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => { setMake(p.make); setMaxPrice(p.price); setMinYear(p.year); setMaxKm(p.km); }}
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
          <span className="uv-btn-text"><span>{loading ? "Henter biler…" : "Søg efter biler"}</span></span>
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
              Henter bilsannoncer…
            </p>
            <p style={{ fontSize: 13 }}>Søger på BilBasen.dk og DBA.dk</p>
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
                  : `${data.total} bil${data.total !== 1 ? "er" : ""} fundet`}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>
                {makeLabel} · fra {minYear} · maks.{" "}
                {parseInt(maxPrice).toLocaleString("da-DK")} kr.
                {maxKm ? ` · maks. ${parseInt(maxKm).toLocaleString("da-DK")} km` : ""}
              </p>
            </div>

            {/* Source filter pills */}
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
              <Car style={{ width: 32, height: 32, marginBottom: 10, opacity: 0.4 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>
                Ingen biler matchede dine kriterier
              </p>
              <p style={{ fontSize: 13, maxWidth: 380 }}>
                Prøv at hæve maksprisen, vælge en ældre årgang, eller søg på alle mærker.
              </p>
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

          {/* Car grid */}
          {filteredResults.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}>
              {filteredResults.map((car, i) => (
                <CarCard key={`${car.sourceId}-${i}`} car={car} />
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
          <Car style={{ width: 36, height: 36, marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>
            Klar til at søge
          </p>
          <p style={{ fontSize: 13, maxWidth: 380 }}>
            Vælg mærke, pris og årgang — vi henter rigtige annoncer fra BilBasen.dk og DBA.dk.
          </p>
        </div>
      )}
    </div>
  );
}
