/*
  Warnings:

  - Added the required column `assigneerId` to the `comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "assigneerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_assigneerId_fkey" FOREIGN KEY ("assigneerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
