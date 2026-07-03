import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { legalTargetsForShape } from "../engine/board";
import { tactaBotDecide } from "../engine/bot";
import type { DequeEnd, TactaState } from "../engine/types";
import type { TactaAction } from "../engine/reducer";
import { colorFor } from "../palette";
import { TactaBoard } from "./TactaBoard";
import { TactaHand } from "./TactaHand";
import styles from "./TactaTable.module.css";

export interface TactaTableViewProps {
  state: TactaState;
  dispatch: (action: TactaAction) => void;
  controlledIds: string[];
  primaryId: string;
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}

export function TactaTableView({
  state,
  dispatch,
  controlledIds,
  primaryId,
  onExit,
  onGameOver,
}: TactaTableViewProps) {
  const reportedRef = useRef(false);
  const [selectedEnd, setSelectedEnd] = useState<DequeEnd | null>(null);
  const primary = state.players.find((p) => p.id === primaryId) ?? state.players[0];

  const currentActorId = state.turnOrder[state.activeIndex];
  const actorIsControlled = controlledIds.includes(currentActorId);
  const seatedPlayer = actorIsControlled
    ? state.players.find((p) => p.id === currentActorId)!
    : primary;
  const isHandTurn = state.phase === "playing" && actorIsControlled;

  useEffect(() => {
    setSelectedEnd(null);
  }, [currentActorId]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const current = state.players.find((p) => p.id === currentActorId);
    if (current && current.kind === "bot") {
      const t = setTimeout(() => {
        const decision = tactaBotDecide(state, current.id);
        dispatch({ type: "PLAY", playerId: current.id, end: decision.end, target: decision.target });
      }, 750);
      return () => clearTimeout(t);
    }
  }, [state, currentActorId, dispatch]);

  useEffect(() => {
    if (state.phase === "game-over" && !reportedRef.current) {
      reportedRef.current = true;
      onGameOver({ won: state.winnerId === primaryId, score: state.scores[primaryId] ?? 0 });
    }
  }, [state.phase, state.winnerId, state.scores, primaryId, onGameOver]);

  const selectedCard =
    selectedEnd && seatedPlayer.deck.length > 0
      ? selectedEnd === "top"
        ? seatedPlayer.deck[0]
        : seatedPlayer.deck[seatedPlayer.deck.length - 1]
      : null;

  const validTargets = selectedCard
    ? new Set(
        legalTargetsForShape(state.board, state.bounds, selectedCard.shape).map((t) => `${t.x},${t.y}`)
      )
    : null;

  const playerColors: Record<string, string> = Object.fromEntries(
    state.players.map((p) => [p.id, p.color])
  );

  const others = state.players.filter((p) => p.id !== seatedPlayer.id);
  const activeName = state.players.find((p) => p.id === currentActorId)?.name;

  function handlePlace(x: number, y: number) {
    if (!isHandTurn || !selectedEnd) return;
    dispatch({ type: "PLAY", playerId: seatedPlayer.id, end: selectedEnd, target: { x, y } });
    setSelectedEnd(null);
  }

  return (
    <div className={styles.table}>
      <div className={styles.topBar}>
        <span>Tacta</span>
        <span>{Object.values(state.board).length} kartu di papan</span>
        <button className={styles.quitLink} onClick={onExit}>
          ‹ Keluar Meja
        </button>
      </div>

      <div className={styles.players}>
        {others.map((p) => (
          <div key={p.id} className={[styles.seat, currentActorId === p.id ? styles.active : ""].join(" ")}>
            <span className={styles.swatch} style={{ background: colorFor(p.color).b }} />
            <span className={styles.seatName}>{p.name}</span>
            <span className={styles.seatMeta}>
              {p.deck.length} kartu · {state.scores[p.id] ?? 0} pts
            </span>
          </div>
        ))}
      </div>

      <div className={styles.center}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.phase}-${currentActorId}`}
            className={[styles.turnBanner, isHandTurn ? styles.turnBannerYou : ""].join(" ")}
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.25 }}
          >
            <span className={styles.turnDot} />
            <span>{isHandTurn ? `Giliranmu, ${seatedPlayer.name}!` : `Menunggu ${activeName ?? "..."}`}</span>
          </motion.div>
        </AnimatePresence>

        <TactaBoard
          board={state.board}
          playerColors={playerColors}
          validTargets={isHandTurn ? validTargets : null}
          onPlace={handlePlace}
        />

        <div className={styles.log}>
          <span className={styles.logIcon} aria-hidden>
            ◆
          </span>
          <span>{state.log.slice(-2).join(" · ")}</span>
        </div>
      </div>

      <TactaHand
        deck={seatedPlayer.deck}
        colorKey={seatedPlayer.color}
        canAct={isHandTurn}
        selectedEnd={selectedEnd}
        onSelectEnd={setSelectedEnd}
      />

      {state.phase === "game-over" && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {state.winnerId === primaryId ? "Kau Menguasai Papan!" : "Permainan Usai"}
            </h2>
            <p>{state.players.find((p) => p.id === state.winnerId)?.name} menang dengan skor tertinggi.</p>
            <table className={styles.scoreTable}>
              <tbody>
                {[...state.players]
                  .sort((a, b) => (state.scores[b.id] ?? 0) - (state.scores[a.id] ?? 0))
                  .map((p) => (
                    <tr key={p.id} className={p.id === state.winnerId ? styles.winnerRow : ""}>
                      <td>{p.name}</td>
                      <td>{state.scores[p.id] ?? 0} pts</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button className={styles.quitLink} onClick={onExit}>
              Kembali ke Aula
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
