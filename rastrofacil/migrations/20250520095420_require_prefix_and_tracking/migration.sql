/*
  Warnings:

  - Made the column `prefix` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trackingCode` on table `Lead` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Company` MODIFY `prefix` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Lead` MODIFY `trackingCode` VARCHAR(191) NOT NULL;
