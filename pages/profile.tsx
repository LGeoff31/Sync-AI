import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiLogIn, FiUser, FiSettings, FiCheck } from "react-icons/fi";

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

  if (status === "loading")
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-white/80">Loading profile...</div>
      </div>
    );

  if (status !== "authenticated")
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-full bg-indigo-600/20 p-4 w-16 h-16 mx-auto flex items-center justify-center mb-6">
            <FiUser className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
          <p className="text-white/60 mb-8">
            Sign in to view and manage your profile preferences.
          </p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-indigo-500 hover:to-indigo-400 hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25"
          >
            <FiLogIn className="h-5 w-5" />
            <span>Sign in with Google</span>
          </button>
        </div>
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
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-indigo-600/20 p-3 flex items-center justify-center">
            <FiUser className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-white/60 mt-1">
              Manage your preferences and account information
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Account Information */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur h-fit">
          <div className="flex items-center gap-3 mb-4">
            <FiSettings className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/70">Name</label>
              <div className="mt-1 text-white font-medium">
                {data?.user?.name || "Anonymous"}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white/70">Email</label>
              <div className="mt-1 text-white font-medium">
                {data?.user?.email || "N/A"}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-sm text-white/60">
                Account managed by Google OAuth
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Activity Preferences
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Help us suggest better activities and venues for your groups
              </p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <FiCheck className="h-4 w-4" />
                Saved successfully
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Budget */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Budget Preference
              </label>
              <div className="flex gap-3">
                {(["$", "$$", "$$$"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrice(p)}
                    className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 border ${
                      price === p
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-lg">{p}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {p === "$" && "Budget"}
                      {p === "$$" && "Moderate"}
                      {p === "$$$" && "Premium"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Maximum Travel Distance: {distanceKm} km
              </label>
              <input
                type="range"
                min={1}
                max={25}
                step={1}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/50 mt-2">
                <span>1 km</span>
                <span>25 km</span>
              </div>
            </div>

            {/* Food Preferences */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Food Preferences ({foods.length} selected)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {FOOD_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggle(foods, f, setFoods)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border ${
                      foods.includes(f)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Preferences */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Activity Types ({activities.length} selected)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACTIVITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggle(activities, a, setActivities)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border ${
                      activities.includes(a)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dietary restrictions, accessibility needs, timing preferences, or any other details that help us suggest better activities..."
                className="w-full resize-none rounded-lg bg-slate-800/50 px-4 py-3 text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-white/10 mt-8">
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
                  setTimeout(() => setSaved(false), 3000);
                }
              }}
              className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-indigo-500 hover:to-indigo-400 hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
