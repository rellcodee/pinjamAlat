-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 03, 2026 at 04:50 AM
-- Server version: 8.0.45-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `peminjaman_alat`
--

-- --------------------------------------------------------

--
-- Table structure for table `alat`
--

CREATE TABLE `alat` (
  `id` int NOT NULL,
  `kategori_id` int NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stok` int NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `merk` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alat`
--

INSERT INTO `alat` (`id`, `kategori_id`, `nama`, `deskripsi`, `image`, `stok`, `deleted_at`, `merk`) VALUES
(1, 1, 'Kamera Cannon EOS', 'Cekrek', '/uploads/1780454025466-Cannon.jpg', 0, NULL, 'Cannon'),
(2, 1, 'Monitor 67', 'Monitor', '/uploads/1780454488251-Dell_UltraSharp_U2412M_24-Inch_Screen_LED-Lit_Monitor_Used_Grade_A.jpeg', 0, '2026-06-02 19:43:19', 'LG');

-- --------------------------------------------------------

--
-- Table structure for table `alat_unit`
--

CREATE TABLE `alat_unit` (
  `id` int NOT NULL,
  `alat_id` int NOT NULL,
  `kode_unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kondisi` enum('baik','rusak_ringan','rusak_berat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'baik',
  `status` enum('tersedia','dipinjam','tidak_tersedia') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tersedia',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alat_unit`
--

INSERT INTO `alat_unit` (`id`, `alat_id`, `kode_unit`, `kondisi`, `status`, `deleted_at`) VALUES
(1, 1, 'ELE-KC001', 'baik', 'dipinjam', NULL),
(2, 2, 'ELE-M6001', 'baik', 'tidak_tersedia', '2026-06-02 19:43:19'),
(3, 2, 'ELE-M6002', 'baik', 'tidak_tersedia', '2026-06-02 19:43:19');

-- --------------------------------------------------------

--
-- Table structure for table `detail_peminjaman`
--

CREATE TABLE `detail_peminjaman` (
  `id` int NOT NULL,
  `peminjaman_id` int NOT NULL,
  `alat_unit_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `detail_peminjaman`
--

INSERT INTO `detail_peminjaman` (`id`, `peminjaman_id`, `alat_unit_id`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id` int NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `kode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id`, `nama`, `deskripsi`, `deleted_at`, `kode`) VALUES
(1, 'Elektronik', 'Alat elektronik', NULL, 'ELE'),
(2, 'Perkakas', 'Alat perkakas', NULL, 'PER'),
(3, 'Rumah Tangga', 'Membantu rumah tangga', NULL, 'RUM');

-- --------------------------------------------------------

--
-- Table structure for table `log_aktivitas`
--

CREATE TABLE `log_aktivitas` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `aksi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `waktu` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `log_aktivitas`
--

INSERT INTO `log_aktivitas` (`id`, `user_id`, `aksi`, `keterangan`, `waktu`) VALUES
(1, 1, 'CREATE_USER', 'Membuat user rif', '2026-06-02 19:32:42'),
(2, 1, 'CREATE_USER', 'Membuat user ppp', '2026-06-02 19:33:15'),
(3, 1, 'CREATE_ALAT', 'Membuat alat Kamera Cannon EOS', '2026-06-02 19:33:46'),
(4, 1, 'CREATE_UNIT', 'Menambahkan unit ELE-KC001 : Kamera Cannon EOS', '2026-06-02 19:33:52'),
(5, 1, 'CREATE_USER', 'Membuat user dit', '2026-06-02 19:39:30'),
(6, 1, 'UPDATE_USER', 'Mengupdate user dit', '2026-06-02 19:39:49'),
(7, 1, 'DELETE_USER', 'Menghapus user dit', '2026-06-02 19:39:57'),
(8, 1, 'CREATE_ALAT', 'Membuat alat Monitor 67', '2026-06-02 19:41:29'),
(9, 1, 'CREATE_UNIT', 'Menambahkan unit ELE-M6001 : Monitor 67', '2026-06-02 19:42:15'),
(10, 1, 'CREATE_UNIT', 'Menambahkan unit ELE-M6002 : Monitor 67', '2026-06-02 19:42:48'),
(11, 1, 'UPDATE_UNIT', 'Update unit ELE-M6001 : Monitor 67', '2026-06-02 19:42:51'),
(12, 1, 'UPDATE_UNIT', 'Update unit ELE-M6001 : Monitor 67', '2026-06-02 19:42:58'),
(13, 1, 'DELETE_ALAT', 'Menghapus alat Monitor 67', '2026-06-02 19:43:19'),
(14, 1, 'CREATE_KATEGORI', 'Membuat kategori Rumah Tangga (RUM)', '2026-06-02 19:44:39'),
(15, 2, 'CREATE_PEMINJAMAN', 'Membuat peminjaman #1 (1 unit)', '2026-06-02 19:47:31'),
(16, 3, 'UPDATE_STATUS_PEMINJAMAN', 'Peminjaman #1 diubah ke disetujui', '2026-06-02 19:49:39');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `link` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `link`) VALUES
(1, 3, 'Alat Baru Ditambahkan', 'Admin baru saja menambahkan alat: Kamera Cannon EOS', 'INFO', 0, '2026-06-02 19:33:46', '/petugas/alat/1'),
(2, 2, 'Alat Terbaru Rilis!', 'Ada alat baru yang mungkin Anda butuhkan: Kamera Cannon EOS', 'INFO', 0, '2026-06-02 19:33:46', '/peminjam'),
(3, 3, 'Alat Baru Ditambahkan', 'Admin baru saja menambahkan alat: Monitor 67', 'INFO', 0, '2026-06-02 19:41:29', '/petugas/alat/2'),
(4, 2, 'Alat Terbaru Rilis!', 'Ada alat baru yang mungkin Anda butuhkan: Monitor 67', 'INFO', 0, '2026-06-02 19:41:29', '/peminjam'),
(5, 3, 'Request Peminjaman Baru', 'Rifky mengajukan peminjaman baru (#1)', 'INFO', 1, '2026-06-02 19:47:31', '/petugas/peminjaman/1'),
(6, 2, 'Peminjaman Disetujui ✅', 'Status peminjaman #1 Anda: disetujui, silakan ambil alat.', 'SUCCESS', 0, '2026-06-02 19:49:39', '/peminjam/peminjaman/1'),
(7, 3, 'Request Pengembalian', 'Rifky ingin mengembalikan alat (Pinjaman #1)', 'INFO', 0, '2026-06-02 19:51:56', '/petugas/pengembalian');

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
--

CREATE TABLE `peminjaman` (
  `id` int NOT NULL,
  `peminjam_id` int NOT NULL,
  `petugas_id` int DEFAULT NULL,
  `tanggal_pinjam` date NOT NULL,
  `tanggal_rencana_kembali` date NOT NULL,
  `status` enum('pending','disetujui','menunggu_pengembalian','ditolak','selesai') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `peminjaman`
--

INSERT INTO `peminjaman` (`id`, `peminjam_id`, `petugas_id`, `tanggal_pinjam`, `tanggal_rencana_kembali`, `status`, `created_at`) VALUES
(1, 2, 3, '2026-06-03', '2026-06-04', 'menunggu_pengembalian', '2026-06-02 19:47:31');

-- --------------------------------------------------------

--
-- Table structure for table `pengaturan`
--

CREATE TABLE `pengaturan` (
  `id` int NOT NULL,
  `kunci` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengembalian`
--

CREATE TABLE `pengembalian` (
  `id` int NOT NULL,
  `peminjaman_id` int NOT NULL,
  `petugas_id` int NOT NULL,
  `tanggal_kembali_aktual` date NOT NULL,
  `jumlah_hari_terlambat` int NOT NULL DEFAULT '0',
  `total_denda` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `denda_lunas` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','petugas','peminjam') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'peminjam',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `kelas` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noTelp` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `username`, `password`, `role`, `created_at`, `deleted_at`, `kelas`, `noTelp`) VALUES
(1, 'Super Admin', 'admin', '$2b$10$LlZzCvPm6D9E2t1obiajneoFlkEb/ZeoalYX3hc4HHuldHwAmN1XS', 'admin', '2026-06-02 19:29:53', NULL, NULL, NULL),
(2, 'Rifky', 'rif', '$2b$10$M1M8ThckHtO8lHIkpkINc.0BckhW.ivFAmNHekg2/uTbhZrYipQry', 'peminjam', '2026-06-02 19:32:42', NULL, 'X TKJ', '08997788'),
(3, 'petugas1', 'ppp', '$2b$10$YWZdM72ibLegZm4WMFWifeI7gG.ABeoyE.GYvbhuTMIxWMCS2Tnu.', 'petugas', '2026-06-02 19:33:15', NULL, '', '0899775645'),
(4, 'Dimas', 'dit', '$2b$10$bJAcuBM.QaUoLJRZMlRpz.dlrm5XkdtLbS/GsywT/lNs9LfW7.4oW', 'peminjam', '2026-06-02 19:39:30', '2026-06-02 19:39:57', 'X PPLG', '089977564');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alat`
--
ALTER TABLE `alat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alat_kategori` (`kategori_id`);

--
-- Indexes for table `alat_unit`
--
ALTER TABLE `alat_unit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_unit` (`kode_unit`),
  ADD KEY `fk_unit_alat` (`alat_id`);

--
-- Indexes for table `detail_peminjaman`
--
ALTER TABLE `detail_peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detail_peminjaman` (`peminjaman_id`),
  ADD KEY `fk_detail_unit` (`alat_unit_id`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kategori_nama_key` (`nama`),
  ADD UNIQUE KEY `kode_kategori` (`kode`);

--
-- Indexes for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_log_user` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notification_user` (`user_id`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_peminjaman_peminjam` (`peminjam_id`),
  ADD KEY `fk_peminjaman_petugas` (`petugas_id`);

--
-- Indexes for table `pengaturan`
--
ALTER TABLE `pengaturan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kunci` (`kunci`);

--
-- Indexes for table `pengembalian`
--
ALTER TABLE `pengembalian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `peminjaman_id` (`peminjaman_id`),
  ADD KEY `fk_pengembalian_petugas` (`petugas_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alat`
--
ALTER TABLE `alat`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `alat_unit`
--
ALTER TABLE `alat_unit`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `detail_peminjaman`
--
ALTER TABLE `detail_peminjaman`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pengaturan`
--
ALTER TABLE `pengaturan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pengembalian`
--
ALTER TABLE `pengembalian`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alat`
--
ALTER TABLE `alat`
  ADD CONSTRAINT `fk_alat_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `alat_unit`
--
ALTER TABLE `alat_unit`
  ADD CONSTRAINT `fk_unit_alat` FOREIGN KEY (`alat_id`) REFERENCES `alat` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `detail_peminjaman`
--
ALTER TABLE `detail_peminjaman`
  ADD CONSTRAINT `fk_detail_peminjaman` FOREIGN KEY (`peminjaman_id`) REFERENCES `peminjaman` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_detail_unit` FOREIGN KEY (`alat_unit_id`) REFERENCES `alat_unit` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `fk_peminjaman_peminjam` FOREIGN KEY (`peminjam_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_peminjaman_petugas` FOREIGN KEY (`petugas_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `pengembalian`
--
ALTER TABLE `pengembalian`
  ADD CONSTRAINT `fk_pengembalian_peminjaman` FOREIGN KEY (`peminjaman_id`) REFERENCES `peminjaman` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_pengembalian_petugas` FOREIGN KEY (`petugas_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
