/*
  Warnings:

  - You are about to drop the column `profile` on the `projectMember` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_taskId_fkey";

-- DropForeignKey
ALTER TABLE "projectMember" DROP CONSTRAINT "projectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "projectMember" DROP CONSTRAINT "projectMember_userId_fkey";

-- AlterTable
ALTER TABLE "projectMember" DROP COLUMN "profile";

-- AddForeignKey
ALTER TABLE "projectMember" ADD CONSTRAINT "projectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectMember" ADD CONSTRAINT "projectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
