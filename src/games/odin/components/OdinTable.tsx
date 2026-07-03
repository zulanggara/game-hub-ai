import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { Hand } from "./Hand";
import type { Action } from "../engine/reducer";
import type { GameState } from "../engine/types";
import { botChooseTake, botDecide, type BotDifficulty } from "../engine/bot";
import styles from "./OdinTable.module.css";

export interface OdinTableViewProps {
  state: GameState;
  dispatch: (action: Action) => void;
  /** ids that this browser/session is allowed to act for (1 in solo/bot/online, all in hotseat) */
  controlledIds: string[];
  /** id whose result is recorded against the site profile */
  primaryId: string;
  /** a single difficulty for local bot mode, or a per-bot lookup for online rooms */
  botDifficulty: BotDifficulty | ((botId: string) => BotDifficulty);
  onExit: () => void;
  onGameOver: (result: { won: boolean; score: number }) => void;
}

/** Pure presentational table — sourced from either a local reducer or a synced online room. */
export function OdinTableView({
  state,
  dispatch,
  controlledIds,
  primaryId,
  botDifficulty,
  onExit,
  onGameOver,
}: OdinTableViewProps) {
  const reportedRef = useRef(false);
  const primary = state.players.find((p) => p.id === primaryId) ?? state.players[0];

  useEffect(() => {
    if (state.phase === "awaiting-take" && state.pendingTake) {
      const taker = state.players.find((p) => p.id === state.pendingTake!.forPlayerId);
      if (taker && taker.kind === "bot") {
        const t = setTimeout(() => {
          dispatch({
            type: "TAKE_CARD",
            playerId: taker.id,
            cardId: botChooseTake(state.pendingTake!.options),
          });
        }, 650);
        return () => clearTimeout(t);
      }
    }

    if (state.phase === "playing") {
      const currentId = state.turnOrder[state.activeIndex];
      const current = state.players.find((p) => p.id === currentId);
      if (current && current.kind === "bot") {
        const t = setTimeout(() => {
          const difficulty =
            typeof botDifficulty === "function" ? botDifficulty(current.id) : botDifficulty;
          const decision = botDecide(state, current.id, difficulty);
          if (decision.action === "pass") {
            dispatch({ type: "PASS", playerId: current.id });
          } else {
            dispatch({ type: "PLAY", playerId: current.id, cardIds: decision.cardIds! });
          }
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [state, dispatch, botDifficulty]);

  useEffect(() => {
    if (state.phase === "game-over" && !reportedRef.current) {
      reportedRef.current = true;
      onGameOver({ won: state.gameWinnerId === primaryId, score: primary.totalScore });
    }
  }, [state.phase, state.gameWinnerId, primaryId, primary.totalScore, onGameOver]);

  const currentActorId =
    state.phase === "awaiting-take"
      ? state.pendingTake?.forPlayerId
      : state.turnOrder[state.activeIndex];

  const actorIsControlled = !!currentActorId && controlledIds.includes(currentActorId);
  const seatedPlayer = actorIsControlled
    ? state.players.find((p) => p.id === currentActorId)!
    : primary;

  const isHandTurn = state.phase === "playing" && actorIsControlled;
  const opponents = state.players.filter((p) => p.id !== seatedPlayer.id);
  const activeName = state.players.find((p) => p.id === state.turnOrder[state.activeIndex])?.name;

  return (
    <div className={styles.table}>
      <div className={styles.topBar}>
        <span className={styles.roundBadge}>Ronde {state.round}</span>
        <span>Batas skor: {state.scoreLimit}</span>
        <button className={styles.quitLink} onClick={onExit}>
          ‹ Keluar Meja
        </button>
      </div>

      <div className={styles.opponents}>
        {opponents.map((p) => (
          <div
            key={p.id}
            className={[styles.seat, state.turnOrder[state.activeIndex] === p.id ? styles.active : ""].join(" ")}
          >
            <div className={styles.avatar}>{p.name.slice(0, 1).toUpperCase()}</div>
            <span className={styles.seatName}>{p.name}</span>
            <span className={styles.seatMeta}>
              {p.hand.length} kartu · {p.totalScore} pts
            </span>
            <div className={styles.cardStack}>
              {p.hand.slice(0, 9).map((_, i) => (
                <div key={i} className={styles.miniBack} aria-hidden />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.center}>
        <div className={styles.pile}>
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
              <span>
                {state.phase === "playing" &&
                  (isHandTurn ? `Giliranmu, ${seatedPlayer.name}!` : `Menunggu ${activeName ?? "..."}`)}
                {state.phase === "awaiting-take" &&
                  (actorIsControlled
                    ? `${seatedPlayer.name}, pilih 1 kartu untuk diambil`
                    : `${state.players.find((p) => p.id === state.pendingTake?.forPlayerId)?.name} sedang mengambil kartu...`)}
              </span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {state.trick ? (
              <motion.div
                key={state.trick.combo.cards.map((c) => c.id).join("-")}
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.25 }}
              >
                <span className={styles.pileOwner}>
                  {state.players.find((p) => p.id === state.trick!.ownerId)?.name} · nilai{" "}
                  {state.trick.combo.value}
                </span>
                <div className={styles.pileCards}>
                  {state.trick.combo.cards.map((c) => (
                    <Card key={c.id} card={c} disabled />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className={styles.pileEmpty}>Meja kosong — silakan pimpin trik</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.log}>
        <span className={styles.logIcon} aria-hidden>
          ⚔
        </span>
        <span className={styles.logText}>{state.log.slice(-3).join(" · ")}</span>
      </div>

      <Hand
        cards={seatedPlayer.hand}
        tableCombo={state.trick?.combo ?? null}
        canAct={isHandTurn}
        onPlay={(cardIds) => dispatch({ type: "PLAY", playerId: seatedPlayer.id, cardIds })}
        onPass={() => dispatch({ type: "PASS", playerId: seatedPlayer.id })}
      />

      {state.phase === "awaiting-take" && actorIsControlled && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Ambil Satu Kartu</h2>
            <p>{seatedPlayer.name} mengalahkan kartu di meja. Pilih satu untuk masuk ke tangan.</p>
            <div className={styles.takeOptions}>
              {state.pendingTake!.options.map((c) => (
                <Card
                  key={c.id}
                  card={c}
                  onClick={() =>
                    dispatch({ type: "TAKE_CARD", playerId: seatedPlayer.id, cardId: c.id })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {state.phase === "round-over" && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Ronde {state.round} Selesai</h2>
            <p>{state.players.find((p) => p.id === state.roundWinnerId)?.name} menghabiskan kartu duluan.</p>
            <table className={styles.scoreTable}>
              <tbody>
                {[...state.players]
                  .sort((a, b) => a.totalScore - b.totalScore)
                  .map((p) => (
                    <tr key={p.id} className={p.id === state.roundWinnerId ? styles.winnerRow : ""}>
                      <td>{p.name}</td>
                      <td>{p.totalScore} pts</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button className={styles.quitLink} onClick={() => dispatch({ type: "NEXT_ROUND" })}>
              Lanjut ke Ronde {state.round + 1} →
            </button>
          </div>
        </div>
      )}

      {state.phase === "game-over" && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {state.gameWinnerId === primaryId ? "Kau Merebut Valhalla!" : "Permainan Usai"}
            </h2>
            <p>{state.players.find((p) => p.id === state.gameWinnerId)?.name} menang dengan skor paling rendah.</p>
            <table className={styles.scoreTable}>
              <tbody>
                {[...state.players]
                  .sort((a, b) => a.totalScore - b.totalScore)
                  .map((p) => (
                    <tr key={p.id} className={p.id === state.gameWinnerId ? styles.winnerRow : ""}>
                      <td>{p.name}</td>
                      <td>{p.totalScore} pts</td>
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
