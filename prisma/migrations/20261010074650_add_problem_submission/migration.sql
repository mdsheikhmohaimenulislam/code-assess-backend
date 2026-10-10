/*
  Warnings:

  - You are about to drop the column `problemId` on the `results` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "results" DROP COLUMN "problemId";

-- CreateTable
CREATE TABLE "problem_submissions" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obtainedMark" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "problem_submissions_candidateId_idx" ON "problem_submissions"("candidateId");

-- CreateIndex
CREATE INDEX "problem_submissions_problemId_idx" ON "problem_submissions"("problemId");

-- CreateIndex
CREATE INDEX "problem_submissions_status_idx" ON "problem_submissions"("status");

-- AddForeignKey
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
