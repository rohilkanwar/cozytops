import { config } from "../../config";

// OpenAI gpt-image-1 adapter. Returns a `data:` URL (base64 PNG).
// gpt-image-1 always responds with b64_json (no hosted URL), so we inline it.

export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

export async function generateOpenAiImage(
  prompt: string,
  size: ImageSize,
): Promise<string> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 55_000);

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.image.openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.image.openaiModel,
        prompt,
        size,
        quality: config.image.quality,
        n: 1,
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenAI image API ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI image API returned no image data");
    return `data:image/png;base64,${b64}`;
  } finally {
    clearTimeout(timeout);
  }
}
