/*
  Warnings:

  - The `status` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "status" AS ENUM ('In_PROGRESS', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "project" DROP COLUMN "status",
ADD COLUMN     "status" "status" NOT NULL DEFAULT 'In_PROGRESS';

-- DropEnum
DROP TYPE "Status";
