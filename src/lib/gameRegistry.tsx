import type { ComponentType } from "react";

export type GameMode = "single" | "bot" | "multiplayer";

export interface GameDefinition {
  id: string;
  title: string;
  tagline: string;
  description: string;
  accent: string;
  accentSoft: string;
  modes: GameMode[];
  minPlayers: number;
  maxPlayers: number;
  route: string;
  status: "available" | "coming-soon";
  Illustration: ComponentType<{ className?: string }>;
  Play: ComponentType | null;
}

export const modeLabels: Record<GameMode, string> = {
  single: "Latihan Solo",
  bot: "Lawan Bot",
  multiplayer: "Multiplayer",
};

export const modeDescriptions: Record<GameMode, string> = {
  single: "Berlatih sendiri melawan meja kosong untuk memahami alur permainan.",
  bot: "Adu strategi melawan Draugr AI dengan tingkat kesulitan yang bisa diatur.",
  multiplayer: "Mode hotseat — bergiliran di satu perangkat bersama teman.",
};

const registry: GameDefinition[] = [];

export function registerGame(game: GameDefinition) {
  registry.push(game);
}

export function getGames(): GameDefinition[] {
  return registry;
}

export function getGame(id: string): GameDefinition | undefined {
  return registry.find((g) => g.id === id);
}
