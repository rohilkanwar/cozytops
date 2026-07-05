import { config } from "./config";

// Single OpenAI entry point for text + vision reasoning (style analysis and
// design briefs) via the Responses API. Image generation lives in
// design/providers/openai-image.ts and shares the same OPENAI_API_KEY.
//
// No silent fallbacks: a missing key, an API error, or an unparseable
// response all throw with a specific message that surfaces to the user.

export type OpenAiContentBlock =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string };

export function requireOpenAiKey(): string {
  if (!config.openai.apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured — analysis, design, and imagery all require it.",
    );
  }
  return config.openai.apiKey;
}

/** Calls the Responses API in JSON mode and returns the parsed object. */
export async function openaiJson(opts: {
  instructions: string;
  content: OpenAiContentBlock[];
  maxOutputTokens?: number;
}): Promise<unknown> {
  const key = requireOpenAiKey();

  // OpenAI's json_object mode requires the word "JSON" in the *input* messages
  // (instructions alone don't count) — enforce that invariant here.
  const content = opts.content.some(
    (b) => b.type === "input_text" && /json/i.test(b.text),
  )
    ? opts.content
    : [
        ...opts.content,
        { type: "input_text" as const, text: "Respond with ONLY the JSON object." },
      ];

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.openai.textModel,
      instructions: opts.instructions,
      input: [{ role: "user", content }],
      text: { format: { type: "json_object" } },
      max_output_tokens: opts.maxOutputTokens ?? 1600,
    }),
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let message = `OpenAI API ${res.status}`;
    try {
      const parsed = JSON.parse(raw) as { error?: { message?: string } };
      if (parsed.error?.message) message = `OpenAI ${res.status}: ${parsed.error.message}`;
    } catch {
      message = `${message}: ${raw.slice(0, 200)}`;
    }
    throw new Error(message);
  }

  const data = (await res.json()) as {
    status?: string;
    incomplete_details?: { reason?: string };
    error?: { message?: string } | null;
    output?: { type?: string; content?: { type?: string; text?: string }[] }[];
  };

  if (data.status !== "completed") {
    const why = data.error?.message || data.incomplete_details?.reason || data.status;
    throw new Error(`OpenAI response did not complete (${why}).`);
  }

  const text = (data.output ?? [])
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("\n");

  const parsed = extractJson<unknown>(text);
  if (parsed === null) {
    throw new Error("OpenAI returned no parseable JSON.");
  }
  return parsed;
}

/**
 * Pulls the first balanced JSON object/array out of a model response, even if
 * it's wrapped in prose or a ```json fence. Returns null if nothing parses.
 */
export function extractJson<T>(text: string): T | null {
  if (!text) return null;

  // Strip code fences if present.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const start = candidate.search(/[[{]/);
  if (start === -1) return null;

  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(start, i + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
