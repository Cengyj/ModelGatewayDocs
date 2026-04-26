import React, {type PointerEvent, useCallback, useEffect, useRef, useState} from 'react';

type ActiveImage = {
  src: string;
  alt: string;
};

type Point = {
  x: number;
  y: number;
};

type ToolbarAction = {
  label: string;
  symbol: string;
  onClick: () => void;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;
const INITIAL_OFFSET: Point = {x: 0, y: 0};

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

export default function ImageLightbox() {
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>(INITIAL_OFFSET);
  const dragRef = useRef<{pointerId: number; startX: number; startY: number; origin: Point} | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset(INITIAL_OFFSET);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveImage(null);
    dragRef.current = null;
    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    setScale(currentScale => clampScale(currentScale + SCALE_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(currentScale => clampScale(currentScale - SCALE_STEP));
  }, []);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof HTMLImageElement)) {
        return;
      }

      if (!target.closest('.guide-image')) {
        return;
      }

      event.preventDefault();
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setActiveImage({
        src: target.currentSrc || target.src,
        alt: target.alt || '文档图片',
      });
      resetView();
    }

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [resetView]);

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === '+' || event.key === '=') {
        zoomIn();
      } else if (event.key === '-') {
        zoomOut();
      } else if (event.key === '0') {
        resetView();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImage, closeLightbox, resetView, zoomIn, zoomOut]);

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setScale(currentScale => clampScale(currentScale + direction * SCALE_STEP));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!activeImage) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: offset,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    setOffset({
      x: drag.origin.x + event.clientX - drag.startX,
      y: drag.origin.y + event.clientY - drag.startY,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleStageClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeLightbox();
    }
  }

  if (!activeImage) {
    return null;
  }

  const toolbarActions: ReadonlyArray<ToolbarAction> = [
    {label: '缩小', symbol: '−', onClick: zoomOut},
    {label: '放大', symbol: '+', onClick: zoomIn},
    {label: '重置', symbol: '↺', onClick: resetView},
    {label: '关闭', symbol: '×', onClick: closeLightbox},
  ];

  return (
    <div ref={dialogRef} className="image-lightbox" role="dialog" aria-modal="true" aria-label="图片预览" tabIndex={-1}>
      <div className="image-lightbox__backdrop" onClick={closeLightbox} />
      <div className="image-lightbox__toolbar" role="toolbar" aria-label="图片控制">
        <span className="image-lightbox__scale">{Math.round(scale * 100)}%</span>
        {toolbarActions.map(action => (
          <IconButton key={action.label} label={action.label} symbol={action.symbol} onClick={action.onClick} />
        ))}
      </div>
      <div
        className="image-lightbox__stage"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleStageClick}
      >
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          draggable={false}
          style={{transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`}}
        />
      </div>
    </div>
  );
}

function IconButton({
  label,
  symbol,
  onClick,
}: {
  key?: string;
  label: string;
  symbol: string;
  onClick: () => void;
}) {
  return (
    <button className="image-lightbox__button" type="button" aria-label={label} title={label} onClick={onClick}>
      <span aria-hidden="true">{symbol}</span>
    </button>
  );
}
