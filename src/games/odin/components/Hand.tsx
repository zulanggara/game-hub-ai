import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { isValidGroup, orderedValue } from "../engine/combos";
import type { Card as CardModel, Combo } from "../engine/types";
import styles from "./Hand.module.css";

interface HandProps {
  cards: CardModel[];
  tableCombo: Combo | null;
  canAct: boolean;
  onPlay: (cardIds: string[]) => void;
  onPass: () => void;
}

export function Hand({ cards, tableCombo, canAct, onPlay, onPass }: HandProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const sorted = useMemo(
    () => [...cards].sort((a, b) => a.color.localeCompare(b.color) || a.number - b.number),
    [cards]
  );
  const byId = useMemo(() => new Map(sorted.map((c) => [c.id, c])), [sorted]);

  function toggle(id: string) {
    if (!canAct) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // Preserve the order cards were clicked in — that order decides the value formed.
  const selectedCards = selected.map((id) => byId.get(id)).filter((c): c is CardModel => !!c);
  const validGroup = selectedCards.length > 0 && isValidGroup(selectedCards);
  const value = validGroup ? orderedValue(selectedCards) : null;

  const sizeOk = tableCombo
    ? selectedCards.length === tableCombo.cards.length ||
      selectedCards.length === tableCombo.cards.length + 1
    : selectedCards.length === 1;

  const beatsTable = tableCombo ? (value ?? -Infinity) > tableCombo.value : true;
  const canSubmit = canAct && validGroup && sizeOk && beatsTable;

  function play() {
    if (!canSubmit) return;
    onPlay(selected);
    setSelected([]);
  }

  let hint = "Klik kartu untuk memimpin trik ini.";
  if (tableCombo) {
    hint = `Butuh ${tableCombo.cards.length} atau ${tableCombo.cards.length + 1} kartu, nilai lebih dari ${tableCombo.value}.`;
  }
  if (selectedCards.length > 0) {
    if (!validGroup) hint = "Kartu harus warna sama atau angka sama.";
    else if (!sizeOk) hint = `Jumlah kartu harus ${tableCombo ? `${tableCombo.cards.length} atau ${tableCombo.cards.length + 1}` : 1}.`;
    else if (!beatsTable) hint = `Nilai ${value} belum mengalahkan ${tableCombo?.value}. Urutan klik menentukan angka!`;
    else hint = `Siap dimainkan — nilai ${value} (urutan klikmu).`;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.cards}>
        <AnimatePresence initial={false}>
          {sorted.map((card) => {
            const orderIdx = selected.indexOf(card.id);
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: orderIdx >= 0 ? -14 : 0 }}
                exit={{ opacity: 0, y: -30, scale: 0.8 }}
                transition={{ duration: 0.25 }}
              >
                <Card
                  card={card}
                  selected={orderIdx >= 0}
                  disabled={!canAct}
                  orderBadge={selectedCards.length > 1 && orderIdx >= 0 ? orderIdx + 1 : undefined}
                  onClick={() => toggle(card.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className={styles.actions}>
        <button className={styles.passBtn} disabled={!canAct || !tableCombo} onClick={onPass}>
          Pass
        </button>
        <span className={styles.hint}>{hint}</span>
        <button className={styles.playBtn} disabled={!canSubmit} onClick={play}>
          Mainkan
        </button>
      </div>
    </div>
  );
}
