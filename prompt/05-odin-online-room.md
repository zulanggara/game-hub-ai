# Tahap 5 — Room Multiplayer Online (Firebase)

## Prompt asli
> tapi roomnya sepertinya belum support ya? coba buat support dulu

## Konteks
Di Tahap 3, user memilih pendekatan "backend realtime terkelola" untuk
room online. Prompt ini mengeksekusinya.

## Desain kunci
- **Firebase Realtime Database**, path `rooms/{kode}`. Kode 6 karakter
  (alfabet tanpa `0/O/1/I` biar tidak ambigu).
- **Reducer tetap sumber kebenaran** — state game (`GameState`) disimpan
  sebagai satu objek JSON per room. Tiap aksi (main kartu/pass/ambil
  kartu) dihitung ulang lewat reducer Odin yang sama persis di sisi klien
  yang bertindak, lalu hasilnya ditulis ke database. Karena giliran sudah
  dikunci di reducer (hanya pemain aktif yang boleh bertindak), risiko
  konflik tulis dari 2 device nyaris nol — tidak perlu server otoritatif
  terpisah.
- **Refactor `OdinTable`** dipecah jadi `OdinTableView` (murni
  presentational, terima `state`+`dispatch` lewat props) +
  `LocalOdinTable` (bungkus `useReducer`) + `OnlineOdinTable` (bungkus
  subscription Firebase). Pola ini yang lalu ditiru semua game berikutnya.
- **Lobby** (`OdinRoomLobby.tsx`): buat room / gabung kode, ruang tunggu
  dengan daftar pemain live, host yang mulai game.
- Firebase dibuat **opsional** — tanpa kredensial di `.env.local`, fitur
  Room Online menampilkan pesan setup, sisa web tetap normal.

## Yang harus dilakukan user sendiri
Claude tidak bisa membuat akun/project Firebase untuk user. Diberikan:
`.env.example` (daftar variabel `VITE_FIREBASE_*`) dan
`firebase-database.rules.json` (rules dasar) untuk di-paste ke console
Firebase user.

## Follow-up bug yang muncul dari fitur ini
- Tahap 7: Firebase menghapus array kosong → layar blank.
- Tahap 8: `crypto.randomUUID()` tidak ada di LAN/HTTP → crash saat klik
  Multiplayer dari HP.
