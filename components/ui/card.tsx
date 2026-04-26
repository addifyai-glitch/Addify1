import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const cardVariants = cva(
  "bg-card border border-border rounded-xl shadow-soft",
  {
    variants: {
      interactive: {
        true: [
          "transition-all duration-300 cursor-pointer",
          "hover:shadow-hover hover:-translate-y-1.5",
          "hover:border-accent/50",
          "relative overflow-hidden",
          "after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-300",
          "after:bg-gradient-to-br after:from-accent/5 after:to-transparent after:pointer-events-none",
          "hover:after:opacity-100",
        ].join(" "),
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ interactive, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card, cardVariants };
