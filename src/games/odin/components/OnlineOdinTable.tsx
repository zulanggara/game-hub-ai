import { useEffect, useState } from "react";
import { OdinTableView } from "./OdinTable";
import { subscribeRoom, sendRoomAction, type RoomDoc } from "../online/room";
import type { Action } from "../engine/reducer";

export function OnlineOdinTable({
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
  const [room, setRoom] = useState<RoomDoc | null>(null);

  useEffect(() => subscribeRoom(roomCode, setRoom), [roomCode]);

  if (!room?.state) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--ink-dim)" }}>
        Menyambungkan ke room {roomCode}...
      </div>
    );
  }

  const state = room.state;
  const dispatch = (action: Action) => {
    void sendRoomAction(roomCode, state, action);
  };

  return (
    <OdinTableView
      state={state}
      dispatch={dispatch}
      controlledIds={[primaryId]}
      primaryId={primaryId}
      botDifficulty="raider"
      onExit={onExit}
      onGameOver={onGameOver}
    />
  );
}
