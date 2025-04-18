/*
  Warnings:

  - The values [In_PROGRESS] on the enum `status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "status_new" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "project" ALTER COLUMN "status" TYPE "status_new" USING ("status"::text::"status_new");
ALTER TYPE "status" RENAME TO "status_old";
ALTER TYPE "status_new" RENAME TO "status";
DROP TYPE "status_old";
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
