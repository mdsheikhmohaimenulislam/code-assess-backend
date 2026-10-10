/*
  Warnings:

  - Added the required column `answer` to the `problem_submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "problem_submissions" ADD COLUMN     "answer" TEXT NOT NULL;
