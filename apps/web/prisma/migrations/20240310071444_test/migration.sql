/*
  Warnings:

  - Added the required column `profilePicture` to the `Connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syncEnd` to the `SyncRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syncStart` to the `SyncRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syncSuccess` to the `SyncRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "profilePicture" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SyncRecord" ADD COLUMN     "syncEnd" INTEGER NOT NULL,
ADD COLUMN     "syncErrorMessage" TEXT,
ADD COLUMN     "syncStart" INTEGER NOT NULL,
ADD COLUMN     "syncSuccess" BOOLEAN NOT NULL;
