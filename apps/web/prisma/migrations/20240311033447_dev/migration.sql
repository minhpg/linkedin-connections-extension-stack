/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[linkedInUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_createdById_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedInUserId" INTEGER;

-- DropTable
DROP TABLE "Connection";

-- CreateTable
CREATE TABLE "LinkedInUser" (
    "id" SERIAL NOT NULL,
    "entityUrn" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "memorialized" BOOLEAN NOT NULL,
    "publicIdentifier" TEXT NOT NULL,
    "profilePicture" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInConnection" (
    "id" SERIAL NOT NULL,
    "entityUrn" TEXT NOT NULL,
    "connectedAt" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "LinkedInConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LinkedInConnectionToLinkedInUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInUser_entityUrn_key" ON "LinkedInUser"("entityUrn");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInUser_userId_key" ON "LinkedInUser"("userId");

-- CreateIndex
CREATE INDEX "LinkedInUser_firstName_lastName_publicIdentifier_idx" ON "LinkedInUser"("firstName", "lastName", "publicIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInConnection_entityUrn_key" ON "LinkedInConnection"("entityUrn");

-- CreateIndex
CREATE UNIQUE INDEX "_LinkedInConnectionToLinkedInUser_AB_unique" ON "_LinkedInConnectionToLinkedInUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LinkedInConnectionToLinkedInUser_B_index" ON "_LinkedInConnectionToLinkedInUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_linkedInUserId_key" ON "User"("linkedInUserId");

-- AddForeignKey
ALTER TABLE "LinkedInUser" ADD CONSTRAINT "LinkedInUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedInConnection" ADD CONSTRAINT "LinkedInConnection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkedInConnectionToLinkedInUser" ADD CONSTRAINT "_LinkedInConnectionToLinkedInUser_A_fkey" FOREIGN KEY ("A") REFERENCES "LinkedInConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkedInConnectionToLinkedInUser" ADD CONSTRAINT "_LinkedInConnectionToLinkedInUser_B_fkey" FOREIGN KEY ("B") REFERENCES "LinkedInUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
