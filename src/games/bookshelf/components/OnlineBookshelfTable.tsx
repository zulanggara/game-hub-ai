import { useEffect, useState } from "react";
import { BookshelfTableView } from "./BookshelfTable";
import { subscribeBookshelfRoom, sendBookshelfRoomAction, type BookshelfRoomDoc } from "../online/room";
import type { BookshelfAction } from "../engine/reducer";

export function OnlineBookshelfTable({
  roomCode,
  primaryId,
  onExit,
  onGameOver,
}: {
  roomCode: string;
  primaryId: string;
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}) {
  const [room, setRoom] = useState<BookshelfRoomDoc | null>(null);

  useEffect(() => subscribeBookshelfRoom(roomCode, setRoom), [roomCode]);

  if (!room?.state) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--ink-dim)" }}>
        Menyambungkan ke room {roomCode}...
      </div>
    );
  }

  const state = room.state;
  const dispatch = (action: BookshelfAction) => {
    void sendBookshelfRoomAction(roomCode, state, action);
  };

  return (
    <BookshelfTableView
      state={state}
      dispatch={dispatch}
      controlledIds={[primaryId]}
      onExit={onExit}
      onGameOver={onGameOver}
    />
  );
}
