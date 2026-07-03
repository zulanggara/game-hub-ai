import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { GameDefinition } from "../lib/gameRegistry";
import { modeLabels } from "../lib/gameRegistry";
import { useProfile } from "../lib/profile";
import styles from "./GameCard.module.css";

export function GameCard({ game, index }: { game: GameDefinition; index: number }) {
  const { statsFor } = useProfile();
  const stats = statsFor(game.id);
  const Illustration = game.Illustration;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.015 }}
    >
      <div className={styles.art}>
        <Illustration />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.tagline}>{game.tagline}</p>
        <p className={styles.desc}>{game.description}</p>

        <div className={styles.modes}>
          {game.modes.map((m) => (
            <span key={m} className={styles.modeBadge}>
              {modeLabels[m]}
            </span>
          ))}
        </div>

        {stats.played > 0 && (
          <div className={styles.statRow}>
            <span>MAIN: {stats.played}</span>
            <span>MENANG: {stats.wins}</span>
            {stats.bestScore !== null && <span>SKOR TERBAIK: {stats.bestScore}</span>}
          </div>
        )}

        {game.status === "available" ? (
          <Link to={game.route} className={styles.cta}>
            Mainkan {game.title} →
          </Link>
        ) : (
          <span className={styles.ctaDisabled}>Segera Hadir</span>
        )}
      </div>
    </motion.article>
  );
}
