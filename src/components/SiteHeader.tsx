import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../lib/profile";
import styles from "./SiteHeader.module.css";

function RuneMark() {
  return (
    <svg viewBox="0 0 32 32" className={styles.brandMark} aria-hidden>
      <path
        d="M16 3 L16 29 M9 9 L16 15.5 L9 22 M23 9 L16 15.5 L23 22"
        stroke="#d4af37"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const { username, setUsername } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (trimmed) setUsername(trimmed);
    setEditing(false);
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <RuneMark />
        <span>
          <span className={styles.brandText}>Hall of Games</span>
          <span className={styles.brandSub}>Norse Tabletop Arena</span>
        </span>
      </Link>

      <div className={styles.profile}>
        {editing ? (
          <form className={styles.nameForm} onSubmit={submit}>
            <input
              className={styles.nameInput}
              autoFocus
              maxLength={18}
              placeholder="Nama pemain"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className={styles.saveButton}>
              Simpan
            </button>
          </form>
        ) : (
          <>
            <span className={styles.profileLabel}>Pemain</span>
            <button
              className={styles.nameButton}
              onClick={() => {
                setDraft(username ?? "");
                setEditing(true);
              }}
            >
              {username ?? "Tetapkan nama"}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
