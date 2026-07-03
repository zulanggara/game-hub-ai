import { get, onDisconnect, onValue, ref, remove, set, update } from "firebase/database";
import { getRoomDatabase } from "../../../lib/firebase";
import { getClientId } from "../../../lib/clientId";
import { initGame, odinReducer, type Action, type NewPlayerSpec } from "../engine/reducer";
import type { GameState } from "../engine/types";

export { getClientId };

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

export interface RoomPlayer {
  name: string;
  joinedAt: number;
  seat: number;
}

export interface RoomBot {
  name: string;
  seat: number;
  difficulty: "novice" | "raider" | "jarl";
}

export interface RoomDoc {
  createdAt: number;
  hostId: string;
  status: "lobby" | "playing";
  scoreLimit: number;
  players: Record<string, RoomPlayer>;
  bots: Record<string, RoomBot>;
  state: GameState | null;
}

function randomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function seatCount(room: Pick<RoomDoc, "players" | "bots">): number {
  return Object.keys(room.players ?? {}).length + Object.keys(room.bots ?? {}).length;
}

export async function createRoom(hostName: string, scoreLimit: number): Promise<string> {
  const db = getRoomDatabase();
  const hostId = getClientId();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const roomRef = ref(db, `rooms/${code}`);
    const existing = await get(roomRef);
    if (existing.exists()) continue;

    const doc: RoomDoc = {
      createdAt: Date.now(),
      hostId,
      status: "lobby",
      scoreLimit,
      players: { [hostId]: { name: hostName, joinedAt: Date.now(), seat: 0 } },
      bots: {},
      state: null,
    };
    await set(roomRef, doc);
    onDisconnect(ref(db, `rooms/${code}/players/${hostId}`)).remove();
    return code;
  }
  throw new Error("Gagal membuat kode room, coba lagi.");
}

export async function joinRoom(code: string, name: string): Promise<void> {
  const db = getRoomDatabase();
  const clientId = getClientId();
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room tidak ditemukan. Cek lagi kodenya.");

  const room = snap.val() as RoomDoc;
  if (room.status !== "lobby") throw new Error("Room ini sudah mulai bermain.");
  const players = room.players ?? {};
  if (players[clientId]) return; // already in room (reconnect)
  if (seatCount(room) >= 6) throw new Error("Room sudah penuh (maks 6 peserta).");

  const playerRef = ref(db, `rooms/${code}/players/${clientId}`);
  await set(playerRef, { name, joinedAt: Date.now(), seat: seatCount(room) } satisfies RoomPlayer);
  onDisconnect(playerRef).remove();
}

export async function addBot(
  code: string,
  name: string,
  difficulty: RoomBot["difficulty"]
): Promise<void> {
  const db = getRoomDatabase();
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room tidak ditemukan.");
  const room = snap.val() as RoomDoc;
  if (seatCount(room) >= 6) throw new Error("Room sudah penuh (maks 6 peserta).");

  const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  await set(ref(db, `rooms/${code}/bots/${botId}`), {
    name,
    seat: seatCount(room),
    difficulty,
  } satisfies RoomBot);
}

export async function removeBot(code: string, botId: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `rooms/${code}/bots/${botId}`));
}

/**
 * Firebase Realtime Database silently deletes any empty array/object it's
 * asked to store (e.g. a player's hand going to length 0 when they win a
 * round). Reading that path back gives `undefined` instead of `[]`/`null`,
 * which crashes anything downstream that assumes an array. Restore the
 * shape the reducer/UI expect before handing data back to the app.
 */
function normalizeRoom(raw: RoomDoc): RoomDoc {
  const state = raw.state;
  return {
    ...raw,
    players: raw.players ?? {},
    bots: raw.bots ?? {},
    state: state
      ? {
          ...state,
          turnOrder: state.turnOrder ?? [],
          log: state.log ?? [],
          players: (state.players ?? []).map((p) => ({ ...p, hand: p.hand ?? [] })),
          trick: state.trick
            ? { ...state.trick, combo: { ...state.trick.combo, cards: state.trick.combo.cards ?? [] } }
            : null,
          pendingTake: state.pendingTake
            ? { ...state.pendingTake, options: state.pendingTake.options ?? [] }
            : null,
        }
      : null,
  };
}

export function subscribeRoom(code: string, cb: (room: RoomDoc | null) => void): () => void {
  const db = getRoomDatabase();
  const roomRef = ref(db, `rooms/${code}`);
  const unsub = onValue(roomRef, (snap) =>
    cb(snap.exists() ? normalizeRoom(snap.val() as RoomDoc) : null)
  );
  return () => unsub();
}

export async function startRoomGame(
  code: string,
  players: NewPlayerSpec[],
  scoreLimit: number
): Promise<void> {
  const db = getRoomDatabase();
  await update(ref(db, `rooms/${code}`), {
    status: "playing",
    state: initGame(players, scoreLimit),
  });
}

export async function sendRoomAction(
  code: string,
  currentState: GameState,
  action: Action
): Promise<void> {
  const db = getRoomDatabase();
  const next = odinReducer(currentState, action);
  if (next === currentState) return; // illegal/no-op move, nothing to sync
  await set(ref(db, `rooms/${code}/state`), next);
}

export async function leaveRoomLobby(code: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `rooms/${code}/players/${getClientId()}`));
}

/**
 * Realtime Database has no built-in TTL/auto-expiry — a room lives forever
 * unless something deletes it. There's no server-side sweep here (that
 * needs a scheduled Cloud Function, which needs a billing-enabled Firebase
 * project), so we opportunistically delete rooms once they're no longer
 * useful: when someone leaves after the game has actually finished.
 */
export async function deleteRoom(code: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `rooms/${code}`));
}
