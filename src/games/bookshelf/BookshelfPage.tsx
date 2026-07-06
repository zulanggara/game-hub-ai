import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameTheme } from "../../lib/theme";
import { useProfile } from "../../lib/profile";
import { BookshelfSetup } from "./components/BookshelfSetup";
import { LocalBookshelfTable, type BookshelfConfig } from "./components/LocalBookshelfTable";
import { BookshelfRoomLobby } from "./components/BookshelfRoomLobby";

type Stage = "setup" | "local" | "online";

export function BookshelfPage() {
  useGameTheme("bookshelf");
  const [stage, setStage] = useState<Stage>("setup");
  const [config, setConfig] = useState<BookshelfConfig | null>(null);
  const { recordResult } = useProfile();
  const navigate = useNavigate();

  if (stage === "setup") {
    return (
      <BookshelfSetup
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
      <BookshelfRoomLobby
        onExit={() => setStage("setup")}
        onGameOver={(result) => recordResult("bookshelf", result)}
      />
    );
  }

  return (
    <LocalBookshelfTable
      config={config!}
      onExit={() => navigate("/")}
      onGameOver={(result) => recordResult("bookshelf", result)}
    />
  );
}
