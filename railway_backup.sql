/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: shortline.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Announcements`
--

DROP TABLE IF EXISTS `Announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Announcements` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `message` text,
  `templateName` varchar(255) DEFAULT NULL,
  `variables` json DEFAULT NULL,
  `status` enum('sent','delivered','read','failed') DEFAULT 'sent',
  `type` varchar(255) DEFAULT 'whatsapp',
  `sentAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_user_id` (`userId`),
  KEY `announcements_mobile_number` (`mobileNumber`),
  KEY `announcements_status` (`status`),
  KEY `announcements_sent_at` (`sentAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Announcements`
--

LOCK TABLES `Announcements` WRITE;
/*!40000 ALTER TABLE `Announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `Announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BapuSchedules`
--

DROP TABLE IF EXISTS `BapuSchedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BapuSchedules` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `date` date NOT NULL,
  `time` varchar(255) DEFAULT NULL,
  `locationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `eventType` enum('Padhramani','Katha','Event','Personal') DEFAULT 'Event',
  `contactPerson` varchar(255) DEFAULT NULL,
  `mobileNumber` varchar(255) DEFAULT NULL,
  `description` text,
  `amount` float DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `BapuSchedules_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BapuSchedules`
--

LOCK TABLES `BapuSchedules` WRITE;
/*!40000 ALTER TABLE `BapuSchedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `BapuSchedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES
('15db27e7-b3ae-4100-a146-e0f03208a073','Ann Daan','',1,'2026-04-23 06:54:46','2026-04-23 06:54:46'),
('3dead1a0-e59b-4262-9d03-7ade1cbc6036','Suki Kadab','',1,'2026-04-23 06:55:02','2026-04-23 06:55:02'),
('5547a31a-e4c6-4fdb-9974-4de4711b7fa4','Gau Daan','',1,'2026-04-23 06:54:18','2026-04-23 06:54:18'),
('7b46461e-4e71-4468-b28c-0e6057736902','Lili Kadab','',1,'2026-04-23 06:55:14','2026-04-23 06:55:14'),
('9489d948-9a08-41f9-a576-b8da724d302a','Suko Ghas Charo','',1,'2026-04-23 06:56:08','2026-04-23 06:56:08'),
('ab44d811-f731-498a-8195-175a57ecf1ec','Bhumi Daan','',1,'2026-04-23 06:54:28','2026-04-23 06:54:28'),
('d09b4e7c-b3e0-48cb-9fc0-27550b5cec61','Lilo Ghas Charo','',1,'2026-04-23 06:55:59','2026-04-23 06:55:59'),
('d58409c2-c465-4e5f-9db1-97fdee8bfada','Kadab','',1,'2026-04-23 06:55:46','2026-04-23 06:55:46'),
('dbbae196-b2fd-4a6f-80fb-3281dde2fad7','Ghas Charo','',1,'2026-04-23 06:55:29','2026-04-23 06:55:29');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DonationInstallments`
--

DROP TABLE IF EXISTS `DonationInstallments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DonationInstallments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `donationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` float NOT NULL,
  `paymentMode` enum('online','cash','cheque') NOT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `donationId` (`donationId`),
  CONSTRAINT `DonationInstallments_ibfk_1` FOREIGN KEY (`donationId`) REFERENCES `Donations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DonationInstallments`
--

LOCK TABLES `DonationInstallments` WRITE;
/*!40000 ALTER TABLE `DonationInstallments` DISABLE KEYS */;
/*!40000 ALTER TABLE `DonationInstallments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Donations`
--

DROP TABLE IF EXISTS `Donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Donations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` float NOT NULL,
  `cause` varchar(255) NOT NULL,
  `status` enum('pending','completed','failed','partially_paid','pay_later') DEFAULT 'pending',
  `paymentMode` enum('online','cash','cheque') NOT NULL DEFAULT 'online',
  `paidAmount` float DEFAULT NULL,
  `remainingAmount` float DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `locationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `categoryId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `gaushalaId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `kathaId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `referenceName` varchar(255) DEFAULT NULL,
  `slipUrl` varchar(255) DEFAULT NULL,
  `slipNo` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `donorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  KEY `categoryId` (`categoryId`),
  KEY `gaushalaId` (`gaushalaId`),
  KEY `kathaId` (`kathaId`),
  KEY `donorId` (`donorId`),
  CONSTRAINT `Donations_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Donations_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Donations_ibfk_3` FOREIGN KEY (`gaushalaId`) REFERENCES `Gaushalas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Donations_ibfk_4` FOREIGN KEY (`kathaId`) REFERENCES `Kathas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Donations_ibfk_5` FOREIGN KEY (`donorId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Donations`
--

LOCK TABLES `Donations` WRITE;
/*!40000 ALTER TABLE `Donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `Donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Expenses`
--

DROP TABLE IF EXISTS `Expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Expenses` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` enum('Food','Medicine','Maintenance','Salary','Utility','Other') NOT NULL DEFAULT 'Other',
  `description` text,
  `gaushalaId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `kathaId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `paymentMode` enum('cash','online','check') DEFAULT 'cash',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `gaushalaId` (`gaushalaId`),
  KEY `kathaId` (`kathaId`),
  CONSTRAINT `Expenses_ibfk_1` FOREIGN KEY (`gaushalaId`) REFERENCES `Gaushalas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Expenses_ibfk_2` FOREIGN KEY (`kathaId`) REFERENCES `Kathas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Expenses`
--

LOCK TABLES `Expenses` WRITE;
/*!40000 ALTER TABLE `Expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `Expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Gaushalas`
--

DROP TABLE IF EXISTS `Gaushalas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Gaushalas` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `locationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_gaushala_name` (`name`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `Gaushalas_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Gaushalas`
--

LOCK TABLES `Gaushalas` WRITE;
/*!40000 ALTER TABLE `Gaushalas` DISABLE KEYS */;
INSERT INTO `Gaushalas` VALUES
('5643ef26-c9d9-4167-90aa-f1d6b6bfab35','Shree Sarveshwar Gaudham Kobdi','63e3c7dd-bd78-4537-9657-bfbe7a5c3070',1,'2026-04-23 07:02:28','2026-04-23 07:03:38'),
('f27ec31b-c434-4d10-a8a7-91471dd117b7','Shree Sarveshwar Gaudham Mahatirth','9812a159-05c9-4806-b1b3-065364dbadfa',1,'2026-04-23 07:03:20','2026-04-23 07:03:20');
/*!40000 ALTER TABLE `Gaushalas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Incomes`
--

DROP TABLE IF EXISTS `Incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Incomes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Incomes`
--

LOCK TABLES `Incomes` WRITE;
/*!40000 ALTER TABLE `Incomes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Incomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KartalDhuns`
--

DROP TABLE IF EXISTS `KartalDhuns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `KartalDhuns` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `locationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `description` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `KartalDhuns_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KartalDhuns`
--

LOCK TABLES `KartalDhuns` WRITE;
/*!40000 ALTER TABLE `KartalDhuns` DISABLE KEYS */;
/*!40000 ALTER TABLE `KartalDhuns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Kathas`
--

DROP TABLE IF EXISTS `Kathas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Kathas` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `locationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `status` enum('upcoming','active','completed') DEFAULT 'upcoming',
  `description` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `Kathas_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Kathas`
--

LOCK TABLES `Kathas` WRITE;
/*!40000 ALTER TABLE `Kathas` DISABLE KEYS */;
INSERT INTO `Kathas` VALUES
('5061e4e8-92ca-4288-9777-874e6306830c','Shree Mad Bhagwat Gau Katha ( Sakariya Parivar )','5e540887-4aef-4d1e-960f-9979ddccd684','2026-04-19','2026-04-26','active','','2026-04-23 07:01:42','2026-04-23 07:01:42');
/*!40000 ALTER TABLE `Kathas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Locations`
--

DROP TABLE IF EXISTS `Locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Locations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('country','state','city') NOT NULL,
  `parentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_location_per_parent` (`name`,`type`,`parentId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `Locations_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Locations`
--

LOCK TABLES `Locations` WRITE;
/*!40000 ALTER TABLE `Locations` DISABLE KEYS */;
INSERT INTO `Locations` VALUES
('1178a9a4-b7c6-4428-9e4f-f998028e3ba9','DELHI','state','da42df5b-7d47-4e77-ad3f-49820a37c43d','2026-04-23 06:58:23','2026-04-23 06:58:23'),
('5583d3cb-667d-4cf4-b33e-72502763aa9d','BHAVNAGAR','city','5e769361-6cfe-44aa-9713-1c1369e695a5','2026-04-23 06:56:44','2026-04-23 06:56:44'),
('5e540887-4aef-4d1e-960f-9979ddccd684','SURAT','city','5e769361-6cfe-44aa-9713-1c1369e695a5','2026-04-23 06:56:29','2026-04-23 06:56:29'),
('5e769361-6cfe-44aa-9713-1c1369e695a5','GUJARAT','state','da42df5b-7d47-4e77-ad3f-49820a37c43d','2026-04-23 06:56:29','2026-04-23 06:56:29'),
('63e3c7dd-bd78-4537-9657-bfbe7a5c3070','KOBDI','city','5e769361-6cfe-44aa-9713-1c1369e695a5','2026-04-23 06:57:03','2026-04-23 06:57:03'),
('7cb6d876-c03a-43f3-9e12-1bc634e9d06d','DELHI','city','1178a9a4-b7c6-4428-9e4f-f998028e3ba9','2026-04-23 06:58:23','2026-04-23 06:58:23'),
('9812a159-05c9-4806-b1b3-065364dbadfa','RAMPAR','city','5e769361-6cfe-44aa-9713-1c1369e695a5','2026-04-23 06:57:22','2026-04-23 06:57:22'),
('a46f99f4-d182-4f5e-a9d7-58d19ce4cbee','MAHARASHTRA','state','da42df5b-7d47-4e77-ad3f-49820a37c43d','2026-04-23 06:57:48','2026-04-23 06:57:48'),
('da42df5b-7d47-4e77-ad3f-49820a37c43d','INDIA','country',NULL,'2026-04-23 06:56:28','2026-04-23 06:56:28'),
('ddc2d01a-5ac8-4b1a-a0d0-701435ca9e6e','MUMBAI','city','a46f99f4-d182-4f5e-a9d7-58d19ce4cbee','2026-04-23 06:57:49','2026-04-23 06:57:49');
/*!40000 ALTER TABLE `Locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MandalMembers`
--

DROP TABLE IF EXISTS `MandalMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MandalMembers` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `city` varchar(255) DEFAULT NULL,
  `mandalId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mandal_member_mobile` (`mobileNumber`),
  KEY `mandalId` (`mandalId`),
  CONSTRAINT `MandalMembers_ibfk_1` FOREIGN KEY (`mandalId`) REFERENCES `Mandals` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MandalMembers`
--

LOCK TABLES `MandalMembers` WRITE;
/*!40000 ALTER TABLE `MandalMembers` DISABLE KEYS */;
/*!40000 ALTER TABLE `MandalMembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MandalPayments`
--

DROP TABLE IF EXISTS `MandalPayments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MandalPayments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `memberId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `month` varchar(7) NOT NULL,
  `amount` int DEFAULT '100',
  `status` enum('paid','unpaid') DEFAULT 'unpaid',
  `paidDate` date DEFAULT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mandal_payments_member_id_month` (`memberId`,`month`),
  CONSTRAINT `MandalPayments_ibfk_1` FOREIGN KEY (`memberId`) REFERENCES `MandalMembers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MandalPayments`
--

LOCK TABLES `MandalPayments` WRITE;
/*!40000 ALTER TABLE `MandalPayments` DISABLE KEYS */;
/*!40000 ALTER TABLE `MandalPayments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Mandals`
--

DROP TABLE IF EXISTS `Mandals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mandals` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int NOT NULL DEFAULT '100',
  `mandalType` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mandals`
--

LOCK TABLES `Mandals` WRITE;
/*!40000 ALTER TABLE `Mandals` DISABLE KEYS */;
/*!40000 ALTER TABLE `Mandals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `donationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(255) DEFAULT 'partial_payment_reminder',
  `status` enum('pending','sent','failed','cancelled') DEFAULT 'pending',
  `attempts` int DEFAULT '0',
  `lastError` text,
  `scheduledAt` datetime NOT NULL,
  `sentAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_status` (`status`),
  KEY `notifications_scheduled_at` (`scheduledAt`),
  KEY `notifications_user_id` (`userId`),
  KEY `notifications_donation_id` (`donationId`),
  CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notifications_ibfk_2` FOREIGN KEY (`donationId`) REFERENCES `Donations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `permissions` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES
('7eb59e11-e331-4c3f-9a78-76cedf0de9fa','Admin','{\"dashboard\":\"full\",\"donations\":\"full\",\"donors\":\"full\",\"announcement\":\"full\",\"expenses\":\"full\",\"income\":\"full\",\"sevaks\":\"full\",\"gaushala\":\"full\",\"katha\":\"full\",\"mandal\":\"full\",\"kartalDhun\":\"full\",\"bapuSchedule\":\"full\",\"category\":\"full\",\"location\":\"full\",\"users\":\"full\"}','Full access to all modules','2026-04-23 06:26:20','2026-04-23 06:26:20'),
('b31850ea-5105-48d0-a131-6e3c11f4a7d8','Entry Operator','{\"dashboard\":\"view\",\"donations\":\"entry\",\"donors\":\"view\",\"announcement\":\"entry\",\"expenses\":\"entry\",\"income\":\"entry\",\"sevaks\":\"entry\",\"gaushala\":\"entry\",\"katha\":\"entry\",\"mandal\":\"entry\",\"kartalDhun\":\"entry\",\"bapuSchedule\":\"entry\",\"category\":\"none\",\"location\":\"none\",\"users\":\"none\"}','Data entry with limited access','2026-04-23 06:26:20','2026-04-23 06:26:20'),
('ff447c0d-8c47-470b-bf37-5563c0c2a7f4','Manager','{\"dashboard\":\"full\",\"donations\":\"full\",\"donors\":\"full\",\"announcement\":\"full\",\"expenses\":\"full\",\"income\":\"full\",\"sevaks\":\"full\",\"gaushala\":\"full\",\"katha\":\"full\",\"mandal\":\"full\",\"kartalDhun\":\"full\",\"bapuSchedule\":\"full\",\"category\":\"full\",\"location\":\"full\",\"users\":\"view\"}','Manage all modules, view users','2026-04-23 06:26:20','2026-04-23 06:26:20');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sevaks`
--

DROP TABLE IF EXISTS `Sevaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sevaks` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT 'India',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sevak_mobile` (`mobileNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sevaks`
--

LOCK TABLES `Sevaks` WRITE;
/*!40000 ALTER TABLE `Sevaks` DISABLE KEYS */;
/*!40000 ALTER TABLE `Sevaks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `roleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  `created_by` varchar(255) DEFAULT 'System',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_mobile_unique` (`mobileNumber`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES
('2c0ee7d7-040e-404d-bee8-fe39a43a2da9','Super Admin','shreesarveshwargaudham.org@gmail.com','9979778000','$2b$10$MzqKlxo21x8C0Wn.qexyYeD6XImWOGnXtDDWM80w9w4Z7/fasG0EC',NULL,NULL,NULL,NULL,NULL,'7eb59e11-e331-4c3f-9a78-76cedf0de9fa',1,'System','2026-04-23 06:40:49','2026-04-23 06:46:34'),
('4b9e1bf2-c0f1-4583-b700-7fafd49a8990','Bharat Kukadiya','bharatkukadiya@gmail.com','9824927387','$2b$10$fnD8SQ0CsdkqgR1SPYLksOVxeOnAC1ZriiIUZ5EiekwUKKWUIY0VK',NULL,NULL,NULL,NULL,NULL,'ff447c0d-8c47-470b-bf37-5563c0c2a7f4',1,'2c0ee7d7-040e-404d-bee8-fe39a43a2da9','2026-04-23 06:51:07','2026-04-23 06:51:07'),
('9b3b0b2d-da82-464a-af57-8cdecdade4d1','Darshit Gabani','darshitgabani00@gmail.com','9727178000','$2b$10$VOGm4HJp4y9SowLyQcIRzu3hoR4tWdHa1y2hjQwwilWo3QAB2T8b2',NULL,NULL,NULL,NULL,NULL,'7eb59e11-e331-4c3f-9a78-76cedf0de9fa',1,'2c0ee7d7-040e-404d-bee8-fe39a43a2da9','2026-04-23 06:52:18','2026-04-23 06:52:18');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-23 12:55:43
