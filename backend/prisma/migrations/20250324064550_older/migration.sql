/*
  Warnings:

  - You are about to drop the `_BlockedChats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BlockedChats" DROP CONSTRAINT "_BlockedChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlockedChats" DROP CONSTRAINT "_BlockedChats_B_fkey";

-- DropTable
DROP TABLE "_BlockedChats";
