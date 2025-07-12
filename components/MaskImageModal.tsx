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

type Point = { x: number; y: number };
type Rect = { start: Point; end: Point };

export const MaskImageModal = ({
  src,
  isOpen,
  onClose,
  onConfirm,
}: {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void; // ★追加
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [currentStart, setCurrentStart] = useState<Point | null>(null); // 今クリック中の始点
  const [rects, setRects] = useState<Rect[]>([]); // 確定済みの矩形一覧

  useEffect(() => {
    const img = imageRef.current;

    if (img) drawAllMasks(img, rects);
  }, [rects]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!currentStart) {
      setCurrentStart({ x, y }); // 1回目クリック: start座標を記録
    } else {
      const newRect = { start: currentStart, end: { x, y } };

      setRects((prev) => [...prev, newRect]); // rect確定
      setCurrentStart(null);
    }
  };

  const drawAllMasks = (img: HTMLImageElement, rects: Rect[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,1)";
    rects.forEach(({ start, end }) => {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      ctx.fillRect(x, y, width, height);
    });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const url = canvas.toDataURL("image/png");

    onConfirm(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalBody>
          <div className="relative min-h-[70vh] overflow-auto flex justify-center">
            <img
              ref={imageRef}
              alt="original"
              className="object-contain max-w-full min-h-[70vh] absolute top-0 left-0 z-0"
              src={src}
            />
            <canvas
              ref={canvasRef}
              className="object-contain max-w-full min-h-[70vh] absolute top-0 left-0 z-0"
              onClick={handleClick}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onClick={handleConfirm}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
