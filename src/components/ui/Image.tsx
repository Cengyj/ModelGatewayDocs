'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import styles from './Image.module.css';

/**
 * Article image. Native lazy loading; click to open in a fullscreen lightbox
 * (Esc or click outside to close).
 */
export function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt = '', src, className, ...rest } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <img
        loading="lazy"
        decoding="async"
        alt={alt}
        src={src}
        className={`${styles.thumb} ${className ?? ''}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={alt ? `放大查看：${alt}` : '放大查看图片'}
        {...rest}
      />
      {open ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={alt || '图片预览'}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className={styles.close}
            aria-label="关闭"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          >
            ✕
          </button>
          <img
            src={src}
            alt={alt}
            className={styles.full}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
