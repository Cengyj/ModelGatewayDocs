/**
 * One-shot URL migration: micuapi.ai → foropencode.com.
 *
 * Touches:
 *   - src/lib/site.ts
 *   - src/content/**\/*.mdx
 *   - DEPLOY.md
 *
 * Rules (applied in order):
 *   https://www.micuapi.ai/...  → https://foropencode.com/...
 *   https://docs.micuapi.ai/... → https://foropencode.com/...
 *   docs.micuapi.ai             → foropencode.com
 *   www.micuapi.ai              → foropencode.com
 *   micuapi.ai                  → foropencode.com  (catches bare references)
 *
 * Does NOT rewrite:
 *   - The string "Micu" / "micu" used as a brand name in prose (e.g. "Micu 预设供应商")
 *   - Token group prefixes like "vip_2_cc" (unrelated)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TARGETS = [
  'src/lib/site.ts',
  'src/components/Header.tsx',
  'src/components/SearchModal.tsx',
  'DEPLOY.md',
];

async function walkContent(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkContent(abs)));
    else if (entry.isFile() && /\.mdx?$/.test(entry.name)) out.push(abs);
  }
  return out;
}

function migrate(text) {
  let next = text;
  next = next.replace(/https:\/\/www\.micuapi\.ai/g, 'https://foropencode.com');
  next = next.replace(/https:\/\/docs\.micuapi\.ai/g, 'https://foropencode.com');
  next = next.replace(/docs\.micuapi\.ai/g, 'foropencode.com');
  next = next.replace(/www\.micuapi\.ai/g, 'foropencode.com');
  next = next.replace(/\bmicuapi\.ai\b/g, 'foropencode.com');
  return next;
}

async function processFile(rel) {
  const abs = path.resolve(projectRoot, rel);
  let stat;
  try { stat = await fs.stat(abs); } catch { return null; }
  if (!stat.isFile()) return null;
  const src = await fs.readFile(abs, 'utf8');
  const next = migrate(src);
  if (next === src) return { rel, changed: 0 };
  // Count distinct replacements roughly
  const before = (src.match(/micuapi\.ai/g) || []).length;
  await fs.writeFile(abs, next, 'utf8');
  return { rel, changed: before };
}

async function main() {
  const contentDir = path.resolve(projectRoot, 'src', 'content');
  const mdxFiles = (await walkContent(contentDir)).map((p) => path.relative(projectRoot, p));
  const all = [...new Set([...TARGETS, ...mdxFiles])];
  let touched = 0;
  let totalReplacements = 0;
  for (const rel of all) {
    const result = await processFile(rel);
    if (!result) continue;
    if (result.changed > 0) {
      console.log(`  ${rel.padEnd(70)} ${result.changed} replacement(s)`);
      touched++;
      totalReplacements += result.changed;
    }
  }
  console.log(`\nDone. Touched ${touched} file(s) / ${totalReplacements} replacement(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
