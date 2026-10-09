/*
  Warnings:

  - You are about to drop the column `companyId` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `passingMarks` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `totalMarks` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `problems` table. All the data in the column will be lost.
  - You are about to drop the column `attemptId` on the `results` table. All the data in the column will be lost.
  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assessment_problems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invitations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mcq_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mcq_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test_cases` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[candidateId,assessmentId]` on the table `results` will be added. If there are existing duplicate values, this will fail.
  - Made the column `assessmentId` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `answer` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessmentId` to the `results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidateId` to the `results` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_problemId_fkey";

-- DropForeignKey
ALTER TABLE "assessment_problems" DROP CONSTRAINT "assessment_problems_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "assessment_problems" DROP CONSTRAINT "assessment_problems_problemId_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_companyId_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_userId_fkey";

-- DropForeignKey
ALTER TABLE "mcq_answers" DROP CONSTRAINT "mcq_answers_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "mcq_answers" DROP CONSTRAINT "mcq_answers_problemId_fkey";

-- DropForeignKey
ALTER TABLE "mcq_answers" DROP CONSTRAINT "mcq_answers_selectedOptionId_fkey";

-- DropForeignKey
ALTER TABLE "mcq_options" DROP CONSTRAINT "mcq_options_problemId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "results" DROP CONSTRAINT "results_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_problemId_fkey";

-- DropForeignKey
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_problemId_fkey";

-- DropIndex
DROP INDEX "assessments_companyId_idx";

-- DropIndex
DROP INDEX "assessments_startTime_idx";

-- DropIndex
DROP INDEX "results_attemptId_key";

-- AlterTable
ALTER TABLE "assessments" DROP COLUMN "companyId",
DROP COLUMN "duration",
DROP COLUMN "endTime",
DROP COLUMN "passingMarks",
DROP COLUMN "startTime",
DROP COLUMN "totalMarks";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "problemId" TEXT,
ALTER COLUMN "assessmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "problems" DROP COLUMN "type",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "assessmentId" TEXT,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marks" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "results" DROP COLUMN "attemptId",
ADD COLUMN     "assessmentId" TEXT NOT NULL,
ADD COLUMN     "candidateId" TEXT NOT NULL;

-- DropTable
DROP TABLE "answers";

-- DropTable
DROP TABLE "assessment_problems";

-- DropTable
DROP TABLE "attempts";

-- DropTable
DROP TABLE "evaluations";

-- DropTable
DROP TABLE "invitations";

-- DropTable
DROP TABLE "mcq_answers";

-- DropTable
DROP TABLE "mcq_options";

-- DropTable
DROP TABLE "submissions";

-- DropTable
DROP TABLE "test_cases";

-- DropEnum
DROP TYPE "AttemptStatus";

-- DropEnum
DROP TYPE "InvitationStatus";

-- DropEnum
DROP TYPE "ProblemType";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateTable
CREATE TABLE "result_answers" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "obtainedMark" DOUBLE PRECISION NOT NULL,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "result_answers_resultId_idx" ON "result_answers"("resultId");

-- CreateIndex
CREATE INDEX "result_answers_problemId_idx" ON "result_answers"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "result_answers_resultId_problemId_key" ON "result_answers"("resultId", "problemId");

-- CreateIndex
CREATE INDEX "problems_assessmentId_idx" ON "problems"("assessmentId");

-- CreateIndex
CREATE INDEX "results_candidateId_idx" ON "results"("candidateId");

-- CreateIndex
CREATE INDEX "results_assessmentId_idx" ON "results"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "results_candidateId_assessmentId_key" ON "results"("candidateId", "assessmentId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_answers" ADD CONSTRAINT "result_answers_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_answers" ADD CONSTRAINT "result_answers_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
