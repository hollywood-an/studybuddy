import type { ReactNode } from "react";

// Intentional empty state: a framed panel with an icon, a clear heading, a
// short description, and a primary call to action.
export function EmptyState({
  icon,
  title,
  description,
  action,
  // Defaults to h3; callers whose page heading is h1 should pass 2 so the
  // document outline doesn't skip a level.
  headingLevel = 3,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <Heading className="text-lg font-semibold text-foreground">{title}</Heading>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
