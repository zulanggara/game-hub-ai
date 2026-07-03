export const COLORS = ["ember", "frost", "moss", "wine", "storm", "gold"] as const;
export type CardColor = (typeof COLORS)[number];

export interface Card {
  id: string;
  color: CardColor;
  number: number; // 1-9
}

export interface Combo {
  cards: Card[];
  value: number; // digits sorted desc, concatenated
}

export type PlayerKind = "human" | "bot";

export interface Player {
  id: string;
  name: string;
  kind: PlayerKind;
  hand: Card[];
  totalScore: number;
  passedThisTrick: boolean;
  connected: boolean;
}

export interface Trick {
  combo: Combo;
  ownerId: string;
}

export type RoundPhase = "playing" | "awaiting-take" | "round-over" | "game-over";

export interface GameState {
  players: Player[];
  turnOrder: string[];
  activeIndex: number;
  trick: Trick | null;
  leaderId: string | null;
  pendingTake: { forPlayerId: string; options: Card[] } | null;
  log: string[];
  phase: RoundPhase;
  round: number;
  scoreLimit: number;
  roundWinnerId: string | null;
  gameWinnerId: string | null;
}
