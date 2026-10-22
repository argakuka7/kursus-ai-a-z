# AI dari A–Z

Kursus Bahasa Indonesia: pelajari cara kerja LLM dari dalam, lalu belajar
menjalankan agent Hermes di komputermu sendiri.

## Isi

```
ai-a-z/
├── index.html              # shell: sidebar + konten + panel asisten
├── app/                    # aplikasi (modul ES, tanpa build step)
│   ├── app.js              # bootstrap + wiring
│   ├── content.js          # muat & indeks materi
│   ├── markdown.js         # parser markdown → HTML + TOC
│   ├── diagrams.js         # sprite SVG + mermaid
│   ├── labs.js             # lab interaktif
│   ├── quiz.js             # komponen kuis + progres
│   ├── soal.js             # bank soal
│   ├── router.js           # hash router + scroll spy
│   └── styles.css          # sistem desain (tema terang/gelap)
├── content/
│   ├── ai/                 # 12 modul (5 fondasi + 7 AI Engineer)
│   ├── hermes/             # 16 modul Hermes Praktis
│   ├── penutup/            # 2 modul (rangkuman + ekosistem)
│   └── kamus.json          # 71 istilah AI
├── diagrams/               # 25 diagram SVG (generated)
├── fonts/                  # font lokal (Fraunces, Karla, JetBrains Mono)
├── vendor/                 # mermaid (offline)
├── server/serve.mjs        # server statis + endpoint /api/chat (SSE)
└── tools/
    ├── build-diagrams.py   # generator diagram SVG
    └── bump.py             # naikkan cache-buster modul ES
```

## Menjalankan

```bash
# server + publish ke Tailscale
bash server/run.sh

# buka di tailnet
# https://<host>.<tailnet>.ts.net:8449
```

Atau tanpa Tailscale:

```bash
node server/serve.mjs --port 4310
# http://127.0.0.1:4310
```

## Menambah modul

1. Buat file `content/<bagian>/<NN>-<slug>.md`.
2. Isi frontmatter:

   ```yaml
   ---
   title: Judul Modul
   slug: slug-kebab-case
   bagian: 1            # 1 = Fondasi AI, 2 = AI Engineer, 3 = Hermes, 4 = Penutup
   modul: 6             # nomor global, unik, berurutan 1..30
   durasi: 20 menit
   titlePendek: Judul Pendek   # untuk sidebar
   ringkasan: Satu kalimat.
   prasyarat: [slug-modul]   # pakai slug, bukan nomor
   diagram: d7-arsitektur       # id symbol di diagrams/sprite.svg
   ---
   ```

3. Tambahkan file ke `content/<bagian>/index.json`.
4. Kalau butuh diagram baru: tambah fungsi di `tools/build-diagrams.py`,
   lalu `python3 tools/build-diagrams.py`.

## Struktur isi modul

Wajib ada bagian ini, urutannya:

- `## Gambaran Umum` — 2–4 paragraf
- `## Yang Akan Kamu Pelajari` — 5–8 poin
- `## Konsep Kunci` — 2–5 subbagian `###`
- `## Perintah Praktis` — blok kode
- `## Catatan Penting` — termasuk jebakan umum
- `## Apa Selanjutnya` — tautan ke modul berikutnya

## Aturan bahasa

- Bahasa Indonesia, sapa "kamu", kalimat pendek, satu ide per kalimat.
- Istilah teknis (token, tool, agent, skill) tetap Bahasa Inggris.
- Perintah terminal, kode, nama file, opsi CLI: **persis** seperti sumber.
- Label diagram Mermaid diterjemahkan, strukturnya tidak.
- Panjang 800–1600 kata per modul.

Panduan lengkap: `PANDUAN-TERJEMAHAN.md`.

## Modul

| # | Judul | Bagian |
|---|---|---|
| 1–5 | Pesan & System Prompt · Token · Context Window · Tools · Agent vs Workflow | Fondasi AI |
| 6–12 | Peran AI Engineer · Use Case LLM · Memilih Model · Bagaimana Model Dibuat · Mindset · Eval · 17 Teknik | AI Engineer |
| 13–28 | Mulai Cepat · Memori · Skills · Delegasi · MCP · Suara · Gateway · Jadwal · SOUL · Toolsets · Plugins · Checkpoints · Provider · Konteks Rujuk · Semua Sisi · Izin & Hooks | Hermes Praktis |
| 29–30 | Rangkuman · Ekosistem Hermes | Penutup |

Jumlah diagram SVG: **25**. Jumlah lab interaktif: **12**. Jumlah soal kuis: **23**.
Total kata materi: **40.085**.

## Catatan materi (internal)

Materi disusun dari sumber publik: panduan LLM fundamentals dan AI engineering,
kamus AI (mattpocock/dictionary-of-ai-coding), serta panduan Hermes
(1234567mm/hermes-howto, longyunfeigu/learn-hermes-agent). Semua diagram dibuat
dari nol sebagai SVG. Referensi lengkap ada di `PANDUAN-TERJEMAHAN.md` dan
`ARSITEKTUR.md`.

## Dua versi publik: demo dan privat

`server/run.sh` menjalankan dua instance dari kode yang sama:

| Port | Publish | Hermes | Untuk |
|---|---|---|---|
| 4310 | Tailscale `:8449` | aktif | Kamu |
| 4311 | Tailscale Funnel `:443` | dimatikan | Demo klien |

Link publik lewat Tailscale Funnel, jadi URL-nya tetap sama dan tidak
berganti tiap restart. Kalau funnel tidak tersedia, `server/run.sh` jatuh ke
Cloudflare quick tunnel sebagai cadangan.

Instance publik pakai `ENABLE_ASSISTANT=0`. Efeknya: panel "Tanya Raka" dihapus
dari DOM (bukan hanya disembunyikan), dan `POST /api/chat` menjawab 503.
Tidak ada jalur dari internet ke agent Hermes.

`POST /api/chat` di instance privat punya rate limit 8 permintaan per menit per IP.

```bash
bash server/run.sh          # start kedua instance + publish
bash server/run.sh status   # cek status
bash server/run.sh stop     # stop semuanya
```

## Asisten pribadi

Panel "Tanya Raka" memanggil agent Hermes sungguhan:

```
hermes -p kelas-ai chat --query-file - --format stream-json [--resume <session_id>]
```

Profil `kelas-ai` tinggal di `~/.hermes/profiles/kelas-ai`. SOUL.md-nya
mengatur persona Raka: tutor kelas AI, Bahasa Indonesia, maksimal 120 kata.

Kalau backend mati, panel otomatis jatuh ke mode simulasi.

## Catatan tampilan

- Panel "Tanya Raka" di desktop jadi docked: menempel di tepi kanan, kolom
  "Di halaman ini" disingkirkan saat panel terbuka. Jadi panel tidak pernah
  menutupi soal kuis.
- Di layar kecil panel jadi bottom sheet di atas scrim, dan tombolnya
  jadi ikon bulat 48px supaya tidak menutupi pilihan kuis.
- Dark mode memakai hue oker yang sama dengan tema terang. Yang berubah
  cuma luminans, bukan identitas.
- Halaman depan memakai jalur belajar bernomor (bukan grid kartu), dengan
  rel amber yang tumbuh mengikuti posisi scroll.
- Kamus AI adalah daftar baris dengan panel detail di kanan, bukan 71 kartu.
- `@media print` membersihkan tampilan supaya satu modul bisa disimpan PDF.

## Lisensi

Konten adaptasi dari sumber di atas, masing-masing dengan lisinya sendiri.
Kode di repo ini: MIT.
