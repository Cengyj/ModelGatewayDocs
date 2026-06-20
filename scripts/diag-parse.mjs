import fs from 'node:fs';
const text = fs.readFileSync('tmp-eval.mjs', 'utf8');
let inStr = false;
let quote = '';
let depth = 0;
let line = 1;
let col = 0;
let escaped = false;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  if (c === '\n') { line++; col = 0; continue; }
  col++;
  if (escaped) { escaped = false; continue; }
  if (c === '\\') { escaped = true; continue; }
  if (inStr) {
    if (c === quote) inStr = false;
    continue;
  }
  if (c === '"' || c === "'" || c === '`') { inStr = true; quote = c; continue; }
  if (c === '{' || c === '[') depth++;
  if (c === '}' || c === ']') depth--;
  if (c === ';' && depth > 0) {
    console.log('orphan ; at line', line, 'col', col, 'depth', depth);
    console.log('context:', JSON.stringify(text.slice(Math.max(0, i - 60), i + 60)));
    break;
  }
}
