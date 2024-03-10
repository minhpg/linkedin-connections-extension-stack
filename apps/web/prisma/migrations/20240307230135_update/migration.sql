/*
  Warnings:

  - Changed the type of `memorialized` on the `Connection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "memorialized",
ADD COLUMN     "memorialized" BOOLEAN NOT NULL;
