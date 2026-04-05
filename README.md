# DVSA DriveTime Saver

Two-sided marketplace connecting driving learners with test cancellation slots and instructors.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Payments:** Stripe (test mode)
- **Auth:** JWT + bcrypt

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or use `DATABASE_URL` for remote)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL credentials and Stripe test keys
```

### 3. Set up database

```bash
# Create the database
createdb drivetime_saver

# Run migrations
npm run db:migrate

# Seed test centres and sample data
npm run db:seed
```

### 4. Start development

```bash
npm run dev
```

This starts both:
- Backend at http://localhost:5000
- Frontend at http://localhost:5173

## Project Structure

```
dvsa-drivetime-saver/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── lib/            # API client
│   │   └── pages/          # Route pages
│   └── vite.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── db/             # Migrations and seeds
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/         # API route handlers
│   │   └── utils/          # Geocoding helpers
│   └── .env.example
└── package.json            # Root scripts
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/learners/profile | Learner | Get learner profile |
| POST | /api/learners/profile | Learner | Update learner profile |
| POST | /api/learners/alerts | Learner | Create slot alert |
| GET | /api/learners/alerts | Learner | List slot alerts |
| GET | /api/instructors | No | List instructors |
| GET | /api/instructors/:id | No | Get instructor |
| POST | /api/instructors/profile | Instructor | Update profile |
| GET | /api/centres | No | Search test centres |
| POST | /api/bookings | Yes | Create booking |
| GET | /api/bookings/:id | Yes | Get booking |
| PATCH | /api/bookings/:id/status | Yes | Update booking status |
| POST | /api/payments/create-intent | Yes | Create Stripe payment |

## Test Accounts (after seeding)

The seed creates 5 sample instructors. Register as a learner through the UI to test the full flow.

## Deployment

- **Backend:** Deploy `server/` to Render (free tier)
- **Frontend:** Deploy `client/` to Vercel
- Set environment variables on both platforms

## MVP Limitations

- Test centres use static seed data (no live DVSA API)
- Slot alerts log to console (no email notifications yet)
- Instructor availability is mock data
- Payment uses Stripe test mode
- Distance search uses approximate postcode-to-coordinates mapping
