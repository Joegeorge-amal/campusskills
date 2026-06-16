# CampusSkills

CampusSkills is a peer-to-peer learning platform for university students. Students can teach skills, request help, arrange sessions, exchange skills, chat in real time, leave reviews, and build trust within the campus community.

The project consists of a Java Vert.x backend with MongoDB persistence and a React/Vite frontend.

## Features

- JWT authentication and refresh tokens
- OTP email verification and password reset
- Student profiles with academic information and skill lists
- Public profiles
- Marketplace listings
- Paid sessions and skill swaps
- Session scheduling and rescheduling
- Real-time one-to-one chat using WebSockets
- Notifications and reminders
- Reviews and trust scores
- Reports and moderation
- Blocking system
- Admin dashboard
- Image uploads through Cloudinary

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios |
| UI/UX libraries | Lucide React, Tabler Icons, Framer Motion, React Colorful |
| Backend | Java 17, Vert.x 4.5 |
| Database | MongoDB |
| Auth | JWT, BCrypt, refresh tokens, OTP verification |
| Realtime | Vert.x WebSockets |
| Build tools | Maven, npm |

## Project Structure

```text
.
|-- backend/                 # Java Vert.x API, WebSocket server, jobs, and MongoDB modules
|   |-- src/main/java/com/campusskills/
|   |   |-- core/            # Configuration and database setup
|   |   |-- modules/         # Feature modules: users, listings, sessions, chats, admin, etc.
|   |   |-- shared/          # Shared models, constants, and services
|   |   `-- web/             # API router, middleware, responses, WebSocket handlers
|   |-- scripts/             # Utility scripts such as admin creation/migrations
|   `-- pom.xml
|-- frontend/                # React/Vite app
|   |-- src/
|   |   |-- components/      # Shared UI, modals, admin widgets, layout widgets
|   |   |-- context/         # Auth, app data, and socket providers
|   |   |-- hooks/           # Custom React hooks
|   |   |-- layouts/         # App and admin layouts
|   |   |-- pages/           # Student and admin screens
|   |   |-- routes/          # Route definitions
|   |   |-- services/        # API clients for backend modules
|   |   `-- styles/          # Global, responsive, page, and admin CSS
|   |-- public/
|   `-- package.json
|-- docs/
|   |-- architecture/        # Architecture assets such as ER diagrams
|   |-- assets/              # Branding and visual assets
|   |-- design/              # UI design screenshots
|   `-- git-workflow.md
`-- campusskills_postman_collection.json
```

## Prerequisites

- Java 17
- Maven
- Node.js and npm
- MongoDB running locally, or access to a MongoDB connection string

## Backend Setup

Create a `.env` file inside `backend/` or provide the same values through your shell environment:

```env
JWT_SECRET=your_secure_random_string_here
EMAIL_PROVIDER=gmail
SMTP_USERNAME=campusskills.team@gmail.com
SMTP_PASSWORD=your_app_password
FRONTEND_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

`JWT_SECRET` is required. The backend will fail to start if it is missing.

Start the backend:

```bash
cd backend
mvn clean compile
mvn "-Dexec.mainClass=com.campusskills.MainVerticle" exec:java
```

The API will be available at:

```text
http://localhost:8080/api/v1
```

Health check:

```text
http://localhost:8080/health
```

## Frontend Setup

Install dependencies and start the Vite dev server:

```bash
cd frontend
npm install

# Set the API URL to point directly to the backend
$env:VITE_API_URL="http://localhost:8080/api/v1"
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`, so the frontend can call backend routes through `/api/v1`.

## Common Commands

### Frontend

```bash
cd frontend 
npm run dev 
npm run build 
npm run preview
```

### Backend

```bash
cd backend
mvn clean compile
mvn test
mvn package
mvn "-Dexec.mainClass=com.campusskills.MainVerticle" exec:java
```

### Admin Utilities

The backend includes utility scripts in `backend/scripts/`, including:

- `create_superadmin.js`
- `delete_admin.js`
- `migrate_listings_to_v2.js`

Check each script before running it so the MongoDB connection and expected inputs match your local environment.

## API Modules

Backend routes are mounted under `/api/v1`:

- `/auth`
- `/users`
- `/profiles`
- `/listings`
- `/sessions`
- `/chats`
- `/messages`
- `/chat-requests`
- `/exchanges`
- `/notifications`
- `/reviews`
- `/topics`
- `/availability`
- `/admin`
- `/verifications`
- `/images`
- `/reports`

Protected routes use JWT authentication. Some marketplace/session actions also require an email-verified user.

## Realtime

The backend uses Vert.x WebSockets for chat and live activity. The frontend socket contexts and services are located in:

```text
frontend/src/context/
frontend/src/services/socketService.js
frontend/src/hooks/useSocket.js
```

## Documentation And Assets

- `docs/git-workflow.md` contains the project Git workflow.
- `docs/architecture/er_diagram_complete.png` contains the current ER diagram.
- `docs/design/` contains UI screen references for student and admin flows.
- `campusskills_postman_collection.json` contains a Postman collection for API testing.

## Current Status

CampusSkills is in active development.
