import { legalCombos } from "./combos";
import type { Card, Combo, GameState } from "./types";

export type BotDifficulty = "novice" | "raider" | "jarl";

export interface BotDecision {
  action: "play" | "pass";
  cardIds?: string[];
}

function pickLowest(combos: Combo[]): Combo {
  return combos.reduce((min, c) => (c.value < min.value ? c : min), combos[0]);
}

function pickHighest(combos: Combo[]): Combo {
  return combos.reduce((max, c) => (c.value > max.value ? c : max), combos[0]);
}

export function botDecide(
  state: GameState,
  botId: string,
  difficulty: BotDifficulty = "raider"
): BotDecision {
  const player = state.players.find((p) => p.id === botId);
  if (!player) return { action: "pass" };

  const tableCombo = state.trick?.combo ?? null;
  const options = legalCombos(player.hand, tableCombo);

  if (options.length === 0) {
    return { action: "pass" };
  }

  const nearlyOut = player.hand.length <= 3;

  if (!tableCombo) {
    // Leading a fresh trick: unload weak singles, or push hard if close to winning.
    const choice = nearlyOut ? pickHighest(options) : pickLowest(options);
    return { action: "play", cardIds: choice.cards.map((c) => c.id) };
  }

  if (difficulty === "novice") {
    const passChance = 0.35;
    if (Math.random() < passChance) return { action: "pass" };
    return { action: "play", cardIds: pickLowest(options).cards.map((c) => c.id) };
  }

  if (difficulty === "jarl") {
    if (nearlyOut) {
      return { action: "play", cardIds: pickHighest(options).cards.map((c) => c.id) };
    }
    // Prefer to extend trick size only when it clears meaningful weight; otherwise smallest legal beat.
    const sameSize = options.filter((o) => o.cards.length === tableCombo.cards.length);
    const choice = sameSize.length > 0 ? pickLowest(sameSize) : pickLowest(options);
    return { action: "play", cardIds: choice.cards.map((c) => c.id) };
  }

  // "raider" — balanced default
  const choice = nearlyOut ? pickHighest(options) : pickLowest(options);
  return { action: "play", cardIds: choice.cards.map((c) => c.id) };
}

export function botChooseTake(options: Card[]): string {
  const lowest = options.reduce((min, c) => (c.number < min.number ? c : min), options[0]);
  return lowest.id;
}
