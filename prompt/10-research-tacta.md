# Tahap 10 — Riset Tacta (Game Kedua)

## Prompt asli
> sekarang game ke 2, coba research dulu dan jangan langsung dieksekusi
> tentang game tacta

## Yang dilakukan
Riset via `WebSearch`/`WebFetch` (Geeky Hobbies, BoardGameGeek, Opinionated
Gamers, review blog) tentang game kartu fisik **Tacta** (USAopoly/The Op
Games, desainer Jason Tremblay): dek 18 kartu per pemain (dipegang seperti
deque, cuma bisa akses ujung atas/bawah), tiap kartu punya bentuk
(persegi/lingkaran/segitiga) + nilai titik. Mekanik inti: **menutup**
bentuk sama milik lawan (menyembunyikan poinnya) atau **menempel** ke sel
kosong yang menyentuh maksimal satu kartu lain. Skor = titik yang masih
terlihat saat dek habis.

## Catatan kompleksitas yang disampaikan (tanpa eksekusi)
Tacta aslinya permainan **spasial bebas** (kartu ditempel & diputar bebas
di meja fisik) — jauh lebih rumit didigitalkan dibanding Odin. Disarankan
disederhanakan ke **grid diskrit** kalau nanti dieksekusi, supaya stabil
dan tidak perlu physics/drag-rotate presisi piksel.

Tidak ada kode ditulis di tahap ini, sesuai instruksi eksplisit user.
