// Screenshot helper: captures desktop/mobile/dark screenshots of key pages.
// Usage: node .claude/shots.mjs [outdir]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://127.0.0.1:3020';
const OUT = process.argv[2] || '/tmp/mgd-shots';
mkdirSync(OUT, { recursive: true });

const pages = [
  ['home', '/'],
  ['claude-install', '/claude-code/cli/install'],
  ['claude-manual', '/claude-code/cli/manual'],
  ['get-key', '/get-key/create'],
  ['groups', '/get-key/groups'],
  ['cc-switch', '/cc-switch'],
  ['errors-index', '/claude-code/errors'],
  ['error-detail', '/claude-code/errors/cc-connection-error'],
  ['site-info', '/site-info'],
];

const modes = [
  { tag: 'desk', width: 1280, height: 800, scheme: 'light' },
  { tag: 'mob', width: 375, height: 812, scheme: 'light' },
  { tag: 'dark', width: 1280, height: 800, scheme: 'dark' },
];

const browser = await chromium.launch();
for (const m of modes) {
  const ctx = await browser.newContext({
    viewport: { width: m.width, height: m.height },
    colorScheme: m.scheme,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    // In dark mode only shoot a subset to save time
    if (m.tag === 'dark' && !['home', 'claude-install', 'groups'].includes(name)) continue;
    if (m.tag === 'mob' && ['claude-manual', 'errors-index', 'site-info'].includes(name)) continue;
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // Site stores theme in localStorage; emulate via the site's own toggle storage
    if (m.scheme === 'dark') {
      await page.evaluate(() => { localStorage.setItem('theme', 'dark'); });
      await page.reload({ waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}-${m.tag}.png`, fullPage: false });
    // Also capture a full-page shot for the homepage
    if (name === 'home' && m.tag === 'desk') {
      await page.screenshot({ path: `${OUT}/${name}-${m.tag}-full.png`, fullPage: true });
    }
  }
  await ctx.close();
}
await browser.close();
console.log('done ->', OUT);
