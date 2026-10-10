/*
  Warnings:

  - Added the required column `problemId` to the `results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "results" ADD COLUMN     "problemId" TEXT NOT NULL;
