-- Make Attempt grading three-way: CORRECT / PARTIAL / INCORRECT.
-- Backfill existing rows from the old boolean before dropping it
-- (true -> CORRECT, false -> INCORRECT) so no grading history is lost.

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('CORRECT', 'PARTIAL', 'INCORRECT');

-- AlterTable: add the new column nullable, backfill, then enforce NOT NULL
ALTER TABLE "Attempt" ADD COLUMN "verdict" "Verdict";

UPDATE "Attempt"
SET "verdict" = CASE WHEN "isCorrect" THEN 'CORRECT'::"Verdict" ELSE 'INCORRECT'::"Verdict" END;

ALTER TABLE "Attempt" ALTER COLUMN "verdict" SET NOT NULL;

ALTER TABLE "Attempt" DROP COLUMN "isCorrect";
