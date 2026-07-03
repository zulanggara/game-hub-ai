import type { CardColor, Card as CardModel } from "../engine/types";
import styles from "./Card.module.css";

const COLOR_STYLES: Record<CardColor, { a: string; b: string; glyph: string }> = {
  ember: { a: "#f0a15c", b: "#c9542c", glyph: "M12 2 L20 12 L12 22 L4 12 Z" },
  frost: { a: "#9fc4ea", b: "#5f8fc4", glyph: "M12 2 L12 22 M4 8 L20 16 M20 8 L4 16" },
  moss: { a: "#a9d18f", b: "#5c8a52", glyph: "M12 2 L12 22 M6 6 L18 18 M18 6 L6 18" },
  wine: { a: "#c97a7a", b: "#9a3b3b", glyph: "M4 4 L20 20 M4 20 L20 4" },
  storm: { a: "#a79bd1", b: "#6b5b95", glyph: "M12 2 L4 12 L12 12 L12 22 L20 12 L12 12 Z" },
  gold: { a: "#f2d67e", b: "#c9a227", glyph: "M12 2 L22 12 L12 22 L2 12 Z M12 7 L17 12 L12 17 L7 12 Z" },
};

interface CardProps {
  card: CardModel;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  /** 1-based position of this card in the player's current click order */
  orderBadge?: number;
}

export function Card({ card, selected, disabled, onClick, style, orderBadge }: CardProps) {
  const palette = COLOR_STYLES[card.color];
  return (
    <button
      type="button"
      className={[styles.card, selected ? styles.selected : "", disabled ? styles.disabled : ""]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--card-a" as string]: palette.a, ["--card-b" as string]: palette.b, ...style }}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Kartu ${card.color} ${card.number}`}
    >
      <span className={styles.glyph}>
        <svg viewBox="0 0 24 24">
          <path d={palette.glyph} stroke="#100d05" strokeWidth="1.4" fill="none" />
        </svg>
      </span>
      <span className={`${styles.rune} ${styles.tl}`}>{card.number}</span>
      <span className={styles.number}>{card.number}</span>
      <span className={`${styles.rune} ${styles.br}`}>{card.number}</span>
      {orderBadge != null && <span className={styles.orderBadge}>{orderBadge}</span>}
    </button>
  );
}

export function CardBack({ style }: { style?: React.CSSProperties }) {
  return (
    <div className={styles.back} style={style}>
      <svg viewBox="0 0 32 32">
        <path
          d="M16 3 L16 29 M9 9 L16 15.5 L9 22 M23 9 L16 15.5 L23 22"
          stroke="#d4af37"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
