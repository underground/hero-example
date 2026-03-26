"use client";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
};

export const MaskImageModal = ({ src, isOpen, onClose, onSubmit }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [maskRects, setMaskRects] = useState<DOMRect[]>([]);

  const [displaySize, setDisplaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const syncDisplaySize = () => {
    const imgEl = imageRef.current;

    if (!imgEl) return;

    setDisplaySize({
      width: imgEl.clientWidth,
      height: imgEl.clientHeight,
    });
  };

  // 初期画像の読み込み
  useEffect(() => {
    if (!src || !isOpen) return;

    const img = new Image();

    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });

      const canvas = canvasRef.current;

      if (canvas) {
        // 実canvasサイズも画像と同じにしておく（描画用）
        canvas.width = img.width;
        canvas.height = img.height;
        requestAnimationFrame(() => {
          syncDisplaySize();
          drawOverlay([], img);
        });

        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      }
    };
  }, [src, isOpen]);

  // canvas 表示サイズ上の座標 → 画像上の実座標へ変換
  const getImageCoords = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const imgEl = imageRef.current;

    if (!imgEl || !imageSize) return { x: 0, y: 0 };

    const rect = imgEl.getBoundingClientRect();

    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    return {
      x: Math.max(0, Math.min(imageSize.width, localX * scaleX)),
      y: Math.max(0, Math.min(imageSize.height, localY * scaleY)),
    };
  };

  const drawOverlay = (
    rects: DOMRect[],
    image: HTMLImageElement,
    preview?: DOMRect,
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    ctx.fillStyle = "black";
    rects.forEach((r) => ctx.fillRect(r.x, r.y, r.width, r.height));

    if (preview) {
      ctx.fillRect(preview.x, preview.y, preview.width, preview.height);
    }
  };

  // 描画イベント
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getImageCoords(e);

    setStartPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !imageSize || !imageRef.current) return;

    const pos = getImageCoords(e);
    const rect = new DOMRect(
      Math.min(startPos.x, pos.x),
      Math.min(startPos.y, pos.y),
      Math.abs(pos.x - startPos.x),
      Math.abs(pos.y - startPos.y),
    );

    drawOverlay(maskRects, imageRef.current, rect);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!startPos) return;
    const pos = getImageCoords(e);

    const newRect = new DOMRect(
      Math.min(startPos.x, pos.x),
      Math.min(startPos.y, pos.y),
      Math.abs(pos.x - startPos.x),
      Math.abs(pos.y - startPos.y),
    );

    const updatedRects = [...maskRects, newRect];

    setMaskRects(updatedRects);
    setIsDrawing(false);
    setStartPos(null);

    if (imageRef.current) {
      drawOverlay(updatedRects, imageRef.current);
    }
  };

  // 出力用関数
  const handleSubmit = async () => {
    if (!maskRects.length || !imageRef.current || !imageSize) return;

    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = imageSize.width;
    tempCanvas.height = imageSize.height;

    const ctx = tempCanvas.getContext("2d");

    if (!ctx) return;

    // 元画像を描画
    ctx.drawImage(imageRef.current, 0, 0, imageSize.width, imageSize.height);

    // マスク部分を黒塗り
    ctx.fillStyle = "black";
    maskRects.forEach((r) => ctx.fillRect(r.x, r.y, r.width, r.height));

    // ファイルに変換して送出
    const dataUrl = tempCanvas.toDataURL("image/png");
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const file = new File([blob], "masked.png", { type: "image/png" });

    onSubmit(file);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setMaskRects([]);
    if (imageRef.current) {
      drawOverlay([], imageRef.current);
    }
  };

  const handleImageLoad = () => {
    const imgEl = imageRef.current;
    const canvas = canvasRef.current;

    if (!imgEl || !canvas) return;

    setImageSize({
      width: imgEl.naturalWidth,
      height: imgEl.naturalHeight,
    });

    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;

    requestAnimationFrame(() => {
      setDisplaySize({
        width: imgEl.clientWidth,
        height: imgEl.clientHeight,
      });
      drawOverlay([], imgEl);
    });
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalBody className="overflow-hidden">
          <div className="flex justify-center items-center w-full h-[70vh] overflow-hidden">
            <div className="relative inline-block max-w-full max-h-full">
              <img
                ref={imageRef}
                alt="mask target"
                className="block max-w-full max-h-[70vh] w-auto h-auto object-contain pointer-events-none"
                src={src}
                style={{
                  display: imageSize ? "block" : "none",
                  userSelect: "none",
                }}
                onDragStart={(e) => e.preventDefault()}
                onLoad={handleImageLoad}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
                style={{
                  display: imageSize ? "block" : "none",
                  width: displaySize ? `${displaySize.width}px` : undefined,
                  height: displaySize ? `${displaySize.height}px` : undefined,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" variant="light" onPress={handleReset}>
            リセット
          </Button>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            disabled={!maskRects.length}
            onPress={handleSubmit}
          >
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
