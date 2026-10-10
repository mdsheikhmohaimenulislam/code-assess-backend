-- AlterTable
ALTER TABLE "result_answers" ADD COLUMN     "executionMessage" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
ADD COLUMN     "submissionType" TEXT NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "obtainedMark" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "result_answers_status_idx" ON "result_answers"("status");
