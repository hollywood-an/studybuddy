import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const docs = await prisma.document.findMany();
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  const { title, content } = await request.json();
  const doc = await prisma.document.create({
    data: { title, content },
  });
  return NextResponse.json(doc);
}