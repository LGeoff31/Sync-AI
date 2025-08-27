export type SuggestionInput = {
  members: { bio?: string | null; email: string }[]; // 'bio' carries profile/preferences text
  free: { start: string; end: string }[];
};

// Lightweight catalog to encourage variety. AI must pick ONE at random.
const ACTIVITY_CATALOG = [
  "Food & Drinks",
  "Escape Room",
  "Bowling",
  "Mini Golf / Putting",
  "Karaoke",
  "Board Games Cafe",
  "Trivia Night",
  "Live Music",
  "Hiking / Nature Walk",
  "Museum / Gallery",
  "Arcade / Barcade",
  "Axe Throwing",
  "Comedy Show",
  "Cooking Class",
  "Pottery / Craft Studio",
  "Indoor Climbing",
  "Pick‑up Sports (basketball, volleyball)",
];

export async function suggestActivity(
  input: SuggestionInput,
  opts?: { seed?: number }
): Promise<{ title: string; description?: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const seed =
    typeof opts?.seed === "number"
      ? opts.seed
      : Math.floor(Math.random() * 1_000_000);
  const category = ACTIVITY_CATALOG[seed % ACTIVITY_CATALOG.length];
  const prompt = `You are an upbeat social planner.
Goal: Suggest ONE activity for a group. Variety matters more than matching bios.

Rules:
- Randomly commit to this category: "${category}" from a diverse catalog (do not switch categories).
- Keep tailoring TINY: only adjust details that clearly fit common hints in bios (diet, accessibility, broad interests, max distance, etc). Avoid overfitting.
- Ensure you respect the max distance constraint in bios.
- Avoid repeating niche picks like cooking classes unless all bios explicitly mention it.
- Title <= 60 chars. Description = one short sentence.
- Output strict JSON: {"title": string, "description": string} ONLY.

Participants (with optional bios): ${JSON.stringify(input.members)}.
Common free windows (ISO): ${JSON.stringify(input.free)}.`;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, decisive social planner who prioritizes variety and fun with light personalization.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 1.0,
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      title?: string;
      description?: string;
    };
    if (!parsed?.title) return null;
    return { title: parsed.title, description: parsed.description };
  } catch {
    return null;
  }
}
