# Tahap 7 — Layar Blank di Room Online → Bug Array Kosong Firebase

## Prompt asli
> error blank sering terjadi saat mau join room

## Diagnosis
**Firebase Realtime Database menghapus array/object kosong yang disimpan.**
Begitu ada pemain yang kartunya habis (menang ronde), `hand` jadi `[]` →
field itu lenyap total dari database → semua client baca `undefined`,
bukan `[]` → kode yang mengasumsikan array (`.length`, `.map()`) langsung
melempar exception → seluruh pohon render React crash jadi layar putih,
persis pada momen paling umum terjadi (seseorang menang ronde).

## Yang dilakukan
1. **Normalisasi data saat dibaca dari Firebase** — `subscribeRoom`
   memulihkan field array/object yang hilang jadi `[]`/`null` sebelum
   diteruskan ke reducer/UI (dipakai lagi identik di Tacta & Bookshelf
   nantinya).
2. **Pesan error tidak pernah kosong** — helper `errorMessage()` dengan
   fallback teks generik kalau exception tidak punya `.message`.
3. **`ErrorBoundary` di level aplikasi** — kalau ada crash React lain yang
   belum ketahuan, yang muncul pesan + tombol "Kembali ke Aula", bukan
   layar putih polos.

## Pola yang lalu dipakai di semua game
Setiap game baru (Tacta, Bookshelf) otomatis menerapkan normalisasi array
yang sama di `online/room.ts`-nya masing-masing, karena bug ini bersifat
struktural ke Firebase RTDB, bukan spesifik ke Odin.
