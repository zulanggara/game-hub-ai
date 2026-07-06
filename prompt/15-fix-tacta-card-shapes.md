# Tahap 15 — Perbaikan: Bentuk Kartu Tacta Tidak Sesuai Aslinya

## Prompt asli
> sepertinya untuk tacta tidak sesuai dengan real, tidak ada bentuk
> kartunya
>
> pastikan sama dengan real

## Diagnosis
`TactaCard` sebelumnya menampilkan bentuk (persegi/lingkaran/segitiga)
sebagai ikon kecil transparan (opacity 0.75, 55% ukuran) di atas kartu
persegi polos berwarna — semua kartu terlihat sama bentuknya (persegi),
bentuk aslinya nyaris tidak kelihatan. Riset ulang detail kartu asli
(Geeky Hobbies) menegaskan: **bentuk di tengah adalah "suit" kartu**,
elemen paling dominan di wajah kartu, ditambah angka titik (value) dan
tanda bentuk kecil di tepi (edge shapes, untuk mekanik penyambungan fisik
— di versi digital ini sudah disederhanakan jadi aturan grid, lihat Tahap
11, jadi tidak direplikasi).

## Yang diperbaiki
`TactaCard` diubah supaya **kartu itu sendiri berbentuk sesuai suit-nya**
(bukan kotak polos + ikon kecil): persegi → persegi membulat mengisi ~94%
kotak, lingkaran → lingkaran penuh (`border-radius:50%`), segitiga →
`clip-path` segitiga penuh. Warna pemain mengisi seluruh bentuk itu, nilai
angka ditaruh di tengahnya. Karena komponen ini dipakai bareng oleh tangan
pemain (`TactaHand`) dan papan (`TactaBoard`), perbaikan ini otomatis
berlaku di kedua tempat.

## Verifikasi
`tsc --noEmit`, `npm run build`, `eslint src/games/tacta` — semua bersih.
Ukuran sel papan (`--cell`) disesuaikan ulang supaya pas dengan ukuran
kartu baru.
