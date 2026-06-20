/**
 * One-shot converter: walks src/content/errors/*.mdx and replaces the
 * hand-rolled 5-row meta table with a <ErrorMeta /> component.
 *
 * Existing table shape (after the H1):
 *   | 字段 | 内容 |
 *   | --- | --- |
 *   | 影响组件 | XXX |
 *   | 发现版本 | XXX |
 *   | 系统环境 | XXX |
 *   | 解决人 | — |
 *   | 发现日期 | YYYY-MM-DD |
 *
 * After conversion:
 *   <ErrorMeta
 *     component="..."
 *     version="..."
 *     platform="..."
 *     date="..."
 *   />
 *
 * severity + status are NOT inferred — they should be added by hand later
 * (we don't have authoritative data for those across all 17 pages).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const errorsDir = path.resolve(__dirname, '..', 'src', 'content', 'errors');

const FIELDS = {
  '影响组件': 'component',
  '发现版本': 'version',
  '系统环境': 'platform',
  '解决人': 'owner',
  '发现日期': 'date',
};

const META_TABLE = /\|\s*字段\s*\|\s*内容\s*\|\s*\n\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*\n((?:\|[^\n]+\|\s*\n)+)/;

function parseTable(rowsBlock) {
  const map = {};
  for (const line of rowsBlock.split(/\r?\n/)) {
    const m = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/.exec(line.trim());
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim();
    if (FIELDS[key]) map[FIELDS[key]] = val;
  }
  return map;
}

function buildComponent(props) {
  const lines = ['<ErrorMeta'];
  if (props.component) lines.push(`  component=${JSON.stringify(props.component)}`);
  if (props.version) lines.push(`  version=${JSON.stringify(props.version)}`);
  if (props.platform) lines.push(`  platform=${JSON.stringify(props.platform)}`);
  if (props.date) lines.push(`  date=${JSON.stringify(props.date)}`);
  if (props.owner && props.owner !== '—' && props.owner !== '-') {
    lines.push(`  owner=${JSON.stringify(props.owner)}`);
  }
  lines.push('/>');
  return lines.join('\n');
}

async function main() {
  const files = (await fs.readdir(errorsDir)).filter((f) => f.endsWith('.mdx'));
  let converted = 0;
  let skipped = 0;
  for (const file of files) {
    const filePath = path.join(errorsDir, file);
    const src = await fs.readFile(filePath, 'utf8');
    if (src.includes('<ErrorMeta')) {
      console.log(`  ${file}: already converted, skipped`);
      skipped++;
      continue;
    }
    const m = META_TABLE.exec(src);
    if (!m) {
      console.log(`  ${file}: no meta table found, skipped`);
      skipped++;
      continue;
    }
    const props = parseTable(m[1]);
    if (!props.component) {
      console.log(`  ${file}: no 影响组件, skipped`);
      skipped++;
      continue;
    }
    const replacement = buildComponent(props);
    const next = src.replace(META_TABLE, replacement + '\n');
    await fs.writeFile(filePath, next, 'utf8');
    console.log(`  ${file}: converted (${Object.keys(props).join(', ')})`);
    converted++;
  }
  console.log(`\nConverted ${converted} / skipped ${skipped} / total ${files.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
