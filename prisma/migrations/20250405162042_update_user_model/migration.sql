/*
  Warnings:

  - You are about to drop the column `profile` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "profile",
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "logo" TEXT;
