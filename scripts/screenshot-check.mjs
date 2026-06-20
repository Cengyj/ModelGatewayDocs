/**
 * Take screenshots of key routes on the dev server, save under
 * output/screenshots/ so we can eyeball visual rendering.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const LOCAL = 'http://127.0.0.1:3020';
const OUT = path.join(process.cwd(), 'output', 'screenshots');

const ROUTES = [
  '/',
  '/cc-switch',
  '/claude-code',
  '/codex',
  '/openclaw',
  '/external-compat',
  '/errors',
  '/tools',
  '/errors/cc-024-third-party-system-role-400',
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const route of ROUTES) {
    const id = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '__');
    process.stdout.write(`${route} ... `);
    try {
      const resp = await page.goto(`${LOCAL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      const status = resp?.status();
      await page.waitForTimeout(500);
      const shot = await page.screenshot({ fullPage: true, animations: 'disabled' });
      await fs.writeFile(path.join(OUT, `${id}.png`), shot);
      console.log(`HTTP ${status}, screenshot ok`);
    } catch (e) {
      console.log(`ERR ${e.message}`);
    }
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
