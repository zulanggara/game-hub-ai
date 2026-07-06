import { BOOK_COLORS, type ShelfCard } from "./types";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomCard(index: number): ShelfCard {
  const level = 1 + Math.floor(Math.random() * 3);
  const bookCount = 1 + Math.floor(Math.random() * 2);
  const books = Array.from({ length: bookCount }, () => ({
    color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
    count: 1 + Math.floor(Math.random() * level),
  }));
  return { id: `shelf-${index}`, level, books };
}

/** Generous supply — a winning game only ever needs 8 successful turns (16 cards). */
export function buildShelfDeck(): ShelfCard[] {
  const deck = Array.from({ length: 30 }, (_, i) => randomCard(i));
  return shuffle(deck);
}
