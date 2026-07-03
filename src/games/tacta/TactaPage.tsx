import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameTheme } from "../../lib/theme";
import { useProfile } from "../../lib/profile";
import { TactaSetup } from "./components/TactaSetup";
import { LocalTactaTable, type TactaConfig } from "./components/LocalTactaTable";
import { TactaRoomLobby } from "./components/TactaRoomLobby";

type Stage = "setup" | "local" | "online";

export function TactaPage() {
  useGameTheme("tacta");
  const [stage, setStage] = useState<Stage>("setup");
  const [config, setConfig] = useState<TactaConfig | null>(null);
  const { recordResult } = useProfile();
  const navigate = useNavigate();

  if (stage === "setup") {
    return (
      <TactaSetup
        onStart={(c) => {
          setConfig(c);
          setStage("local");
        }}
        onStartOnline={() => setStage("online")}
      />
    );
  }

  if (stage === "online") {
    return (
      <TactaRoomLobby
        onExit={() => setStage("setup")}
        onGameOver={(result) => recordResult("tacta", result)}
      />
    );
  }

  return (
    <LocalTactaTable
      config={config!}
      onExit={() => navigate("/")}
      onGameOver={(result) => recordResult("tacta", result)}
    />
  );
}
