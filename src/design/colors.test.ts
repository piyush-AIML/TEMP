import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  AA_NON_TEXT,
  AA_TEXT,
  DARK_CANVASES,
  LIGHT_CANVASES,
  contrastRatio,
} from '@/lib/contrast';
import { pillars } from '@/data/pillars';
import {
  borderColor,
  brand,
  canvas,
  programmeColors,
  reservedPillarAccents,
  semantic,
  type PillarAccent,
} from './colors';

/**
 * Enforces Landing-Redesign-Plan.md §6: every pillar text tier clears AA on
 * every canvas it can sit on, in both themes, and every graphic tier clears
 * the non-text threshold. This test is the reason a future palette edit cannot
 * silently regress accessibility.
 */

/**
 * Derived from the registry, never restated. A hand-written list here meant a
 * sixth pillar's colours were never measured against the AA floors while the
 * suite stayed green — the failure mode §7.4 says this test exists to prevent.
 */
const PILLAR_IDS = pillars.map((pillar) => pillar.id);

/** Worst-case ratio across a set of canvases — the number that must clear the floor. */
function worst(hex: string, canvases: readonly string[]): number {
  return Math.min(...canvases.map((canvas) => contrastRatio(hex, canvas)));
}

describe('pillar accents', () => {
  it('the palette and the pillar registry cover the same set of ids', () => {
    // The per-pillar tests below are only as complete as PILLAR_IDS. This
    // asserts the two sources agree in both directions, so a sixth pillar
    // cannot be present in one and absent from the other.
    expect(Object.keys(programmeColors).sort()).toEqual(pillars.map((p) => p.id).sort());
  });

  for (const id of PILLAR_IDS) {
    const accent = programmeColors[id];

    it(`${id}: exposes all six tiers`, () => {
      expect(accent).toBeDefined();
      expect(Object.keys(accent).sort()).toEqual([
        'graphicDark',
        'graphicLight',
        'softDark',
        'softLight',
        'textDark',
        'textLight',
      ]);
    });

    it(`${id}: light text tier clears AA on every light canvas`, () => {
      expect(worst(accent.textLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${id}: dark text tier clears AA on every dark canvas`, () => {
      expect(worst(accent.textDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${id}: light graphic tier clears the non-text threshold on white`, () => {
      expect(contrastRatio(accent.graphicLight, '#ffffff')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${id}: dark graphic tier clears the non-text threshold on the dark canvas`, () => {
      expect(contrastRatio(accent.graphicDark, '#0b0f1e')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${id}: dark soft wash reads as a tint on both dark canvases`, () => {
      // Spec §6.3. Floors: >=1.15 against the darkest canvas, >=1.02 against
      // the lighter one. The second floor is the derived equivalent of the
      // first — a wash always scores 1.1292x higher against #0b0f1e than
      // against #141b38, because #0b0f1e is darker.
      //
      // There is deliberately NO upper bound. A wash that clears 1.15 on the
      // darker canvas necessarily exceeds 1.25 on the lighter one, and that is
      // correct: it is a tint against a lighter surface. An earlier draft of
      // the spec demanded 1.15-1.25 on *both*, which is unsatisfiable.
      expect(contrastRatio(accent.softDark, '#0b0f1e')).toBeGreaterThanOrEqual(1.15);
      expect(contrastRatio(accent.softDark, '#141b38')).toBeGreaterThanOrEqual(1.02);
    });
  }

  it('reserved slots 6 and 7 are also AA-verified', () => {
    for (const accent of reservedPillarAccents) {
      expect(worst(accent.textLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(worst(accent.textDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});

describe('brand chrome', () => {
  it('teal text tier clears AA on every light canvas', () => {
    expect(worst(brand.tealTextLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('the primary CTA pairing clears AA: gold fill against indigo-deep text', () => {
    // Button.tsx's `primary` variant is `bg-ec-gold text-ec-indigo-dark
    // hover:bg-ec-gold-dark`. Measuring tokens only against canvases cannot
    // see a broken token-against-token pair — and this one silently regressed
    // to 2.64:1 (hover 1.86:1) when `--ec-gold` was darkened as if it were a
    // text token. Assert the hover state too, not just the resting one.
    expect(contrastRatio(brand.goldFillLight, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(brand.goldHoverLight, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(brand.goldFillDark, brand.indigoDeep)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('slate clears AA in both themes', () => {
    expect(worst(brand.slateLight, LIGHT_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(worst(brand.slateDark, DARK_CANVASES)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

/* ---------------------------------------------------------------------------
   The colors.ts <-> globals.css mirror
--------------------------------------------------------------------------- */

/**
 * The invariant CLAUDE.md calls out by name: `colors.ts` is the
 * documentation-and-measurement source, but `globals.css` is what paints. The
 * two files carry the same hexes by hand, so **a value present in only one of
 * them passes every other test in this suite and renders nothing**. That has
 * shipped broken once.
 *
 * The tests above cannot see it: they measure the tokens in `colors.ts`, which
 * is exactly the file an edit is *supposed* to touch. Everything below reads
 * `globals.css` off disk and asserts the bytes are the same, in both
 * directions, so a one-sided edit is red rather than invisible.
 *
 * The pairing is written out rather than derived from a naming convention.
 * `canvas.DEFAULT` is the light block's `--ec-canvas` and `canvas.DEFAULT_DARK`
 * is the dark block's `--ec-canvas`; `brand.indigoDeep` names a property with a
 * `-dark` suffix that lives in the light block; `brand.goldFillLight` is
 * `--ec-gold`, not `--ec-gold-fill`. A convention that "mostly" holds is how a
 * mirror test starts asserting the wrong pair and passing anyway — which is
 * worse than no test.
 */

const GLOBALS_CSS = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf8');

type Theme = 'light' | 'dark';

/**
 * CSS comments are not declarations. Stripped first so a commented-out
 * `--ec-x: #000;` is not read as a live, unmapped token — the one way a
 * text-level sweep can report a phantom.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * The body of the rule opened by `selector`, by brace matching.
 *
 * Not "everything up to the first `}`": `:root` and `.dark` contain no nested
 * rules today, but a helper that stopped at the first closing brace would
 * silently truncate the moment one gained a nested block, and a truncated body
 * reads as "these declarations are absent" rather than as an error.
 */
function ruleBody(selector: string): string {
  const source = stripComments(GLOBALS_CSS);
  const pattern = new RegExp(`^\\s*${selector.replace('.', '\\.')}\\s*\\{`, 'm');
  const found = pattern.exec(source);
  if (!found) throw new Error(`globals.css has no \`${selector}\` rule`);

  const open = found.index + found[0].length - 1;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`globals.css: \`${selector}\` rule is never closed`);
}

/** Every custom property declared in one theme block, lower-cased for comparison. */
function themeVars(theme: Theme): Record<string, string> {
  const body = ruleBody(theme === 'light' ? ':root' : '.dark');
  const out: Record<string, string> = {};
  const declaration = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = declaration.exec(body)) !== null) {
    out[match[1]] = match[2].trim().toLowerCase();
  }
  return out;
}

const TS_OBJECTS: Record<string, unknown> = {
  programmeColors,
  brand,
  canvas,
  borderColor,
  semantic,
};

/** Reads `a.b.c` out of the objects above. Throws rather than returning undefined. */
function readField(field: string): string {
  let current: unknown = TS_OBJECTS;
  for (const part of field.split('.')) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      throw new Error(`colors.ts has no \`${field}\` — the mirror table names a field that does not exist`);
    }
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current !== 'string') {
    throw new Error(`colors.ts \`${field}\` is not a hex string: ${JSON.stringify(current)}`);
  }
  return current.toLowerCase();
}

/** `[colors.ts field path, globals.css custom property, which theme block]`. */
type Pair = readonly [tsField: string, cssVar: string, theme: Theme];

/**
 * The six `PillarAccent` tiers and where each one lands.
 *
 * `satisfies` over `keyof PillarAccent`, so a seventh tier is a compile error
 * here rather than a tier that silently goes unmirrored. The pairing is by
 * tier name: `softLight` and `softDark` are the *same* custom property in the
 * two blocks, so `softLight -> softDark` — the mapping that looks plausible —
 * would put a near-white on a dark canvas and pass vacuously.
 */
const PILLAR_TIERS = {
  textLight: { theme: 'light', suffix: '' },
  textDark: { theme: 'dark', suffix: '' },
  graphicLight: { theme: 'light', suffix: '-graphic' },
  graphicDark: { theme: 'dark', suffix: '-graphic' },
  softLight: { theme: 'light', suffix: '-soft' },
  softDark: { theme: 'dark', suffix: '-soft' },
} as const satisfies Record<keyof PillarAccent, { theme: Theme; suffix: string }>;

/**
 * The 69 pairs. Verified against both files by reading them, not by deriving
 * the names — see the note above on why.
 */
const PAIRS: readonly Pair[] = [
  ...PILLAR_IDS.flatMap((id) =>
    Object.entries(PILLAR_TIERS).map(
      ([tier, { theme, suffix }]): Pair => [`programmeColors.${id}.${tier}`, `--ec-p-${id}${suffix}`, theme]
    )
  ),

  // Brand chrome. `indigoDeep` is the one field whose custom property carries
  // a `-dark` suffix while living in the *light* block: `--ec-indigo-dark` is
  // a ramp step below `--ec-indigo`, not a dark-theme value. Both blocks
  // declare it, so it is mirrored twice.
  ['brand.indigoLight', '--ec-indigo', 'light'],
  ['brand.indigoDeep', '--ec-indigo-dark', 'light'],
  ['brand.indigoDeep', '--ec-indigo-dark', 'dark'],
  ['brand.tealTextLight', '--ec-teal', 'light'],
  ['brand.tealTextDark', '--ec-teal', 'dark'],
  ['brand.tealGraphicLight', '--ec-teal-graphic', 'light'],
  ['brand.tealGraphicDark', '--ec-teal-graphic', 'dark'],
  ['brand.goldFillLight', '--ec-gold', 'light'],
  ['brand.goldFillDark', '--ec-gold', 'dark'],
  ['brand.goldHoverLight', '--ec-gold-dark', 'light'],
  ['brand.goldHoverDark', '--ec-gold-dark', 'dark'],
  ['brand.goldSoftLight', '--ec-gold-light', 'light'],
  ['brand.goldSoftDark', '--ec-gold-light', 'dark'],
  ['brand.goldGraphicLight', '--ec-gold-graphic', 'light'],
  ['brand.goldGraphicDark', '--ec-gold-graphic', 'dark'],
  ['brand.slateLight', '--ec-slate', 'light'],
  ['brand.slateDark', '--ec-slate', 'dark'],
  ['brand.inkLight', '--ec-ink', 'light'],
  ['brand.inkDark', '--ec-ink', 'dark'],

  ['canvas.DEFAULT', '--ec-canvas', 'light'],
  ['canvas.DEFAULT_DARK', '--ec-canvas', 'dark'],
  ['canvas.soft', '--ec-canvas-soft', 'light'],
  ['canvas.softDark', '--ec-canvas-soft', 'dark'],
  ['canvas.deep', '--ec-canvas-deep', 'light'],
  ['canvas.deepDark', '--ec-canvas-deep', 'dark'],
  ['canvas.sky', '--ec-sky', 'light'],
  ['canvas.skyDark', '--ec-sky', 'dark'],

  ['borderColor.light', '--ec-border', 'light'],
  ['borderColor.dark', '--ec-border', 'dark'],

  ['semantic.success', '--ec-success', 'light'],
  ['semantic.successDark', '--ec-success', 'dark'],
  ['semantic.warning', '--ec-warning', 'light'],
  ['semantic.warningDark', '--ec-warning', 'dark'],
  ['semantic.error', '--ec-error', 'light'],
  ['semantic.errorDark', '--ec-error', 'dark'],
  ['semantic.info', '--ec-info', 'light'],
  ['semantic.infoDark', '--ec-info', 'dark'],
  ['semantic.focusLight', '--ec-focus', 'light'],
  ['semantic.focusDark', '--ec-focus', 'dark'],
];

/**
 * `theme|custom-property` keys that legitimately have **no** `colors.ts`
 * counterpart. These are one-directional by design, and each is a ramp step or
 * an alias rather than a palette value — so mirroring them would be asserting
 * a relationship that does not exist.
 *
 * Named rather than pattern-matched, and asserted for exact equality below: a
 * new one-directional var has to be added here deliberately, which is the
 * point at which someone asks whether it should have a `colors.ts` field.
 */
const ONE_DIRECTIONAL = [
  // Ramp steps around the brand indigo: darker/lighter than `--ec-indigo`,
  // which is the value `brand.indigoLight` owns. `.dark --ec-indigo` is a
  // third indigo again (#3b4896), the dark canvas's own step.
  'light|--ec-indigo-light',
  'dark|--ec-indigo-light',
  'dark|--ec-indigo',
  // Teal ramp. `--ec-teal` is the text-safe tier and `--ec-teal-dark` is
  // strictly darker on white at the same hue. `--ec-teal-light` is an extreme
  // alias — the graphic tier in the light block (#12a0ac, the value
  // `--ec-teal-graphic` also holds there) and the text tier in the dark block
  // (#4fd4dc, the value `--ec-teal` also holds there). globals.css names its
  // purpose: "the graphic tier used as `dark:text-ec-teal-light` on dark
  // surfaces". Aliases, not new values, so none of the three is a `brand`
  // field.
  'light|--ec-teal-dark',
  'dark|--ec-teal-dark',
  'light|--ec-teal-light',
  'dark|--ec-teal-light',
];

/** Every hex-valued field in the five exported colour objects. */
function hexFields(): string[] {
  const fields: string[] = [];
  for (const [id, accent] of Object.entries(programmeColors)) {
    for (const tier of Object.keys(accent)) fields.push(`programmeColors.${id}.${tier}`);
  }
  for (const name of Object.keys(brand)) fields.push(`brand.${name}`);
  for (const name of Object.keys(canvas)) fields.push(`canvas.${name}`);
  for (const name of Object.keys(borderColor)) fields.push(`borderColor.${name}`);
  for (const name of Object.keys(semantic)) fields.push(`semantic.${name}`);
  return fields;
}

describe('the colors.ts <-> globals.css mirror', () => {
  it('reads two distinct theme blocks, not one block twice', () => {
    // Guards the parser, not the palette. A brace matcher that over-reached
    // would return the whole file for both themes, and every pair below would
    // then pass against the wrong block — the failure mode this whole section
    // is meant to remove.
    //
    // Every assertion here is structural: it pins which *block* was read, not
    // any colour, so re-art-directing a hex cannot make it red for the wrong
    // reason.
    expect(ruleBody(':root')).toContain('color-scheme: light');
    expect(ruleBody('.dark')).toContain('color-scheme: dark');

    const light = themeVars('light');
    const dark = themeVars('dark');

    // `--radius` is declared in `:root` and not in `.dark`, so a parser
    // returning one block's body for both is visible here.
    expect(Object.keys(light)).toContain('--radius');
    expect(Object.keys(dark)).not.toContain('--radius');
    // Relational, not a pinned value: the two canvas tokens must disagree.
    expect(light['--ec-canvas']).not.toBe(dark['--ec-canvas']);
  });

  for (const [tsField, cssVar, theme] of PAIRS) {
    it(`${theme}: ${tsField} is the value ${cssVar} paints`, () => {
      expect(themeVars(theme)[cssVar]).toBe(readField(tsField));
    });
  }

  it(`covers all ${PAIRS.length} pairs in both directions, and no field escapes`, () => {
    // Direction 1: nothing in colors.ts is unmirrored. A new field added to
    // one of the five objects fails here, at the point it is added.
    const mirrored = new Set(PAIRS.map(([field]) => field));
    expect(hexFields().filter((field) => !mirrored.has(field))).toEqual([]);

    // Direction 2: nothing in globals.css is unmapped unless it is on the
    // one-directional list. Exact equality both ways: a whitelisted name that
    // has since gained a pair fails here too, so the list cannot rot.
    const declared = new Set(PAIRS.map(([, cssVar, theme]) => `${theme}|${cssVar}`));
    const unmapped: string[] = [];
    for (const theme of ['light', 'dark'] as const) {
      for (const name of Object.keys(themeVars(theme))) {
        if (name.startsWith('--ec-') && !declared.has(`${theme}|${name}`)) unmapped.push(`${theme}|${name}`);
      }
    }
    expect(unmapped.sort()).toEqual([...ONE_DIRECTIONAL].sort());

    // shadcn contract vars (`--accent`, `--muted-foreground`, `--radius`, …)
    // are out of scope by construction: none of them is a palette step with a
    // `colors.ts` field, and the sweep above only looks at `--ec-*`.
  });

  it('leaves the reserved pillar accents unemitted, as colors.ts says they are', () => {
    // colors.ts: "no CSS custom properties exist for them until a real pillar
    // claims one". That is a claim about globals.css, so it is asserted here
    // rather than trusted — and it is why `reservedPillarAccents` is absent
    // from PAIRS and from `hexFields()`.
    for (const accent of reservedPillarAccents) {
      for (const value of Object.values(accent)) {
        expect(stripComments(GLOBALS_CSS).toLowerCase()).not.toContain(value.toLowerCase());
      }
    }
  });
});
