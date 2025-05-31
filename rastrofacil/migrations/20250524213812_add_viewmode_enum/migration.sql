/*
  Warnings:

  - You are about to alter the column `viewMode` on the `CompanySettings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `CompanySettings` MODIFY `viewMode` ENUM('simple', 'route') NOT NULL DEFAULT 'simple';
