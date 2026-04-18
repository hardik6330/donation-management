/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: turntable.proxy.rlwy.net    Database: railway
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
  `id` char(36) NOT NULL,
  `userId` char(36) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Announcements`
--

LOCK TABLES `Announcements` WRITE;
/*!40000 ALTER TABLE `Announcements` DISABLE KEYS */;
INSERT INTO `Announcements` VALUES
('c49acdee-d95b-42e2-b593-ae89fab2b481','55f01758-2888-43d7-9c91-4dc30ff403e9','7487998866','🌿 ગૌસેવાનો સુવર્ણ અવસર – આપનું સ્વાગત છે 🌿\n\nજય ગૌમાતા 🙏\n\nસુરતના લાસકાણા વિસ્તારમાં એક પવિત્ર શરૂઆત થઈ છે…\nનવી ગૌશાળા, જ્યાં ગૌમાતા ની સેવા એ જ સાચી ભક્તિ છે.\n\nઆ માત્ર એક સ્થળ નથી,\nપણ શ્રદ્ધા, સેવા અને પુણ્યનો સંયોગ છે.\n\nઅહીં આવો…\nગૌમાતાને પોતાના હાથે ચારો નખાવો,\nસ્નેહથી સેવા કરો,\nઅને દાન આપી જીવનને પુણ્યથી સમૃદ્ધ બનાવો.\n\nનાનું પગલું પણ અહીં મહાપૂણ્ય બની જાય છે.\n\n🙏 ગૌસેવામાં જોડાઓ… અને આપના જીવનમાં આશીર્વાદનું સુખ અનુભવો 🙏\n\n– ગૌશાળા પરિવાર\n','general_notificationn','{\"message\": \"🌿 ગૌસેવાનો સુવર્ણ અવસર – આપનું સ્વાગત છે 🌿\\n\\nજય ગૌમાતા 🙏\\n\\nસુરતના લાસકાણા વિસ્તારમાં એક પવિત્ર શરૂઆત થઈ છે…\\nનવી ગૌશાળા, જ્યાં ગૌમાતા ની સેવા એ જ સાચી ભક્તિ છે.\\n\\nઆ માત્ર એક સ્થળ નથી,\\nપણ શ્રદ્ધા, સેવા અને પુણ્યનો સંયોગ છે.\\n\\nઅહીં આવો…\\nગૌમાતાને પોતાના હાથે ચારો નખાવો,\\nસ્નેહથી સેવા કરો,\\nઅને દાન આપી જીવનને પુણ્યથી સમૃદ્ધ બનાવો.\\n\\nનાનું પગલું પણ અહીં મહાપૂણ્ય બની જાય છે.\\n\\n🙏 ગૌસેવામાં જોડાઓ… અને આપના જીવનમાં આશીર્વાદનું સુખ અનુભવો 🙏\\n\\n– ગૌશાળા પરિવાર\\n\"}','sent','whatsapp','2026-04-16 12:17:30','2026-04-16 12:17:30','2026-04-16 12:17:30');
/*!40000 ALTER TABLE `Announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BapuSchedules`
--

DROP TABLE IF EXISTS `BapuSchedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BapuSchedules` (
  `id` char(36) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(255) DEFAULT NULL,
  `locationId` char(36) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES
('2e7a2519-e3ad-48f5-b7bf-7c9c67869a66','Gau Daan','',1,'2026-04-18 06:44:50','2026-04-18 06:44:50'),
('65f0f27d-a99d-4ead-85de-276853c91fa8','Bhumi Daan','',1,'2026-04-18 06:45:03','2026-04-18 06:45:03'),
('f4097e3f-9a2c-4717-91a5-bb19889e8b14','Ann Daan','',1,'2026-04-18 06:45:13','2026-04-18 06:45:13');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DonationInstallments`
--

DROP TABLE IF EXISTS `DonationInstallments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DonationInstallments` (
  `id` char(36) NOT NULL,
  `donationId` char(36) NOT NULL,
  `amount` float NOT NULL,
  `paymentMode` enum('online','cash','cheque','partially_paid') NOT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `donationId` (`donationId`),
  CONSTRAINT `DonationInstallments_ibfk_1` FOREIGN KEY (`donationId`) REFERENCES `Donations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `amount` float NOT NULL,
  `cause` varchar(255) NOT NULL,
  `status` enum('pending','completed','failed','partially_paid','pay_later') DEFAULT 'pending',
  `paymentMode` enum('online','cash','cheque') NOT NULL DEFAULT 'online',
  `paidAmount` float DEFAULT NULL,
  `remainingAmount` float DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `locationId` char(36) DEFAULT NULL,
  `categoryId` char(36) DEFAULT NULL,
  `gaushalaId` char(36) DEFAULT NULL,
  `kathaId` char(36) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `referenceName` varchar(255) DEFAULT NULL,
  `slipUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `donorId` char(36) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Donations`
--

LOCK TABLES `Donations` WRITE;
/*!40000 ALTER TABLE `Donations` DISABLE KEYS */;
INSERT INTO `Donations` VALUES
('583fee0a-2c25-430f-a0e4-36054e6578be',5000,'Shree Mad Bhagwat Gau Katha ( Sakariya Parivar ) માટે Surat માંથી Darshit Gabani એ દાન આપ્યું','pay_later','cash',NULL,NULL,NULL,NULL,NULL,NULL,'2e7a2519-e3ad-48f5-b7bf-7c9c67869a66',NULL,'9634e5b5-2eed-4769-905e-9e096d9f8fd3',NULL,'1',NULL,'2026-04-18 10:04:39','2026-04-18 10:04:39','4684f41c-6445-43e4-b432-a3eb74f2cec5');
/*!40000 ALTER TABLE `Donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Expenses`
--

DROP TABLE IF EXISTS `Expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Expenses` (
  `id` char(36) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` enum('Food','Medicine','Maintenance','Salary','Utility','Other') NOT NULL DEFAULT 'Other',
  `description` text,
  `gaushalaId` char(36) DEFAULT NULL,
  `kathaId` char(36) DEFAULT NULL,
  `paymentMode` enum('cash','online','check') DEFAULT 'cash',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `gaushalaId` (`gaushalaId`),
  KEY `kathaId` (`kathaId`),
  CONSTRAINT `Expenses_ibfk_1` FOREIGN KEY (`gaushalaId`) REFERENCES `Gaushalas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Expenses_ibfk_2` FOREIGN KEY (`kathaId`) REFERENCES `Kathas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `locationId` char(36) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_gaushala_name` (`name`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `Gaushalas_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Gaushalas`
--

LOCK TABLES `Gaushalas` WRITE;
/*!40000 ALTER TABLE `Gaushalas` DISABLE KEYS */;
INSERT INTO `Gaushalas` VALUES
('01e2e287-0d56-49ad-93a6-a1fc3037fe3d','Shree Sarveshwar Gau Dham Mahatirth Rampar','1dd1976e-e107-4abe-aa5d-40d9d61e58a6',1,'2026-04-18 06:47:40','2026-04-18 06:47:40'),
('161e871f-77f4-4e0b-b4be-40a4cc3172cf','Shree Sarveshwar Gau Dham Kobdi','acdc7834-d851-483e-82d1-8109d20ff5f4',1,'2026-04-18 06:46:13','2026-04-18 06:46:13');
/*!40000 ALTER TABLE `Gaushalas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KartalDhuns`
--

DROP TABLE IF EXISTS `KartalDhuns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `KartalDhuns` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `locationId` char(36) DEFAULT NULL,
  `description` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `KartalDhuns_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `locationId` char(36) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `status` enum('upcoming','active','completed') DEFAULT 'upcoming',
  `description` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationId` (`locationId`),
  CONSTRAINT `Kathas_ibfk_1` FOREIGN KEY (`locationId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Kathas`
--

LOCK TABLES `Kathas` WRITE;
/*!40000 ALTER TABLE `Kathas` DISABLE KEYS */;
INSERT INTO `Kathas` VALUES
('9634e5b5-2eed-4769-905e-9e096d9f8fd3','Shree Mad Bhagwat Gau Katha ( Sakariya Parivar )','8e98cf89-6a7b-4540-adac-0c73e528b551','2026-04-19','2026-04-26','upcoming','','2026-04-18 10:01:13','2026-04-18 10:01:13');
/*!40000 ALTER TABLE `Kathas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Locations`
--

DROP TABLE IF EXISTS `Locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Locations` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('country','state','city') NOT NULL,
  `parentId` char(36) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_location_per_parent` (`name`,`type`,`parentId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `Locations_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `Locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Locations`
--

LOCK TABLES `Locations` WRITE;
/*!40000 ALTER TABLE `Locations` DISABLE KEYS */;
INSERT INTO `Locations` VALUES
('083fe633-75f2-4e90-90e2-e9f906a69f44','GUJARAT','state','8843bb4a-c1a0-46eb-a736-00cd3953d34e','2026-04-18 06:43:51','2026-04-18 06:43:51'),
('1dd1976e-e107-4abe-aa5d-40d9d61e58a6','RAMPAR','city','083fe633-75f2-4e90-90e2-e9f906a69f44','2026-04-18 06:44:15','2026-04-18 06:44:15'),
('45d5d4de-6585-4e08-91fd-cb183afab84e','GUJRAT','state','8843bb4a-c1a0-46eb-a736-00cd3953d34e','2026-04-16 10:50:45','2026-04-16 10:50:45'),
('8843bb4a-c1a0-46eb-a736-00cd3953d34e','INDIA','country',NULL,'2026-04-16 10:50:44','2026-04-16 10:50:44'),
('8e98cf89-6a7b-4540-adac-0c73e528b551','SURAT','city','083fe633-75f2-4e90-90e2-e9f906a69f44','2026-04-18 06:44:36','2026-04-18 06:44:36'),
('acdc7834-d851-483e-82d1-8109d20ff5f4','KOBDI','city','083fe633-75f2-4e90-90e2-e9f906a69f44','2026-04-18 06:43:52','2026-04-18 06:43:52');
/*!40000 ALTER TABLE `Locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MandalMembers`
--

DROP TABLE IF EXISTS `MandalMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MandalMembers` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `city` varchar(255) DEFAULT NULL,
  `mandalId` char(36) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mandal_member_mobile` (`mobileNumber`),
  KEY `mandalId` (`mandalId`),
  CONSTRAINT `MandalMembers_ibfk_1` FOREIGN KEY (`mandalId`) REFERENCES `Mandals` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `memberId` char(36) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int NOT NULL DEFAULT '100',
  `mandalType` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `userId` char(36) NOT NULL,
  `donationId` char(36) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `permissions` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES
('13212b94-6e32-4eb5-8c97-fb784941e29f','Manager','{\"dashboard\":\"full\",\"donations\":\"full\",\"donors\":\"full\",\"expenses\":\"full\",\"sevaks\":\"full\",\"gaushala\":\"full\",\"katha\":\"full\",\"mandal\":\"full\",\"kartalDhun\":\"full\",\"bapuSchedule\":\"full\",\"category\":\"full\",\"location\":\"full\",\"users\":\"view\"}','Manage all modules, view users','2026-04-16 10:49:02','2026-04-16 10:49:02'),
('3c7cc69c-0e06-4e77-9982-2c084a28291e','Admin','{\"dashboard\":\"full\",\"donations\":\"full\",\"donors\":\"full\",\"expenses\":\"full\",\"sevaks\":\"full\",\"gaushala\":\"full\",\"katha\":\"full\",\"mandal\":\"full\",\"kartalDhun\":\"full\",\"bapuSchedule\":\"full\",\"category\":\"full\",\"location\":\"full\",\"users\":\"full\"}','Full access to all modules','2026-04-16 10:49:02','2026-04-16 10:49:02'),
('5418f488-cefd-4d10-8819-810fa44d102e','Entry Operator','{\"dashboard\":\"view\",\"donations\":\"entry\",\"donors\":\"view\",\"expenses\":\"entry\",\"sevaks\":\"entry\",\"gaushala\":\"entry\",\"katha\":\"entry\",\"mandal\":\"entry\",\"kartalDhun\":\"entry\",\"bapuSchedule\":\"entry\",\"category\":\"none\",\"location\":\"none\",\"users\":\"none\"}','Data entry with limited access','2026-04-16 10:49:02','2026-04-16 10:49:02');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sevaks`
--

DROP TABLE IF EXISTS `Sevaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sevaks` (
  `id` char(36) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `roleId` char(36) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  `created_by` varchar(255) DEFAULT 'System',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_mobile_unique` (`mobileNumber`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES
('4684f41c-6445-43e4-b432-a3eb74f2cec5','Darshit Gabani',NULL,'9727178000','8002fa08ac9afcd4','','SURAT','GUJARAT','INDIA','',NULL,0,'System','2026-04-18 10:04:39','2026-04-18 10:04:39'),
('74d89d33-272a-4877-af65-8d31f20f46c2','Super Admin','admin@example.com','9876543210','$2b$10$mqqKSFJ0MtSIxcnv/ha7BOXtk.dabQIMZBMu2uKEle0eTNQRw1N5G',NULL,NULL,NULL,NULL,NULL,'3c7cc69c-0e06-4e77-9982-2c084a28291e',1,'System','2026-04-16 10:49:03','2026-04-16 10:49:03');
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

-- Dump completed on 2026-04-18 17:17:43
