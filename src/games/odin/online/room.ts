import { get, onDisconnect, onValue, ref, remove, set, update } from "firebase/database";
import { getRoomDatabase } from "../../../lib/firebase";
import { initGame, odinReducer, type Action, type NewPlayerSpec } from "../engine/reducer";
import type { GameState } from "../engine/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
const CLIENT_ID_KEY = "hog:client-id";

export interface RoomPlayer {
  name: string;
  joinedAt: number;
  seat: number;
}

export interface RoomDoc {
  createdAt: number;
  hostId: string;
  status: "lobby" | "playing";
  scoreLimit: number;
  players: Record<string, RoomPlayer>;
  state: GameState | null;
}

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function randomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
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
  if (Object.keys(players).length >= 6) throw new Error("Room sudah penuh (maks 6 pemain).");

  const seat = Object.keys(players).length;
  const playerRef = ref(db, `rooms/${code}/players/${clientId}`);
  await set(playerRef, { name, joinedAt: Date.now(), seat } satisfies RoomPlayer);
  onDisconnect(playerRef).remove();
}

export function subscribeRoom(code: string, cb: (room: RoomDoc | null) => void): () => void {
  const db = getRoomDatabase();
  const roomRef = ref(db, `rooms/${code}`);
  const unsub = onValue(roomRef, (snap) => cb(snap.exists() ? (snap.val() as RoomDoc) : null));
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
