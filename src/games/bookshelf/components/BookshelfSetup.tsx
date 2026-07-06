import { useState } from "react";
import { motion } from "framer-motion";
import { useProfile } from "../../../lib/profile";
import { modeLabels, type GameMode } from "../../../lib/gameRegistry";
import { BookshelfIllustration } from "../Illustration";
import type { BookshelfConfig } from "./LocalBookshelfTable";
import styles from "../../tacta/components/TactaSetup.module.css";

type MultiKind = "hotseat" | "online";

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  single: "Bangun rak sendirian — jaga keseimbangan sampai 8 tingkat.",
  bot: "Bekerja sama dengan AI penjaga rak untuk mencapai 8 tingkat tanpa roboh.",
  multiplayer: "Bangun rak bersama teman — hotseat di satu perangkat, atau lewat room online.",
};

export function BookshelfSetup({
  onStart,
  onStartOnline,
}: {
  onStart: (config: BookshelfConfig) => void;
  onStartOnline: () => void;
}) {
  const { username } = useProfile();
  const playerName = username ?? "Pemain";

  const [mode, setMode] = useState<GameMode>("bot");
  const [botCount, setBotCount] = useState(1);
  const [multiKind, setMultiKind] = useState<MultiKind>("hotseat");
  const [multiCount, setMultiCount] = useState(2);
  const [multiNames, setMultiNames] = useState<string[]>(["Pemain 2"]);
  const [hotseatBotCount, setHotseatBotCount] = useState(0);

  function updateMultiCount(delta: number) {
    const next = Math.min(6 - hotseatBotCount, Math.max(2, multiCount + delta));
    setMultiCount(next);
    setMultiNames((prev) => {
      const arr = [...prev];
      while (arr.length < next - 1) arr.push(`Pemain ${arr.length + 2}`);
      return arr.slice(0, next - 1);
    });
  }

  function updateHotseatBotCount(delta: number) {
    setHotseatBotCount((c) => Math.min(6 - multiCount, Math.max(0, c + delta)));
  }

  function start() {
    if (mode === "single") {
      onStart({
        players: [{ id: "p-you", name: playerName, kind: "human" }],
        controlledIds: ["p-you"],
        primaryId: "p-you",
      });
      return;
    }

    if (mode === "bot") {
      const players = [
        { id: "p-you", name: playerName, kind: "human" as const },
        ...Array.from({ length: botCount }, (_, i) => ({
          id: `p-bot-${i}`,
          name: `Penjaga Rak ${i + 1}`,
          kind: "bot" as const,
        })),
      ];
      onStart({ players, controlledIds: ["p-you"], primaryId: "p-you" });
      return;
    }

    const humans = [
      { id: "p-1", name: playerName, kind: "human" as const },
      ...multiNames.slice(0, multiCount - 1).map((name, i) => ({
        id: `p-${i + 2}`,
        name: name || `Pemain ${i + 2}`,
        kind: "human" as const,
      })),
    ];
    const hotseatBots = Array.from({ length: hotseatBotCount }, (_, i) => ({
      id: `p-hotseat-bot-${i}`,
      name: `Penjaga Rak ${i + 1}`,
      kind: "bot" as const,
    }));
    onStart({
      players: [...humans, ...hotseatBots],
      controlledIds: humans.map((p) => p.id),
      primaryId: "p-1",
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
        <BookshelfIllustration />
        <h1 className={styles.heroTitle}>Bookshelf</h1>
        <p className={styles.heroDesc}>
          Game kerja sama menjaga keseimbangan. Pilih kartu rak, ketuk tepat waktu
          untuk menumpuknya dengan mantap, dan capai 8 tingkat sebelum rak roboh.
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
        <p style={{ marginBottom: "1.25rem" }}>{MODE_DESCRIPTIONS[mode]}</p>

        {mode === "single" && (
          <p className={styles.hintNote}>Kamu sendirian menjaga keseimbangan rak — santai tapi tetap tegang!</p>
        )}

        {mode === "bot" && (
          <div className={styles.field}>
            <span className={styles.label}>Jumlah Penjaga Rak (AI)</span>
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
        )}

        {mode === "multiplayer" && (
          <>
            <div className={styles.optionRow} style={{ marginBottom: "1.4rem" }}>
              <button
                className={[styles.optionBtn, multiKind === "hotseat" ? styles.active : ""].join(" ")}
                onClick={() => setMultiKind("hotseat")}
              >
                Hotseat (1 perangkat)
              </button>
              <button
                className={[styles.optionBtn, multiKind === "online" ? styles.active : ""].join(" ")}
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
                <div className={styles.field}>
                  <span className={styles.label}>Tambahkan Penjaga Rak AI (opsional)</span>
                  <div className={styles.stepper}>
                    <button className={styles.stepBtn} onClick={() => updateHotseatBotCount(-1)}>
                      −
                    </button>
                    <span className={styles.stepVal}>{hotseatBotCount}</span>
                    <button className={styles.stepBtn} onClick={() => updateHotseatBotCount(1)}>
                      +
                    </button>
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
