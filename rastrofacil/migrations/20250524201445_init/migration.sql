/*
  Warnings:

  - You are about to drop the column `theme` on the `CompanySettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CompanySettings` DROP COLUMN `theme`,
    ADD COLUMN `fontFamily` VARCHAR(191) NOT NULL DEFAULT '''Inter'', sans-serif',
    ADD COLUMN `logo` VARCHAR(191) NOT NULL DEFAULT '/logolog.png',
    ADD COLUMN `showResumoDetalhado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `templateName` VARCHAR(191) NOT NULL DEFAULT 'loggi',
    ADD COLUMN `themeAccent` VARCHAR(191) NOT NULL DEFAULT '#FF4081',
    ADD COLUMN `themeBackground` VARCHAR(191) NOT NULL DEFAULT '#f4f8ff',
    ADD COLUMN `themePending` VARCHAR(191) NOT NULL DEFAULT '#A1A1AA',
    ADD COLUMN `themePrimary` VARCHAR(191) NOT NULL DEFAULT '#0056FF';
