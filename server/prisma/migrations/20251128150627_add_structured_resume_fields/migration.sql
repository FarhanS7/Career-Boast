/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "education" JSONB[],
ADD COLUMN     "experience" JSONB[],
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "personalInfo" JSONB,
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_shareToken_key" ON "Resume"("shareToken");
