import { useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "../../../lib/profile";
import { modeLabels, modeDescriptions, type GameMode } from "../../../lib/gameRegistry";
import { OdinIllustration } from "../Illustration";
import type { BotDifficulty } from "../engine/bot";
import type { OdinConfig } from "./LocalOdinTable";
import styles from "./OdinSetup.module.css";

const DIFFICULTIES: { id: BotDifficulty; label: string }[] = [
  { id: "novice", label: "Pemula" },
  { id: "raider", label: "Perampok" },
  { id: "jarl", label: "Jarl" },
];

type MultiKind = "hotseat" | "online";

export function OdinSetup({
  onStart,
  onStartOnline,
}: {
  onStart: (config: OdinConfig) => void;
  onStartOnline: () => void;
}) {
  const { username } = useProfile();
  const playerName = username ?? "Pemain";

  const [mode, setMode] = useState<GameMode>("bot");
  const [botCount, setBotCount] = useState(2);
  const [difficulty, setDifficulty] = useState<BotDifficulty>("raider");
  const [multiKind, setMultiKind] = useState<MultiKind>("hotseat");
  const [multiCount, setMultiCount] = useState(3);
  const [multiNames, setMultiNames] = useState<string[]>(["Pemain 2", "Pemain 3"]);

  function updateMultiCount(delta: number) {
    const next = Math.min(6, Math.max(2, multiCount + delta));
    setMultiCount(next);
    setMultiNames((prev) => {
      const arr = [...prev];
      while (arr.length < next - 1) arr.push(`Pemain ${arr.length + 2}`);
      return arr.slice(0, next - 1);
    });
  }

  function start() {
    if (mode === "single") {
      onStart({
        players: [
          { id: "p-you", name: playerName, kind: "human" },
          { id: "p-bot", name: "Draugr Pemula", kind: "bot" },
        ],
        controlledIds: ["p-you"],
        primaryId: "p-you",
        scoreLimit: 10,
        botDifficulty: "novice",
      });
      return;
    }

    if (mode === "bot") {
      const players = [
        { id: "p-you", name: playerName, kind: "human" as const },
        ...Array.from({ length: botCount }, (_, i) => ({
          id: `p-bot-${i}`,
          name: `Draugr ${i + 1}`,
          kind: "bot" as const,
        })),
      ];
      onStart({
        players,
        controlledIds: ["p-you"],
        primaryId: "p-you",
        scoreLimit: 15,
        botDifficulty: difficulty,
      });
      return;
    }

    // multiplayer hotseat
    const players = [
      { id: "p-1", name: playerName, kind: "human" as const },
      ...multiNames.slice(0, multiCount - 1).map((name, i) => ({
        id: `p-${i + 2}`,
        name: name || `Pemain ${i + 2}`,
        kind: "human" as const,
      })),
    ];
    onStart({
      players,
      controlledIds: players.map((p) => p.id),
      primaryId: "p-1",
      scoreLimit: 15,
      botDifficulty: "raider",
    });
  }

  return (
    <div className={styles.wrap}>
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <OdinIllustration />
        <h1 className={styles.heroTitle}>Odin</h1>
        <p className={styles.heroDesc}>
          Buang kartu secepat mungkin, bentuk kombinasi warna atau angka bernilai
          tinggi, dan rebut kartu lawan yang berhasil kau kalahkan.
        </p>
      </motion.div>

      <div className={styles.tabs}>
        {(Object.keys(modeLabels) as GameMode[]).map((m) => (
          <button
            key={m}
            className={[styles.tab, mode === m ? styles.active : ""].join(" ")}
            onClick={() => setMode(m)}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <motion.div
        key={mode}
        className={styles.panel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p style={{ marginBottom: "1.25rem" }}>{modeDescriptions[mode]}</p>

        {mode === "single" && (
          <p className={styles.hintNote}>
            1 lawan Draugr pemula, target 10 poin — cocok untuk mempelajari alur permainan.
          </p>
        )}

        {mode === "bot" && (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Jumlah Draugr (Bot)</span>
              <div className={styles.stepper}>
                <button className={styles.stepBtn} onClick={() => setBotCount((c) => Math.max(1, c - 1))}>
                  −
                </button>
                <span className={styles.stepVal}>{botCount}</span>
                <button className={styles.stepBtn} onClick={() => setBotCount((c) => Math.min(5, c + 1))}>
                  +
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Tingkat Kesulitan</span>
              <div className={styles.difficultyRow}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    className={[styles.diffBtn, difficulty === d.id ? styles.active : ""].join(" ")}
                    onClick={() => setDifficulty(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === "multiplayer" && (
          <>
            <div className={styles.difficultyRow} style={{ marginBottom: "1.4rem" }}>
              <button
                className={[styles.diffBtn, multiKind === "hotseat" ? styles.active : ""].join(" ")}
                onClick={() => setMultiKind("hotseat")}
              >
                Hotseat (1 perangkat)
              </button>
              <button
                className={[styles.diffBtn, multiKind === "online" ? styles.active : ""].join(" ")}
                onClick={() => setMultiKind("online")}
              >
                Room Online (kode)
              </button>
            </div>

            {multiKind === "hotseat" ? (
              <>
                <div className={styles.field}>
                  <span className={styles.label}>Jumlah Pemain (bergiliran di 1 perangkat)</span>
                  <div className={styles.stepper}>
                    <button className={styles.stepBtn} onClick={() => updateMultiCount(-1)}>
                      −
                    </button>
                    <span className={styles.stepVal}>{multiCount}</span>
                    <button className={styles.stepBtn} onClick={() => updateMultiCount(1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Nama Pemain</span>
                  <div className={styles.nameGrid}>
                    <input className={styles.nameInput} value={playerName} disabled />
                    {multiNames.slice(0, multiCount - 1).map((name, i) => (
                      <input
                        key={i}
                        className={styles.nameInput}
                        value={name}
                        onChange={(e) => {
                          const next = [...multiNames];
                          next[i] = e.target.value;
                          setMultiNames(next);
                        }}
                        placeholder={`Pemain ${i + 2}`}
                      />
                    ))}
                  </div>
                </div>
                <button className={styles.startBtn} onClick={start}>
                  Mulai Permainan →
                </button>
              </>
            ) : (
              <>
                <p className={styles.hintNote} style={{ marginBottom: "1.25rem" }}>
                  Buat room dan bagikan kodenya, atau gabung ke room teman — tiap pemain
                  main dari perangkatnya masing-masing.
                </p>
                <button className={styles.startBtn} onClick={onStartOnline}>
                  Lanjut ke Room Online →
                </button>
              </>
            )}
          </>
        )}

        {mode !== "multiplayer" && (
          <button className={styles.startBtn} onClick={start}>
            Mulai Permainan →
          </button>
        )}
      </motion.div>
    </div>
  );
}
