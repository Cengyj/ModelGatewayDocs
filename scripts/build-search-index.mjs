/**
 * Build-time search index generator. Walks src/content/*.mdx and writes
 * public/search-index.json for the client-side SearchModal. Slugging + TOC +
 * plaintext extraction are shared with the content manifest codegen (one
 * github-slugger, one extractor) so heading anchors here match render exactly.
 *
 * Index shape: [{ route, title, headings: [{id, text, level}], text }]
 * Hidden pages (e.g. error detail pages) ARE indexed — users search by error
 * message; `hidden` only removes them from the sidebar, not from search.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  walkMdx,
  slugToRoute,
  extractHeadings,
  extractText,
  readMdx,
} from './lib/content-fs.mjs';

const OUT = path.join(process.cwd(), 'public', 'search-index.json');

async function main() {
  const slugs = walkMdx();
  const docs = [];
  const routes = new Set();
  for (const slug of slugs) {
    const { data, content } = readMdx(slug);
    const headings = extractHeadings(content);
    const title = data?.title ?? headings.find((h) => h.level === 1)?.text ?? slug;
    const route = slugToRoute(slug);
    const invalidHeading = headings.find((h) => !h.text.trim() || !h.id.trim());
    if (invalidHeading) {
      throw new Error(`Invalid empty search heading in ${slug}`);
    }
    if (routes.has(route)) {
      throw new Error(`Duplicate search route: ${route}`);
    }
    routes.add(route);
    const text = extractText(content).slice(0, 4000);
    if (!title.trim() || !text.trim()) {
      throw new Error(`Empty search title or body in ${slug}`);
    }
    docs.push({
      route,
      title,
      headings: headings.filter((h) => h.level > 1),
      text,
    });
  }
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(docs));
  console.log(`Wrote search index with ${docs.length} docs to ${path.relative(process.cwd(), OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
