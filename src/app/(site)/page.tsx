import { pillars, studentJourneyStages } from '@/data/pillars';
import { programmes } from '@/data/programmes';
import { ACT_ANCHORS, VERTICAL_CHAIN } from '@/components/educraft/line/anchors';
import { assertForkSeam, assertRibbonSeam, ribbonFrame } from '@/components/educraft/line/frames';
import { assertContinuity } from '@/components/educraft/line/pathBuilders';
import Origin from '@/components/educraft/acts/Origin';
import FivePillars, { type Station } from '@/components/educraft/acts/FivePillars';
import Way from '@/components/educraft/acts/Way';
import Proof from '@/components/educraft/acts/Proof';
import Doors from '@/components/educraft/acts/Doors';

// The seam contract, checked where the acts are actually composed.
//
// Stage 1 shipped `assertContinuity` with the note that "no runtime module calls
// it, so it does not run at module load; Stage 2 is where the real call site is
// wired." This is that call site, and the three checks are the whole seam story:
// a vertical run between the acts whose strand leaves and enters at an edge, and
// the two arity changes either side of the walk — one strand becoming N, and N
// converging back into one. They throw on a broken seam, at build time.
assertContinuity(VERTICAL_CHAIN);
assertForkSeam(pillars.length);
assertRibbonSeam(ribbonFrame(studentJourneyStages.length, pillars.length));

/** One station per pillar, in pillar order — the walk's data, shaped for the act. */
const stations: Station[] = pillars.map((pillar) => {
  const programme = programmes.find((candidate) => candidate.pillarId === pillar.id);
  if (!programme) {
    throw new Error(
      `No programme for pillar ${pillar.id} — the station would render without a link target.`
    );
  }
  return {
    pillarId: pillar.id,
    pillarName: pillar.name,
    programmeName: programme.name,
    tagline: programme.tagline,
    highlights: programme.highlights.slice(0, 2),
    href: `/programmes/${programme.slug}`,
  };
});

export default function Home() {
  return (
    <>
      <Origin
        eyebrow='Global Digital Education Platform'
        h1Lines={['Five paths.', 'One learning ecosystem.']}
        lede='From language and inclusion to wellbeing, AI literacy, and competitive exam preparation — Educraft connects the pieces that help students move forward.'
        trustLine='Five verticals · One trust umbrella · Built for schools, families, and students'
        primaryLabel='Talk to us'
        secondaryLabel='Explore programmes'
        secondaryHref='/programmes'
        pillarCount={pillars.length}
      />
      <FivePillars stations={stations} pillarCount={pillars.length} stages={studentJourneyStages} />
      <Way />
      <Proof />
      <Doors />
    </>
  );
}
