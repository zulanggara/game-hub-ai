import { useEffect, useState } from "react";
import { useProfile } from "../../../lib/profile";
import { isFirebaseConfigured } from "../../../lib/firebase";
import {
  createRoom,
  deleteRoom,
  getClientId,
  joinRoom,
  leaveRoomLobby,
  startRoomGame,
  subscribeRoom,
  type RoomDoc,
} from "../online/room";
import type { NewPlayerSpec } from "../engine/reducer";
import { OnlineOdinTable } from "./OnlineOdinTable";
import styles from "./OdinRoomLobby.module.css";

type Mode = "menu" | "create" | "join";

function errorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e) return e;
  return "Terjadi kesalahan tak terduga saat menghubungi server room. Coba lagi.";
}

/** navigator.clipboard also requires a secure context (HTTPS/localhost) and
 * silently fails over plain-HTTP LAN access — fall back to a hidden
 * textarea + execCommand so "Salin Kode" still works from a phone on WiFi. */
function copyToClipboard(text: string): boolean {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
    return true;
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function OdinRoomLobby({
  onExit,
  onGameOver,
}: {
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}) {
  const { username } = useProfile();
  const clientId = getClientId();

  const [mode, setMode] = useState<Mode>("menu");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [scoreLimit, setScoreLimit] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    return subscribeRoom(roomCode, setRoom);
  }, [roomCode]);

  if (!isFirebaseConfigured) {
    return (
      <div className={styles.wrap}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Room Online Belum Aktif</h2>
          <p className={styles.subtitle}>
            Fitur ini butuh backend Firebase yang belum dikonfigurasi di proyek ini. Buat
            project Firebase (gratis), aktifkan Realtime Database, lalu isi kredensialnya
            di file <code>.env.local</code> — lihat <code>.env.example</code> untuk daftar
            variabel yang dibutuhkan. Setelah itu restart <code>npm run dev</code>.
          </p>
          <button className={styles.backBtn} onClick={onExit}>
            ‹ Kembali
          </button>
        </div>
      </div>
    );
  }

  function handleExit() {
    if (roomCode && room?.status === "lobby") {
      leaveRoomLobby(roomCode).catch(() => {});
    } else if (roomCode && room?.state?.phase === "game-over") {
      // No TTL on Realtime Database — clean up finished rooms ourselves
      // instead of leaving them behind forever.
      deleteRoom(roomCode).catch(() => {});
    }
    onExit();
  }

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      const code = await createRoom(username ?? "Tuan Rumah", scoreLimit);
      setRoomCode(code);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  async function handleJoin() {
    const code = joinInput.trim().toUpperCase();
    if (code.length < 4) {
      setError("Masukkan kode room yang valid.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinRoom(code, username ?? "Pemain");
      setRoomCode(code);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  async function handleStart() {
    if (!roomCode || !room) return;
    const players = Object.entries(room.players ?? {}).sort((a, b) => a[1].seat - b[1].seat);
    const specs: NewPlayerSpec[] = players.map(([id, p]) => ({
      id,
      name: p.name,
      kind: "human",
    }));
    setBusy(true);
    try {
      await startRoomGame(roomCode, specs, room.scoreLimit);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  if (roomCode && room?.status === "playing" && room.state) {
    return (
      <OnlineOdinTable
        roomCode={roomCode}
        primaryId={clientId}
        onExit={handleExit}
        onGameOver={onGameOver}
      />
    );
  }

  if (roomCode && room) {
    const players = Object.entries(room.players ?? {}).sort((a, b) => a[1].seat - b[1].seat);
    const isHost = room.hostId === clientId;

    return (
      <div className={styles.wrap}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Ruang Tunggu</h2>
          <div className={styles.codeDisplay}>
            <span className={styles.codeValue}>{roomCode}</span>
            <p className={styles.codeHint}>Bagikan kode ini ke teman untuk bergabung.</p>
            <button
              className={styles.copyBtn}
              onClick={() => {
                const ok = copyToClipboard(roomCode);
                setCopied(ok);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Tersalin!" : "Salin Kode"}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <ul className={styles.playerList}>
            {players.map(([id, p]) => (
              <li key={id} className={styles.playerRow}>
                {p.name}
                {id === room.hostId && <span className={styles.hostTag}>Host</span>}
              </li>
            ))}
          </ul>

          {isHost ? (
            <>
              <button
                className={styles.primaryBtn}
                disabled={players.length < 2 || busy}
                onClick={handleStart}
              >
                {players.length < 2 ? "Menunggu pemain lain..." : "Mulai Permainan →"}
              </button>
              <p className={styles.waitNote}>Minimal 2 pemain, maksimal 6.</p>
            </>
          ) : (
            <p className={styles.waitNote}>Menunggu host memulai permainan...</p>
          )}

          <button className={styles.backBtn} onClick={handleExit}>
            ‹ Keluar dari Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Room Online</h2>
        <p className={styles.subtitle}>
          Main lintas perangkat dengan teman lewat kode room — tidak perlu satu ruangan.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        {mode === "menu" && (
          <div className={styles.menuRow}>
            <button className={styles.choiceBtn} onClick={() => setMode("create")}>
              Buat Room Baru
            </button>
            <button className={styles.choiceBtn} onClick={() => setMode("join")}>
              Gabung dengan Kode
            </button>
          </div>
        )}

        {mode === "create" && (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Batas Skor</span>
              <input
                className={styles.input}
                type="number"
                min={5}
                max={30}
                value={scoreLimit}
                onChange={(e) => setScoreLimit(Number(e.target.value))}
              />
            </div>
            <button className={styles.primaryBtn} disabled={busy} onClick={handleCreate}>
              {busy ? "Membuat room..." : "Buat Room →"}
            </button>
          </>
        )}

        {mode === "join" && (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Kode Room</span>
              <input
                className={`${styles.input} ${styles.codeInput}`}
                maxLength={6}
                placeholder="ABC123"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
              />
            </div>
            <button className={styles.primaryBtn} disabled={busy} onClick={handleJoin}>
              {busy ? "Bergabung..." : "Gabung Room →"}
            </button>
          </>
        )}

        <button className={styles.backBtn} onClick={mode === "menu" ? onExit : () => setMode("menu")}>
          ‹ Kembali
        </button>
      </div>
    </div>
  );
}
