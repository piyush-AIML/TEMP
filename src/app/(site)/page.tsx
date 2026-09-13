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
// `anchors.ts` carries the Stage 1 state of affairs: `assertContinuity` "is
// called from the test suite and from nothing else — no runtime module calls
// it". This page is that call site, and the three checks below are the whole
// seam story: a vertical run between the acts whose strand leaves and enters at
// an edge, and the two arity changes either side of the walk — one strand
// becoming N, and N converging back into one. They run at module evaluation, so
// a broken seam stops the build: measured, a 0.01 break in `doors.enter.x` fails
// it with `Strand seam broken at proof.exit → doors.enter`.
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
