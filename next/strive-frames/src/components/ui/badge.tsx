import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--success-bg)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--success-bg)] text-[var(--success-text)]",
        secondary: "bg-[var(--theme-background-input)] text-[var(--theme-text)]",
        destructive: "bg-red-500 text-white",
        outline: "border border-[var(--theme-border)] bg-[var(--theme-background)] hover:bg-[var(--theme-focused-foreground-subdued)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 