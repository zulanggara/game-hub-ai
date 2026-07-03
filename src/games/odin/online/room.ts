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

/**
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS / localhost).
 * Visiting the dev server over a plain-HTTP LAN address (e.g. from a phone)
 * is not a secure context, so it's undefined there — fall back to
 * `getRandomValues` (available everywhere) and finally to Math.random.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = generateId();
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
