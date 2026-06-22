/**
 * Single hand-written contract shared by the content codegen
 * (scripts/gen-content-manifest.mjs) and the app. The generated module
 * src/generated/content-manifest.ts imports these types, so any drift between
 * what codegen emits and what the app expects fails `tsc`.
 *
 * Source of truth for a page = its MDX frontmatter + the directory's _meta.ts.
 * Nothing about routing/nav/order is hand-maintained in arrays anymore.
 */

import type { ComponentType } from 'react';

/** Frontmatter contract every MDX file under src/content/ must satisfy. */
export type Frontmatter = {
  /** Required. Page <title>, sidebar fallback, search title. */
  title: string;
  /** Meta description + search snippet seed. */
  description?: string;
  /** Sidebar / pager label when it should differ from `title`. Defaults to title. */
  navLabel?: string;
  /** Sort key within the parent directory (sidebar + prev/next). Lower first. */
  order?: number;
  /** Omit from sidebar + search. Route stays reachable (e.g. deep-linked detail). */
  hidden?: boolean;
};

/** Top-nav entry derived from a group that opts in via _meta groups[dir].topNav. */
export type TopNavMeta = {
  label: string;
  hidden?: boolean;
};

/** Per-group config declared in a directory's _meta.ts. */
export type GroupMeta = {
  /** Sidebar group / sub-menu label. */
  label: string;
  /** If present, this group also appears in the top navigation. */
  topNav?: TopNavMeta;
};

/**
 * A directory's _meta.ts default export. `order` lists child dir/file
 * basenames (without extension) in display order; `groups` labels each child
 * directory that should render as a sidebar group or sub-menu.
 */
export type DirMeta = {
  order?: string[];
  groups?: Record<string, GroupMeta>;
};

export type TocEntry = { level: number; id: string; text: string };

/** Per-route metadata emitted into the manifest. */
export type ContentMeta = {
  route: string;
  title: string;
  description?: string;
  navLabel: string;
  hidden: boolean;
  /** Top-level group key (first path segment, or '' for the home/root pages). */
  group: string;
  toc: TocEntry[];
  /** Codegen-computed plaintext fallback (~160 chars) for meta description. */
  descriptionFallback: string;
};

export type NavItem = {
  label: string;
  route: string;
  /** Second-level children (e.g. Claude Code CLI / Desktop sub-menus). */
  children?: NavItem[];
  /** Prefix for "current section" matching in the top nav. */
  matchPrefix?: string;
};

export type SidebarGroup = {
  label: string;
  route?: string;
  items: NavItem[];
};

export type TopNavItem = {
  label: string;
  route: string;
  matchPrefix?: string;
};

export type MdxModule = { default: ComponentType };
