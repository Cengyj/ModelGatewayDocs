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
  fixed: '案例中已恢复',
  workaround: '案例中有处理方式',
  unresolved: '仍待核实',
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
            label="案例状态"
            value={
              <span className={`${styles.tag} ${styles[`status-${status}`]}`}>
                {STATUS_LABEL[status]}
              </span>
            }
          />
        ) : null}
      </dl>
      <p className={styles.note}>
        本页记录特定版本与环境中的排障案例，不代表厂商对所有版本确认了相同根因。
        操作前请备份配置，并优先核对页面列出的官方文档。
      </p>
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
