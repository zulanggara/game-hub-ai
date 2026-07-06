import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { botAttemptAccuracy, botChooseCard } from "../engine/bot";
import type { BookshelfAction } from "../engine/reducer";
import type { BookshelfState } from "../engine/types";
import { BookshelfCard } from "./BookshelfCard";
import { BalanceChallenge } from "./BalanceChallenge";
import { BookshelfTower } from "./BookshelfTower";
import styles from "./BookshelfTable.module.css";

export interface BookshelfTableViewProps {
  state: BookshelfState;
  dispatch: (action: BookshelfAction) => void;
  /** ids this browser/session may act for — everyone cooperates toward one shared tower */
  controlledIds: string[];
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}

export function BookshelfTableView({
  state,
  dispatch,
  controlledIds,
  onExit,
  onGameOver,
}: BookshelfTableViewProps) {
  const reportedRef = useRef(false);
  const activeId = state.turnOrder[state.activeIndex];
  const activePlayer = state.players.find((p) => p.id === activeId)!;
  const isMyTurn = controlledIds.includes(activeId);

  useEffect(() => {
    if (isMyTurn) return;
    const bot = state.players.find((p) => p.id === activeId);
    if (!bot || bot.kind !== "bot") return;

    if (state.phase === "choosing") {
      const t = setTimeout(() => {
        const c = botChooseCard(state);
        dispatch({ type: "CHOOSE", playerId: activeId, cardId: c.cardId });
      }, 700);
      return () => clearTimeout(t);
    }
    if (state.phase === "balancing") {
      const t = setTimeout(() => {
        const a = botAttemptAccuracy();
        dispatch({ type: "ATTEMPT", playerId: activeId, accuracy: a.accuracy });
      }, 700);
      return () => clearTimeout(t);
    }
  }, [state, activeId, isMyTurn, dispatch]);

  useEffect(() => {
    if ((state.phase === "won" || state.phase === "collapsed") && !reportedRef.current) {
      reportedRef.current = true;
      onGameOver({ won: state.phase === "won", score: state.tower.length });
    }
  }, [state.phase, state.tower.length, onGameOver]);

  return (
    <div className={styles.table}>
      <div className={styles.topBar}>
        <span>Bookshelf</span>
        <span>Target {state.targetHeight} rak</span>
        <button className={styles.quitLink} onClick={onExit}>
          ‹ Keluar Meja
        </button>
      </div>

      <div className={styles.players}>
        {state.players.map((p) => (
          <span key={p.id} className={[styles.playerChip, p.id === activeId ? styles.active : ""].join(" ")}>
            {p.name}
          </span>
        ))}
      </div>

      <div className={styles.center}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.phase}-${activeId}-${state.tower.length}`}
            className={[styles.turnBanner, isMyTurn ? styles.turnBannerYou : ""].join(" ")}
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.25 }}
          >
            {isMyTurn
              ? state.phase === "choosing"
                ? "Giliranmu — pilih rak!"
                : "Giliranmu — jaga keseimbangan!"
              : `Menunggu ${activePlayer.name}...`}
          </motion.div>
        </AnimatePresence>

        <BookshelfTower tower={state.tower} stability={state.stability} targetHeight={state.targetHeight} />

        {state.phase === "choosing" && isMyTurn && state.choices && (
          <div className={styles.choiceRow}>
            {state.choices.map((card) => (
              <BookshelfCard
                key={card.id}
                card={card}
                onClick={() => dispatch({ type: "CHOOSE", playerId: activeId, cardId: card.id })}
              />
            ))}
          </div>
        )}

        {state.phase === "balancing" && state.armed && (
          <BalanceChallenge
            level={state.armed.level}
            height={state.tower.length}
            stability={state.stability}
            canAct={isMyTurn}
            onResult={(accuracy) => dispatch({ type: "ATTEMPT", playerId: activeId, accuracy })}
          />
        )}

        <div className={styles.log}>{state.log.slice(-2).join(" · ")}</div>
      </div>

      {(state.phase === "won" || state.phase === "collapsed") && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {state.phase === "won" ? "Rak Buku Berdiri Kokoh!" : "Rak Buku Roboh!"}
            </h2>
            <p>
              {state.phase === "won"
                ? `Kalian berhasil menumpuk ${state.targetHeight} rak bersama-sama.`
                : `Tumpukan runtuh di rak ke-${state.tower.length + 1}. Coba lagi!`}
            </p>
            <button className={styles.quitLink} onClick={onExit} style={{ marginTop: "1rem" }}>
              Kembali ke Aula
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
