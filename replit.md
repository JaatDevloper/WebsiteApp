# Premium Quiz Bot - Telegram Mini App

## Overview

This is a Telegram Mini App for creating, managing, and taking quizzes. It serves as a companion web interface for an existing Telegram Quiz Bot (written in Python). The app provides a mobile-first, iOS-inspired dashboard where users can create quizzes (manually or via file upload), manage their quiz library, take quizzes with timers and negative marking, view results with leaderboards, and track their profile stats. The app is designed to run inside Telegram's WebApp container and integrates with the Telegram WebApp SDK for native features like haptic feedback, theme detection, and user identity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React 18 with TypeScript, bootstrapped via Vite
- **Routing:** Wouter (lightweight client-side router)
- **State/Data Fetching:** TanStack Query (React Query) for server state management with a custom `apiRequest` helper and `getQueryFn` factory
- **UI Components:** Shadcn UI (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Styling:** Tailwind CSS with CSS custom properties for theming (light/dark mode), Inter font, gradient-heavy modern design
- **Telegram Integration:** `@twa-dev/sdk` and the Telegram WebApp JS SDK (`telegram-web-app.js`) loaded via script tag. Custom `client/src/lib/telegram.ts` wraps the Telegram WebApp API for user info, haptic feedback, back button, and main button
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Pages:** Dashboard, Create (quiz builder with manual + file upload tabs), MyQuizzes (list/filter/search/delete), QuizEdit, QuizTake (with timer), QuizResults (with scoring and negative marking), Profile, 404
- **Build output:** `dist/public/` (served by the Express backend in production)

### Backend
- **Runtime:** Node.js with Express, written in TypeScript, compiled with esbuild for production
- **Dev server:** Vite dev server integrated as Express middleware (see `server/vite.ts`) with HMR support
- **API prefix:** All API routes are under `/api/`
- **Storage layer:** Abstracted via an `IStorage` interface (`server/storage.ts`) with two implementations:
  - `MemStorage` — in-memory Maps for development/testing (default)
  - `MongoStorage` — connects to an existing MongoDB database used by the Python Telegram bot (`server/mongoStorage.ts`, `server/mongodb.ts`)
- **Schema/Validation:** Drizzle ORM schema definitions in `shared/schema.ts` define the data shape (users, quizzes, questions) using PostgreSQL table definitions. Zod schemas are generated from Drizzle schemas via `drizzle-zod` for runtime validation. Note: the Drizzle schema is configured for PostgreSQL (`drizzle.config.ts` requires `DATABASE_URL`) but the app currently runs with in-memory or MongoDB storage. PostgreSQL can be added later.
- **File uploads:** Multer configured for `.txt` file uploads (quiz import feature), stored in memory with 5MB limit
- **Key API endpoints:**
  - `GET/POST /api/user` — user lookup/creation by Telegram ID
  - `GET/POST/PUT/DELETE /api/quizzes` — CRUD for quizzes
  - `GET/POST /api/questions` — question management
  - `GET /api/stats` — dashboard statistics
  - `GET /api/user-profile/:id` — detailed user profile from MongoDB
  - `POST /api/quiz-attempts` — save quiz attempt results
  - `GET /api/quiz-attempts` — leaderboard data

### Data Models
- **Users:** id, telegramId, username, firstName, lastName, createdAt
- **Quizzes:** id, userId, title, description, isPaid, price, participants, timer, negativeMarking, createdAt
- **Questions:** id, quizId, question, options (text array), correctAnswer (integer index), order

### Build & Run
- **Dev:** `npm run dev` — runs the Express server with Vite middleware (tsx for TypeScript execution)
- **Build:** `npm run build` — Vite builds the frontend to `dist/public/`, esbuild bundles the server to `dist/index.js`
- **Start:** `npm start` — runs the production bundle
- **DB push:** `npm run db:push` — Drizzle Kit push to PostgreSQL (when DATABASE_URL is set)
- There is also a standalone `server.js` file (plain Express static file server with CORS/CSP headers for Telegram) that appears to be an alternative deployment entry point

### Design System
- Mobile-first, max-width constrained layout (max-w-md)
- Purple-to-blue gradient as primary brand color
- Rounded cards (rounded-2xl), subtle shadows
- Bottom tab navigation bar with 4 tabs: Dashboard, Create, My Quizzes, Profile
- Quiz-taking and editing routes hide the navigation bar
- Dark mode support via CSS class toggle

## External Dependencies

### Telegram
- **Telegram WebApp SDK** — loaded via `<script src="https://telegram.org/js/telegram-web-app.js">` for in-app identity, theming, haptic feedback, and navigation controls
- **`@twa-dev/sdk`** — npm package for Telegram WebApp TypeScript types/helpers
- Requires a Telegram Bot Token (from BotFather) set as `TELEGRAM_BOT_TOKEN` environment variable

### MongoDB
- **Mongoose** — connects to an existing MongoDB instance used by the Python Telegram bot
- Environment variables: `MONGODB_URI` (connection string), `MONGODB_DB_NAME` (defaults to `quizbot`)
- Collections mirror the Python bot's schema: `user_profiles`, quizzes, premium users, verified users, quiz attempts

### PostgreSQL (Optional/Future)
- **Drizzle ORM** with `@neondatabase/serverless` driver configured in `drizzle.config.ts`
- Requires `DATABASE_URL` environment variable when using PostgreSQL
- Schema defined in `shared/schema.ts` but not actively used as the primary storage

### Key npm packages
- `express` — HTTP server
- `drizzle-orm` / `drizzle-kit` / `drizzle-zod` — ORM, migrations, and validation
- `mongoose` — MongoDB ODM
- `zod` — schema validation
- `multer` — file upload handling
- `vite` / `@vitejs/plugin-react` — frontend build tooling
- `esbuild` — server bundling
- `tailwindcss` — utility-first CSS
- Full Radix UI primitive suite via Shadcn UI
- `wouter` — client-side routing
- `@tanstack/react-query` — async state management
- `lucide-react` — icon library
- `nanoid` — ID generation

### Deployment
- Designed for Koyeb deployment (Docker-based) with environment variables for bot token, session secret, and database connections
- Port 5000 by default