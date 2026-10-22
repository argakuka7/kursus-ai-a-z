---
title: Ekosistem Hermes
slug: ekosistem
bagian: 4
modul: 30
durasi: 15 menit
titlePendek: Ekosistem
ringkasan: Repo dan tooling di sekitar Hermes — skill, plugin, dashboard, deployment, dan tempat belajar lagi.
prasyarat: [karakter]
diagram: d22-ekosistem
---

# Ekosistem Hermes

## Gambaran Umum

Hermes sendiri sudah cukup lengkap. Tapi di sekitarnya ada ekosistem yang
bisa membuat agent-mu jauh lebih berguna: skill siap pakai, dashboard, paket
deployment, sampai buku panduan panjang.

Modul ini memetakan apa yang ada, supaya kamu tahu **ke mana kamu harus mendarat kalau butuh sesuatu yang belum ada di Hermes core**.

## Yang Akan Kamu Pelajari

- Di mana mencari skill dan plugin yang sudah dibuat orang lain
- Repo mana yang layak jadi rujukan belajar
- Tool deployment mana yang paling sering dipakai
- Cara menilai apakah skill atau plugin aman dipasang

## Konsep Kunci

### Inti Hermes

Ini yang sudah kamu pakai. CLI, TUI, dashboard, ACP, API server, messaging
gateway, cron, skills, memory, toolsets, plugins. Semua ada di
[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent).

Kalau ini sudah cukup, kamu tidak perlu apa-apa lain.

### Katalog skill & plugin

| Repo | Isi |
|---|---|
| `0xNyk/awesome-hermes-agent` | Direktori terbesar: 500+ skill, plugin, memory provider, tool, MCP, bridge. Punya tag `production` / `beta` / `experimental` |
| `ZeroPointRepo/awesome-hermes-skills` | 350+ tool dan memory provider |
| `aliaihub/awesome-hermes-usecases` | Use case dunia nyata, berbasis sumber primer |
| `rlaope/oh-my-hermes` | Paket skill, coding harness, long-term memory |
| `NousResearch/hermes-agent-self-evolution` | Optimasi skill & prompt otomatis pakai DSPy + GEPA |
| `NousResearch/hermes-official-plugins` | Plugin yang dibuat tim Nous |

### Permukaan tambahan

| Repo | Isi |
|---|---|
| `outsourc-e/hermes-workspace` | Web workspace: chat, terminal, memory, skills, inspector |
| `sanchomuzax/hermes-webui` | Dashboard monitoring & konfigurasi |
| `kaminocorp/hermes-alpha` | Versi Hermes yang di-deploy ke cloud |

### Deployment

| Repo | Isi |
|---|---|
| `0xrsydn/nix-hermes-agent` | Paket Nix, reproducibility tinggi |
| `xmbshwll/hermes-agent-docker` | Image Docker siap pakai |
| `0xNyk/openclaw-to-hermes` | Jalur migrasi dari OpenClaw |

### Referensi belajar

| Repo | Isi |
|---|---|
| `alchaincyf/hermes-agent-orange-book` | Buku PDF 21 bab, ada edisi Inggris dan Mandarin |
| `longyunfeigu/learn-hermes-agent` | 27 bab teknis, lisensi MIT, ada versi Inggris |
| `1234567mm/hermes-howto` | Panduan terstruktur 16 bagian Hermes |

### Belajar bahasa lain

- `Hermes-brasil/hermes-brasil` — komunitas Brasil, panduan Portugis
- `Fizh41/hermes-setup-guide` — panduan instalasi Bahasa Indonesia
- `xianyu110/awesome-HermesAgent-tutorial` — tutorial Mandarin

### Urutan yang masuk akal

Kalau kamu baru mulai, urutan ini paling hemat waktu:

1. **Pakai Hermes core dulu.** Jangan pasang apa-apa sampai kamu paham
   Fundamental, Memory, dan Skills. Kalau intinya belum dikuasai, plugin
   tambahan cuma menambah lapisan yang tidak kamu pahami.
2. **Cari satu skill untuk satu masalah yang kamu hadapi.** Bukan
   memasang 20 skill sekaligus. Skill yang tidak pernah dipakai cuma menambah
   beban konteks dan mengaburkan pilihan model.
3. **Tambah satu permukaan kalau perlu.** Butuh web? Pakai `hermes dashboard`.
   Butuh jalan di HP? Pakai gateway messaging. Butuh dibangun di aplikasimu?
   Pakai API server.
4. **Baru pindah ke ekosistem perkakas.** Skill komunitas, MCP server,
   dashboard pihak ketiga. Semua ini dibangun di atas, bukan pengganti.
5. **Terakhir, deployment yang rapi.** Kalau ini masih jalan di laptop
   pribadi kamu, mungkin belum perlu Docker atau Nix.

### Membaca daftar skill dengan kritis

Direktori skill terlihat keren, tapi sebagian besar skill dibuat untuk satu
kasus penggunaan spesifik. Sebelum memasang, tanyakan:

- Apakah skill ini sesuai dengan alur kerja **kamu**, atau cuma ide bagus?
- Apakah kamu benar-benar akan memanggilnya rutin?
- Apa yang terjadi kalau skill ini gagal di tengah jalan?
- Apakah isinya bisa kamu periksa sendiri? Skill yang isinya buram adalah
  kotak hitam yang menjalankan perintah di mesinmu.

Sikap yang aman: pasang satu, pakai satu minggu, nilai. Kalau tidak dipakai,
hapus. Skill yang menumpuk di folder lebih sering jadi masalah daripada
menolong.

### Saat tool menjadi berlebihan

Ada titik di mana menambah tool justru memperlambat. Setiap tool yang
aktif menambah definisi ke system prompt, jadi:

- Model harus membaca semuanya setiap kali ada permintaan.
- Pilihan yang terlalu banyak membuat model sering salah pilih.
- Biaya token naik di setiap panggilan.

Kalau agentmu sering memanggil tool yang salah, biasanya masalahnya bukan
"tool kurang" tapi "tool terlalu banyak dan terlalu mirip". Solusinya:
perbaiki dengan toolset yang lebih sempit, bukan dengan menambah tool.

## Perintah Praktis

Mencari skill yang cocok, dari terminal:

```bash
# Lihat skill yang sudah terpasang
hermes skills list

# Cari di direktori komunitas
hermes skills search <kata-kunci>

# Pasang skill dari repo
hermes skills install <nama-skill>

# Lihat plugin yang tersedia
hermes plugins list
```

## Catatan Penting

- **Periksa batas kepercayaan sebelum memasang apa pun.** Sebelum mengaktifkan
  skill, plugin, MCP server, atau job terjadwal dari komunitas, periksa: siapa
  bisa memicu, tool apa yang dia terima, di mana command dieksekusi,
  kredensial apa yang bisa dibaca, dan bagaimana cara menghentikannya.
- **Pakai toolset terkecil.** Kalau tugasmu tidak memang butuh akses luas, jangan
  beri akses luas. Skill yang terlihat tidak berbahaya belum tentu aman.
- **Label `production` bukan jaminan keamanan.** Label itu hasil penilaian
  dokumentasi dan adopsi, bukan audit keamanan.
- **Pastikan job tanpa pengawasan punya tujuan output.** Job cron tanpa tujuan output
  hanya membakar token.
- **Baca lisensi sebelum pakai ulang.** Sebagian repo berlisensi MIT, sebagian
  CC BY-SA, sebagian tanpa lisensi jelas. Yang tanpa lisensi: jangan pakai
  ulang teksnya.
- **Ekosistem bergerak cepat.** Cek tanggal update sebelum bergantung pada
  sebuah repo.

## Apa Selanjutnya

Kembali ke [Kamus AI](#/kamus) untuk istilah yang baru kamu temui, atau
[Modul 29 — Rangkuman](#/modul/penutup) untuk merangkum semuanya.
