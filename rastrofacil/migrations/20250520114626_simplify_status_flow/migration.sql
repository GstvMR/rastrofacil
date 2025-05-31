/*
  Warnings:

  - You are about to alter the column `status` on the `Lead` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.
  - You are about to drop the `Hub` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HubConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RouteStop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `HubConnection` DROP FOREIGN KEY `HubConnection_fromCode_fkey`;

-- DropForeignKey
ALTER TABLE `HubConnection` DROP FOREIGN KEY `HubConnection_toCode_fkey`;

-- DropForeignKey
ALTER TABLE `Route` DROP FOREIGN KEY `Route_leadId_fkey`;

-- DropForeignKey
ALTER TABLE `RouteStop` DROP FOREIGN KEY `RouteStop_routeId_fkey`;

-- DropIndex
DROP INDEX `Company_prefix_key` ON `Company`;

-- AlterTable
ALTER TABLE `Company` MODIFY `prefix` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CompanySettings` ADD COLUMN `viewMode` VARCHAR(191) NOT NULL DEFAULT 'simple';

-- AlterTable
ALTER TABLE `Lead` MODIFY `status` ENUM('purchase', 'sorting', 'in_transit', 'delivered', 'failed', 'retry') NOT NULL;

-- DropTable
DROP TABLE `Hub`;

-- DropTable
DROP TABLE `HubConnection`;

-- DropTable
DROP TABLE `Route`;

-- DropTable
DROP TABLE `RouteStop`;

-- CreateTable
CREATE TABLE `LeadStatusHistory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `leadId` VARCHAR(191) NOT NULL,
    `status` ENUM('purchase', 'sorting', 'in_transit', 'delivered', 'failed', 'retry') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LeadStatusHistory` ADD CONSTRAINT `LeadStatusHistory_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
