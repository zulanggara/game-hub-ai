import type { TactaCard as TactaCardModel } from "../engine/types";
import { colorFor } from "../palette";
import styles from "./TactaCard.module.css";

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
      <span className={[styles.shapeFill, styles[card.shape]].join(" ")}>
        <span className={styles.value}>{card.value}</span>
      </span>
      {!!buriedCount && <span className={styles.stackBadge}>+{buriedCount}</span>}
    </button>
  );
}
