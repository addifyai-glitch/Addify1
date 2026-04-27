import { cn } from "@/lib/utils";

type AdSlotType = "header" | "in-content" | "sidebar" | "footer";

const SLOT_SIZES: Record<AdSlotType, { desktop: string; mobile: string }> = {
  header:     { desktop: "728px × 90px",  mobile: "320px × 50px" },
  "in-content": { desktop: "336px × 280px", mobile: "336px × 280px" },
  sidebar:    { desktop: "300px × 600px", mobile: "300px × 250px" },
  footer:     { desktop: "728px × 90px",  mobile: "320px × 50px" },
};

const SLOT_CLASSES: Record<AdSlotType, string> = {
  header:       "h-[90px] md:h-[90px]",
  "in-content": "h-[280px]",
  sidebar:      "h-[600px]",
  footer:       "h-[50px] md:h-[90px]",
};

const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" &&
  !!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

const IS_DEV = process.env.NODE_ENV === "development";

interface AdSlotProps {
  slot: AdSlotType;
  slotId?: string;
  className?: string;
}

export function AdSlot({ slot, slotId, className }: AdSlotProps) {
  if (ADSENSE_ENABLED) {
    // ── Real AdSense code (activate by setting env vars) ───────────────────
    // Uncomment and configure when AdSense account is approved:
    //
    // return (
    //   <div className={cn("w-full flex justify-center", className)}>
    //     <ins
    //       className="adsbygoogle"
    //       style={{ display: "block" }}
    //       data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
    //       data-ad-slot={slotId}
    //       data-ad-format="auto"
    //       data-full-width-responsive="true"
    //     />
    //   </div>
    // );
    return null;
  }

  // ── Production without ads: empty reserved space, no visible text ─────
  if (!IS_DEV) {
    return (
      <div
        aria-hidden="true"
        className={cn("w-full", SLOT_CLASSES[slot], className)}
      />
    );
  }

  // ── Dev placeholder: visible so we know where slots are ───────────────
  const sizes = SLOT_SIZES[slot];

  return (
    <div
      data-ad-slot={slot}
      className={cn(
        "w-full flex flex-col items-center justify-center",
        "border border-dashed border-border rounded-lg",
        "bg-muted/50",
        SLOT_CLASSES[slot],
        className
      )}
      aria-hidden
    >
      <p className="text-xs text-muted-foreground/50 font-mono">Ad Space (inactive)</p>
      <p className="text-[10px] text-muted-foreground/30 mt-0.5">
        <span className="hidden md:inline">{sizes.desktop}</span>
        <span className="md:hidden">{sizes.mobile}</span>
      </p>
    </div>
  );
}
