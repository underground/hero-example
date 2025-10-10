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
  const resizeBRRef = useRef<HTMLDivElement>(null); // 右下
  const base = useRef({ x: win.x, y: win.y });

  const { zoom, pan, zoomIn, zoomOut, reset, setPanBase } = usePanZoom(
    imgRef,
    { w: win.w, h: win.h },
    { step: 0.5 }
  );

  // ヘッダー部分のドラッグでウィンドウ移動
  useDrag(handleRef, {
    onDown: () => {
      bringToFront(win.winId);
      base.current = { x: win.x, y: win.y };
      if (zoom > 1) {
        setPanBase(pan);
      }
    },
    onDrag: (_e, { dx, dy }) => {
      let nextX = base.current.x + dx;
      let nextY = base.current.y + dy;
      // 下端がウィンドウを超えないように
      const maxY = window.innerHeight - (win.h + HEADER_H);

      if (nextY > maxY) nextY = maxY;
      if (nextY < 0) nextY = 0;
      updatePos(win.winId, nextX, nextY);
    },
    // onDrag: (_e, { dx, dy }) =>
    //   updatePos(win.winId, base.current.x + dx, base.current.y + dy),
  });

  // 左下（右上固定）リサイズハンドル
  useResizeHandle({
    ref: resizeBLRef,
    win,
    bringToFront,
    updatePos,
    updateSize,
    placement: "top-right",
  });

  // 右下（左上固定）リサイズハンドル
  useResizeHandle({
    ref: resizeBRRef,
    win,
    bringToFront,
    updatePos,
    updateSize,
    placement: "top-left",
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
          onPointerDown={(e) => e.stopPropagation()}
        />
        {/* 右下リサイズハンドル */}
        <div
          ref={resizeBRRef}
          className="
              absolute bottom-0 right-0
              translate-x-1/2 translate-y-1/2
              h-8 w-8 rounded bg-gray-500
              cursor-nwse-resize
              touch-none z-10
            "
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const useResizeHandle = ({
  ref,
  win,
  bringToFront,
  updatePos,
  updateSize,
  placement, // "top-right" | "top-left"
}: {
  ref: React.RefObject<HTMLDivElement>;
  win: Win;
  bringToFront: (id: string) => void;
  updatePos: (id: string, x: number, y: number) => void;
  updateSize: (id: string, w: number, h: number) => void;
  placement: "top-right" | "top-left";
}) => {
  type ResizeStart = {
    width: number;
    height: number;
    fixedX: number;
    fixedTop: number;
    isRightFixed: boolean;
  };
  const resizeStart = useRef<ResizeStart | null>(null);

  useDrag(ref, {
    onDown: (e) => {
      e.stopPropagation();
      bringToFront(win.winId);
      if (placement === "top-right") {
        // 開始位置
        resizeStart.current = {
          width: win.w,
          height: win.h,
          fixedX: win.x + win.w,
          fixedTop: win.y,
          isRightFixed: true,
        };
      } else {
        resizeStart.current = {
          width: win.w,
          height: win.h,
          fixedX: win.x,
          fixedTop: win.y,
          isRightFixed: false,
        };
      }
    },
    onDrag: (_e, { dx, dy }) => {
      const start = resizeStart.current;

      if (!start) {
        return;
      }
      const aspect = start.width / start.height;

      // アスペクト比を保ったリサイズ計算
      const widthFromDx = start.isRightFixed
        ? start.width - dx
        : start.width + dx;
      const heightFromDx = widthFromDx / aspect;
      const heightFromDy = start.height + dy;
      const widthFromDy = heightFromDy * aspect;

      let nextWidth: number;
      let nextHeight: number;
      let nextLeft: number;
      let nextTop: number;

      // 横・縦どちらの変化が大きいかで主軸を決定
      if (Math.abs(dx) > Math.abs(dy)) {
        nextWidth = widthFromDx;
        nextHeight = heightFromDx;
      } else {
        nextHeight = heightFromDy;
        nextWidth = widthFromDy;
      }

      // 最小サイズ制約
      if (nextWidth < MIN_W) {
        nextWidth = MIN_W;
        nextHeight = MIN_W / aspect;
      }
      if (nextHeight < MIN_H) {
        nextHeight = MIN_H;
        nextWidth = MIN_H * aspect;
      }

      nextTop = start.fixedTop;

      if (start.isRightFixed) {
        // 右上固定（左下リサイズ）
        nextLeft = start.fixedX - nextWidth;
        if (nextLeft < 0) {
          nextLeft = 0;
          nextWidth = start.fixedX;
          nextHeight = nextWidth / aspect;
        }
        const maxWidth = Math.max(0, start.fixedX - nextLeft);
        // 下端制約（ヘッダー分も考慮）
        const maxHeight = Math.max(0, window.innerHeight - nextTop - HEADER_H);

        // 横方向の最大制約
        if (nextWidth > maxWidth) {
          nextWidth = maxWidth;
          nextHeight = nextWidth / aspect;
          nextLeft = start.fixedX - nextWidth;
        }
        // 縦方向の最大制約
        if (nextHeight > maxHeight) {
          nextHeight = maxHeight;
          nextWidth = nextHeight * aspect;
          nextLeft = start.fixedX - nextWidth;
          updatePos(win.winId, nextLeft, nextTop);
          updateSize(win.winId, nextWidth, nextHeight);

          return;
        }
      } else {
        // 左上固定（右下リサイズ）
        nextLeft = start.fixedX;
        if (nextLeft + nextWidth > window.innerWidth) {
          nextWidth = window.innerWidth - nextLeft;
          nextHeight = nextWidth / aspect;
        }
        // 下端制約（ヘッダー分も考慮）
        const maxHeight = Math.max(0, window.innerHeight - nextTop - HEADER_H);

        if (nextHeight > maxHeight) {
          nextHeight = maxHeight;
          nextWidth = nextHeight * aspect;
          updatePos(win.winId, nextLeft, nextTop);
          updateSize(win.winId, nextWidth, nextHeight);

          return;
        }
      }

      updatePos(win.winId, nextLeft, nextTop);
      updateSize(win.winId, nextWidth, nextHeight);
    },
  });
};
