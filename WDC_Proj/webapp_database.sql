-- MySQL dump 10.13  Distrib 8.3.0, for macos13.6 (x86_64)
--
-- Host: localhost    Database: wdc_webapp_prototype
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Drop the database if it already exists
DROP DATABASE IF EXISTS webapp_database;

-- Create the new database
CREATE DATABASE webapp_database;

-- Use the new database
USE webapp_database;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_id` int unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` int unsigned NOT NULL,
  `event_title` varchar(100) NOT NULL,
  `description` mediumtext,
  `date` datetime NOT NULL,
  `location` varchar(200) NOT NULL,
  `post_date` datetime NOT NULL,
  `members_only` int unsigned DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `event_id_UNIQUE` (`event_id`) /*!80000 INVISIBLE */,
  KEY `events_org` (`organization_id`),
  CONSTRAINT `events_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` (`event_id`, `organization_id`, `event_title`, `description`, `date`, `location`, `post_date`, `members_only`) VALUES
(1, 1, 'Tech Conference 2024', 'Annual technology conference', '2024-08-15 09:00:00', 'Tech Center', '2024-06-10 12:03:56', 0),
(2, 2, 'Health Fair', 'Community health fair', '2024-07-10 10:00:00', 'City Park', '2024-06-10 12:03:56', 1),
(3, 3, 'Eco Summit', 'Environmental sustainability summit', '2024-09-20 11:00:00', 'Green Hall', '2024-06-10 12:03:56', 0),
(4, 4, 'EduTech Expo', 'Educational technology exhibition', '2024-06-30 12:00:00', 'Expo Center', '2024-06-10 12:03:56', 1),
(5, 5, 'Food Festival', 'Annual food festival', '2024-10-05 13:00:00', 'Downtown', '2024-06-10 12:03:56', 0),
(6, 1, 'AI Workshop', 'Hands-on AI workshop', '2024-11-10 09:00:00', 'Tech Center', '2024-06-10 12:03:56', 1),
(7, 2, 'Mental Health Awareness', 'Discussion on mental health', '2024-12-05 10:00:00', 'Community Center', '2024-06-10 12:03:56', 1),
(8, 3, 'Green Energy Forum', 'Forum on green energy solutions', '2024-10-15 11:00:00', 'Eco Center', '2024-06-10 12:03:56', 0),
(9, 4, 'Online Education Webinar', 'Webinar on online education trends', '2024-07-20 12:00:00', 'Virtual Event', '2024-06-10 12:03:56', 0),
(10, 5, 'Gourmet Cooking Class', 'Interactive cooking class with a top chef', '2024-08-25 13:00:00', 'Cooking Studio', '2024-06-10 12:03:56', 1),
(11, 1, 'Blockchain Seminar', 'Understanding blockchain technology', '2024-09-10 09:00:00', 'Tech Hub', '2024-06-10 12:03:56', 0),
(12, 2, 'Wellness Retreat', 'Weekend wellness retreat', '2024-10-20 10:00:00', 'Retreat Center', '2024-06-10 12:03:56', 1),
(13, 3, 'Recycling Workshop', 'How to recycle effectively', '2024-11-15 11:00:00', 'Community Hall', '2024-06-10 12:03:56', 0),
(14, 4, 'Tech for Education', 'Innovative technology in education', '2024-12-01 12:00:00', 'EduTech HQ', '2024-06-10 12:03:56', 1),
(15, 5, 'Food Truck Rally', 'Gathering of the best food trucks', '2024-09-05 13:00:00', 'Main Square', '2024-06-10 12:03:56', 0),
(16, 1, 'Robotics Expo', 'Exhibition of latest robotics', '2024-07-25 09:00:00', 'Innovation Center', '2024-06-10 12:03:56', 0),
(17, 2, 'Fitness Bootcamp', 'Intensive fitness training session', '2024-08-30 10:00:00', 'Sports Complex', '2024-06-10 12:03:56', 1),
(18, 3, 'Clean Air Campaign', 'Campaign for clean air initiatives', '2024-09-25 11:00:00', 'City Hall', '2024-06-10 12:03:56', 0),
(19, 4, 'Coding Marathon', '24-hour coding challenge', '2024-10-10 12:00:00', 'Tech Lab', '2024-06-10 12:03:56', 1),
(20, 5, 'Wine Tasting Event', 'Wine tasting with local wineries', '2024-11-20 13:00:00', 'Vineyard', '2024-06-10 12:03:56', 1);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager_organization`
--

DROP TABLE IF EXISTS `manager_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_organization` (
  `user_id` int unsigned NOT NULL,
  `organization_id` int unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`organization_id`),
  KEY `man_org_org_idx` (`organization_id`),
  CONSTRAINT `man_org_man` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `man_org_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_organization`
--

LOCK TABLES `manager_organization` WRITE;
/*!40000 ALTER TABLE `manager_organization` DISABLE KEYS */;
INSERT INTO `manager_organization` VALUES (1,1),(3,2),(5,3),(7,4),(9,5);
/*!40000 ALTER TABLE `manager_organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `organization_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `organization_image` mediumblob,
  `body0` mediumtext,
  `email` varchar(320) DEFAULT NULL,
  `social_link0` varchar(255) DEFAULT NULL,
  `social_link1` varchar(255) DEFAULT NULL,
  `body1` mediumtext,
  `body2` mediumtext,
  `social_link2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`organization_id`),
  UNIQUE KEY `organization_id_UNIQUE` (`organization_id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Tech Innovators',NULL,'Leading technology advancements','info@techinnovators.com','http://facebook.com/techinnovators','http://twitter.com/techinnovators','Innovating the future','Empowering technology','http://linkedin.com/techinnovators'),(2,'Health First',NULL,'Healthcare for everyone','contact@healthfirst.com','http://facebook.com/healthfirst','http://twitter.com/healthfirst','Prioritizing health','Global health initiatives','http://linkedin.com/healthfirst'),(3,'Eco Warriors',NULL,'Protecting the environment','info@ecowarriors.com','http://facebook.com/ecowarriors','http://twitter.com/ecowarriors','Sustainability efforts','Environmental protection','http://linkedin.com/ecowarriors'),(4,'EduTech',NULL,'Educational technology solutions','support@edutech.com','http://facebook.com/edutech','http://twitter.com/edutech','Learning made easy','Future of education','http://linkedin.com/edutech'),(5,'Foodies United',NULL,'Bringing food enthusiasts together','info@foodiesunited.com','http://facebook.com/foodiesunited','http://twitter.com/foodiesunited','Culinary delights','Global food culture','http://linkedin.com/foodiesunited');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `updates`
--

DROP TABLE IF EXISTS `updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `updates` (
  `update_id` int unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` int unsigned NOT NULL,
  `update_title` varchar(100) NOT NULL,
  `description` mediumtext,
  `date` datetime NOT NULL,
  `post_date` datetime NOT NULL,
  `members_only` int unsigned DEFAULT NULL,
  PRIMARY KEY (`update_id`),
  UNIQUE KEY `event_id_UNIQUE` (`update_id`) /*!80000 INVISIBLE */,
  KEY `updates_org` (`organization_id`),
  CONSTRAINT `updates_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `updates`
--

LOCK TABLES `updates` WRITE;
/*!40000 ALTER TABLE `updates` DISABLE KEYS */;
INSERT INTO `updates` (`update_id`, `organization_id`, `update_title`, `description`, `date`, `post_date`, `members_only`) VALUES
(1, 1, 'New Tech Release', 'Announcing the latest tech products', '2024-06-20 14:00:00', '2024-06-10 12:03:56', 0),
(2, 2, 'Health Tips', 'Daily health tips for the community', '2024-06-21 15:00:00', '2024-06-10 12:03:56', 1),
(3, 3, 'Eco News', 'Latest news on environmental protection', '2024-06-22 16:00:00', '2024-06-10 12:03:56', 0),
(4, 4, 'EduTech Update', 'Recent updates in educational technology', '2024-06-23 17:00:00', '2024-06-10 12:03:56', 1),
(5, 5, 'Foodie Trends', 'Latest trends in the culinary world', '2024-06-24 18:00:00', '2024-06-10 12:03:56', 0),
(6, 1, 'AI Breakthrough', 'Significant AI advancements', '2024-07-01 14:00:00', '2024-06-10 12:03:56', 0),
(7, 2, 'Exercise Routines', 'Effective exercise routines', '2024-07-02 15:00:00', '2024-06-10 12:03:56', 1),
(8, 3, 'Climate Change Alert', 'Important information on climate change', '2024-07-03 16:00:00', '2024-06-10 12:03:56', 0),
(9, 4, 'New Learning Modules', 'Introduction of new learning modules', '2024-07-04 17:00:00', '2024-06-10 12:03:56', 1),
(10, 5, 'Recipe of the Month', 'New monthly recipe feature', '2024-07-05 18:00:00', '2024-06-10 12:03:56', 0),
(11, 1, 'Cybersecurity Update', 'Latest in cybersecurity', '2024-07-10 14:00:00', '2024-06-10 12:03:56', 0),
(12, 2, 'Healthy Eating', 'Tips for healthy eating', '2024-07-11 15:00:00', '2024-06-10 12:03:56', 1),
(13, 3, 'Water Conservation', 'Efforts in water conservation', '2024-07-12 16:00:00', '2024-06-10 12:03:56', 0),
(14, 4, 'EdTech Innovations', 'Innovations in educational technology', '2024-07-13 17:00:00', '2024-06-10 12:03:56', 1),
(15, 5, 'Food Festival Highlights', 'Highlights from the food festival', '2024-07-14 18:00:00', '2024-06-10 12:03:56', 0),
(16, 1, 'Startup Accelerator', 'Launch of startup accelerator program', '2024-07-15 14:00:00', '2024-06-10 12:03:56', 0),
(17, 2, 'Mental Health Resources', 'Resources for mental health support', '2024-07-16 15:00:00', '2024-06-10 12:03:56', 1),
(18, 3, 'Sustainable Living Tips', 'Tips for sustainable living', '2024-07-17 16:00:00', '2024-06-10 12:03:56', 0),
(19, 4, 'Tech for Good', 'Using technology for social good', '2024-07-18 17:00:00', '2024-06-10 12:03:56', 1),
(20, 5, 'Seasonal Recipes', 'Delicious recipes for the season', '2024-07-19 18:00:00', '2024-06-10 12:03:56', 0);
/*!40000 ALTER TABLE `updates` ENABLE KEYS */;
/*!40000 ALTER TABLE `updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_event`
--

DROP TABLE IF EXISTS `user_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_event` (
  `event_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `attendance` int unsigned DEFAULT NULL,
  PRIMARY KEY (`event_id`,`user_id`),
  KEY `associated_user_idx` (`user_id`),
  CONSTRAINT `user_event_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  CONSTRAINT `user_event_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_event`
--

-- LOCK TABLES `user_event` WRITE;
-- /*!40000 ALTER TABLE `user_event` DISABLE KEYS */;
-- INSERT INTO `user_event` (`event_id`, `user_id`, `attendance`) VALUES
-- /*!40000 ALTER TABLE `user_event` ENABLE KEYS */;
-- UNLOCK TABLES;

--
-- Table structure for table `user_organization`
--

DROP TABLE IF EXISTS `user_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_organization` (
  `user_id` int unsigned NOT NULL,
  `organization_id` int unsigned NOT NULL,
  `receive_emails` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`,`organization_id`),
  KEY `associated_organization_idx` (`organization_id`),
  CONSTRAINT `user_org_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`),
  CONSTRAINT `user_org_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_organization`
--

-- LOCK TABLES `user_organization` WRITE;
-- /*!40000 ALTER TABLE `user_organization` DISABLE KEYS */;
-- INSERT INTO `user_organization` (`user_id`, `organization_id`, `receive_emails`) VALUES
-- /*!40000 ALTER TABLE `user_organization` ENABLE KEYS */;
-- UNLOCK TABLES;

--
-- Table structure for table `user_update`
--

DROP TABLE IF EXISTS `user_update`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_update` (
  `update_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  PRIMARY KEY (`update_id`,`user_id`),
  KEY `associated_user_idx` (`user_id`),
  CONSTRAINT `user_update_update` FOREIGN KEY (`update_id`) REFERENCES `updates` (`update_id`),
  CONSTRAINT `user_update_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_update`
--

-- LOCK TABLES `user_update` WRITE;
-- /*!40000 ALTER TABLE `user_update` DISABLE KEYS */;
-- INSERT INTO `user_update` (`update_id`, `user_id`) VALUES
-- /*!40000 ALTER TABLE `user_update` ENABLE KEYS */;
-- UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `display_name` varchar(50) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(25) COLLATE utf8_bin NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `permission` int unsigned NOT NULL DEFAULT '1',
  `user_image` mediumblob,
  `creation_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `google_account` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Max Hansen','maxh','password1','u.nesnah@gmail.com','1234567890',1,NULL,'2024-06-10 12:03:56',0),(2,'Bob Smith','bobsmith','password2','bob.smith@example.com','0987654321',1,NULL,'2024-06-10 12:03:56',0),(3,'Charlie Brown','charlieb','password3','charlie.brown@example.com','1122334455',2,NULL,'2024-06-10 12:03:56',0),(4,'Diana Prince','dianap','password4','diana.prince@example.com','2233445566',1,NULL,'2024-06-10 12:03:56',0),(5,'Evan Davis','evand','password5','evan.davis@example.com','3344556677',1,NULL,'2024-06-10 12:03:56',0),(6,'Fiona Green','fionag','password6','fiona.green@example.com','4455667788',1,NULL,'2024-06-10 12:03:56',0),(7,'George White','georgew','password7','george.white@example.com','5566778899',2,NULL,'2024-06-10 12:03:56',0),(8,'Hannah Black','hannahb','password8','hannah.black@example.com','6677889900',1,NULL,'2024-06-10 12:03:56',0),(9,'Ian Gray','iang','password9','ian.gray@example.com','7788990011',1,NULL,'2024-06-10 12:03:56',0),(10,'Julia Blue','juliab','password10','julia.blue@example.com','8899001122',2,NULL,'2024-06-10 12:03:56',0), (11,'Admin User','admin','AdminPassword0','admin@example.com','1234567890',3,NULL,NOW(),0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'wdc_webapp_prototype'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-10 12:14:36
