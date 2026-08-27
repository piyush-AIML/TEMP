import type { MetadataRoute } from 'next';
import { programmes } from '@/data/programmes';
import { insights } from '@/data/insights';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://educraft.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/about',
    '/programmes',
    '/methodology',
    '/impact',
    '/for-schools',
    '/for-parents',
    '/for-students',
    '/insights',
    '/careers',
    '/partnerships',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date('2026-08-27'),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.7,
  }));

  const programmeRoutes = programmes.map((p) => ({
    url: `${SITE_URL}/programmes/${p.slug}`,
    lastModified: new Date('2026-08-27'),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const insightRoutes = insights.map((i) => ({
    url: `${SITE_URL}/insights/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...programmeRoutes, ...insightRoutes];
}
