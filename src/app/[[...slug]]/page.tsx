import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getContentByRoute, loadMdx, routeToImporter } from '@/lib/content';
import { site } from '@/lib/site';
import { HomeLayout } from '@/components/layout/HomeLayout';
import { Breadcrumbs } from '@/components/docs/Breadcrumbs';
import { Pager } from '@/components/docs/Pager';
import { PublishToc } from '@/components/layout/TocContext';
import styles from '@/components/docs/DocLayout.module.css';

type Params = { slug?: string[] };

export function generateStaticParams(): Params[] {
  return Object.keys(routeToImporter).map((route) => ({
    slug: route === '/' ? [] : route.slice(1).split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params;
  const route = paramsToRoute(p);
  const meta = getContentByRoute(route);
  if (!meta) return {};
  const url = route === '/' ? '/' : route;
  const description = meta.description ?? meta.descriptionFallback;
  // Home: use an absolute title so the layout's "%s · {name}" template doesn't
  // produce "foropencode · foropencode". Inner pages keep the template.
  const isHome = route === '/';
  const title = isHome
    ? { absolute: `${site.name} · ${site.tagline}` }
    : meta.title;
  const ogTitle = isHome ? `${site.name} · ${site.tagline}` : meta.title;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: ogTitle,
      description,
      url,
    },
    twitter: {
      card: 'summary',
      title: ogTitle,
      description,
    },
  };
}

function paramsToRoute(params: Params): string {
  if (!params.slug?.length) return '/';
  return '/' + params.slug.join('/');
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const route = paramsToRoute(p);
  const meta = getContentByRoute(route);
  const Mod = await loadMdx(route);
  if (!meta || !Mod) notFound();

  if (route === '/') {
    // Hero + FeatureGrid render full-bleed; the markdown body wraps itself in
    // <HomeProse> inside the MDX so it gets the centered prose container.
    return (
      <HomeLayout>
        <Mod />
      </HomeLayout>
    );
  }

  // Sidebar / Toc / MobileDocBar live in the persistent layout. This page
  // returns only the article column + a side-effect to publish this page's
  // TOC entries to the shell.
  return (
    <>
      <PublishToc toc={meta.toc} />
      <article className={`prose ${styles.article}`}>
        <Breadcrumbs route={route} />
        <Mod />
        <Pager currentRoute={route} />
      </article>
    </>
  );
}
