/*
  Warnings:

  - The values [APPROVED,PENDING] on the enum `status` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,APPROVED] on the enum `taskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "status_new" AS ENUM ('In_PROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "project" ALTER COLUMN "status" TYPE "status_new" USING ("status"::text::"status_new");
ALTER TYPE "status" RENAME TO "status_old";
ALTER TYPE "status_new" RENAME TO "status";
DROP TYPE "status_old";
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'In_PROGRESS';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "taskStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "task" ALTER COLUMN "status" TYPE "taskStatus_new" USING ("status"::text::"taskStatus_new");
ALTER TYPE "taskStatus" RENAME TO "taskStatus_old";
ALTER TYPE "taskStatus_new" RENAME TO "taskStatus";
DROP TYPE "taskStatus_old";
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'In_PROGRESS';

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
