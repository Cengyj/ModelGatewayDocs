import { Children, type ReactNode } from 'react';
import styles from './Steps.module.css';

type StepsProps = {
  children: ReactNode;
};

/**
 * Numbered procedural steps.
 *
 * Usage in MDX:
 *   <Steps>
 *     <Step title="安装">...</Step>
 *     <Step title="配置">...</Step>
 *   </Steps>
 *
 * Or simply wrap consecutive headings+paragraphs:
 *   <Steps>
 *     ### 安装
 *     ...
 *   </Steps>
 */
export function Steps({ children }: StepsProps) {
  return <ol className={styles.steps}>{children}</ol>;
}

type StepProps = {
  title?: string;
  children: ReactNode;
};

export function Step({ title, children }: StepProps) {
  return (
    <li className={styles.step}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <div className={styles.body}>{children}</div>
    </li>
  );
}
