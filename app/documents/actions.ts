"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Deleting a document cascades to its chunks, flashcards, attempts, and tutor
// sessions (onDelete: Cascade in prisma/schema.prisma).
export async function deleteDocument(id: string) {
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documents");
}
