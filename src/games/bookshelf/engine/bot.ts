import type { BookshelfState } from "./types";

export interface BookshelfBotChoice {
  action: "choose";
  cardId: string;
}

export interface BookshelfBotAttempt {
  action: "attempt";
  accuracy: number;
}

export function botChooseCard(state: BookshelfState): BookshelfBotChoice {
  const choices = state.choices!;
  const safer = choices[0].level <= choices[1].level ? choices[0] : choices[1];
  return { action: "choose", cardId: safer.id };
}

/** Bots "attempt" the balance mini-game with a simulated hand — a triangular
 * distribution peaked around a middling accuracy, occasionally excellent or poor. */
export function botAttemptAccuracy(): BookshelfBotAttempt {
  const roll = (Math.random() + Math.random()) / 2;
  const accuracy = Math.max(0, Math.min(1, Math.pow(roll, 0.7)));
  return { action: "attempt", accuracy };
}
