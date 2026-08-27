import Hero from '@/components/educraft/landing/Hero';
import EcosystemSection from '@/components/educraft/landing/Ecosystem';
import ProgrammeExplorer from '@/components/educraft/landing/ProgrammeExplorer';
import WhyDifferent from '@/components/educraft/landing/WhyDifferent';
import StudentJourney from '@/components/educraft/landing/StudentJourney';
import ProgrammeDeepDive from '@/components/educraft/landing/ProgrammeDeepDive';
import ImpactSection from '@/components/educraft/landing/Impact';
import AudienceEntryPoints from '@/components/educraft/landing/AudienceEntryPoints';
import MethodologySection from '@/components/educraft/landing/Methodology';
import TestimonialsSection from '@/components/educraft/landing/Testimonials';
import InsightsTeaser from '@/components/educraft/landing/InsightsTeaser';
import FinalCTA from '@/components/educraft/landing/FinalCTA';

/**
 * Homepage V2 (plan §3) — the narrative arc:
 *   Understand → Explore → Trust → Imagine → Choose → Act
 */
export default function Home() {
  return (
    <>
      {/* 01 — Hero / brand statement */}
      <Hero />
      {/* 02 — One ecosystem, many paths */}
      <EcosystemSection />
      {/* 03 — Five programme journey */}
      <ProgrammeExplorer />
      {/* 04 — What makes Educraft different */}
      <WhyDifferent />
      {/* 05 — Interactive student journey */}
      <StudentJourney />
      {/* 06 — Programme deep-dive */}
      <ProgrammeDeepDive />
      {/* 07 — Outcomes / evidence / impact */}
      <ImpactSection />
      {/* 08 — For schools / parents / students */}
      <AudienceEntryPoints />
      {/* 09 — Methodology */}
      <MethodologySection />
      {/* 10 — Stories / testimonials */}
      <TestimonialsSection />
      {/* 11 — Insights */}
      <InsightsTeaser />
      {/* 12 — Final conversion */}
      <FinalCTA />
    </>
  );
}
