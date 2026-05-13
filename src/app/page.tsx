"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardTab from "@/components/DashboardTab";
import UdgifterTab from "@/components/UdgifterTab";
import SkatTab from "@/components/SkatTab";
import FlashcardsTab from "@/components/FlashcardsTab";
import JeopardyTab from "@/components/JeopardyTab";
import GamesTab from "@/components/GamesTab";
import DomainCheckTab from "@/components/DomainCheckTab";
import ToolsTab from "@/components/ToolsTab";
import StocksTab from "@/components/StocksTab";
import FitnessTab from "@/components/FitnessTab";
import KeyboardTab from "@/components/KeyboardTab";
import SalgTab from "@/components/SalgTab";
import DetPerfekteSalgTab from "@/components/DetPerfekteSalgTab";
import KundeforståelseTab from "@/components/KundeforståelseTab";
import SalgsSpilTab from "@/components/SalgsSpilTab";
import BeslutningTab from "@/components/BeslutningTab";
import CVRTab from "@/components/CVRTab";
import KalorierForbrændtTab from "@/components/KalorierForbrændtTab";
import SSLTab from "@/components/SSLTab";
import WHOISTab from "@/components/WHOISTab";
import EmailValidateTab from "@/components/EmailValidateTab";
import IPGeoTab from "@/components/IPGeoTab";
import TechStackTab from "@/components/TechStackTab";
import JSONFormatterTab from "@/components/JSONFormatterTab";
import APITesterTab from "@/components/APITesterTab";
import { Settings, LogOut, CheckSquare, Menu, X, ChevronRight } from "lucide-react";
import { FloatingNav, MenuItem, NavItem, DropdownLink } from "@/components/ui/navbar-menu";

type TabId =
  | "dashboard" | "flashkort" | "jeopardy"
  | "udgifter" | "skat" | "indstillinger" | "spil"
  | "domæne" | "ssl" | "whois" | "emailval" | "ipgeo" | "techstack" | "jsonformat" | "apitester" | "værktøjer"
  | "aktier" | "genveje" | "fitness" | "salg" | "perfekt-salg" | "kundeforståelse" | "salgs-spil"
  | "beslutning" | "cvr" | "kalorier";

const TAB_LABELS: Record<TabId, string> = {
  dashboard: "🏠 Dashboard", flashkort: "🃏 Flashkort",
  jeopardy: "🎯 Jeopardy", udgifter: "💸 Udgifter", skat: "🧾 Skat",
  indstillinger: "⚙️ Indstillinger", spil: "🎮 Spil",
  domæne: "🔍 Domæne-tjek", ssl: "🔒 SSL-tjekker", whois: "🌐 WHOIS-opslag", emailval: "✉️ Email-validering",
  ipgeo: "🌍 IP-geolocation", techstack: "🔭 Tech-stack detektor", jsonformat: "{ } JSON formatter", apitester: "⚡ API tester",
  værktøjer: "🔧 Værktøjer", aktier: "📈 Aktier",
  genveje: "⌨️ Genveje", fitness: "💪 Fitness", salg: "💼 Salg",
  "perfekt-salg": "🏆 Perfekt Salg", "kundeforståelse": "🧠 Forstå Kunden", "salgs-spil": "🎮 Salgs-spillet",
  beslutning: "🪙 Beslutning",
  cvr: "🏢 CVR-opslag", kalorier: "🔥 Kalorier-forbrændt",
};

const MOBILE_SECTIONS = [
  {
    label: "Primært",
    items: [
      { id: "dashboard" as TabId, label: "🏠 Dashboard" },
      { id: "salg"            as TabId, label: "💼 Salg" },
      { id: "perfekt-salg"   as TabId, label: "🏆 Perfekt Salg" },
      { id: "kundeforståelse" as TabId, label: "🧠 Forstå Kunden" },
      { id: "salgs-spil"     as TabId, label: "🎮 Salgs-spillet" },
      { id: "fitness"   as TabId, label: "💪 Fitness" },
      { id: "aktier"    as TabId, label: "📈 Aktier" },
    ],
  },
  {
    label: "Datamatiker",
    items: [
      { id: "flashkort" as TabId, label: "🃏 Flashkort" },
      { id: "jeopardy"  as TabId, label: "🎯 Jeopardy" },
    ],
  },
  {
    label: "IT-redskaber",
    items: [
      { id: "domæne"     as TabId, label: "🔍 Domæne-tjek" },
      { id: "ssl"        as TabId, label: "🔒 SSL-tjekker" },
      { id: "whois"      as TabId, label: "🌐 WHOIS-opslag" },
      { id: "emailval"   as TabId, label: "✉️ Email-validering" },
      { id: "ipgeo"      as TabId, label: "🌍 IP-geolocation" },
      { id: "techstack"  as TabId, label: "🔭 Tech-stack" },
      { id: "jsonformat" as TabId, label: "{ } JSON formatter" },
      { id: "apitester"  as TabId, label: "⚡ API tester" },
    ],
  },
  {
    label: "Øvrige",
    items: [
      { id: "udgifter"      as TabId, label: "💸 Udgifter" },
      { id: "skat"          as TabId, label: "🧾 Skat" },
      { id: "genveje"       as TabId, label: "⌨️ Genveje" },
      { id: "værktøjer"     as TabId, label: "🔧 Værktøjer" },
      { id: "indstillinger" as TabId, label: "⚙️ Indstillinger" },
    ],
  },
  {
    label: "Karriere",
    items: [
      { id: "cvr" as TabId, label: "🏢 CVR-opslag" },
    ],
  },
  {
    label: "Livsstil",
    items: [
      { id: "kalorier"   as TabId, label: "🔥 Kalorier-forbrændt" },
      { id: "beslutning" as TabId, label: "🪙 Beslutning" },
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

            <MenuItem setActive={setActiveMenu} active={activeMenu} item="Datamatiker">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("flashkort")} active={activeTab === "flashkort"}>🃏 Flashkort</DropdownLink>
                <DropdownLink onClick={() => goTo("jeopardy")}  active={activeTab === "jeopardy"}>🎯 Jeopardy</DropdownLink>
              </div>
            </MenuItem>

            <NavItem label="🎮 Spil" active={activeTab === "spil"} onClick={() => goTo("spil")} />

            <NavItem label="💸 Udgifter" active={activeTab === "udgifter"} onClick={() => goTo("udgifter")} />

            <MenuItem setActive={setActiveMenu} active={activeMenu} item="IT-redskaber">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 180 }}>
                <DropdownLink onClick={() => goTo("domæne")}    active={activeTab === "domæne"}>🔍 Domæne-tjek</DropdownLink>
                <DropdownLink onClick={() => goTo("ssl")}      active={activeTab === "ssl"}>🔒 SSL-tjekker</DropdownLink>
                <DropdownLink onClick={() => goTo("whois")}    active={activeTab === "whois"}>🌐 WHOIS-opslag</DropdownLink>
                <DropdownLink onClick={() => goTo("emailval")} active={activeTab === "emailval"}>✉️ Email-validering</DropdownLink>
                <DropdownLink onClick={() => goTo("ipgeo")}    active={activeTab === "ipgeo"}>🌍 IP-geolocation</DropdownLink>
                <DropdownLink onClick={() => goTo("techstack")} active={activeTab === "techstack"}>🔭 Tech-stack</DropdownLink>
                <DropdownLink onClick={() => goTo("jsonformat")} active={activeTab === "jsonformat"}>{"{ }"} JSON formatter</DropdownLink>
                <DropdownLink onClick={() => goTo("apitester")} active={activeTab === "apitester"}>⚡ API tester</DropdownLink>
              </div>
            </MenuItem>

            <NavItem label="📈 Aktier"    active={activeTab === "aktier"}    onClick={() => goTo("aktier")} />
            <NavItem label="⌨️ Genveje"  active={activeTab === "genveje"}   onClick={() => goTo("genveje")} />
            <NavItem label="🔧 Værktøjer" active={activeTab === "værktøjer"} onClick={() => goTo("værktøjer")} />
            <NavItem label="💪 Fitness"   active={activeTab === "fitness"}   onClick={() => goTo("fitness")} />
            <NavItem label="🏢 CVR-opslag" active={activeTab === "cvr"} onClick={() => goTo("cvr")} />
            <MenuItem setActive={setActiveMenu} active={activeMenu} item="Livsstil">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("kalorier")}   active={activeTab === "kalorier"}>🔥 Kalorier-forbrændt</DropdownLink>
                <DropdownLink onClick={() => goTo("beslutning")} active={activeTab === "beslutning"}>🪙 Beslutning</DropdownLink>
              </div>
            </MenuItem>
            <MenuItem setActive={setActiveMenu} active={activeMenu} item="Salg">
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("salg")}            active={activeTab === "salg"}>💼 Salg</DropdownLink>
                <DropdownLink onClick={() => goTo("perfekt-salg")}   active={activeTab === "perfekt-salg"}>🏆 Perfekt Salg</DropdownLink>
                <DropdownLink onClick={() => goTo("kundeforståelse")} active={activeTab === "kundeforståelse"}>🧠 Forstå Kunden</DropdownLink>
                <DropdownLink onClick={() => goTo("salgs-spil")}     active={activeTab === "salgs-spil"}>🎮 Salgs-spillet</DropdownLink>
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
        {activeTab === "flashkort"     && <FlashcardsTab />}
        {activeTab === "jeopardy"      && <JeopardyTab />}
        {activeTab === "spil"          && <GamesTab />}
        {activeTab === "domæne"        && <DomainCheckTab />}
        {activeTab === "ssl"           && <SSLTab />}
        {activeTab === "whois"         && <WHOISTab />}
        {activeTab === "emailval"      && <EmailValidateTab />}
        {activeTab === "ipgeo"         && <IPGeoTab />}
        {activeTab === "techstack"     && <TechStackTab />}
        {activeTab === "jsonformat"    && <JSONFormatterTab />}
        {activeTab === "apitester"     && <APITesterTab />}
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
        {activeTab === "salgs-spil"      && <SalgsSpilTab />}
        {activeTab === "beslutning"      && <BeslutningTab />}
        {activeTab === "cvr"             && <CVRTab />}
        {activeTab === "kalorier"        && <KalorierForbrændtTab />}
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
