# Prompt Bertahap — Hall of Games

Folder ini merangkum seluruh percakapan yang membangun proyek "Hall of
Games" (hub game digital, tema Norse) menjadi rangkaian prompt bertahap.
Tiap file mewakili satu permintaan besar ke Claude Code beserta konteks
dan hasilnya — bisa dipakai sebagai referensi cara kerja proyek ini
dibangun, atau sebagai contoh alur kalau mau menambah game baru dengan
pola yang sama.

Urutan disusun kronologis sesuai percakapan aslinya.

| # | File | Ringkasan |
|---|------|-----------|
| 1 | [01-research-odin.md](01-research-odin.md) | Riset aturan Odin Card Game sebelum membangun apa pun |
| 2 | [02-build-hub-and-odin.md](02-build-hub-and-odin.md) | Bangun hub + game Odin lengkap dari nol |
| 3 | [03-odin-polish-theme-music-combo-log.md](03-odin-polish-theme-music-combo-log.md) | Musik latar, dark/light mode, urutan klik kombo, log/giliran lebih jelas |
| 4 | [04-lan-dev-access.md](04-lan-dev-access.md) | Cara jalankan dev server supaya bisa diakses 1 jaringan |
| 5 | [05-odin-online-room.md](05-odin-online-room.md) | Room multiplayer online lintas perangkat via Firebase |
| 6 | [06-bugfix-node-upgrade.md](06-bugfix-node-upgrade.md) | Dev server crash → upgrade Node 18 → 22 |
| 7 | [07-bugfix-blank-screen-firebase-arrays.md](07-bugfix-blank-screen-firebase-arrays.md) | Layar blank saat main room online → bug array kosong di Firebase |
| 8 | [08-bugfix-secure-context-lan.md](08-bugfix-secure-context-lan.md) | Error saat akses dari HP via LAN → secure-context fallback |
| 9 | [09-mobile-responsive-pass.md](09-mobile-responsive-pass.md) | Perombakan responsif mobile & browser |
| 10 | [10-research-tacta.md](10-research-tacta.md) | Riset aturan Tacta (game kedua) |
| 11 | [11-build-tacta-bots-everywhere-theming.md](11-build-tacta-bots-everywhere-theming.md) | Bangun Tacta, bot di semua mode multiplayer, tema per-game |
| 12 | [12-research-sekata.md](12-research-sekata.md) | Riset aturan Sekata (belum dieksekusi) |
| 13 | [13-research-bookshelf-feasibility.md](13-research-bookshelf-feasibility.md) | Riset Bookshelf + diskusi kelayakan digitalisasi |
| 14 | [14-build-bookshelf-proxy-mechanic.md](14-build-bookshelf-proxy-mechanic.md) | Rancang & bangun Bookshelf dengan mekanik proxy (game ketiga) |
| 15 | [15-fix-tacta-card-shapes.md](15-fix-tacta-card-shapes.md) | Perbaikan: bentuk kartu Tacta dibuat sesuai game aslinya |

## Aturan tetap folder ini

Mulai tahap 15, setiap prompt baru dari user **wajib** direkam di sini:

- **Perbaikan/penyesuaian kecil** pada fitur yang sudah ada → tambahkan
  sebagai file tahap baru bernomor urut berikutnya (jangan diedit balik ke
  file tahap lama — riwayatnya harus tetap kronologis & apa adanya).
- **Fitur/game baru** → juga jadi file tahap baru bernomor urut berikutnya.
- Setiap file baru **wajib** ditambahkan ke tabel indeks di atas.
- Format tiap file: judul tahap, kutipan prompt asli user, konteks singkat,
  apa yang dikerjakan, dan hasil verifikasi — mengikuti format file-file
  sebelumnya di folder ini.

## Pola yang konsisten di tiap game baru

Setiap game (Odin, Tacta, Bookshelf) dibangun dengan struktur & kontrak yang sama:

- `src/games/<nama>/engine/` — types, deck/generator, reducer murni (`(state, action) => state`), bot AI.
- `src/games/<nama>/components/` — `<Nama>TableView` (presentational), `Local<Nama>Table` (bungkus `useReducer`), `Online<Nama>Table` (bungkus subscription Firebase), `<Nama>Setup`, `<Nama>RoomLobby`.
- `src/games/<nama>/online/room.ts` — create/join/subscribe/start/send-action/leave/delete room di path Firebase terpisah (`<nama>-rooms/`), plus fungsi tambah/hapus bot di lobby.
- `src/games/<nama>/index.ts` — daftar ke `lib/gameRegistry.tsx` supaya otomatis muncul di Hub.
- `src/games/<nama>/Illustration.tsx` — ilustrasi SVG custom, dan satu blok tema warna+font di `src/index.css` lewat `useGameTheme("<nama>")`.
- Mode wajib: Solo, Lawan Bot, Multiplayer (Hotseat + Room Online), dan bot bisa ditambahkan di kedua varian multiplayer.
- State harus deterministik (reducer murni) — kalau mekanik aslinya butuh keacakan/fisik real-time (dadu presisi, physics), keacakan itu dibungkus jadi satu angka yang dikirim sebagai action, bukan disimulasikan ulang di tiap client (lihat stage 14, Bookshelf).
