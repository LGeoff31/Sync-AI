## SyncAI

SyncAI solves two simple problems; when are friends free and what activity should we do. 


Simply create a room, invite your friends, see everyone’s overlapping free time, and let AI pick the activity + book it on everyone’s calendar. Optionally tailor activity ideas through each member’s profile. The activity we pick will be close to the overall location of the group.

### Features
- Rooms
  - Create/join rooms by code (i.e WVYSS8)
  - View the rooms member list
- Availability
  - Visually displays shared free time amongst all room members via Google Calendar FreeBusy API
  - Overlap visualization with FullCalendar (Week/Day)
- AI scheduling
  - OpenAI suggests an activity and description based on the centroid location of all members
  - Automatically creates a calendar event for all members, invites attendees, and includes the activity link / location via Google Places
- Profiles
  - Each user can save a short bio (i.e I love puzzles and physical activities like running)
  - AI uses group bios to tailor activities

---

## Tech stack
- Next.js 15
- TypeScript, React 19
- NextAuth (Google provider)
- Supabase (Postgres + RLS)
- FullCalendar (timeGrid)
- OpenAI (chat completions)
- Google APIs (Calendar, Places)

---

## Architecture

---

## Database Architecture

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

## Roadmap
- Date-range picker to fetch availability by visible range
- Category filters and rating/open-now constraints for venue search
- Multiple suggestion options and user voting
- iCal and Outlook calendar support

---

## Next Steps
- Performance optimizations (reducing latency of AI scheduling)
- Integrate payments via stripe
- Improve UI/UX
- Create demo vid
- Create ios app
