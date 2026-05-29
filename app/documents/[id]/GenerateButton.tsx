"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SpinnerIcon } from "@/components/ui/icons";

export default function GenerateButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/documents/${documentId}/generate-flashcards`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      // Tell Next.js to re-fetch the server component data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <Button
        variant="secondary"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isGenerating ? "Generating…" : "Generate flashcards"}
      </Button>
      {error && (
        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive-subtle px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
