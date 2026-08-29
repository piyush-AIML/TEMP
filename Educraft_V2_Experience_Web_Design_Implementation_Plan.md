> # ✅ STATUS: COMPLETED — ARCHIVED. Do not plan or build from this document.
>
> This plan was **fully implemented** as V2 and shipped in commits `Prod.ver-0.0.1` / `Prod.ver-0.0.2`
> (Aug 2026). Every Stage 1–15 roadmap item is done; the few deliberately deferred items were
> carried forward into the V3 roadmap.
>
> **Skip this file in future sessions.** The three live documents are:
> - **Current state:** [`prod.md`](prod.md) — the single source of truth for the production system
> - **Next version planner:** [`Educraft_V3_Next_Version_Planner.md`](Educraft_V3_Next_Version_Planner.md) — remaining work, tiered A–D
> - **Previous state:** [`Educraft_V1_Previous_State.md`](Educraft_V1_Previous_State.md) — what existed before this plan ran
>
> Kept only as a historical reference for *why* V2 looks the way it does.

---

# Educraft V2 — Full Experience Web Design & UI/UX Implementation Plan

**Project:** Educraft  
**Repository:** `piyush-AIML/TEMP`  
**Current stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Three.js, React Three Fiber, Drei, Lucide, next-themes  
**Primary goal:** Transform the current polished landing-page prototype into a richer, art-directed, interactive education experience that feels premium, alive, trustworthy, and production-ready.

---

## 0. Executive Direction

### V2 north star

Educraft V2 should stop feeling like a conventional SaaS/education landing page and start feeling like a **digital education ecosystem**.

The experience should communicate:

> **Many learning paths. One connected ecosystem.**

The five pillars — Learn, Include, Thrive, Achieve, Excel — should not feel like five unrelated cards. They should become the visual and narrative structure of the entire website.

### Experience qualities to target

- Editorial rather than template-driven
- Warm, human, trustworthy, and intelligent
- Premium without feeling luxurious for its own sake
- Motion-rich without becoming distracting
- Visually memorable within the first 5 seconds
- Strong enough to compete with modern award-style/agency-level interactive websites
- Accessible and performant on ordinary laptops and phones
- Designed around content hierarchy, not decoration

### V2 transformation

| Current V1 | V2 direction |
|---|---|
| Static hero + decorative 3D | Story-led hero with scroll-reactive visual system |
| Cards as primary content pattern | Layered editorial modules + interactive programme storytelling |
| Basic fade-in reveal | Purposeful motion language + scroll choreography |
| Two simple 3D scenes | One coordinated visual system with reusable scene primitives |
| One-page anchor navigation | Structured information architecture + course detail routes |
| Basic content blurbs | Rich programme narratives, outcomes, audience, methodology, proof |
| Demo enquiry submission | Real lead capture pipeline |
| Generic placeholder links | Real information architecture and legal/business pages |
| Repeated hard-coded values | Design tokens and content models |
| Few visual assets | Custom SVG artwork, diagrams, illustrations, textures, iconography |
| Basic dark mode | Fully art-directed theme system |
| Prototype accessibility | Production accessibility |
| Landing-page mindset | Brand experience + conversion system |

---

# 1. Experience Strategy

## 1.1 Primary audiences

The site should serve multiple users without forcing them into a single generic path.

### A. School leaders

Needs:
- Institutional credibility
- Programme breadth
- Partnership model
- Delivery quality
- Measurable outcomes
- Contact pathway

Desired action:
- `Talk to the Education Team`

### B. Parents

Needs:
- Safety and trust
- Individual student support
- Programme clarity
- Benefits and outcomes
- How the learning journey works
- Easy enquiry

Desired action:
- `Find the right programme`

### C. Students

Needs:
- Energy
- Future-oriented learning
- Tangible outcomes
- Interesting programme experiences
- Confidence and belonging

Desired action:
- `Explore your path`

### D. Partners / organisations

Needs:
- Capability
- Scope
- Reach
- Partnership models
- Contact channel

Desired action:
- `Partner with Educraft`

---

# 2. New Information Architecture

The current one-page architecture should evolve into a broader experience system.

## Recommended sitemap

```text
/
├── /about
├── /programmes
│   ├── /programmes/linguistics
│   ├── /programmes/inclusive-education
│   ├── /programmes/wellbeing-counseling
│   ├── /programmes/ai-digital-tech
│   └── /programmes/neet-jee
├── /for-schools
├── /for-parents
├── /for-students
├── /methodology
├── /impact
├── /insights
│   ├── /insights/[slug]
├── /careers
├── /partnerships
├── /contact
├── /privacy
└── /terms
```

### Why this matters

This creates:
- better SEO
- clearer user journeys
- shareable programme pages
- content scalability
- better analytics
- richer storytelling
- better navigation
- future CMS readiness

The homepage then becomes the **gateway**, not the entire product.

---

# 3. Homepage V2 Information Architecture

Recommended homepage sequence:

```text
01 — Global navigation
02 — Hero / brand statement
03 — "One ecosystem, many paths" visual system
04 — Five programme journey
05 — What makes Educraft different
06 — Interactive student journey
07 — Programme deep-dive
08 — Outcomes / evidence / impact
09 — For schools / parents / students
10 — Methodology
11 — Stories / testimonials / case studies
12 — Insights / knowledge
13 — Final conversion section
14 — Footer
```

This creates a narrative arc:

```text
Understand
   ↓
Explore
   ↓
Trust
   ↓
Imagine
   ↓
Choose
   ↓
Act
```

---

# 4. Hero Redesign

## 4.1 Goal

The hero should immediately establish that Educraft is a **connected learning ecosystem**, not simply a collection of courses.

### Recommended hero composition

Left:
- compact eyebrow
- strong headline
- concise supporting message
- primary CTA
- secondary text link

Right / background:
- large generative ecosystem visual
- five nodes representing the five pillars
- subtle SVG network
- depth layers
- floating visual artefacts
- controlled camera movement
- cursor response
- scroll-linked transition

### Headline direction

Avoid generic:

> Empowering Schools, Empowering Students

Keep this as supporting brand language, but test stronger visual headlines such as:

> **Five paths. One learning ecosystem.**

or:

> **Learning that grows with the learner.**

Supporting line:

> From language and inclusion to wellbeing, AI literacy, and competitive exam preparation — Educraft connects the pieces that help students move forward.

### Hero interaction

At load:

```text
0ms
background atmosphere appears

300ms
ecosystem silhouette fades in

600ms
five nodes emerge

900ms
headline reveals

1200ms
supporting copy reveals

1500ms
CTA becomes active

idle
subtle ambient movement
```

On scroll:

```text
hero scene scales slightly down
headline moves upward
nodes drift apart
background depth increases
hero visual transforms into the programme visual
```

This creates continuity between sections.

---

# 5. The New Visual Language

## 5.1 Core concept

Create a visual system around:

**Path → Node → Layer → Connection → Growth**

Use these metaphors consistently.

### Path

Represents:
- progress
- learning journeys
- movement

### Node

Represents:
- programmes
- milestones
- ideas

### Layer

Represents:
- depth
- knowledge
- support

### Connection

Represents:
- ecosystem
- relationships
- interdisciplinary learning

### Growth

Represents:
- outcomes
- confidence
- capability

These should appear in:
- SVG illustrations
- 3D scenes
- backgrounds
- diagrams
- transitions
- UI patterns

---

# 6. Typography System

## 6.1 Current direction

The project already uses Sora + Manrope, which is a strong starting point.

V2 should formalize them into a hierarchy.

### Display

**Sora**
- 700
- very large sizes
- high contrast hierarchy

### Interface / body

**Manrope**
- 400
- 500
- 600

### Optional editorial accent

Introduce a restrained serif only if the visual direction benefits from it.

Potential role:
- quotations
- narrative labels
- editorial section intros

Do not use it broadly.

## 6.2 Recommended type scale

```text
Display XL     84 / 0.95
Display L      68 / 1.00
Display M      52 / 1.04
Heading XL     44 / 1.08
Heading L      36 / 1.12
Heading M      28 / 1.18
Heading S      22 / 1.22
Body L         20 / 1.55
Body M         17 / 1.60
Body S         14 / 1.50
Caption        12 / 1.30
```

Use responsive `clamp()` values rather than rigid sizes.

## 6.3 Typography principles

- Headlines should be short
- Body copy should be narrower than the layout container
- Avoid repeated large headings
- Use whitespace as hierarchy
- Use all-caps only for micro-labels
- Keep line lengths around 55–75 characters for editorial paragraphs

---

# 7. Color System V2

The existing palette is strong:

```text
Indigo
Teal
Gold
Sky
Ink
Slate
```

Keep the brand core but add tonal layers.

## Core

```text
Indigo 900
Indigo 700
Indigo 500
Teal 600
Teal 500
Teal 300
Gold 500
```

## Neutrals

```text
Canvas
Canvas Soft
Canvas Deep
Ink Strong
Ink
Ink Muted
Border
```

## Semantic

```text
Success
Warning
Error
Info
Focus
```

## Programme colors

Each pillar can have an accent identity while still fitting the master palette.

Example:

```text
Learn     → teal
Include   → warm blue
Thrive    → lavender / soft violet
Achieve   → gold
Excel     → indigo
```

Do not turn every section into a completely different color theme. Use the pillar color as a controlled accent.

---

# 8. Layout System

## Grid

Establish a strong 12-column system.

```text
max-width: 1440px
content max-width: 1200–1280px
outer gutter:
  desktop: 48–64px
  tablet: 32px
  mobile: 20–24px
```

## Vertical rhythm

Use a spacing scale rather than ad-hoc values:

```text
4
8
12
16
24
32
48
64
80
96
128
160
192
```

Large visual moments should use generous vertical spacing.

---

# 9. Navigation V2

## Desktop

Use a minimal fixed navigation.

Suggested:

```text
Logo | Programmes | Experiences | About | Insights | [Enquire]
```

The nav should transition as the user scrolls.

### At top

- transparent
- low visual weight
- logo in brand color

### After scroll

- subtle background
- backdrop blur
- border
- slight shrink
- active section indicator

### Programme interaction

Replace the current basic dropdown with a **mega navigation panel**.

Structure:

```text
Programmes

Learn
Linguistics
Short description

Include
Inclusive Education
Short description

Thrive
Wellbeing
Short description

Achieve
AI & Digital Technologies
Short description

Excel
NEET & JEE
Short description
```

Add a visual mini-map or SVG strip.

---

# 10. Hero Ecosystem Visual

The current HeroScene is a good prototype, but V2 should use richer composition.

## Build reusable 3D primitives

```text
EcosystemScene
├── Core
├── Orbit
├── Node
├── Connection
├── ParticleField
├── GeometricArtifact
├── GlowLayer
└── CameraRig
```

## Visual upgrade

Instead of isolated torus + spheres:

```text
central form
+
5 orbit nodes
+
curved connection lines
+
floating cards
+
depth planes
+
soft volumetric glow
+
micro-particles
+
subtle noise
```

### Interaction

Cursor:
- slight parallax
- node attraction
- camera easing

Scroll:
- scene rotation
- camera pull-back
- node rearrangement

Reduced motion:
- static composition
- no continuous rotation

---

# 11. SVG Artifact System

One of the biggest V2 upgrades should be the introduction of custom SVG artwork.

## SVG families

### A. Learning paths

Curved path systems that connect:
- starting point
- exploration
- milestone
- outcome

### B. Ecosystem maps

A visual map of all five pillars.

### C. Abstract educational diagrams

Examples:
- layered cognition
- feedback loop
- student growth cycle
- school-family-student connection

### D. Decorative SVGs

- gradient mesh
- line networks
- abstract geometric forms
- star fields
- contour patterns
- dotted maps

### E. Programme-specific illustrations

Each programme should have one hero SVG illustration.

---

# 12. SVG Technical Rules

Every SVG asset should:

- be optimized
- have meaningful dimensions
- use `currentColor` where practical
- minimize path count where possible
- avoid unnecessary embedded raster images
- support light/dark variants
- be reusable with CSS variables
- have appropriate accessibility attributes

Use a shared utility layer:

```text
/src/components/educraft/graphics/
├── LearningPathGraphic.tsx
├── EcosystemGraphic.tsx
├── StudentJourneyGraphic.tsx
├── NetworkGraphic.tsx
├── ProgrammeGraphic.tsx
└── DecorativeMesh.tsx
```

---

# 13. New "One Ecosystem" Section

Immediately after the hero.

## Concept

Display the five pillars as a connected system.

Desktop:

```text
             Learn

      Include       Achieve

             Core

      Thrive        Excel
```

Connections animate as the user enters.

Hovering a pillar:
- node enlarges
- corresponding connection lights up
- short description appears
- related outcomes appear

Clicking:
- routes to programme detail

Mobile:
- replace complex orbital layout with stacked interactive timeline/cards

---

# 14. Programme Exploration Section

Instead of a simple vertical list of cards, use an editorial interaction.

## Desktop layout

Left:
- sticky programme title
- pillar label
- description
- CTA

Right:
- large visual
- supporting stats
- highlights
- animated content

As the user scrolls:

```text
Learn
  ↓
Include
  ↓
Thrive
  ↓
Achieve
  ↓
Excel
```

The visual scene can change without recreating a whole page section.

This produces a **scroll-driven programme story**.

---

# 15. Programme Detail Pages

Each programme page should feel like its own mini-experience.

## Structure

```text
Hero
Programme promise
Why it matters
Who it is for
How it works
Curriculum / programme structure
Learning journey
Expected outcomes
Example activities
Support model
Evidence / proof
FAQs
Enquiry CTA
Related programmes
```

## Hero

Use:
- programme-specific art
- animated SVG
- one restrained 3D object
- strong headline

Avoid putting a full 3D canvas on every page by default.

---

# 16. Richer Content Architecture

The current data object only contains:

```text
slug
pillar
name
icon
shortIntro
longDescription
highlights
```

V2 should evolve it.

Recommended model:

```ts
interface Programme {
  slug: string;
  pillar: Pillar;
  name: string;
  tagline: string;
  description: string;
  audience: string[];
  outcomes: string[];
  highlights: Highlight[];
  methodology: MethodStep[];
  curriculum?: CurriculumSection[];
  faqs?: FAQ[];
  proof?: ProofPoint[];
  visual: ProgrammeVisual;
  cta: CTAConfig;
}
```

This allows the UI to become content-driven instead of hard-coded.

---

# 17. "How It Works" Section

Introduce a clear 4–5 step journey.

Example:

```text
01 Understand
We learn about the student.

02 Map
We identify the right pathway.

03 Learn
We deliver the programme.

04 Measure
We track progress.

05 Grow
We adjust and continue.
```

## Visual treatment

Use a long SVG path.

As the user scrolls:
- path draws
- milestone nodes appear
- cards emerge
- progress indicator advances

This becomes one of the strongest signature moments of the site.

---

# 18. Student Journey Story

Add a visualized student story.

Possible sequence:

```text
Curious
→ Supported
→ Practising
→ Confident
→ Capable
→ Ready
```

Each stage can show:
- a small illustration
- a quote
- a metric
- an example intervention

This adds emotional depth that the current site lacks.

---

# 19. Trust / Proof Section

The current trust strip should evolve beyond a decorative logo/stat strip.

Build a proof system around:

```text
People
Process
Evidence
Partnerships
Outcomes
```

Potential content types:

- accreditation
- educator expertise
- programme methodology
- student/parent testimonials
- case studies
- measurable outcomes
- school partnerships
- process transparency

Do not invent statistics. Use real verified data only.

---

# 20. Testimonials

Make testimonials feel editorial rather than carousel-like.

## Desktop

Large quote with:
- portrait
- name
- role
- context
- programme

Secondary supporting quote visible nearby.

## Interaction

Subtle drag/scroll movement.

Avoid:
- autoplay carousel
- excessive pagination dots
- generic stock faces

---

# 21. Impact / Outcomes Section

Instead of saying only "better learning", show the structure of impact.

Example layout:

```text
Confidence
↑

Engagement
↑

Skill
↑

Readiness
↑
```

Visualize this with:
- animated metrics
- SVG graphs
- radial diagrams
- before/after conceptual paths

Numbers should only appear when real data exists.

---

# 22. Audience-Based Entry Points

Introduce:

```text
For schools
For parents
For students
```

Each should have:
- a different framing
- relevant benefits
- appropriate CTA
- supporting content

This is better UX than trying to speak to everyone equally in every section.

---

# 23. Insights / Content Layer

Create an `/insights` area.

Content categories:

- Learning science
- AI literacy
- Inclusive education
- Student wellbeing
- Exam preparation
- School leadership
- Parent guidance

Article cards should include:
- category
- reading time
- date
- title
- image/illustration
- excerpt

This makes the site richer and improves long-term SEO.

---

# 24. Microinteraction System

Build a central motion language.

## Buttons

States:

```text
idle
hover
press
focus
disabled
loading
success
```

Hover:
- tiny lift
- background transition
- icon movement

Avoid exaggerated magnetic effects on critical forms.

## Cards

Hover:
- subtle elevation
- border highlight
- internal artwork movement

Do not combine too many effects simultaneously.

---

# 25. Scroll Motion System

Use several motion layers.

## Layer 1 — Reveal

- opacity
- 8–24px translation
- soft clipping

## Layer 2 — Parallax

- background movement
- image depth
- SVG movement

## Layer 3 — Pinned storytelling

Use sticky sections for:
- programme exploration
- methodology
- student journey

## Layer 4 — Scene transformation

The same visual system changes state across sections.

## Layer 5 — Micro motion

Small continuous motion in:
- particles
- lines
- decorative geometry

---

# 26. Motion Timing

Create shared tokens.

```text
Instant       100ms
Fast          160ms
Standard      240ms
Emphasis      400ms
Reveal        600–800ms
Hero          1000–1600ms
```

Use easing curves intentionally.

Recommended baseline:

```text
ease-out
cubic-bezier(0.22, 1, 0.36, 1)
```

Longer transitions should have stronger visual purpose.

---

# 27. Scroll Engine Recommendation

Do not build dozens of custom scroll listeners.

Introduce a centralized scroll abstraction.

Potential architecture:

```text
useScrollProgress()
useSectionProgress()
useReducedMotion()
useParallax()
```

For advanced choreography, evaluate:

- native IntersectionObserver
- `requestAnimationFrame`
- Framer Motion / Motion
- GSAP ScrollTrigger
- Lenis-style smooth scrolling

### Recommendation

Use a lightweight motion library for UI motion and only introduce GSAP/ScrollTrigger for the genuinely scroll-driven sequences.

Do not add a heavy library just to animate fades.

---

# 28. Smooth Scrolling

A premium smooth-scroll layer can be introduced carefully.

Requirements:

- disabled under reduced motion
- no scroll hijacking that harms accessibility
- keyboard navigation remains native
- browser back/forward remains correct
- anchors still work
- touch scroll remains natural

Use native scroll unless testing proves a smooth-scroll library significantly improves the experience.

---

# 29. Cursor Experience

Desktop-only enhancement.

### Cursor system

Default cursor:
- normal

Interactive:
- tiny scale increase
- optional ring

Over programme visual:
- contextual label such as `Explore`

Over CTA:
- subtle magnetic pull

Do not apply custom cursors on:
- touch devices
- keyboard-only environments
- users who prefer reduced motion

---

# 30. Modal and Overlay Redesign

The current modal is structurally reasonable but should evolve.

## Course modal

Replace the huge form-first experience with:

```text
Programme title
Visual
Short promise
Highlights
Audience
Outcome
CTA
```

Then:

`Enquire about this programme`

opens the enquiry flow.

## Enquiry flow

Use a staged form:

```text
01 About you
02 What are you looking for?
03 Contact preferences
04 Confirmation
```

This can improve perceived simplicity.

---

# 31. Real Enquiry Backend

Production path:

```text
Form
  ↓
POST /api/enquiry
  ↓
Server validation
  ↓
Rate limit
  ↓
Spam / abuse protection
  ↓
Persist
  ↓
Email / CRM
  ↓
Analytics event
  ↓
Confirmation
```

Potential destinations:
- database
- CRM
- transactional email
- internal notification

The client should never determine whether a submission succeeded.

---

# 32. Form UX

Add:

- inline validation
- helpful error messages
- input `autocomplete`
- proper phone input
- consent copy
- success state
- server errors
- retry state
- loading state
- accessible announcements

Use real contact and privacy information.

---

# 33. Accessibility V2

Target WCAG 2.2 AA where applicable.

## Required

- semantic landmarks
- logical heading hierarchy
- visible focus
- keyboard navigation
- accessible dialogs
- screen-reader labels
- reduced motion
- sufficient color contrast
- no information conveyed by color alone
- touch targets at least comfortable mobile size
- form errors associated with inputs

## Advanced

- keyboard navigation for course mega menu
- escape behavior
- focus restoration
- focus containment
- skip link
- `aria-current`
- meaningful alt text
- decorative graphics hidden from assistive technology

---

# 34. Mobile-First Experience

Do not simply collapse desktop layouts.

Create mobile-specific composition rules.

### Mobile hero

- fewer visual layers
- static or low-motion 3D
- shorter headline
- stronger CTA placement
- no unnecessary decorative clutter

### Mobile programme exploration

Use:
- horizontal snap cards
- sticky category header
- short content blocks

### Mobile graphics

Simplify:
- fewer particles
- fewer geometric objects
- lower DPR where necessary

---

# 35. Performance Strategy

3D is the biggest potential risk.

## Goals

Target approximately:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

while preserving visual quality.

Measure on real devices rather than desktop only.

## Optimizations

- dynamic import WebGL
- render only when needed
- pause off-screen scenes
- reduce DPR on weaker devices
- remove unnecessary point lights
- reuse geometries/materials
- use instancing for repeated particles
- avoid multiple WebGL contexts when one system can serve multiple sections
- keep canvas transparent only when necessary
- compress SVGs
- lazy-load non-critical imagery
- preconnect only where justified

---

# 36. WebGL Architecture V2

Replace the current separate scene pattern with reusable infrastructure.

Suggested:

```text
three/
├── core/
│   ├── CanvasShell.tsx
│   ├── CameraRig.tsx
│   ├── Lighting.tsx
│   └── Performance.tsx
├── primitives/
│   ├── Node.tsx
│   ├── Orbit.tsx
│   ├── Connector.tsx
│   ├── ParticleField.tsx
│   └── GeometryArtifact.tsx
├── scenes/
│   ├── EcosystemScene.tsx
│   ├── ProgrammeScene.tsx
│   └── CTAAtmosphere.tsx
└── hooks/
    ├── useThreePerformance.ts
    └── useReducedMotion.ts
```

This avoids every page inventing its own 3D infrastructure.

---

# 37. Design System Architecture

Create a centralized design-token layer.

```text
design/
├── tokens.ts
├── motion.ts
├── typography.ts
├── colors.ts
└── radii.ts
```

Even when Tailwind is used, keep semantic values defined centrally.

Example:

```ts
export const motion = {
  fast: 0.16,
  standard: 0.24,
  reveal: 0.6,
  hero: 1.2,
};
```

---

# 38. Component Architecture V2

Recommended component map:

```text
components/
└── educraft/
    ├── accessibility/
    ├── content/
    ├── enquiry/
    ├── layout/
    ├── landing/
    │   ├── Hero/
    │   ├── Ecosystem/
    │   ├── ProgrammeExplorer/
    │   ├── Methodology/
    │   ├── Impact/
    │   ├── Testimonials/
    │   └── FinalCTA/
    ├── programme/
    ├── graphics/
    ├── motion/
    ├── three/
    └── ui/
```

Avoid creating tiny components that merely wrap one `<div>`. Extract components when they represent a reusable concept.

---

# 39. Content Architecture

Move hardcoded content into structured data.

Suggested:

```text
data/
├── programmes.ts
├── pillars.ts
├── testimonials.ts
├── faqs.ts
├── insights.ts
└── navigation.ts
```

Potential future migration:

```text
Headless CMS
```

Only introduce CMS when content updates justify it.

---

# 40. Better Icons and Graphics

Lucide should remain for interface actions.

Do not use Lucide as the primary visual identity.

Instead:

```text
Lucide
→ controls / UI

Custom SVG
→ programme identity

3D
→ hero / storytelling

Illustration
→ editorial sections
```

This will make the website feel much more branded.

---

# 41. New Visual Asset Inventory

Create a production asset map.

```text
/public/
├── brand/
├── logos/
├── illustrations/
├── patterns/
├── programmes/
│   ├── linguistics/
│   ├── inclusive/
│   ├── wellbeing/
│   ├── ai/
│   └── neet-jee/
├── textures/
└── social/
```

Recommended asset types:

- SVG
- AVIF/WebP
- optimized PNG only where needed
- Lottie only when SVG/CSS/3D cannot do the job efficiently

---

# 42. Decorative Systems

Introduce consistent background systems.

## System A — Gradient mesh

Very subtle.

## System B — Dotted constellation

Used around ecosystem sections.

## System C — Topographic lines

Used around methodology.

## System D — Grid

Used sparingly for technological sections.

## System E — Path lines

Used for transitions and journeys.

Each should be reusable, not individually redrawn.

---

# 43. Better Section Transitions

Avoid abrupt:

```text
white section
→ light blue section
→ white section
→ dark section
```

Instead, use transitions.

Examples:

```text
Hero sky
    ↓ gradient
Ecosystem white
    ↓ path lines
Programme blue
    ↓ SVG contour
Methodology white
    ↓ dark wash
CTA indigo
```

Sections should feel like one continuous environment.

---

# 44. Dark Mode V2

Dark mode should not simply invert colors.

Design an alternate art direction.

### Light

- airy
- educational
- optimistic
- soft sky backgrounds

### Dark

- cinematic
- atmospheric
- deeper indigo
- subtle glow
- restrained teal

The same graphics can have different contrast levels.

---

# 45. Footer V2

The footer should become a closing brand moment.

## Structure

```text
Large statement

"Build learning journeys that last."

Primary CTA

Navigation clusters

Programme links

Audience links

Company

Contact

Legal

Social

```

Add an abstract pathway SVG in the background.

Keep the visual quiet compared with the hero.

---

# 46. SEO V2

Implement:

- title templates
- metadata per programme
- canonical URLs
- OG images
- Twitter/X metadata
- sitemap
- robots
- structured data
- course/programme schema where appropriate
- breadcrumb schema on nested pages

Create social preview assets for:
- homepage
- each programme
- key insights

---

# 47. Analytics

Track meaningful events.

```text
page_view
programme_view
programme_cta
enquiry_started
enquiry_completed
enquiry_error
nav_open
theme_changed
scroll_depth
insight_open
```

For scroll storytelling, avoid sending an event for every scroll frame. Track meaningful milestones.

---

# 48. Testing Strategy

## Unit

Test:
- pure utilities
- data helpers
- validation

## Component

Test:
- modal behavior
- enquiry form
- menu
- theme control
- keyboard navigation

## E2E

Test:
- navigation
- programme selection
- enquiry submission
- mobile menu
- route navigation
- reduced motion behavior

## Visual regression

Test:
- homepage
- programme pages
- dark mode
- mobile breakpoints

---

# 49. Recommended Technology Additions

Do not add every tool at once.

## Strong candidates

### Motion
**Motion** / Framer Motion style APIs:
- UI transitions
- layout motion
- presence

### Advanced scroll
**GSAP + ScrollTrigger**
- pinned storytelling
- complex timeline choreography

### Smooth scroll
**Lenis-like solution**
- only after native scrolling is evaluated

### Validation
**Zod**
- server + client schemas

### Forms
React form library only if complexity grows.

### Analytics
A privacy-conscious analytics platform appropriate to the deployment.

### Error monitoring
Production error monitoring once public traffic exists.

---

# 50. Implementation Roadmap

The work should be staged instead of rewritten all at once.

---

## Stage 0 — Discovery & Experience Audit

### Goal

Establish the V2 product and visual direction before rewriting components.

### Tasks

- audit current homepage visually
- inventory existing content
- define personas
- define CTA hierarchy
- map journeys
- finalize sitemap
- establish visual references
- establish motion references
- define accessibility baseline
- define performance budget

### Deliverables

```text
UX principles
sitemap
user journeys
content inventory
design direction
motion principles
performance budget
```

### Exit criteria

Everyone can explain:
- who the site is for
- what the primary action is
- what makes Educraft different
- what the visual language is

---

# 51. Stage 1 — Design System Foundation

### Goal

Create the reusable visual language.

### Tasks

- finalize color tokens
- typography scale
- spacing system
- radii
- shadows
- elevation
- button system
- input system
- card system
- modal system
- focus states
- responsive breakpoints
- motion tokens

### Files / architecture

```text
src/
├── design/
├── components/educraft/ui/
└── app/globals.css
```

### Exit criteria

All major UI pieces can be assembled from tokens without arbitrary one-off values.

---

# 52. Stage 2 — Information Architecture & Content Model

### Goal

Separate content from presentation.

### Tasks

- create `Programme` type
- create pillar model
- create audience model
- create FAQ model
- create testimonial model
- create navigation model
- create content helper functions
- define future CMS shape

### Exit criteria

Homepage and programme pages render primarily from structured data.

---

# 53. Stage 3 — Navigation & App Shell

### Goal

Build the structural frame of the site.

### Tasks

- redesign navbar
- mega menu
- active navigation state
- mobile navigation
- skip link
- footer
- legal links
- route structure
- theme handling
- global scroll lock utility

### Exit criteria

Navigation is accessible, responsive, real, and route-aware.

---

# 54. Stage 4 — Hero V2

### Goal

Create the signature experience.

### Tasks

- rewrite hero layout
- new headline system
- new 3D ecosystem scene
- custom SVG background
- pointer interaction
- scroll-linked transformation
- reduced-motion state
- responsive art direction

### Exit criteria

The hero alone communicates:
- Educraft identity
- five-pillar ecosystem
- sophistication
- clear CTA

---

# 55. Stage 5 — Ecosystem Section

### Goal

Turn the five pillars into the central product metaphor.

### Tasks

- ecosystem SVG/3D map
- animated connectors
- interactive nodes
- hover/focus behavior
- mobile fallback
- programme route links

### Exit criteria

Users understand the relationship between the five programme areas without reading long paragraphs.

---

# 56. Stage 6 — Programme Explorer

### Goal

Replace basic cards with story-driven exploration.

### Tasks

- sticky programme narrative
- programme visual transitions
- progress indicator
- pinned section
- responsive mobile version
- deep-link routing

### Exit criteria

Exploring all five programmes feels like one continuous journey.

---

# 57. Stage 7 — Rich Programme Pages

### Goal

Give each programme enough depth to establish confidence.

### Tasks

- programme templates
- hero graphics
- methodology
- audience
- outcomes
- curriculum
- FAQs
- proof
- enquiry CTA
- related programmes

### Exit criteria

Each programme page can stand alone in search and as a shared link.

---

# 58. Stage 8 — Methodology & Student Journey

### Goal

Add emotional and explanatory depth.

### Tasks

- how-it-works path
- student journey
- animated SVG path
- outcome visualizations
- sticky storytelling sections

### Exit criteria

The website explains not only **what** Educraft offers, but **how** it creates value.

---

# 59. Stage 9 — Proof, Testimonials & Impact

### Goal

Turn marketing claims into evidence and trust.

### Tasks

- real testimonials
- case studies
- impact metrics
- school partnerships
- educator credibility
- methodology proof

### Exit criteria

Every major conversion claim is supported by appropriate evidence.

---

# 60. Stage 10 — Insights Layer

### Goal

Create an ongoing content ecosystem.

### Tasks

- insights index
- article template
- categories
- related articles
- reading time
- SEO metadata
- social preview generation

### Exit criteria

A new article can be added without modifying core UI components.

---

# 61. Stage 11 — Enquiry System

### Goal

Make conversion fully real.

### Tasks

- server API
- schema validation
- spam protection
- rate limiting
- persistence
- notification
- confirmation
- error recovery
- analytics

### Exit criteria

Every valid enquiry reaches the intended destination and can be audited.

---

# 62. Stage 12 — Motion & Interaction Polish

### Goal

Add the final layer of "alive" behavior.

### Tasks

- shared motion primitives
- button interactions
- image/artifact movement
- cursor interaction
- section transitions
- scene transitions
- text reveals
- magnetic CTA where appropriate

### Important rule

Do not animate everything.

Motion should establish:
- hierarchy
- continuity
- cause/effect
- orientation
- delight

---

# 63. Stage 13 — Performance Optimization

### Goal

Protect the experience from its own visual ambition.

### Tasks

- Lighthouse baseline
- Web Vitals
- bundle inspection
- R3F profiling
- frame-rate measurements
- lazy scene activation
- render throttling
- device-aware DPR
- image optimization
- SVG optimization
- code splitting

### Exit criteria

Visual effects degrade gracefully instead of breaking the experience.

---

# 64. Stage 14 — Accessibility & QA

### Goal

Make the experience robust.

### Tasks

- keyboard audit
- screen reader audit
- contrast audit
- focus audit
- reduced motion audit
- mobile audit
- browser matrix
- visual regression
- E2E flows

### Exit criteria

No critical accessibility or navigation blockers remain.

---

# 65. Stage 15 — Launch & Observability

### Goal

Move from polished build to measurable product.

### Tasks

- production deployment
- error monitoring
- analytics verification
- search console
- sitemap validation
- form delivery verification
- performance monitoring
- event validation

### Exit criteria

Traffic, errors, conversion, and performance can be measured.

---

# 66. Recommended File Structure After V2

```text
src/
├── app/
│   ├── api/
│   │   └── enquiry/
│   │       └── route.ts
│   ├── about/
│   ├── programmes/
│   │   └── [slug]/
│   ├── insights/
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── contact/
│   ├── privacy/
│   ├── terms/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   └── educraft/
│       ├── landing/
│       │   ├── Hero/
│       │   ├── Ecosystem/
│       │   ├── ProgrammeExplorer/
│       │   ├── Methodology/
│       │   ├── Journey/
│       │   ├── Impact/
│       │   ├── Testimonials/
│       │   └── FinalCTA/
│       ├── programme/
│       ├── insights/
│       ├── enquiry/
│       ├── layout/
│       ├── graphics/
│       ├── motion/
│       ├── three/
│       └── ui/
│
├── data/
│   ├── programmes.ts
│   ├── pillars.ts
│   ├── navigation.ts
│   ├── testimonials.ts
│   ├── faqs.ts
│   └── insights.ts
│
├── design/
│   ├── tokens.ts
│   ├── motion.ts
│   ├── colors.ts
│   └── typography.ts
│
├── hooks/
│   ├── useReveal.ts
│   ├── useReducedMotion.ts
│   ├── useScrollProgress.ts
│   └── useParallax.ts
│
├── lib/
│   ├── validation.ts
│   ├── analytics.ts
│   ├── rate-limit.ts
│   └── utils.ts
│
└── types/
    └── index.ts
```

---

# 67. Current Codebase → V2 Mapping

| Current component | V2 direction |
|---|---|
| `Hero.tsx` | Hero experience module |
| `HeroScene.tsx` | Ecosystem WebGL system |
| `CoursesOverview.tsx` | Programme Explorer |
| `CourseOrbit3D.tsx` | Reusable visual primitive/scene |
| `PillarsSection.tsx` | Ecosystem interactive section |
| `Navbar.tsx` | Global navigation / mega menu |
| `Footer.tsx` | Brand closing experience |
| `EnquiryForm.tsx` | Real production enquiry flow |
| `EnquiryModal.tsx` | Reusable accessible dialog |
| `useReveal.ts` | Part of broader motion hook system |
| `courses.ts` | New structured programme content model |
| `globals.css` | Design-token foundation |

---

# 68. What to Remove or Consolidate

V2 should actively reduce accidental complexity.

### Remove

- placeholder API route behavior
- `href="#"` business links
- fake enquiry success
- duplicated body scroll management
- duplicated reduced-motion media-query logic
- unnecessary per-node point lights
- generic visual placeholders
- duplicated design constants

### Consolidate

- motion logic
- WebGL infrastructure
- scroll locking
- design tokens
- content definitions
- route definitions
- accessibility patterns

---

# 69. Highest-Impact Changes

If time or budget is limited, prioritize in this order:

## Tier A — Critical

1. Real enquiry flow
2. Better information architecture
3. V2 hero
4. Ecosystem section
5. Programme detail pages
6. Structured content model

## Tier B — Major experience upgrades

7. Scroll-driven programme explorer
8. Student journey
9. Methodology story
10. Custom SVG system
11. Better navigation
12. Proof/testimonial system

## Tier C — Premium polish

13. Cursor system
14. Advanced WebGL transitions
15. Magnetic interactions
16. Sophisticated section transitions
17. Editorial insights experience

## Tier D — Optimization

18. Performance
19. Accessibility
20. Analytics
21. Monitoring
22. Regression testing

---

# 70. "Alive Website" Motion Checklist

The website should feel alive because multiple systems react to one another.

### During page load

- typography enters with hierarchy
- visual system assembles
- background atmosphere settles

### During scroll

- content reveals
- artwork moves at different depths
- lines connect
- scenes transform
- sticky narrative progresses

### During hover

- cards gain depth
- artwork shifts
- arrows move
- buttons respond

### During click

- clear pressed state
- immediate feedback
- route/modal transition

### During navigation

- active section changes
- programme identity persists
- scene transitions connect pages

### On mobile

- simplified motion
- touch-aware interaction
- no cursor effects
- preserved hierarchy

### On reduced motion

- no continuous decorative motion
- static visual compositions
- functional transitions only

---

# 71. Content Quality Rules

The biggest content upgrade should be **depth, specificity, and proof**.

Avoid repeated marketing language such as:
- "empowering"
- "innovative"
- "world-class"
- "transformative"
- "personalized"

unless supported by concrete explanation.

Instead answer:

```text
What exactly happens?
Who does it?
How often?
For whom?
How is progress measured?
What does the student actually experience?
What changes afterward?
```

Every programme should explain those questions.

---

# 72. Art Direction Rules

### Do

- use depth
- use asymmetry
- use oversized typography
- use negative space
- create visual rhythm
- repeat meaningful motifs
- let sections have distinct personalities
- connect scenes across scroll

### Avoid

- endless rounded cards
- every section centered
- identical card grids
- excessive gradients
- excessive glassmorphism
- autoplay content carousels
- 3D purely for novelty
- motion with no narrative purpose
- stock-looking illustrations
- overuse of iconography

---

# 73. Premium Visual Recipe

A strong V2 composition should often combine:

```text
Large typography
+
one strong visual object
+
one supporting SVG layer
+
one interactive behavior
+
generous whitespace
+
one clear CTA
```

Instead of:

```text
heading
+
paragraph
+
three cards
+
icon
+
button
+
another card
```

This is the difference between a normal generated landing page and a deliberate experience-design system.

---

# 74. Performance-Aware Design Rules

Every visual feature needs a reason.

Before adding a visual:

```text
Does it improve:
1. comprehension?
2. emotional impact?
3. navigation?
4. brand recognition?
5. conversion?
```

If it improves none of these, remove it.

For 3D:

```text
Prefer:
1 great scene
over
3 mediocre scenes.
```

---

# 75. V2 Definition of Done

The redesign is complete when:

### Brand

- Educraft has a recognizable visual language
- five pillars form one coherent ecosystem

### UX

- each audience can find a clear path
- programme discovery feels intuitive
- CTA hierarchy is obvious

### Content

- each programme has substantial useful information
- proof and outcomes are present
- insights can be published

### Motion

- animations create continuity
- scrolling feels intentional
- reduced-motion experience remains strong

### Visuals

- custom SVGs are used meaningfully
- 3D is integrated into the story
- imagery and graphics feel bespoke

### Engineering

- content is data-driven
- routes are scalable
- forms are real
- API is validated
- WebGL is optimized
- accessibility passes audit

### Performance

- Web Vitals are healthy
- mobile experience remains responsive
- visual effects degrade gracefully

---

# 76. Recommended Build Order

The safest real-world implementation sequence is:

```text
1. Audit + research
2. Information architecture
3. Design tokens
4. Content model
5. App shell
6. Hero
7. Ecosystem
8. Programme explorer
9. Programme pages
10. Methodology
11. Student journey
12. Proof/impact
13. Insights
14. Enquiry backend
15. Motion polish
16. Performance
17. Accessibility
18. Analytics
19. QA
20. Launch
```

Do not start by polishing tiny buttons or adding random 3D details. The highest leverage is **structure → visual system → signature interactions → content depth → polish**.

---

# 77. Final Strategic Recommendation

The existing Educraft codebase should **evolve, not be discarded**.

The current foundation already has:
- sensible component organization
- React Three Fiber integration
- a useful data model
- reusable UI primitives
- theme tokens
- basic accessibility patterns

The V2 effort should therefore focus on moving the project through three layers:

```text
V1
Functional marketing prototype

        ↓

V2
Art-directed interactive education experience

        ↓

V3
Scalable education brand platform
```

The most important design principle is:

> **Do not add animation, 3D, or SVGs as decoration. Make every visual system explain the idea of learning, progress, connection, and possibility.**

That is what will make Educraft feel less like an AI-generated website and more like a deliberately designed digital brand experience.
