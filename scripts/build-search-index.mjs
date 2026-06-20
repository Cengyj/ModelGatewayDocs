/**
 * Build-time search index generator. Walks src/content/*.mdx, extracts
 * heading tree and plaintext body, writes a single JSON file under
 * public/search-index.json that the client-side SearchModal loads.
 *
 * Index shape (kept small and JSON-friendly so it can be fetched on demand):
 *   [{ route, title, headings: [{id, text, level}], text }]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT = path.join(process.cwd(), 'src', 'content');
const OUT = path.join(process.cwd(), 'public', 'search-index.json');

async function walk(dir, base = []) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const next = [...base, entry.name];
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(abs, next)));
    else if (entry.isFile() && /\.mdx?$/.test(entry.name)) out.push(next.join('/'));
  }
  return out;
}

function slugify(text) {
  let s = text
    .toLowerCase()
    .trim()
    .replace(/[ -]/g, '')
    .replace(/[!"#$%&'()*+,./:;<=>?@\[\\\]^_`{|}~]/g, '')
    .replace(/\s+/g, '-');
  if (/^\d/.test(s)) s = '_' + s;
  return s;
}

function extractHeadings(source) {
  const lines = source.split(/\r?\n/);
  const out = [];
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line)) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/`/g, '').replace(/\[(.+?)\]\([^)]+\)/g, '$1').trim();
    out.push({ id: slugify(text), text, level });
  }
  return out;
}

function extractText(source) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugToRoute(slug) {
  const noExt = slug.replace(/\.mdx?$/, '');
  if (noExt === 'index') return '/';
  return '/' + noExt;
}

async function main() {
  const slugs = await walk(CONTENT);
  const docs = [];
  for (const slug of slugs) {
    const filePath = path.join(CONTENT, slug);
    const raw = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(raw);
    const headings = extractHeadings(content);
    const title = data.title ?? headings.find((h) => h.level === 1)?.text ?? slug;
    docs.push({
      route: slugToRoute(slug),
      title,
      headings: headings.filter((h) => h.level > 1),
      text: extractText(content).slice(0, 4000),
    });
  }
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(docs));
  console.log(`Wrote search index with ${docs.length} docs to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
