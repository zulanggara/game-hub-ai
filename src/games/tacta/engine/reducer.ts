import { buildTactaDeck } from "./deck";
import { accessibleCards, cardForEnd, cellKey, isValidPlacement, randomStarterShape, removeFromEnd, scoreBoard } from "./board";
import type { Board, DequeEnd, PlayerKind, TactaPlayer, TactaState } from "./types";

export interface NewTactaPlayerSpec {
  id: string;
  name: string;
  kind: PlayerKind;
  color: string;
}

const BOUNDS = { min: -10, max: 10 };

function lowestOpener(players: TactaPlayer[]): string {
  let bestId = players[0].id;
  let bestValue = Infinity;
  for (const p of players) {
    const { top, bottom } = accessibleCards(p.deck);
    const lowest = Math.min(top.value, bottom.value);
    if (lowest < bestValue) {
      bestValue = lowest;
      bestId = p.id;
    }
  }
  return bestId;
}

export function initTactaGame(specs: NewTactaPlayerSpec[]): TactaState {
  const players: TactaPlayer[] = specs.map((spec) => ({
    ...spec,
    deck: buildTactaDeck(spec.id),
  }));
  const turnOrder = players.map((p) => p.id);
  const starterId = lowestOpener(players);

  const board: Board = {
    "0,0": {
      x: 0,
      y: 0,
      ownerId: "",
      card: { id: "starter", shape: randomStarterShape(), value: 0 },
      buried: [],
    },
  };

  return {
    players,
    turnOrder,
    activeIndex: turnOrder.indexOf(starterId),
    board,
    bounds: BOUNDS,
    log: [`Kartu pembuka ditaruh di tengah papan. ${players.find((p) => p.id === starterId)!.name} membuka permainan.`],
    phase: "playing",
    winnerId: null,
    scores: scoreBoard(board, turnOrder),
  };
}

export type TactaAction = {
  type: "PLAY";
  playerId: string;
  end: DequeEnd;
  target: { x: number; y: number };
};

function byId(players: TactaPlayer[], id: string): TactaPlayer {
  const p = players.find((pl) => pl.id === id);
  if (!p) throw new Error(`Unknown player ${id}`);
  return p;
}

function findNextActive(state: TactaState): number {
  const n = state.turnOrder.length;
  for (let step = 1; step <= n; step++) {
    const idx = (state.activeIndex + step) % n;
    const player = byId(state.players, state.turnOrder[idx]);
    if (player.deck.length > 0) return idx;
  }
  return state.activeIndex;
}

export function tactaReducer(state: TactaState, action: TactaAction): TactaState {
  if (action.type !== "PLAY") return state;
  if (state.phase !== "playing") return state;
  if (state.turnOrder[state.activeIndex] !== action.playerId) return state;

  const player = byId(state.players, action.playerId);
  const card = cardForEnd(player.deck, action.end);
  if (!card) return state;
  if (!isValidPlacement(state.board, state.bounds, action.target.x, action.target.y, card.shape)) {
    return state;
  }

  const key = cellKey(action.target.x, action.target.y);
  const existing = state.board[key];
  const board: Board = { ...state.board };
  board[key] = existing
    ? {
        x: action.target.x,
        y: action.target.y,
        ownerId: action.playerId,
        card,
        buried: [...existing.buried, { ownerId: existing.ownerId, card: existing.card }],
      }
    : {
        x: action.target.x,
        y: action.target.y,
        ownerId: action.playerId,
        card,
        buried: [],
      };

  const players = state.players.map((p) =>
    p.id === action.playerId ? { ...p, deck: removeFromEnd(p.deck, action.end) } : p
  );

  const log = [
    ...state.log,
    existing
      ? `${player.name} menutup kartu ${existing.card.shape} di (${action.target.x}, ${action.target.y}) dengan ${card.shape} ${card.value}.`
      : `${player.name} memasang ${card.shape} ${card.value} di (${action.target.x}, ${action.target.y}).`,
  ];

  const scores = scoreBoard(board, state.turnOrder);
  const allDone = players.every((p) => p.deck.length === 0);

  if (allDone) {
    const winnerId = players.reduce((best, p) => (scores[p.id] > scores[best.id] ? p : best), players[0]).id;
    return {
      ...state,
      players,
      board,
      log: [...log, `Semua dek habis! ${byId(players, winnerId).name} menang dengan ${scores[winnerId]} poin.`],
      scores,
      phase: "game-over",
      winnerId,
    };
  }

  const next: TactaState = { ...state, players, board, log, scores };
  next.activeIndex = findNextActive(next);
  return next;
}
