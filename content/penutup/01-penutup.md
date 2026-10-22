---
title: Rangkuman & Langkah Selanjutnya
slug: penutup
bagian: 4
modul: 29
durasi: 10 menit
titlePendek: Penutup
ringkasan: Semua yang sudah kamu pelajari, dirangkum dalam satu halaman, plus langkah nyata untuk mulai memakai Hermes hari ini.
prasyarat: [agent, izin]
diagram: d21-rangkuman
---

# Rangkuman & Langkah Selanjutnya

## Gambaran Umum

Sekarang kamu sudah melewati 5 modul fondasi AI, 7 modul AI Engineer, dan 16
modul Hermes. Itu bukan sedikit:
kamu paham cara kerja model bahasa, dan kamu paham cara menjalankan agent yang
memakai model itu untuk bekerja nyata.

Bagian ini merangkum semuanya jadi satu halaman. Kalau ada yang masih terasa kabur,
balik ke modul terkait dan baca ulang bagian Konsep Kunci. Tidak apa-apa.

## Yang Akan Kamu Pelajari

- Ringkasan lima mekanisme LLM dalam satu daftar
- Ringkasan enam belas fitur Hermes dan kapan memakainya
- Langkah konkret untuk mulai memakai Hermes hari ini
- Kesalahan umum yang akan kamu temui

## Konsep Kunci

### Lima mekanisme LLM, sekali lagi

| Konsep | Inti satu kalimat |
|---|---|
| **Pesan** | Semua obrolan = daftar pesan. System prompt di awal, user message di tengah, assistant message di akhir. |
| **Token** | Satuan kerja model. Semua biaya dan batas dihitung dalam token. Bahasa Indonesia lebih boros. |
| **Context window** | Batas token input + output. Kalau penuh, yang di tengah terlupai. |
| **Tools** | Model hanya meminta. Aplikasi yang menjalankan. Loop itu yang bikin agent. |
| **Agent** | Model memutuskan tool dan kapan berhenti. Workflow: kode yang memutuskan. |

Kalau kamu hanya ingat satu hal dari kelas ini, ingat ini: **context yang pendek dan
relevan hampir selalu menang daripada context yang panjang**.

### Enam belas fitur Hermes, dipilah

**Untuk mulai hari ini:**
- **Mulai Cepat** — instalasi, obrolan pertama, konfigurasi dasar
- **Memori** — supaya agent ingat konteks antar sesi
- **Skills** — supaya kamu tidak mengulang instruksi yang sama
- **Karakter (SOUL)** — supaya agent bicara dengan gaya yang kamu mau

**Untuk pekerjaan serius:**
- **Delegasi** — pecah pekerjaan besar jadi beberapa agent paralel
- **MCP** — sambungkan tool dari luar
- **Toolsets** — atur tool mana yang boleh dipakai
- **Plugins** — paket skill dan tool siap pakai
- **Checkpoint** — kalau salah, mundur tanpa kehilangan semua

**Untuk ke mana saja:**
- **Suara** — bicara atau diketik lewat Telegram atau Discord
- **Gateway Pesan** — Hermes hidup di chat yang kamu pakai sehari-hari
- **Jadwal** — agent bekerja sendiri saat kamu tidur
- **Provider** — pilih model sesuai kebutuhan dan biaya
- **Konteks Rujuk** — arahkan file spesifik ke dalam prompt
- **Semua Sisi** — CLI, TUI, web, desktop, ACP, dan API: pilih permukaan yang tepat
- **Izin & Hooks** — batas keamanan saat Hermes menjalankan command dan mengklik di web

### Kesalahan yang akan kamu temui

1. **Context penuh.** Gejalanya: agent lupa instruksi awal. Solusinya: pangkas riwayat, jangan tambah model.
2. **Tool gagal tapi errornya disembunyikan.** Gejalanya: agent berputar. Solusinya: kirim error ke model.
3. **Prompt bengkak.** System prompt 500 baris bikin agent lupa tugas utamanya. Solusinya: potong yang tidak dipakai.
4. **Terlalu banyak tool.** Makin banyak tool, makin lambat dan makin besar peluang salah pilih. Solusinya: pakai toolset yang sempit.
5. **Tidak ada checkpoint sebelum perubahan besar.** Hermes sudah mengambil snapshot otomatis, jadi cukup `/rollback` kalau perlu kembali.

## Perintah Praktis

Mulai dari sini, berurutan:

```bash
# 1. Instalasi + obrolan pertama
hermes setup --portal
hermes

# 2. Cek agent kamu sehat
hermes doctor
hermes status

# 3. Lihat diri sendiri: tool apa yang aktif, prompt sebesar apa
hermes tools --summary
hermes prompt-size

# 4. Simpan konteks proyek
hermes /init

# 5. Beri kepribadian
hermes /memory

# 6. Kalau mau otomatis
hermes cron create "0 9 * * *" --command "laporan harian"
```

## Catatan Penting

- Jangan skip `hermes doctor` kalau ada yang aneh. Diagnosis dulu, perbaiki kemudian.
- Terlalu banyak skill di folder skills bikin agent ragu. Mulai dari satu, tambah kalau perlu.
- Kalau agent terlalu banyak bicara, pendekkan SOUL.md-nya, jangan tambah instruksi baru.
- Checkpoint itu murah. Ambil sebelum perubahan besar, jangan setelah.
- Jadwal (cron) paling berguna kalau output-nya dikirim ke tempat yang kamu baca. Kalau tidak, outputnya hilang.

## Ekosistem

Ada repo dan tooling di sekitar Hermes: katalog skill, plugin, dashboard,
paket deployment, sampai buku panduan 21 bab. Modul
[Ekosistem Hermes](#/modul/ekosistem) memetakan semuanya, plus memberi
checklist singkat untuk menilai apakah sebuah skill atau plugin aman dipasang.

## Apa Selanjutnya

Kembali ke [Kamus AI](/kamus) untuk browse istilah yang sering muncul, lalu
[Modul 13](/modul/mulai-cepat) kalau kamu mau pasang Hermes di komputermu sendiri.

Kalau kamu selesai memakai Hermes dan punya catatan pengalaman, tulis pengalaman itu. Kursus
seperti ini jadi lebih baik dari setiap orang yang melaporkan bagian yang masih membingungkan.
