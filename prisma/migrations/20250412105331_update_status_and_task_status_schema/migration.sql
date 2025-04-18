/*
  Warnings:

  - The values [TODO] on the enum `taskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "status" ADD VALUE 'APPROVED';
ALTER TYPE "status" ADD VALUE 'PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "taskStatus_new" AS ENUM ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "task" ALTER COLUMN "status" TYPE "taskStatus_new" USING ("status"::text::"taskStatus_new");
ALTER TYPE "taskStatus" RENAME TO "taskStatus_old";
ALTER TYPE "taskStatus_new" RENAME TO "taskStatus";
DROP TYPE "taskStatus_old";
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'PENDING';
