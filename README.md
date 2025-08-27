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
