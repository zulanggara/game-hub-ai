# Tahap 8 — Crash di HP via LAN → Secure Context Fallback

## Prompt asli
> *(screenshot HP)* error on lan/other device ketika klik multiplayer

Error yang tertangkap `ErrorBoundary`: `crypto.randomUUID is not a
function`.

## Diagnosis
`crypto.randomUUID()` **hanya tersedia di secure context** (HTTPS atau
`localhost`). Mengakses lewat IP LAN via HTTP biasa (`http://192.168.x.x`,
persis skenario Tahap 4) bukan secure context di banyak browser mobile —
fungsi itu jadi `undefined` dan melempar error tepat saat `getClientId()`
dipanggil untuk fitur room online.

## Yang dilakukan
- Fallback berjenjang: `crypto.randomUUID()` → `crypto.getRandomValues()`
  (tersedia di context tidak-aman juga) → `Math.random()` sebagai
  penyelamat terakhir. Diekstrak jadi `src/lib/clientId.ts` supaya dipakai
  bersama semua game.
- `navigator.clipboard` (tombol "Salin Kode") punya masalah serupa
  (Clipboard API juga butuh secure context) — ditambah fallback
  `document.execCommand('copy')` + feedback visual "Tersalin!".

## Pelajaran
Karena web ini memang ditujukan diakses dari banyak device via WiFi lokal
(bukan cuma `localhost`), semua Web API yang secure-context-only harus
dicek fallback-nya dari awal, bukan ditambal satu-satu — ini jadi bagian
standar `lib/clientId.ts` yang dipakai ulang di Tacta & Bookshelf.
