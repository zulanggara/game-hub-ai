import { dealHands } from "./deck";
import { isValidGroup, orderedValue, legalCombos } from "./combos";
import type { GameState, Player, PlayerKind } from "./types";

export interface NewPlayerSpec {
  id: string;
  name: string;
  kind: PlayerKind;
}

export function initGame(specs: NewPlayerSpec[], scoreLimit: number): GameState {
  const hands = dealHands(specs.length);
  const players: Player[] = specs.map((spec, i) => ({
    id: spec.id,
    name: spec.name,
    kind: spec.kind,
    hand: hands[i],
    totalScore: 0,
    passedThisTrick: false,
    connected: true,
  }));
  const turnOrder = players.map((p) => p.id);
  return {
    players,
    turnOrder,
    activeIndex: 0,
    trick: null,
    leaderId: turnOrder[0],
    pendingTake: null,
    log: [`Ronde 1 dimulai. ${players[0].name} memimpin.`],
    phase: "playing",
    round: 1,
    scoreLimit,
    roundWinnerId: null,
    gameWinnerId: null,
  };
}

export type Action =
  | { type: "PLAY"; playerId: string; cardIds: string[] }
  | { type: "PASS"; playerId: string }
  | { type: "TAKE_CARD"; playerId: string; cardId: string }
  | { type: "NEXT_ROUND" };

function byId(players: Player[], id: string): Player {
  const p = players.find((pl) => pl.id === id);
  if (!p) throw new Error(`Unknown player ${id}`);
  return p;
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, hand: [...p.hand] })),
    log: [...state.log],
  };
}

function findNextActive(state: GameState): { activeIndex: number; trickEnded: boolean } {
  const n = state.turnOrder.length;
  let idx = state.activeIndex;
  for (let step = 0; step < n; step++) {
    idx = (idx + 1) % n;
    const candidateId = state.turnOrder[idx];
    if (state.trick && candidateId === state.trick.ownerId) {
      return { activeIndex: idx, trickEnded: true };
    }
    const player = byId(state.players, candidateId);
    if (!player.passedThisTrick) {
      return { activeIndex: idx, trickEnded: false };
    }
  }
  return { activeIndex: state.activeIndex, trickEnded: true };
}

function endTrick(state: GameState): GameState {
  const ownerId = state.trick?.ownerId ?? state.leaderId!;
  const ownerIdx = state.turnOrder.indexOf(ownerId);
  return {
    ...state,
    trick: null,
    leaderId: ownerId,
    activeIndex: ownerIdx,
    players: state.players.map((p) => ({ ...p, passedThisTrick: false })),
    log: [...state.log, `${byId(state.players, ownerId).name} memenangkan trik ini.`],
  };
}

function finishRound(state: GameState, winnerId: string): GameState {
  const players = state.players.map((p) => ({
    ...p,
    totalScore: p.totalScore + (p.id === winnerId ? 0 : p.hand.length),
  }));
  const someoneOver = players.some((p) => p.totalScore >= state.scoreLimit);
  const winnerName = byId(players, winnerId).name;
  if (someoneOver) {
    const lowest = [...players].sort((a, b) => a.totalScore - b.totalScore)[0];
    return {
      ...state,
      players,
      phase: "game-over",
      roundWinnerId: winnerId,
      gameWinnerId: lowest.id,
      log: [...state.log, `${winnerName} menghabiskan kartu. Permainan berakhir!`],
    };
  }
  return {
    ...state,
    players,
    phase: "round-over",
    roundWinnerId: winnerId,
    log: [...state.log, `${winnerName} menghabiskan kartu duluan! Ronde ${state.round} selesai.`],
  };
}

export function odinReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "PLAY": {
      if (state.phase !== "playing") return state;
      const activePlayerId = state.turnOrder[state.activeIndex];
      if (activePlayerId !== action.playerId) return state;

      const player = byId(state.players, action.playerId);
      const cards = action.cardIds.map((id) => {
        const c = player.hand.find((h) => h.id === id);
        if (!c) throw new Error("Card not in hand");
        return c;
      });
      if (!isValidGroup(cards)) return state;

      if (state.trick) {
        const size = cards.length;
        if (size !== state.trick.combo.cards.length && size !== state.trick.combo.cards.length + 1)
          return state;
        if (orderedValue(cards) <= state.trick.combo.value) return state;
      }

      const next = cloneState(state);
      const nextPlayer = byId(next.players, action.playerId);
      const cardIds = new Set(action.cardIds);
      const previousComboCards = next.trick?.combo.cards ?? [];
      nextPlayer.hand = nextPlayer.hand.filter((c) => !cardIds.has(c.id));

      const combo = { cards, value: orderedValue(cards) };
      next.trick = { combo, ownerId: action.playerId };
      next.log.push(`${nextPlayer.name} memainkan ${cards.length} kartu (nilai ${combo.value}).`);

      if (nextPlayer.hand.length === 0) {
        return finishRound(next, action.playerId);
      }

      if (previousComboCards.length > 0) {
        next.phase = "awaiting-take";
        next.pendingTake = { forPlayerId: action.playerId, options: previousComboCards };
        return next;
      }

      const { activeIndex, trickEnded } = findNextActive(next);
      next.activeIndex = activeIndex;
      return trickEnded ? endTrick(next) : next;
    }

    case "TAKE_CARD": {
      if (state.phase !== "awaiting-take" || !state.pendingTake) return state;
      if (state.pendingTake.forPlayerId !== action.playerId) return state;
      const isValidOption = state.pendingTake.options.some((c) => c.id === action.cardId);
      if (!isValidOption) return state;

      const next = cloneState(state);
      const player = byId(next.players, action.playerId);
      const chosen = next.pendingTake!.options.find((c) => c.id === action.cardId)!;
      player.hand.push(chosen);
      next.pendingTake = null;
      next.phase = "playing";
      next.log.push(`${player.name} mengambil satu kartu dari tumpukan yang dikalahkan.`);

      const { activeIndex, trickEnded } = findNextActive(next);
      next.activeIndex = activeIndex;
      return trickEnded ? endTrick(next) : next;
    }

    case "PASS": {
      if (state.phase !== "playing" || !state.trick) return state;
      const activePlayerId = state.turnOrder[state.activeIndex];
      if (activePlayerId !== action.playerId) return state;

      const next = cloneState(state);
      const player = byId(next.players, action.playerId);
      player.passedThisTrick = true;
      next.log.push(`${player.name} pass.`);

      const { activeIndex, trickEnded } = findNextActive(next);
      next.activeIndex = activeIndex;
      return trickEnded ? endTrick(next) : next;
    }

    case "NEXT_ROUND": {
      if (state.phase !== "round-over") return state;
      const specs: NewPlayerSpec[] = state.players.map((p) => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
      }));
      const hands = dealHands(specs.length);
      const leaderId = state.roundWinnerId ?? state.turnOrder[0];
      const leaderIdx = state.turnOrder.indexOf(leaderId);
      const players: Player[] = specs.map((spec, i) => {
        const prev = byId(state.players, spec.id);
        return {
          ...spec,
          hand: hands[i],
          totalScore: prev.totalScore,
          passedThisTrick: false,
          connected: true,
        };
      });
      return {
        players,
        turnOrder: state.turnOrder,
        activeIndex: leaderIdx,
        trick: null,
        leaderId,
        pendingTake: null,
        log: [...state.log, `Ronde ${state.round + 1} dimulai. ${byId(players, leaderId).name} memimpin.`],
        phase: "playing",
        round: state.round + 1,
        scoreLimit: state.scoreLimit,
        roundWinnerId: null,
        gameWinnerId: null,
      };
    }

    default:
      return state;
  }
}

export { legalCombos };
