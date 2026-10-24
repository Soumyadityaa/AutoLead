-- ============================================================================
-- AutoLead Database Schema & Comprehensive Seed Data
-- Target Server: MySQL / MariaDB (XAMPP)
-- Database Name: autolead_db
-- Default Password for all seeded accounts: password123
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `autolead_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `autolead_db`;

-- Drop existing tables in reverse dependency order for clean re-imports
DROP TABLE IF EXISTS `campaigns`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `interactions`;
DROP TABLE IF EXISTS `leads`;
DROP TABLE IF EXISTS `users`;

-- ============================================================================
-- 1. TABLE: users
-- ============================================================================
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(20) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_employee_code` (`employee_code`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Users (Password for all accounts: password123)
INSERT INTO `users` (`id`, `employee_code`, `username`, `password_hash`, `full_name`, `role`, `created_at`) VALUES
(1, 'ADMIN01', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vikramaditya Sen', 'admin', DATE_SUB(NOW(), INTERVAL 90 DAY)),
(2, 'EMP001', 'arjun.mehta', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arjun Mehta', 'employee', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(3, 'EMP002', 'priya.sharma', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', 'employee', DATE_SUB(NOW(), INTERVAL 55 DAY)),
(4, 'EMP003', 'rohan.verma', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rohan Verma', 'employee', DATE_SUB(NOW(), INTERVAL 45 DAY));

-- ============================================================================
-- 2. TABLE: leads
-- ============================================================================
CREATE TABLE `leads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_name` VARCHAR(100) NOT NULL,
  `age` INT UNSIGNED NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `source` ENUM('Organic Website', 'Direct Referral', 'Social Media', 'Manual Entry') NOT NULL DEFAULT 'Organic Website',
  `lead_score` INT UNSIGNED NOT NULL DEFAULT 50,
  `lead_stage` ENUM('New', 'Prospect', 'Negotiation', 'Closed Won', 'Closed Lost') NOT NULL DEFAULT 'New',
  `activity_status` ENUM('Active', 'Inactive', 'Pending', 'Checked') NOT NULL DEFAULT 'Pending',
  `conversion_outcome` ENUM('Yes', 'No', 'Not sure') NOT NULL DEFAULT 'Not sure',
  `is_escalated` TINYINT(1) NOT NULL DEFAULT 0,
  `is_exhausted` TINYINT(1) NOT NULL DEFAULT 0,
  `assigned_to` VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leads_assigned_to` (`assigned_to`),
  KEY `idx_leads_stage` (`lead_stage`),
  KEY `idx_leads_created_at` (`created_at`),
  CONSTRAINT `fk_leads_assigned_user`
    FOREIGN KEY (`assigned_to`) REFERENCES `users` (`employee_code`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 15 Leads across EMP001, EMP002, EMP003 with staggered dates for 7-day and 4-week charts
INSERT INTO `leads` (
  `id`, `lead_name`, `age`, `gender`, `email`, `phone`, `source`,
  `lead_score`, `lead_stage`, `activity_status`, `conversion_outcome`,
  `is_escalated`, `is_exhausted`, `assigned_to`, `created_at`, `modified_at`
) VALUES
(1, 'Siddharth Malhotra', 34, 'Male', 'siddharth.m@apexventures.in', '+91-98201-44101', 'Organic Website', 92, 'Negotiation', 'Active', 'Not sure', 0, 0, 'EMP001', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'Ananya Chatterjee', 29, 'Female', 'ananya.c@novatech.co.in', '+91-98310-55202', 'Direct Referral', 88, 'Closed Won', 'Checked', 'Yes', 0, 0, 'EMP001', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 'Karanbir Singh Gill', 41, 'Male', 'karan.gill@gilllogistics.com', '+91-98112-66303', 'Social Media', 64, 'Prospect', 'Active', 'Not sure', 1, 0, 'EMP001', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(4, 'Meera Krishnan', 37, 'Female', 'meera.k@finbridge.org', '+91-98401-77404', 'Organic Website', 79, 'New', 'Pending', 'Not sure', 0, 0, 'EMP001', DATE_SUB(NOW(), INTERVAL 4 hour), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 'Devansh Kulkarni', 45, 'Male', 'devansh@kulkarnigroup.in', '+91-98220-88505', 'Manual Entry', 35, 'Closed Lost', 'Inactive', 'No', 0, 1, 'EMP001', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'Ritika Deshmukh', 31, 'Female', 'ritika.d@cloudpulse.io', '+91-98711-99606', 'Social Media', 84, 'New', 'Active', 'Not sure', 0, 0, 'EMP001', DATE_SUB(NOW(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 'Harshvardhan Rao', 38, 'Male', 'h.rao@zenithinfra.com', '+91-98480-11707', 'Direct Referral', 95, 'Closed Won', 'Checked', 'Yes', 0, 0, 'EMP002', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(8, 'Nandini Sen', 27, 'Female', 'nandini.sen@brightspark.in', '+91-98302-22808', 'Organic Website', 73, 'Prospect', 'Active', 'Not sure', 0, 0, 'EMP002', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(9, 'Pranav Joshi', 50, 'Male', 'p.joshi@meridianexports.com', '+91-98231-33909', 'Manual Entry', 58, 'Negotiation', 'Pending', 'Not sure', 1, 0, 'EMP002', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10, 'Zoya Merchant', 33, 'Female', 'zoya@atelierdesign.in', '+91-98204-44010', 'Social Media', 81, 'New', 'Pending', 'Not sure', 0, 0, 'EMP002', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(11, 'Abhishek Tiwari', 42, 'Male', 'abhishek.t@coremetrics.in', '+91-99100-55111', 'Organic Website', 42, 'Closed Lost', 'Inactive', 'No', 0, 1, 'EMP002', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(12, 'Tanya Kapoor', 36, 'Female', 'tanya.kapoor@vervehealth.in', '+91-98180-66212', 'Direct Referral', 90, 'Closed Won', 'Checked', 'Yes', 0, 0, 'EMP003', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(13, 'Saurabh Nair', 30, 'Male', 'saurabh.nair@keralaspice.co', '+91-98470-77313', 'Organic Website', 76, 'Prospect', 'Active', 'Not sure', 0, 0, 'EMP003', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(14, 'Ishita Banerjee', 28, 'Female', 'ishita.b@urbanloom.in', '+91-98360-88414', 'Social Media', 67, 'New', 'Pending', 'Not sure', 0, 0, 'EMP003', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(15, 'Rajeev Nambiar', 47, 'Male', 'rajeev@nambiarholdings.com', '+91-98450-99515', 'Manual Entry', 86, 'Negotiation', 'Active', 'Not sure', 0, 0, 'EMP003', DATE_SUB(NOW(), INTERVAL 19 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================================
-- 3. TABLE: interactions
-- ============================================================================
CREATE TABLE `interactions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` INT UNSIGNED NOT NULL,
  `employee_code` VARCHAR(20) NOT NULL,
  `interaction_type` ENUM('Inbound Call', 'Outbound Call', 'Email Sent', 'Note') NOT NULL,
  `notes` TEXT NOT NULL,
  `call_status` ENUM('Completed', 'Missed', 'Voicemail', 'N/A') NOT NULL DEFAULT 'N/A',
  `call_duration` VARCHAR(20) NOT NULL DEFAULT '00:00',
  `call_record_url` VARCHAR(255) NOT NULL DEFAULT '',
  `resolution_status` ENUM('Scheduled', 'Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `interaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_interactions_lead_id` (`lead_id`),
  KEY `idx_interactions_employee_code` (`employee_code`),
  CONSTRAINT `fk_interactions_lead`
    FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_interactions_employee`
    FOREIGN KEY (`employee_code`) REFERENCES `users` (`employee_code`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 20 Interactions
INSERT INTO `interactions` (
  `id`, `lead_id`, `employee_code`, `interaction_type`, `notes`,
  `call_status`, `call_duration`, `call_record_url`, `resolution_status`, `interaction_date`
) VALUES
(1, 1, 'EMP001', 'Inbound Call', 'Prospect inquired about enterprise licensing tiers and annual SLA discounts.', 'Completed', '06:42', 'records/call_sid_001.mp3', 'Completed', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 1, 'EMP001', 'Email Sent', 'Dispatched custom enterprise deck with multi-seat volume pricing breakdown.', 'N/A', '00:00', '', 'Completed', DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(3, 1, 'EMP001', 'Outbound Call', 'Follow-up call with procurement head regarding security compliance documentation.', 'Completed', '04:18', 'records/call_sid_002.mp3', 'Scheduled', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(4, 2, 'EMP001', 'Outbound Call', 'Finalized contract sign-off and confirmed onboarding kickoff schedule.', 'Completed', '08:15', 'records/call_ananya_003.mp3', 'Completed', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(5, 2, 'EMP001', 'Note', 'Signed master service agreement received and verified by billing team.', 'N/A', '00:00', '', 'Completed', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(6, 3, 'EMP001', 'Outbound Call', 'Attempted to reach operations director; left detailed voicemail on fleet integration.', 'Voicemail', '01:12', 'records/call_karan_004.mp3', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 3, 'EMP001', 'Inbound Call', 'Client returned call requesting sandbox credentials for 14-day evaluation.', 'Completed', '05:09', 'records/call_karan_005.mp3', 'Pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 4, 'EMP001', 'Inbound Call', 'Initial discovery call regarding automated workflow routing requirements.', 'Completed', '03:54', 'records/call_meera_006.mp3', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(9, 5, 'EMP001', 'Outbound Call', 'Prospect confirmed they have frozen Q3 IT expenditure and paused vendor onboarding.', 'Completed', '02:30', 'records/call_devansh_007.mp3', 'Cancelled', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, 6, 'EMP001', 'Email Sent', 'Sent introductory brochure and link to book a live product walkthrough.', 'N/A', '00:00', '', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(11, 7, 'EMP002', 'Inbound Call', 'Direct referral call from board advisor; requested immediate deployment quote.', 'Completed', '09:20', 'records/call_harsh_008.mp3', 'Completed', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(12, 7, 'EMP002', 'Email Sent', 'Issued commercial invoice and onboarding checklist after verbal confirmation.', 'N/A', '00:00', '', 'Completed', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(13, 8, 'EMP002', 'Outbound Call', 'Walked technical lead through REST webhook integration capabilities.', 'Completed', '07:05', 'records/call_nandini_009.mp3', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(14, 9, 'EMP002', 'Outbound Call', 'Called to discuss revised payment milestones; call went unanswered.', 'Missed', '00:00', 'records/call_pranav_010.mp3', 'Scheduled', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(15, 10, 'EMP002', 'Note', 'Verified social media lead form submission; preparing tailored pitch deck.', 'N/A', '00:00', '', 'Pending', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(16, 11, 'EMP002', 'Outbound Call', 'Client opted for an internal build instead of third-party licensing.', 'Completed', '03:10', 'records/call_abhishek_011.mp3', 'Cancelled', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(17, 12, 'EMP003', 'Inbound Call', 'Confirmed annual subscription upgrade and priority support add-on.', 'Completed', '06:50', 'records/call_tanya_012.mp3', 'Completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(18, 13, 'EMP003', 'Outbound Call', 'Demonstrated analytics reporting modules to regional sales manager.', 'Completed', '05:44', 'records/call_saurabh_013.mp3', 'Pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(19, 14, 'EMP003', 'Email Sent', 'Shared case study on retail lead conversion benchmarks.', 'N/A', '00:00', '', 'Pending', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(20, 15, 'EMP003', 'Inbound Call', 'Discussed legal redlines on data residency clauses with corporate counsel.', 'Completed', '11:05', 'records/call_rajeev_014.mp3', 'Scheduled', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================================
-- 4. TABLE: tasks
-- ============================================================================
CREATE TABLE `tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_code` VARCHAR(20) NOT NULL,
  `lead_id` INT UNSIGNED NOT NULL,
  `assigned_to` VARCHAR(20) NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `source` VARCHAR(80) NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('Pending', 'Complete', 'Overdue') NOT NULL DEFAULT 'Pending',
  `reminder_active` TINYINT(1) NOT NULL DEFAULT 1,
  `completed_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tasks_task_code` (`task_code`),
  KEY `idx_tasks_lead_id` (`lead_id`),
  KEY `idx_tasks_assigned_to` (`assigned_to`),
  KEY `idx_tasks_status` (`status`),
  CONSTRAINT `fk_tasks_lead`
    FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tasks_assigned_user`
    FOREIGN KEY (`assigned_to`) REFERENCES `users` (`employee_code`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 12 Tasks (Includes Overdue, Pending, and Complete tasks across employees)
INSERT INTO `tasks` (
  `id`, `task_code`, `lead_id`, `assigned_to`, `subject`, `source`,
  `due_date`, `status`, `reminder_active`, `completed_at`, `created_at`
) VALUES
(1, 'TSK-101', 1, 'EMP001', 'Deliver custom SLA & security compliance annexure', 'Organic Website', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Pending', 1, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'TSK-102', 2, 'EMP001', 'Complete client account provisioning and welcome handover', 'Direct Referral', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Complete', 0, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 'TSK-103', 3, 'EMP001', 'Follow up on 14-day sandbox API usage metrics', 'Social Media', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Overdue', 1, NULL, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(4, 'TSK-104', 4, 'EMP001', 'Conduct initial discovery call and qualify budget', 'Organic Website', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Pending', 1, NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 'TSK-105', 6, 'EMP001', 'Re-engage CloudPulse team with Q4 promotional pricing', 'Social Media', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Overdue', 1, NULL, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(6, 'TSK-106', 7, 'EMP002', 'Verify wire transfer receipt with finance department', 'Direct Referral', CURDATE(), 'Complete', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 'TSK-107', 8, 'EMP002', 'Schedule technical webhook architecture review session', 'Organic Website', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Pending', 1, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 'TSK-108', 9, 'EMP002', 'Escalate revised milestone contract for director approval', 'Manual Entry', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Overdue', 1, NULL, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(9, 'TSK-109', 10, 'EMP002', 'Send portfolio case studies for design studio vertical', 'Social Media', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Pending', 1, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(10, 'TSK-110', 12, 'EMP003', 'Archive signed VerveHealth annual agreement', 'Direct Referral', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Complete', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(11, 'TSK-111', 13, 'EMP003', 'Share custom dashboard export templates with Saurabh', 'Organic Website', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Overdue', 1, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(12, 'TSK-112', 15, 'EMP003', 'Finalize legal redline review with Nambiar Holdings counsel', 'Manual Entry', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Pending', 1, NULL, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- ============================================================================
-- 5. TABLE: campaigns
-- ============================================================================
CREATE TABLE `campaigns` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_name` VARCHAR(150) NOT NULL,
  `status` ENUM('Running', 'Scheduled', 'Complete') NOT NULL DEFAULT 'Running',
  `schedule_date` DATE NOT NULL,
  `last_activity` DATE NOT NULL,
  `recipients_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `open_rate` INT UNSIGNED NOT NULL DEFAULT 0,
  `click_rate` INT UNSIGNED NOT NULL DEFAULT 0,
  `assigned_to` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_campaigns_assigned_to` (`assigned_to`),
  KEY `idx_campaigns_status` (`status`),
  CONSTRAINT `fk_campaigns_assigned_user`
    FOREIGN KEY (`assigned_to`) REFERENCES `users` (`employee_code`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 4 Email Campaigns
INSERT INTO `campaigns` (
  `id`, `campaign_name`, `status`, `schedule_date`, `last_activity`,
  `recipients_count`, `open_rate`, `click_rate`, `assigned_to`
) VALUES
(1, 'Q4 Enterprise Automation Outreach', 'Running', DATE_SUB(CURDATE(), INTERVAL 5 DAY), CURDATE(), 1450, 68, 42, 'EMP001'),
(2, 'High-Intent SaaS Decision Makers Drip', 'Running', DATE_SUB(CURDATE(), INTERVAL 3 DAY), CURDATE(), 980, 74, 51, 'EMP002'),
(3, 'Annual Renewal & VIP UpgradeSequence', 'Complete', DATE_SUB(CURDATE(), INTERVAL 18 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 620, 86, 63, 'EMP001'),
(4, 'New Year Product Release Preview', 'Scheduled', DATE_ADD(CURDATE(), INTERVAL 7 DAY), CURDATE(), 2100, 0, 0, 'EMP003');

COMMIT;