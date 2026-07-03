import { accessibleCards } from "../engine/board";
import type { DequeEnd, TactaCard as TactaCardModel } from "../engine/types";
import { TactaCard } from "./TactaCard";
import styles from "./TactaHand.module.css";

export function TactaHand({
  deck,
  colorKey,
  canAct,
  selectedEnd,
  onSelectEnd,
}: {
  deck: TactaCardModel[];
  colorKey: string;
  canAct: boolean;
  selectedEnd: DequeEnd | null;
  onSelectEnd: (end: DequeEnd) => void;
}) {
  if (deck.length === 0) {
    return (
      <div className={styles.wrap}>
        <p className={styles.hint}>Dekmu sudah habis — menunggu pemain lain selesai.</p>
      </div>
    );
  }

  const { top, bottom } = accessibleCards(deck);
  const single = deck.length === 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.deque}>
        <Slot
          label="Atas"
          card={top}
          colorKey={colorKey}
          selected={selectedEnd === "top"}
          disabled={!canAct}
          onClick={() => onSelectEnd("top")}
        />
        {!single && (
          <Slot
            label="Bawah"
            card={bottom}
            colorKey={colorKey}
            selected={selectedEnd === "bottom"}
            disabled={!canAct}
            onClick={() => onSelectEnd("bottom")}
          />
        )}
      </div>
      <span className={styles.deckCount}>{deck.length} kartu tersisa di dekmu</span>
      <p className={styles.hint}>
        {selectedEnd
          ? "Ketuk kotak keemasan di papan untuk menempatkan kartu."
          : "Pilih kartu dari ujung atas atau bawah dekmu — bagian tengah dek tidak bisa dilihat."}
      </p>
    </div>
  );
}

function Slot({
  label,
  card,
  colorKey,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  card: TactaCardModel;
  colorKey: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles.slot}>
      <span className={styles.slotLabel}>{label}</span>
      <div className={[styles.slotCard, selected ? styles.selected : ""].join(" ")}>
        <TactaCard card={card} colorKey={colorKey} onClick={disabled ? undefined : onClick} />
      </div>
    </div>
  );
}
