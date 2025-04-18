/*
  Warnings:

  - Added the required column `heading` to the `projectMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projectMember" ADD COLUMN     "heading" TEXT NOT NULL;
