import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto('http://127.0.0.1:3020/errors/cc-connection-error', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);

const handle = await page.$('aside[aria-label="问题元信息"]');
if (!handle) {
  console.log('no ErrorMeta block found');
  process.exit(1);
}
const box = await handle.boundingBox();
const out = path.join(process.cwd(), 'output', 'screenshots');
await fs.mkdir(out, { recursive: true });

const shot = await page.screenshot({
  clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 60), width: box.width + 40, height: box.height + 80 },
});
await fs.writeFile(path.join(out, 'error-meta-light.png'), shot);

await page.evaluate(() => document.documentElement.classList.add('dark'));
await page.waitForTimeout(200);
const dark = await page.screenshot({
  clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 60), width: box.width + 40, height: box.height + 80 },
});
await fs.writeFile(path.join(out, 'error-meta-dark.png'), dark);
console.log('saved');
await browser.close();
