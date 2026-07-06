# Tahap 4 — Akses Dev Server di 1 Jaringan (LAN)

## Prompt asli
> tapi roomnya sepertinya belum support ya? coba buat support dulu
>
> *(disusul setelahnya)*
>
> sekarang karena masih di local saya mau ini bisa dimainkan di 1 jaringan
> yg sama, gimana cara saya run devnya?

## Yang dilakukan
Bukan perubahan kode, murni instruksi operasional:

```bash
npm run dev -- --host
```

Vite lalu menampilkan alamat `Network` (IP LAN, mis. `192.168.100.128`)
yang bisa diakses dari HP/laptop lain di WiFi yang sama. Dijelaskan juga
batasannya: ini tetap hotseat/LAN biasa (satu instance game jalan di
browser siapa pun yang membukanya duluan), bukan sinkronisasi
multi-device — itu baru benar-benar ada setelah room online (Tahap 5)
selesai dibangun.

## Follow-up yang muncul dari sini
Mengakses lewat IP LAN (`http://192.168.x.x`) berarti bukan "secure
context" di browser — ini nantinya jadi akar bug di Tahap 8
(`crypto.randomUUID` tidak ada).
