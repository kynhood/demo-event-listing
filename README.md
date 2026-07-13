# 🎟️ Event Booking

A modern, full-stack event booking platform built with **Next.js 16**, **Supabase**, and **TypeScript**. Users can browse events, select available time slots, and complete bookings — all with a smooth, animated UI powered by Framer Motion.

---

## ✨ Features

- 📅 **Event Listing** — Browse available events with dates and locations
- 🕐 **Slot Selection** — Pick from available time slots per event date
- 📝 **Booking Flow** — Form-driven booking with validation via React Hook Form + Zod
- 📦 **QR Code Tickets** — Booking confirmations include a generated QR code
- 🗄️ **Supabase Backend** — PostgreSQL database with row-level security
- ⚡ **Next.js API Routes** — Server-side API for events, slots, bookings, locations & admin
- 🎨 **Framer Motion** — Smooth animations throughout the UI
- 🌐 **Deployed on Vercel**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth/Storage | Supabase |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| State | Zustand |
| QR Codes | `qrcode` + `react-qr-code` |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/        # Admin endpoints
│   │   ├── bookings/     # Booking CRUD
│   │   ├── dates/        # Available dates
│   │   ├── events/       # Event listing & details
│   │   ├── locations/    # Venue/location data
│   │   └── slots/        # Time slot management
│   ├── book/             # Booking pages
│   ├── layout.tsx
│   └── page.tsx          # Home / event listing page
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Supabase client & utilities
├── store/                # Zustand state stores
└── types/                # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/kynhood/demo-event-listing.git
cd demo-event-listing
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database

This project uses **Supabase** as the backend. Database migrations and schema are located in the `supabase/` directory.

To apply migrations:

```bash
npx supabase db push
```

---

## 📦 Deployment

The app is optimized for deployment on **Vercel**:

1. Push to your GitHub repository
2. Import the project in [Vercel](https://vercel.com)
3. Add the environment variables in the Vercel dashboard
4. Deploy 🚀

---

## 📄 License

MIT
