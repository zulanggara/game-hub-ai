import { buildShelfDeck } from "./deck";
import type { BookshelfState, PlayerKind, Quality } from "./types";

export interface NewBookshelfPlayerSpec {
  id: string;
  name: string;
  kind: PlayerKind;
}

const TARGET_HEIGHT = 8;

function draw2(deck: import("./types").ShelfCard[]): {
  choices: [import("./types").ShelfCard, import("./types").ShelfCard];
  rest: import("./types").ShelfCard[];
} {
  let pool = deck;
  if (pool.length < 2) pool = [...pool, ...buildShelfDeck()];
  const [a, b, ...rest] = pool;
  return { choices: [a, b], rest };
}

export function initBookshelfGame(specs: NewBookshelfPlayerSpec[]): BookshelfState {
  const players = specs.map((s) => ({ ...s }));
  const turnOrder = players.map((p) => p.id);
  const { choices, rest } = draw2(buildShelfDeck());

  return {
    players,
    turnOrder,
    activeIndex: 0,
    deck: rest,
    choices,
    armed: null,
    tower: [],
    stability: 100,
    targetHeight: TARGET_HEIGHT,
    log: [`${players[0].name} memulai rak buku bersama.`],
    phase: "choosing",
  };
}

export type BookshelfAction =
  | { type: "CHOOSE"; playerId: string; cardId: string }
  | { type: "ATTEMPT"; playerId: string; accuracy: number };

function byId<T extends { id: string }>(players: T[], id: string): T {
  const p = players.find((pl) => pl.id === id);
  if (!p) throw new Error(`Unknown player ${id}`);
  return p;
}

function qualityFor(accuracy: number): Quality {
  if (accuracy >= 0.85) return "perfect";
  if (accuracy >= 0.6) return "good";
  if (accuracy >= 0.35) return "risky";
  return "fail";
}

const STABILITY_DELTA: Record<Quality, number> = {
  perfect: 8,
  good: -4,
  risky: -14,
  fail: -100,
};

export function bookshelfReducer(state: BookshelfState, action: BookshelfAction): BookshelfState {
  const activePlayerId = state.turnOrder[state.activeIndex];

  if (action.type === "CHOOSE") {
    if (state.phase !== "choosing" || activePlayerId !== action.playerId || !state.choices) return state;
    const chosen = state.choices.find((c) => c.id === action.cardId);
    if (!chosen) return state;

    const player = byId(state.players, action.playerId);
    return {
      ...state,
      choices: null,
      armed: chosen,
      phase: "balancing",
      log: [...state.log, `${player.name} memilih rak level ${chosen.level}.`],
    };
  }

  if (action.type === "ATTEMPT") {
    if (state.phase !== "balancing" || activePlayerId !== action.playerId || !state.armed) return state;
    const player = byId(state.players, action.playerId);
    const accuracy = Math.max(0, Math.min(1, action.accuracy));
    const quality = qualityFor(accuracy);
    const delta = STABILITY_DELTA[quality];
    const nextStability = Math.max(0, Math.min(100, state.stability + delta));

    const collapsed = quality === "fail" || nextStability <= 0;
    if (collapsed) {
      return {
        ...state,
        stability: 0,
        phase: "collapsed",
        log: [...state.log, `${player.name} menempatkan rak dengan goyah — rak buku roboh!`],
      };
    }

    const tower = [...state.tower, { card: state.armed, placedBy: action.playerId, quality }];
    const qualityLabel: Record<Quality, string> = {
      perfect: "sempurna",
      good: "mantap",
      risky: "riskan tapi selamat",
      fail: "gagal",
    };
    const log = [
      ...state.log,
      `${player.name} menaruh rak ke-${tower.length} — ${qualityLabel[quality]} (stabilitas ${nextStability}).`,
    ];

    if (tower.length >= state.targetHeight) {
      return {
        ...state,
        tower,
        stability: nextStability,
        armed: null,
        phase: "won",
        log: [...log, `Rak buku setinggi ${state.targetHeight} berdiri kokoh — semua menang!`],
      };
    }

    const { choices, rest } = draw2(state.deck);
    const nextIndex = (state.activeIndex + 1) % state.turnOrder.length;
    return {
      ...state,
      tower,
      stability: nextStability,
      armed: null,
      deck: rest,
      choices,
      activeIndex: nextIndex,
      phase: "choosing",
      log,
    };
  }

  return state;
}
