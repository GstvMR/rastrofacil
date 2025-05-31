/*
  Warnings:

  - You are about to drop the column `destCep` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `originCep` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `addressCity` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressNeighborhood` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressNumber` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressReceiver` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressStreet` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressUf` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressZipcode` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerDoc` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerFirstName` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerLastName` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daysDelivery` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gateway` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueDiscount` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueProducts` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueShipment` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueTotal` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Lead` DROP COLUMN `destCep`,
    DROP COLUMN `originCep`,
    ADD COLUMN `addressCity` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressNeighborhood` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressReceiver` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressStreet` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressUf` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressZipcode` VARCHAR(191) NOT NULL,
    ADD COLUMN `billetBarcode` VARCHAR(191) NULL,
    ADD COLUMN `customerDoc` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerFirstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerLastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `customerPhone` VARCHAR(191) NOT NULL,
    ADD COLUMN `daysDelivery` VARCHAR(191) NOT NULL,
    ADD COLUMN `gateway` VARCHAR(191) NOT NULL,
    ADD COLUMN `gatewayTxId` VARCHAR(191) NULL,
    ADD COLUMN `orderNumber` INTEGER NOT NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `valueDiscount` DOUBLE NOT NULL,
    ADD COLUMN `valueProducts` DOUBLE NOT NULL,
    ADD COLUMN `valueShipment` DOUBLE NOT NULL,
    ADD COLUMN `valueTotal` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `LeadItem` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `variation` VARCHAR(191) NULL,
    `sourceReference` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    INDEX `LeadItem_leadId_fkey`(`leadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LeadItem` ADD CONSTRAINT `LeadItem_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
