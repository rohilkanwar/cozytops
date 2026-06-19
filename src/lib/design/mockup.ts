import type { DesignBrief, GarmentType } from "../types";

// ---------------------------------------------------------------------------
// Procedural SVG garment mockups. Given a DesignBrief, render a clean flat-lay
// illustration that reflects the chosen colors, pattern, and monogram patch —
// zero external dependencies, deterministic, and crisp at any size.
//
// (Seam for the future: swap renderMockup() for an image-generation model and
//  keep the same call site.)
// ---------------------------------------------------------------------------

const FILL_BOX = { x: 56, y: 138, w: 368, h: 360 };

interface Geometry {
  outline: string; // path d for the garment silhouette (also the pattern clip)
  collar: string; // svg fragment drawn on top (ribbing / lapels)
  cuffs: string; // svg fragment for cuff ribbing
  hem: string; // svg fragment for hem ribbing
  chest: { x: number; y: number };
  extras: (accent: string, secondary: string) => string; // pockets/placket/etc.
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string),
  );
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function readableOn(hex: string): string {
  return luminance(hex) > 0.55 ? "#241A15" : "#F6EFE2";
}

/** Deterministic small PRNG so speckle patterns are stable per design. */
function seeded(seedStr: string): () => number {
  let s = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    s ^= seedStr.charCodeAt(i);
    s = Math.imul(s, 16777619);
  }
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

const GEOMETRY: Record<GarmentType, Geometry> = {
  sweater: {
    outline:
      "M200,150 L160,150 C133,150 120,165 96,200 L72,236 C67,245 71,255 81,259 L119,271 C131,275 139,269 145,257 L160,230 L160,468 C160,477 167,484 176,484 L304,484 C313,484 320,477 320,468 L320,230 L335,257 C341,269 349,275 361,271 L399,259 C409,255 413,245 408,236 L384,200 C360,165 347,150 320,150 L280,150 Q240,186 200,150 Z",
    collar:
      '<path d="M196,150 Q240,186 284,150" fill="none" stroke="ACCENT" stroke-width="11" stroke-linecap="round" />',
    cuffs:
      '<path d="M76,242 L120,262" stroke="ACCENT" stroke-width="12" stroke-linecap="round" /><path d="M404,242 L360,262" stroke="ACCENT" stroke-width="12" stroke-linecap="round" />',
    hem: '<rect x="160" y="462" width="160" height="22" rx="6" fill="ACCENT" opacity="0.92" />',
    chest: { x: 240, y: 300 },
    extras: () => "",
  },
  tee: {
    outline:
      "M196,152 L150,152 C150,152 132,156 112,196 L150,214 C158,218 168,214 172,202 L176,196 L176,470 C176,478 182,484 190,484 L290,484 C298,484 304,478 304,470 L304,196 L308,202 C312,214 322,218 330,214 L368,196 C348,156 330,152 330,152 L284,152 Q240,188 196,152 Z",
    collar:
      '<path d="M194,152 Q240,190 286,152" fill="none" stroke="ACCENT" stroke-width="10" stroke-linecap="round" />',
    cuffs:
      '<path d="M120,198 L156,210" stroke="ACCENT" stroke-width="9" stroke-linecap="round" /><path d="M360,198 L324,210" stroke="ACCENT" stroke-width="9" stroke-linecap="round" />',
    hem: '<rect x="176" y="466" width="128" height="18" rx="5" fill="ACCENT" opacity="0.85" />',
    chest: { x: 240, y: 296 },
    extras: () => "",
  },
  jacket: {
    outline:
      "M205,150 L160,150 C133,150 120,165 96,200 L72,236 C67,245 71,255 81,259 L119,271 C131,275 139,269 145,257 L160,230 L160,476 L320,476 L320,230 L335,257 C341,269 349,275 361,271 L399,259 C409,255 413,245 408,236 L384,200 C360,165 347,150 320,150 L275,150 L240,202 Z",
    collar:
      '<path d="M205,150 L240,202 L275,150" fill="none" stroke="ACCENT" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" /><path d="M205,150 L226,150 L240,184 Z" fill="SECONDARY" /><path d="M275,150 L254,150 L240,184 Z" fill="SECONDARY" />',
    cuffs:
      '<path d="M76,242 L120,262" stroke="ACCENT" stroke-width="12" stroke-linecap="round" /><path d="M404,242 L360,262" stroke="ACCENT" stroke-width="12" stroke-linecap="round" />',
    hem: '<rect x="160" y="466" width="160" height="10" fill="ACCENT" opacity="0.8" />',
    chest: { x: 205, y: 268 },
    extras: (accent) =>
      `<line x1="240" y1="202" x2="240" y2="476" stroke="${accent}" stroke-width="2.5" stroke-dasharray="2 5" opacity="0.7" />` +
      [248, 300, 352, 404, 452]
        .map((cy) => `<circle cx="240" cy="${cy}" r="5" fill="${accent}" />`)
        .join("") +
      `<rect x="258" y="250" width="56" height="48" rx="6" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.85" />`,
  },
};

function patternFill(brief: DesignBrief): string {
  const { primaryColor: p, secondaryColor: s, accentColor: a } = brief;
  const { x, y, w, h } = FILL_BOX;
  const base = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p}" />`;

  switch (brief.pattern) {
    case "solid":
      return base;

    case "gradient":
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#grad)" />`;

    case "stripes": {
      let out = base;
      for (let yy = y, i = 0; yy < y + h; yy += 26, i++) {
        if (i % 2 === 1)
          out += `<rect x="${x}" y="${yy}" width="${w}" height="13" fill="${s}" />`;
      }
      return out;
    }

    case "colorblock": {
      // primary body, secondary yoke, one bold accent band
      return (
        base +
        `<rect x="${x}" y="${y}" width="${w}" height="96" fill="${s}" />` +
        `<rect x="${x}" y="${y + 168}" width="${w}" height="22" fill="${a}" opacity="0.92" />`
      );
    }

    case "speckle": {
      const rnd = seeded(brief.title + brief.primaryColor);
      let out = base;
      for (let i = 0; i < 90; i++) {
        const cx = x + rnd() * w;
        const cy = y + rnd() * h;
        const r = 1.5 + rnd() * 3;
        const col = rnd() > 0.5 ? s : a;
        out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" opacity="0.55" />`;
      }
      return out;
    }

    case "fairisle": {
      // primary base + a patterned yoke band on the chest
      const bandY = 206;
      const bandH = 58;
      let out = base;
      out += `<rect x="${x}" y="${bandY}" width="${w}" height="${bandH}" fill="${s}" />`;
      out += `<rect x="${x}" y="${bandY - 8}" width="${w}" height="4" fill="${a}" />`;
      out += `<rect x="${x}" y="${bandY + bandH + 4}" width="${w}" height="4" fill="${a}" />`;
      // repeating diamonds
      for (let cx = x + 16; cx < x + w; cx += 34) {
        const cy = bandY + bandH / 2;
        out += `<path d="M${cx},${cy - 14} L${cx + 13},${cy} L${cx},${cy + 14} L${cx - 13},${cy} Z" fill="${a}" opacity="0.9" />`;
        out += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${p}" />`;
      }
      return out;
    }

    default:
      return base;
  }
}

/** Renders a full standalone SVG document string for the given design. */
export function renderMockup(brief: DesignBrief): string {
  const geo = GEOMETRY[brief.garment];
  const { primaryColor: p, secondaryColor: s, accentColor: a } = brief;

  const ribbing = (frag: string) =>
    frag.replace(/ACCENT/g, a).replace(/SECONDARY/g, s);

  const badgeText = readableOn("#F6EFE2");
  const ringColor = luminance(p) < luminance(a) ? p : a;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 560" role="img" aria-label="${escapeXml(brief.title)} mockup">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p}" />
      <stop offset="100%" stop-color="${s}" />
    </linearGradient>
    <clipPath id="garmentClip"><path d="${geo.outline}" /></clipPath>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#3B2C24" flood-opacity="0.18" />
    </filter>
  </defs>

  <rect width="480" height="560" fill="#FAF4EB" />
  <ellipse cx="240" cy="312" rx="180" ry="190" fill="#F1E7D6" opacity="0.7" />

  <g filter="url(#soft)">
    <path d="${geo.outline}" fill="${p}" />
    <g clip-path="url(#garmentClip)">
      ${patternFill(brief)}
    </g>
    <path d="${geo.outline}" fill="none" stroke="#3B2C24" stroke-opacity="0.28" stroke-width="2.5" />
    ${ribbing(geo.collar)}
    ${ribbing(geo.cuffs)}
    ${ribbing(geo.hem)}
    ${geo.extras(a, s)}

    <g transform="translate(${geo.chest.x}, ${geo.chest.y})">
      <circle r="26" fill="#F6EFE2" stroke="${ringColor}" stroke-width="3" />
      <text x="0" y="1" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, serif" font-size="22" font-weight="700" fill="${badgeText}">${escapeXml(
          brief.monogram,
        )}</text>
    </g>
  </g>
</svg>`;
}
