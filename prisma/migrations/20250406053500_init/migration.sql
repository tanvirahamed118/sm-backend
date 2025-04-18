-- AddForeignKey
ALTER TABLE "projectMember" ADD CONSTRAINT "projectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
