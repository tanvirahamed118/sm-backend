-- AlterTable
ALTER TABLE "project" ADD COLUMN     "verify" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "verify" BOOLEAN NOT NULL DEFAULT false;
