import { useReducer } from "react";
import { BookshelfTableView } from "./BookshelfTable";
import { initBookshelfGame, bookshelfReducer, type NewBookshelfPlayerSpec } from "../engine/reducer";

export interface BookshelfConfig {
  players: NewBookshelfPlayerSpec[];
  controlledIds: string[];
  primaryId: string;
}

export function LocalBookshelfTable({
  config,
  onExit,
  onGameOver,
}: {
  config: BookshelfConfig;
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}) {
  const [state, dispatch] = useReducer(bookshelfReducer, undefined, () => initBookshelfGame(config.players));

  return (
    <BookshelfTableView
      state={state}
      dispatch={dispatch}
      controlledIds={config.controlledIds}
      onExit={onExit}
      onGameOver={onGameOver}
    />
  );
}
