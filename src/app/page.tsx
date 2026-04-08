"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardTab from "@/components/DashboardTab";
import UdgifterTab from "@/components/UdgifterTab";
import SkatTab from "@/components/SkatTab";
import TodoTab from "@/components/TodoTab";
import FlashcardsTab from "@/components/FlashcardsTab";
import JeopardyTab from "@/components/JeopardyTab";
import GamesTab from "@/components/GamesTab";
import ShoppingListTab from "@/components/ShoppingListTab";
import DomainCheckTab from "@/components/DomainCheckTab";
import ToolsTab from "@/components/ToolsTab";
import StocksTab from "@/components/StocksTab";
import FitnessTab from "@/components/FitnessTab";
import KeyboardTab from "@/components/KeyboardTab";
import SalgTab from "@/components/SalgTab";
import DetPerfekteSalgTab from "@/components/DetPerfekteSalgTab";
import KundeforståelseTab from "@/components/KundeforståelseTab";
import { Settings, LogOut, CheckSquare, Menu, X, ChevronRight } from "lucide-react";
import { FloatingNav, MenuItem, NavItem, DropdownLink } from "@/components/ui/navbar-menu";

type TabId =
  | "dashboard" | "todos" | "flashkort" | "jeopardy"
  | "udgifter" | "skat" | "indstillinger" | "spil"
  | "indkob" | "domæne" | "værktøjer"
  | "aktier" | "genveje" | "fitness" | "salg" | "perfekt-salg" | "kundeforståelse";

const TAB_LABELS: Record<TabId, string> = {
  dashboard: "🏠 Dashboard", todos: "✅ To-do", flashkort: "🃏 Flashkort",
  jeopardy: "🎯 Jeopardy", udgifter: "💸 Udgifter", skat: "🧾 Skat",
  indstillinger: "⚙️ Indstillinger", spil: "🎮 Spil", indkob: "🛒 Indkøbsliste",
  domæne: "🔍 Domæne-tjek", værktøjer: "🔧 Værktøjer", aktier: "📈 Aktier",
  genveje: "⌨️ Genveje", fitness: "💪 Fitness", salg: "💼 Salg",
  "perfekt-salg": "🏆 Perfekt Salg", "kundeforståelse": "🧠 Forstå Kunden",
};

const MOBILE_SECTIONS = [
  {
    label: "Primært",
    items: [
      { id: "dashboard" as TabId, label: "🏠 Dashboard" },
      { id: "todos"     as TabId, label: "✅ To-do" },
      { id: "salg"            as TabId, label: "💼 Salg" },
      { id: "perfekt-salg"   as TabId, label: "🏆 Perfekt Salg" },
      { id: "kundeforståelse" as TabId, label: "🧠 Forstå Kunden" },
      { id: "fitness"   as TabId, label: "💪 Fitness" },
      { id: "aktier"    as TabId, label: "📈 Aktier" },
      { id: "indkob"    as TabId, label: "🛒 Indkøb" },
    ],
  },
  {
    label: "Læring",
    items: [
      { id: "flashkort" as TabId, label: "🃏 Flashkort" },
      { id: "jeopardy"  as TabId, label: "🎯 Jeopardy" },
      { id: "spil"      as TabId, label: "🎮 Spil" },
    ],
  },
  {
    label: "Øvrige",
    items: [
      { id: "udgifter"      as TabId, label: "💸 Udgifter" },
      { id: "skat"          as TabId, label: "🧾 Skat" },
      { id: "domæne"        as TabId, label: "🔍 Domæne-tjek" },
      { id: "genveje"       as TabId, label: "⌨️ Genveje" },
      { id: "værktøjer"     as TabId, label: "🔧 Værktøjer" },
      { id: "indstillinger" as TabId, label: "⚙️ Indstillinger" },
    ],
  },
];

export default function Home() {
  const [activeTab, setActiveTab]   = useState<TabId>("dashboard");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  function goTo(tab: TabId) {
    setActiveTab(tab);
    setActiveMenu(null);
    setMenuOpen(false);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>

      {/* ── Desktop floating nav (hidden on mobile via CSS) ────────────────── */}
      <div className="hide-mobile">
        <FloatingNav>
          <nav
            onMouseLeave={() => setActiveMenu(null)}
            style={{
              display: "flex", alignItems: "center", gap: 0,
              padding: "5px 6px", borderRadius: 99,
              background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(20px)",
              border: "1.5px solid rgba(251, 191, 36, 0.45)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(251,191,36,0.25)",
            }}
          >
            {/* Logo */}
            <button
              onClick={() => goTo("dashboard")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "4px 12px 4px 8px", borderRadius: 99,
                background: "none", border: "none", cursor: "pointer", userSelect: "none",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: "linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}>◈</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.2px" }}>
                TJHUB
              </span>
            </button>

            <Sep />

            <NavItem label="Dashboard" active={activeTab === "dashboard"} onClick={() => goTo("dashboard")} />
            <NavItem label="To-do"     active={activeTab === "todos"}     onClick={() => goTo("todos")} />

            <MenuItem setActive={setActiveMenu} active={activeMenu} item="Læring">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("flashkort")} active={activeTab === "flashkort"}>🃏 Flashkort</DropdownLink>
                <DropdownLink onClick={() => goTo("jeopardy")}  active={activeTab === "jeopardy"}>🎯 Jeopardy</DropdownLink>
                <DropdownLink onClick={() => goTo("spil")}      active={activeTab === "spil"}>🎮 Spil</DropdownLink>
              </div>
            </MenuItem>

            <MenuItem setActive={setActiveMenu} active={activeMenu} item="Mere">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("indkob")}        active={activeTab === "indkob"}>🛒 Indkøbsliste</DropdownLink>
                <DropdownLink onClick={() => goTo("udgifter")}      active={activeTab === "udgifter"}>💸 Udgifter</DropdownLink>
                <DropdownLink onClick={() => goTo("skat")}          active={activeTab === "skat"}>🧾 Skatteberegner</DropdownLink>
                <DropdownLink onClick={() => goTo("domæne")}        active={activeTab === "domæne"}>🔍 Domæne-tjek</DropdownLink>
                <DropdownLink onClick={() => goTo("indstillinger")} active={activeTab === "indstillinger"}>⚙️ Indstillinger</DropdownLink>
              </div>
            </MenuItem>

            <NavItem label="📈 Aktier"    active={activeTab === "aktier"}    onClick={() => goTo("aktier")} />
            <NavItem label="⌨️ Genveje"  active={activeTab === "genveje"}   onClick={() => goTo("genveje")} />
            <NavItem label="🔧 Værktøjer" active={activeTab === "værktøjer"} onClick={() => goTo("værktøjer")} />
            <NavItem label="💪 Fitness"   active={activeTab === "fitness"}   onClick={() => goTo("fitness")} />
            <MenuItem setActive={setActiveMenu} active={activeMenu} item="Salg">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("salg")}            active={activeTab === "salg"}>💼 Salg</DropdownLink>
                <DropdownLink onClick={() => goTo("perfekt-salg")}   active={activeTab === "perfekt-salg"}>🏆 Perfekt Salg</DropdownLink>
                <DropdownLink onClick={() => goTo("kundeforståelse")} active={activeTab === "kundeforståelse"}>🧠 Forstå Kunden</DropdownLink>
              </div>
            </MenuItem>

            <Sep />

            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 99,
                background: "none", border: "none",
                cursor: "pointer", fontSize: 13, color: "#78716c",
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              Log ud
            </button>
          </nav>
        </FloatingNav>
      </div>

      {/* ── Mobile top bar (hidden on desktop via CSS) ─────────────────────── */}
      <div
        className="hide-desktop"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px",
          background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(20px)",
          borderBottom: "1.5px solid rgba(251, 191, 36, 0.4)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => goTo("dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer", userSelect: "none",
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
          }}>◈</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.3px" }}>
            TJHUB
          </span>
        </button>

        {/* Active tab label */}
        <span style={{
          fontSize: 12, color: "#78716c", fontWeight: 600,
          background: "#fffbeb", padding: "4px 10px",
          borderRadius: 99, border: "1.5px solid rgba(251,191,36,0.4)",
        }}>
          {TAB_LABELS[activeTab]}
        </span>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            background: "#f5f4f2", border: "1.5px solid #e8e5e1",
            borderRadius: 9, cursor: "pointer", padding: "7px",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#57534e",
          }}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ── Mobile full-screen menu overlay ────────────────────────────────── */}
      {menuOpen && (
        <div
          className="hide-desktop"
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(250, 248, 245, 0.99)", backdropFilter: "blur(24px)",
            display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", flexShrink: 0,
            borderBottom: "1.5px solid rgba(251,191,36,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
              }}>◈</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1c1917" }}>TJHUB</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: "#f5f4f2", border: "1.5px solid #e8e5e1",
                borderRadius: 9, cursor: "pointer", padding: "7px",
                display: "flex", alignItems: "center", color: "#57534e",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Sections */}
          <div style={{ padding: "20px 16px", flex: 1 }}>
            {MOBILE_SECTIONS.map(section => (
              <div key={section.label} style={{ marginBottom: 28 }}>
                <p style={{
                  fontSize: 11, fontWeight: 800, color: "#f59e0b",
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  margin: "0 0 10px 4px",
                }}>
                  {section.label}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => goTo(item.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "13px 14px", borderRadius: 12,
                        background: activeTab === item.id ? "#fffbeb" : "#ffffff",
                        border: `1.5px solid ${activeTab === item.id ? "rgba(251,191,36,0.6)" : "#e8e5e1"}`,
                        color: activeTab === item.id ? "#92400e" : "#57534e",
                        fontSize: 14, fontWeight: activeTab === item.id ? 700 : 400,
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {activeTab === item.id && <ChevronRight size={13} style={{ flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1.5px solid rgba(251,191,36,0.25)",
            flexShrink: 0,
          }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                color: "#78716c", fontSize: 14, fontWeight: 500,
                background: "#f5f4f2", border: "1.5px solid #e8e5e1",
                borderRadius: 10, padding: "10px 16px", cursor: "pointer", width: "100%",
              }}
            >
              <LogOut size={15} />
              Log ud
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main
        className="main-content"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 24px 40px" }}
      >
        {activeTab === "dashboard"     && <DashboardTab />}
        {activeTab === "todos"         && <TodoTab />}
        {activeTab === "flashkort"     && <FlashcardsTab />}
        {activeTab === "jeopardy"      && <JeopardyTab />}
        {activeTab === "spil"          && <GamesTab />}
        {activeTab === "indkob"        && <ShoppingListTab />}
        {activeTab === "domæne"        && <DomainCheckTab />}
        {activeTab === "udgifter"      && <UdgifterTab />}
        {activeTab === "skat"          && <SkatTab />}
        {activeTab === "indstillinger" && <IndstillingerPlaceholder />}
        {activeTab === "aktier"        && <StocksTab />}
        {activeTab === "genveje"       && <KeyboardTab />}
        {activeTab === "værktøjer"     && <ToolsTab />}
        {activeTab === "fitness"       && <FitnessTab />}
        {activeTab === "salg"            && <SalgTab />}
        {activeTab === "perfekt-salg"   && <DetPerfekteSalgTab />}
        {activeTab === "kundeforståelse" && <KundeforståelseTab />}
      </main>
    </div>
  );
}

function IndstillingerPlaceholder() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Settings style={{ width: 20, height: 20, color: "#5B42F3" }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>Indstillinger</h2>
      </div>
      <p style={{ color: "var(--text-2)", marginBottom: 24 }}>Tilpas din oplevelse</p>
      <div className="uv-card-1">
        <div className="uv-card-1-inner" style={{ padding: "24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0" }}>
            <CheckSquare style={{ width: 18, height: 18, color: "#5B42F3" }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#f4f1ee", margin: 0 }}>CosmosDB forbindelse</p>
              <p style={{ fontSize: 13, color: "#57534e", margin: "2px 0 0" }}>Aktiveret — localhost:8081 (emulator)</p>
            </div>
            <div style={{ marginLeft: "auto", width: 44, height: 24, borderRadius: 12, background: "linear-gradient(144deg, #AF40FF, #5B42F3)", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: 23, width: 18, height: 18, backgroundColor: "white", borderRadius: "50%", boxShadow: "0 1px 3px rgb(0 0 0 / 0.3)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: "rgba(0,0,0,0.12)", flexShrink: 0, margin: "0 4px" }} />;
}
