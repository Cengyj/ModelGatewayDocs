import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getContentByRoute, loadMdx, routeToImporter } from '@/lib/content';
import { site } from '@/lib/site';
import { resolveNav } from '@/lib/nav';
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
  // The optional catch-all owns unknown paths. Returning explicit metadata
  // here keeps the browser's hydrated state aligned with not-found.tsx;
  // otherwise the root layout's indexable homepage metadata can win.
  if (!meta) {
    return {
      title: '页面不存在',
      robots: { index: false, follow: true },
    };
  }
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
      type: isHome ? 'website' : 'article',
      title: ogTitle,
      description,
      url,
      images: [{ url: site.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [site.ogImage],
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

  const description = meta.description ?? meta.descriptionFallback;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    description,
    url: new URL(route, site.url).toString(),
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
    },
  };

  // BreadcrumbList mirrors the visible breadcrumb trail — no invented levels.
  const nav = resolveNav(route);
  const crumbItems = [
    { name: '首页', item: site.url },
    ...(nav?.groupLabel && nav.groupLabel !== nav.label ? [{ name: nav.groupLabel }] : []),
    ...(nav ? [{ name: nav.label, item: new URL(route, site.url).toString() }] : []),
  ];
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbItems.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.item ? { item: c.item } : {}),
    })),
  };

  // Sidebar / Toc / MobileDocBar live in the persistent layout. This page
  // returns only the article column + a side-effect to publish this page's
  // TOC entries to the shell.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <PublishToc toc={meta.toc} />
      <article className={`prose ${styles.article}`}>
        <Breadcrumbs route={route} />
        <Mod />
        <Pager currentRoute={route} />
      </article>
    </>
  );
}
