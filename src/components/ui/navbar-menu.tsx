"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  onClick,
  children,
}: {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div
      onMouseEnter={() => setActive(item)}
      className="relative"
      style={{ position: "relative" }}
    >
      <motion.p
        transition={{ duration: 0.3 }}
        onClick={onClick}
        style={{
          cursor: "pointer",
          color: active === item ? "#92400e" : "#57534e",
          fontSize: 14,
          fontWeight: active === item ? 600 : 400,
          padding: "6px 14px",
          borderRadius: 8,
          background: active === item ? "#fffbeb" : "transparent",
          transition: "all 0.15s",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {item}
        {children && (
          <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>▾</span>
        )}
      </motion.p>

      {active !== null && active === item && children && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
          style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: 14, zIndex: 100 }}
        >
          <motion.div
            transition={transition}
            layoutId="active"
            style={{
              background: "#ffffff",
              backdropFilter: "blur(16px)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1.5px solid rgba(251, 191, 36, 0.45)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(251,191,36,0.12)",
            }}
          >
            <motion.div layout style={{ width: "max-content", padding: 8 }}>
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        padding: "8px 16px",
        borderRadius: 99,
        background: "rgba(26, 25, 23, 0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(91, 66, 243, 0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </nav>
  );
};

export const NavItem = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      cursor: "pointer",
      color: active ? "#92400e" : "#57534e",
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      padding: "6px 14px",
      borderRadius: 8,
      background: active ? "#fffbeb" : "transparent",
      border: "none",
      transition: "all 0.15s",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

export const DropdownLink = ({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      background: active ? "#fffbeb" : "transparent",
      color: active ? "#92400e" : "#57534e",
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => {
      if (!active) (e.currentTarget as HTMLElement).style.background = "#fafaf9";
      (e.currentTarget as HTMLElement).style.color = "#1c1917";
    }}
    onMouseLeave={e => {
      if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = active ? "#92400e" : "#57534e";
    }}
  >
    {children}
  </button>
);

export const FloatingNav = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn("fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none", className)}
  >
    <div style={{ pointerEvents: "all" }}>
      {children}
    </div>
  </div>
);
