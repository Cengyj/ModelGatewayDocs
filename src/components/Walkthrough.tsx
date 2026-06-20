import type { ReactNode } from 'react';
import styles from './Walkthrough.module.css';

type WalkthroughProps = {
  title?: string;
  children: ReactNode;
};

type FrameProps = {
  step?: number | string;
  title: string;
  image?: string;
  imageAlt?: string;
  /**
   * Caption to render *above* the screenshot, alongside the step number.
   * The body (children) renders below the image as the explanation.
   */
  caption?: ReactNode;
  children?: ReactNode;
};

/**
 * Screenshot-driven walkthrough container. Use this for procedures where
 * each step has a screenshot — `<Steps>` is for text-only procedures.
 *
 * Usage:
 *   <Walkthrough title="CC Switch 首次配置">
 *     <Frame title="新建供应商" image="/img/cc-switch/install/step-01.png">
 *       点 "添加配置"，框架选 Claude Code。
 *     </Frame>
 *     <Frame title="选 Micu 预设" image="/img/cc-switch/install/step-02.png">
 *       预设供应商列表里点 `Micu`，Base URL 会自动填入。
 *     </Frame>
 *   </Walkthrough>
 */
export function Walkthrough({ title, children }: WalkthroughProps) {
  return (
    <section className={styles.walk} aria-label={title}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <ol className={styles.list}>{children}</ol>
    </section>
  );
}

export function Frame({ step, title, image, imageAlt, caption, children }: FrameProps) {
  return (
    <li className={styles.frame}>
      <div className={styles.head}>
        {step !== undefined ? <span className={styles.step}>{step}</span> : null}
        <div className={styles.headBody}>
          <h4 className={styles.frameTitle}>{title}</h4>
          {caption ? <p className={styles.caption}>{caption}</p> : null}
        </div>
      </div>
      {image ? (
        <div className={styles.media}>
          <img
            src={image}
            alt={imageAlt ?? title}
            loading="lazy"
            decoding="async"
            className={styles.image}
          />
        </div>
      ) : null}
      {children ? <div className={styles.body}>{children}</div> : null}
    </li>
  );
}
