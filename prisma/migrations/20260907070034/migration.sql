-- CreateTable
CREATE TABLE "mcq_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "marksAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcq_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mcq_answers_attemptId_idx" ON "mcq_answers"("attemptId");

-- CreateIndex
CREATE INDEX "mcq_answers_problemId_idx" ON "mcq_answers"("problemId");

-- CreateIndex
CREATE INDEX "mcq_answers_selectedOptionId_idx" ON "mcq_answers"("selectedOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "mcq_answers_attemptId_problemId_key" ON "mcq_answers"("attemptId", "problemId");

-- AddForeignKey
ALTER TABLE "mcq_answers" ADD CONSTRAINT "mcq_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq_answers" ADD CONSTRAINT "mcq_answers_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq_answers" ADD CONSTRAINT "mcq_answers_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "mcq_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
