import type { ReactNode } from 'react';
import styles from './ErrorMeta.module.css';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Status = 'fixed' | 'workaround' | 'unresolved';

type Props = {
  component: string;
  version?: string;
  platform?: string;
  date?: string;
  severity?: Severity;
  status?: Status;
  owner?: string;
  children?: ReactNode;
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
};

const STATUS_LABEL: Record<Status, string> = {
  fixed: '已修复',
  workaround: '有变通方案',
  unresolved: '未解决',
};

/**
 * Meta-info block at the top of every error page. Use instead of the
 * hand-rolled 7-row table so all error pages stay visually consistent.
 *
 * Usage:
 *   <ErrorMeta
 *     component="Claude Code 本体"
 *     version="不限版本"
 *     platform="Linux / macOS / Windows"
 *     date="2026-03-14"
 *     severity="medium"
 *     status="workaround"
 *   />
 */
export function ErrorMeta({
  component,
  version,
  platform,
  date,
  severity,
  status,
  owner,
}: Props) {
  return (
    <aside className={styles.box} aria-label="问题元信息">
      <dl className={styles.list}>
        <Row label="影响组件" value={component} />
        {version ? <Row label="发现版本" value={version} /> : null}
        {platform ? <Row label="系统环境" value={platform} /> : null}
        {date ? <Row label="发现日期" value={<time dateTime={date}>{date}</time>} /> : null}
        {owner ? <Row label="解决人" value={owner} /> : null}
        {severity ? (
          <Row
            label="严重程度"
            value={
              <span className={`${styles.tag} ${styles[`severity-${severity}`]}`}>
                {SEVERITY_LABEL[severity]}
              </span>
            }
          />
        ) : null}
        {status ? (
          <Row
            label="当前状态"
            value={
              <span className={`${styles.tag} ${styles[`status-${status}`]}`}>
                {STATUS_LABEL[status]}
              </span>
            }
          />
        ) : null}
      </dl>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
