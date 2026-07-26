import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '页面不存在',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>页面不存在</h1>
      <p className={styles.desc}>
        请求的文档可能已被移动或重命名。回到首页继续浏览，或试试这些常用入口：
      </p>
      <div className={styles.links}>
        <Link href="/" className={styles.primary}>回到首页</Link>
        <Link href="/claude-code/cli/install" className={styles.secondary}>Claude Code 快速上手</Link>
        <Link href="/claude-code/errors" className={styles.secondary}>排障</Link>
      </div>
    </div>
  );
}
