-- Create a new user
CREATE USER 'user'@'%' IDENTIFIED BY '1234567890';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON inventoryService.* TO 'user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 29, 2023 at 03:22 PM
-- Server version: 8.0.32-0ubuntu0.22.04.2
-- PHP Version: 8.1.2-1ubuntu2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventoryService`
--
CREATE DATABASE IF NOT EXISTS `inventoryService` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `inventoryService`;

-- --------------------------------------------------------

--
-- Table structure for table `CountExecution`
--

CREATE TABLE `CountExecution` (
  `id` int UNSIGNED NOT NULL,
  `count_plan_id` int UNSIGNED NOT NULL,
  `status` enum('ongoing','ended') CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `dateStarted` timestamp NULL DEFAULT NULL,
  `dateEnded` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CountPlan`
--

CREATE TABLE `CountPlan` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner_id` int UNSIGNED DEFAULT NULL,
  `repetition_type` enum('weekly','monthly','interval') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `repetition_interval` int DEFAULT NULL,
  `day_of_week` enum('0','1','2','3','4','5','6') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `start_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CountPlanSubscribers`
--

CREATE TABLE `CountPlanSubscribers` (
  `id` int UNSIGNED NOT NULL,
  `count_plan_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Product`
--

CREATE TABLE `Product` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` int UNSIGNED NOT NULL COMMENT 'Price in cents'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ProductCategories`
--

CREATE TABLE `ProductCategories` (
  `id` int UNSIGNED NOT NULL,
  `title` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ProductCategories`
--

INSERT INTO `ProductCategories` (`id`, `title`) VALUES
(1, 'Food'),
(2, 'Furniture');

-- --------------------------------------------------------

--
-- Table structure for table `Product_Has_Categories`
--

CREATE TABLE `Product_Has_Categories` (
  `id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `category_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Product_Has_SubProduct`
--

CREATE TABLE `Product_Has_SubProduct` (
  `id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `subproduct_id` int UNSIGNED NOT NULL,
  `quantity` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubProduct`
--

CREATE TABLE `SubProduct` (
  `id` int UNSIGNED NOT NULL,
  `title` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubProductBarcodes`
--

CREATE TABLE `SubProductBarcodes` (
  `id` varchar(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `subproduct_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserProductCounts`
--

CREATE TABLE `UserProductCounts` (
  `id` int UNSIGNED NOT NULL,
  `count_execution_id` int UNSIGNED NOT NULL,
  `subproduct_id` int UNSIGNED NOT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('admin','counter') CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'counter'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `username`, `type`) VALUES
(1, 'admin', 'admin'),
(2, 'counter 1', 'counter'),
(3, 'counter 2', 'counter');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CountExecution`
--
ALTER TABLE `CountExecution`
  ADD PRIMARY KEY (`id`),
  ADD KEY `count_plan_id` (`count_plan_id`);

--
-- Indexes for table `CountPlan`
--
ALTER TABLE `CountPlan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `CountPlanSubscribers`
--
ALTER TABLE `CountPlanSubscribers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `count_plan_id` (`count_plan_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `ProductCategories`
--
ALTER TABLE `ProductCategories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Product_Has_Categories`
--
ALTER TABLE `Product_Has_Categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_id_2` (`product_id`,`category_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `Product_Has_SubProduct`
--
ALTER TABLE `Product_Has_SubProduct`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_id_2` (`product_id`,`subproduct_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `subproduct_id` (`subproduct_id`);

--
-- Indexes for table `SubProduct`
--
ALTER TABLE `SubProduct`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `SubProductBarcodes`
--
ALTER TABLE `SubProductBarcodes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`,`subproduct_id`),
  ADD KEY `subproduct_id` (`subproduct_id`);

--
-- Indexes for table `UserProductCounts`
--
ALTER TABLE `UserProductCounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `count_execution_id` (`count_execution_id`),
  ADD KEY `subproduct_id` (`subproduct_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CountExecution`
--
ALTER TABLE `CountExecution`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `CountPlan`
--
ALTER TABLE `CountPlan`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `CountPlanSubscribers`
--
ALTER TABLE `CountPlanSubscribers`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Product`
--
ALTER TABLE `Product`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ProductCategories`
--
ALTER TABLE `ProductCategories`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Product_Has_Categories`
--
ALTER TABLE `Product_Has_Categories`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Product_Has_SubProduct`
--
ALTER TABLE `Product_Has_SubProduct`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SubProduct`
--
ALTER TABLE `SubProduct`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserProductCounts`
--
ALTER TABLE `UserProductCounts`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `CountExecution`
--
ALTER TABLE `CountExecution`
  ADD CONSTRAINT `CountExecution_ibfk_1` FOREIGN KEY (`count_plan_id`) REFERENCES `CountPlan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `CountPlan`
--
ALTER TABLE `CountPlan`
  ADD CONSTRAINT `CountPlan_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `CountPlanSubscribers`
--
ALTER TABLE `CountPlanSubscribers`
  ADD CONSTRAINT `CountPlanSubscribers_ibfk_1` FOREIGN KEY (`count_plan_id`) REFERENCES `CountPlan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CountPlanSubscribers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `CountPlanSubscribers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Product_Has_Categories`
--
ALTER TABLE `Product_Has_Categories`
  ADD CONSTRAINT `Product_Has_Categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_Has_Categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `ProductCategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Product_Has_SubProduct`
--
ALTER TABLE `Product_Has_SubProduct`
  ADD CONSTRAINT `Product_Has_SubProduct_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_Has_SubProduct_ibfk_2` FOREIGN KEY (`subproduct_id`) REFERENCES `SubProduct` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `SubProductBarcodes`
--
ALTER TABLE `SubProductBarcodes`
  ADD CONSTRAINT `SubProductBarcodes_ibfk_1` FOREIGN KEY (`subproduct_id`) REFERENCES `SubProduct` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserProductCounts`
--
ALTER TABLE `UserProductCounts`
  ADD CONSTRAINT `UserProductCounts_ibfk_1` FOREIGN KEY (`count_execution_id`) REFERENCES `CountExecution` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `UserProductCounts_ibfk_2` FOREIGN KEY (`subproduct_id`) REFERENCES `SubProduct` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `UserProductCounts_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;