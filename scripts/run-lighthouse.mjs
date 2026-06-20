/**
 * Run Lighthouse against the production server (assume :3020) for 4 key
 * routes. Saves per-route .html reports under output/lighthouse-<date>/ and a
 * scores.json summary.
 *
 * Lighthouse is invoked via the `lighthouse` npm CLI. Chrome must be
 * installable by Lighthouse — Playwright already ships Chromium binaries
 * we can use.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROUTES = ['/', '/cc-switch', '/claude-code', '/errors/cc-connection-error'];
const URL_BASE = 'http://127.0.0.1:3020';
const OUT_DIR = path.join(process.cwd(), 'output', 'lighthouse-2026-06-19');

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'pipe', shell: true, ...opts });
    let stdout = '', stderr = '';
    p.stdout.on('data', (d) => { stdout += d; });
    p.stderr.on('data', (d) => { stderr += d; });
    p.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`exit ${code}: ${stderr || stdout}`));
    });
  });
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Locate Chromium binary from Playwright so Lighthouse can use it on Windows
  const exe = chromium.executablePath();
  process.env.CHROME_PATH = exe;

  const summary = [];

  for (const route of ROUTES) {
    const id = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '__');
    const url = `${URL_BASE}${route}`;
    const reportHtml = path.join(OUT_DIR, `${id}.report.html`);
    const reportJson = path.join(OUT_DIR, `${id}.report.json`);

    console.log(`\n=== ${route} ===`);
    try {
      // --quiet keeps logs minimal; --output html,json writes both formats next to --output-path basename.
      await run('npx', [
        '--yes', 'lighthouse@12',
        url,
        '--quiet',
        '--chrome-flags=--headless=new --no-sandbox',
        '--output=html', '--output=json',
        `--output-path=${reportHtml.replace(/\.report\.html$/, '')}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--preset=desktop',
      ], { env: { ...process.env, CHROME_PATH: exe } });

      const json = JSON.parse(await fs.readFile(reportJson, 'utf8'));
      const scores = {
        route,
        performance: Math.round(json.categories.performance.score * 100),
        accessibility: Math.round(json.categories.accessibility.score * 100),
        bestPractices: Math.round(json.categories['best-practices'].score * 100),
        seo: Math.round(json.categories.seo.score * 100),
        fcp: json.audits['first-contentful-paint']?.numericValue,
        lcp: json.audits['largest-contentful-paint']?.numericValue,
        cls: json.audits['cumulative-layout-shift']?.numericValue,
        tbt: json.audits['total-blocking-time']?.numericValue,
      };
      summary.push(scores);
      console.log(`  perf=${scores.performance}  a11y=${scores.accessibility}  bp=${scores.bestPractices}  seo=${scores.seo}`);
      console.log(`  LCP=${(scores.lcp/1000).toFixed(2)}s  CLS=${scores.cls?.toFixed(3)}  TBT=${scores.tbt?.toFixed(0)}ms`);
    } catch (e) {
      console.error(`  FAILED: ${e.message.slice(0, 200)}`);
      summary.push({ route, error: e.message });
    }
  }

  await fs.writeFile(path.join(OUT_DIR, 'scores.json'), JSON.stringify(summary, null, 2));

  // Markdown summary
  const md = ['# Lighthouse scores', '', `Generated ${new Date().toISOString()}`, '', '| route | perf | a11y | bp | seo | LCP | CLS | TBT |', '| --- | --- | --- | --- | --- | --- | --- | --- |'];
  for (const r of summary) {
    if (r.error) {
      md.push(`| ${r.route} | error | | | | | | |`);
    } else {
      md.push(`| ${r.route} | ${r.performance} | ${r.accessibility} | ${r.bestPractices} | ${r.seo} | ${(r.lcp/1000).toFixed(2)}s | ${r.cls.toFixed(3)} | ${r.tbt.toFixed(0)}ms |`);
    }
  }
  await fs.writeFile(path.join(OUT_DIR, 'scores.md'), md.join('\n'));
  console.log(`\nReports written to ${OUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
