import { accessibleCards, legalTargetsForShape } from "./board";
import type { DequeEnd, TactaCard, TactaState } from "./types";

export interface TactaBotDecision {
  end: DequeEnd;
  target: { x: number; y: number };
}

export function tactaBotDecide(state: TactaState, botId: string): TactaBotDecision {
  const player = state.players.find((p) => p.id === botId);
  if (!player) return { end: "top", target: { x: 0, y: 0 } };

  const { top, bottom } = accessibleCards(player.deck);
  const options: { end: DequeEnd; card: TactaCard }[] =
    player.deck.length === 1 ? [{ end: "top", card: top }] : [{ end: "top", card: top }, { end: "bottom", card: bottom }];

  let best: { end: DequeEnd; target: { x: number; y: number }; score: number } | null = null;

  for (const opt of options) {
    const targets = legalTargetsForShape(state.board, state.bounds, opt.card.shape);
    for (const t of targets) {
      let score: number;
      if (t.covers) {
        if (t.covers.ownerId === botId) score = -5;
        else if (t.covers.ownerId === "") score = 1; // burying the neutral starter card
        else score = 10 + t.covers.card.value; // attack — prefer high-value targets
      } else {
        score = 3 - opt.card.value * 0.2; // prefer unloading low-value cards onto open board
      }
      score += Math.random() * 0.5;
      if (!best || score > best.score) {
        best = { end: opt.end, target: { x: t.x, y: t.y }, score };
      }
    }
  }

  return best ?? { end: "top", target: { x: 0, y: 1 } };
}
