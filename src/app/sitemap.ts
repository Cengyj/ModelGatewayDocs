import type { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return getAllContent().map((c) => ({
    url: `${site.url}${c.route === '/' ? '' : c.route}`,
    changeFrequency: c.route === '/' ? 'weekly' : 'monthly',
    priority: c.route === '/' ? 1.0 : 0.7,
  }));
}
