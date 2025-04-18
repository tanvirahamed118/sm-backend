/*
  Warnings:

  - Added the required column `file` to the `project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "file" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "file" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
