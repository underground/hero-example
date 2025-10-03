import { useRef } from "react";

import { usePanZoom } from "@/app/images/usePanZoom";
import { useDrag } from "@/app/images/useDrag";

export type Win = {
  winId: string;
  src: string;
  alt?: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
};

const HEADER_H = 30;
const MIN_W = 200;
const MIN_H = 150;

export const FloatingModal = ({
  win,
  bringToFront,
  updatePos,
  updateSize,
  close,
}: {
  win: Win;
  bringToFront: (id: string) => void;
  updatePos: (id: string, x: number, y: number) => void;
  updateSize: (id: string, w: number, h: number) => void;
  close: (id: string) => void;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleRef = useRef<HTMLDivElement>(null); // ドラッグはヘッダーだけで受ける
  const resizeBLRef = useRef<HTMLDivElement>(null); // 左下リサイズハンドル
  const base = useRef({ x: win.x, y: win.y });

  const { zoom, pan, zoomIn, zoomOut, reset, setPanBase } = usePanZoom(
    imgRef,
    { w: win.w, h: win.h },
    { step: 0.5 }
  );

  useDrag(handleRef, {
    onDown: () => {
      bringToFront(win.winId);
      base.current = { x: win.x, y: win.y };
      if (zoom > 1) {
        setPanBase(pan);
      }
    },
    onDrag: (_e, { dx, dy }) =>
      updatePos(win.winId, base.current.x + dx, base.current.y + dy),
  });

  // ─────────────────────────────────────────────
  // 左下ハンドルでリサイズ（bottom-left）
  // ─────────────────────────────────────────────
  const resizeStart = useRef({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useDrag(resizeBLRef, {
    onDown: (e) => {
      e.stopPropagation();
      bringToFront(win.winId);
      resizeStart.current = {
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        fixedRight: win.x + win.w,
        fixedTop: win.y,
      };
    },
    onDrag: (_e, { dx, dy }) => {
      const start = resizeStart.current;
      const aspect = start.width / start.height;

      // 右上座標はリサイズ開始時の値で固定
      const fixedRight = start.fixedRight;
      const fixedTop = start.fixedTop;

      // bottom-left リサイズの基本式（右上固定）
      let nextWidth = start.width - dx;
      let nextHeight = start.height + dy;

      // アスペクト比を保つ
      const widthFromDx = start.width - dx;
      const heightFromDx = widthFromDx / aspect;
      const heightFromDy = start.height + dy;
      const widthFromDy = heightFromDy * aspect;

      if (Math.abs(dx) > Math.abs(dy)) {
        nextWidth = widthFromDx;
        nextHeight = heightFromDx;
      } else {
        nextHeight = heightFromDy;
        nextWidth = widthFromDy;
      }

      // 最小サイズ補正
      if (nextWidth < MIN_W) {
        nextWidth = MIN_W;
        nextHeight = MIN_W / aspect;
      }
      if (nextHeight < MIN_H) {
        nextHeight = MIN_H;
        nextWidth = MIN_H * aspect;
      }

      // 左座標は右端から幅を引いた位置
      let nextLeft = fixedRight - nextWidth;
      let nextTop = fixedTop;

      // 画面境界補正
      if (nextLeft < 0) {
        nextLeft = 0;
        nextWidth = fixedRight;
        nextHeight = nextWidth / aspect;
      }
      const maxWidthByRight = Math.max(0, fixedRight - nextLeft);
      const maxHeightByBottom = Math.max(
        0,
        window.innerHeight - nextTop - HEADER_H
      );

      if (nextWidth > maxWidthByRight) {
        nextWidth = maxWidthByRight;
        nextHeight = nextWidth / aspect;
        nextLeft = fixedRight - nextWidth;
      }
      if (nextHeight > maxHeightByBottom) {
        nextHeight = maxHeightByBottom;
        nextWidth = nextHeight * aspect;
        nextLeft = fixedRight - nextWidth;
      }

      updatePos(win.winId, nextLeft, nextTop);
      updateSize(win.winId, nextWidth, nextHeight);
    },
  });

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      role="presentation"
      style={{ zIndex: win.z }}
      onMouseDown={() => bringToFront(win.winId)}
    >
      <div
        className="pointer-events-auto fixed m-0 p-0 shadow-xl rounded-md overflow-hidden bg-white"
        style={{
          left: win.x,
          top: win.y,
          width: win.w,
          height: win.h + HEADER_H,
        }}
      >
        <div
          ref={handleRef}
          className="flex justify-between items-center bg-black text-white px-2 py-1 cursor-grab select-none z-10 relative"
          role="toolbar"
          style={{ height: HEADER_H }}
        >
          <span className="truncate text-sm">{win.alt}</span>
          <div className="flex items-center gap-1">
            <button
              className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
              onClick={zoomOut}
              onPointerDown={(e) => e.stopPropagation()}
            >
              －
            </button>
            <button
              className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
              onClick={zoomIn}
              onPointerDown={(e) => e.stopPropagation()}
            >
              ＋
            </button>
            <button
              className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
              onClick={reset}
              onPointerDown={(e) => e.stopPropagation()}
            >
              1x
            </button>
            <button
              className="text-xs bg-black/60 rounded px-2 py-0.5 hover:bg-black"
              onClick={() => close(win.winId)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              ✕
            </button>
          </div>
        </div>
        <div
          className={`relative w-full h-[calc(100%-${HEADER_H}px)] bg-black flex items-center justify-center`}
        >
          <img
            ref={imgRef}
            alt={win.alt ?? ""}
            className="w-full object-contain select-none relative z-0"
            draggable={false}
            src={win.src}
            style={{
              objectFit: "contain",
              cursor: zoom > 1 ? "grab" : "default",
              transition: zoom === 1 ? "transform 0.2s ease" : "none",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          />
        </div>
        {/* 左下リサイズハンドル */}
        <div
          ref={resizeBLRef}
          className="
              absolute bottom-0 left-0
              -translate-x-1/2 translate-y-1/2
              h-8 w-8 rounded bg-gray-500
              cursor-nesw-resize
              touch-none z-10
            "
          title="resize from bottom-left"
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
