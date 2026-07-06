# Tahap 2 — Bangun Hub + Game Odin dari Nol

## Prompt asli
> sekarang karena masih di local saya mau ini bisa dimainkan di 1
> jaringan yg sama... *(prompt utama pembangunan sebenarnya adalah pesan
> sebelumnya)*:
>
> sekarang eksekusi untuk game ini
>
> pastikan sistem/web nantinya bisa menampung banyak game yg nantinya
> memiliki modenya tersendiri
>
> ---
> Guides aesthetic direction selection (brutalist, maximalist,
> retro-futuristic, luxury, organic, etc.) before implementation to ensure
> cohesive, memorable designs
> Emphasizes typography, color theming with CSS variables, motion design,
> spatial composition, and textural details as core design pillars
> ---
>
> pastikan halaman web interaktif, disertai animasi dan lengkapi juga
> dengan ilustrasi/gambar desain yg mendekati dengan tiap game nantinya

## Konteks
Implementasikan hasil riset Tahap 1 jadi web sungguhan. Dua syarat
arsitektural eksplisit: (1) sistemnya harus bisa menampung *banyak* game
di masa depan, bukan cuma satu, (2) desainnya harus punya arah estetika
yang jelas & konsisten (bukan tampilan generik AI), lengkap animasi &
ilustrasi custom per game.

## Keputusan desain
- Ditanya ke user lewat `AskUserQuestion`: tiga opsi arah estetika. User
  pilih **Norse Mythic Brutalist** (obsidian + emas, font Cinzel/Marcellus
  + JetBrains Mono, tekstur rune-grid & film-grain).
- Stack: Vite + React + TypeScript, React Router (`HashRouter`), Framer
  Motion untuk animasi, CSS Modules + CSS custom properties untuk theming
  (bukan Tailwind — supaya kontrol penuh atas desain custom).

## Yang dibangun
- **Registry game** (`src/lib/gameRegistry.tsx`) — daftar game generik
  (`id, title, modes, Illustration, route`), dipakai Hub untuk render
  kartu game otomatis. Ini fondasi supaya game berikutnya tinggal
  `registerGame(...)`.
- **Sistem profil** (`src/lib/profile.tsx`) — username + statistik
  (main/menang/skor terbaik) per game, disimpan di localStorage.
- **Hub** (`src/pages/Hub.tsx` + `GameCard.tsx`) — hero + grid kartu game.
- **Engine Odin murni** (`src/games/odin/engine/`) — deck 54 kartu, validasi
  kombo (warna sama/angka sama, nilai dari digit besar→kecil), mekanik
  ambil-kartu, skor per ronde, kondisi menang. Reducer pola
  `(state, action) => state`.
- **Bot AI** 3 tingkat kesulitan (Pemula/Perampok/Jarl).
- **UI meja**: kartu SVG custom per warna, tangan pemain, tumpukan trik,
  animasi Framer Motion.
- **3 mode**: Latihan Solo, Lawan Bot (atur jumlah & kesulitan),
  Multiplayer hotseat (bergantian 1 perangkat, banyak nama pemain).
- Ilustrasi SVG custom bertema Odin (dua gagak Huginn/Muninn + valknut).

## Verifikasi
`tsc --noEmit`, `npm run build`, `eslint`, dan uji jalan dev server +
curl ke beberapa modul kunci — semua bersih sebelum commit pertama
di-push ke `git@github.com:zulanggara/game-hub-ai.git`.

## Catatan penting untuk tahap berikutnya
Mode "Multiplayer" di tahap ini baru **hotseat lokal** (satu perangkat,
gantian) — bukan online lintas perangkat. Itu jadi permintaan tahap 5.
