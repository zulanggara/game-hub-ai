import { SHAPES, type Board, type BoardCell, type DequeEnd, type Shape, type TactaCard } from "./types";

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function accessibleCards(deck: TactaCard[]): { top: TactaCard; bottom: TactaCard } {
  return { top: deck[0], bottom: deck[deck.length - 1] };
}

export function cardForEnd(deck: TactaCard[], end: DequeEnd): TactaCard | null {
  if (deck.length === 0) return null;
  return end === "top" ? deck[0] : deck[deck.length - 1];
}

export function removeFromEnd(deck: TactaCard[], end: DequeEnd): TactaCard[] {
  return end === "top" ? deck.slice(1) : deck.slice(0, -1);
}

function neighborCount(board: Board, x: number, y: number): number {
  return [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ].filter(([nx, ny]) => board[cellKey(nx, ny)]).length;
}

/**
 * A card may cover an existing uncovered card of the same shape (attack /
 * self-defense), or land on an empty cell that touches at most one existing
 * card — mirroring the physical rule "a card may only touch one other card".
 */
export function isValidPlacement(
  board: Board,
  bounds: { min: number; max: number },
  x: number,
  y: number,
  shape: Shape
): boolean {
  if (x < bounds.min || x > bounds.max || y < bounds.min || y > bounds.max) return false;
  const existing = board[cellKey(x, y)];
  if (existing) return existing.card.shape === shape;
  return neighborCount(board, x, y) <= 1;
}

export function legalTargetsForShape(
  board: Board,
  bounds: { min: number; max: number },
  shape: Shape
): { x: number; y: number; covers: BoardCell | null }[] {
  const targets: { x: number; y: number; covers: BoardCell | null }[] = [];
  for (let x = bounds.min; x <= bounds.max; x++) {
    for (let y = bounds.min; y <= bounds.max; y++) {
      const existing = board[cellKey(x, y)];
      if (existing) {
        if (existing.card.shape === shape) targets.push({ x, y, covers: existing });
      } else if (neighborCount(board, x, y) <= 1) {
        targets.push({ x, y, covers: null });
      }
    }
  }
  return targets;
}

export function scoreBoard(board: Board, playerIds: string[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const id of playerIds) scores[id] = 0;
  for (const cell of Object.values(board)) {
    if (cell.ownerId && scores[cell.ownerId] !== undefined) {
      scores[cell.ownerId] += cell.card.value;
    }
  }
  return scores;
}

export function randomStarterShape(): Shape {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}
