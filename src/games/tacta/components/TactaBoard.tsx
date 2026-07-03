import { useEffect, useMemo, useRef } from "react";
import { cellKey } from "../engine/board";
import type { Board } from "../engine/types";
import { TactaCard } from "./TactaCard";
import styles from "./TactaBoard.module.css";

export function TactaBoard({
  board,
  playerColors,
  validTargets,
  onPlace,
}: {
  board: Board;
  playerColors: Record<string, string>;
  validTargets: Set<string> | null;
  onPlace: (x: number, y: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScroll = useRef(false);

  const cells = Object.values(board);
  const bounds = useMemo(() => {
    if (cells.length === 0) return { minX: -2, maxX: 2, minY: -2, maxY: 2 };
    const xs = cells.map((c) => c.x);
    const ys = cells.map((c) => c.y);
    return {
      minX: Math.min(...xs) - 2,
      maxX: Math.max(...xs) + 2,
      minY: Math.min(...ys) - 2,
      maxY: Math.max(...ys) + 2,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells.length]);

  useEffect(() => {
    if (initialScroll.current || !scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollLeft = el.scrollWidth / 2 - el.clientWidth / 2;
    el.scrollTop = el.scrollHeight / 2 - el.clientHeight / 2;
    initialScroll.current = true;
  }, [bounds]);

  const cols = bounds.maxX - bounds.minX + 1;
  const rows = bounds.maxY - bounds.minY + 1;

  const grid = [];
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const key = cellKey(x, y);
      const cell = board[key];
      const isValid = validTargets?.has(key) ?? false;

      if (cell) {
        grid.push(
          <div
            key={key}
            className={[styles.cellOccupied, isValid ? styles.cellCover : ""].filter(Boolean).join(" ")}
            onClick={isValid ? () => onPlace(x, y) : undefined}
          >
            <TactaCard
              card={cell.card}
              colorKey={cell.ownerId ? playerColors[cell.ownerId] ?? "gold" : "gold"}
              buriedCount={cell.buried.length}
            />
          </div>
        );
      } else {
        grid.push(
          <div
            key={key}
            className={[styles.cellEmpty, isValid ? styles.valid : ""].filter(Boolean).join(" ")}
            onClick={isValid ? () => onPlace(x, y) : undefined}
          />
        );
      }
    }
  }

  return (
    <div className={styles.wrap} ref={scrollRef}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, var(--cell))`, gridTemplateRows: `repeat(${rows}, var(--cell))` }}
      >
        {grid}
      </div>
    </div>
  );
}
