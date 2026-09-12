How the five programme detail pages (`/programmes/[slug]`) are composed, and what each one carries.

**Component:** `programme/ProgrammePage.tsx` — a server component whose children are client components. One component serves all five detail pages; adding a programme requires no component change (see `docs/architecture/data-model.md`).

**Section order:**

Hero (accent eyebrow + `ProgrammeGraphic`) → why it matters → audience (3 cards) → 5-step method (numbered rows) → curriculum (modules with item checklists, topographic background) → 6-stage journey cards → outcomes + activities (split) → support + proof → FAQ accordion (accessible, one-open) → indigo conversion close → related programmes (4).

**Structured data:** JSON-LD `Course` + `BreadcrumbList`.

**Metadata:** per-programme metadata and a per-programme OG image.

**Graphics:** `ProgrammeGraphic` (from `components/educraft/graphics/`) draws the hero visual. The curriculum section's topographic background is the shared `DecorativeSystems` topographic layer, not a bespoke drawing — see [`../design/system.md`](../design/system.md).

**No 3D on programme pages.** They ship with no WebGL at all. Programme-page 3D accents were proposed in the V2 plan and are not built; if built they are capped at one restrained `GeometryArtifact` per hero, reusing `three/` primitives — never a full canvas per page. See [`../design/motion.md`](../design/motion.md) for the graphics architecture and its retirement status.
