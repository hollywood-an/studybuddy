import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// Streamed fallback for /documents while the database query resolves. Mirrors
// the real layout (header + responsive card grid) so the page doesn't shift
// when content swaps in. The pulse is suppressed under reduced motion.
function Bar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-muted motion-reduce:animate-none",
        className
      )}
    />
  );
}

export default function DocumentsLoading() {
  return (
    <Container className="max-w-5xl">
      <span role="status" className="sr-only">
        Loading your documents
      </span>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Bar className="h-9 w-56" />
          <Bar className="mt-3 h-4 w-72 max-w-full" />
        </div>
        <Bar className="h-10 w-40 pointer-coarse:h-11" />
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="min-w-0">
            <Card className="flex h-full flex-col p-5">
              <Bar className="h-5 w-3/4" />
              <Bar className="mt-3 h-4 w-1/2" />
              <div className="mt-5">
                <Bar className="h-2 w-full rounded-full" />
              </div>
              <div className="mt-auto flex gap-2 pt-5">
                <Bar className="h-8 w-20 pointer-coarse:h-11" />
                <Bar className="h-8 w-20 pointer-coarse:h-11" />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}
