import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OdinSetup } from "./components/OdinSetup";
import { LocalOdinTable, type OdinConfig } from "./components/LocalOdinTable";
import { OdinRoomLobby } from "./components/OdinRoomLobby";
import { useProfile } from "../../lib/profile";

type Stage = "setup" | "local" | "online";

export function OdinPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [config, setConfig] = useState<OdinConfig | null>(null);
  const { recordResult } = useProfile();
  const navigate = useNavigate();

  if (stage === "setup") {
    return (
      <OdinSetup
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
      <OdinRoomLobby
        onExit={() => setStage("setup")}
        onGameOver={(result) => recordResult("odin", result)}
      />
    );
  }

  return (
    <LocalOdinTable
      config={config!}
      onExit={() => navigate("/")}
      onGameOver={(result) => recordResult("odin", result)}
    />
  );
}
