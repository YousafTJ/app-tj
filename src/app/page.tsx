"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardTab from "@/components/DashboardTab";
import UdgifterTab from "@/components/UdgifterTab";
import SkatTab from "@/components/SkatTab";
import TodoTab from "@/components/TodoTab";
import FlashcardsTab from "@/components/FlashcardsTab";
import JeopardyTab from "@/components/JeopardyTab";
import { Star, Settings, LogOut, CheckSquare } from "lucide-react";
import { FloatingNav, Menu, MenuItem, NavItem, DropdownLink } from "@/components/ui/navbar-menu";

type TabId = "dashboard" | "todos" | "flashkort" | "jeopardy" | "udgifter" | "skat" | "trending" | "favoritter" | "indstillinger";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  function goTo(tab: TabId) {
    setActiveTab(tab);
    setActiveMenu(null);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>

      {/* Floating navbar */}
      <FloatingNav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Logo */}
          <div
            onClick={() => goTo("dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 14px 6px 10px",
              borderRadius: 99,
              background: "rgba(26, 25, 23, 0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(91, 66, 243, 0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: "linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
            }}>
              ◈
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f4f1ee", letterSpacing: "-0.2px" }}>
              TJHUB
            </span>
          </div>

          {/* Main nav */}
          <Menu setActive={setActiveMenu}>
            <NavItem
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => goTo("dashboard")}
            />

            <NavItem
              label="To-do"
              active={activeTab === "todos"}
              onClick={() => goTo("todos")}
            />

            {/* Læring dropdown */}
            <MenuItem
              setActive={setActiveMenu}
              active={activeMenu}
              item="Læring"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("flashkort")} active={activeTab === "flashkort"}>
                  🃏 Flashkort
                </DropdownLink>
                <DropdownLink onClick={() => goTo("jeopardy")} active={activeTab === "jeopardy"}>
                  🎯 Jeopardy
                </DropdownLink>
              </div>
            </MenuItem>

            {/* Mere dropdown */}
            <MenuItem
              setActive={setActiveMenu}
              active={activeMenu}
              item="Mere"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
                <DropdownLink onClick={() => goTo("udgifter")} active={activeTab === "udgifter"}>
                  💸 Udgifter
                </DropdownLink>
                <DropdownLink onClick={() => goTo("skat")} active={activeTab === "skat"}>
                  🧾 Skatteberegner
                </DropdownLink>
                <DropdownLink onClick={() => goTo("trending")} active={activeTab === "trending"}>
                  🔥 Trending
                </DropdownLink>
                <DropdownLink onClick={() => goTo("favoritter")} active={activeTab === "favoritter"}>
                  ⭐ Favoritter
                </DropdownLink>
                <DropdownLink onClick={() => goTo("indstillinger")} active={activeTab === "indstillinger"}>
                  ⚙️ Indstillinger
                </DropdownLink>
              </div>
            </MenuItem>
          </Menu>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px",
              borderRadius: 99,
              background: "rgba(26, 25, 23, 0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(91, 66, 243, 0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              cursor: "pointer",
              fontSize: 13,
              color: "#a8a29e",
            }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            Log ud
          </button>
        </div>
      </FloatingNav>

      {/* Main content — padded below navbar */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 24px 40px" }}>
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "todos" && <TodoTab />}
        {activeTab === "flashkort" && <FlashcardsTab />}
        {activeTab === "jeopardy" && <JeopardyTab />}
        {activeTab === "udgifter" && <UdgifterTab />}
        {activeTab === "skat" && <SkatTab />}
        {activeTab === "trending" && <TrendingPlaceholder />}
        {activeTab === "favoritter" && <FavoritterPlaceholder />}
        {activeTab === "indstillinger" && <IndstillingerPlaceholder />}
      </main>
    </div>
  );
}

function TrendingPlaceholder() {
  const trending = [
    "iPhone 16 Pro", "Samsung Galaxy S25", "PlayStation 5",
    "NVIDIA RTX 5080", "MacBook Pro M4", "AirPods Pro 2",
    "Dyson V15", "Sony WH-1000XM6",
  ];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Trending søgninger</h2>
      <p style={{ color: "var(--text-2)", marginBottom: 24 }}>Populære produkter lige nu</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {trending.map((item, i) => (
          <div key={item} className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#5B42F3", marginBottom: 8 }}>#{i + 1}</div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#f4f1ee" }}>{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoritterPlaceholder() {
  return (
    <div className="uv-card-1">
      <div className="uv-card-1-inner" style={{ padding: 64, textAlign: "center" }}>
        <Star style={{ width: 40, height: 40, color: "#5B42F3", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f4f1ee", marginBottom: 8 }}>Ingen favoritter endnu</h2>
        <p style={{ color: "#a8a29e", maxWidth: 400, margin: "0 auto" }}>
          Gem dine favoritprodukter her for nem adgang.
        </p>
      </div>
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
            <div style={{
              marginLeft: "auto", width: 44, height: 24, borderRadius: 12,
              background: "linear-gradient(144deg, #AF40FF, #5B42F3)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 3, left: 23,
                width: 18, height: 18, backgroundColor: "white",
                borderRadius: "50%", boxShadow: "0 1px 3px rgb(0 0 0 / 0.3)",
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
