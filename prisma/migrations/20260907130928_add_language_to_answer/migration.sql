/*
  Warnings:

  - Added the required column `language` to the `answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "answers"
ADD COLUMN "language" "ProgrammingLanguage";

UPDATE "answers"
SET "language" = 'JAVASCRIPT'
WHERE "language" IS NULL;

ALTER TABLE "answers"
ALTER COLUMN "language" SET NOT NULL;
