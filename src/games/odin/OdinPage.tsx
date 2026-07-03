import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OdinSetup } from "./components/OdinSetup";
import { OdinTable, type OdinConfig } from "./components/OdinTable";
import { useProfile } from "../../lib/profile";

export function OdinPage() {
  const [config, setConfig] = useState<OdinConfig | null>(null);
  const { recordResult } = useProfile();
  const navigate = useNavigate();

  if (!config) {
    return <OdinSetup onStart={setConfig} />;
  }

  return (
    <OdinTable
      config={config}
      onExit={() => navigate("/")}
      onGameOver={(result) => recordResult("odin", result)}
    />
  );
}
