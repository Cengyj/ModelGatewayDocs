import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { Image } from '@/components/Image';
import { Hero } from '@/components/Hero';
import { FeatureGrid, Feature } from '@/components/Feature';
import { Callout } from '@/components/Callout';
import { Tabs, Tab } from '@/components/Tabs';
import { Steps, Step } from '@/components/Steps';
import { ErrorMeta } from '@/components/ErrorMeta';
import { TokenGroupFilter } from '@/components/TokenGroupFilter';
import { PageHeader } from '@/components/PageHeader';
import { RelatedPages } from '@/components/RelatedPages';
import { Walkthrough, Frame } from '@/components/Walkthrough';
import { VersionBadge } from '@/components/VersionBadge';
import { CommandTable } from '@/components/CommandTable';

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
  };
}
