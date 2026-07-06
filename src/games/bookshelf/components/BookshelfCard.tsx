import { swatchFor } from "../../../lib/palette";
import type { ShelfCard } from "../engine/types";
import styles from "./BookshelfCard.module.css";

export function BookshelfCard({
  card,
  onClick,
}: {
  card: ShelfCard;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={[styles.card, onClick ? styles.interactive : styles.static].join(" ")}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className={styles.levelRow}>
        <span className={styles.levelLabel}>Level {card.level}</span>
        <span className={styles.levelDots}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={[styles.levelDot, n <= card.level ? styles.filled : ""].join(" ")} />
          ))}
        </span>
      </div>
      <div className={styles.books}>
        {card.books.flatMap((group, gi) =>
          Array.from({ length: group.count }, (_, i) => {
            const palette = swatchFor(group.color);
            const height = 22 + ((gi + i) % 3) * 6;
            return (
              <span
                key={`${gi}-${i}`}
                className={styles.book}
                style={{ height, background: `linear-gradient(160deg, ${palette.a}, ${palette.b})` }}
              />
            );
          })
        )}
      </div>
    </button>
  );
}
