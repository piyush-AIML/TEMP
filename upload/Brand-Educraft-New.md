# Educraft Website — Master Build Guide & Multi-Stage Prompt

**Purpose of this document:** this is a single, self-contained prompt file. Feed it, or one stage at a time, to an AI coding agent (Claude Code, Cursor, etc.) or use it as a build spec for a human dev. It contains the brand analysis, the design system, the content, and a 7-stage implementation sequence — in that order, so nothing downstream needs to be re-explained.

---

## 0. How to use this document (read first)

1. **Feed stages sequentially, not all at once.** Each stage in Section 6 is a ready-to-paste prompt block. Run Stage 0 first, let the agent finish, verify the "Definition of Done," then move to Stage 1. This is the token-efficiency strategy: design tokens, content, and architecture are defined **once** (Sections 1–5) and every stage prompt *references* them instead of re-stating them.
2. **Don't let the agent re-derive the design system.** Sections 1–4 are ground truth. If a stage prompt says "use the palette from Section 2," that's a literal instruction — copy the hex values, don't reinterpret them.
3. **Content is already written.** Section 3.3 has real, on-brand copy for all 5 courses. The agent should use it verbatim in Stage 0/4, not generate placeholder lorem ipsum. This is the single biggest quality lever for a client demo — nothing reads more "unfinished" than filler text.
4. **Quality floor, every stage:** responsive to 375px, visible keyboard focus states, `prefers-reduced-motion` respected, no console errors. This isn't a separate polish pass bolted on at the end — it's baked into each stage's Definition of Done.

---

## 1. Brand & Product Analysis

### 1.1 What Educraft actually is
A global digital education platform unifying **5 distinct verticals** under one trust umbrella — not a single-subject course site. The website's core job is therefore **twofold**: (a) build institutional/parental trust fast, because the offer is broad and could otherwise read as unfocused, and (b) route each visitor to *their* vertical quickly, because a parent looking for NEET coaching and a school evaluating inclusive-ed partnerships are having completely different conversations on the same site.

### 1.2 Emotional strategy → UI decision mapping
The brand doc names 5 target emotions. Each has a direct, concrete design consequence — not just a mood:

| Emotion | UI consequence |
|---|---|
| Trust | Indigo-led navbar/footer, real institutional-feeling structure (clear nav, no dark patterns), no stock "smiling stock-photo student" clichés |
| Hope | Warm gold used *only* for achievement/success moments (badges, CTA accents) — scarcity makes it mean something |
| Belonging | Inclusive Education gets equal visual weight to NEET/JEE — no vertical is styled as the "real" product and others as filler |
| Achievement | The gold accent + subtle upward-motion micro-interactions on stat/achievement elements |
| Calm Confidence | Generous whitespace, soft shadows (never harsh drop-shadows), restrained motion — the site should never feel like it's trying to hype the visitor |

### 1.3 Archetype blend → tone
**Sage + Caregiver + Creator.** In practice: copy explains *why*, not just *what* (Sage); copy is warm and reassuring, never salesy (Caregiver); the site should feel like it's building something specific for *this* learner, not selling a generic course catalog (Creator). Concretely, avoid: exclamation-heavy CTAs, countdown/urgency tactics, "🔥 limited seats!" energy. This is a counselling-adjacent brand, not a flash-sale brand.

### 1.4 Voice: do / don't (from brand doc §8, applied literally)
- ✅ "Every student deserves a learning path that understands their strengths."
- ❌ "Join our course now!"
- Encouraging, not preachy · Expert, not academic-heavy · Warm, not childish · Global, not region-specific.

### 1.5 Visual clichés to explicitly avoid
From the brand doc itself: graduation caps, shields, mascots, cartoon children, generic stock "e-learning" iconography, excessive 3D. **Additionally**, avoid the three looks that currently read as "default AI-generated design": warm cream background + serif + terracotta accent; near-black background + single neon accent; broadsheet/newspaper hairline-rule layout. Educraft's actual palette (indigo/teal/gold on white/sky-blue) is naturally distinct from all three — stay inside the brand palette rather than drifting toward any of them for "safety."

### 1.6 The 5 verticals (source of truth — used throughout)

| # | Course | Pillar (brand §8) | Slug |
|---|---|---|---|
| 1 | Linguistics | Learn | `linguistics` |
| 2 | Inclusive Education | Include | `inclusive-education` |
| 3 | Psychological Counseling & Wellbeing | Thrive | `wellbeing-counseling` |
| 4 | AI and Digital Technologies | Achieve | `ai-digital-tech` |
| 5 | NEET & JEE Preparation | Excel | `neet-jee` |

---

## 2. Design System (single source of truth — build once in Stage 0, reference forever after)

### 2.1 Color tokens
Base 5 colors are fixed by the brand doc. Neutral/text scale below is a necessary, brand-consistent *extension* (the brand doc gives hero colors, not a full UI-ready neutral scale — pure indigo body text at small sizes fails contrast/readability, so a near-navy ink is used for text instead).

```js
// tailwind.config.js -> theme.extend.colors
colors: {
  indigo:  { DEFAULT: '#1E2A78', dark: '#141D57', light: '#3B4896' }, // trust, authority, nav/footer
  teal:    { DEFAULT: '#00B3B8', dark: '#00898D', light: '#3FCBCF' }, // innovation, links, secondary CTA
  gold:    { DEFAULT: '#F4B942', dark: '#D89F2B', light: '#F8CD73' }, // achievement — use SPARINGLY, accents only
  sky:     '#EAF6FF',   // section background tint
  white:   '#FFFFFF',
  ink:     '#12172E',   // body text (near-navy, not pure black — stays in brand family)
  slate:   '#5B6478',   // secondary/muted text
  border:  '#E4E9F2',   // dividers, card borders
}
```
**Usage rule:** indigo and white/sky carry ~80% of the UI (trust, calm). Teal is the interactive/secondary color (links, hover states, secondary buttons). Gold appears only on achievement moments — success states, "Excel"/"Achieve" pillar accents, primary CTA button — never as a background flood.

### 2.2 Typography
Two roles, both already brand-recommended fonts — no drift from the brief:
- **Display** (headlines, hero, section titles): **Sora**, weights 600/700. Geometric, rounded, carries the "crafted compass" personality.
- **Body/UI** (paragraphs, nav, forms, buttons): **Manrope**, weights 400/500/600. Same geometric family-feel, higher readability at small sizes.
- **Eyebrows/labels** (pillar tags, form labels): Manrope 600, uppercase, `letter-spacing: 0.08em`, `font-size: 0.75rem` — no third typeface needed.

Type scale (rem, desktop → mobile shrinks via `clamp()`):
`h1: clamp(2.25rem, 4vw, 3.5rem)` · `h2: clamp(1.75rem, 3vw, 2.5rem)` · `h3: 1.5rem` · `body: 1rem/1.7` · `small: 0.875rem`

### 2.3 Layout & structure
- Radius: `rounded-2xl` (1rem) as the default card/button/input radius — matches brand's "rounded edges for friendliness."
- Shadows: soft only — `shadow-[0_8px_30px_rgba(30,42,120,0.08)]`, never harsh/black drop shadows (supports "calm confidence").
- Section rhythm: `py-24` desktop / `py-14` mobile, max content width `1200px`, `px-6` gutters.
- **No decorative numbered markers (01/02/03) on the 5 course cards** — the verticals are not a sequence, presenting them as one implies a false hierarchy/order. Use icon + pillar label instead.

### 2.4 Signature element: The Pathway Motif
Pulled directly from the brand doc's own symbolism (§5 "interconnected pathways," §10 "global orbit"), turned into one real, reused UI element instead of generic decoration:

A thin (1.5px) teal/indigo line-and-node motif, arranged as an **orbit/ring** (not a left-to-right timeline — avoids implying the 5 verticals are sequential steps):
- **Hero:** faint animated SVG — the path draws itself once on load (`stroke-dashoffset` animation, ~1.2s, runs once), sitting behind the headline at low opacity. Skips animation entirely under `prefers-reduced-motion`, just renders static.
- **Courses Overview section:** the 5 course cards sit around a faint circular orbit line connecting them — visualizing "one connected ecosystem," not a 5-step funnel.
- **Footer:** the same ring, large-scale, very low opacity, as background texture.

This is the *one* place the design gets expressive — everything else stays quiet and disciplined around it.

### 2.5 Iconography
`lucide-react` (lightweight, line-based, zero cliché risk). Mapping:
| Course | Icon |
|---|---|
| Linguistics | `Languages` |
| Inclusive Education | `HeartHandshake` |
| Wellbeing & Counseling | `Sparkles` |
| AI and Digital Technologies | `BrainCircuit` |
| NEET & JEE | `Atom` |

### 2.6 Motion principles
Deliberate, not scattered. Scroll-reveal (fade + 12px slide-up, one shared `useReveal` hook via `IntersectionObserver` — no animation library dependency needed). Card hover: subtle lift (`translateY(-4px)`) + shadow deepen, 150ms. Hero pathway draw: once, on load. Nothing else animates. Always respect `prefers-reduced-motion: reduce`.

---

## 3. Information Architecture

### 3.1 Sitemap
```
/                          Landing page
/courses/:slug             Dynamic course page (5 routes, 1 template)
  /courses/linguistics
  /courses/inclusive-education
  /courses/wellbeing-counseling
  /courses/ai-digital-tech
  /courses/neet-jee
```
Global elements on every route: Navbar (with Courses dropdown), Footer, floating "Enquire Now" button, Enquiry Modal (mounted once at app root via context).

### 3.2 Component inventory (build once, reuse everywhere — this is the token-efficiency core)

| Component | Role | Used on |
|---|---|---|
| `Navbar` | Logo, nav links, **Courses dropdown** (5 items), "Enquire Now" CTA, mobile hamburger | Every page |
| `Footer` | Links, contact, pathway-motif background texture | Every page |
| `Button` | Primary (gold-on-indigo), Secondary (teal outline), Ghost variants | Everywhere |
| `SectionHeading` | Eyebrow label + H2 + optional subtext, consistent rhythm | All sections |
| `EnquiryModal` | Wraps `EnquiryForm`, focus-trapped, `Esc` to close | Landing popup, floating CTA |
| `EnquiryForm` | `mode="general"` (course dropdown) or `mode="locked"` (course fixed) | Modal + inline on course pages |
| `Hero` | Headline, subhead, primary CTA, pathway-motif SVG | Landing only |
| `TrustStrip` | Institutional trust signals (partner schools / accreditation-style badges) | Landing |
| `PillarsSection` | Learn/Include/Thrive/Achieve/Excel, 5-across | Landing |
| `CoursesOverview` | 5 course cards around orbit motif, links to `/courses/:slug` | Landing |
| `CoursePage` | **Data-driven template** — hero, description, highlights, locked enquiry form | All 5 course routes |

### 3.3 Content data model — `src/data/courses.js` (real content, ready to use verbatim)

```js
import { Languages, HeartHandshake, Sparkles, BrainCircuit, Atom } from 'lucide-react';

export const courses = [
  {
    slug: 'linguistics',
    pillar: 'Learn',
    name: 'Linguistics',
    icon: Languages,
    shortIntro: 'Build real fluency and confident communication across languages, guided by methods rooted in how people actually learn to speak, read, and connect.',
    longDescription: 'Educraft\'s linguistics track moves beyond textbook grammar drills toward practical, confidence-first language learning. Students build conversational fluency alongside academic writing and comprehension skills, with pathways tuned to their starting level and target language — preparing them to communicate, study, and thrive in genuinely global settings.',
    highlights: [
      'Personalized language pathways by level and goal',
      'Conversational and academic fluency tracks',
      'Global communication skill certification',
      'Small-group sessions led by language specialists',
    ],
  },
  {
    slug: 'inclusive-education',
    pillar: 'Include',
    name: 'Inclusive Education',
    icon: HeartHandshake,
    shortIntro: 'Learning designed around every learner — adaptive support for diverse needs, so no student is left outside the circle of opportunity.',
    longDescription: 'Every learner processes, paces, and engages differently — Educraft\'s inclusive education program is built around that reality rather than around it. Certified special-needs educators design individualized learning plans, adapt pace and sensory approach to each student, and keep families closely looped in, so progress is visible and support never feels like an afterthought.',
    highlights: [
      'Individualized learning plans per student',
      'Certified special-needs educators',
      'Pace- and sensory-adaptive content delivery',
      'Regular family partnership check-ins',
    ],
  },
  {
    slug: 'wellbeing-counseling',
    pillar: 'Thrive',
    name: 'Psychological Counseling & Wellbeing',
    icon: Sparkles,
    shortIntro: 'Confidential, judgment-free support that helps students manage stress, build resilience, and feel steady enough to focus on what matters.',
    longDescription: 'Academic pressure doesn\'t stay in the classroom — Educraft\'s counseling and wellbeing track gives students a confidential space to work through stress, exam anxiety, and the everyday weight of growing up. Licensed school counselors offer one-on-one sessions alongside practical resilience toolkits, with guidance extended to parents and teachers so support is consistent everywhere the student shows up.',
    highlights: [
      'Licensed, confidential school counselors',
      'Exam-anxiety and stress-management toolkits',
      'One-on-one sessions, judgment-free',
      'Guidance resources for parents and teachers',
    ],
  },
  {
    slug: 'ai-digital-tech',
    pillar: 'Achieve',
    name: 'AI and Digital Technologies',
    icon: BrainCircuit,
    shortIntro: 'Practical AI literacy and digital-world readiness — helping students think critically about technology and build the skills tomorrow\'s careers will actually need.',
    longDescription: 'Educraft\'s AI and Digital Technologies track moves past buzzwords into practical literacy — how AI tools actually work, how to use them responsibly, and the computational thinking behind them. Students build real digital fluency alongside ethical awareness, preparing them not just to use tomorrow\'s technology, but to understand and shape it with confidence.',
    highlights: [
      'Hands-on AI and machine-learning literacy',
      'Ethical and responsible technology use',
      'Computational thinking and coding foundations',
      'Real-world portfolio projects for future careers',
    ],
  },
  {
    slug: 'neet-jee',
    pillar: 'Excel',
    name: 'NEET & JEE Preparation',
    icon: Atom,
    shortIntro: 'Rigorous, exam-focused coaching for NEET & JEE aspirants — built on strong fundamentals, disciplined practice, and steady mentorship.',
    longDescription: 'Educraft\'s NEET & JEE program is built on fundamentals first — a concept-first curriculum mapped closely to the NCERT and JEE syllabus, reinforced through weekly mock tests with All-India ranking so students always know exactly where they stand. Regular doubt-clearing mentor sessions and a performance analytics dashboard keep preparation disciplined, measurable, and steady rather than last-minute and anxious.',
    highlights: [
      'Concept-first curriculum mapped to NCERT/JEE syllabus',
      'Weekly mock tests with All-India ranking',
      'Regular doubt-clearing mentor sessions',
      'Personal performance analytics dashboard',
    ],
  },
];

export const getCourseBySlug = (slug) => courses.find((c) => c.slug === slug);
```

---

## 4. Enquiry Form System Spec

**Two modes of one component — this is the exact mechanism satisfying both form requirements from the brief:**

- **`mode="general"`** (landing page popup, floating CTA): includes a "Which course are you interested in?" select, populated from `courses.js`. Used when intent is unknown.
- **`mode="locked"`** (embedded inline on every course page, near the bottom): course select is hidden; a fixed, visibly-stated field shows "Enquiring about: **[Course Name]**"; the slug is passed as a hidden form value. No way to change course from this instance — that's the whole point of "only take enquiry for that particular course."

### Fields
Full name* · Email* · Phone* · Course (select — general mode only, else locked+hidden) · Preferred contact time (optional) · Message (optional, textarea) · Consent checkbox* ("I agree to be contacted about this enquiry")

### Validation
Required-field check, email regex, phone digit-length check (10+ digits), consent must be checked before submit is enabled. Inline error text under each field, not just a top-of-form banner.

### Submission handling (demo-appropriate, real backend deferred)
Centralize submission in one file so the actual provider is a one-line swap later:
```js
// src/api/enquiry.js
export async function submitEnquiry(payload) {
  // Demo default: Formspree (free, no backend needed, emails actually arrive)
  // Replace YOUR_FORM_ID at https://formspree.io before the client demo.
  const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Submission failed');
  return res.json();
}
```
UI: submit → loading state on button → success state ("Thanks — we'll be in touch within 1 business day.") replacing the form, or inline error state with a retry option on failure.

### Accessibility (non-negotiable, both modes)
Every input has a real `<label>`, modal traps focus and returns it to the trigger button on close, `Esc` closes the modal, error messages are associated via `aria-describedby`.

---

## 5. Tech Stack & Rationale (keep this exact dependency list — don't let the agent add extras)

| Choice | Why |
|---|---|
| Vite + React 18 | Fast dev/preview loop for client demos, zero server needed |
| React Router v6 | One `CoursePage` template + 5 data-driven routes instead of 5 hand-written pages |
| Tailwind CSS | Design tokens live in `tailwind.config.js` once (Sec. 2), referenced everywhere — no scattered inline CSS |
| `lucide-react` | Line icons matching the "avoid cartoon/mascot" brand direction, tree-shakeable |
| **No animation library** | A ~30-line custom `useReveal` hook (IntersectionObserver) covers every motion need in Sec. 2.6 — skips a dependency for effects this simple |
| Formspree (demo only) | Genuinely working form submission with zero backend code, swappable later |

```
educraft-website/
├── index.html
├── tailwind.config.js
├── src/
│   ├── main.jsx  ·  App.jsx  ·  index.css
│   ├── data/courses.js
│   ├── api/enquiry.js
│   ├── hooks/useReveal.js
│   ├── context/EnquiryModalContext.jsx
│   ├── components/
│   │   ├── layout/  → Navbar.jsx, Footer.jsx
│   │   ├── ui/      → Button.jsx, SectionHeading.jsx, PathwayMotif.jsx
│   │   ├── enquiry/ → EnquiryModal.jsx, EnquiryForm.jsx
│   │   └── landing/ → Hero.jsx, TrustStrip.jsx, PillarsSection.jsx, CoursesOverview.jsx
│   └── pages/       → LandingPage.jsx, CoursePage.jsx
```

---

## 6. Multi-Stage Implementation Plan

> Run these in order. Each prompt block is copy-paste-ready for an AI coding agent. Verify "Definition of Done" before starting the next stage.

### Stage 0 — Scaffold & Design Tokens
**Goal:** working empty shell with the full design system wired in, nothing else.

```
Scaffold a new Vite + React 18 project named "educraft-website" with Tailwind CSS
and react-router-dom installed and configured. Set up the folder structure exactly
as specified in Section 5 of the Educraft build guide. Implement the color tokens,
font imports (Sora + Manrope from Google Fonts), and type scale exactly as defined
in Section 2.1–2.2 into tailwind.config.js and index.css. Create src/data/courses.js
with the exact content from Section 3.3, verbatim — do not paraphrase or shorten it.
Set up React Router with routes for "/" and "/courses/:slug" pointing to placeholder
LandingPage and CoursePage components. Confirm `npm run dev` runs with no console
errors before stopping.
```
**Files:** full project scaffold, `tailwind.config.js`, `src/data/courses.js`, routing shell.
**Done when:** dev server runs clean, brand colors/fonts visible in a basic test render, all 5 course objects present in `courses.js`.

### Stage 1 — Shared Layout Components
**Goal:** Navbar (with dropdown), Footer, Button, SectionHeading, PathwayMotif — the pieces every other stage depends on.

```
Using the design tokens already in tailwind.config.js (do not redefine them), build:
1. Navbar.jsx — logo/wordmark left, nav links, a "Courses" dropdown menu listing all
   5 items from src/data/courses.js (icon + name), an "Enquire Now" button on the
   right that will later open the enquiry modal (stub the onClick for now), and a
   mobile hamburger menu with an accordion-style course list. Dropdown must be
   keyboard-navigable and close on outside click / Esc.
2. Footer.jsx — brand statement, quick links, contact placeholder, with the Pathway
   Motif (Section 2.4) as a large, low-opacity background ring.
3. Button.jsx — primary (gold bg / indigo text), secondary (teal outline), and ghost
   variants as one component with a `variant` prop.
4. SectionHeading.jsx — eyebrow label + H2 + optional subtext, per Section 2.2 type
   rules.
5. PathwayMotif.jsx — a reusable SVG orbit-line-and-nodes component per Section 2.4,
   accepting props for size and animate (true/false), respecting prefers-reduced-motion.
Wire Navbar + Footer into App.jsx around the router outlet. No page content yet.
```
**Files:** `components/layout/`, `components/ui/`.
**Done when:** Navbar dropdown works on desktop + mobile, keyboard-navigable, visible focus rings on every interactive element, motif renders and respects reduced-motion.

### Stage 2 — Enquiry System
**Goal:** the form/modal system used by both the landing popup and every course page.

```
Build the enquiry system per Section 4 of the Educraft build guide:
1. EnquiryForm.jsx accepting a `mode` prop ("general" | "locked") and a `course`
   prop (used to lock the course field when mode="locked"). Implement the exact
   field set, validation rules, and success/error states from Section 4.
2. api/enquiry.js with the submitEnquiry function from Section 4 (Formspree
   placeholder — leave YOUR_FORM_ID as a clearly marked TODO).
3. EnquiryModal.jsx wrapping EnquiryForm in mode="general", focus-trapped, closes
   on Esc / outside click / close button, returns focus to the trigger on close.
4. context/EnquiryModalContext.jsx exposing openModal() so any component can trigger
   the general enquiry modal.
5. Wire Navbar's "Enquire Now" button and a new floating bottom-right "Enquire Now"
   button (visible on all pages) to context.openModal().
```
**Files:** `components/enquiry/`, `api/enquiry.js`, `context/EnquiryModalContext.jsx`.
**Done when:** modal opens from Navbar and floating button, full validation works, focus trap works, submitting shows loading → success/error states, all inputs have real labels.

### Stage 3 — Landing Page
**Goal:** the full landing page, assembled entirely from Stage 1–2 components plus new landing-only sections.

```
Build the landing page using ONLY the components already built in Stage 1–2 plus
these new landing-only sections, assembled in LandingPage.jsx in this order:
1. Hero.jsx — headline built from the brand tagline "Empowering Schools, Empowering
   Students," subhead from Section 1.1's positioning, primary Button opening the
   enquiry modal (mode="general"), animated PathwayMotif in the background per
   Section 2.4.
2. TrustStrip.jsx — a row of institutional trust signals (e.g. "Trusted by schools
   across [X] countries," accreditation-style badges) directly under the hero.
3. PillarsSection.jsx — Learn / Include / Thrive / Achieve / Excel, 5-across on
   desktop, using SectionHeading + icons from courses.js.
4. CoursesOverview.jsx — 5 cards (one per course from courses.js: icon, pillar
   eyebrow, name, shortIntro, "Learn more" link to /courses/:slug), arranged
   around the PathwayMotif orbit per Section 2.4 — NOT numbered, NOT presented as
   a linear sequence.
5. FinalCTA.jsx — closing section reinforcing trust + a second Button opening the
   enquiry modal.
Apply the scroll-reveal behavior (Section 2.6) via a shared useReveal hook to each
section as it enters the viewport.
```
**Files:** `pages/LandingPage.jsx`, `components/landing/`, `hooks/useReveal.js`.
**Done when:** full page renders top-to-bottom with real content (no lorem ipsum), all 5 course cards link correctly, enquiry modal opens from both CTAs, scroll-reveal works and respects reduced-motion, responsive at 375px/768px/1280px.

### Stage 4 — Dynamic Course Pages
**Goal:** one template, all 5 routes, each with its own locked enquiry form.

```
Build pages/CoursePage.jsx as a single template driven by the useParams() slug,
looked up via getCourseBySlug() from src/data/courses.js. Layout:
1. Course hero — pillar eyebrow, course name, longDescription, PathwayMotif
   (static, non-animated variant) as background accent.
2. Highlights section — the 4 highlights from courses.js as a clean list/grid,
   each with a small check or relevant icon.
3. Inline enquiry section at the bottom — EnquiryForm with mode="locked" and
   course={the current course}, wrapped in its own SectionHeading ("Enquire
   about [Course Name]").
4. Handle an invalid/unknown slug with a simple "Course not found" state linking
   back to "/".
Confirm all 5 routes (/courses/linguistics, /courses/inclusive-education,
/courses/wellbeing-counseling, /courses/ai-digital-tech, /courses/neet-jee)
render correctly from this one template.
```
**Files:** `pages/CoursePage.jsx`.
**Done when:** all 5 course URLs work, each shows correct content and a correctly-locked enquiry form (course field fixed, not editable), invalid slugs handled gracefully.

### Stage 5 — Motion, Responsive & Accessibility Pass
**Goal:** cross-cutting polish across the whole site — not new components.

```
Do a full-site pass, no new components:
1. Verify every interactive element (links, buttons, dropdown, modal, form
   fields) has a visible keyboard focus state per Section 2.
2. Verify all motion (hero pathway draw, scroll-reveal, card hover) respects
   prefers-reduced-motion: reduce.
3. Test and fix responsive layout at 375px, 768px, 1024px, 1280px for the
   landing page and one course page — no horizontal scroll, no overlapping
   text, mobile nav fully usable.
4. Run a contrast check on all text/background combinations from Section 2.1 —
   fix any pairing under WCAG AA (4.5:1 body text, 3:1 large text).
5. Confirm no console errors or warnings across all 6 routes.
```
**Done when:** all 5 checks above pass on every route.

### Stage 6 — SEO, QA & Deployment Prep
**Goal:** demo-ready, shareable build.

```
1. Set a unique document.title and meta description per route (landing +
   5 course pages), using each course's name/shortIntro for the course pages.
2. Add a favicon and basic Open Graph tags (title, description) to index.html.
3. Run `npm run build` and fix any build errors or warnings.
4. Write a short README.md with: install steps, dev command, the Formspree
   YOUR_FORM_ID TODO location, and a one-line deployment note for Vercel/Netlify
   (drag-and-drop the /dist folder, or connect the repo for auto-deploys).
```
**Done when:** `npm run build` succeeds cleanly, every route has a distinct title/description, README is accurate.

---

## 7. Definition of Done — whole project

- [ ] All 5 course verticals present with real content, equal visual weight
- [ ] Navbar Courses dropdown works, keyboard-accessible, mobile-usable
- [ ] Landing page enquiry popup lets the visitor pick any course
- [ ] Every course page has its own locked, course-specific enquiry form
- [ ] Forms validate properly and submit successfully (Formspree ID configured before client demo)
- [ ] Design uses only the tokens from Section 2 — no off-palette colors, no off-brief fonts
- [ ] Pathway motif is the one expressive element; everything else is quiet and disciplined
- [ ] No graduation caps / mascots / cartoon children / generic stock edtech imagery anywhere
- [ ] Fully responsive 375px → 1280px+, visible focus states, reduced-motion respected
- [ ] `npm run build` succeeds with no errors

---

## 8. Deployment & Client Demo Notes

- **Fastest path for a client demo:** `npm run build`, then drag the `/dist` folder into Netlify Drop, or connect the GitHub repo to Vercel for a live URL in under 2 minutes — no backend to provision.
- **Before the actual demo call:** create a free Formspree account, replace `YOUR_FORM_ID` in `src/api/enquiry.js`, and send yourself one test enquiry from each form mode so you can show the client a real email landing in an inbox — this is what makes it read as "working," not just "styled."
- **Natural upsell path once they approve the demo:** move to Next.js for server-rendered SEO, add a real CMS (Sanity/Contentful) for course content instead of the static `courses.js`, and swap Formspree for a proper CRM webhook (this is exactly why `submitEnquiry()` was isolated into one file in Stage 2 — that's the only place that changes).
