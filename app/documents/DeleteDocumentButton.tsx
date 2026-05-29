"use client";

import { useState, useTransition } from "react";
import { deleteDocument } from "./actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { XIcon } from "@/components/ui/icons";

export function DeleteDocumentButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteDocument(id);
        // On success the row is revalidated away; close the dialog. On failure
        // keep it open so the inline error stays visible and retryable.
        setOpen(false);
      } catch {
        setError("We couldn't delete this document. Please try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={`Delete ${title}`}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive-subtle hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background pointer-coarse:h-11 pointer-coarse:w-11"
      >
        <XIcon className="h-4 w-4" />
      </button>

      <ConfirmDialog
        open={open}
        title="Delete this document?"
        description={
          <>
            “{title}” will be permanently deleted, along with its flashcards and
            study history.
          </>
        }
        confirmLabel="Delete document"
        destructive
        pending={isPending}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => {
          setError(null);
          setOpen(false);
        }}
      />
    </>
  );
}
