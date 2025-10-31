/*
  Warnings:

  - You are about to drop the column `pairings` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tastingNotes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `abv` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `ibu` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `packSize` on the `Variant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('BEER', 'FOOD');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "pairings",
DROP COLUMN "style",
DROP COLUMN "tastingNotes",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'BEER';

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "abv",
DROP COLUMN "ibu",
DROP COLUMN "packSize",
ADD COLUMN     "attributes" JSONB;
