/*
  Warnings:

  - A unique constraint covering the columns `[prefix]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackingCode]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `prefix` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Lead` ADD COLUMN `trackingCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Company_prefix_key` ON `Company`(`prefix`);

-- CreateIndex
CREATE UNIQUE INDEX `Lead_trackingCode_key` ON `Lead`(`trackingCode`);
