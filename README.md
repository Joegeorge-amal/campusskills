# CampusSkills

A peer-to-peer skill exchange platform designed for university students.

Students can teach skills, learn from peers, exchange knowledge through skill swaps, schedule sessions, communicate through real-time chat, and build reputation through ratings and reviews.

---

## Tech Stack

![Java](https://img.shields.io/badge/Java-17-orange)
![Vert.x](https://img.shields.io/badge/Vert.x-4.5-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![JWT](https://img.shields.io/badge/JWT-Authentication-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-purple)
![Maven](https://img.shields.io/badge/Maven-Build-red)
![Git](https://img.shields.io/badge/Git-Version%20Control-orange)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black)

---

## Architecture

The platform follows a modular backend architecture built using:

* Router → Handler → Service → Repository pattern
* JWT-based authentication
* MongoDB document storage
* WebSocket-based real-time communication
* Role architecture (USER / ADMIN)
* Normalized user domain (User, UserProfile, UserStats)

---

# Features

## User Onboarding & Personalization

Allows users to complete and personalize their profile during first-time setup.

* Profile picture upload
* Roll number, department and academic details
* Bio / About section
* Skills offered
* Preferred learning categories

---

## User Profiles

Students can create and manage profiles showcasing skills they can teach or skills they want to learn.

Backed by a normalized user architecture consisting of:

* User
* UserProfile
* UserStats

Features:

* Name and department
* Bio/about section
* Skills offered
* Rating and review display
* Profile picture
* Session requests
* Bank details (planned)
* UPI QR code (planned)

---

## User Dashboard

Provides users with a centralized overview of their activity and platform interactions.

* Skill statistics
* Session statistics
* Trust/rating score
* Search for sessions
* Wallet balance overview
* Upcoming sessions
* Recent messages
* Notifications and alerts
* Create listings

---

## Skill Marketplace

Students can browse available skill offerings and exchange opportunities.

* Create skill listings
* Browse/search listings
* Category filtering
* Paid sessions
* Skill swap sessions
* Online/offline modes
* Detailed listing pages
* View listing creator profiles
* View ratings and reviews

---

## Exchange Requests

Students can request sessions from other users.

* Send requests
* Accept/reject requests
* Notification integration
* Request status tracking
* Request lifecycle management
* Backend-derived exchange ownership
* Session creation from accepted exchanges

---

## Scheduling System

Allows users to schedule learning sessions.

* Session proposal workflow
* Scheduled session lifecycle
* Session status lifecycle tracking
* Online/offline scheduling
* Session date and time management
* Upcoming/completed sessions
* Online / Offline / Skill Swap session types

---

## Messaging System

Real-time communication between students.

* Real-time one-to-one conversations
* Exchange-linked chat lifecycle
* Read receipts
* Unread message counts
* Typing indicators
* Message history
* Exchange acceptance gating
* Pagination support
* WebSocket-based messaging

---

## Session Management

Tracks learning session progress and completion.

* Session status tracking
* Participant completion confirmation
* Session history
* Attendance/completion logs

---

## Ratings & Review System

Students can review completed sessions.

* Star ratings
* Written reviews
* Rating averages

---

## Wallet System (Mock Payment System)

Internal credit-based transaction system.

* Credit balance
* Session payments
* Transaction history
* Withdrawal requests (mock implementation)

---

## Video Call Integration

Supports online learning sessions.

* Google Meet integration (planned)
* Session-linked meeting rooms

---

## Notification System

Provides real-time and activity-based notifications.

* New message notifications
* Session reminders
* Request acceptance/rejection alerts
* Upcoming session alerts
* Wallet/payment updates
* Notification badge counts
* Read/unread notification tracking
* Notification persistence

---

## Authentication & Security

* JWT Authentication
* Role-based authorization (USER / ADMIN)
* Protected API routes
* BCrypt password hashing
* Email verification (In Progress)
* Refresh token support (Planned)

---

## Admin & Moderation

* USER / ADMIN role architecture
* User flagging (Planned)
* Content moderation tools (Planned)
* Administrative controls (Planned)

---

## Documentation

Project documentation can be found in:

```text
docs/
├── git-workflow.md
├── architecture/
└── design/
```

---

## Current Status

🚧 Active Development

Completed major backend modules:

* Chats
* Messages
* Read Receipts
* Unread Message Tracking
* Typing Indicators
* Exchange Requests
* Session Scheduling
* Notifications
* User Domain Normalization

Currently Working On:

* Auth V2

  * Email Verification
  * Refresh Tokens
  * Improved Authentication Flow

```
```
