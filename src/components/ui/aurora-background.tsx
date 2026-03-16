"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn("relative min-h-screen bg-zinc-900 text-slate-50", className)}
      {...props}
    >
      {/* Aurora layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            `[--black:oklch(0_0_0)]
             [--transparent:transparent]
             [--blue-500:oklch(0.623_0.214_259.815)]
             [--indigo-300:oklch(0.785_0.15_264.376)]
             [--blue-300:oklch(0.809_0.105_251.813)]
             [--violet-200:oklch(0.894_0.057_293.283)]
             [--blue-400:oklch(0.707_0.165_254.624)]
             [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
             [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
             [background-image:var(--dark-gradient),var(--aurora)]
             [background-size:300%,_200%]
             [background-position:50%_50%,50%_50%]
             filter blur-[10px]
             after:content-[""] after:absolute after:inset-0
             after:[background-image:var(--dark-gradient),var(--aurora)]
             after:[background-size:200%,_100%]
             after:animate-aurora
             after:[background-attachment:fixed]
             after:mix-blend-difference
             absolute -inset-[10px] opacity-60 will-change-transform animate-aurora`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_80%_0%,black_15%,transparent_70%)]`
          )}
        />
      </div>
      {children}
    </div>
  );
};
