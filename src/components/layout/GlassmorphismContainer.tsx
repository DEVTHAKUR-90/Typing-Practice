"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface GlassmorphismContainerProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  shimmer?: boolean;
  as?: "div" | "section" | "article";
}

export default function GlassmorphismContainer({
  children,
  className,
  hover = false,
  shimmer = false,
  as = "div",
}: GlassmorphismContainerProps) {
  const Tag = as;
  return (
    <Tag
      className={clsx(
        "glass-panel relative overflow-hidden rounded-2xl shadow-glass",
        hover && "glass-panel-hover",
        className
      )}
    >
      {shimmer && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
          <div className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
        </div>
      )}
      <div className="relative h-full">{children}</div>
    </Tag>
  );
}
