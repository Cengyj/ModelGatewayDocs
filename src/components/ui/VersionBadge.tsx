import styles from './VersionBadge.module.css';

type Props = {
  version: string;
  date?: string;
  license?: string;
  github?: string;
  sourceLabel?: string;
};

/**
 * Inline strip shown beneath the H1 of any tool page.
 * Usage in MDX:
 *   <VersionBadge version="v2.1.183" date="2026-06-19" license="Proprietary" github="https://github.com/anthropics/claude-code" />
 */
export function VersionBadge({ version, date, license, github, sourceLabel }: Props) {
  return (
    <div className={styles.strip}>
      <span className={styles.badge}>
        <VersionIcon />
        {version}
      </span>
      {date ? (
        <span className={styles.meta}>
          <CalendarIcon />
          {date}
        </span>
      ) : null}
      {license ? (
        <span className={styles.meta}>
          <LicenseIcon />
          {license}
        </span>
      ) : null}
      {github ? (
        <a
          href={github}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon />
          {sourceLabel ?? 'GitHub'}
          <ExternalIcon />
        </a>
      ) : null}
    </div>
  );
}

function VersionIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.75 4.75v3l2.25 1.5-.75 1.125L7.25 8.5v-3.75h1.5Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5h-11Z" />
    </svg>
  );
}

function LicenseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M8.75.75a.75.75 0 0 0-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 0 1 3.984 3H1.75a.75.75 0 0 0 0 1.5h.428L.066 9.192a.75.75 0 0 0 .154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.514 3.514 0 0 0 .686.45A4.492 4.492 0 0 0 3 11c.88 0 1.556-.22 2.023-.454a3.515 3.515 0 0 0 .686-.45l.045-.04.016-.015.006-.006.002-.002.001-.002L5.25 9.5l.53.53a.75.75 0 0 0 .154-.838L3.822 4.5h.162c.305 0 .604-.08.869-.23l1.289-.737a.25.25 0 0 1 .124-.033h.984V13h-2.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-2.5V3.5h.984a.25.25 0 0 1 .125.033l1.288.737c.265.15.564.23.869.23h.162l-2.112 4.692a.75.75 0 0 0 .154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.517 3.517 0 0 0 .686.45A4.492 4.492 0 0 0 13 11c.88 0 1.556-.22 2.023-.454a3.512 3.512 0 0 0 .686-.45l.045-.04.016-.015.006-.006.002-.002.001-.002-.529-.531.53.53a.75.75 0 0 0 .154-.838L13.428 4.5h.322a.75.75 0 0 0 0-1.5h-2.234a.25.25 0 0 1-.125-.033l-1.288-.737A1.75 1.75 0 0 0 9.234 2H8.75V.75Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 9.5 9.5 2.5M5 2.5h4.5V7" />
    </svg>
  );
}
