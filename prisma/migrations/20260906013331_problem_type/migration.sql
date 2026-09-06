/*
  Warnings:

  - Added the required column `type` to the `problems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProblemType" AS ENUM ('MCQ', 'CODING', 'WRITTEN');

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "type" "ProblemType" NOT NULL;
