import { useEffect, useState, useRef } from "react";

export const useDrag = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  options: {
    onDown?: (e: PointerEvent, start: { x: number; y: number }) => void;
    onDrag?: (e: PointerEvent, delta: { dx: number; dy: number }) => void;
    onUp?: (e: PointerEvent) => void;
  } = {}
) => {
  const { onDown, onDrag, onUp } = options;
  const [isDragging, setIsDragging] = useState(false);
  const start = useRef({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const handleDown = (e: PointerEvent) => {
      pointerId.current = e.pointerId;
      start.current = { x: e.clientX, y: e.clientY };
      (e.target as Element)?.setPointerCapture?.(e.pointerId);
      setIsDragging(true);
      onDown?.(e, start.current);
    };
    const handleMove = (e: PointerEvent) => {
      if (!isDragging) return;
      if (pointerId.current !== null && e.pointerId !== pointerId.current)
        return;
      onDrag?.(e, {
        dx: e.clientX - start.current.x,
        dy: e.clientY - start.current.y,
      });
    };
    const handleUp = (e: PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      pointerId.current = null;
      onUp?.(e);
    };

    el.addEventListener("pointerdown", handleDown, { passive: false });
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp, { passive: false });
    window.addEventListener("pointercancel", handleUp, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [ref, isDragging, onDown, onDrag, onUp]);

  return { isDragging };
};
