"use client";

import { cn } from "@/lib/utils";

type Variant = "hero" | "subtle" | "top-fade";

const blobBase =
  "absolute rounded-full blur-3xl will-change-transform pointer-events-none";

interface BlobProps {
  style: React.CSSProperties;
  animClass: string;
  opacity: number;
}

function Blob({ style, animClass, opacity }: BlobProps) {
  return (
    <div
      aria-hidden
      className={cn(blobBase, animClass)}
      style={{ ...style, opacity }}
    />
  );
}

export function MeshGradient({
  variant = "hero",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const intensity = variant === "subtle" ? 0.5 : 1;

  const maskStyle: React.CSSProperties =
    variant === "top-fade"
      ? { maskImage: "linear-gradient(to bottom, black 0%, transparent 200px)" }
      : {};

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={maskStyle}
    >
      {/* Navy / slate blob — top-right */}
      <Blob
        animClass="drift-1"
        opacity={intensity}
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: 720,
          maxHeight: 720,
          top: "-15%",
          right: "-5%",
          background:
            "radial-gradient(circle, var(--gradient-navy) 0%, transparent 70%)",
          animation: "drift-1 30s ease-in-out infinite",
        }}
      />
      {/* Amber blob — bottom-left */}
      <Blob
        animClass="drift-2"
        opacity={intensity}
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: 580,
          maxHeight: 580,
          bottom: "5%",
          left: "-8%",
          background:
            "radial-gradient(circle, var(--gradient-amber) 0%, transparent 70%)",
          animation: "drift-2 25s ease-in-out infinite",
        }}
      />
      {/* Emerald blob — center */}
      <Blob
        animClass="drift-3"
        opacity={intensity}
        style={{
          width: "45vw",
          height: "45vw",
          maxWidth: 640,
          maxHeight: 640,
          top: "35%",
          left: "30%",
          background:
            "radial-gradient(circle, var(--gradient-emerald) 0%, transparent 70%)",
          animation: "drift-3 35s ease-in-out infinite",
        }}
      />
    </div>
  );
}
