import type { Shape, TactaCard as TactaCardModel } from "../engine/types";
import { colorFor } from "../palette";
import styles from "./TactaCard.module.css";

function ShapeGlyph({ shape }: { shape: Shape }) {
  if (shape === "square") {
    return (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="5" width="14" height="14" fill="#100d05" opacity="0.75" />
      </svg>
    );
  }
  if (shape === "circle") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="#100d05" opacity="0.75" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24">
      <polygon points="12,4 21,20 3,20" fill="#100d05" opacity="0.75" />
    </svg>
  );
}

export function TactaCard({
  card,
  colorKey,
  onClick,
  dim,
  buriedCount,
}: {
  card: TactaCardModel;
  colorKey: string;
  onClick?: () => void;
  dim?: boolean;
  buriedCount?: number;
}) {
  const palette = colorFor(colorKey);
  return (
    <button
      type="button"
      className={[styles.card, onClick ? styles.interactive : "", dim ? styles.dim : ""].join(" ")}
      style={{ ["--card-a" as string]: palette.a, ["--card-b" as string]: palette.b }}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`Kartu ${card.shape} nilai ${card.value}`}
    >
      <span className={styles.shape}>
        <ShapeGlyph shape={card.shape} />
      </span>
      <span className={styles.value}>{card.value}</span>
      {!!buriedCount && <span className={styles.stackBadge}>+{buriedCount}</span>}
    </button>
  );
}
