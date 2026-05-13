"use client";

import { useState } from "react";

interface Nutriments {
  "energy-kcal_100g"?: number;
  "proteins_100g"?: number;
  "fat_100g"?: number;
  "saturated-fat_100g"?: number;
  "carbohydrates_100g"?: number;
  "sugars_100g"?: number;
  "fiber_100g"?: number;
  "salt_100g"?: number;
  "sodium_100g"?: number;
}

interface FoodProduct {
  code: string;
  product_name: string;
  brands?: string;
  quantity?: string;
  serving_size?: string;
  nutriscore_grade?: string;
  image_small_url?: string;
  nutriments?: Nutriments;
}

const NUTRI_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  a: { bg: "#038141", text: "#fff", label: "A" },
  b: { bg: "#85BB2F", text: "#fff", label: "B" },
  c: { bg: "#FECB02", text: "#333", label: "C" },
  d: { bg: "#EE8100", text: "#fff", label: "D" },
  e: { bg: "#E63E11", text: "#fff", label: "E" },
};

export default function MadTab() {
  const [mode, setMode]       = useState<"søg" | "stregkode">("søg");
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [selected, setSelected] = useState<FoodProduct | null>(null);
  const [error, setError]     = useState("");

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(""); setProducts([]); setSelected(null);
    try {
      const param = mode === "stregkode" ? `barcode=${encodeURIComponent(q)}` : `q=${encodeURIComponent(q)}`;
      const res = await fetch(`/api/food?${param}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      if ((data.products ?? []).length === 0) throw new Error("Ingen produkter fundet");
      setProducts(data.products);
      if (mode === "stregkode") setSelected(data.products[0]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukendt fejl");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Mad & kalorier</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>
          Søg på en madvare og få næringsindhold øjeblikkeligt.
        </p>
      </div>

      {/* Input */}
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "20px 22px" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["søg", "stregkode"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setQuery(""); setProducts([]); setSelected(null); setError(""); }}
                style={{
                  fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 99, cursor: "pointer",
                  background: mode === m ? "linear-gradient(144deg,#AF40FF,#5B42F3)" : "rgba(255,255,255,0.05)",
                  color: mode === m ? "#fff" : "var(--text-3)",
                  border: mode === m ? "none" : "1.5px solid rgba(255,255,255,0.08)",
                  textTransform: "capitalize",
                }}
              >
                {m === "søg" ? "🔍 Søg på navn" : "🔢 Stregkode"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder={mode === "søg" ? "f.eks. havregryn, mælk, cola..." : "Indtast stregkode (EAN)..."}
              className="uv-input"
              style={{ flex: 1, fontSize: 15 }}
              inputMode={mode === "stregkode" ? "numeric" : undefined}
            />
            <button onClick={search} disabled={loading || !query.trim()} className="uv-btn" style={{ flexShrink: 0 }}>
              <span className="uv-btn-text">
                <span>{loading ? "Søger..." : "Slå op"}</span>
              </span>
            </button>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>🍎</p>
          <p style={{ margin: 0 }}>Henter næringsdata...</p>
        </div>
      )}

      {/* Detail panel */}
      {selected && <DetailPanel product={selected} onClose={() => setSelected(null)} />}

      {/* Results list */}
      {!selected && products.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, fontWeight: 600 }}>
            {products.length} resultater
          </p>
          {products.map(p => (
            <ProductCard key={p.code} product={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p, onClick }: { product: FoodProduct; onClick: () => void }) {
  const kcal = p.nutriments?.["energy-kcal_100g"];
  const ns   = p.nutriscore_grade?.toLowerCase();
  const nsInfo = ns ? NUTRI_COLORS[ns] : null;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: "none", border: "none", padding: 0,
      }}
    >
      <div className="uv-card-1" style={{ transition: "transform 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "none")}
      >
        <div className="uv-card-1-inner" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Image */}
            <div style={{
              width: 48, height: 48, borderRadius: 10, flexShrink: 0, overflow: "hidden",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {p.image_small_url
                ? <img src={p.image_small_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 22 }}>🍽️</span>}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 2px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.product_name}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                {[p.brands, p.quantity].filter(Boolean).join(" · ")}
              </p>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {kcal != null && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", margin: 0, lineHeight: 1 }}>
                    {Math.round(kcal)}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-3)", margin: "2px 0 0", fontWeight: 600 }}>kcal/100g</p>
                </div>
              )}
              {nsInfo && (
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: nsInfo.bg, color: nsInfo.text,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900,
                }}>
                  {nsInfo.label}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function DetailPanel({ product: p, onClose }: { product: FoodProduct; onClose: () => void }) {
  const n    = p.nutriments ?? {};
  const kcal = n["energy-kcal_100g"];
  const ns   = p.nutriscore_grade?.toLowerCase();
  const nsInfo = ns ? NUTRI_COLORS[ns] : null;

  const macros = [
    { label: "Kalorier",        value: kcal,                        unit: "kcal", max: 500,  color: "#f59e0b" },
    { label: "Protein",         value: n["proteins_100g"],          unit: "g",    max: 40,   color: "#4ade80" },
    { label: "Fedt",            value: n["fat_100g"],               unit: "g",    max: 50,   color: "#f87171" },
    { label: "– Mættet fedt",   value: n["saturated-fat_100g"],     unit: "g",    max: 25,   color: "#fca5a5" },
    { label: "Kulhydrater",     value: n["carbohydrates_100g"],     unit: "g",    max: 80,   color: "#60a5fa" },
    { label: "– Heraf sukker",  value: n["sugars_100g"],            unit: "g",    max: 40,   color: "#93c5fd" },
    { label: "Kostfibre",       value: n["fiber_100g"],             unit: "g",    max: 15,   color: "#a78bfa" },
    { label: "Salt",            value: n["salt_100g"],              unit: "g",    max: 3,    color: "#fb923c" },
  ].filter(m => m.value != null);

  return (
    <div className="uv-card-1">
      <div className="uv-card-1-inner" style={{ padding: "22px 22px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 22 }}>
          {p.image_small_url && (
            <img src={p.image_small_url} alt="" style={{
              width: 72, height: 72, borderRadius: 12, objectFit: "cover", flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.1)",
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 4px" }}>
              {p.product_name}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              {[p.brands, p.quantity].filter(Boolean).join(" · ")}
            </p>
            {p.serving_size && (
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: "4px 0 0" }}>
                Portion: {p.serving_size}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {nsInfo && (
              <div>
                <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                  {["a","b","c","d","e"].map(g => {
                    const c = NUTRI_COLORS[g];
                    const active = g === ns;
                    return (
                      <div key={g} style={{
                        width: active ? 26 : 20, height: active ? 26 : 20,
                        borderRadius: 6, background: active ? c.bg : "rgba(255,255,255,0.07)",
                        color: active ? c.text : "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: active ? 13 : 10, fontWeight: 900,
                        transition: "all 0.15s",
                      }}>
                        {g.toUpperCase()}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0, textAlign: "center", fontWeight: 600 }}>Nutri-Score</p>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                fontSize: 12, color: "var(--text-3)", background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 99,
                padding: "5px 12px", cursor: "pointer",
              }}
            >
              ← Tilbage
            </button>
          </div>
        </div>

        {/* Per 100g label */}
        <p style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
          Næringsindhold pr. 100g
        </p>

        {/* Macros */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {macros.map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{m.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>
                  {typeof m.value === "number" ? (m.value < 1 ? m.value.toFixed(2) : Math.round(m.value * 10) / 10) : "—"} {m.unit}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99, background: m.color,
                  width: `${Math.min(100, ((m.value as number) / m.max) * 100)}%`,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {macros.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>
            Ingen næringsdata tilgængelig for dette produkt.
          </p>
        )}
      </div>
    </div>
  );
}
