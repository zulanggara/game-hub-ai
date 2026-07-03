import { useReducer } from "react";
import { TactaTableView } from "./TactaTable";
import { initTactaGame, tactaReducer, type NewTactaPlayerSpec } from "../engine/reducer";

export interface TactaConfig {
  players: NewTactaPlayerSpec[];
  controlledIds: string[];
  primaryId: string;
}

export function LocalTactaTable({
  config,
  onExit,
  onGameOver,
}: {
  config: TactaConfig;
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}) {
  const [state, dispatch] = useReducer(tactaReducer, undefined, () => initTactaGame(config.players));

  return (
    <TactaTableView
      state={state}
      dispatch={dispatch}
      controlledIds={config.controlledIds}
      primaryId={config.primaryId}
      onExit={onExit}
      onGameOver={onGameOver}
    />
  );
}
