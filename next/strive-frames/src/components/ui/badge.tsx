import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-gray-100 text-gray-900 hover:bg-gray-200/80": variant === "secondary",
          "bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        },
        className
      )}
    >
      {children}
    </div>
  );
} 