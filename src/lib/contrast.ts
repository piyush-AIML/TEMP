/** Canvases a token can sit on. Values copied from globals.css. */
export const LIGHT_CANVASES = ['#ffffff', '#f6f9fc', '#eaf3fb', '#eaf6ff'] as const;
export const DARK_CANVASES = ['#0b0f1e', '#10152a', '#141b38', '#141d57'] as const;

export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

/** `#rgb` or `#rrggbb` → [r, g, b] in 0-255. */
function toRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** WCAG 2.1 sRGB linearisation. */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** Guards against a silently `undefined` token producing a NaN ratio. */
function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

/** WCAG contrast ratio, 1:1 to 21:1. Order-independent. */
export function contrastRatio(a: string, b: string): number {
  if (!isHex(a) || !isHex(b)) {
    throw new Error(`contrastRatio expects hex colours, received ${String(a)} and ${String(b)}`);
  }
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}
