import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const cardVariants = cva(
  "bg-card border border-border rounded-xl shadow-soft",
  {
    variants: {
      interactive: {
        true: "hover:shadow-hover hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 cursor-pointer",
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
