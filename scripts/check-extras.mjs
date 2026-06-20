import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const out = path.join(process.cwd(), 'output', 'screenshots');
await fs.mkdir(out, { recursive: true });

// 404 page
await page.goto('http://127.0.0.1:3020/this-page-does-not-exist', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, 'not-found.png') });
console.log('saved 404');

// Light theme: cc-switch detail (breadcrumbs + sidebar collapse visible)
await page.goto('http://127.0.0.1:3020/cc-switch', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(out, 'cc-switch-detail.png'),
  clip: { x: 0, y: 0, width: 1440, height: 700 },
});
console.log('saved cc-switch detail');

// Dark home
await page.goto('http://127.0.0.1:3020/', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => document.documentElement.classList.add('dark'));
await page.waitForTimeout(300);
await page.screenshot({
  path: path.join(out, 'home-dark.png'),
  clip: { x: 0, y: 0, width: 1440, height: 900 },
});
console.log('saved dark home');

await browser.close();
