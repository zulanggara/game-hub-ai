import { get, onDisconnect, onValue, ref, remove, set, update } from "firebase/database";
import { getRoomDatabase } from "../../../lib/firebase";
import { getClientId } from "../../odin/online/room";
import { PLAYER_COLORS } from "../palette";
import { initTactaGame, tactaReducer, type NewTactaPlayerSpec, type TactaAction } from "../engine/reducer";
import type { TactaState } from "../engine/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_SEATS = PLAYER_COLORS.length;

export interface TactaRoomPlayer {
  name: string;
  joinedAt: number;
  seat: number;
}

export interface TactaRoomBot {
  name: string;
  seat: number;
}

export interface TactaRoomDoc {
  createdAt: number;
  hostId: string;
  status: "lobby" | "playing";
  players: Record<string, TactaRoomPlayer>;
  bots: Record<string, TactaRoomBot>;
  state: TactaState | null;
}

function randomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return code;
}

function seatCount(room: Pick<TactaRoomDoc, "players" | "bots">): number {
  return Object.keys(room.players ?? {}).length + Object.keys(room.bots ?? {}).length;
}

export async function createTactaRoom(hostName: string): Promise<string> {
  const db = getRoomDatabase();
  const hostId = getClientId();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const roomRef = ref(db, `tacta-rooms/${code}`);
    const existing = await get(roomRef);
    if (existing.exists()) continue;

    const doc: TactaRoomDoc = {
      createdAt: Date.now(),
      hostId,
      status: "lobby",
      players: { [hostId]: { name: hostName, joinedAt: Date.now(), seat: 0 } },
      bots: {},
      state: null,
    };
    await set(roomRef, doc);
    onDisconnect(ref(db, `tacta-rooms/${code}/players/${hostId}`)).remove();
    return code;
  }
  throw new Error("Gagal membuat kode room, coba lagi.");
}

export async function joinTactaRoom(code: string, name: string): Promise<void> {
  const db = getRoomDatabase();
  const clientId = getClientId();
  const roomRef = ref(db, `tacta-rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room tidak ditemukan. Cek lagi kodenya.");

  const room = snap.val() as TactaRoomDoc;
  if (room.status !== "lobby") throw new Error("Room ini sudah mulai bermain.");
  if (room.players?.[clientId]) return;
  if (seatCount(room) >= MAX_SEATS) throw new Error(`Room sudah penuh (maks ${MAX_SEATS} peserta).`);

  const playerRef = ref(db, `tacta-rooms/${code}/players/${clientId}`);
  await set(playerRef, { name, joinedAt: Date.now(), seat: seatCount(room) } satisfies TactaRoomPlayer);
  onDisconnect(playerRef).remove();
}

export async function addTactaBot(code: string, name: string): Promise<void> {
  const db = getRoomDatabase();
  const roomRef = ref(db, `tacta-rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room tidak ditemukan.");
  const room = snap.val() as TactaRoomDoc;
  if (seatCount(room) >= MAX_SEATS) throw new Error(`Room sudah penuh (maks ${MAX_SEATS} peserta).`);

  const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  await set(ref(db, `tacta-rooms/${code}/bots/${botId}`), {
    name,
    seat: seatCount(room),
  } satisfies TactaRoomBot);
}

export async function removeTactaBot(code: string, botId: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `tacta-rooms/${code}/bots/${botId}`));
}

function normalizeRoom(raw: TactaRoomDoc): TactaRoomDoc {
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
          players: (state.players ?? []).map((p) => ({ ...p, deck: p.deck ?? [] })),
        }
      : null,
  };
}

export function subscribeTactaRoom(code: string, cb: (room: TactaRoomDoc | null) => void): () => void {
  const db = getRoomDatabase();
  const roomRef = ref(db, `tacta-rooms/${code}`);
  const unsub = onValue(roomRef, (snap) =>
    cb(snap.exists() ? normalizeRoom(snap.val() as TactaRoomDoc) : null)
  );
  return () => unsub();
}

export async function startTactaRoomGame(
  code: string,
  players: NewTactaPlayerSpec[]
): Promise<void> {
  const db = getRoomDatabase();
  await update(ref(db, `tacta-rooms/${code}`), {
    status: "playing",
    state: initTactaGame(players),
  });
}

export async function sendTactaRoomAction(
  code: string,
  currentState: TactaState,
  action: TactaAction
): Promise<void> {
  const db = getRoomDatabase();
  const next = tactaReducer(currentState, action);
  if (next === currentState) return;
  await set(ref(db, `tacta-rooms/${code}/state`), next);
}

export async function leaveTactaRoomLobby(code: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `tacta-rooms/${code}/players/${getClientId()}`));
}

export async function deleteTactaRoom(code: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `tacta-rooms/${code}`));
}
