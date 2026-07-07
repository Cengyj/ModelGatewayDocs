/**
 * Navigation surface, derived entirely from the generated content manifest.
 * Sidebar tree, top nav, and prev/next order all come from src/content/
 * frontmatter + _meta.ts via scripts/gen-content-manifest.mjs — nothing is
 * hand-maintained here except the pure lookup helpers.
 */

import { sidebar, topNav, orderedRoutes, contentByRoute } from '@/generated/content-manifest';
import type { NavItem, SidebarGroup, TopNavItem } from '@/lib/content-types';

export { sidebar, topNav };
export type { NavItem, SidebarGroup, TopNavItem };

/** Prev/next reading order (replaces the former hand-written pageOrder array). */
export const pageOrder: readonly string[] = orderedRoutes;

/** Flatten one or two levels into a route list for membership tests. */
function flattenItems(items: readonly NavItem[]): NavItem[] {
  return items.flatMap((i) => (i.children ? [i, ...i.children] : [i]));
}

export function findGroup(route: string): SidebarGroup | undefined {
  return sidebar.find((g) => flattenItems(g.items).some((i) => i.route === route) || g.route === route);
}

export function findItem(route: string): NavItem | undefined {
  for (const g of sidebar) {
    for (const item of flattenItems(g.items)) {
      if (item.route === route) return item;
    }
  }
  return undefined;
}

export type ResolvedNav = { route: string; label: string; groupLabel?: string };

/**
 * Resolve a route's nav label + owning group for ANY route, including hidden
 * pages (e.g. error detail pages) that live in contentByRoute but not in the
 * sidebar tree. Falls back from the sidebar item to the page's frontmatter so
 * Pager/Breadcrumbs work on hidden, deep-linked pages too.
 */
export function resolveNav(route: string): ResolvedNav | undefined {
  const meta = contentByRoute[route];
  if (!meta) return undefined;
  const item = findItem(route);
  const groupLabel =
    findGroup(route)?.label ?? sidebar.find((g) => g.items.length === 0 ? g.route === route : groupOwnsSegment(g, meta.group))?.label;
  return {
    route,
    label: item?.label ?? meta.navLabel ?? meta.title,
    groupLabel,
  };
}

/** A sidebar group "owns" a route segment if any of its items live under it. */
function groupOwnsSegment(group: SidebarGroup, segment: string): boolean {
  if (!segment) return false;
  const prefix = `/${segment}`;
  return (
    group.route === prefix ||
    flattenItems(group.items).some((i) => i.route === prefix || i.route.startsWith(`${prefix}/`))
  );
}
