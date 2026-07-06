import { get, onDisconnect, onValue, ref, remove, set, update } from "firebase/database";
import { getRoomDatabase } from "../../../lib/firebase";
import { getClientId } from "../../../lib/clientId";
import {
  initBookshelfGame,
  bookshelfReducer,
  type NewBookshelfPlayerSpec,
  type BookshelfAction,
} from "../engine/reducer";
import type { BookshelfState } from "../engine/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_SEATS = 6;

export interface BookshelfRoomPlayer {
  name: string;
  joinedAt: number;
  seat: number;
}

export interface BookshelfRoomBot {
  name: string;
  seat: number;
}

export interface BookshelfRoomDoc {
  createdAt: number;
  hostId: string;
  status: "lobby" | "playing";
  players: Record<string, BookshelfRoomPlayer>;
  bots: Record<string, BookshelfRoomBot>;
  state: BookshelfState | null;
}

function randomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return code;
}

function seatCount(room: Pick<BookshelfRoomDoc, "players" | "bots">): number {
  return Object.keys(room.players ?? {}).length + Object.keys(room.bots ?? {}).length;
}

export async function createBookshelfRoom(hostName: string): Promise<string> {
  const db = getRoomDatabase();
  const hostId = getClientId();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const roomRef = ref(db, `bookshelf-rooms/${code}`);
    const existing = await get(roomRef);
    if (existing.exists()) continue;

    const doc: BookshelfRoomDoc = {
      createdAt: Date.now(),
      hostId,
      status: "lobby",
      players: { [hostId]: { name: hostName, joinedAt: Date.now(), seat: 0 } },
      bots: {},
      state: null,
    };
    await set(roomRef, doc);
    onDisconnect(ref(db, `bookshelf-rooms/${code}/players/${hostId}`)).remove();
    return code;
  }
  throw new Error("Gagal membuat kode room, coba lagi.");
}

export async function joinBookshelfRoom(code: string, name: string): Promise<void> {
  const db = getRoomDatabase();
  const clientId = getClientId();
  const roomRef = ref(db, `bookshelf-rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room tidak ditemukan. Cek lagi kodenya.");

  const room = snap.val() as BookshelfRoomDoc;
  if (room.status !== "lobby") throw new Error("Room ini sudah mulai bermain.");
  if (room.players?.[clientId]) return;
  if (seatCount(room) >= MAX_SEATS) throw new Error(`Room sudah penuh (maks ${MAX_SEATS} peserta).`);

  const playerRef = ref(db, `bookshelf-rooms/${code}/players/${clientId}`);
  await set(playerRef, { name, joinedAt: Date.now(), seat: seatCount(room) } satisfies BookshelfRoomPlayer);
  onDisconnect(playerRef).remove();
}

export async function addBookshelfBot(code: string, name: string): Promise<void> {
  const db = getRoomDatabase();
  const roomRef = ref(db, `bookshelf-rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room tidak ditemukan.");
  const room = snap.val() as BookshelfRoomDoc;
  if (seatCount(room) >= MAX_SEATS) throw new Error(`Room sudah penuh (maks ${MAX_SEATS} peserta).`);

  const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  await set(ref(db, `bookshelf-rooms/${code}/bots/${botId}`), {
    name,
    seat: seatCount(room),
  } satisfies BookshelfRoomBot);
}

export async function removeBookshelfBot(code: string, botId: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `bookshelf-rooms/${code}/bots/${botId}`));
}

function normalizeRoom(raw: BookshelfRoomDoc): BookshelfRoomDoc {
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
          tower: state.tower ?? [],
          deck: state.deck ?? [],
        }
      : null,
  };
}

export function subscribeBookshelfRoom(
  code: string,
  cb: (room: BookshelfRoomDoc | null) => void
): () => void {
  const db = getRoomDatabase();
  const roomRef = ref(db, `bookshelf-rooms/${code}`);
  const unsub = onValue(roomRef, (snap) =>
    cb(snap.exists() ? normalizeRoom(snap.val() as BookshelfRoomDoc) : null)
  );
  return () => unsub();
}

export async function startBookshelfRoomGame(
  code: string,
  players: NewBookshelfPlayerSpec[]
): Promise<void> {
  const db = getRoomDatabase();
  await update(ref(db, `bookshelf-rooms/${code}`), {
    status: "playing",
    state: initBookshelfGame(players),
  });
}

export async function sendBookshelfRoomAction(
  code: string,
  currentState: BookshelfState,
  action: BookshelfAction
): Promise<void> {
  const db = getRoomDatabase();
  const next = bookshelfReducer(currentState, action);
  if (next === currentState) return;
  await set(ref(db, `bookshelf-rooms/${code}/state`), next);
}

export async function leaveBookshelfRoomLobby(code: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `bookshelf-rooms/${code}/players/${getClientId()}`));
}

export async function deleteBookshelfRoom(code: string): Promise<void> {
  const db = getRoomDatabase();
  await remove(ref(db, `bookshelf-rooms/${code}`));
}
