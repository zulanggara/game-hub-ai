import { useReducer } from "react";
import { OdinTableView } from "./OdinTable";
import { initGame, odinReducer, type NewPlayerSpec } from "../engine/reducer";
import type { BotDifficulty } from "../engine/bot";

export interface OdinConfig {
  players: NewPlayerSpec[];
  /** ids that a local human is allowed to act for (1 in solo/bot mode, all in hotseat) */
  controlledIds: string[];
  /** id whose result is recorded against the site profile */
  primaryId: string;
  scoreLimit: number;
  botDifficulty: BotDifficulty;
}

export function LocalOdinTable({
  config,
  onExit,
  onGameOver,
}: {
  config: OdinConfig;
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}) {
  const [state, dispatch] = useReducer(odinReducer, undefined, () =>
    initGame(config.players, config.scoreLimit)
  );

  return (
    <OdinTableView
      state={state}
      dispatch={dispatch}
      controlledIds={config.controlledIds}
      primaryId={config.primaryId}
      botDifficulty={config.botDifficulty}
      onExit={onExit}
      onGameOver={onGameOver}
    />
  );
}
