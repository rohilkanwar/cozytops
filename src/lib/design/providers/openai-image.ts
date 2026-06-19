import { config } from "../../config";

// OpenAI image adapter (gpt-image-2 / gpt-image-1). Returns a `data:` URL.
// These models always respond with base64 (no hosted URL), so we inline it.
// We request JPEG with light compression to keep high-res payloads small.

export type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";

export async function generateOpenAiImage(
  prompt: string,
  size: ImageSize,
): Promise<string> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 58_000);

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
        output_format: "jpeg",
        output_compression: 90,
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      throw new Error(await readError(res));
    }

    const data = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error("The image model returned no image data.");
    return `data:image/jpeg;base64,${b64}`;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "The image model took too long to respond (over 58s). Try a lower IMAGE_QUALITY or a larger serverless time limit.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Surface OpenAI's structured error message (e.g. the org-verification 403).
async function readError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    if (parsed.error?.message) {
      return `OpenAI ${res.status}: ${parsed.error.message}`;
    }
  } catch {
    /* fall through to raw text */
  }
  return `OpenAI image API ${res.status}: ${raw.slice(0, 300)}`;
}
