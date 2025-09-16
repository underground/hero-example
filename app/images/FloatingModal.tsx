import { useRef } from "react";
import Image from "next/image";

import { usePanZoom } from "@/app/images/usePanZoom";
import { useDrag } from "@/app/images/useDrag";

export type Win = {
  winId: string;
  src: string;
  alt?: string;
  x: number;
  y: number;
  z: number;
};

const HEADER_H = 30;

export const FloatingModal = ({
  win,
  bringToFront,
  updatePos,
  close,
}: {
  win: Win;
  bringToFront: (id: string) => void;
  updatePos: (id: string, x: number, y: number) => void;
  close: (id: string) => void;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleRef = useRef<HTMLDivElement>(null); // ドラッグはヘッダーだけで受ける
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
          <Image
            ref={imgRef}
            fill
            alt={win.alt}
            className="w-full object-contain select-none relative z-0"
            draggable={false}
            sizes={`${win.w}px`} // モーダルの幅に合わせて固定幅を指定
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
      </div>
    </div>
  );
};
