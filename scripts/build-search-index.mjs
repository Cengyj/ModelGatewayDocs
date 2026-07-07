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
  for (const slug of slugs) {
    const { data, content } = readMdx(slug);
    const headings = extractHeadings(content);
    const title = data?.title ?? headings.find((h) => h.level === 1)?.text ?? slug;
    docs.push({
      route: slugToRoute(slug),
      title,
      headings: headings.filter((h) => h.level > 1),
      text: extractText(content).slice(0, 4000),
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
