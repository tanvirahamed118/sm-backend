/*
  Warnings:

  - Added the required column `userName` to the `projectMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projectMember" ADD COLUMN     "userName" TEXT NOT NULL;
