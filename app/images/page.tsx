"use client";
import React, { useRef, useState } from "react";

import { FloatingModal } from "@/app/images/FloatingModal";

const MARGIN = 40;

// 最大サイズ（画像表示エリア）
const MAX_W = 600;
const MAX_H = 600;
const HEADER_H = 30; // ヘッダー分

const DEFAULT_W = 400; // MAX_W の 2/3 くらい
const DEFAULT_H = 300; // 4:3 比率で合わせる
const MIN_W = 200; // これ以下だと操作しづらいので広めに
const MIN_H = 150;

const BASE_Z = 1000; // 最前面の z-index

const fitSize = (nw: number, nh: number, maxW: number, maxH: number) => {
  if (!nw || !nh) return { w: DEFAULT_W, h: DEFAULT_H };
  const r = Math.min(maxW / nw, maxH / nh, 1);

  return {
    w: Math.max(MIN_W, Math.round(nw * r)),
    h: Math.max(MIN_H, Math.round(nh * r)),
  };
};

export default function HeroUIDraggableGallery() {
  const [wins, setWins] = useState<Win[]>([]);
  const zCounter = useRef(BASE_Z);

  const openWin = (src: string, alt?: string) => {
    const existed = wins.find((w) => w.src === src);

    if (existed) {
      setWins((p) => {
        const others = p.filter((w) => w.winId !== existed.winId);

        return [...others, { ...existed, z: ++zCounter.current }];
      });

      return;
    }
    const id = Math.random().toString(36).slice(2);
    const img = new Image();

    img.onload = () => {
      const { w, h } = fitSize(
        img.naturalWidth,
        img.naturalHeight,
        MAX_W,
        MAX_H
      );

      setWins((p) => {
        const offset = p.length;
        const x = window.innerWidth - (w + MARGIN) - offset * MARGIN;
        const y = MARGIN + offset * MARGIN; // 上から8px, 次は+8pxずつ下へ

        return [
          ...p,
          { winId: id, src, alt, x, y, z: ++zCounter.current, w, h },
        ];
      });
    };
    img.src = src;
  };

  // bringToFront: 対象を末尾へ移動（= DOM の最後に）+ z 採番
  const bringToFront = (id: string) =>
    setWins((p) => {
      const target = p.find((w) => w.winId === id);

      if (!target) return p;
      const others = p.filter((w) => w.winId !== id);

      return [...others, { ...target, z: ++zCounter.current }];
    });

  // 絶対座標で受け、画面内にクランプ（ウィンドウ個別のサイズを使う）
  const updatePos = (id: string, x: number, y: number) =>
    setWins((p) =>
      p.map((w) => {
        if (w.winId !== id) return w;
        const maxX = window.innerWidth - w.w;
        const maxY = window.innerHeight - (w.h + HEADER_H);

        return {
          ...w,
          x: Math.max(MARGIN, Math.min(maxX, x)),
          y: Math.max(MARGIN, Math.min(maxY, y)),
        };
      })
    );

  const updateSize = (id, width, height) =>
    setWins((p) =>
      p.map((w) => {
        if (w.winId !== id) return w;

        return {
          ...w,
          w: width,
          h: height,
        };
      })
    );

  const close = (id: string) => setWins((p) => p.filter((w) => w.winId !== id));

  const images = [
    {
      id: "mnt",
      src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=80",
      alt: "Mountain lake (landscape)",
    },
    {
      id: "sea",
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80",
      alt: "Sea waves (landscape)",
    },
    {
      id: "por1",
      src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&q=80",
      alt: "Portrait (tall)",
    },
    {
      id: "desert",
      src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&q=80",
      alt: "Desert highway (ultra-wide)",
    },
    {
      id: "bridge",
      src: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&q=80",
      alt: "Bridge at night (wide)",
    },
    {
      id: "cat",
      src: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?auto=format&q=80",
      alt: "Cat (square-ish)",
    },
    {
      id: "forest",
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&q=80",
      alt: "Forest mist (portrait)",
    },
    {
      id: "dog",
      src: "https://images.unsplash.com/photo-1517817748496-7bac0f9c3f4e?auto=format&q=80",
      alt: "Dog (portrait)",
    },
    {
      id: "food",
      src: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&q=80",
      alt: "Food flatlay (square-ish)",
    },
    {
      id: "books",
      src: "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&q=80",
      alt: "Books stack (portrait)",
    },
    {
      id: "tower",
      src: "https://images.unsplash.com/photo-1558980664-10a1f36f5d9d?auto=format&q=80",
      alt: "Tower (portrait)",
    },
    {
      id: "aerial",
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&q=80",
      alt: "City aerial (landscape)",
    },
    {
      id: "forest-trail",
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&q=80",
      alt: "Forest trail (landscape)",
    },
    {
      id: "lighthouse",
      src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&q=80",
      alt: "Lighthouse (portrait)",
    },
    {
      id: "street-night",
      src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&q=80",
      alt: "Street at night (landscape)",
    },
    {
      id: "waterfall",
      src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&q=80",
      alt: "Waterfall (portrait)",
    },
    {
      id: "leaf",
      src: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&q=80",
      alt: "Leaf macro (square-ish)",
    },
    {
      id: "interior",
      src: "https://images.unsplash.com/photo-1487147264018-f937fba0c817?auto=format&q=80",
      alt: "Architecture interior (landscape)",
    },
    {
      id: "snow",
      src: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&q=80",
      alt: "Snowy mountains (landscape)",
    },
    {
      id: "skyline",
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&q=80",
      alt: "City skyline at sunset (landscape)",
    },
  ];

  return (
    <div className="p-4">
      <input
        className="border px-2 py-1 mb-4"
        placeholder="ここに入力できます"
      />
      <div className="grid grid-cols-2 gap-4">
        {images.map((img) => (
          <img
            key={img.id}
            alt={img.alt}
            className="cursor-pointer rounded"
            src={img.src}
            onClick={() => openWin(img.src, img.alt)}
          />
        ))}
      </div>

      {wins.map((win) => (
        <FloatingModal
          key={win.winId}
          bringToFront={bringToFront}
          close={close}
          updatePos={updatePos}
          updateSize={updateSize}
          win={win}
        />
      ))}

      <div style={{ height: 600 }} />
    </div>
  );
}
