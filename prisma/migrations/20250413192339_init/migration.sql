/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `comment` table. All the data in the column will be lost.
  - Added the required column `assigneerId` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_ownerId_fkey";

-- AlterTable
ALTER TABLE "comment" DROP COLUMN "assigneeId",
DROP COLUMN "ownerId",
ADD COLUMN     "assigneerId" INTEGER NOT NULL,
ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_assigneerId_fkey" FOREIGN KEY ("assigneerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
