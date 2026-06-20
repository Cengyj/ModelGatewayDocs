import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getContentByRoute } from '@/lib/content';
import { loadMdx, routeToImporter } from '@/lib/mdx-map';
import { HomeLayout } from '@/components/HomeLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Pager } from '@/components/Pager';
import { PublishToc } from '@/components/TocContext';
import styles from '@/components/DocLayout.module.css';

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
  const description = meta.description ?? meta.rawText.slice(0, 160);
  return {
    title: meta.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: meta.title,
      description,
      url,
    },
    twitter: {
      card: 'summary',
      title: meta.title,
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
