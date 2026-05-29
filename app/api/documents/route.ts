import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const docs = await prisma.document.findMany();
  return NextResponse.json(docs);
}
