/*
  Warnings:

  - You are about to drop the column `message` on the `message` table. All the data in the column will be lost.
  - Added the required column `reciverId` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message" DROP COLUMN "message",
ADD COLUMN     "reciverId" INTEGER NOT NULL,
ADD COLUMN     "reciverMessage" TEXT,
ADD COLUMN     "reciverName" TEXT,
ADD COLUMN     "reciverProfile" TEXT,
ADD COLUMN     "senderMessage" TEXT,
ADD COLUMN     "senderProfile" TEXT;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_reciverId_fkey" FOREIGN KEY ("reciverId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
