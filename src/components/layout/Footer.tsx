import Link from 'next/link';
import { site, operator } from '@/lib/site';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.message}>{site.footer.message}</p>
        <p className={styles.identity}>
          foropencode.com 网关的配套中文配置文档，并非 OpenAI、Anthropic 或文中其他产品的官方网站。
          本站不托管客户端安装包，也不要求在文档页面上传 API Key。
        </p>
        {operator.legalName ? (
          <p className={styles.identity}>运营方：{operator.legalName}</p>
        ) : null}
        {operator.supportChannels ? (
          <p className={styles.identity}>联系与售后：{operator.supportChannels}</p>
        ) : null}
        <nav className={styles.links} aria-label="站点信息">
          <Link href="/site-info#about">关于本站</Link>
          <Link href="/site-info#downloads">安全下载</Link>
          <Link href="/site-info#privacy">隐私说明</Link>
          <Link href="/site-info#terms">使用条款</Link>
          <Link href="/site-info#contact">联系与纠错</Link>
          {operator.contactEmail ? (
            <a href={`mailto:${operator.contactEmail}`}>{operator.contactEmail}</a>
          ) : null}
        </nav>
        <p className={styles.copyright}>{site.footer.copyright}</p>
      </div>
    </footer>
  );
}
