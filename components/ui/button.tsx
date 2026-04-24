"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground rounded-full shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-transparent text-primary border border-primary rounded-full hover:bg-primary/5",
        ghost:
          "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg",
      },
      size: {
        sm: "text-sm px-4 py-2 gap-1.5",
        md: "text-sm px-6 py-2.5 gap-2",
        lg: "text-base px-8 py-3.5 gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
