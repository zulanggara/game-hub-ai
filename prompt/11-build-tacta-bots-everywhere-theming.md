# Tahap 11 — Bangun Tacta, Bot di Semua Mode Multiplayer, Tema Per-Game

## Prompt asli
> sekarang eksekusi untuk game tacta, tambahkan untuk mode permainan sama
> dengan odin (solo/bot/multiplayer)
>
> dan kalau bisa semua mode multiplayer bisa ditambahkan bot
>
> *(disusul di tengah pengerjaan)*
>
> sesuaikan juga tema ketika user memilih game tacta, jadi tiap game
> dengan temanya masing-masing

## Keputusan desain Tacta
Karena versi fisiknya bebas-posisi (lihat Tahap 10), dipilih adaptasi
**grid diskrit**: satu fungsi `isValidPlacement()` menangani tiga jenis
penempatan sekaligus — menutup kartu bentuk sama, menempel ke sel kosong
bertetangga ≤1 kartu, atau isolasi total. Kartu bentuk `Record<string,
Cell>` berkunci `"x,y"` (bukan array berindeks angka) — sengaja dipilih
supaya kebal dari bug "array kosong terhapus Firebase" (Tahap 7), karena
object berkunci string tidak kena masalah itu.

## Fitur "bot di semua mode multiplayer" — diterapkan ke Odin **dan** Tacta
- **Hotseat**: stepper "Tambahkan Bot" baru di layar setup kedua game,
  bot langsung ikut rotasi giliran bareng manusia di satu perangkat.
- **Room online**: host bisa klik "+ Tambah Bot" di ruang tunggu sebelum
  mulai (dan hapus lagi kalau berubah pikiran) — `RoomDoc` dapat field
  `bots` terpisah dari `players`, digabung urut kursi saat game dimulai.
  Bot Odin di room online tetap bawa tingkat kesulitan per-bot
  (`OdinTableView.botDifficulty` diubah jadi bisa berupa fungsi lookup
  per-bot-id, bukan cuma satu nilai global).

## Tema per-game
- `useGameTheme(gameId)` — menempelkan `document.documentElement.dataset.game`
  saat game dibuka, dibersihkan saat keluar (kembali ke tema netral Hub).
- Variabel CSS `--gold/--gold-hi/--gold-dim/--line-strong/--bg-glow-*`
  di-override per game lewat selector `:root[data-game="tacta"]` (dan
  varian light-nya) — karena hampir semua chrome UI sudah pakai token ini,
  gonta-ganti tema tidak perlu sentuh kode komponen sama sekali.
- Tacta dapat aksen **teal geometris** + font display baru "Big Shoulders
  Display" (lewat `--font-display-game`, supaya header Hub tidak ikut
  berubah font).
- Palet 6 warna pemain diekstrak ke `src/lib/palette.ts` (sebelumnya cuma
  ada di Tacta) supaya bisa dipakai ulang game lain.

## Pola arsitektur yang lahir di tahap ini dan dipakai seterusnya
`<Game>TableView` (presentational murni) + `Local<Game>Table` +
`Online<Game>Table` + `<Game>RoomLobby` (reuse CSS module Odin) — pola
inilah yang langsung dipakai ulang persis untuk Bookshelf (Tahap 14).
