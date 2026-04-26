import React, {type ReactNode, useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

type ListProps = {
  title: string;
  items: ReadonlyArray<ReactNode>;
  children?: ReactNode;
};

type ToneCardProps = {
  title: string;
  children?: ReactNode;
};

type CopyCardProps = {
  title: string;
  code: string;
  note?: string;
};

type InlineCopyCodeProps = {
  code: string;
};

type LinkCardProps = {
  href: string;
  title: string;
  description: string;
  badge?: string;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: ReadonlyArray<string>;
};

type MethodCardProps = LinkCardProps & {
  recommended?: boolean;
};

type MethodGridProps = {
  title?: string;
  items: ReadonlyArray<MethodCardProps>;
};


type PlatformCommand = {
  label: string;
  code: string;
  note?: string;
};

type PlatformCommandGridProps = {
  title: string;
  description?: string;
  commands: ReadonlyArray<PlatformCommand>;
};
type StageNavItem = {
  href: string;
  title: string;
  description: string;
};

type StageNavProps = {
  title?: string;
  items: ReadonlyArray<StageNavItem>;
};

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function renderPlainTextWithLinks(text: string, keyPrefix: string) {
  const parts = text.split(/(https?:\/\/[^\s，。；、）)]+)/gi);

  return parts.map((part, index) => {
    if (!isHttpUrl(part)) {
      return part;
    }

    return (
      <a href={part} key={`${keyPrefix}-url-${index}`} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    );
  });
}

function renderInlineString(text: string, keyPrefix: string) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return <code key={`${keyPrefix}-code-${index}`}>{codeText}</code>;
    }

    return renderPlainTextWithLinks(part, `${keyPrefix}-text-${index}`);
  });
}

function renderItems(items: ReadonlyArray<ReactNode>) {
  return (
    <ul className="guide-block-list">
      {items.map((item, index) => (
        <li key={index}>{typeof item === 'string' ? renderInlineString(item, `item-${index}`) : item}</li>
      ))}
    </ul>
  );
}

function ChecklistBlock({
  title,
  items,
  children,
  tone,
}: ListProps & {
  tone: 'neutral' | 'primary';
}) {
  return (
    <section className={`guide-block guide-block--${tone}`} data-guide-tone={tone}>
      <div className="guide-block__marker" aria-hidden="true" />
      <div className="guide-block__body">
        <div className="guide-block__title">{title}</div>
        {renderItems(items)}
        {children ? <div className="guide-block__note">{children}</div> : null}
      </div>
    </section>
  );
}

export function PrepareChecklist({title, items, children}: ListProps) {
  return (
    <ChecklistBlock title={title} items={items} tone="neutral">
      {children}
    </ChecklistBlock>
  );
}

export function StepChecklist({title, items, children}: ListProps) {
  return (
    <ChecklistBlock title={title} items={items} tone="primary">
      {children}
    </ChecklistBlock>
  );
}

export function CopyCard({title, code, note}: CopyCardProps) {
  const [copied, setCopied] = useState(false);
  const normalizedCode = useMemo(() => code.replace(/\r\n/g, '\n'), [code]);
  const openUrl = useMemo(() => {
    const trimmedCode = normalizedCode.trim();
    return isHttpUrl(trimmedCode) && !/\s/.test(trimmedCode) ? trimmedCode : null;
  }, [normalizedCode]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(normalizedCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="copy-card">
      <div className="copy-card__header">
        <div>
          <div className="copy-card__eyebrow">复制字段</div>
          <div className="copy-card__title">{title}</div>
          <p className="copy-card__note copy-card__note--compact">
            {note ?? '复制后粘贴到对应字段；如果你不确定放哪一项，先看步骤说明。'}
          </p>
        </div>
        <div className="copy-card__actions">
          {openUrl ? (
            <a className="copy-card__button" href={openUrl} target="_blank" rel="noopener noreferrer">
              打开
            </a>
          ) : null}
          <button className="copy-card__button" type="button" onClick={handleCopy}>
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
      <pre className="copy-card__code">
        <code>{normalizedCode}</code>
      </pre>
    </section>
  );
}

export function InlineCopyCode({code}: InlineCopyCodeProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="inline-copy-code">
      <code>{code}</code>
      <button className="inline-copy-code__button" type="button" onClick={handleCopy}>
        {copied ? '已复制' : '复制'}
      </button>
    </span>
  );
}

function ToneCardBase({
  title,
  children,
  tone,
}: ToneCardProps & {
  tone: 'error' | 'success' | 'hint' | 'windows';
}) {
  return (
    <section className={`tone-card tone-card--${tone}`} data-guide-tone={tone}>
      <div className="tone-card__icon" aria-hidden="true" />
      <div className="tone-card__body">
        <div className="tone-card__title">{title}</div>
        <div className="tone-card__content">{children}</div>
      </div>
    </section>
  );
}

export function ErrorCard({title, children}: ToneCardProps) {
  return (
    <ToneCardBase title={title} tone="error">
      {children}
    </ToneCardBase>
  );
}

export function SuccessCard({title, children}: ToneCardProps) {
  return (
    <ToneCardBase title={title} tone="success">
      {children}
    </ToneCardBase>
  );
}

export function GlossaryHint({title, children}: ToneCardProps) {
  return (
    <ToneCardBase title={title} tone="hint">
      {children}
    </ToneCardBase>
  );
}

export function WindowsTip({title, children}: ToneCardProps) {
  return (
    <ToneCardBase title={title} tone="windows">
      {children}
    </ToneCardBase>
  );
}

export function LinkCard({href, title, description, badge}: LinkCardProps) {
  const content = (
    <>
      <span className="guide-link-card__topline">
        {badge ? <span className="guide-link-card__badge">{badge}</span> : <span />}
        <span className="guide-link-card__arrow" aria-hidden="true">→</span>
      </span>
      <strong className="guide-link-card__title">{title}</strong>
      <span className="guide-link-card__description">{description}</span>
    </>
  );

  if (isHttpUrl(href)) {
    return (
      <a className="guide-link-card" href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link className="guide-link-card" to={href}>
      {content}
    </Link>
  );
}

export function PageHeader({eyebrow, title, description, meta}: PageHeaderProps) {
  return (
    <header className="page-header-card">
      <div className="page-header-card__content">
        {eyebrow ? <span className="page-header-card__eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p>{description}</p>
        {meta?.length ? (
          <div className="guide-status-row">
            {meta.map(item => (
              <span className="guide-status-pill" key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function MethodGrid({title = '选择配置方式', items}: MethodGridProps) {
  return (
    <section className="method-grid-wrap">
      <div className="method-grid-wrap__header">
        <div className="method-grid-wrap__title">{title}</div>
      </div>
      <div className="method-grid">
        {items.map(item => (
          <Link className={`method-card${item.recommended ? ' method-card--recommended' : ''}`} to={item.href} key={`${item.href}-${item.title}`}>
            <span className="method-card__topline">
              {item.badge ? <span className="method-card__badge">{item.badge}</span> : <span />}
              <span className="method-card__arrow" aria-hidden="true">→</span>
            </span>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}



export function PlatformCommandTabs({title, description, commands}: PlatformCommandGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCommand = commands[activeIndex] ?? commands[0];

  return (
    <section className="platform-command-tabs-wrap">
      <div className="platform-command-grid__header">
        <div className="platform-command-grid__title">{title}</div>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="platform-command-tabs">
        <div className="platform-command-tabs__tablist" role="tablist" aria-label={title}>
          {commands.map((command, index) => (
            <button
              className={`platform-command-tabs__button${index === activeIndex ? ' platform-command-tabs__button--active' : ''}`}
              key={command.label}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}>
              {command.label}
            </button>
          ))}
        </div>
        {activeCommand ? (
          <section className="platform-command-tabs__panel" role="tabpanel">
            <section className="platform-command-card platform-command-card--tab">
              <pre className="platform-command-card__code">
                <code>{activeCommand.code}</code>
              </pre>
              {activeCommand.note ? <p className="platform-command-card__note">{activeCommand.note}</p> : null}
            </section>
          </section>
        ) : null}
      </div>
    </section>
  );
}
export function PlatformCommandGrid({title, description, commands}: PlatformCommandGridProps) {
  return (
    <section className="platform-command-grid-wrap">
      <div className="platform-command-grid__header">
        <div className="platform-command-grid__title">{title}</div>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="platform-command-grid">
        {commands.map(command => (
          <section className="platform-command-card" key={command.label}>
            <div className="platform-command-card__title">{command.label}</div>
            <pre className="platform-command-card__code">
              <code>{command.code}</code>
            </pre>
            {command.note ? <p className="platform-command-card__note">{command.note}</p> : null}
          </section>
        ))}
      </div>
    </section>
  );
}
export function StageNav({
  title = '按阶段直接跳',
  items,
}: StageNavProps) {
  return (
    <section className="stage-nav">
      <div className="stage-nav__title">{title}</div>
      <div className="stage-nav__grid">
        {items.map(item => (
          <Link className="stage-nav__item" key={`${item.href}-${item.title}`} to={item.href}>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}






