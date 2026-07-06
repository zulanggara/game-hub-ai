# Tahap 14 — Rancang & Bangun Bookshelf (Game Ketiga)

## Prompt asli
> rancang mekanik proxy dan eksekusi dengan cara terbaik
>
> kemudian rangkumkan seluruh pekerjaan menjadi prompt bertahap yg
> tersimpan ke dalam file .md di dalam folder prompt

## Desain mekanik "Balance Proxy"
Tiap giliran: pemain aktif ditawari 2 kartu rak, pilih 1 (`CHOOSE`).
Untuk memasangnya, muncul mini-game presisi real-time: penunjuk
berosilasi (sinus) di sebuah bar, zona target keemasan mengecil seiring
tinggi menara + level kartu + stabilitas saat ini. Pemain mengetuk saat
penunjuk ada di posisi tertentu — jarak dari pusat zona itu yang jadi
**satu-satunya angka acak** (`accuracy`, 0–1) yang dikirim sebagai action
(`ATTEMPT`). Reducer memetakan angka itu ke kualitas
(perfect/good/risky/fail) dan delta stabilitas secara **deterministik** —
sehingga tetap kompatibel dengan sync Firebase yang sama seperti Odin/
Tacta, tanpa physics engine.

Bot menempuh mini-game yang sama tapi `accuracy`-nya digambar dari
distribusi probabilitas instan (bukan animasi nyata).

Kooperatif seperti aslinya: satu menara bersama, menang di 8 rak, kalah
kalau stabilitas habis atau ada ketukan yang benar-benar meleset (`fail`).

## Verifikasi sebelum UI dibangun
Simulasi headless bot-vs-bot 200 kali (`tsx`) lewat reducer murni —
memastikan tidak ada state macet (`no-op`/infinite loop) dan rasio
menang/kalah terasa wajar (~38% menang) sebelum melanjutkan ke lapisan UI.

## Yang dibangun (mengikuti pola dari Tahap 11)
- `engine/{types,deck,reducer,bot}.ts` — reducer murni + bot.
- `components/BookshelfCard`, `BalanceChallenge` (mini-game), `BookshelfTower`
  (visual tumpukan + meteran stabilitas), `BookshelfTableView` +
  `Local/OnlineBookshelfTable`, `BookshelfSetup`, `BookshelfRoomLobby`
  (reuse CSS module Odin, sama seperti Tacta).
- `online/room.ts` — path Firebase `bookshelf-rooms/`, normalisasi array
  kosong (pola dari Tahap 7), dukung tambah/hapus bot di lobby (pola dari
  Tahap 11).
- Palet 6 warna dipakai ulang dari `lib/palette.ts` (diekstrak di Tahap
  11) untuk warna buku.
- Tema baru: aksen amber hangat + font "Fraunces" lewat
  `useGameTheme("bookshelf")` (pola dari Tahap 11).
- Didaftarkan ke `lib/gameRegistry.tsx`, rute `/play/bookshelf`.

## Verifikasi & push
`tsc --noEmit`, `npm run build`, `eslint`, dev server + curl ke modul
kunci — semua bersih, di-commit & push ke `main`.

## Tahap ini juga menghasilkan
Folder `prompt/` ini sendiri — dokumentasi tahap demi tahap seluruh sesi,
supaya bisa dipakai sebagai referensi atau dilanjutkan orang/AI lain
dengan pola yang konsisten.
