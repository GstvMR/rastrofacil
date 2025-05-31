/*
  Warnings:

  - You are about to drop the column `userId` on the `CompanySettings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Lead` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `CompanySettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `CompanySettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CompanySettings` DROP FOREIGN KEY `CompanySettings_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Lead` DROP FOREIGN KEY `Lead_userId_fkey`;

-- DropIndex
DROP INDEX `CompanySettings_userId_key` ON `CompanySettings`;

-- DropIndex
DROP INDEX `Lead_userId_fkey` ON `Lead`;

-- AlterTable
ALTER TABLE `CompanySettings` DROP COLUMN `userId`,
    ADD COLUMN `companyId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Lead` DROP COLUMN `userId`,
    ADD COLUMN `companyId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CompanySettings_companyId_key` ON `CompanySettings`(`companyId`);

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanySettings` ADD CONSTRAINT `CompanySettings_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
