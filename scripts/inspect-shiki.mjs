import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:3020/cc-switch', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const token = document.querySelector('pre code span[style*="--shiki-light"]');
  if (!token) return { error: 'no token found' };
  const cs = getComputedStyle(token);
  return {
    text: token.textContent,
    inlineStyle: token.getAttribute('style'),
    computedColor: cs.color,
    shikiLightVar: cs.getPropertyValue('--shiki-light'),
    shikiDarkVar: cs.getPropertyValue('--shiki-dark'),
    parentColor: getComputedStyle(token.parentElement).color,
    grandParentColor: getComputedStyle(token.parentElement.parentElement).color,
  };
});
console.log(result);
await browser.close();
