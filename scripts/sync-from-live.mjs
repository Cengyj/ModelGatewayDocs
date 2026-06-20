/**
 * Routine refresh: fetch live HTML for each route from docs.micuapi.ai,
 * sanitize, extract the article (.vp-doc), convert to MDX, and write proposed
 * output + per-route diff under output/content-refresh-<DATE>/ for review.
 *
 * Nothing under src/content/ is overwritten by this script. To apply approved
 * pages, run:
 *
 *   node scripts/sync-from-live.mjs --apply <route> [<route> ...]
 *
 * Or apply all:
 *
 *   node scripts/sync-from-live.mjs --apply-all
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { htmlToMdx, sanitizeUpstreamHtml, frontmatter } from './lib/html-to-mdx.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const contentDir = path.join(projectRoot, 'src', 'content');

const UPSTREAM = process.env.MICU_UPSTREAM ?? 'https://docs.micuapi.ai';
const OUT_BASE = path.join(projectRoot, 'output', 'content-refresh-2026-06-19');

// Routes are derived from src/lib/mdx-map.ts (the existing single source of truth)
const ROUTES = [
  '/', '/cc-switch',
  '/claude-code', '/claude-code/advanced', '/claude-code/config',
  '/claude-code/desktop', '/claude-code/grok-search-mcp',
  '/codex', '/codex/config',
  '/openclaw', '/openclaw/feishu',
  '/external-compat', '/external-ua',
  '/external/jetbrains', '/external/trae',
  '/tools',
  '/errors',
  '/errors/cc-022-duplicate-cache-billing',
  '/errors/cc-023-skip-auto-permission-prompt-plan-fail',
  '/errors/cc-024-third-party-system-role-400',
  '/errors/cc-400-experimental-betas',
  '/errors/cc-401-ide-mcp-conflict',
  '/errors/cc-401-leftover-env',
  '/errors/cc-413-invalid-model',
  '/errors/cc-429-rate-limit',
  '/errors/cc-connection-error',
  '/errors/cc-invalid-key-format',
  '/errors/cc-oauth-conflict',
  '/errors/cc-onboarding-connection-block',
  '/errors/cc-permission-denied',
  '/errors/cc-request-timed-out',
  '/errors/cc-webfetch-preflight-fail',
  '/errors/claude-mem-data-loss',
  '/errors/claude-mem-worker-zombie',
];

function routeToFilePath(route) {
  if (route === '/') return path.join(contentDir, 'index.mdx');
  return path.join(contentDir, route.slice(1) + '.mdx');
}

function routeToOutDir(route) {
  if (route === '/') return path.join(OUT_BASE, 'index');
  return path.join(OUT_BASE, route.slice(1).replace(/\//g, '__'));
}

async function fetchRoute(route) {
  const url = UPSTREAM + (route === '/' ? '/' : route);
  const res = await fetch(url, { headers: { 'User-Agent': 'micuapi-docs-sync/1.0' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return await res.text();
}

/**
 * Extract:
 *   - title from <title>
 *   - article HTML from the inner of .vp-doc (the content block)
 *
 * If isHome, prefer the inner of <div class="micu-vp-home-doc vp-doc"> which
 * excludes the Hero + FeatureGrid blocks (we preserve those locally).
 */
function extractArticle(html, isHome) {
  const titleMatch = /<title>([^<]+)<\/title>/i.exec(html);
  const title = titleMatch ? titleMatch[1].trim() : '';

  if (isHome) {
    const home = /<div class="micu-vp-home-doc vp-doc"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/.exec(html)
              || /<div class="micu-vp-home-doc vp-doc"[^>]*>([\s\S]*?)<\/main>/.exec(html);
    if (home) return { title, article: home[1] };
    // Fallback: try .vp-doc
  }

  // Generic: pick the first <main>...</main>, then look for the inner <div class="vp-doc ...">
  const main = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  const root = main ? main[1] : html;
  const vpDoc = /<div[^>]*class="[^"]*\bvp-doc\b[^"]*"[^>]*>([\s\S]*?)<\/main>/.exec(root + '</main>')
             || /<div[^>]*class="[^"]*\bvp-doc\b[^"]*"[^>]*>([\s\S]*)/.exec(root);
  const inner = vpDoc ? vpDoc[1] : root;
  // VitePress sometimes wraps inner in <div style="position:relative;"><div>...</div></div>
  const stripWrap1 = inner.replace(/^[\s\S]*?<div style="position:relative[^"]*"[^>]*>\s*<div[^>]*>/, '');
  const stripWrap2 = stripWrap1.replace(/<\/div>\s*<\/div>\s*$/, '');
  return { title, article: stripWrap2 };
}

function unifiedDiff(oldText, newText, oldName, newName) {
  // Minimal unified diff in pure JS — line-by-line LCS.
  const a = oldText.split(/\r?\n/);
  const b = newText.split(/\r?\n/);
  // Compute LCS table (cheap; pages are at most a few hundred lines)
  const m = a.length, n = b.length;
  const lcs = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  // Walk to emit hunks
  const out = [`--- ${oldName}`, `+++ ${newName}`];
  let i = 0, j = 0;
  const seq = [];
  while (i < m && j < n) {
    if (a[i] === b[j]) { seq.push({ kind: ' ', text: a[i] }); i++; j++; }
    else if (lcs[i + 1][j] >= lcs[i][j + 1]) { seq.push({ kind: '-', text: a[i] }); i++; }
    else { seq.push({ kind: '+', text: b[j] }); j++; }
  }
  while (i < m) { seq.push({ kind: '-', text: a[i++] }); }
  while (j < n) { seq.push({ kind: '+', text: b[j++] }); }
  // Compress (skip large equal runs, show with @@ markers)
  const ctx = 3;
  let k = 0;
  while (k < seq.length) {
    if (seq[k].kind === ' ') { k++; continue; }
    // hunk start
    const start = Math.max(0, k - ctx);
    let end = k;
    while (end < seq.length) {
      if (seq[end].kind === ' ') {
        let runEnd = end;
        while (runEnd < seq.length && seq[runEnd].kind === ' ') runEnd++;
        if (runEnd - end > ctx * 2 || runEnd >= seq.length) { end = end + ctx; break; }
        end = runEnd;
      } else end++;
    }
    end = Math.min(end, seq.length);
    out.push(`@@ ~ ${start + 1},${end - start} @@`);
    for (let h = start; h < end; h++) out.push(seq[h].kind + seq[h].text);
    k = end;
  }
  return out.join('\n');
}

function summary(diffText) {
  const lines = diffText.split('\n');
  const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
  const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length;
  return { added, removed };
}

function bucket(diff) {
  const { added, removed } = diff;
  const churn = added + removed;
  if (churn === 0) return 'none';
  if (churn < 20) return 'small';
  if (churn < 100) return 'medium';
  return 'large';
}

async function buildProposed(route) {
  const html = await fetchRoute(route);
  const clean = sanitizeUpstreamHtml(html);
  const isHome = route === '/';
  const { title, article } = extractArticle(clean, isHome);
  const body = htmlToMdx(article, { isHome: false });

  // Re-stitch: home page keeps our hand-authored Hero + FeatureGrid (don't auto-generate)
  if (isHome) {
    const head = `import { Hero } from '@/components/Hero';\nimport { FeatureGrid, Feature } from '@/components/Feature';\n\n`;
    // Read the existing index.mdx and preserve any <Hero ... /> + <FeatureGrid> ... </FeatureGrid> blocks at the top.
    let preserved = '';
    try {
      const existing = await fs.readFile(routeToFilePath(route), 'utf8');
      const heroMatch = existing.match(/<Hero[\s\S]*?\/>/);
      const featuresMatch = existing.match(/<FeatureGrid>[\s\S]*?<\/FeatureGrid>/);
      if (heroMatch) preserved += heroMatch[0] + '\n\n';
      if (featuresMatch) preserved += featuresMatch[0] + '\n\n';
    } catch {
      // no existing file — keep preserved empty
    }
    const fm = frontmatter(stripSiteSuffix(title), undefined);
    return fm + head + preserved + body;
  }

  const fm = frontmatter(stripSiteSuffix(title), undefined);
  return fm + body;
}

function stripSiteSuffix(title) {
  // VitePress titles often look like "Page · micuapi"
  return title.replace(/\s*[·\|]\s*micuapi\s*$/i, '').trim() || title;
}

async function writeProposed(route, mdx) {
  const dir = routeToOutDir(route);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'proposed.mdx'), mdx, 'utf8');
}

async function writeDiff(route, mdx) {
  const filePath = routeToFilePath(route);
  let current = '';
  try { current = await fs.readFile(filePath, 'utf8'); } catch {}
  const diff = unifiedDiff(current, mdx, `current ${route}`, `proposed ${route}`);
  const outFile = path.join(routeToOutDir(route), 'diff.patch');
  await fs.writeFile(outFile, diff, 'utf8');
  return summary(diff);
}

async function preview() {
  await fs.mkdir(OUT_BASE, { recursive: true });
  const rows = [];
  for (const route of ROUTES) {
    try {
      const mdx = await buildProposed(route);
      await writeProposed(route, mdx);
      const diff = await writeDiff(route, mdx);
      const b = bucket(diff);
      rows.push({ route, ...diff, bucket: b });
      console.log(`  ${route.padEnd(45)} +${String(diff.added).padStart(4)}  -${String(diff.removed).padStart(4)}   [${b}]`);
    } catch (e) {
      console.error(`  ${route.padEnd(45)} ERROR: ${e.message}`);
      rows.push({ route, error: e.message });
    }
  }
  await fs.writeFile(path.join(OUT_BASE, 'summary.json'), JSON.stringify(rows, null, 2));
  console.log(`\nDiffs + proposed MDX in: ${OUT_BASE}`);
  console.log(`To apply a route:        node scripts/sync-from-live.mjs --apply /cc-switch`);
  console.log(`To apply all:            node scripts/sync-from-live.mjs --apply-all`);
}

async function apply(routes) {
  for (const route of routes) {
    const proposed = path.join(routeToOutDir(route), 'proposed.mdx');
    let content;
    try {
      content = await fs.readFile(proposed, 'utf8');
    } catch {
      console.error(`  ${route}: no proposed file — run preview first`);
      continue;
    }
    const target = routeToFilePath(route);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, 'utf8');
    console.log(`  applied: ${route}  →  ${path.relative(projectRoot, target)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--apply-all')) {
    return apply(ROUTES);
  }
  const applyIdx = args.indexOf('--apply');
  if (applyIdx >= 0) {
    const routes = args.slice(applyIdx + 1);
    if (!routes.length) {
      console.error('--apply requires at least one route');
      process.exit(1);
    }
    return apply(routes);
  }
  await preview();
}

main().catch((e) => { console.error(e); process.exit(1); });
