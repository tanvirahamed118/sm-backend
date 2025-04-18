/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `projectMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId]` on the table `projectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "projectMember_userId_key" ON "projectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "projectMember_projectId_key" ON "projectMember"("projectId");
