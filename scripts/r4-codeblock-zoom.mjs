import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:3020/cc-switch', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);

const block = await page.$('div[data-code-block]');
if (!block) {
  console.log('no code block');
  process.exit(1);
}
// Scroll the block into view so it sits inside the viewport
await block.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
const box = await block.boundingBox();
const viewport = page.viewportSize();
const clip = {
  x: Math.max(0, box.x - 12),
  y: Math.max(0, box.y - 12),
  width: Math.min(viewport.width - Math.max(0, box.x - 12), box.width + 24),
  height: Math.min(viewport.height - Math.max(0, box.y - 12), box.height + 24),
};

// Default (no hover): toolbar not visible
const idle = await page.screenshot({ clip });
const out = path.join(process.cwd(), 'output', 'screenshots');
await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, 'r4-code-idle.png'), idle);
console.log('saved idle');

// Hover: toolbar should slide in
await block.hover();
await page.waitForTimeout(350);
const hover = await page.screenshot({ clip });
await fs.writeFile(path.join(out, 'r4-code-hover.png'), hover);
console.log('saved hover');

await browser.close();
