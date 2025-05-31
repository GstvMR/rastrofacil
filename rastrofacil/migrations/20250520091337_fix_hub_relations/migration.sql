-- CreateTable
CREATE TABLE `Hub` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HubConnection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromCode` VARCHAR(191) NOT NULL,
    `toCode` VARCHAR(191) NOT NULL,
    `distance` INTEGER NOT NULL,

    UNIQUE INDEX `HubConnection_fromCode_toCode_key`(`fromCode`, `toCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HubConnection` ADD CONSTRAINT `HubConnection_fromCode_fkey` FOREIGN KEY (`fromCode`) REFERENCES `Hub`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HubConnection` ADD CONSTRAINT `HubConnection_toCode_fkey` FOREIGN KEY (`toCode`) REFERENCES `Hub`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;
