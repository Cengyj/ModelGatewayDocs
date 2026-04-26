import React, {type PointerEvent, type ReactNode, useEffect, useRef, useState} from 'react';

type ActiveImage = {
  src: string;
  alt: string;
};

type Point = {
  x: number;
  y: number;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

export default function ImageLightbox() {
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({x: 0, y: 0});
  const dragRef = useRef<{pointerId: number; startX: number; startY: number; origin: Point} | null>(null);

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
      setActiveImage({
        src: target.currentSrc || target.src,
        alt: target.alt || '文档图片',
      });
      setScale(1);
      setOffset({x: 0, y: 0});
    }

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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
  }, [activeImage]);

  function closeLightbox() {
    setActiveImage(null);
    dragRef.current = null;
  }

  function resetView() {
    setScale(1);
    setOffset({x: 0, y: 0});
  }

  function zoomIn() {
    setScale(currentScale => clampScale(currentScale + SCALE_STEP));
  }

  function zoomOut() {
    setScale(currentScale => clampScale(currentScale - SCALE_STEP));
  }

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
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleStageClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeLightbox();
    }
  }

  if (!activeImage) {
    return null;
  }

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="图片预览">
      <div className="image-lightbox__backdrop" onClick={closeLightbox} />
      <div className="image-lightbox__toolbar" role="toolbar" aria-label="图片控制">
        <IconButton label="缩小" title="缩小" onClick={zoomOut}>缩小</IconButton>
        <span className="image-lightbox__scale">{Math.round(scale * 100)}%</span>
        <IconButton label="放大" title="放大" onClick={zoomIn}>放大</IconButton>
        <IconButton label="重置" title="重置" onClick={resetView}>重置</IconButton>
        <IconButton label="关闭" title="关闭" onClick={closeLightbox}>关闭</IconButton>
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
  title,
  onClick,
  children,
}: {
  label: string;
  title: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button className="image-lightbox__button" type="button" aria-label={label} title={title} onClick={onClick}>
      {children}
    </button>
  );
}
