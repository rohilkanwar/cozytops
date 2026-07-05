import { config } from "../../config";

// Async OpenAI image generation via the Responses API "background mode".
// gpt-image-2 at high quality takes 100-150s — far past a serverless function's
// time limit — so instead of one long call we (1) start a background job that
// returns immediately, then (2) poll a lightweight status endpoint until the
// image is ready. Every individual request stays well under the 60s limit.

export type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";

const RESPONSES_URL = "https://api.openai.com/v1/responses";
// Cheap tool-capable model that drives the image_generation tool; the actual
// pixels come from `config.image.openaiModel` (gpt-image-2).
const ORCHESTRATOR_MODEL = process.env.OPENAI_ORCHESTRATOR_MODEL || "gpt-4.1-mini";

function headers() {
  if (!config.image.openaiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured — photorealistic rendering is unavailable.",
    );
  }
  return {
    Authorization: `Bearer ${config.image.openaiKey}`,
    "Content-Type": "application/json",
  };
}

/** Starts a background image job and returns its id (resolves in ~1s). */
export async function startImageJob(prompt: string, size: ImageSize): Promise<string> {
  const res = await fetch(RESPONSES_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: ORCHESTRATOR_MODEL,
      input: prompt,
      tools: [
        {
          type: "image_generation",
          model: config.image.openaiModel,
          quality: config.image.quality,
          size,
          output_format: "jpeg",
          output_compression: 85,
        },
      ],
      background: true,
      store: true,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error("Image job did not return an id.");
  return data.id;
}

export type PollResult =
  | { status: "pending" }
  | { status: "completed"; src: string }
  | { status: "failed"; error: string };

/** Checks a background job; returns the image (data URL) once complete. */
export async function pollImageJob(id: string): Promise<PollResult> {
  const res = await fetch(`${RESPONSES_URL}/${encodeURIComponent(id)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as {
    status?: string;
    error?: { message?: string } | null;
    output?: { type?: string; result?: string }[];
  };

  if (data.status === "queued" || data.status === "in_progress") {
    return { status: "pending" };
  }
  if (data.status === "completed") {
    const call = (data.output || []).find((o) => o.type === "image_generation_call");
    if (!call?.result) {
      return { status: "failed", error: "Image job completed without an image." };
    }
    return { status: "completed", src: `data:image/jpeg;base64,${call.result}` };
  }
  return {
    status: "failed",
    error: data.error?.message || `Image job ${data.status ?? "failed"}.`,
  };
}

async function readError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    if (parsed.error?.message) return `OpenAI ${res.status}: ${parsed.error.message}`;
  } catch {
    /* fall through */
  }
  return `OpenAI API ${res.status}: ${raw.slice(0, 300)}`;
}
