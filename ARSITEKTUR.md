# Arsitektur — Kursus "AI dari A–Z"

##north-star
> Satu website yang mengajar seorang non-teknis dari "apa itu AI" sampai "saya bisa
> menjalankan Hermes sendiri", dengan bahasa Indonesia yang mudah dibaca tapi tidak
> kehilangan substansi teknisnya.

## Tujuan produk

Murid membuka satu URL. Ia membaca modul demi modul. Setiap modul punya:
- penjelasan dengan analogi
- diagram (SVG, ikut tema)
- lab interaktif
- kuis dengan pembahasan

Setelah 5 modul fondasi, ia masuk 7 modul AI Engineer, lalu 16 modul Hermes, lalu
2 modul penutup. Total 30 modul. Di akhir, ia bisa menjalankan Hermes sendiri.

## Sumber konten

| Sumber | Asal | Bahasa |
|---|---|---|
| `content/ai/01..05` | Materi fundamentals LLM (5 lesson) | ID (ditulis ulang) |
| `content/ai/06..12` | Materi AI engineering (7 bagian) | ID (ditulis ulang) |
| `content/hermes/*.md` | 1234567mm/hermes-howto + learn-hermes-agent | ID (diterjemahkan) |
| `content/penutup/*.md` | rangkuman + peta ekosistem | ID (ditulis sendiri) |

## Model konten

Setiap file markdown punya frontmatter:

```yaml
title: Memori
slug: memori
bagian: 3          # 1 = Fondasi AI, 2 = AI Engineer, 3 = Hermes, 4 = Penutup
modul: 14          # nomor global, unik, 1..30
durasi: 45 menit
titlePendek: Memori
ringkasan: satu kalimat
prasyarat: [mulai-cepat]   # pakai slug, bukan nomor
diagram: d8-memori   # id symbol di sprite.svg
```

- `bagian` → mengelompokkan di sidebar.
- `modul` → urutan global (1..30), dipakai untuk prev/next.
- `prasyarat` → daftar **slug** modul lain, bukan nomor. Jadi tidak ambigu.
- `diagram` → symbol SVG yang disisipkan di bawah "Gambaran Umum".

## Aturan penulisan konten

1. Bahasa Indonesia, sapa "kamu", kalimat pendek.
2. Struktur wajib: Gambaran Umum → Yang Akan Kamu Pelajari → Konsep Kunci →
   Perintah Praktis → Catatan Penting → Apa Selanjutnya.
3. Istilah teknis (token, tool, agent, skill) tetap Bahasa Inggris.
4. Perintah terminal, kode, nama file, opsi CLI: PERSIS, jangan diterjemahkan.
5. Label diagram Mermaid diterjemahkan, strukturnya tidak.
6. Panjang 800–1600 kata per modul.

## Arsitektur runtime

Mengapa bukan SPA framework (React/Vue)?

- Kontennya 19 file markdown statis. SPA menambah build step tanpa manfaat.
- Halaman harus bisa dibuka dari `file://` atau server statis apa pun.
- Butuh satu halaman: navigasi antar modul tanpa reload.

Pilihan: **renderer markdown kecil sendiri** (`app/markdown.js`) + modul ES.
Alasannya: lingkungan ini tidak punya akses npm yang bisa diandalkan saat runtime,
dan kita butuh kontrol penuh atas heading TOC, blok mermaid, dan penyisipan SVG.

```
mockup/
  index.html          → shell: sidebar + konten + panel asisten
  app/
    markdown.js       → parser markdown → HTML + TOC
    mermaid.js        → render diagram mermaid ke SVG
    content.js        → muat + cache file .md, urutkan, bangun indeks
    diagrams.js       → muat sprite.svg, suntik <symbol> yang dipakai
    router.js         → hash router, scroll spy, prev/next
    app.js            → bootstrap + wiring
  content/
    ai/*.md
    hermes/*.md
```

### Batas antar modul

| Modul | Tanggung jawab | Tidak boleh |
|---|---|---|
| `markdown.js` | md → HTML + TOC | tahu soal konten, DOM, router |
| `mermaid.js` | kode mermaid → SVG | tahu soal markdown |
| `content.js` | muat .md, urutkan, index | parse markdown, render DOM |
| `diagrams.js` | sprite + suntik symbol | tahu soal halaman |
| `router.js` | URL → modul, scroll, prev/next | render konten |
| `app.js` | wiring, event, state UI | business logic konten |

Prinsip: satu arah dependensi. `content` tidak tahu `router`; `router` tidak
tahu `markdown`.

### Mermaid

34 diagram mermaid di materi Hermes. Render tanpa dependensi eksternal berarti
menulis parser dari nol — terlalu besar. Solusi: pakai mermaid dari CDN saat
tersedia, dan tampilkan blok kode apa adanya kalau gagal dimuat. Konten
tidak hilang, hanya jadi kode.

## Peta halaman

```
/                        → landing: hero, peta materi, cara belajar
/modul/:slug             → satu modul: konten + lab + kuis + panel asisten
/kuis                    → bank soal gabungan, dengan skor
```

Navigasi modul pakai hash (`#/modul/memori`) supaya bisa dibuka dari file://.

## Lab interaktif

Tiga lab, semuanya tanpa dependensi:
1. **Token counter** — hitung token dari teks (heuristik lokal, jujur soal itu).
2. **Context window** — slider history length, lihat efek "lost in the middle".
3. **Tool call loop** — animasi 6 langkah tool call, klik jalan.

Lab pindah ke konten modul yang relevan, bukan halaman terpisah.

## Kuis

10 soal per bagian, diambil dari konsep kunci tiap modul. Setiap soal:
- pertanyaan + 4 pilihan
- jawaban benar + pembahasan singkat
- skor tersimpan di localStorage

## Panel asisten (Raka)

Mewakai agent Hermes milik pemilik. Backend kecil (Node) yang memanggil
`hermes -p kelas-ai chat -q ... --format stream-json`, lalu stream eventnya
ke browser lewat SSE. Sesi dikunci per-tab lewat `session_id` dari Hermes,
jadi obrolan berlanjut.

Di mode mockup (tanpa backend), panel memakai respons simulasi supaya
tampilan tetap bisa direview.

## Tema

Satu set token CSS, dua mode (terang/gelap). Diagram SVG memakai variabel
yang sama, jadi ikut berubah tanpa kerja tambahan.
