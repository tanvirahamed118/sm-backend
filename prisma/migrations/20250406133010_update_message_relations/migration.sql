/*
  Warnings:

  - You are about to drop the column `managerId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `managerName` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `memberName` on the `message` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_managerId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_memberId_fkey";

-- AlterTable
ALTER TABLE "message" DROP COLUMN "managerId",
DROP COLUMN "managerName",
DROP COLUMN "memberId",
DROP COLUMN "memberName",
ADD COLUMN     "senderId" INTEGER NOT NULL,
ADD COLUMN     "senderName" TEXT;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
