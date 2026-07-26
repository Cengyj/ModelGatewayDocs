import type { Metadata, Viewport } from 'next';
import '@/styles/global.css';
import { ThemeScript } from '@/components/layout/ThemeScript';
import { AppShell } from '@/components/layout/AppShell';
import { PersistentDocFrame } from '@/components/layout/PersistentDocFrame';
import { site, operator } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/logo.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: [site.ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafbfc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: 'zh-CN',
  };

  // Organization JSON-LD is emitted ONLY once the operator fills in real
  // entity info in src/lib/site.ts — never fabricated.
  const organizationJsonLd = operator.legalName
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: operator.legalName,
        url: site.url,
        ...(operator.contactEmail ? { email: operator.contactEmail } : {}),
      }
    : null;

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {organizationJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
            }}
          />
        ) : null}
      </head>
      <body>
        <AppShell>
          <PersistentDocFrame>{children}</PersistentDocFrame>
        </AppShell>
      </body>
    </html>
  );
}
