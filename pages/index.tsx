import Link from "next/link";
import { FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";

export default function Home() {
  return (
    <div className="relative isolate flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)] z-0">
        <div className="pointer-events-none absolute inset-0 animate-gradient-slow bg-[radial-gradient(60rem_60rem_at_top_right,rgba(99,102,241,0.20),transparent_60%),radial-gradient(60rem_60rem_at_-10%_120%,rgba(168,85,247,0.18),transparent_60%)]" />
      </div>

      <section className="relative z-10 pointer-events-auto mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pt-28 pb-16 text-center">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm animate-fade-up">
          Plan anything with your people
        </span>
        <h1 className="text-balance bg-gradient-to-br from-white to-white/70 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-7xl animate-fade-up [animation-delay:100ms]">
          Find a time, pick a place, book it for everyone
        </h1>
        <p className="max-w-2xl text-lg text-white/70 md:text-xl animate-fade-up [animation-delay:200ms]">
          SyncAI finds common availability, suggests nearby venues, and creates
          Google Calendar events—so your group can decide in one click.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row animate-fade-up [animation-delay:300ms]">
          <button
            type="button"
            onClick={() => (window.location.href = "/rooms")}
            className="group relative z-30 pointer-events-auto inline-flex h-12 items-center justify-center rounded-full bg-white px-6 font-semibold text-slate-900 transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            Get started
            <span
              aria-hidden
              className="ml-2 transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </button>
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/10"
          >
            See how it works
          </Link>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-3"
      >
        <Feature
          icon={<FiUsers className="h-6 w-6" />}
          title="Find common time"
          desc="Aggregates calendars and surfaces overlapping free windows."
          delay="0ms"
        />
        <Feature
          icon={<FiMapPin className="h-6 w-6" />}
          title="Pick the perfect spot"
          desc="Suggests nearby venues using Google Places and your group’s location."
          delay="80ms"
        />
        <Feature
          icon={<FiCalendar className="h-6 w-6" />}
          title="Auto‑book for everyone"
          desc="Creates Google Calendar events and updates attendees automatically."
          delay="160ms"
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: string;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur [--delay:0ms]"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-white/70">{desc}</p>
    </div>
  );
}
