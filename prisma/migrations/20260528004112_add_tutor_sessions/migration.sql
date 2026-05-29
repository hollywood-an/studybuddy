-- CreateTable
CREATE TABLE "TutorSession" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "studyPlan" TEXT,
    "transcript" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "TutorSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorSession_documentId_idx" ON "TutorSession"("documentId");

-- AddForeignKey
ALTER TABLE "TutorSession" ADD CONSTRAINT "TutorSession_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
