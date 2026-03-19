# Allium: A Volunteer Organization Management Platform

## Introduction

Allium is a web-based platform designed to connect volunteers with organizations that need their support. Inspired by the yellow flower symbolizing unity and prosperity, Allium serves as a digital space where community members can discover volunteer opportunities and engage with causes that align with their values. This platform is a mock implementation created for educational purposes and is not intended for production use.

## Core Purpose and Vision

Allium addresses the challenge of finding relevant volunteer opportunities and staying connected with organizations. The platform provides a centralized space where individuals can explore organizations, understand their missions, and engage with their activities. Whether someone is passionate about environmental conservation, social justice, education, or other causes, Allium facilitates connections between volunteers and the organizations that need them.

## User Experience and Capabilities

### For Visitors and New Users

Visitors to Allium can explore the platform's catalog of volunteer organizations without creating an account. The landing page displays organization cards in a grid format, allowing users to browse and read about different causes. Visitors can view public events and announcements, and use the search functionality to find organizations matching specific keywords or interests. The platform also allows anyone to view the managers and leadership of each organization, providing transparency about organizational structure.

### For Registered Members

Registered members can create accounts through traditional registration or Google authentication. Once logged in, members can join organizations, creating a personalized list of causes they support. Membership grants access to member-only events and updates that organizations may restrict to committed volunteers.

Members can indicate their attendance intentions for events, creating records that help organizations plan accordingly. Members can also subscribe to email notifications from specific organizations, receiving emails when new events are created or important updates are posted. The platform supports profile management, allowing members to maintain display names, contact information, and profile pictures. Profile editing options differ for users who sign in through Google versus those using traditional credentials.

### For Organization Managers

Managers are individuals designated by platform administrators to manage specific organizations. Managers can create and publish events with descriptions, dates, times, and locations. Events can be set as either public (visible to all visitors) or member-only. Similarly, managers can post updates and announcements, sharing news or important information with their communities.

Managers can edit and delete events and updates as needed. They can view which members have indicated they will attend specific events, helping with planning and resource allocation. Managers also have the ability to remove members from their organizations when necessary.

### For Platform Administrators

Administrators manage the entire platform ecosystem. They can create new organizations, edit existing ones, and remove organizations. Administrators manage the user base, with the ability to edit user accounts, assign roles, and designate managers for specific organizations. This includes promoting users to manager or administrator status. Administrators automatically have manager privileges for all organizations, allowing them to support organizational activities when needed.

## Key Features

### Organization Discovery and Browsing

The platform features an organization catalog that presents volunteer groups in a grid format. Each organization has a dedicated page showcasing its mission, description, contact information, and social media links.

### Event Management and Tracking

Organizations can create detailed event listings with relevant information, and members can indicate their attendance intentions. This provides visibility into participation levels.

### Update and Announcement System

Organizations can share updates and announcements with their communities. The system supports both public and member-only updates, giving organizations flexibility in communication.

### Email Notification System

Members who subscribe to an organization's notifications receive emails when new events are created or important updates are posted. This feature uses NodeMailer to maintain engagement even when volunteers aren't actively browsing the platform.

### Role-Based Access Control

The platform implements a permission system based on user roles. Guests can browse and view public content, members can join organizations and participate in activities, managers can create and manage content for their organizations, and administrators have full platform oversight.

### Search Functionality

A search feature allows users to find organizations, events, or content that matches their interests.

### Profile Management

Users can create and maintain profiles that help them connect with organizations and other volunteers. The platform supports traditional username/password registration and Google OAuth authentication.

## Data Science Implementation

Allium incorporates several data science concepts and practices in its structure and functionality, demonstrating how data-driven approaches support the platform's operations.

### Relational Database Design and Normalization

The platform uses a normalized MySQL database structure that follows relational database principles. The schema employs foreign key relationships to maintain data integrity and eliminate redundancy. Tables for users, organizations, events, updates, and their relationships (user_organization, user_event, user_update, manager_organization) are structured to support efficient data storage and retrieval while maintaining referential integrity.

### Data Aggregation and Analysis Queries

The platform uses SQL aggregation functions to derive insights from stored data. COUNT queries are used to determine membership status, check if users belong to organizations, and verify manager permissions. These aggregations enable the system to make access control decisions and provide managers with information about event attendance.

### Data Joining and Union Operations

Complex SQL queries combine data from multiple tables using JOIN operations to create comprehensive views of information. For instance, when displaying events and updates, the system uses UNION ALL to combine results from different tables into a unified chronological feed. JOIN operations link user data with event attendance, organization membership, and management relationships, enabling the platform to present contextual information based on user roles and permissions.

### Data Filtering and Sorting

The platform implements sophisticated filtering mechanisms through WHERE clauses that filter data based on user permissions, membership status, and content visibility settings (public versus member-only). Results are sorted using ORDER BY clauses, particularly for chronological ordering of events and updates by post date, ensuring users see the most recent information first.

### Data-Driven Decision Making

The platform uses data queries to support decision-making processes. For example, managers can query attendance data to see which members plan to attend events, enabling better resource planning. The system uses membership counts and relationship checks to determine what content users can access, creating a data-driven access control system.

### Data Relationships and Referential Integrity

Foreign key constraints ensure that relationships between entities (users, organizations, events, updates) remain consistent. This prevents orphaned records and maintains data quality, which is essential for accurate reporting and system reliability.

These data science principles enable the platform to efficiently manage relationships between users and organizations, provide relevant content based on user context, and support organizational decision-making through data-driven insights.

## Conclusion

Allium demonstrates how web technologies can facilitate community engagement and volunteer coordination. By providing a platform for discovering volunteer opportunities, managing organizational activities, and maintaining connections between volunteers and causes, the system aims to make community involvement more accessible.

It is important to emphasize that this platform is a demonstration project created for educational purposes. While it showcases capabilities that such a system might offer, it is not intended for production deployment or real-world use. The implementation serves as a learning tool, illustrating how modern web development technologies and data science principles can be applied to create platforms for social good.
