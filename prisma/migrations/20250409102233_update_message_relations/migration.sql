/*
  Warnings:

  - You are about to drop the column `reciverMessage` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `reciverName` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `reciverProfile` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `senderMessage` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `senderName` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `senderProfile` on the `message` table. All the data in the column will be lost.
  - Added the required column `message` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message" DROP COLUMN "reciverMessage",
DROP COLUMN "reciverName",
DROP COLUMN "reciverProfile",
DROP COLUMN "senderMessage",
DROP COLUMN "senderName",
DROP COLUMN "senderProfile",
ADD COLUMN     "message" TEXT NOT NULL;
