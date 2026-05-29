import { prisma } from "@/lib/prisma";
import { runTutorAgent } from "@/lib/tutor/agent";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { sessionId, userMessage } = await request.json();

  // Find or create the session
  const session = sessionId
    ? await prisma.tutorSession.findUnique({ where: { id: sessionId } })
    : await prisma.tutorSession.create({
        data: { documentId: id },
      });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const decision = await runTutorAgent(
    id,
    userMessage ??
      "Decide what to do next: present the best card, or end the session if the student has mastered everything."
  );

  // Persist the transcript for debugging / the dashboard
  await prisma.tutorSession.update({
    where: { id: session.id },
    data: {
      transcript: JSON.parse(JSON.stringify(decision.transcript)),
      ...(decision.type === "end_session" && {
        studyPlan: decision.studyPlan,
        endedAt: new Date(),
      }),
    },
  });

  if (decision.type === "present_card") {
    const card = await prisma.flashcard.findUnique({
      where: { id: decision.cardId },
    });
    return NextResponse.json({
      sessionId: session.id,
      action: "present_card",
      card,
      reasoning: decision.reasoning,
    });
  } else {
    return NextResponse.json({
      sessionId: session.id,
      action: "end_session",
      studyPlan: decision.studyPlan,
    });
  }
}