-- CreateTable
CREATE TABLE "ProblemTestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemTestCase_problemId_idx" ON "ProblemTestCase"("problemId");

-- AddForeignKey
ALTER TABLE "ProblemTestCase" ADD CONSTRAINT "ProblemTestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
