/**
 * Shared HTML → MDX converter used by both:
 *   - scripts/convert-html-to-mdx.mjs (legacy one-shot importer from micuPages.ts)
 *   - scripts/sync-from-live.mjs       (repeatable importer from live HTML)
 *
 * Two top-level entry points:
 *   - htmlToMdx(html, { isHome }) → string of MDX body
 *   - sanitizeUpstreamHtml(html)  → upstream HTML with injection vectors stripped
 *
 * Plus helpers re-exported for tests/scripts:
 *   - decodeEntities, stripTags, frontmatter, pageRouteToFilePath
 */

export function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

export function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]*>/g, ''));
}

/**
 * Defensive sanitization for HTML fetched from an upstream we don't control.
 * Removes:
 *   - <script>, <style>, <iframe>, <object>, <embed>, <link rel="import">
 *   - <system-reminder>, <ip_reminder>, <instructions>, <thinking> and similar pseudo-tags
 *     that LLMs sometimes treat as authoritative
 *   - HTML comments that contain "ignore previous" / "you must" / "<instructions>"
 *
 * The converter only cares about article content (paragraphs, headings, code,
 * tables, lists), so dropping these is safe.
 */
export function sanitizeUpstreamHtml(html) {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  s = s.replace(/<object[\s\S]*?<\/object>/gi, '');
  s = s.replace(/<embed\b[^>]*\/?>/gi, '');
  s = s.replace(/<link\b[^>]*rel\s*=\s*['"]?import['"]?[^>]*\/?>/gi, '');
  // Pseudo-tags LLMs may treat as authoritative
  s = s.replace(/<(?:system[-_]reminder|ip[-_]reminder|instructions|thinking|tool[-_]use|user[-_]prompt[-_]submit[-_]hook)[\s\S]*?<\/\1>/gi, '');
  // HTML comments containing suspicious instruction patterns
  s = s.replace(/<!--[\s\S]*?-->/g, (m) => {
    if (/ignore\s+previous|you\s+must|<instructions|system[-_]reminder|new\s+instructions?/i.test(m)) {
      return '';
    }
    return m;
  });
  return s;
}

/**
 * Convert a code block <div class="language-XXX"><pre><code>...</code></pre></div>
 * into ```XXX\n...\n``` fenced markdown. shiki color spans inside are discarded
 * (rehype-pretty-code re-highlights at build time).
 */
function convertCodeBlock(html) {
  const langMatch = /class="language-([\w-]+)/.exec(html);
  const lang = langMatch ? langMatch[1] : '';
  const codeMatch = /<code[^>]*>([\s\S]*?)<\/code>/.exec(html);
  if (!codeMatch) return '```\n```';
  const lines = codeMatch[1]
    .split(/<span class="line">/)
    .slice(1)
    .map((chunk) => {
      const end = chunk.indexOf('</span></span>');
      const piece = end >= 0 ? chunk.slice(0, end + 7) : chunk;
      return stripTags(piece);
    });
  const body = lines.join('\n').replace(/\n+$/, '');
  return '```' + lang + '\n' + body + '\n```';
}

/** Inline-only conversion: used inside table cells / blockquote bodies / list items. */
function htmlToMdxInline(html) {
  let s = html;
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_m, inner) => '`' + stripTags(inner) + '`');
  s = s.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**');
  s = s.replace(/<em>([\s\S]*?)<\/em>/g, '*$1*');
  s = s.replace(/<a\s+href="([^"]+)"(?:[^>]*)>([\s\S]*?)<\/a>/g, (_m, href, text) => '[' + stripTags(text) + '](' + href + ')');
  s = s.replace(/<br\s*\/?>/g, '\n');
  s = s.replace(/<[^>]*>/g, '');
  return decodeEntities(s);
}

/**
 * Block-level HTML → MDX converter.
 *
 * Notes on isHome:
 *   - When true, VitePress's <VPHero> + <VPFeatures> are recognized and replaced
 *     with our React components <Hero> / <FeatureGrid>. Use this for one-shot
 *     conversion.
 *   - For sync-from-live where we want to preserve our hand-authored <Hero> +
 *     <FeatureGrid> blocks, set isHome:false on the article-only HTML.
 */
export function htmlToMdx(html, { isHome = false } = {}) {
  let out = html;

  out = out.replace(/<hr\s*\/?>/g, '\n\n---\n\n');

  // Headings (h1..h6) with id="..."
  out = out.replace(/<h([1-6])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g, (_m, lvl, _id, inner) => {
    const text = stripTags(inner.replace(/<a class="header-anchor"[^>]*>[\s\S]*?<\/a>/g, ''));
    return '\n\n' + '#'.repeat(Number(lvl)) + ' ' + text.trim() + '\n\n';
  });
  // Headings without explicit id
  out = out.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g, (_m, lvl, inner) => {
    const text = stripTags(inner.replace(/<a class="header-anchor"[^>]*>[\s\S]*?<\/a>/g, ''));
    return '\n\n' + '#'.repeat(Number(lvl)) + ' ' + text.trim() + '\n\n';
  });

  // VitePress fenced code blocks
  out = out.replace(
    /<div class="language-[\w-]+ vp-adaptive-theme">[\s\S]*?<\/div>/g,
    (m) => '\n\n' + convertCodeBlock(m) + '\n\n',
  );

  // Bare <pre><code>...</code></pre> blocks
  out = out.replace(/<button[^>]*class="copy"[^>]*>[\s\S]*?<\/button>/g, '');
  out = out.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (_m, inner) => {
    const codeMatch = /<code[^>]*>([\s\S]*?)<\/code>/.exec(inner);
    const body = codeMatch
      ? stripTags(codeMatch[1])
      : stripTags(inner).replace(/^`|`$/g, '');
    return '\n\n```text\n' + body.trim() + '\n```\n\n';
  });

  out = out.replace(/<code>([\s\S]*?)<\/code>/g, (_m, inner) => '`' + stripTags(inner) + '`');
  out = out.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**');
  out = out.replace(/<em>([\s\S]*?)<\/em>/g, '*$1*');

  // Anchors — strip target/rel attrs noise; preserve href + text
  out = out.replace(/<a\s+href="([^"]+)"(?:[^>]*)>([\s\S]*?)<\/a>/g, (_m, href, text) => {
    const t = stripTags(text);
    return '[' + t + '](' + href + ')';
  });

  // Images
  out = out.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/g, (_m, src, alt) => '\n\n![' + alt + '](' + src + ')\n\n');
  out = out.replace(/<img[^>]*src="([^"]+)"[^>]*\/?>/g, (_m, src) => '\n\n![](' + src + ')\n\n');

  // Tables
  out = out.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (_m, inner) => {
    const headerCells = [];
    inner.replace(/<thead[\s\S]*?<\/thead>/g, (h) => {
      h.replace(/<th[^>]*>([\s\S]*?)<\/th>/g, (_m2, cell) => {
        headerCells.push(htmlToMdxInline(cell).trim().replace(/\|/g, '\\|'));
        return '';
      });
      return '';
    });
    const rows = [];
    inner.replace(/<tbody[\s\S]*?<\/tbody>/g, (b) => {
      b.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_m3, rowHtml) => {
        const cells = [];
        rowHtml.replace(/<td[^>]*>([\s\S]*?)<\/td>/g, (_m4, cell) => {
          cells.push(htmlToMdxInline(cell).trim().replace(/\|/g, '\\|').replace(/\n/g, ' '));
          return '';
        });
        rows.push(cells);
        return '';
      });
      return '';
    });
    if (!headerCells.length) return '';
    const lines = [
      '| ' + headerCells.join(' | ') + ' |',
      '| ' + headerCells.map(() => '---').join(' | ') + ' |',
      ...rows.map((r) => '| ' + r.join(' | ') + ' |'),
    ];
    return '\n\n' + lines.join('\n') + '\n\n';
  });

  // Lists
  out = out.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (_m, inner) => {
    const items = [];
    inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_m2, li) => {
      items.push('- ' + htmlToMdxInline(li).trim());
      return '';
    });
    return '\n\n' + items.join('\n') + '\n\n';
  });
  out = out.replace(/<ol([^>]*)>([\s\S]*?)<\/ol>/g, (_m, attrs, inner) => {
    const startMatch = /start="?(\d+)"?/i.exec(attrs);
    let i = startMatch ? parseInt(startMatch[1], 10) : 1;
    const items = [];
    inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_m2, li) => {
      items.push(i + '. ' + htmlToMdxInline(li).trim());
      i++;
      return '';
    });
    return '\n\n' + items.join('\n') + '\n\n';
  });

  // <details><summary>..</summary>..</details>
  out = out.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
    (_m, sum, body) => `\n\n<details>\n<summary>${stripTags(sum).trim()}</summary>\n\n${htmlToMdxInline(body).trim()}\n\n</details>\n\n`,
  );

  // Blockquotes
  out = out.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (_m, inner) => {
    const cleaned = htmlToMdxInline(inner).trim();
    const lines = cleaned.split('\n').map((l) => '> ' + l).join('\n');
    return '\n\n' + lines + '\n\n';
  });

  out = out.replace(/<p>([\s\S]*?)<\/p>/g, (_m, inner) => '\n\n' + htmlToMdxInline(inner).trim() + '\n\n');

  if (isHome) {
    // Hero
    out = out.replace(
      /<div class="VPHero VPHomeHero">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>(?:[\s\S]*?<p class="tagline"[^>]*>([\s\S]*?)<\/p>)?[\s\S]*?<\/div><\/div><\/div>/,
      (_m, h1, tagline) => {
        const name = /<span class="name clip"[^>]*>([\s\S]*?)<\/span>/.exec(h1)?.[1] ?? '';
        const text = /<span class="text"[^>]*>([\s\S]*?)<\/span>/.exec(h1)?.[1] ?? stripTags(h1);
        const taglineText = tagline ? stripTags(tagline) : '';
        return [
          '<Hero',
          `  name="${stripTags(name).trim()}"`,
          `  text="${stripTags(text).trim()}"`,
          `  tagline="${taglineText.trim()}"`,
          '  actions={[',
          `    { label: "Claude Code 快速上手", href: "/claude-code", variant: "primary" },`,
          `    { label: "报错与踩坑", href: "/errors", variant: "secondary" },`,
          '  ]}',
          '/>',
        ].join('\n');
      },
    );
    out = out.replace(
      /<div class="VPFeatures VPHomeFeatures">[\s\S]*?<div class="items">([\s\S]*?)<\/div><\/div><\/div>/,
      (_m, items) => {
        const features = [];
        const re = /<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<div class="icon"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<h2 class="title"[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p class="details"[^>]*>([\s\S]*?)<\/p>/g;
        let match;
        while ((match = re.exec(items)) !== null) {
          const [, href, icon, title, details] = match;
          const isExt = /^https?:/.test(href);
          features.push(
            `  <Feature icon={<>${stripTags(icon).trim()}</>} title="${stripTags(title).trim()}" details="${stripTags(details).trim().replace(/"/g, '\\"')}" href="${href}"${isExt ? ' external' : ''} />`,
          );
        }
        return '<FeatureGrid>\n' + features.join('\n') + '\n</FeatureGrid>';
      },
    );
    out = out.replace(/<div class="micu-vp-home-doc vp-doc">/g, '');
    out = out.replace(/<div class="micu-vp-home">/g, '');
  }

  // Cleanup: leftover wrappers, header-anchor links
  out = out.replace(/<\/?div[^>]*>/g, '');
  out = out.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  out = out.replace(/<a class="header-anchor"[^>]*>[\s\S]*?<\/a>/g, '');
  out = out.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return out;
}

export function frontmatter(title, description) {
  const desc = description ? `\ndescription: ${JSON.stringify(description)}` : '';
  return `---\ntitle: ${JSON.stringify(title)}${desc}\n---\n\n`;
}
