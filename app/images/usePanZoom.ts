import { useEffect, useRef, useState } from "react";

import { useDrag } from "@/app/images/useDrag";

export type Pan = { x: number; y: number };

export type PanZoomOptions = {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
};

/**
 * 画像要素用の Pan/Zoom Hook
 */
export function usePanZoom<T extends HTMLElement>(
  ref: React.RefObject<T>,
  viewport: { w: number; h: number },
  opts: PanZoomOptions = {}
) {
  const { initialZoom = 1, minZoom = 1, maxZoom = 4, step = 0.25 } = opts;

  const [zoom, setZoom] = useState<number>(initialZoom);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });

  const panBase = useRef<Pan>({ x: 0, y: 0 });

  const clampPan = (z: number, p: Pan) => {
    const maxX = (viewport.w * (z - 1)) / 2;
    const maxY = (viewport.h * (z - 1)) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    };
  };

  // ズームが変わったら pan を再クランプ（等倍ならリセット）
  useEffect(() => {
    if (zoom <= 1) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan((p) => clampPan(zoom, p));
    }
  }, [zoom]);

  useDrag(ref, {
    onDown: () => {
      if (zoom > 1) panBase.current = { ...pan };
    },
    onDrag: (_e, { dx, dy }) => {
      if (zoom <= 1) {
        return;
      }
      const next = { x: panBase.current.x + dx, y: panBase.current.y + dy };

      setPan(clampPan(zoom, next));
    },
    onUp: () => {
      // ここでは何もしない。クリック抑止は onClick 側で movedRef を見る
    },
  });

  const setZoomAbs = (z: number) =>
    setZoom(Math.max(minZoom, Math.min(maxZoom, z)));

  const zoomIn = () => setZoomAbs(zoom + step);
  const zoomOut = () => setZoomAbs(zoom - step);
  const reset = () => {
    setZoomAbs(1);
    setPan({ x: 0, y: 0 });
  };
  const setPanBase = (p: Pan) => {
    panBase.current = { ...p };
  };

  return {
    zoom,
    pan,
    zoomIn,
    zoomOut,
    reset,
    setPanBase,
  };
}
