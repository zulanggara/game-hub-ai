import { useEffect, useRef, useState } from "react";
import styles from "./BalanceChallenge.module.css";

const BASE_HALF_WIDTH = 44;
const MIN_HALF_WIDTH = 12;

export function BalanceChallenge({
  level,
  height,
  stability,
  canAct,
  onResult,
}: {
  level: number;
  height: number;
  stability: number;
  canAct: boolean;
  onResult: (accuracy: number) => void;
}) {
  const [pos, setPos] = useState(50);
  const [resolved, setResolved] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const halfWidth = Math.max(
    MIN_HALF_WIDTH,
    BASE_HALF_WIDTH - height * 2.2 - level * 4 - (100 - stability) * 0.15
  );
  const speed = 1.5 + level * 0.35;
  const amplitude = 46;

  useEffect(() => {
    if (!canAct || resolved) return;
    function tick(t: number) {
      if (startRef.current === null) startRef.current = t;
      const elapsed = (t - startRef.current) / 1000;
      setPos(50 + amplitude * Math.sin(elapsed * speed));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [canAct, resolved, speed]);

  function handleTap() {
    if (!canAct || resolved) return;
    setResolved(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const distance = Math.abs(pos - 50);
    const accuracy = Math.max(0, Math.min(1, 1 - distance / (halfWidth * 2.3)));
    onResult(accuracy);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>
        {canAct
          ? "Ketuk tepat saat penunjuk masuk zona keemasan!"
          : "Menunggu pemain lain menyeimbangkan rak..."}
      </p>
      <div className={styles.track}>
        <div
          className={styles.zone}
          style={{ left: `${50 - halfWidth}%`, width: `${halfWidth * 2}%` }}
        />
        <div className={styles.center} />
        <div className={styles.marker} style={{ left: `${Math.max(1, Math.min(99, pos))}%` }} />
      </div>
      {canAct && (
        <button className={styles.tapBtn} onClick={handleTap} disabled={resolved}>
          Ketuk!
        </button>
      )}
    </div>
  );
}
