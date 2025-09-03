import { useSession, signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FiLogIn } from "react-icons/fi";

export default function ProfilePage() {
  const { status, data } = useSession();
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  // Questionnaire state
  const [price, setPrice] = useState<"$" | "$$" | "$$$" | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(10);
  const [foods, setFoods] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");

  const FOOD_OPTIONS = [
    "Japanese",
    "Mexican",
    "Italian",
    "Indian",
    "Thai",
    "American",
    "Mediterranean",
    "Vegan",
    "Cafe",
  ];
  const ACTIVITY_OPTIONS = [
    "Physical",
    "Thinking",
    "Relaxing",
    "Outdoors",
    "Indoors",
    "Cultural",
  ];

  type Prefs = {
    price: "$" | "$$" | "$$$" | null;
    distanceKm: number;
    foods: string[];
    activities: string[];
    notes?: string;
  };

  const PREFS_PREFIX = "PREFS::";
  function composeBio(p: Prefs): string {
    const summary = [
      p.price ? `Budget ${p.price}` : null,
      p.distanceKm ? `Max distance ${p.distanceKm}km` : null,
      p.foods.length ? `Food: ${p.foods.join(", ")}` : null,
      p.activities.length ? `Activities: ${p.activities.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    const lines = [summary || "", p.notes?.trim() ? p.notes.trim() : ""].filter(
      Boolean
    );
    return `${lines.join("\n")}\n${PREFS_PREFIX}${JSON.stringify(p)}`;
  }

  function hydrateFromBio(existing: string) {
    try {
      const idx = existing.indexOf(PREFS_PREFIX);
      if (idx >= 0) {
        const json = existing.slice(idx + PREFS_PREFIX.length).trim();
        const prefs = JSON.parse(json) as Prefs;
        setPrice(prefs.price);
        setDistanceKm(
          typeof prefs.distanceKm === "number" ? prefs.distanceKm : 10
        );
        setFoods(Array.isArray(prefs.foods) ? prefs.foods : []);
        setActivities(Array.isArray(prefs.activities) ? prefs.activities : []);
        setNotes(typeof prefs.notes === "string" ? prefs.notes : "");
      } else {
        setNotes(existing);
      }
    } catch {
      setNotes(existing);
    }
  }

  useEffect(() => {
    (async () => {
      if (status !== "authenticated") return;
      const r = await fetch("/api/user/profile");
      const j = await r.json();
      if (r.ok && j.profile?.bio) {
        const existing = String(j.profile.bio);
        setBio(existing);
        hydrateFromBio(existing);
      }
    })();
  }, [status]);

  const preview = useMemo(() => {
    const prefs: Prefs = { price, distanceKm, foods, activities, notes };
    return composeBio(prefs);
  }, [price, distanceKm, foods, activities, notes]);

  if (status === "loading") return <div className="p-6">Loading profile…</div>;
  if (status !== "authenticated")
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-white/70">Sign in to view your profile.</p>
        <button
          onClick={() => signIn("google")}
          className="mt-4 rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition inline-flex items-center gap-2"
        >
          <FiLogIn className="h-4 w-4" />
          <span>Sign in with Google</span>
        </button>
      </div>
    );

  function toggle(
    list: string[],
    value: string,
    setter: (v: string[]) => void
  ) {
    setter(
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <h2 className="text-lg font-medium">Preferences</h2>
          <p className="mt-1 text-sm text-white/70">
            Answer a few quick questions so we can suggest better activities.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium">Budget</div>
              <div className="mt-2 flex gap-2">
                {(["$", "$$", "$$$"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrice(p)}
                    className={`rounded-full px-3 py-1.5 text-sm transition border ${
                      price === p
                        ? "bg-white text-slate-900 border-white"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Max distance (km)</div>
              <div className="mt-2">
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-white/70">
                  {distanceKm} km
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium">Food you like</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {FOOD_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggle(foods, f, setFoods)}
                    className={`rounded-full px-3 py-1.5 text-sm transition border ${
                      foods.includes(f)
                        ? "bg-white text-slate-900 border-white"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium">Activities you enjoy</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggle(activities, a, setActivities)}
                    className={`rounded-full px-3 py-1.5 text-sm transition border ${
                      activities.includes(a)
                        ? "bg-white text-slate-900 border-white"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm font-medium">Notes (optional)</div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dietary needs, accessibility, timing preferences, etc."
                className="mt-2 w-full resize-none rounded-md bg-slate-900/60 px-3 py-2 text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-indigo-400/40"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-white/60">
              Preview (saved as part of your profile):
              <div className="mt-1 whitespace-pre-wrap rounded-md border border-white/10 bg-slate-900/40 p-3 text-white/80">
                {preview}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const prefs: Prefs = {
                    price,
                    distanceKm,
                    foods,
                    activities,
                    notes,
                  };
                  const composed = composeBio(prefs);
                  const r = await fetch("/api/user/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bio: composed }),
                  });
                  if (r.ok) {
                    setBio(composed);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 1500);
                  }
                }}
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-indigo-400 transition"
              >
                Save
              </button>
              {saved && <div className="text-xs text-emerald-400">Saved</div>}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-medium">Your info</h2>
          <div className="mt-3 space-y-2 text-white/80">
            <div>Name: {data.user?.name || "Anonymous"}</div>
            <div>Email: {data.user?.email || "N/A"}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
