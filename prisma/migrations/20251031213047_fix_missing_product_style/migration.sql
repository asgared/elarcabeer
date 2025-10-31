/*
  Warnings:

  - You are about to drop the column `attributes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `gallery` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - Added the required column `images` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadata` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "attributes",
DROP COLUMN "gallery",
DROP COLUMN "imageUrl",
ADD COLUMN     "images" JSONB NOT NULL,
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "style" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;
