import type { Card, Combo } from "./types";

function combinations<T>(items: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > items.length) return [];
  const [first, ...rest] = items;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

export function comboValue(cards: Card[]): number {
  if (cards.length === 1) return cards[0].number;
  const digits = cards
    .map((c) => c.number)
    .sort((a, b) => b - a)
    .join("");
  return Number(digits);
}

export function isValidGroup(cards: Card[]): boolean {
  if (cards.length === 1) return true;
  const sameColor = cards.every((c) => c.color === cards[0].color);
  const sameNumber = cards.every((c) => c.number === cards[0].number);
  return sameColor || sameNumber;
}

export function makeCombo(cards: Card[]): Combo | null {
  if (cards.length === 0 || !isValidGroup(cards)) return null;
  return { cards, value: comboValue(cards) };
}

function comboKey(cards: Card[]): string {
  return cards
    .map((c) => c.id)
    .sort()
    .join("|");
}

/** All legal combos a player can make right now, given what's on the table. */
export function legalCombos(hand: Card[], tableCombo: Combo | null): Combo[] {
  if (!tableCombo) {
    return hand.map((card) => ({ cards: [card], value: card.number }));
  }

  const sizes = [tableCombo.cards.length, tableCombo.cards.length + 1].filter(
    (s) => s <= hand.length
  );
  const seen = new Set<string>();
  const results: Combo[] = [];

  const byColor = new Map<string, Card[]>();
  const byNumber = new Map<number, Card[]>();
  for (const card of hand) {
    byColor.set(card.color, [...(byColor.get(card.color) ?? []), card]);
    byNumber.set(card.number, [...(byNumber.get(card.number) ?? []), card]);
  }

  for (const size of sizes) {
    const groups = [...byColor.values(), ...byNumber.values()].filter(
      (g) => g.length >= size
    );
    for (const group of groups) {
      for (const combo of combinations(group, size)) {
        const key = comboKey(combo);
        if (seen.has(key)) continue;
        const value = comboValue(combo);
        if (value > tableCombo.value) {
          seen.add(key);
          results.push({ cards: combo, value });
        }
      }
    }
  }

  return results.sort((a, b) => a.value - b.value);
}

export function canPass(tableCombo: Combo | null): boolean {
  return tableCombo !== null;
}
