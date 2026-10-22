# Ringkasan Deliverable — Kursus "AI dari A–Z"

Dibangun: 21 Oktober 2026
Lokasi: folder proyek ini

Cara menjalankan: `bash server/run.sh` lalu buka `http://127.0.0.1:4310`.

## Yang jadi

Satu website kursus Bahasa Indonesia dengan dua bagian:

| Bagian | Isi | Sumber |
|---|---|---|
| **1. Fondasi AI** | 5 modul: Pesan & System Prompt, Token, Context Window, Tools, Agent vs Workflow | disusun sendiri |
| **2. AI Engineer** | 7 modul: Peran AI Engineer, Use Case LLM, Memilih Model, Bagaimana Model Dibuat, Mindset, Eval, 17 Teknik | disusun sendiri |
| **3. Hermes Praktis** | 16 modul: Mulai Cepat → Memori, Skills, Delegasi, MCP, Suara, Gateway, Jadwal, SOUL, Toolsets, Plugins, Checkpoints, Provider, Konteks Rujuk, Semua Sisi, Izin & Hooks | hermes-howto + learn-hermes-agent |
| **4. Penutup** | Rangkuman 30 modul + peta Ekosistem Hermes | ditulis sendiri |

**Angka:**
- 30 modul, 40.085 kata materi
- 71 istilah Kamus AI (dari mattpocock/dictionary-of-ai-coding, diterjemahkan)
- 25 diagram SVG buatan sendiri (bukan screenshot)
- 23 soal kuis + pembahasan
- 12 lab interaktif: token counter, context window, loop tool call, penyusun SOUL.md, toolset ideal, lapisan memori, cron, skill, delegasi, MCP, pilih model, simulator persetujuan

## Yang interaktif

1. **Lab Token** — ketik teks, lihat dipecah jadi token, kata mahal ditandai.
2. **Lab Context Window** — geser jumlah riwayat, lihat bar input/output dan kurva "lost in the middle".
3. **Lab Loop Tool Call** — klik jalan, animasi 6 langkah dari system prompt sampai ringkasan.
4. **Lab SOUL.md** — susun file SOUL.md, klik periksa format, dapat umpan balik.
5. **Lab Toolset** — geser jumlah tool, lihat dampaknya ke kecepatan dan ketepatan pilihan model.
6. **Kuis per modul** — 14 soal, tiap jawaban salah dapat pembahasan.
7. **Kamus AI** — 71 istilah, pencarian, tiap istilah punya penjelasan + saling terhubung.
8. **Asisten Raka** — agent Hermes sungguhan, stream jawaban, ingat konteks modul yang sedang dibaca.

## Arsitektur

```
index.html          shell 3 kolom
app/                9 modul ES, tanpa build step
content/            .md per modul + kamus.json
diagrams/sprite.svg 13 <symbol>
fonts/              Fraunces, Karla, JetBrains Mono (lokal)
vendor/             mermaid (offline, 2,5 MB)
server/serve.mjs    server statis + /api/chat (SSE ke Hermes)
tools/              generator diagram + bump cache-buster
```

Alasan tanpa framework SPA: kontennya 20 file markdown statis, dan halaman harus
bisa dibuka dari server statis mana pun. Modul ES native cukup untuk routing,
parsing, dan lab.

## Assistant Hermes

```
hermes -p kelas-ai chat --query-file - --format stream-json [--resume <id>]
```

Profil `kelas-ai` di `~/.hermes/profiles/kelas-ai`. SOUL.md mendefinisikan persona
Raka: tutor kelas AI, Bahasa Indonesia, maksimal 120 kata, tidak pernah menyebut
nama model atau detail internal.

Server menerjemahkan event JSONL Hermes jadi SSE untuk browser. Sesi dikunci
per-tab lewat `session_id`, jadi obrolan berlanjut. Kalau backend mati, panel
jatuh ke mode simulasi.

## oil UI

Skill `oil-ui` (v0.23.9) terpasang di `.agents/skills/oil-ui` dan dipakai untuk:
- 3 arah desain → halaman perbandingan → arah terpilih jadi basis
- Lint readability (kontras, panjang baris, hierarki)
- Bukti screenshot per status

Yang masih di luar cakupan oil-ui open source: pola interaksi/form produksi,
dialog, dan polish komponen ekstrem. oil-ui Pro ($9,99) covering bagian itu.

## Review independen (oil-ui langkah 4)

Reviewer independen menilai 5 aspek (keterbacaan, hierarki, mobile, interaksi, konsistensi).
Putaran pertama menemukan 13 masalah. Yang diperbaiki:

| Masalah | Perbaikan |
|---|---|
| Asisten Raka menggantung saat server error | Error ditangkap → pesan Bahasa Indonesia + batas waktu 2 menit |
| Kolom "Di halaman ini" kosong di beranda & kamus | Kolom disembunyikan saat tidak ada heading |
| Panel Raka menutupi kolom TOC | Digeser ke kiri di layar ≥1240px |
| Tombol "Tanya Raka" menutupi teks | Digeser ke kiri di layar lebar; lebih kecil di mobile |
| Kolom kanan hilang di 1280–1319px | Breakpoint turun dari 1320px ke 1240px |
| Diagram terpotong di mobile | `min-width` dihapus → diagram ikut skala |
| Tabel modul Memori kepotong | Tabel dapat digeser, `min-width` 520px |
| Kuis tidak punya skor | Kotak skor ditambahkan di halaman kuis |
| Typo ("Looks good", "huruf latin", dll.) | Dibetulkan |
| Scrollbar sidebar tebal | Scrollbar tipis (8px, custom) |
| Progres otomatis 100% saat dibuka | Progres hanya naik setelah menekan "Tandai selesai" |
| Lab kurang | Ditambah lab skill, delegasi, memori, cron, MCP (total 9 lab) |

Putaran kedua menemukan 6 masalah tersisa. Semuanya diperbaiki:

| Masalah | Perbaikan |
|---|---|
| Panel Raka menutup sendiri sebelum jawaban datang | Auto-hide dihapus total |
| Tombol "Tanya Raka" tetap menutupi TOC | Aturan CSS dipindah setelah definisi tombol, jadi cascade-nya benar |
| Skor kuis tidak pernah berubah | Kotak skor render ulang tiap event progres |
| Diagram mobile jadi 4px (tidak terbaca) | `min-width: 460px` + scroll horizontal di bawah 700px |
| Tombol menutupi teks modul di mobile | Padding bawah konten ditambah 56px |
| Sisa teks Inggris di kamus | 7 fragmen diperbaiki (recites, individually, di[email], assert, thought, tolerate, efforts) |

## Perintah

```bash
bash server/run.sh            # start + publish Tailscale
bash server/run.sh status     # cek
bash server/run.sh stop       # stop
python3 tools/build-diagrams.py   # regenerate diagram
python3 tools/bump.py             # naikkan cache-buster modul
```

Cron sudah dipasang: `@reboot` + watchdog tiap 5 menit.

## Yang perlu dikerjakan berikutnya (kalau mau)

1. Tambah modul Hermes 15+ (checkpoint contoh, workflow paralel, eval).
2. Bank soal kuis bisa diperluas ke 20 modul (sekarang 14).
3. Tambah video pendek per modul (embed YouTube) untuk murid yang lebih suka belajar lewat tontonan.
4. Progress bisa sinkron ke backend kalau mau lintas perangkat.
5. Deploy domain sendiri (Caddy sudah ada di server ini) kalau Tailscale kurang.
