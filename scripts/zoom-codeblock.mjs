import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto('http://127.0.0.1:3020/cc-switch', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);

const handle = await page.$('pre code');
if (!handle) {
  console.log('no code block');
  process.exit(1);
}
const box = await handle.boundingBox();
const shot = await page.screenshot({
  clip: { x: box.x - 20, y: box.y - 50, width: box.width + 40, height: box.height + 80 },
});
await fs.mkdir(path.join(process.cwd(), 'output', 'screenshots'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'output', 'screenshots', 'codeblock-zoom.png'), shot);
console.log('saved');

// dark mode too
await page.evaluate(() => document.documentElement.classList.add('dark'));
await page.waitForTimeout(200);
const shotDark = await page.screenshot({
  clip: { x: box.x - 20, y: box.y - 50, width: box.width + 40, height: box.height + 80 },
});
await fs.writeFile(path.join(process.cwd(), 'output', 'screenshots', 'codeblock-zoom-dark.png'), shotDark);
console.log('dark saved');

await browser.close();
