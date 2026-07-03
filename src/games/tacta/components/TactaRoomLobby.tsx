import { useEffect, useState } from "react";
import { useProfile } from "../../../lib/profile";
import { isFirebaseConfigured } from "../../../lib/firebase";
import { getClientId } from "../../../lib/clientId";
import {
  addTactaBot,
  createTactaRoom,
  deleteTactaRoom,
  joinTactaRoom,
  leaveTactaRoomLobby,
  removeTactaBot,
  startTactaRoomGame,
  subscribeTactaRoom,
  type TactaRoomDoc,
} from "../online/room";
import type { NewTactaPlayerSpec } from "../engine/reducer";
import { PLAYER_COLORS } from "../palette";
import { OnlineTactaTable } from "./OnlineTactaTable";
import styles from "../../odin/components/OdinRoomLobby.module.css";

type Mode = "menu" | "create" | "join";

function errorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e) return e;
  return "Terjadi kesalahan tak terduga saat menghubungi server room. Coba lagi.";
}

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

export function TactaRoomLobby({
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
  const [room, setRoom] = useState<TactaRoomDoc | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    return subscribeTactaRoom(roomCode, setRoom);
  }, [roomCode]);

  if (!isFirebaseConfigured) {
    return (
      <div className={styles.wrap}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Room Online Belum Aktif</h2>
          <p className={styles.subtitle}>
            Fitur ini butuh backend Firebase yang belum dikonfigurasi di proyek ini. Lihat{" "}
            <code>.env.example</code> di root proyek untuk cara mengaktifkannya.
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
      leaveTactaRoomLobby(roomCode).catch(() => {});
    } else if (roomCode && room?.state?.phase === "game-over") {
      deleteTactaRoom(roomCode).catch(() => {});
    }
    onExit();
  }

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      const code = await createTactaRoom(username ?? "Tuan Rumah");
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
      await joinTactaRoom(code, username ?? "Pemain");
      setRoomCode(code);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  async function handleAddBot() {
    if (!roomCode || !room) return;
    const botNumber = Object.keys(room.bots ?? {}).length + 1;
    setBusy(true);
    try {
      await addTactaBot(roomCode, `AI Tacta ${botNumber}`);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  async function handleStart() {
    if (!roomCode || !room) return;
    const players = Object.entries(room.players ?? {}).map(([id, p]) => ({ id, ...p, kind: "human" as const }));
    const bots = Object.entries(room.bots ?? {}).map(([id, b]) => ({ id, ...b, kind: "bot" as const }));
    const specs: NewTactaPlayerSpec[] = [...players, ...bots]
      .sort((a, b) => a.seat - b.seat)
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length].key,
      }));
    setBusy(true);
    try {
      await startTactaRoomGame(roomCode, specs);
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  if (roomCode && room?.status === "playing" && room.state) {
    return (
      <OnlineTactaTable
        roomCode={roomCode}
        primaryId={clientId}
        onExit={handleExit}
        onGameOver={onGameOver}
      />
    );
  }

  if (roomCode && room) {
    const players = Object.entries(room.players ?? {}).sort((a, b) => a[1].seat - b[1].seat);
    const bots = Object.entries(room.bots ?? {}).sort((a, b) => a[1].seat - b[1].seat);
    const total = players.length + bots.length;
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
            {bots.map(([id, b]) => (
              <li key={id} className={styles.playerRow}>
                {b.name}
                <span className={styles.hostTag}>AI</span>
                {isHost && (
                  <button
                    className={styles.removeBotBtn}
                    onClick={() => removeTactaBot(roomCode, id).catch(() => {})}
                    aria-label={`Hapus ${b.name}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isHost ? (
            <>
              <button className={styles.addBotBtn} disabled={total >= 6 || busy} onClick={handleAddBot}>
                + Tambah AI Tacta
              </button>
              <button className={styles.primaryBtn} disabled={total < 2 || busy} onClick={handleStart}>
                {total < 2 ? "Menunggu peserta lain..." : "Mulai Permainan →"}
              </button>
              <p className={styles.waitNote}>Minimal 2 peserta (manusia/bot), maksimal 6.</p>
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
          <button className={styles.primaryBtn} disabled={busy} onClick={handleCreate}>
            {busy ? "Membuat room..." : "Buat Room →"}
          </button>
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
