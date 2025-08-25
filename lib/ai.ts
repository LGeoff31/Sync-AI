export type SuggestionInput = {
  members: { bio?: string | null; email: string }[]; // 'bio' carries profile/preferences text
  free: { start: string; end: string }[];
};

export async function suggestActivity(
  input: SuggestionInput
): Promise<{ title: string; description?: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const prompt = `You are an event planner. Participants include bios/preferences in 'bio' when present.
Suggest one realistic group activity tailored to the group's shared interests and constraints.
Requirements:
- short 'title' (<=60 chars)
- one-sentence 'description'
- consider overlap between bios; avoid activities that clearly don't fit.
Return strict JSON {"title":string,"description":string}.
Participants: ${JSON.stringify(input.members)}.
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
          { role: "system", content: "You are a helpful event planner." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
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
