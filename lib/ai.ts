export type SuggestionInput = {
  members: { name?: string | null; email: string }[];
  free: { start: string; end: string }[];
};

export async function suggestActivity(
  input: SuggestionInput
): Promise<{ title: string; description?: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const prompt = `Given these participants and their common free time windows, suggest one fun, realistic group activity with a short title (<= 60 chars) and a one-sentence description. Output JSON with keys title and description. Participants: ${JSON.stringify(
    input.members
  )}. Free windows (ISO): ${JSON.stringify(input.free)}.`;
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
