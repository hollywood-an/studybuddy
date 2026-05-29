import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { extractDocumentText, UnsupportedFileError } from "@/lib/extractText";

// Split text into overlapping chunks
function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(request: Request) {
  try {
    // Read the uploaded file from the form
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extract text based on the file type (PDF, Word, PowerPoint, Excel, text).
    let text: string;
    try {
      text = await extractDocumentText(file);
    } catch (err) {
      if (err instanceof UnsupportedFileError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error("Extraction error:", err);
      return NextResponse.json(
        {
          error:
            "Could not read this file. It may be corrupted or password-protected.",
        },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from this file" },
        { status: 400 }
      );
    }

    // Break text into chunks
    const textChunks = chunkText(text);

    // Save to database in a single transaction
    const document = await prisma.document.create({
      data: {
        // Strip whatever extension the file had for the title.
        title: file.name.replace(/\.[^/.]+$/, ""),
        filename: file.name,
        chunks: {
          create: textChunks.map((content, index) => ({
            content,
            index,
          })),
        },
      },
      include: { chunks: true },
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      chunkCount: document.chunks.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
