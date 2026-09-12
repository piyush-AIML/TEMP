# Platform overview — identity & vision

What Educraft is, who it serves, and the metaphor system every visual in the product is built from.

**North star:** *"Five paths. One learning ecosystem."* Educraft is a digital education platform unifying five verticals — linguistics, inclusive education, psychological counseling, AI & digital technologies, and NEET/JEE preparation — under one trust umbrella. The five pillars (**Learn · Include · Thrive · Achieve · Excel**) are not five unrelated offerings; they are the structural and visual metaphor for the entire site.

**Visual metaphor system** — used consistently across SVG illustrations, 3D scenes, backgrounds, and UI patterns:

| Element | Represents |
|---|---|
| **Path** | Progress, learning journeys, movement |
| **Node** | Programmes, milestones, ideas |
| **Layer** | Depth, knowledge, support |
| **Connection** | Ecosystem, relationships, interdisciplinary learning |
| **Growth** | Outcomes, confidence, capability |

**Experience qualities:** editorial rather than template-driven; warm, human, trustworthy, intelligent; premium without being decorative for its own sake; motion-rich without being distracting; content hierarchy drives design, not the reverse.

**Audiences, needs, and CTAs:**

| Audience | Needs | CTA |
|---|---|---|
| School leaders | Institutional credibility, programme breadth, partnership model, delivery quality, measurable outcomes | "Talk to the Education Team" |
| Parents | Safety/trust, individual student support, programme clarity, outcomes, how the journey works | "Find the right programme" |
| Students | Energy, future-oriented learning, tangible outcomes, confidence and belonging | "Explore your path" |
| Partners / organisations | Capability, scope, reach, partnership models, contact channel | "Partner with Educraft" |

**Where this lands in code —**

- Pillars and their accents: `src/data/pillars.ts`, `src/lib/pillarStyles.ts`, `src/design/colors.ts` — see [../design/palette.md](../design/palette.md) and [../architecture/data-model.md](../architecture/data-model.md).
- The five verticals as programmes: `src/data/programmes.ts`; the audience doors are `/for-schools`, `/for-parents`, `/for-students` — see [../surfaces/programme-pages.md](../surfaces/programme-pages.md).
- **Path** is the primary metaphor and is being promoted from motif to the landing page's connective structure in the active redesign — see [../projects/landing-redesign/spec.md](../projects/landing-redesign/spec.md).
