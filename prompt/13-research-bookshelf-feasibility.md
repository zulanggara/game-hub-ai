# Tahap 13 — Riset Bookshelf + Diskusi Kelayakan Digitalisasi

## Prompt asli
> kalau boarggame bookshelf
>
> *(disusul)*
>
> tapi memungkinkan untuk diterapkan?

## Yang dilakukan
Riset **Bookshelf** (Alley Cat Games): game **dexterity/stacking
kooperatif** dalam tin kecil, 1–6 pemain. Kartu rak bertanda X (titik yang
wajib ditumpu buku), meeple kucing dipindah naik tiap rak baru ditambah
(beratnya justru membantu keseimbangan). Menang kalau menara mencapai 8
rak tanpa roboh.

## Diskusi kelayakan (sebelum eksekusi)
Ditanya user: bisa diterapkan tidak? Jawaban dengan rekomendasi:
- **Physics engine sungguhan** — feasible secara teknis, tapi **fisika
  itu non-deterministik antar device** (beda timing/rounding). Ini
  masalah nyata karena arsitektur online-room semua game di hub ini
  (Odin, Tacta) berdasar sync state deterministik lewat Firebase —
  physics sim asli akan bikin dua device melihat hasil goyang/roboh yang
  berbeda, merusak parity mode online.
- **Proxy disederhanakan** (skill/timing mini-game + risiko, dihitung
  deterministik) — direkomendasikan, karena otomatis kompatibel dengan
  pola reducer + online-room + bot yang sudah jadi standar hub.

User setuju pendekatan proxy → jadi keputusan desain di Tahap 14.
