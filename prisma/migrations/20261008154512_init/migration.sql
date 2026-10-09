-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_assessmentId_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "assessmentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "payments_problemId_idx" ON "payments"("problemId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
