import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

// Standard page shell: centered, generous padding, max-w-3xl (768px) for
// content-heavy pages. Pass `className="max-w-5xl"` for wider list views.
export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-6 py-10 md:py-12", className)}
      {...props}
    />
  );
}
