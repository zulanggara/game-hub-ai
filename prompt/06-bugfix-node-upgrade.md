# Tahap 6 — Dev Server Crash → Upgrade Node 18 → 22

## Prompt asli
> (node:22151) Warning: An error event has already been emitted on the
> socket. Please use the destroy method on the socket while handling a
> 'clientError' event.
> (Use `node --trace-warnings ...` to show where the warning was created)

## Diagnosis
Warning generik Node soal socket error tidak seharusnya mematikan proses.
Ditanya ke user (`AskUserQuestion`): apakah server tetap jalan, lambat,
atau crash total? Jawaban: **crash total**. Sepanjang sesi sebelumnya juga
berulang kali muncul warning `EBADENGINE` dari dependency (`create-vite`,
`@firebase/*`, `eslint-visitor-keys`) yang minta Node ≥20 — sementara
sistem masih Node **v18.20.8** (dari Homebrew `node@18`, bukan dari `nvm`
yang ternyata terpasang tapi tidak pernah di-load ke shell).

## Yang dilakukan
- Install `node@22` via Homebrew (`brew install node@22`), unlink
  `node@18`, link `node@22`.
- Ketemu akar penyebab PATH: `~/.zshrc` punya baris eksplisit
  `export PATH="/opt/homebrew/opt/node@18/bin:$PATH"` yang selalu
  memprioritaskan Node 18 di atas apa pun — diedit jadi `node@22`.
- Reinstall `node_modules` bersih di Node 22 → tidak ada lagi warning
  `EBADENGINE`.

## Hasil
Build/typecheck/lint tetap bersih di Node 22, dan (kemungkinan besar)
bug crash socket itu sendiri adalah bug lama Node 18 yang sudah diperbaiki
di versi lebih baru.
