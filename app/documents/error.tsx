"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

// Route-level error boundary for /documents. The page fetches the document
// library from the database during render; if that throws (DB unreachable,
// timeout, transient error) this fallback replaces the page instead of Next's
// default crash screen. `unstable_retry` re-runs the server render of the
// segment, recovering automatically when the underlying issue clears.
export default function DocumentsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="max-w-5xl">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive-subtle text-destructive">
          <AlertIcon className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          We couldn&apos;t load your documents
        </h1>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          This is usually a temporary problem on our end. Your documents are
          safe.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-6">
          <Button type="button" onClick={() => unstable_retry()}>
            Try again
          </Button>
        </div>
      </div>
    </Container>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
