import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { insights, getInsightBySlug } from '@/data/insights';
import { formatDate } from '@/lib/utils';
import Reveal from '@/components/educraft/motion/Reveal';
import { Constellation } from '@/components/educraft/graphics/DecorativeSystems';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) return {};
  return {
    title: `${insight.title} — Educraft Insights`,
    description: insight.excerpt,
    alternates: { canonical: `/insights/${insight.slug}` },
  };
}

export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) notFound();

  const related = insights
    .filter((i) => i.slug !== insight.slug)
    .sort((a, b) => (a.category === insight.category ? -1 : 1) - (b.category === insight.category ? -1 : 1))
    .slice(0, 2);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://educraft.com';
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: insight.title,
    description: insight.excerpt,
    datePublished: insight.date,
    author: { '@type': 'Organization', name: 'Educraft' },
    url: `${siteUrl}/insights/${insight.slug}`,
  };

  return (
    <div>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Article header */}
      <header className='relative pt-32 pb-14 md:pt-40 md:pb-16 bg-ec-canvas-deep/60 dark:bg-ec-canvas-deep overflow-hidden'>
        <Constellation className='opacity-50' colorClassName='text-ec-teal' />
        <div className='container-site relative max-w-3xl'>
          <div className='flex items-center gap-3 flex-wrap'>
            <span className='text-xs font-semibold uppercase tracking-[0.08em] text-ec-teal-dark dark:text-ec-teal'>
              {insight.category}
            </span>
            <span className='flex items-center gap-1 type-caption text-ec-slate'>
              <Clock className='w-3.5 h-3.5' aria-hidden='true' />
              {insight.readingTime}
            </span>
            <span className='type-caption text-ec-slate'>{formatDate(insight.date)}</span>
          </div>
          <h1 className='type-display-m text-ec-indigo dark:text-white mt-5 text-balance'>
            {insight.title}
          </h1>
          <p className='type-body-l text-ec-slate mt-4 text-pretty'>{insight.excerpt}</p>
        </div>
      </header>

      {/* Body */}
      <article className='py-14 md:py-20 bg-background'>
        <div className='container-site max-w-3xl space-y-10'>
          {insight.sections.map((section, i) => (
            <Reveal key={i}>
              {section.heading && (
                <h2 className='type-heading-m text-ec-indigo dark:text-white mb-4'>
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className='type-body-m text-ec-slate leading-relaxed mt-4 first:mt-0 text-pretty'>
                  {p}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </article>

      {/* Related */}
      <section className='py-14 md:py-20 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-t border-ec-border/60'>
        <div className='container-site'>
          <Reveal>
            <h2 className='type-heading-m text-ec-indigo dark:text-white mb-8'>Keep reading</h2>
          </Reveal>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 100}>
                <Link
                  href={`/insights/${r.slug}`}
                  className='card-surface group block p-7 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] transition-all duration-150'
                >
                  <span className='text-xs font-semibold uppercase tracking-[0.08em] text-ec-teal-dark dark:text-ec-teal'>
                    {r.category}
                  </span>
                  <h3 className='type-heading-s text-ec-indigo dark:text-white mt-2 group-hover:text-ec-teal-dark dark:group-hover:text-ec-teal transition-colors'>
                    {r.title}
                  </h3>
                  <span className='mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white group-hover:opacity-80 transition-opacity'>
                    Read
                    <ArrowRight className='w-4 h-4' aria-hidden='true' />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
