export const SHAPES = ["square", "triangle", "circle"] as const;
export type Shape = (typeof SHAPES)[number];

export interface TactaCard {
  id: string;
  shape: Shape;
  value: number; // 1-6 dots
}

export type PlayerKind = "human" | "bot";

export interface TactaPlayer {
  id: string;
  name: string;
  kind: PlayerKind;
  color: string; // palette key, see components/palette.ts
  deck: TactaCard[]; // deque — only index 0 (top) and last (bottom) are playable
}

export interface BoardCell {
  x: number;
  y: number;
  ownerId: string;
  card: TactaCard;
  /** cards permanently hidden underneath — never interactable again */
  buried: { ownerId: string; card: TactaCard }[];
}

export type Board = Record<string, BoardCell>; // key: `${x},${y}`

export type TactaPhase = "playing" | "game-over";

export interface TactaState {
  players: TactaPlayer[];
  turnOrder: string[];
  activeIndex: number;
  board: Board;
  bounds: { min: number; max: number };
  log: string[];
  phase: TactaPhase;
  winnerId: string | null;
  scores: Record<string, number>;
}

export interface PlayTarget {
  x: number;
  y: number;
}

export type DequeEnd = "top" | "bottom";
