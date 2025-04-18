-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_projectId_fkey";

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
