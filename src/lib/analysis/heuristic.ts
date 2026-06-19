import type { InstagramProfile, StyleProfile, StyleEvidence } from "../types";
import { AESTHETICS, NEUTRAL_AESTHETIC, COLOR_WORDS, type AestheticDef } from "./lexicon";

// Deterministic, no-API-key style analyzer. Scores the profile's text against
// the aesthetic lexicon and assembles a coherent StyleProfile. This is the
// always-available floor under the Claude-powered path.

function postText(profile: InstagramProfile): { id: string; text: string }[] {
  return profile.posts.map((p) => ({
    id: p.id,
    text: `${p.caption} ${p.hashtags.join(" ")} ${p.imageAlt}`.toLowerCase(),
  }));
}

function scoreAesthetic(def: AestheticDef, corpus: string): number {
  let score = 0;
  for (const kw of def.keywords) {
    // Count non-overlapping occurrences of each keyword.
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const hits = corpus.match(re);
    if (hits) score += hits.length;
  }
  return score;
}

function detectColors(corpus: string) {
  const found: { name: string; hex: string }[] = [];
  const seen = new Set<string>();
  for (const [word, swatch] of Object.entries(COLOR_WORDS)) {
    if (corpus.includes(word) && !seen.has(swatch.hex)) {
      seen.add(swatch.hex);
      found.push(swatch);
    }
  }
  return found;
}

export function analyzeHeuristic(profile: InstagramProfile): StyleProfile {
  const posts = postText(profile);
  const corpus = posts.map((p) => p.text).join("  ");

  // Rank aesthetics.
  const ranked = AESTHETICS.map((def) => ({ def, score: scoreAesthetic(def, corpus) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const dominant = top.score > 0 ? top.def : NEUTRAL_AESTHETIC;
  const runnerUp = ranked[1]?.score > 0 ? ranked[1].def : null;

  // Aesthetics tags: dominant label + a couple of traits + runner-up flavor.
  const aesthetics = Array.from(
    new Set([
      dominant.label,
      ...dominant.traits.slice(0, 2),
      ...(runnerUp ? [runnerUp.label] : []),
    ]),
  );

  // Palette: dominant base, lightly enriched with explicitly mentioned colors.
  const detected = detectColors(corpus);
  const palette = [...dominant.palette];
  for (const c of detected) {
    if (palette.length >= 6) break;
    if (!palette.some((p) => p.hex === c.hex)) palette.push(c);
  }

  // Evidence: surface the posts that drove the read.
  const evidence: StyleEvidence[] = [];
  for (const p of posts) {
    if (evidence.length >= 4) break;
    const hit = dominant.keywords.find((kw) => p.text.includes(kw));
    if (hit) {
      evidence.push({
        postId: p.id,
        observation: `References "${hit}" — a hallmark of the ${dominant.label} look.`,
      });
    }
  }
  if (evidence.length === 0 && posts.length > 0) {
    evidence.push({
      postId: posts[0].id,
      observation: "Consistent tone and styling across recent posts.",
    });
  }

  // Confidence scales with signal volume.
  const totalHits = ranked.reduce((s, r) => s + r.score, 0);
  const confidence = Math.max(
    0.4,
    Math.min(0.95, 0.45 + totalHits * 0.035 + profile.posts.length * 0.02),
  );

  return {
    handle: profile.handle,
    vibeName: dominant.vibeName,
    summary: dominant.summary,
    palette: palette.slice(0, 6),
    aesthetics,
    garmentAffinities: dominant.garments,
    motifs: dominant.motifs,
    textures: dominant.textures,
    personaTraits: dominant.traits,
    signatureMotif: dominant.signature,
    confidence: Math.round(confidence * 100) / 100,
    evidence,
  };
}
