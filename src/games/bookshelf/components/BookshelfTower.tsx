import { swatchFor } from "../../../lib/palette";
import type { PlacedShelf } from "../engine/types";
import styles from "./BookshelfTower.module.css";

const QUALITY_LABEL: Record<PlacedShelf["quality"], string> = {
  perfect: "Sempurna",
  good: "Mantap",
  risky: "Riskan",
  fail: "Roboh",
};

export function BookshelfTower({
  tower,
  stability,
  targetHeight,
}: {
  tower: PlacedShelf[];
  stability: number;
  targetHeight: number;
}) {
  const stabilityColor = stability > 60 ? "#5c8a52" : stability > 30 ? "#c9a227" : "#9a3b3b";

  return (
    <div className={styles.wrap}>
      <div className={styles.stabilityRow}>
        <span className={styles.stabilityLabel}>STABILITAS</span>
        <div className={styles.stabilityBar}>
          <div
            className={styles.stabilityFill}
            style={{ width: `${stability}%`, background: stabilityColor }}
          />
        </div>
        <span className={styles.stabilityLabel}>{stability}%</span>
      </div>

      <div className={styles.towerScroll}>
        {tower.length === 0 ? (
          <p className={styles.emptyNote}>Rak masih kosong — mulai tumpuk bukunya!</p>
        ) : (
          tower.map((shelf, i) => (
            <div key={i} className={styles.shelfRow}>
              {i === tower.length - 1 && <span className={styles.cat}>🐱</span>}
              <span className={styles.shelfIndex}>#{i + 1}</span>
              <span className={styles.shelfBooks}>
                {shelf.card.books.flatMap((g, gi) =>
                  Array.from({ length: g.count }, (_, bi) => (
                    <span
                      key={`${gi}-${bi}`}
                      className={styles.book}
                      style={{
                        background: `linear-gradient(160deg, ${swatchFor(g.color).a}, ${swatchFor(g.color).b})`,
                      }}
                    />
                  ))
                )}
              </span>
              <span className={styles.qualityTag}>{QUALITY_LABEL[shelf.quality]}</span>
            </div>
          ))
        )}
      </div>
      <p className={styles.emptyNote}>
        {tower.length}/{targetHeight} rak
      </p>
    </div>
  );
}
