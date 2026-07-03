import { COLORS, type Card } from "./types";

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
    for (let number = 1; number <= 9; number++) {
      deck.push({ id: `${color}-${number}`, color, number });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** For 2-player games, remove two full color sets so the round moves faster. */
export function dealHands(playerCount: number): Card[][] {
  let deck = buildDeck();
  if (playerCount === 2) {
    const removed = new Set(shuffle(COLORS.slice()).slice(0, 2));
    deck = deck.filter((c) => !removed.has(c.color));
  }
  deck = shuffle(deck);
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  const perHand = playerCount === 2 ? deck.length / 2 : 9;
  for (let p = 0; p < playerCount; p++) {
    hands[p] = deck.splice(0, perHand);
  }
  return hands;
}
