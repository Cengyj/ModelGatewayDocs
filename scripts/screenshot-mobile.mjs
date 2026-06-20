/**
 * Mobile (390x844) screenshots for round-4 visual review.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const LOCAL = 'http://127.0.0.1:3020';
const OUT = path.join(process.cwd(), 'output', 'screenshots', 'mobile');

const ROUTES = [
  '/',
  '/cc-switch',
  '/claude-code',
  '/opencode',
  '/hermes',
  '/tools',
  '/errors',
  '/errors/cc-connection-error',
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    const id = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '__');
    process.stdout.write(`${route} ... `);
    const resp = await page.goto(`${LOCAL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);
    const shot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    await fs.writeFile(path.join(OUT, `${id}.png`), shot);
    console.log(`HTTP ${resp?.status()}, ok`);
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
