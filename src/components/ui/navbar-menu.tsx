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
          color: active === item ? "#f4f1ee" : "#a8a29e",
          fontSize: 14,
          fontWeight: active === item ? 600 : 400,
          padding: "6px 14px",
          borderRadius: 8,
          transition: "color 0.15s",
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
              background: "rgba(5, 6, 45, 0.97)",
              backdropFilter: "blur(16px)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(91, 66, 243, 0.4)",
              boxShadow: "0 20px 60px rgba(91, 66, 243, 0.2), 0 0 0 1px rgba(175, 64, 255, 0.15)",
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
      color: active ? "#f4f1ee" : "#a8a29e",
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      padding: "6px 14px",
      borderRadius: 8,
      background: active ? "rgba(91, 66, 243, 0.2)" : "transparent",
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
      background: active ? "rgba(91, 66, 243, 0.25)" : "transparent",
      color: active ? "#f4f1ee" : "#a8a29e",
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => {
      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
      (e.currentTarget as HTMLElement).style.color = "#f4f1ee";
    }}
    onMouseLeave={e => {
      if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = active ? "#f4f1ee" : "#a8a29e";
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
