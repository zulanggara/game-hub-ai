import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { isValidGroup, comboValue } from "../engine/combos";
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

  function toggle(id: string) {
    if (!canAct) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const selectedCards = sorted.filter((c) => selected.includes(c.id));
  const validGroup = selectedCards.length > 0 && isValidGroup(selectedCards);
  const value = validGroup ? comboValue(selectedCards) : null;

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

  let hint = "Pilih kartu untuk membuka giliran.";
  if (tableCombo) {
    hint = `Butuh ${tableCombo.cards.length} atau ${tableCombo.cards.length + 1} kartu, nilai lebih dari ${tableCombo.value}.`;
  }
  if (selectedCards.length > 0) {
    if (!validGroup) hint = "Kartu harus warna sama atau angka sama.";
    else if (!sizeOk) hint = `Jumlah kartu harus ${tableCombo ? `${tableCombo.cards.length} atau ${tableCombo.cards.length + 1}` : 1}.`;
    else if (!beatsTable) hint = `Nilai ${value} belum mengalahkan ${tableCombo?.value}.`;
    else hint = `Siap dimainkan — nilai ${value}.`;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.cards}>
        <AnimatePresence initial={false}>
          {sorted.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: selected.includes(card.id) ? -14 : 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                card={card}
                selected={selected.includes(card.id)}
                disabled={!canAct}
                onClick={() => toggle(card.id)}
              />
            </motion.div>
          ))}
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
