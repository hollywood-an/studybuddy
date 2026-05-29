"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { UploadIcon, CheckIcon, SpinnerIcon } from "@/components/ui/icons";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    title: string;
    chunkCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pickFile(next: File | null) {
    setError(null);
    setResult(null);
    setFile(next);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) pickFile(dropped);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please pick a file first");
      return;
    }

    setError(null);
    setResult(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Container>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Upload a document
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We&rsquo;ll split it into chunks you can turn into flashcards.
      </p>

      <div className="mt-8 space-y-4">
        {/* Drop zone — the real file input is visually hidden but focusable. */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UploadIcon className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Drag &amp; drop a document here
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            or <span className="text-primary underline">browse</span> to choose
            a file
          </span>
          <span className="mt-3 text-xs text-muted-foreground">
            PDF, Word, PowerPoint, Excel, or text
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,application/pdf,text/plain"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            disabled={isUploading}
            className="sr-only"
          />
        </label>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="truncate font-medium text-foreground">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => pickFile(null)}
              disabled={isUploading}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Remove
            </button>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading && <SpinnerIcon className="h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading…" : "Upload"}
        </Button>

        {/* Indeterminate progress feel while the request is in flight */}
        {isUploading && (
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Uploading"
          >
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive-subtle px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <Card className="p-5">
            <div className="flex items-center gap-2 text-success">
              <CheckIcon className="h-5 w-5" />
              <span className="font-medium">Upload successful</span>
            </div>
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <dt className="text-foreground/70">Title:</dt>
                <dd>{result.title}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-foreground/70">Chunks created:</dt>
                <dd>{result.chunkCount}</dd>
              </div>
            </dl>
            <Link
              href={`/documents/${result.id}`}
              className={buttonClasses({ size: "sm", className: "mt-4" })}
            >
              Open document
            </Link>
          </Card>
        )}
      </div>
    </Container>
  );
}
