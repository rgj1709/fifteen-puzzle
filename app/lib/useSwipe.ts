import { useRef, useCallback } from "react";

export type Direction = "up" | "down" | "left" | "right";

const MIN_SWIPE_DISTANCE = 30;

export function useTileSwipe(onSwipe: (tileIndex: number, dir: Direction) => void) {
  const touchStart = useRef<{ x: number; y: number; tileIndex: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent, tileIndex: number) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, tileIndex };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const { tileIndex } = touchStart.current;
      touchStart.current = null;

      if (Math.abs(dx) < MIN_SWIPE_DISTANCE && Math.abs(dy) < MIN_SWIPE_DISTANCE) return;

      let dir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? "right" : "left";
      } else {
        dir = dy > 0 ? "down" : "up";
      }

      onSwipe(tileIndex, dir);
    },
    [onSwipe]
  );

  return { onTouchStart, onTouchEnd };
}
