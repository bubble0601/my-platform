-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `songs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `user_id` BIGINT NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `title` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `digest` VARCHAR(255) NOT NULL,
    `album_id` BIGINT NULL,
    `artist_name` VARCHAR(255) NULL,
    `artist_id` BIGINT NULL,
    `year` INTEGER NULL,
    `track_num` INTEGER NULL,
    `disc_num` INTEGER NULL DEFAULT 1,
    `has_cover_art` BOOLEAN NOT NULL DEFAULT false,
    `has_lyrics` BOOLEAN NOT NULL DEFAULT false,
    `length` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 0,
    `played_count` INTEGER NOT NULL DEFAULT 0,
    `synced_played_count` INTEGER NOT NULL DEFAULT 0,
    `played_at` DATETIME(0) NULL,

    UNIQUE INDEX `digest`(`digest`),
    INDEX `album_id`(`album_id`),
    INDEX `artist_id`(`artist_id`),
    INDEX `songs_user_id_index`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `albums` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `artist_id` BIGINT NOT NULL,
    `year` INTEGER NULL,
    `track_count` INTEGER NULL,
    `disc_count` INTEGER NULL DEFAULT 1,

    INDEX `albums_user_id_index`(`user_id`),
    INDEX `artist_id`(`artist_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artists` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `user_id` BIGINT NULL,
    `name` VARCHAR(255) NOT NULL,
    `ruby` VARCHAR(255) NULL,

    INDEX `artists_user_id_index`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playlists` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `user_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    INDEX `playlists_user_id_index`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playlists_songs` (
    `playlist_id` BIGINT NOT NULL,
    `song_id` BIGINT NOT NULL,
    `weight` INTEGER NOT NULL DEFAULT 1,

    INDEX `playlists_songs_playlist_id_song_id_index`(`playlist_id`, `song_id`),
    INDEX `song_id`(`song_id`),
    PRIMARY KEY (`playlist_id`, `song_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schema_info` (
    `version` INTEGER NOT NULL DEFAULT 0
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `songs` ADD CONSTRAINT `songs_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `songs` ADD CONSTRAINT `songs_ibfk_2` FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `songs` ADD CONSTRAINT `songs_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `albums` ADD CONSTRAINT `albums_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `albums` ADD CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `artists` ADD CONSTRAINT `artists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `playlists` ADD CONSTRAINT `playlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `playlists_songs` ADD CONSTRAINT `playlists_songs_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `playlists_songs` ADD CONSTRAINT `playlists_songs_ibfk_2` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
