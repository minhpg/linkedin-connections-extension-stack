/*
  Warnings:

  - A unique constraint covering the columns `[entityUrn]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "SyncRecord" (
    "id" SERIAL NOT NULL,
    "startCount" INTEGER NOT NULL,
    "endCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "SyncRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_entityUrn_key" ON "Connection"("entityUrn");

-- AddForeignKey
ALTER TABLE "SyncRecord" ADD CONSTRAINT "SyncRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
