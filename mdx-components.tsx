import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Image } from '@/components/ui/Image';
import { Hero } from '@/components/ui/Hero';
import { FeatureGrid, Feature } from '@/components/ui/Feature';
import { Callout } from '@/components/ui/Callout';
import { Tabs, Tab } from '@/components/ui/Tabs';
import { Steps, Step } from '@/components/ui/Steps';
import { TokenGroupFilter } from '@/components/ui/TokenGroupFilter';
import { VersionBadge } from '@/components/ui/VersionBadge';
import { CommandTable } from '@/components/ui/CommandTable';
import { ErrorMeta } from '@/components/docs/ErrorMeta';
import { PageHeader } from '@/components/docs/PageHeader';
import { RelatedPages } from '@/components/docs/RelatedPages';
import { Walkthrough, Frame } from '@/components/docs/Walkthrough';
import { HomeProse } from '@/components/layout/HomeLayout';

function MdxLink({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href ?? '#'} {...rest}>
      {children}
    </Link>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: CodeBlock,
    img: Image as MDXComponents['img'],
    a: MdxLink as MDXComponents['a'],
    Hero,
    FeatureGrid,
    Feature,
    Callout,
    Tabs,
    Tab,
    Steps,
    Step,
    ErrorMeta,
    TokenGroupFilter,
    PageHeader,
    RelatedPages,
    Walkthrough,
    Frame,
    VersionBadge,
    CommandTable,
    HomeProse,
  };
}
