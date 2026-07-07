/**
 * Content manifest codegen — the single source of truth pipeline.
 *
 * Walks src/content/**, reads each MDX file's frontmatter + each directory's
 * _meta.ts, and emits src/generated/content-manifest.ts with everything the app
 * needs derived in one place:
 *   - routeToImporter : static, enumerable route -> import() map
 *   - contentByRoute  : per-route metadata incl. render-accurate TOC
 *   - orderedRoutes   : prev/next reading order
 *   - sidebar         : grouped/nested nav tree
 *   - topNav          : top navigation entries
 *
 * Adding a page = drop one MDX file under src/content/ with frontmatter. No
 * hand-edited arrays. Run automatically via predev / prebuild / typecheck.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  CONTENT_ROOT,
  walkMdx,
  slugToRoute,
  extractToc,
  extractText,
  readMdx,
  loadDirMeta,
} from './lib/content-fs.mjs';

const OUT = path.join(process.cwd(), 'src', 'generated', 'content-manifest.ts');

/** @typedef {{route:string,slug:string,segments:string[],data:any,toc:any[],descriptionFallback:string}} Page */

function fail(msg) {
  console.error(`\n[gen-content-manifest] ERROR: ${msg}\n`);
  process.exit(1);
}

/**
 * Truncate plaintext for a meta description: cut at `max` chars but back off to
 * the last whitespace so a word isn't split, and append an ellipsis when the
 * text was actually shortened. Uses Array.from to avoid splitting a surrogate
 * pair (astral chars / emoji).
 */
function truncateForMeta(text, max) {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  let slice = chars.slice(0, max).join('');
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.6) slice = slice.slice(0, lastSpace);
  return slice.trimEnd() + '…';
}

// ---------------------------------------------------------------------------
// 1. Read every page.
// ---------------------------------------------------------------------------
/** @type {Map<string, Page>} keyed by route */
const pagesByRoute = new Map();
/** @type {Page[]} */
const pages = [];

for (const slug of walkMdx()) {
  const { data, content } = readMdx(slug);
  if (!data || typeof data.title !== 'string' || !data.title.trim()) {
    fail(`Missing required frontmatter "title" in src/content/${slug}`);
  }
  const route = slugToRoute(slug);
  const noExt = slug.replace(/\.mdx?$/, '');
  const segments = noExt === 'index' ? [] : noExt.split('/');
  const text = extractText(content);
  const page = {
    route,
    slug,
    segments,
    data,
    content,
    toc: extractToc(content),
    descriptionFallback: truncateForMeta(text, 160),
  };
  pages.push(page);
  pagesByRoute.set(route, page);
}

// ---------------------------------------------------------------------------
// 2. Build a directory tree from segments. Each node is a dir or a leaf page.
// ---------------------------------------------------------------------------
/**
 * @typedef {Object} TreeNode
 * @property {string} name        basename segment
 * @property {string} relDir      dir path relative to CONTENT_ROOT ('' for root)
 * @property {Map<string,TreeNode>} children
 * @property {Page=} page         page whose route ends exactly at this node
 * @property {any} meta           _meta.ts for the dir AT this node
 */

/** @type {TreeNode} */
const root = { name: '', relDir: '', children: new Map(), page: undefined, meta: loadDirMeta(CONTENT_ROOT) };

function ensureDirNode(segments) {
  let node = root;
  let rel = '';
  for (const seg of segments) {
    rel = rel ? `${rel}/${seg}` : seg;
    if (!node.children.has(seg)) {
      const abs = path.join(CONTENT_ROOT, rel);
      node.children.set(seg, {
        name: seg,
        relDir: rel,
        children: new Map(),
        page: undefined,
        meta: fs.existsSync(abs) && fs.statSync(abs).isDirectory() ? loadDirMeta(abs) : {},
      });
    }
    node = node.children.get(seg);
  }
  return node;
}

for (const page of pages) {
  if (page.segments.length === 0) {
    root.page = page; // index.mdx
    continue;
  }
  const node = ensureDirNode(page.segments);
  node.page = page;
}

// ---------------------------------------------------------------------------
// 3. Ordering: _meta.order > frontmatter.order > alpha. Landing/index first.
// ---------------------------------------------------------------------------
function orderChildren(node) {
  const metaOrder = Array.isArray(node.meta?.order) ? node.meta.order : [];
  const entries = [...node.children.values()];
  return entries.sort((a, b) => {
    const ia = metaOrder.indexOf(a.name);
    const ib = metaOrder.indexOf(b.name);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    const oa = a.page?.data?.order;
    const ob = b.page?.data?.order;
    if (typeof oa === 'number' || typeof ob === 'number') {
      return (oa ?? Infinity) - (ob ?? Infinity);
    }
    return a.name.localeCompare(b.name);
  });
}

// ---------------------------------------------------------------------------
// 4. Derive sidebar groups (top-level dirs) with up to 2 levels of nesting.
// ---------------------------------------------------------------------------
function navLabelOf(page, fallback) {
  return (page?.data?.navLabel ?? page?.data?.title ?? fallback) || fallback;
}

/** Build NavItems for the children of a group/dir node (one nesting level). */
function buildItems(groupNode) {
  /** @type {any[]} */
  const items = [];
  for (const child of orderChildren(groupNode)) {
    const childMeta = groupNode.meta?.groups?.[child.name];
    const subItems = buildLeafItems(child);
    if (subItems.length > 0) {
      // Sub-menu (e.g. claude-code/cli). A landing page at the dir itself, if
      // visible, takes the heading route; otherwise the first visible leaf.
      const headingRoute = child.page && !child.page.data?.hidden ? child.page.route : subItems[0].route;
      items.push({
        label: childMeta?.label ?? navLabelOf(child.page, child.name),
        route: headingRoute,
        children: subItems,
      });
    } else if (child.page && !child.page.data?.hidden) {
      // A flat page or a landing page whose detail children are all hidden
      // (e.g. errors.mdx + errors/ of hidden detail pages). Show just the
      // landing leaf; the hidden details still feed prev/next.
      items.push({ label: navLabelOf(child.page, child.name), route: child.page.route });
    }
  }
  return items;
}

/** Leaf items inside a sub-menu dir (single level, skips hidden). */
function buildLeafItems(dirNode) {
  /** @type {any[]} */
  const out = [];
  for (const child of orderChildren(dirNode)) {
    if (child.page && !child.page.data?.hidden) {
      out.push({ label: navLabelOf(child.page, child.name), route: child.page.route });
    }
  }
  return out;
}

const rootMeta = root.meta ?? {};
// Root index.mdx is held on root.page, never a child node, so children are all groups.
const topGroups = orderChildren(root);

/** @type {any[]} sidebar */
const sidebar = [];
/** @type {any[]} topNav */
const topNav = [{ label: '首页', route: '/' }];

for (const groupNode of topGroups) {
  if (groupNode.name === 'index') continue;
  const gMeta = rootMeta.groups?.[groupNode.name];
  const label = gMeta?.label ?? groupNode.name;

  // A top-level item that is a single page (e.g. cc-switch.mdx, tools.mdx).
  if (groupNode.page && groupNode.children.size === 0) {
    sidebar.push({ label, route: groupNode.page.route, items: [] });
  } else {
    const items = buildItems(groupNode);
    const group = { label, items };
    // If a same-named landing page exists at the group root, link the heading.
    if (groupNode.page && !groupNode.page.data?.hidden) {
      group.route = groupNode.page.route;
    }
    sidebar.push(group);
  }

  // Top nav entry: derive matchPrefix + landing route.
  if (gMeta?.topNav && !gMeta.topNav.hidden) {
    const firstRoute = firstLeafRoute(groupNode);
    topNav.push({
      label: gMeta.topNav.label,
      route: firstRoute,
      matchPrefix: `/${groupNode.name}`,
    });
  }
}

function firstLeafRoute(node) {
  if (node.page && !node.page.data?.hidden) return node.page.route;
  for (const child of orderChildren(node)) {
    const r = firstLeafRoute(child);
    if (r) return r;
  }
  return node.page?.route ?? '/';
}

// ---------------------------------------------------------------------------
// 5. orderedRoutes: depth-first over the displayed tree, INCLUDING hidden
//    pages (they stay in the prev/next reading flow), in resolved order.
// ---------------------------------------------------------------------------
/** @type {string[]} */
const orderedRoutes = [];
function collectOrder(node) {
  for (const child of orderChildren(node)) {
    if (child.page) orderedRoutes.push(child.page.route);
    collectOrder(child);
  }
}
for (const groupNode of topGroups) {
  if (groupNode.name === 'index') continue;
  if (groupNode.page) orderedRoutes.push(groupNode.page.route);
  collectOrder(groupNode);
}

// ---------------------------------------------------------------------------
// 6. contentByRoute + routeToImporter.
// ---------------------------------------------------------------------------
/** @type {Record<string, any>} */
const contentByRoute = {};
for (const page of pages) {
  const seg0 = page.segments[0] ?? '';
  contentByRoute[page.route] = {
    route: page.route,
    title: page.data.title,
    description: page.data.description,
    navLabel: page.data.navLabel ?? page.data.title,
    hidden: Boolean(page.data.hidden),
    group: seg0,
    toc: page.toc,
    descriptionFallback: page.descriptionFallback,
  };
}

const importerRoutes = pages
  .map((p) => ({ route: p.route, slug: p.slug.replace(/\.mdx?$/, '') }))
  .sort((a, b) => a.route.localeCompare(b.route));

// ---------------------------------------------------------------------------
// 6b. Validate internal links — a markdown/RelatedPages link to a route that
// doesn't exist is always a bug (e.g. a page was renamed or deleted). Fail the
// build so dangling links can't ship. Redirect sources count as valid targets.
// ---------------------------------------------------------------------------
const validRoutes = new Set(Object.keys(contentByRoute));
validRoutes.add('/');
try {
  const cfg = fs.readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8');
  for (const m of cfg.matchAll(/source:\s*'([^']+)'/g)) validRoutes.add(m[1]);
} catch {
  /* next.config absent — skip redirect allowance */
}

/** @type {string[]} */
const brokenLinks = [];
for (const page of pages) {
  /** @type {string[]} */
  const refs = [];
  for (const m of page.content.matchAll(/\]\((\/[^)\s#]+)(?:#[^)]*)?\)/g)) refs.push(m[1]);
  for (const m of page.content.matchAll(/route:\s*['"](\/[^'"]+)['"]/g)) refs.push(m[1]);
  for (const ref of refs) {
    if (ref.startsWith('/img/') || ref.startsWith('/logo') || ref.startsWith('/favicon')) continue;
    if (!validRoutes.has(ref)) brokenLinks.push(`  ${page.slug} -> ${ref}`);
  }
}
if (brokenLinks.length) {
  fail(`Broken internal link(s) — target route does not exist:\n${brokenLinks.join('\n')}`);
}

// ---------------------------------------------------------------------------
// 7. Emit the typed module.
// ---------------------------------------------------------------------------
const j = (v) => JSON.stringify(v, null, 2);

const importerLines = importerRoutes
  .map((r) => `  ${JSON.stringify(r.route)}: () => import(${JSON.stringify('@/content/' + r.slug + '.mdx')}),`)
  .join('\n');

const banner = `// AUTO-GENERATED by scripts/gen-content-manifest.mjs — DO NOT EDIT.
// Source of truth: MDX frontmatter under src/content/ + per-directory _meta.ts.
`;

const out = `${banner}
import type {
  ContentMeta,
  SidebarGroup,
  TopNavItem,
  MdxModule,
} from '@/lib/content-types';

export const routeToImporter: Record<string, () => Promise<MdxModule>> = {
${importerLines}
};

export const contentByRoute: Record<string, ContentMeta> = ${j(contentByRoute)} as const;

export const orderedRoutes: readonly string[] = ${j(orderedRoutes)} as const;

export const sidebar: readonly SidebarGroup[] = ${j(sidebar)} as const;

export const topNav: readonly TopNavItem[] = ${j(topNav)} as const;
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out, 'utf8');
console.log(
  `[gen-content-manifest] ${pages.length} pages, ${sidebar.length} sidebar groups, ${orderedRoutes.length} ordered routes -> ${path.relative(process.cwd(), OUT)}`,
);
