import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface GameStats {
  played: number;
  wins: number;
  bestScore: number | null;
  lastPlayedAt: string | null;
}

interface ProfileData {
  username: string | null;
  stats: Record<string, GameStats>;
}

const STORAGE_KEY = "hog:profile";

const emptyStats: GameStats = { played: 0, wins: 0, bestScore: null, lastPlayedAt: null };

function load(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { username: null, stats: {} };
    return JSON.parse(raw) as ProfileData;
  } catch {
    return { username: null, stats: {} };
  }
}

function save(data: ProfileData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface ProfileContextValue {
  username: string | null;
  setUsername: (name: string) => void;
  statsFor: (gameId: string) => GameStats;
  recordResult: (gameId: string, result: { won: boolean; score: number }) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProfileData>(() => load());

  useEffect(() => {
    save(data);
  }, [data]);

  const setUsername = useCallback((name: string) => {
    setData((prev) => ({ ...prev, username: name.trim().slice(0, 18) }));
  }, []);

  const statsFor = useCallback(
    (gameId: string) => data.stats[gameId] ?? emptyStats,
    [data.stats]
  );

  const recordResult = useCallback(
    (gameId: string, result: { won: boolean; score: number }) => {
      setData((prev) => {
        const current = prev.stats[gameId] ?? emptyStats;
        const next: GameStats = {
          played: current.played + 1,
          wins: current.wins + (result.won ? 1 : 0),
          bestScore:
            current.bestScore === null ? result.score : Math.min(current.bestScore, result.score),
          lastPlayedAt: new Date().toISOString(),
        };
        return { ...prev, stats: { ...prev.stats, [gameId]: next } };
      });
    },
    []
  );

  const value = useMemo(
    () => ({ username: data.username, setUsername, statsFor, recordResult }),
    [data.username, setUsername, statsFor, recordResult]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
