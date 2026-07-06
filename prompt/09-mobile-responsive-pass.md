# Tahap 9 — Perombakan Responsif Mobile & Browser

## Prompt asli
> eskalasi lagi tampilan, ketika dimainkan di mobile tampilan menjadi
> responsive dan tidak terlalu banyak yg mengganggu(scroll/tertutup)
>
> kemudian yg di browser juga

## Yang dilakukan
- **Header**: teks brand dipaksa satu baris + ellipsis (sebelumnya pecah
  3 baris di layar sempit), subtitle disembunyikan di bawah 480px, ikon
  kontrol mengecil.
- **Meja Odin**: ukuran kartu responsif via `clamp()`, tangan pemain jadi
  **scroll horizontal** dengan snap (bukan wrap ke banyak baris yang
  mendorong tombol aksi ke luar layar), baris lawan juga scroll
  horizontal.
- **Overlay** (ambil kartu/ronde selesai/game selesai) jadi gaya
  **bottom sheet** di mobile — nempel di bawah, dibatasi tinggi `85vh`
  dengan scroll internal, supaya tidak pernah "tertutup"/tak terjangkau.
- Padding aman notch/home-indicator iPhone (`env(safe-area-inset-*)`,
  `viewport-fit=cover`).
- Penyesuaian grid & tipografi di Hub, Setup, dan Room Lobby untuk layar
  320–375px.

## Pola yang lalu jadi standar
Semua CSS module game baru (Tacta, Bookshelf) langsung mengikuti pola
mobile-first yang sama sejak awal dibuat (bukan ditambal belakangan lagi).
