/*
  Warnings:

  - You are about to drop the column `assigneerId` on the `comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_assigneerId_fkey";

-- AlterTable
ALTER TABLE "comment" DROP COLUMN "assigneerId";
