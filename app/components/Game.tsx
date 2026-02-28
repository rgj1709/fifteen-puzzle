"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  shuffleBoard,
  moveTile,
  canMove,
  canSwipeTile,
  isWon,
  getMovableTile,
  type Board,
} from "../lib/puzzle";
import { useTileSwipe } from "../lib/useSwipe";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Game() {
  const [board, setBoard] = useState<Board | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize board on client only to avoid hydration mismatch
  useEffect(() => {
    setBoard(shuffleBoard());
  }, []);

  // Timer
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, won]);

  const handleMove = useCallback(
    (tileIndex: number) => {
      if (!board || won) return;
      if (!canMove(board, tileIndex)) return;

      if (!started) setStarted(true);

      const newBoard = moveTile(board, tileIndex);
      setBoard(newBoard);
      setMoves((m) => m + 1);

      if (isWon(newBoard)) setWon(true);
    },
    [board, won, started]
  );

  const handleTileSwipe = useCallback(
    (tileIndex: number, dir: "up" | "down" | "left" | "right") => {
      if (!board) return;
      if (canSwipeTile(board, tileIndex, dir)) {
        handleMove(tileIndex);
      }
    },
    [board, handleMove]
  );

  const { onTouchStart, onTouchEnd } = useTileSwipe(handleTileSwipe);

  const newGame = useCallback(() => {
    setBoard(shuffleBoard());
    setMoves(0);
    setElapsed(0);
    setStarted(false);
    setWon(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!board) return;
      const dirMap: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = dirMap[e.key];
      if (!dir) return;
      e.preventDefault();
      const tileIdx = getMovableTile(board, dir);
      if (tileIdx !== null) handleMove(tileIdx);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [board, handleMove]);

  // Show empty board shape while loading on client
  if (!board) {
    return (
      <div className="flex flex-col items-center gap-5 w-full px-4">
        <div className="flex gap-8 text-lg font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm uppercase tracking-wide">Moves</span>
            <span className="font-mono text-xl">0</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm uppercase tracking-wide">Time</span>
            <span className="font-mono text-xl">0:00</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 bg-slate-200 rounded-xl w-full max-w-[340px] aspect-square" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full px-4">
      {/* Stats */}
      <div className="flex gap-8 text-lg font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm uppercase tracking-wide">Moves</span>
          <span className="font-mono text-xl">{moves}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm uppercase tracking-wide">Time</span>
          <span className="font-mono text-xl">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-4 gap-2 p-2 bg-slate-200 rounded-xl w-full max-w-[340px] aspect-square">
        {board.map((tile, idx) => {
          if (tile === 0) {
            return <div key="empty" className="rounded-lg" />;
          }

          return (
            <button
              key={tile}
              onClick={() => handleMove(idx)}
              onTouchStart={(e) => onTouchStart(e, idx)}
              onTouchEnd={onTouchEnd}
              className={`
                rounded-lg font-bold text-2xl
                flex items-center justify-center
                min-h-[60px]
                transition-all duration-150 ease-in-out
                cursor-pointer select-none
                touch-manipulation
                ${
                  canMove(board, idx)
                    ? "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95"
                    : "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white/90 shadow-sm"
                }
              `}
            >
              {tile}
            </button>
          );
        })}
      </div>

      {/* New Game Button */}
      <button
        onClick={newGame}
        className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium
                   hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
      >
        New Game
      </button>

      {/* Win Message */}
      {won && (
        <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-xl max-w-[340px] w-full">
          <p className="text-2xl font-bold text-emerald-700 mb-2">
            Congratulations!
          </p>
          <p className="text-emerald-600">
            Solved in <span className="font-mono font-bold">{moves}</span> moves
            and <span className="font-mono font-bold">{formatTime(elapsed)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
