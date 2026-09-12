# 0007 — Component tests run in node as `.test.ts`, not `.test.tsx`

**Date:** 2026-09-13
**Status:** Accepted — Stage 1 shipped its component tests this way

## Context

This project has no local runtime: there is no `.env.local`, so the app cannot be started, and
`platform/verification.md` records that the assistant never launches a browser. The four-command gate
is the only automated safety net, and **`npm run test` is the only command in it that can be wrong
about behaviour rather than only about types.**

Stage 1's Task 7 shipped `LineStage`, a client React component. Its implementer was ruled out of
writing tests for it (R27), on the repeated observation that `vitest.config.mts`'s
`include: ['src/**/*.test.ts']` silently drops any `.test.tsx`. That observation was reconfirmed three
times with deliberately-failing probes that left the suite green.

**R27's premise was true; its conclusion was not.** Two independent review lenses measured the
same thing: the `.tsx` trap is real, but "therefore the deliverable is outside the suite" does not
follow. `'use client'` is an inert string to Node, `gsap` and `@gsap/react` import and evaluate with
no DOM, and `renderToStaticMarkup` + `createElement` renders a component to markup with **no JSX
syntax, no jsdom, and no `@testing-library`**. The withheld assumption — that a component test needs
`.tsx` plus a DOM environment — was simply false.

R27 was reversed by the owner and the tests were written. They found a real defect within one round.

## Decision

**Component tests are written in `.test.ts` and rendered with `renderToStaticMarkup` +
`createElement`.** No JSX in tests, no jsdom, no `@testing-library`, no new dependency.

Two consequences of that choice are decided here:

- **What this buys:** the render contract. `LineStage.test.ts` pins one `<path data-line-path>` per
  input, `pathLength="1"`, the initial `strokeDasharray`/`strokeDashoffset`, `aria-hidden`,
  `focusable="false"`, the `<title>` fallback, `viewBox` defaults and overrides, and the `cn()` merge.
- **What it does not buy:** anything inside an effect. `renderToStaticMarkup` runs no effects, so
  nothing reaches `useGSAP`, ScrollTrigger, the pin, the `matchMedia` branch, or cleanup. **The suite
  cannot distinguish the in-view draw trigger from its absence** — verified by mutation. Reaching that
  layer needs jsdom or a browser, which is a dependency decision this ADR does not make.

The `.test.tsx` trap remains live and unfixed. It is not worked around; it is avoided.

## Consequences

- **The gate covers more than it used to, and the improvement was free.** Stage 1 closed at 136 tests
  across 9 files, up from 115/7, with no new dependency.
- **A `.test.tsx` written by anyone who has not read this ADR will silently never run.** That is the
  trap this decision routes around rather than removes. `vitest.config.mts`'s `include` is unchanged
  and still says `.test.ts` only; a `jsdom` decision would be needed to close it properly.
- **The repo's named recurring defect — a test that cannot fail — was authored by the very round that
  added these tests.** `gsap.test.ts` briefly compared `EASE.out` against `EASE.out`, so its
  `toBeLessThan(1e-12)` was unfalsifiable; the suite's real guarantee was `1e-6`, six orders weaker.
  It was caught only by running the falsification rather than trusting the green. The rule that falls
  out: **every new test is verified by mutating what it claims to pin and pasting the RED.**
- **Cost if wrong:** the render contract is pinned but the animation is not, and a Stage 2 author
  reads a green suite as evidence for behaviour the suite cannot see. Mitigated in part by saying so
  in the test file's own header, in `rulings.md`, and in `stages/README.md`.
