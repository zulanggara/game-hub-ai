import { useEffect, useState } from "react";
import { TactaTableView } from "./TactaTable";
import { subscribeTactaRoom, sendTactaRoomAction, type TactaRoomDoc } from "../online/room";
import type { TactaAction } from "../engine/reducer";

export function OnlineTactaTable({
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
  const [room, setRoom] = useState<TactaRoomDoc | null>(null);

  useEffect(() => subscribeTactaRoom(roomCode, setRoom), [roomCode]);

  if (!room?.state) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--ink-dim)" }}>
        Menyambungkan ke room {roomCode}...
      </div>
    );
  }

  const state = room.state;
  const dispatch = (action: TactaAction) => {
    void sendTactaRoomAction(roomCode, state, action);
  };

  return (
    <TactaTableView
      state={state}
      dispatch={dispatch}
      controlledIds={[primaryId]}
      primaryId={primaryId}
      onExit={onExit}
      onGameOver={onGameOver}
    />
  );
}
