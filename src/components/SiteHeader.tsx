import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../lib/profile";
import { useTheme } from "../lib/theme";
import { useAmbientMusic } from "../lib/ambientMusic";
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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" strokeLinejoin="round" />
      {!muted && <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />}
      {muted && <path d="M16 9l5 6M21 9l-5 6" strokeLinecap="round" />}
    </svg>
  );
}

export function SiteHeader() {
  const { username, setUsername } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const music = useAmbientMusic();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username ?? "");
  const [showVolume, setShowVolume] = useState(false);

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

      <div className={styles.controls}>
        <div className={styles.musicControl} onMouseLeave={() => setShowVolume(false)}>
          <button
            className={styles.iconButton}
            onClick={music.toggle}
            onMouseEnter={() => setShowVolume(true)}
            aria-pressed={music.enabled}
            aria-label={music.enabled ? "Matikan musik latar" : "Nyalakan musik latar"}
            title={music.enabled ? "Matikan musik latar" : "Nyalakan musik latar Norse"}
          >
            <SpeakerIcon muted={!music.enabled} />
          </button>
          {showVolume && music.enabled && (
            <input
              className={styles.volumeSlider}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={music.volume}
              onChange={(e) => music.setVolume(Number(e.target.value))}
              aria-label="Volume musik latar"
            />
          )}
        </div>

        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

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
      </div>
    </header>
  );
}
