import { SHAPES, type TactaCard } from "./types";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 3 shapes x values 1-6 = 18 cards, matching the physical Tacta deck size. */
export function buildTactaDeck(ownerId: string): TactaCard[] {
  const cards: TactaCard[] = [];
  for (const shape of SHAPES) {
    for (let value = 1; value <= 6; value++) {
      cards.push({ id: `${ownerId}-${shape}-${value}`, shape, value });
    }
  }
  return shuffle(cards);
}
