import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { programmes, getProgrammeBySlug } from '@/data/programmes';
import { pillars } from '@/data/pillars';
import ProgrammePage from '@/components/educraft/programme/ProgrammePage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return programmes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const programme = getProgrammeBySlug(slug);
  if (!programme) return {};
  const pillar = pillars.find((pl) => pl.id === programme.pillarId);
  return {
    title: `${programme.name} — Educraft`,
    description: programme.tagline,
    openGraph: {
      title: `${programme.name} — Educraft`,
      description: programme.tagline,
      type: 'website',
    },
    alternates: {
      canonical: `/programmes/${programme.slug}`,
    },
  };
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const programme = getProgrammeBySlug(slug);
  if (!programme) notFound();

  const pillar = pillars.find((pl) => pl.id === programme.pillarId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://educraft.com';

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: programme.name,
    description: programme.tagline,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Educraft',
      url: siteUrl,
    },
    url: `${siteUrl}/programmes/${programme.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Programmes', item: `${siteUrl}/programmes` },
      {
        '@type': 'ListItem',
        position: 3,
        name: programme.name,
        item: `${siteUrl}/programmes/${programme.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProgrammePage programme={programme} />
    </>
  );
}
