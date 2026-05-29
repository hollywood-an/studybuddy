-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "timesSeen" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attempt_flashcardId_idx" ON "Attempt"("flashcardId");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
