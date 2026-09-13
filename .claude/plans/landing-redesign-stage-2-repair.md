# Stage 2 Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Stage 2's five acts actually compose — one continuous strand across the page, an Act 1 that renders its content and controls, and checks that can see the difference.

**Architecture:** Three independent reviews of `02a26e9..3cdfdbb` found that the pure geometry layer is sound but the layer between it and the DOM is not: three of five acts position their strand against an inner container rather than their own `<section>`, so the seam contract is satisfied in coordinates and visibly broken on screen; Act 1's stations compute to 500vw wide on desktop so the walk shows almost nothing; the rail is below the fold for the whole pin and dead on phones; two GSAP writers fight over the ribbon's paths; and no test, scan or assertion in the suite can see any of it. The repair moves the strand's box to the section **structurally** (the act cannot re-parent it), re-composes the two acts whose strand has a shape, fixes the walk's layout and its single-writer rule, and adds the checks that would have caught each defect.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind 4 · GSAP 3 (`@gsap/react`) · Vitest (node environment, `renderToStaticMarkup`) · zod 4 · Prisma 7 · Clerk 7.

**Spec:** `docs/projects/landing-redesign/spec.md` — §3.1 (the Line system), §4 (the five acts), §8 (responsive contract), §9 (accessibility & reduced motion), §14 (definition of done). The stage plan is `.claude/plans/landing-redesign-stage-2.md`; the three reviews are summarised in `.stage/sdd/landing-redesign-stage-2/reviews/`.

## Global Constraints

Copied verbatim from `CLAUDE.md` and the stage plan; every task's requirements implicitly include them.

- **The gate is four commands and all four must pass:** `npx tsc --noEmit && npm run lint && npm run test && npm run build`.
- **After renaming or deleting files**, `rm -rf .next` first — never while a dev server is running.
- **There is no `.env.local`.** The app cannot run locally; visual QA is the owner's. Never launch a browser or curl the site.
- **Encode anything visual or scroll-sensitive as pure functions with tests** — that is the only verification available here.
- **Never put `overflow-hidden` on an ancestor of a sticky or pinned section.** Put overflow handling on the sticky *inner* element only.
- **Tailwind 4 needs literal class names** — `bg-ec-${x}` emits no CSS. Every pillar→class mapping is written out in `src/lib/pillarStyles.ts`.
- **`src/design/colors.ts` and `src/app/globals.css` must carry identical hex values**, and the suite asserts that mirror.
- **One writer per property.** Never let GSAP and Motion, or two GSAP tweens, own the same property of the same element.
- **The seam rule:** every vertical act's strand enters at its own top edge (`y = 0`) and exits on its own bottom edge (`y = 1`) at one shared horizontal fraction, `x = 0.75`. `assertContinuity` checks the *shape* of that, from `page.tsx`, at module evaluation.
- **The act's `<section>` is the strand's box.** Act-local coordinates are only screen-continuous if the element the strand is positioned against is the act's band. This is the rule this repair exists to enforce, and `frames.ts:22` already states it.
- **Every word is real DOM text**, in logical order, at every breakpoint and under reduced motion (§9).
- **The thread always runs parallel to the axis you are scrolling** (§8's governing rule).
- **Copy comes from `.stage/sdd/landing-redesign-stage-2/briefs/_copy.md`** (untracked scratch) — the acts render exactly those strings and no others. Note Task 7 below moves the approved strings that the table does not carry into the code's own tests.
- Test files are `.test.ts` only — `vitest.config.mts`'s `include: ['src/**/*.test.ts']` silently drops `.test.tsx`.

---

## File Structure

| File | Responsibility after this plan |
|---|---|
| `src/components/educraft/acts/ActSection.tsx` | The act frame, and **the owner of the strand slot** (`line`), rendered as the section's first child so no act can re-parent the strand. |
| `src/components/educraft/acts/Way.tsx` | Act 2. Full-width rows; node x read from the section's frame; copy carries its own measure. |
| `src/components/educraft/acts/Proof.tsx` | Act 3. Deterministic bands at `lg`; the axis's y shared by the strand and the stations; a vertical spine below `lg`. |
| `src/components/educraft/acts/FivePillars.tsx` | Act 1. Full-viewport stations; the rail inside the pinned viewport; one writer per path; the convergence drawn. |
| `src/components/educraft/acts/Origin.tsx` | Act 0. The fork draws at every width; a single fall below `sm`. |
| `src/components/educraft/acts/Doors.tsx` | Act 4. Strand slot; node arithmetic corrected; the false comment removed. |
| `src/components/educraft/line/LineStage.tsx` | Unchanged except its attributes being pinned. |
| `src/app/(site)/page.tsx` | Unchanged; gains a test that can see it. |
| `src/components/educraft/acts/page.test.ts` | **New.** Renders `Home` under the provider; the only check that can see the composition. |
| `docs/surfaces/homepage.md`, `docs/architecture/source-layout.md` | Rewritten for five acts. |

---

### Task 1: The strand slot, and Act 2 re-composed

**Files:**
- Modify: `src/components/educraft/acts/ActSection.tsx`
- Modify: `src/components/educraft/acts/Way.tsx`
- Test: `src/components/educraft/acts/Way.test.ts`

**Interfaces:**
- Consumes: `ACT_ANCHORS.way`, `ACT_VIEW_BOX`, `LineStage`, `pathFor` (all unchanged).
- Produces: `ActSectionProps.line?: ReactNode` — an element rendered as the section's **first child**, positioned by the caller against the section. Tasks 2, 3 and 6 pass their strands through it.

- [ ] **Step 1: Write the failing tests**

Add to `src/components/educraft/acts/Way.test.ts`:

```ts
it('positions the strand against the act, not an inner box', () => {
  // The seam contract is act-local: `y = 0` must be the act's own top edge and
  // `y = 1` its bottom, or the line stops short at every boundary. Measured
  // before this task: the strand's containing block was
  // `div.mx-auto.max-w-5xl.px-6.pb-24`, so it began ~300px into the act and
  // ended 96px above its bottom. Structural assertion, not a class string: the
  // strand's wrapper must be the section's first child.
  expect(markup).toMatch(/<section id="way"[^>]*><div class="w-full pointer-events-none absolute inset-0/);
});

it('keeps the row copy left of the spine, measured against the act', () => {
  // The node x and the copy gutter are both read from `ACT_ANCHORS.way.enter.x`
  // *of this row*, so the row must span the act. 25% of an inner 976px box put
  // the nodes 104px off the line at 1440.
  expect(markup).toContain('padding-right:calc(25% + 2.75rem)');
  expect(markup).toContain('viewBox="0 0 1 1"');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/educraft/acts/Way.test.ts`
Expected: FAIL — today's markup is `<section id="way" class="relative"><header …`, so the first assertion does not match.

- [ ] **Step 3: Add the slot to `ActSection`**

```tsx
export type ActSectionProps = {
  /** The act's anchor id, from `ACT_ORDER`. */
  id: string;
  /**
   * The act's strand, positioned by the caller against **this section**.
   * Rendered as the section's first child and never wrapped, so the element the
   * strand is measured against is the act's own band — the invariant the seam
   * contract assumes (`frames.ts`). An act that renders its strand inside its
   * content box breaks screen continuity with every check still green.
   */
  line?: ReactNode;
  eyebrow?: string;
  heading?: ReactNode;
  lede?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function ActSection({ id, line, eyebrow, heading, lede, className, children }: ActSectionProps) {
  return (
    <section id={id} className={cn('relative', className)}>
      {line}
      {(eyebrow || heading || lede) && (
        <header className='mx-auto max-w-3xl px-6 pt-24 md:pt-32 lg:pr-[max(0px,calc(24rem-25vw))]'>
          {/* existing children unchanged */}
        </header>
      )}
      {children}
    </section>
  );
}
```

The header's right gutter is `max(0px, 24rem − 25vw)`: the header box is `max-w-3xl` centred, so its right edge sits at `(100vw + 48rem)/2` and the spine at `75vw`; the padding is exactly the difference, floored at zero. At 1440 it reserves 24px, at 1280 64px, at 1024 128px, and above 1536px nothing.

- [ ] **Step 4: Re-compose `Way.tsx`**

```tsx
export default function Way({ className }: WayProps = {}) {
  const strand = pathFor(ACT_ANCHORS.way.enter, ACT_ANCHORS.way.exit, 'arc');
  // Read from the act's frame: the rows span the section, so a node at
  // `SPINE_X` of a row is `SPINE_X` of the act, which is where the strand is.
  const copyStyle = { paddingRight: `calc(${(1 - SPINE_X) * 100}% + ${NODE_GUTTER})` };
  const nodeStyle = { left: `${SPINE_X * 100}%` };

  return (
    <ActSection
      id='way'
      line={
        <LineStage
          paths={[strand]}
          viewBox={ACT_VIEW_BOX}
          className='pointer-events-none absolute inset-0'
        />
      }
      eyebrow='Why Educraft'
      heading='A different kind of education company.'
      lede='Most education offerings are collections of courses. …'
      className={className}
    >
      {/* No `mx-auto max-w-5xl`: the rows must span the act, or the node's 75%
          is 75% of a narrower box and the node sits beside the line. */}
      <div className='w-full pb-24'>
        <ol className='relative'>
          {DIFFERENTIATORS.map((item, index) => (
            <li key={item.title} className='relative py-7' style={copyStyle}>
              <span aria-hidden='true' className='absolute top-7 -translate-x-1/2 bg-background px-1 type-caption font-bold text-ec-teal' style={nodeStyle}>
                {numeral(index)}
              </span>
              <div className='max-w-2xl pl-6'>
                <h3 className='type-heading-s text-ec-ink dark:text-white'>{item.title}</h3>
                <p className='type-body-s mt-2 text-ec-slate'>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
        {/* the method block and the link: same treatment, `max-w-2xl pl-6` inside */}
      </div>
    </ActSection>
  );
}
```

Every existing string, class and structure is preserved except the container widths: the copy keeps its measure via `max-w-2xl`, and `pl-6` replaces the removed container padding.

- [ ] **Step 5: Run the tests, then the gate**

Run: `npx vitest run src/components/educraft/acts/Way.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build`
Expected: Way's suite green; gate green.

- [ ] **Step 6: Commit**

```bash
git add src/components/educraft/acts/ActSection.tsx src/components/educraft/acts/Way.tsx src/components/educraft/acts/Way.test.ts
git commit -m "fix(acts): the strand is positioned against the act, not an inner box"
```

---

### Task 2: Act 3 re-composed — deterministic bands and an act-frame axis

**Files:**
- Modify: `src/components/educraft/acts/Proof.tsx`
- Test: `src/components/educraft/acts/Proof.test.ts`

**Interfaces:**
- Consumes: `ActSectionProps.line` (Task 1), `ACT_ANCHORS.proof`, `ACT_VIEW_BOX`, `pathFor`, `polylinePath`.
- Produces: `AXIS_Y = 0.4` and `TICK_XS` become **fractions of the act**, shared by the strand's path and the station layout. Task 7 pins them.

Act 3's strand has a *shape* — it turns from a vertical run into a horizontal axis — so its y values are only meaningful if the box it is drawn into has a known height. At `lg` the act therefore gets a fixed height and a band per region, all expressed as percentages that the strand reads too.

- [ ] **Step 1: Write the failing tests**

```ts
it('positions the axis in the act’s own frame, not a 24rem box', () => {
  expect(markup).toMatch(/<section id="proof"[^>]*><div class="w-full pointer-events-none absolute inset-0/);
  // `AXIS_Y` is a fraction of the act, and the station band is placed at the
  // same fraction — one number, two consumers.
  expect(markup).toContain('M 0.15 0.4 L 0.85 0.4');
  expect(markup).toContain('lg:top-[40%]');
});

it('keeps the seam spine at every width', () => {
  // Below lg the axis cannot be a scale, so the strand is the plain vertical
  // spine §8 asks for — and the seam still holds, because its endpoints are
  // `proof.enter` and `proof.exit`.
  expect(markup).toContain('d="M 0.75 0 C 0.75 0 0.75 0.85 0.75 1"');
  expect(markup).toContain('lg:hidden');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/educraft/acts/Proof.test.ts`
Expected: FAIL on both — the section's first child is `<header>`, and the spine does not exist.

- [ ] **Step 3: Re-compose `Proof.tsx`**

```tsx
/**
 * The axis's y, **as a fraction of the act** — and the one number the strand and
 * the stations both read, so a tick cannot drift from the copy it points at.
 * Act-relative rather than box-relative because the strand's frame is the
 * section (the seam contract), so anything drawn inside it must be too.
 */
const AXIS_Y = 0.4;
const STATION_Y = 0.44;
const TICK_BOTTOM_Y = 0.44;
const TICK_XS = [0.15, 0.38, 0.62, 0.85] as const;

// inside the component:
const spine = pathFor(ACT_ANCHORS.proof.enter, ACT_ANCHORS.proof.exit, 'arc');
const paths = [
  pathFor(ACT_ANCHORS.proof.enter, { x: TICK_XS[0], y: AXIS_Y }, 'arc'),
  polylinePath([{ x: TICK_XS[0], y: AXIS_Y }, { x: TICK_XS[TICK_XS.length - 1], y: AXIS_Y }]),
  pathFor({ x: TICK_XS[TICK_XS.length - 1], y: AXIS_Y }, ACT_ANCHORS.proof.exit, 'arc'),
  ...TICK_XS.map((x) => pathFor({ x, y: AXIS_Y }, { x, y: TICK_BOTTOM_Y }, 'line')),
];

return (
  <ActSection
    id='proof'
    line={
      <>
        {/* The act's band: the whole vertical run, so way.exit and doors.enter
            meet it at the section's edges. */}
        <LineStage paths={[spine]} viewBox={ACT_VIEW_BOX} draw={false}
                   className='pointer-events-none absolute inset-0 lg:hidden' />
        {/* The axis motif: the act's own shape, at lg only — it needs a box it
            can scale a scale into. */}
        <LineStage paths={paths} viewBox={ACT_VIEW_BOX}
                   className='pointer-events-none absolute inset-0 hidden lg:block' />
      </>
    }
    eyebrow='Outcomes & evidence'
    heading={'What "better learning" looks like here'}
    lede='We do not claim transformation with adjectives. …'
    className={className}
  >
    <div className='w-full pb-24'>
      <h3 className='max-w-2xl pl-6 type-heading-m text-ec-ink dark:text-white'>How we build evidence</h3>
      <div className='relative lg:h-[34rem]'>
        <ul className='grid gap-8 sm:grid-cols-2 lg:block'>
          {CHAIN.map((station, index) => (
            <li key={station.title}
                className='max-w-2xl pl-6 lg:absolute lg:w-52 lg:-translate-x-1/2 lg:pl-0'
                style={{ left: `${TICK_XS[index] * 100}%`, top: `${STATION_Y * 100}%` }}>
              <h4 className='type-heading-s text-ec-ink dark:text-white'>{station.title}</h4>
              <p className='type-body-s mt-2 text-ec-slate'>{station.description}</p>
            </li>
          ))}
        </ul>
      </div>
      {/* the h3 already sits above; remove the inner `mt-8 lg:h-[24rem]` wrapper */}
      {/* stat row, pull quote, marginalia: unchanged, still full-width content */}
    </div>
  </ActSection>
);
```

The `lg:absolute` stations now read `left`/`top` as **percentages of the act's content box**, matching the strand's own frame, so a tick is under the copy it points at by construction. The band's height (`lg:h-[34rem]`) reserves the room they need; the axis's y is independent of it.

- [ ] **Step 4: Run the tests, then the gate**

Run: `npx vitest run src/components/educraft/acts/Proof.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/Proof.tsx src/components/educraft/acts/Proof.test.ts
git commit -m "fix(acts): Act 3's axis reads the act's frame, and keeps a spine below lg"
```

---

### Task 3: The ribbon's frame, and its stage titles

**Files:**
- Modify: `src/components/educraft/acts/FivePillars.tsx` (the `RibbonStage` function)
- Test: `src/components/educraft/acts/FivePillars.test.ts`

**Interfaces:**
- Consumes: `ribbonFrame`, `ACT_ANCHORS.pillars.exit`, `LineStage`.
- Produces: the ribbon strip spans the **section's full width** and ends **flush with the section's bottom edge**, so `pillars.exit` renders at `0.75 × viewport` and lands on the act's bottom edge, which is where `way.enter` is.

- [ ] **Step 1: Write the failing tests**

```ts
it('puts the ribbon’s exit on the act’s bottom edge, at the act’s spine', () => {
  // Measured before: the strip was 976px × 160px inside `max-w-5xl px-6 py-24`,
  // so its exit rendered at x ≈ 964px and 96px above the act's bottom, while
  // `way.enter` is at 0.75 × viewport on the next section's top edge.
  const ribbon = markup.slice(markup.indexOf('The student journey'));
  expect(ribbon).toContain('viewBox="0 0 8 1"');
  expect(ribbon).not.toContain('max-w-5xl');
});

it('exposes each stage’s title to assistive tech, not its number', () => {
  // The retired section rendered the number as a visible caption and the title
  // as an `<h3>`. As shipped, AT heard "Stage 01 … Stage 06" and none of the
  // titles — the opposite of "every word is real DOM text" (§9).
  expect(markup).toContain('Curious');
  expect(markup).toMatch(/<span class="sr-only">Curious<\/span>/);
  expect(markup).toContain('aria-hidden="true" class="type-caption');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/educraft/acts/FivePillars.test.ts`
Expected: FAIL — the strip is inside `max-w-5xl px-6 py-24`, and the title is the `aria-hidden` element.

- [ ] **Step 3: Re-compose `RibbonStage`**

```tsx
return (
  <div className='w-full pt-24'>
    <div className='mx-auto max-w-3xl px-6 lg:pr-[max(0px,calc(24rem-25vw))]'>
      <Eyebrow className='text-ec-teal'>The student journey</Eyebrow>
      <h3 className='type-heading-m mt-4 text-ec-ink dark:text-white'>Six stages, one direction: forward.</h3>
    </div>
    {/* The strip is the act's own width and its last element, so its bottom edge
        *is* the section's bottom edge and its 75% *is* the act's spine. */}
    <div className='relative mt-12 h-40 w-full'>
      <LineStage paths={[...frame.convergence, frame.strand]} viewBox={frame.viewBox}
                 draw={false} className='absolute inset-0' />
      <ol className='absolute inset-x-0 top-1/2 -translate-y-1/2'>
        {stages.map((stage, index) => (
          <li key={stage.stage} className='absolute -translate-x-1/2 text-center'
              style={{ left: `${(frame.nodes[index].x / frame.width) * 100}%` }}>
            <span aria-hidden='true' className='type-caption block text-ec-slate'>Stage {stage.stage}</span>
            <span className='sr-only'>{stage.title}</span>
            <span className='type-body-s block text-ec-slate'>{stage.title}</span>
          </li>
        ))}
      </ol>
    </div>
  </div>
);
```

The `<section>` must end here — no `py-24` below the strip — so the act's bottom edge and the strand's `y = 1` are the same line.

- [ ] **Step 4: Run the tests, then the gate**

Run: `npx vitest run src/components/educraft/acts/FivePillars.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/FivePillars.tsx src/components/educraft/acts/FivePillars.test.ts
git commit -m "fix(acts): the ribbon ends on the act's bottom edge, at the act's spine"
```

---

### Task 4: Act 1 renders — the station width, the rail, the phone, the band

**Files:**
- Modify: `src/components/educraft/acts/FivePillars.tsx`
- Test: `src/components/educraft/acts/FivePillars.test.ts`

**Interfaces:**
- Consumes: `frame.widthVw`, `frame.railSegments`, `pillarAccent[].softBg`, `pillarAccent[].graphicVar`.
- Produces: a `scrollerRef` on the element that carries `data-walk-track` (for the mobile branch), and a rail that lives inside the pinned viewport.

- [ ] **Step 1: Write the failing tests**

```ts
it('gives each station one viewport of the track, at every breakpoint', () => {
  // Measured: `sm:w-full` is emitted after `w-screen` (byte 65607 vs 24451 in
  // the built CSS), so at ≥640px the station's width was 100% of its flex
  // container — 500vw at five pillars. Five shrink-0 stations of 500vw in a
  // 500vw track put stations 1–4 off the end of the transform: the walk showed
  // no station content at all on desktop.
  expect(markup).toContain('w-screen shrink-0 snap-center sm:w-full lg:w-screen');
  expect(markup).toContain('w-[var(--track-w)]');
});

it('keeps the rail inside the pinned viewport', () => {
  // The pin is on the `<section>`, whose first child is a one-viewport track;
  // an in-flow rail therefore sat 32px below the fold for the whole 400vh walk.
  expect(markup).toContain('lg:absolute lg:inset-x-0 lg:bottom-6');
});

it('scrolls the element that actually scrolls, on mobile', () => {
  expect(markup).toContain('data-walk-track');
});

it('paints the pillar band, not a border colour with no width', () => {
  // `pillarAccent[...].border` is `border-ec-learn` — a colour, with no border
  // width, so Tailwind's preflight left the 4px strip transparent.
  expect(markup).toMatch(/absolute inset-y-0 left-0 w-1 bg-ec-learn-soft/);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/educraft/acts/FivePillars.test.ts`
Expected: FAIL on all four.

- [ ] **Step 3: Fix the four**

1. Station: `className='relative w-screen shrink-0 snap-center sm:w-full lg:w-screen lg:h-screen'`.
2. Rail `<ol>`: `className='mt-8 flex justify-center gap-3 lg:absolute lg:inset-x-0 lg:bottom-6 lg:mt-0'`; the track wrapper (`data-walk-track`) becomes `relative` at `lg` so the rail positions against it — wrap the track and rail in a `relative lg:h-screen` div if the wrapper is not already positioned.
3. Add `const scrollerRef = useRef<HTMLDivElement>(null)` and put it on the `data-walk-track` element; the mobile branch becomes `scrollerRef.current?.scrollTo({ left: index * window.innerWidth, behavior: 'smooth' })`.
4. Band: `` className={`absolute inset-y-0 left-0 w-1 ${pillarAccent[station.pillarId].softBg}`} ``.
5. Add the station node §4 asks for — the pillar's `graphic` tier on the strand, at the rail's y:

```tsx
<span
  aria-hidden='true'
  className='absolute top-1/2 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block'
  style={{ left: `${((index + 0.5) / pillarCount) * 100}%`, backgroundColor: pillarAccent[station.pillarId].graphicVar }}
/>
```
placed inside the `data-walk-track` wrapper (whose width is the track's frame), not inside the station list.

- [ ] **Step 4: Run the tests, then the gate**

Run: `npx vitest run src/components/educraft/acts/FivePillars.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/FivePillars.tsx src/components/educraft/acts/FivePillars.test.ts
git commit -m "fix(acts): the walk shows its stations, its rail and its pillar bands"
```

---

### Task 5: One writer per path — the walk's scope, and the convergence

**Files:**
- Modify: `src/components/educraft/acts/FivePillars.tsx`
- Test: `src/components/educraft/acts/FivePillars.test.ts`

**Interfaces:**
- Consumes: `drawAt`, `frame.railSegments.length`.
- Produces: the walk's `onUpdate` writes **only** the rail's own segments; the ribbon's tween draws **every** path it renders.

- [ ] **Step 1: Write the failing tests**

```ts
it('gives every path exactly one writer', () => {
  // Measured: the walk's `onUpdate` scoped to the `<section>`, which contains
  // the ribbon. It wrote `drawAt(progress, i, 5)` to all 11 paths — and that is
  // 0 for every i ≥ 5 — so on every scroll tick it forced the convergence and
  // the ribbon's strand to *undrawn*. The ribbon's own draw is `once: true`, so
  // scrolling back up and down again left them undrawn for good.
  expect(markup).toContain('data-walk-rail');   // the walk's own LineStage, scoped by onUpdate
  expect(markup).toContain('data-ribbon');      // the ribbon's, never touched by the walk
});

it('draws the convergence, not only the strand', () => {
  // The tween targeted `.at(-1)` — the strand — leaving the five convergence
  // paths undrawn outside reduced motion, though §4 Act 1 requires them.
  expect(markup).toMatch(/data-ribbon[^>]*>[\s\S]*data-line-path/);
});
```

- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/components/educraft/acts/FivePillars.test.ts`

- [ ] **Step 3: Scope the writers**

In the walk's `useGSAP`, replace the section-wide query with the walk's own stage:

```tsx
const rail = root.current?.querySelector('[data-walk-rail]');
const segments = rail ? gsap.utils.toArray<SVGPathElement>('[data-line-path]', rail) : [];
if (segments.length !== frame.railSegments.length) return;   // loud, not silent
```

Give the walk's `LineStage` `data-walk-rail` and the ribbon's `data-ribbon`. In `RibbonStage`, tween **all** paths:

```tsx
const paths = gsap.utils.toArray<SVGPathElement>('[data-line-path]', scope);
paths.forEach((path, index) => {
  gsap.fromTo(path, { strokeDashoffset: 1 }, {
    strokeDashoffset: 0, ease: EASE.out, duration: motionTokens.duration.reveal,
    delay: index * (motionTokens.duration.reveal / 6),
    scrollTrigger: { trigger: scope, start: 'top 80%', once: true },
  });
});
```

- [ ] **Step 4: Run the tests, then the gate**

Run: `npx vitest run src/components/educraft/acts/FivePillars.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/FivePillars.tsx src/components/educraft/acts/FivePillars.test.ts
git commit -m "fix(acts): one writer per path, and the convergence draws"
```

---

### Task 6: The fork draws everywhere, and Act 0 gets its cue

**Files:**
- Modify: `src/components/educraft/acts/Origin.tsx`
- Test: `src/components/educraft/acts/Origin.test.ts`

**Interfaces:**
- Consumes: `forkPaths`, `seedAnchors`, `pathFor`, `ACT_ANCHORS.origin`.
- Produces: a second `LineStage` for the `<sm` fall (§8's "simplified vertical fall — one strand, not five").

- [ ] **Step 1: Write the failing tests**

```ts
it('draws the fork at every width', () => {
  // The branch tween sat below `if (!isDesktop || !copy.current) return`, so on
  // tablet and phone the reader saw five seed dots with no lines reaching them,
  // though §8's tablet row says "fork still happens".
  expect(markup).toContain('M 0.5 0.85 C 0.5 0.85 0.5 0.93 0.5 1');   // the fall
  expect(markup).toContain('sm:hidden');
});

it('renders the approved scroll cue', () => {
  // `_copy.md` approves an Act 0 "sr-only scroll cue · Scroll", sourced to the
  // retired hero. Nothing rendered it.
  expect(markup).toContain('<span class="sr-only">Scroll</span>');
});
```

- [ ] **Step 2: Run to verify they fail** — `npx vitest run src/components/educraft/acts/Origin.test.ts`

- [ ] **Step 3: Implement**

1. Move the branch tween **above** the `isDesktop` guard, and gate it on `copy.current` only for the copy's own tween.
2. Add the mobile/`<sm` fall strand:

```tsx
<LineStage
  paths={[pathFor(ACT_ANCHORS.origin.exit, { x: 0.5, y: 1 }, 'line')]}
  viewBox={ACT_VIEW_BOX}
  draw={false}
  className='pointer-events-none absolute inset-0 sm:hidden'
/>
```
and give the five-branch stage `className='… hidden sm:block'` so exactly one of the two renders at any width.
3. Render the cue beside the trust line: `<span className='sr-only'>Scroll</span>`.

- [ ] **Step 4: Run the tests, then the gate**

Run: `npx vitest run src/components/educraft/acts/Origin.test.ts && npx tsc --noEmit && npm run lint && npm run test && npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/educraft/acts/Origin.tsx src/components/educraft/acts/Origin.test.ts
git commit -m "fix(acts): the fork draws at every width, and Act 0 renders its cue"
```

---

### Task 7: The checks that can see it

**Files:**
- Create: `src/components/educraft/acts/page.test.ts`
- Modify: `src/components/educraft/line/LineStage.test.ts`, `src/components/educraft/acts/Origin.test.ts`, `src/components/educraft/acts/Doors.test.ts`, `src/components/educraft/acts/Proof.test.ts`, `src/components/educraft/acts/FivePillars.test.ts`

**Interfaces:**
- Consumes: everything the stage produced.
- Produces: the first assertions in the repo that can fail when the *page* is wrong, and the pins for the attributes every act's geometry depends on.

- [ ] **Step 1: Write `page.test.ts`**

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EnquiryModalProvider } from '@/context/EnquiryModalContext';
import { ACT_ORDER } from '@/components/educraft/line/anchors';
import { programmes } from '@/data/programmes';
import Home from '@/app/(site)/page';

const markup = renderToStaticMarkup(createElement(EnquiryModalProvider, null, createElement(Home)));

describe('the homepage composes five acts', () => {
  it('renders every act, in scroll order', () => {
    // Measured before this test: deleting `<Way />` outright left the suite at
    // 334 passed. No test imported the page, so no check could see it.
    const ids = ACT_ORDER.map((act) => markup.indexOf(`<section id="${act}"`));
    for (const [i, at] of ids.entries()) expect(at, ACT_ORDER[i]).toBeGreaterThan(-1);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('wires each station to its own programme', () => {
    // Read the expectation from the data, and assert the two fields differ, so
    // a swap (`programmeName` ← `pillar.name`) fails instead of comparing a
    // value to itself. `Station` carries five unbranded strings, so the type
    // system cannot tell them apart.
    for (const programme of programmes) {
      expect(markup, programme.name).toContain(programme.name);
      expect(programme.name).not.toBe(programme.pillarId);
    }
  });

  it('renders the seam assertions where the acts are composed', () => {
    expect(markup).toContain('id="origin"');
  });
});
```

- [ ] **Step 2: Add the attribute pins**

In `LineStage.test.ts`:

```ts
it('stretches the frame and keeps the stroke width', () => {
  // All three are load-bearing and none was pinned: without
  // `preserveAspectRatio="none"` the walk's `0 0 N 1` frame letterboxes into
  // the first viewport of a 500vw track, and the vertical acts' strands shrink
  // into the middle of their boxes. Measured: deleting it left 334 passed.
  const markup = renderToStaticMarkup(createElement(LineStage, { paths: ['M 0 0 L 1 1'], viewBox: '0 0 1 1' }));
  expect(markup).toContain('preserveAspectRatio="none"');
  expect(markup).toContain('vector-effect="non-scaling-stroke"');
  expect(markup).toContain('stroke-width="2"');
});
```

In `Origin.test.ts`, replace the decorative-strand assertion — `toContain('aria-hidden="true"')` is satisfied by the seed-node wrapper — with one that counts the strand's own SVG:

```ts
it('keeps the strand decorative', () => {
  expect((markup.match(/<svg[^>]*aria-hidden="true"/g) ?? []).length).toBeGreaterThan(0);
  expect(markup).toMatch(/<svg viewBox="0 0 1 1" preserveAspectRatio="none"[^>]*aria-hidden="true"/);
});
```

In `Proof.test.ts`, pin the ordered chain and the act's copy:

```ts
it('keeps the four stations in order, on their own ticks', () => {
  const titles = [...markup.matchAll(/<h4[^>]*>([^<]+)<\/h4>/g)].map((m) => m[1]);
  expect(titles).toEqual(['Confidence', 'Engagement', 'Skill', 'Readiness']);
  for (const x of ['15%', '38%', '62%', '85%']) expect(markup).toContain(`left:${x}`);
});

it('renders Act 3’s copy verbatim', () => {
  for (const line of [
    'Outcomes & evidence',
    'What "better learning" looks like here',
    'We do not claim transformation with adjectives.',
    'How we build evidence',
    'Students who can see their own progress',
    'These are placeholder quotes pending consented testimonials.',
  ]) expect(markup, line).toContain(line);
});
```

In `Doors.test.ts`, pin the benefit **order** per door (a reorder in `data/navigation.ts` was measured green):

```ts
it('renders each door’s kept benefits in the data’s order', () => {
  const kept = ['One partner across five specialist verticals', 'Consistent reporting and progress visibility'];
  expect(markup.indexOf(kept[0])).toBeLessThan(markup.indexOf(kept[1]));
});
```

In `FivePillars.test.ts`, pin the class lists §8's mechanics depend on:

```ts
it('keeps the three branches’ mechanics', () => {
  expect(markup).toContain('snap-x snap-mandatory');
  expect(markup).toContain('sm:flex-col');
  expect(markup).toContain('lg:w-screen');
});
```

And guard Proof's parallel arrays at module scope:

```ts
// Proof.tsx, beside the constants:
if (CHAIN.length !== TICK_XS.length) {
  throw new Error(`Proof: ${CHAIN.length} stations but ${TICK_XS.length} ticks — a station would be parked at NaN%.`);
}
```

- [ ] **Step 3: Run everything, then the gate**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run test && npm run build`
Expected: all green, with the suite's count rising by the new cases.

- [ ] **Step 4: Commit**

```bash
git add src/components/educraft/acts/page.test.ts src/components/educraft/line/LineStage.test.ts src/components/educraft/acts/*.test.ts src/components/educraft/acts/Proof.tsx
git commit -m "test(acts): the checks that can see the composition"
```

---

### Task 8: Prose and documentation

**Files:**
- Modify: `src/components/educraft/line/station.ts:19-22`, `src/components/educraft/line/station.test.ts:167-169`, `src/components/educraft/line/frames.test.ts:22`, `src/components/educraft/line/anchors.ts:12-14`, `src/components/educraft/acts/Way.tsx:26`, `src/components/educraft/acts/Proof.tsx:25`, `src/components/educraft/acts/FinalCTA.tsx:25`, `src/components/educraft/acts/Doors.tsx:52-57`, `src/components/educraft/acts/FivePillars.tsx` (the `branchFor` comment), `src/components/educraft/acts/ActSection.tsx:6`
- Modify: `docs/surfaces/homepage.md`, `docs/architecture/source-layout.md`
- Modify: `docs/projects/landing-redesign/state.md`

- [ ] **Step 1: Correct the six stale present-tense citations**

Each names a file the stage deleted or a state that has changed. Rewrite each to the truth, in the past tense where it is history and present where it is current:

| File:line | Says | Truth |
|---|---|---|
| `line/station.ts:19-22` | the old formula "is still live at `Methodology.tsx:29`" and "nothing imports `drawAt` yet" | both false — the file is deleted and `FivePillars.tsx` imports `drawAt` |
| `line/station.test.ts:167-169` | the same two claims | same |
| `line/frames.test.ts:22` | "nothing imports `frames.ts` yet" | six modules import it |
| `line/anchors.ts:12-14` | "no runtime module calls it" | `page.tsx` calls `assertContinuity` at module evaluation |
| `Way.tsx:26`, `Proof.tsx:25`, `FinalCTA.tsx:25` | copy "moved verbatim from" deleted files | keep the provenance, mark it historical and name the commit that retired the source |
| `ActSection.tsx:6` | the id is "from `ACT_ORDER`" | every act hardcodes its literal; say so, or wire it |

- [ ] **Step 2: Rewrite `docs/surfaces/homepage.md`**

It still describes the twelve retired sections and points at `src/components/educraft/landing/`, which does not exist. Replace with the five acts: what each renders, its frame and where its strand is positioned, the copy table's home, and the two open items (R20's alignment, R17's ribbon hook).

- [ ] **Step 3: Correct `docs/architecture/source-layout.md`**

Lines 19 and 36: `landing/` no longer exists; `three/` is gone.

- [ ] **Step 4: Correct `state.md`'s inventory**

`state.md` §4's stale-citation bullet names "`line/station.ts:32`" and calls both items "historical rather than false" — the line number is wrong (the comment is at 19–22 and cites `Methodology.tsx`, not `useScrollProgress`) and the station.ts sentence *is* false. Correct the line, the file and the classification, and record the six corrected in this task.

- [ ] **Step 5: Gate**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`

- [ ] **Step 6: Commit**

```bash
git add -A src/components/educraft docs/surfaces/homepage.md docs/architecture/source-layout.md docs/projects/landing-redesign/state.md
git commit -m "docs: what the five acts are, and what the code actually says"
```

---

## Self-Review

**Spec coverage.** §3.1's "one continuous line" → Tasks 1–3 (the frame) and Task 7 (the pins). §4's acts: Act 1's rail, band and node → Tasks 4–5; Act 0's fork and cue → Task 6; Act 3's axis → Task 2. §8's three branches → Tasks 2, 3, 4 and 6 (the fall, the spine, the thumb-width stations, the scroller). §9's "every word is real DOM text" → Task 3 (the ribbon's titles), Task 6 (the cue), Task 7 (the reduced-motion scan stays as Task 12 wrote it). §14's "the strand is continuously present from hero to CTA" → Tasks 1–3, and it remains the owner's screenshot to confirm.

**Deliberately not in this plan, and why.** R20 (Act 4's strand ends mid-band while the node rides the CTA row) and R17 (the ribbon's strand doubles back above five stages) are geometry the *seam contract* pins and two Task 10/7 records already escalated: each is a design ruling, not a defect with one correct answer, so they stay with the owner. `preserveAspectRatio` × `pathLength` × `non-scaling-stroke` is pinned individually by Task 7 but its *combination* is falsifiable only by a screenshot (`rulings.md:215`) — that is the highest-value item on the owner's QA list. §9's arrow-key navigation and the polite live region for panel swaps are unimplemented; they are named in the reviews and belong to the accessibility pass, not here.

**Type consistency.** `ActSectionProps.line` is the one new interface, consumed by Tasks 2–4 and 6. `data-walk-rail` / `data-ribbon` / `data-walk-track` are the three new DOM hooks, all asserted in Task 7.
