/**
 * Shared filesystem + content helpers for the content codegen and the search
 * index builder. This is the ONLY place slugging + TOC extraction live, so the
 * TOC anchors in the app and the heading ids in the search index are produced
 * by the exact same code path that rehype-slug uses at render time.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';

export const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content');

/** Recursively collect `<dir-relative>.mdx` slugs (POSIX-separated). */
export function walkMdx(dir = CONTENT_ROOT, base = []) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const next = [...base, entry.name];
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdx(abs, next));
    else if (entry.isFile() && /\.mdx?$/.test(entry.name)) out.push(next.join('/'));
  }
  return out;
}

/** `index.mdx` -> `/`; `a/b.mdx` -> `/a/b`. */
export function slugToRoute(slug) {
  const noExt = slug.replace(/\.mdx?$/, '');
  if (noExt === 'index') return '/';
  return '/' + noExt;
}

/**
 * Extract level-2/3 ATX headings as TOC entries. IDs come from a per-document
 * github-slugger instance — identical to rehype-slug's output, including the
 * `-1`/`-2` suffixes for duplicate headings.
 */
export function extractToc(source, levels = [2, 3]) {
  const slugger = new GithubSlugger();
  return extractHeadings(source, slugger)
    .filter((h) => levels.includes(h.level))
    .map(({ level, id, text }) => ({ level, id, text }));
}

/**
 * Extract all headings with render-accurate ids. Pass a fresh GithubSlugger so
 * collision suffixes match a single rendered document.
 */
export function extractHeadings(source, slugger = new GithubSlugger()) {
  const lines = source.split(/\r?\n/);
  const out = [];
  let fence = null; // active code-fence marker: '```' or '~~~'
  const cleanText = (raw) =>
    raw
      .replace(/`/g, '')
      .replace(/\[(.+?)\]\([^)]+\)/g, '$1')
      .trim();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence) continue;
    // ATX heading: `## Title`
    const atx = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (atx) {
      const text = cleanText(atx[2]);
      out.push({ level: atx[1].length, id: slugger.slug(text), text });
      continue;
    }
    // Setext heading: a text line underlined by `===` (h1) or `---` (h2).
    const next = lines[i + 1];
    if (next && line.trim() && !/^\s*#{1,6}\s/.test(line)) {
      if (/^\s*=+\s*$/.test(next)) {
        const text = cleanText(line.trim());
        out.push({ level: 1, id: slugger.slug(text), text });
        i++;
        continue;
      }
      if (/^\s*-{2,}\s*$/.test(next)) {
        const text = cleanText(line.trim());
        out.push({ level: 2, id: slugger.slug(text), text });
        i++;
        continue;
      }
    }
  }
  return out;
}

/**
 * Strip MDX/markdown to plaintext for search + meta-description fallback.
 * Markdown markers are removed as markers (line-start prefixes, paired emphasis,
 * table pipes) WITHOUT splitting in-word punctuation — so `cc-switch`,
 * `~/.claude`, and `--flag` survive intact in the output.
 */
export function extractText(source) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code
    .replace(/~~~[\s\S]*?~~~/g, ' ')           // alt-fenced code
    .replace(/<[^>]+>/g, ' ')                   // JSX / HTML tags
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')      // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // links -> text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/, '')       // ATX heading prefix
        .replace(/^\s{0,3}>+\s?/, '')           // blockquote prefix
        .replace(/^\s{0,3}([-*+]|\d+\.)\s+/, '') // list-item marker
        .replace(/^\s{0,3}[-*_]{3,}\s*$/, '')   // thematic break / setext underline
        .replace(/\|/g, ' '),                    // table pipes
    )
    .join(' ')
    .replace(/`([^`]+)`/g, '$1')                // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1')          // bold
    .replace(/\*([^*]+)\*/g, '$1')              // italic
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2') // underscore emphasis (word-safe)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Read + parse one MDX file's frontmatter and body. */
export function readMdx(slug) {
  const filePath = path.join(CONTENT_ROOT, slug);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return { filePath, data, content };
}

/**
 * Load a directory's _meta.ts default export. The files are intentionally
 * trivial (`import type ...; const meta: DirMeta = {...}; export default meta;`)
 * so we strip the type import + annotation and evaluate the literal — no TS
 * toolchain needed at codegen time.
 */
export function loadDirMeta(dirAbs) {
  const file = path.join(dirAbs, '_meta.ts');
  if (!fs.existsSync(file)) return {};
  const src = fs.readFileSync(file, 'utf8');
  const body = src
    .replace(/^﻿/, '')
    // drop import statements (single- or multi-line, up to the closing source)
    .replace(/^\s*import\b[\s\S]*?from\s*['"][^'"]+['"]\s*;?/gm, '')
    .replace(/^\s*import\s+['"][^'"]+['"]\s*;?/gm, '')
    .replace(/\s+satisfies\s+\w+/g, '')            // drop `satisfies DirMeta`
    .replace(/:\s*DirMeta\b/g, '')                 // drop the type annotation
    .replace(/export\s+default\s+/, 'return ');     // `export default X` -> `return X`
  let meta;
  try {
    // eslint-disable-next-line no-new-func
    meta = new Function(body)();
  } catch (e) {
    throw new Error(`Failed to evaluate ${file}: ${e.message}`);
  }
  if (meta === null || typeof meta !== 'object' || Array.isArray(meta)) {
    throw new Error(`${file} must export default a plain object (DirMeta), got ${Array.isArray(meta) ? 'array' : typeof meta}`);
  }
  return meta;
}
