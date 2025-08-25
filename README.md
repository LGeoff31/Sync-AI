## SyncAI

A collaborative scheduling app: create a room, invite friends, see everyone’s overlapping free time, and let AI propose an activity and book it on everyone’s calendar. Optionally tailor suggestions using each member’s profile and pick a venue near the group’s midpoint.

### Features
- Rooms
  - Create/join rooms by code (e.g., WVYSS8)
  - Member list with join-on-visit
- Availability
  - Google Calendar FreeBusy for each member (read-only)
  - Overlap visualization with FullCalendar (Week/Day)
- AI scheduling
  - OpenAI suggests an activity and description
  - Creates a calendar event for all members (calendar.events scope), invites attendees, and sends updates
  - Optionally picks a venue near the group’s centroid via Google Places and includes the map link
- Profiles
  - Each user can save a short bio; AI uses group bios to tailor activities
- Location
  - Users can share approximate location; the scheduler computes the centroid for a convenient venue

---

## Tech stack
- Next.js 15 (App: `/pages`)
- TypeScript, React 19
- NextAuth (Google provider)
- Supabase (Postgres + RLS)
- FullCalendar (timeGrid)
- OpenAI (chat completions)
- Google APIs (Calendar, Places)

---

## Prerequisites
- Node 18+ and npm
- Supabase project (or Postgres equivalent)
- Google Cloud project with:
  - OAuth client (Web)
  - Enabled APIs: Calendar API, Places API
  - Billing enabled for Places
- OpenAI API key

---

## Environment variables

Create `.env.local` for local dev and add these to your deployment (e.g., Vercel → Project → Settings → Environment Variables).

```bash
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_string

# NextAuth Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Server-side service role is recommended for server API writes that bypass RLS:
SUPABASE_SERVICE_ROLE=...

# OpenAI
OPENAI_API_KEY=...

# Google Places
GOOGLE_MAPS_API_KEY=...
```

Scopes: The Google provider is configured with:
- https://www.googleapis.com/auth/calendar.readonly
- https://www.googleapis.com/auth/calendar.events

After adding events scope, users must re-consent (sign out/in).

---

## Database schema (Supabase/Postgres)

Rooms:
```sql
create table if not exists public.room (
  code text primary key,
  name text,
  created_at timestamptz default now(),
  created_by text not null
);
```

Room members:
```sql
create table if not exists public.room_member (
  room_code text not null,
  user_email text not null,
  user_name text,
  joined_at timestamptz default now(),
  primary key (room_code, user_email),
  constraint fk_member_room foreign key (room_code) references public.room(code) on delete cascade
);
```

User tokens (server-managed; do not expose to client):
```sql
create table if not exists public.user_token (
  user_email   text not null,
  provider     text not null,
  access_token text,
  refresh_token text,
  expires_at   bigint,
  scope        text,
  token_type   text,
  updated_at   timestamptz default now(),
  primary key (user_email, provider)
);
alter table public.user_token enable row level security;
-- server (service role) should write; no broad client policies
```

User profile (bio):
```sql
create table if not exists public.user_profile (
  user_email text primary key,
  bio text,
  updated_at timestamptz default now()
);
alter table public.user_profile enable row level security;

create policy "select own profile" on public.user_profile
  for select using ((auth.jwt()->>'email') = user_email);

create policy "upsert own profile" on public.user_profile
  for insert with check ((auth.jwt()->>'email') = user_email);

create policy "update own profile" on public.user_profile
  for update using ((auth.jwt()->>'email') = user_email)
  with check ((auth.jwt()->>'email') = user_email);
```

User location (approx lat/lon for venue selection):
```sql
create table if not exists public.user_location (
  user_email text primary key,
  lat double precision not null,
  lon double precision not null,
  updated_at timestamptz default now()
);
alter table public.user_location enable row level security;

create policy "insert own location" on public.user_location
  for insert with check ((auth.jwt()->>'email') = user_email);

create policy "select own location" on public.user_location
  for select using ((auth.jwt()->>'email') = user_email);

create policy "update own location" on public.user_location
  for update using ((auth.jwt()->>'email') = user_email)
  with check ((auth.jwt()->>'email') = user_email);
```

---

## Setup

Install:
```bash
npm install
```

Dev:
```bash
npm run dev
```

Build:
```bash
npm run build
npm start
```

---

## Google setup

1) OAuth client (Web)
- Authorized JavaScript origins: http://localhost:3000 (and your prod domain)
- Authorized redirect URI: https://your-domain.com/api/auth/callback/google (and localhost)

2) Enable APIs: Calendar API, Places API (requires billing)

3) Re-consent
- After adding `calendar.events`, users must sign out/in to re-consent.

---

## How it works

- Join a room:
  - Visiting `/rooms/[code]` validates the room, upserts you into members, and fetches:
    - Members list
    - Common free windows (next 7 days) via Google Calendar FreeBusy
- Calendar:
  - FullCalendar renders only “Common free” background blocks (clean overlap view)
- AI schedule:
  - Button “Auto-schedule with AI” picks the earliest common free window
  - Sends members’ bios and window to OpenAI for a tailored suggestion
  - Creates an event on each member’s primary calendar (attendees + email updates)
  - If member locations exist, finds a venue near the centroid via Places and includes a Google Maps link
- Profiles:
  - `/profile` lets users view/edit a description; AI uses it to tailor activities
- Location:
  - Users can save approximate location (consent required); scheduler uses it to pick venues

---

## API (selected)

- GET `/api/rooms` – rooms created by or joined by the current user
- POST `/api/rooms` – create a room
- GET `/api/rooms/[code]` – get room by code (Supabase)
- GET/POST `/api/rooms/[code]/members` – list and join room members
- GET `/api/rooms/[code]/availability` – common free times (next 7 days)
- POST `/api/rooms/[code]/schedule` – AI suggest + create events (+ optional venue)
- GET/POST `/api/user/profile` – load/save profile bio
- GET/POST `/api/user/location` – load/save lat/lon

Auth: All room APIs require authenticated sessions.

---

## Security notes
- Keep `SUPABASE_SERVICE_ROLE` server-only; never expose it to the browser.
- RLS is enabled on user-owned tables; we only allow owners to read/write their own rows.
- Google refresh tokens may be revoked; the app refreshes access tokens when expired, otherwise prompts re-consent.

---

## Roadmap
- Date-range picker to fetch availability by visible range
- Category filters and rating/open-now constraints for venue search
- Multiple suggestion options and user voting
- iCal and Outlook calendar support

---

## License
MIT
