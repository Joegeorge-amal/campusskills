# CampusSkills

CampusSkills is a peer-to-peer learning platform designed for university students.

The platform enables students to:

* Teach skills to other students
* Learn new skills from peers
* Offer paid learning sessions
* Exchange skills through skill swaps
* Schedule and manage learning sessions
* Communicate through real-time chat
* Build trust through ratings and reviews

---

## Tech Stack

| Technology | Version    |
| ---------- | ---------- |
| Java       | 17         |
| Vert.x     | 4.5.13     |
| MongoDB    | 7          |
| Maven      | Build Tool |

---

## Architecture

The backend follows a modular architecture built using:

* Router → Handler → Service → Repository pattern
* MongoDB document storage
* JWT Authentication
* WebSocket-based real-time communication
* Role-based authorization (USER / ADMIN)
* Normalized user domain architecture

---

## Core Features

### User Profiles

Students can create and manage profiles showcasing skills they can teach or skills they want to learn.

* Profile picture
* Department and academic information
* Bio/About section
* Skills offered
* Ratings and reviews
* Session request support

---

### Skill Marketplace

Students can create listings for:

* Paid learning sessions
* Skill swap sessions
* Free mentoring sessions

Features include:

* Create listings
* Browse and search listings
* Category filtering
* Online / Offline learning modes
* Listing details pages
* User profile integration
* Ratings and review visibility

---

### Exchange Requests

Students can request learning sessions from other users.

* Request creation
* Accept / Reject workflows
* Exchange lifecycle tracking
* Session creation from accepted requests
* Request status tracking

---

### Scheduling & Sessions

* Session proposal workflow
* Session lifecycle management
* Upcoming and completed sessions
* Online / Offline sessions
* Skill swap sessions
* Session status tracking

---

### Messaging System

Real-time communication between students.

* One-to-one conversations
* Exchange-linked chat lifecycle
* Read receipts
* Unread message tracking
* Typing indicators
* Message history
* WebSocket messaging

---

### Notifications

Real-time activity notifications.

* New message notifications
* Request updates
* Session reminders
* Notification badge counts
* Read / Unread tracking

---

### Ratings & Reviews

Students can review completed learning sessions.

* Star ratings
* Written reviews
* Rating aggregation

---

### Authentication & Security

* JWT Authentication
* Protected API routes
* BCrypt password hashing
* Role-based authorization
* Email verification (In Progress)
* Refresh tokens (Planned)

---

### Wallet System (Mock Payment Layer)

Internal transaction architecture for paid sessions.

* Credit balance tracking
* Session payments
* Transaction history
* Withdrawal requests (Mock)

---

## Documentation

```text
docs/
├── git-workflow.md
├── architecture/
└── design/
```

---

## Project Status

🚧 Active Development

### Completed

* Real-time Chat System
* Exchange Requests
* Session Scheduling
* Notifications
* Read Receipts
* Typing Indicators
* User Domain Normalization
* JWT Authentication Foundation

### In Progress

* Authentication V2

  * Email Verification
  * Refresh Tokens
  * Improved Session Management

### Planned

* Video Call Integration
* Wallet Enhancements
* Google OAuth
* Admin Moderation Tools
* File Attachments
