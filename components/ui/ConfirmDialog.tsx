"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SpinnerIcon } from "@/components/ui/icons";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  // While a confirm is in flight: shows a spinner, disables the actions, and
  // blocks dismissal so a half-finished operation can't be abandoned.
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  pending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();

  // The native <dialog> renders in the top layer (no stacking/overflow traps)
  // and provides the focus trap + Escape handling for free. Drive it from the
  // `open` prop so React stays the single source of truth; showModal() focuses
  // the first focusable child, which is the Cancel button below, so Enter can't
  // fire a destructive action by reflex.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Route every dismissal path (Escape, backdrop) through the `open` prop, but
  // never dismiss while an operation is in flight.
  function requestClose() {
    if (!pending) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) requestClose();
      }}
      className="confirm-dialog m-auto w-[calc(100vw-2rem)] max-w-md border-0 bg-transparent p-0 text-foreground"
    >
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 id={headingId} className="text-base font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p
            id={descriptionId}
            className="mt-1.5 break-words text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-destructive-subtle px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
