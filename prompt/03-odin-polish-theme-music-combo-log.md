# Tahap 3 — Polish Odin: Musik, Dark/Light, Urutan Kombo, Log

## Prompt asli
> -berikan semacam musik latar yg bisa sesuai dengan tema game
> -Berikan opsi tampilan dark/light dan pastikan tiap tulisan terlihat di
> mode manapun
> -kemudian kalau odin yg sekarang kan misal saya mau klik kartu angka 8
> dan 9 langsung dianggap manjadi 98, lebih baik ini sesuai kehendak user
> berdasar yg di klik lebih dulu, misal 8 di klik dulu berarti 89
> -teks log/giliran dibuat lebih eye catching. jangan semu dan terlalu
> kecil
> -kemudian sekarang kan baru ada "Mode hotseat — bergiliran di satu
> perangkat bersama teman." sediakan juga kalau saya mau buat room

## Yang dilakukan
1. **Urutan klik menentukan nilai kombo** — sebelumnya kartu multi-pilih
   selalu disusun otomatis dari besar ke kecil (digit tertinggi dulu).
   Diubah supaya nilai kombo mengikuti *urutan klik* pemain (klik 8 lalu 9
   → 89, bukan otomatis 98). Ditambah badge nomor urutan di tiap kartu
   yang dipilih. Bot tetap main dengan urutan optimal (besar→kecil) lewat
   fungsi `orderedValue` terpisah dari `comboValue` (dipakai bot untuk
   mencari kombinasi terbaik).
2. **Dark/light theme** — `ThemeProvider` + `useTheme`, seluruh warna jadi
   CSS custom property dengan varian light yang kontrasnya diuji ulang
   (bukan cuma invert warna).
3. **Musik latar generatif** — karena tidak boleh mengunduh/menebak file
   audio dari internet, dibangun mesin ambience sendiri pakai Web Audio
   API (drone + angin + lonceng samar), bukan file MP3 eksternal. Kontrol
   mute + volume di header.
4. **Log & turn banner lebih tegas** — ukuran font dibesarkan, warna
   kontras ditinggikan, dianimasikan Framer Motion tiap berganti giliran.
5. **Pertanyaan arsitektur room online** — sebelum membangun, ditanya
   lewat `AskUserQuestion`: pakai backend realtime terkelola (Firebase/
   Supabase), server custom, atau ditunda dulu. User pilih backend
   terkelola → jadi requirement Tahap 5.

## Instruksi tambahan dari user di tahap ini
> kalau sudah push lagi

→ jadi aturan standing: setiap tahap perubahan selesai, langsung commit &
push, bukan menunggu diminta ulang.
