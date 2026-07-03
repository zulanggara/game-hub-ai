import { motion } from "framer-motion";
import { getGames } from "../lib/gameRegistry";
import { GameCard } from "./GameCard";
import styles from "./Hub.module.css";

export function Hub() {
  const games = getGames();

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <motion.span
          className={styles.eyebrow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Sebuah Aula Permainan Digital
        </motion.span>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          HALL OF GAMES
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          Kumpulan game meja digital dengan mode solo, lawan bot, hingga multiplayer
          hotseat. Tetapkan namamu, pilih game, dan mulai bertarung untuk gelar
          juara.
        </motion.p>
      </section>

      <div className={styles.sectionLabel}>Perpustakaan Game</div>
      <div className={styles.grid}>
        {games.map((game, i) => (
          <GameCard key={game.id} game={game} index={i} />
        ))}
      </div>
    </main>
  );
}
