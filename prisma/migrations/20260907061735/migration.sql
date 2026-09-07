/*
  Warnings:

  - The values [WRITTEN] on the enum `ProblemType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProblemType_new" AS ENUM ('MCQ', 'CODING');
ALTER TABLE "problems" ALTER COLUMN "type" TYPE "ProblemType_new" USING ("type"::text::"ProblemType_new");
ALTER TYPE "ProblemType" RENAME TO "ProblemType_old";
ALTER TYPE "ProblemType_new" RENAME TO "ProblemType";
DROP TYPE "public"."ProblemType_old";
COMMIT;

-- CreateTable
CREATE TABLE "mcq_options" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcq_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mcq_options_problemId_idx" ON "mcq_options"("problemId");

-- AddForeignKey
ALTER TABLE "mcq_options" ADD CONSTRAINT "mcq_options_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
