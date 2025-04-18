/*
  Warnings:

  - You are about to drop the column `reciverId` on the `message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_reciverId_fkey";

-- AlterTable
ALTER TABLE "message" DROP COLUMN "reciverId";
