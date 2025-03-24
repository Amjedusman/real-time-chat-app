-- CreateTable
CREATE TABLE "_BlockedChats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BlockedChats_AB_unique" ON "_BlockedChats"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockedChats_B_index" ON "_BlockedChats"("B");

-- AddForeignKey
ALTER TABLE "_BlockedChats" ADD CONSTRAINT "_BlockedChats_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedChats" ADD CONSTRAINT "_BlockedChats_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
