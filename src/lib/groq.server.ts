// Server-only: Groq chat completions helper.
// The GROQ_API_KEY secret is injected as env at request time.

export type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

export interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function groqChat(messages: GroqMessage[], opts: GroqOptions = {}): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured on the server.");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.max_tokens ?? 4096,
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");
  return content;
}

export async function groqJson<T = unknown>(messages: GroqMessage[], opts: GroqOptions = {}): Promise<T> {
  const raw = await groqChat(messages, { ...opts, response_format: { type: "json_object" } });
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Groq returned invalid JSON.");
  }
}
