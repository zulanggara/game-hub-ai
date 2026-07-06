export const BOOK_COLORS = ["ember", "frost", "moss", "wine", "storm", "gold"] as const;
export type BookColor = (typeof BOOK_COLORS)[number];

export interface ShelfCard {
  id: string;
  /** 1-3, how awkward this placement is — shrinks the balance target and costs more stability */
  level: number;
  books: { color: BookColor; count: number }[];
}

export type PlayerKind = "human" | "bot";

export interface BookshelfPlayer {
  id: string;
  name: string;
  kind: PlayerKind;
}

export type Quality = "perfect" | "good" | "risky" | "fail";

export interface PlacedShelf {
  card: ShelfCard;
  placedBy: string;
  quality: Quality;
}

export type BookshelfPhase = "choosing" | "balancing" | "won" | "collapsed";

export interface BookshelfState {
  players: BookshelfPlayer[];
  turnOrder: string[];
  activeIndex: number;
  deck: ShelfCard[];
  choices: [ShelfCard, ShelfCard] | null;
  armed: ShelfCard | null;
  tower: PlacedShelf[];
  stability: number;
  targetHeight: number;
  log: string[];
  phase: BookshelfPhase;
}
