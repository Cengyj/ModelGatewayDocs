/**
 * One-shot converter: reads the legacy src/data/micuPages.ts (preserved at
 * legacy-docusaurus/src/data/micuPages.ts after the 2026-06-19 cut-over),
 * strips VitePress markup, emits clean MDX files into src/content/.
 *
 * Don't run this routinely — it overwrites local edits. Use it only when
 * re-importing from the legacy snapshot. For routine sync against the live
 * site, use scripts/sync-from-live.mjs instead.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToMdx, frontmatter } from './lib/html-to-mdx.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const legacyPagesPath = path.join(projectRoot, 'legacy-docusaurus', 'src', 'data', 'micuPages.ts');
const contentDir = path.join(projectRoot, 'src', 'content');

async function loadLegacyPages() {
  const src = await fs.readFile(legacyPagesPath, 'utf8');
  const marker = 'export const micuPages';
  const startMarker = src.indexOf(marker);
  if (startMarker < 0) throw new Error('cannot find micuPages declaration');
  const eq = src.indexOf('= {', startMarker);
  if (eq < 0) throw new Error('cannot find micuPages literal');
  const literal = src.slice(eq + 2);
  let cleaned = literal.trim();
  cleaned = cleaned.replace(/\s+satisfies\s+[\s\S]*?;?\s*$/, '');
  cleaned = cleaned.replace(/\s+as\s+const\s*;?\s*$/, '');
  cleaned = cleaned.replace(/;\s*$/, '');
  // eslint-disable-next-line no-new-func
  return new Function(`return (${cleaned});`)();
}

function pageRouteToFilePath(route) {
  if (route === '/') return path.join(contentDir, 'index.mdx');
  return path.join(contentDir, route.slice(1) + '.mdx');
}

async function main() {
  const pages = await loadLegacyPages();
  await fs.mkdir(contentDir, { recursive: true });

  let count = 0;
  for (const [pageId, page] of Object.entries(pages)) {
    const isHome = pageId === 'index';
    const mdx = htmlToMdx(page.html, { isHome });
    const filePath = pageRouteToFilePath(page.route);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const head = isHome
      ? `import { Hero } from '@/components/Hero';\nimport { FeatureGrid, Feature } from '@/components/Feature';\n\n`
      : '';
    const out = frontmatter(page.title, page.description) + head + mdx;
    await fs.writeFile(filePath, out, 'utf8');
    count++;
  }
  console.log(`Wrote ${count} MDX files to ${contentDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
