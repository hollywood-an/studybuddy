import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

// Surface primitive: white card on the warm page background. No padding by
// default so it composes with links, grids, and headers.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}
