"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AdSlotType = "header" | "in-content" | "sidebar" | "footer";

// Slot config per ad unit. header/footer share the banner unit; in-content/sidebar share the in-article unit.
const SLOT_CONFIG: Record<AdSlotType, {
  slot: string;
  format: string;
  layout?: string;
  fullWidthResponsive?: boolean;
}> = {
  "header":     { slot: "9876543210", format: "auto", fullWidthResponsive: true },
  "footer":     { slot: "9876543210", format: "auto", fullWidthResponsive: true },
  "in-content": { slot: "1234509876", format: "fluid", layout: "in-article" },
  "sidebar":    { slot: "1234509876", format: "fluid", layout: "in-article" },
};

const SLOT_HEIGHT: Record<AdSlotType, number> = {
  "header":     90,
  "in-content": 280,
  "sidebar":    280,
  "footer":     90,
};

const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
const ADSENSE_CLIENT  = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
const IS_DEV          = process.env.NODE_ENV === "development";

interface AdSlotProps {
  slot: AdSlotType;
  className?: string;
}

export function AdSlot({ slot, className }: AdSlotProps) {
  const config = SLOT_CONFIG[slot];
  const height = SLOT_HEIGHT[slot];

  useEffect(() => {
    if (!ADSENSE_ENABLED || !ADSENSE_CLIENT) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet — the script tag in layout.tsx will retry
    }
  }, []);

  if (ADSENSE_ENABLED && ADSENSE_CLIENT) {
    return (
      <div className={cn("w-full flex justify-center my-6", className)}>
        <ins
          className="adsbygoogle"
          style={{
            display: config.layout === "in-article" ? "block" : "block",
            textAlign: config.layout === "in-article" ? "center" : undefined,
            minHeight: height,
            width: "100%",
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={config.slot}
          data-ad-format={config.format}
          {...(config.layout ? { "data-ad-layout": config.layout } : {})}
          {...(config.fullWidthResponsive ? { "data-full-width-responsive": "true" } : {})}
        />
      </div>
    );
  }

  if (!IS_DEV) {
    // Production with ads inactive: empty reserved space, invisible to readers
    return (
      <div
        aria-hidden="true"
        style={{ minHeight: height }}
        className={cn("w-full", className)}
      />
    );
  }

  // Dev: visible placeholder so we know where slots are
  return (
    <div
      data-ad-slot={slot}
      aria-hidden="true"
      className={cn(
        "w-full flex flex-col items-center justify-center",
        "border border-dashed border-border rounded-lg bg-muted/50",
        className
      )}
      style={{ minHeight: height }}
    >
      <p className="text-xs text-muted-foreground/50 font-mono">Ad Space (inactive)</p>
      <p className="text-[10px] text-muted-foreground/30 mt-0.5">{slot} · slot {config.slot}</p>
    </div>
  );
}
