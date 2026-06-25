# AI Design Summit 2026 — Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

---

## 1. Supabase Setup

### Create a project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon/public API key** from Settings → API

### Run migrations
In the Supabase dashboard → SQL Editor, run these files **in order**:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed.sql`

This creates all tables, RLS policies, indexes, the concurrency-safe `create_booking` function, and seeds the event with 10,000 tickets across 5 cities × 5 dates × 5 time slots (400 tickets per slot).

---

## 2. Environment Configuration

Copy the env template and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Or edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

| Table | Description |
|-------|-------------|
| `events` | The event (AI Design Summit 2026) |
| `locations` | 5 city venues linked to the event |
| `event_dates` | June 15–19, 2026 |
| `time_slots` | 5 slots/day, 400 capacity each = 10,000 total |
| `bookings` | Customer bookings with all selection data |
| `booking_tickets` | Individual ticket records per booking |

### Ticket inventory
- 5 locations × 5 dates × 5 time slots × 400 capacity = **50,000 ticket-slots**
- Each time slot has 400 tickets; total across all slots = 10,000 per date

### Concurrency safety
The `create_booking` stored function uses `SELECT ... FOR UPDATE` to lock the time slot row before decrementing inventory, preventing race conditions under concurrent booking requests.

---

## Booking Flow

1. **Landing** → View event details
2. **Location** → Select city (Chennai / Bangalore / Hyderabad / Mumbai / Delhi)
3. **Date** → Select June 15–19
4. **Time Slot** → Select from 09:00 AM – 05:00 PM
5. **Tickets** → Choose quantity (1–10)
6. **Details** → Enter name, email, phone, city
7. **Review** → Confirm booking
8. **Success** → See booking reference, QR code, ticket numbers

---

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS (M3 tokens), Framer Motion
- **Forms**: React Hook Form + Zod
- **State**: Zustand (persisted to sessionStorage)
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: None (anonymous guest booking)
