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
    null
  );
  const [maskRect, setMaskRect] = useState<DOMRect | null>(null);

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
    const canvas = canvasRef.current;

    if (!canvas || !imageSize) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  // 描画イベント
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getImageCoords(e);

    setStartPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !imageSize) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const pos = getImageCoords(e);
    const x = startPos.x;
    const y = startPos.y;
    const w = pos.x - x;
    const h = pos.y - y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imgEl = imageRef.current;

    if (imgEl) {
      ctx.drawImage(imgEl, 0, 0, imageSize.width, imageSize.height);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(x, y, w, h);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!startPos) return;
    const pos = getImageCoords(e);
    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const width = Math.abs(pos.x - startPos.x);
    const height = Math.abs(pos.y - startPos.y);

    setMaskRect(new DOMRect(x, y, width, height));
    setIsDrawing(false);
    setStartPos(null);
  };

  // 出力用関数
  const handleSubmit = async () => {
    if (!maskRect || !imageRef.current || !imageSize) return;

    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = imageSize.width;
    tempCanvas.height = imageSize.height;

    const ctx = tempCanvas.getContext("2d");

    if (!ctx) return;

    // 元画像を描画
    ctx.drawImage(imageRef.current, 0, 0, imageSize.width, imageSize.height);

    // マスク部分を黒塗り
    ctx.fillStyle = "black";
    ctx.fillRect(maskRect.x, maskRect.y, maskRect.width, maskRect.height);

    // ファイルに変換して送出
    const dataUrl = tempCanvas.toDataURL("image/png");
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const file = new File([blob], "masked.png", { type: "image/png" });

    onSubmit(file);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalBody>
          <div className="relative w-full">
            <img
              ref={imageRef}
              alt="mask target"
              className="w-full h-auto object-contain pointer-events-none"
              src={src}
              style={{ display: imageSize ? "block" : "none" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ display: imageSize ? "block" : "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" disabled={!maskRect} onPress={handleSubmit}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
