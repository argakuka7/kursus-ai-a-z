---
title: Hermes dari Semua Sisi
slug: semua-sisi
bagian: 3
modul: 27
durasi: 35 menit
titlePendek: Semua Sisi
ringkasan: CLI, TUI, web, desktop, ACP, dan API — semua permukaan Hermes, plus cara memilih yang tepat untuk kebutuhanmu.
prasyarat: [mulai-cepat, suara]
diagram: d14-permukaan
---

# Hermes dari Semua Sisi

## Gambaran Umum

Sering kali orang mengira Hermes itu "program terminal". Padahal Hermes punya
beberapa permukaan: satu agent yang sama, diakses dari tempat berbeda.

Bedanya bukan di otaknya, tapi di **shell-nya**. Otak Hermes selalu sama: model
LLM, daftar tool, konteks, memori. Yang berubah adalah tempat kamu mengetik dan
tempat hasilnya tampil.

Tiga permukaan yang paling sering dipakai:

- **CLI/TUI** — di terminal. Untukmu yang sudah nyaman di server, ini paling cepat.
- **Web & Desktop** — di browser atau aplikasi. Untukmu yang mau pakai dari
  laptop sendiri, HP, atau tablet.
- **Messaging** — di Telegram, Discord, Slack. Untukmu yang sudah hidup di chat
  searian dan mau Hermes tanpa pindah aplikasi.

Modul ini menjelaskan masing-masing, lalu memberi panduan memilih.

## Yang Akan Kamu Pelajari

- Perbedaan mendasar antara CLI, TUI, web, desktop, ACP, dan API
- Kapan memilih yang mana
- Cara menjalankan Hermes di server, lalu mengaksesnya dari mana saja
- Kenapa session, memory, dan skill tetap terbaca lintas permukaan

## Konsep Kunci

### Satu agent, banyak pintu

Bayangkan Hermes sebagai orang yang sama dengan satu buku catatan, tapi kamu
bicara lewat telepon, sms, atau face-to-face. Orangnya sama, otaknya sama,
buku catatannya juga sama. Yang berubah cuma titik tengahnya.

Inilah yang membuat Hermes bisa hidup di server tapi tetap bisa kamu ajak dari
HP. Agent-nya jalan di server. Kamu cuma berbeda pintu untuk mengetuk.

### CLI: terminal interaktif

CLI Hermes punya dua peningkatan penting dibanding program terminal biasa.

Pertama, **area input dikunci di bawah** dan output bergulir ke atas. Saat kamu
menjalankan tool, spinner-nya muncul di baris yang tepat tanpa menggeser
ketikanmu. Perintah seperti `print()` yang biasanya merusak cursor, sudah
diperbaiki.

Kedua, **streaming**. Model tidak lagi mengembalikan jawaban utuh dalam satu
kali. Setiap potongan teks yang dihasilkan langsung ditampilkan. Kamu melihat
jawaban tumbuh, bukan menunggu 30 detik lalu menerima 2.000 kata sekaligus.

```bash
# Masuk ke sesi interaktif
hermes

# Sekali jalan, lalu keluar
hermes -z "ringkas README.md ini jadi 3 poin"

# Ganti model di tengah sesi
/model

# Lihat perintah yang tersedia
/help
```

### TUI: antarmuka full-screen

TUI (Text User Interface) adalah mode terminal yang mengambil alih seluruh
layar, seperti aplikasi, bukan seperti baris perintah. Ada panel status, daftar
sesi di samping, dan panel output yang bisa dipisah.

Bedanya dengan CLI: TUI lebih cocok untuk sesi panjang. Kalau kamu mengerjakan
satu proyek selama berjam-jam, TUI menampilkan semuanya sekaligus tanpa
mengscroll ke atas mencari konteks.

```bash
hermes --tui
```

### Web: dashboard di server

Untuk akses lewat browser, perintahnya adalah `hermes dashboard`. Ini dashboard
web lengkap: kelola konfigurasi, API key, sesi, dan pantau agent yang sedang
jalan.

```bash
# Jalankan dashboard web
hermes dashboard --port 9119

# Lalu buka http://localhost:9119 di browser
```

Supaya bisa diakses dari perangkat lain, pakai tunneling:

```bash
# Opsi 1: Tailscale (dianjurkan — jaringan pribadi, tidak publik)
tailscale serve --bg 9119

# Opsi 2: Cloudflare (publik, perlu autentikasi di depan)
cloudflared tunnel --url http://127.0.0.1:9119
```

Satu hal penting soal keamanan: kalau Hermes di-bind ke alamat yang bukan
loopback, Hermes **menolak jalan** kalau belum ada auth provider yang
terdaftar. Ini proteksi bawaan, bukan sesuatu yang harus kamu ingat. Kalau
bind publik memang kamu mau, daftarkan dulu auth provider-nya lewat
`hermes setup`.

### Desktop: aplikasi native

Hermes Desktop adalah aplikasi untuk mesinmu sendiri. Di sini kamu menjalankan
Hermes di **komputermu sendiri**, bukan di server. Tool bisa menulis ke file
lokalmu secara langsung, tanpa bridge.

Konsekuensinya penting: Hermes Desktop punya akses penuh ke mesinmu. Kalau
skill atau plugin yang kamu pasang melakukan hal berbahaya, itu mesin lokalmu
yang terkena. Di mode server, agent punya akses ke server — dan kalau server
kamu punya kredensial, itu juga bahaya.

```bash
# Lihat apakah desktop sudah terpasang
hermes desktop --help
```

### ACP: untuk editor kode

ACP (Agent Client Protocol) membuat Hermes bisa dipakai dari editor yang
support protokol ini: **VS Code, Zed, dan JetBrains**. Bedanya dengan CLI
biasa: editor yang tahu struktur kode kamu, jadi Hermes dapat konteks yang
jauh lebih baik.

```bash
# Jalankan mode ACP untuk editor
hermes acp
```

Cocok kalau kamu sudah terbiasa dengan Cody atau tool AI di editor, dan mau
Hermes sebagai gantinya dengan model pilihanmu.

### API: untuk pemrograman

Kalau kamu membangun aplikasi di atas Hermes, jalurnya lewat **API server
OpenAI-compatible**. Hermes punya adapter `api_server` yang menyediakan endpoint
seperti `/v1/chat/completions`, supaya klien OpenAI yang sudah ada bisa
langsung bicara dengan Hermes.

```bash
# Set API key untuk adapter API server (minimal 16 karakter, simpan di .env)
hermes config set API_SERVER_KEY "kunci-rahasia-kamu-minimal-16-karakter"

# Aktifkan adapter-nya
hermes config set gateway.api_server.enabled true

# Jalankan gateway (adapter api_server aktif di port 8642)
hermes gateway
```

Tanpa `API_SERVER_KEY` yang cukup panjang, adapter API server tidak akan start —
Hermes menolaknya dengan pesan yang jelas, bukan diam-diam gagal. Klien kamu
lalu mengirim `Authorization: Bearer <key>` ke `http://localhost:8642/v1`.

Perhatikan bedanya dengan `hermes serve`: `serve` adalah backend
JSON-RPC/WebSocket untuk Desktop dan klien remote, dan **tidak pernah membuka
UI browser**. Yang kamu pakai untuk web adalah `dashboard`.

### Memilih permukaan yang tepat

| Kalau kamu… | Pakai |
|---|---|
| Bekerja di server, sudah di terminal | CLI |
| Sesi panjang dengan banyak konteks | TUI |
| Ingin akses dari HP atau laptop sendiri | Dashboard + Tailscale |
| Mau Hermes jalan di laptop tanpa server | Desktop |
| Coding di editor dan mau konteks file | ACP (VS Code, Zed, JetBrains) |
| Membangun aplikasi sendiri | API server OpenAI-compatible |
| Sudah hidup di Telegram/Discord | Messaging |

### Yang tetap sama di semua permukaan

Ini yang paling sering terlewat: **memori dan skill bersifat global**.

Skill yang kamu pasang di server, langsung muncul di Telegram. Memory yang
tercatat saat kamu chat dari HP, terbaca lagi waktu kamu buka terminal.
Session berbeda, tapi otaknya sama.

Jadi kamu bisa berpindah permukaan di tengah pekerjaan tanpa kehilangan
konteks. Mau lanjut kerja terminal? Buka terminal. Mau tanya dari HP sambil
di perjalanan? Chat saja. Skill dan memory-mu tetap ada.

## Perintah Praktis

```bash
# Cek permukaan yang tersedia di Hermes kamu
hermes --help
hermes dashboard --help
hermes serve --help

# Lihat sesi yang tersimpan (berlaku lintas permukaan)
hermes sessions list

# Cek dashboard yang sedang jalan
curl -s http://127.0.0.1:9119/api/status
```

## Catatan Penting

- `hermes serve` bukan web UI. Itu backend JSON-RPC untuk Desktop. Untuk browser, pakainya `hermes dashboard`.
- Bind ke alamat publik selalu butuh auth provider. Hermes berhenti jalan kalau belum ada yang terdaftar.
- Desktop memberi agent akses lokal penuh. Skill dari komunitas layak dicek dulu sebelum dipasang.
- Satu proses gateway bisa menjalankan banyak adapter sekaligus: CLI, Telegram, Discord, dan API server.
- Berpindah permukaan tidak mengacak sesi. Sesi terakhir masih ada — pakai `hermes sessions list` untuk menemukan.
- Terminal backend (Docker, Modal, Daytona) menentukan **di mana** command agent berjalan, bukan di agent mana yang kamu bicara. Bahas ini di modul berikutnya.

## Apa Selanjutnya

Lanjut ke [Modul 28 — Izin & Hooks](/modul/izin), supaya saat
Hermes mulai mengklik dan menjalankan command di mesinmu, kamu tahu persis di
mana batasnya.
