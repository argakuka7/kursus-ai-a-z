---
title: Pesan, System Prompt & Reasoning Tokens
slug: pesan
bagian: 1
modul: 1
durasi: 12 menit
titlePendek: Pesan & System Prompt
ringkasan: Cara kerja percakapan dengan LLM dari dalam: siapa bicara, siapa mendahului, dan kenapa model tampak "berpikir".
prasyarat: []
diagram: d1-pesan
---

# Pesan, System Prompt & Reasoning Tokens

## Gambaran Umum

Setiap kali kamu mengetik sesuatu ke model bahasa, yang terjadi sebenarnya jauh lebih sederhana dari yang terlihat: model membaca **daftar pesan** dan menebak pesan berikutnya. Tidak ada yang perlu dipelajari dari sistem yang rumit. Yang perlu kamu pahami cuma tiga hal: siapa yang bicara, urutan pesannya, dan di mana aturan mainnya ditulis.

Bayangkan obrolan itu sepertiseperti obrolan biasa. Kamu menjadi **user message**, model menjawab dengan **assistant message**. Kalau obrolan sudah berjalan, semua pesan itu terkumpul jadi satu riwayat panjang. Model membaca seluruh riwayat itu setiap kali kamu kirim pesan baru.

Dan kalau kamu ingin mengatur perilaku model, aturan mainnya ditulis di **system prompt** — pesan paling awal di riwayat, yang secara teknis dilihat model tapi tidak pernah kamu lihat.

## Yang Akan Kamu Pelajari

- Bedanya user message, assistant message, dan system prompt
- Kenapa system prompt menang saat bentrok dengan permintaan user
- Apa itu reasoning tokens dan di mana letaknya
- Kenapa satu pesan bisa punya banyak bagian (teks, file, tool call)
- Alur percakapan model: dari pesan kamu sampai jawaban

## Konsep Kunci

### Tiga jenis pesan

**User message** adalah pesan yang kamu kirim. **Assistant message** adalah jawaban model. **System prompt** adalah instruksi yang diletakkan paling awal, biasanya oleh whoever yang membangun aplikasi, bukan oleh pengguna.

Urutan ini penting. Model tidak punya konsep "percakapan" seperti manusia. Yang dia punya adalah daftar pesan, dan daftar itu dibaca dari atas ke bawah.

### System prompt punya otoritas lebih tinggi

Kalau system prompt bilang "jawab dalam Bahasa Indonesia" dan user minta "jawab dalam Inggris", model biasanya tetap mengikuti system prompt. Aturan dari system prompt berlaku untuk seluruh percakapan, bukan cuma untuk satu pesan.

Ini menjelaskan kenapa system prompt adalah tempat terbaik menaruh aturan, gaya bahasa, dan daftar tool. Sekali ditulis, aturan itu berlaku untuk semua balasan berikutnya tanpa perlu kamu ulang.

```text
System: Kamu adalah Raka, tutor kelas AI. Selalu jawab dalam Bahasa Indonesia.
User:   Jelaskan pakai analogi: kenapa context window itu penting?
Assistant: Bayangkan meja kerja LLM. Kalau meja penuh, file yang paling lama
          diletakkan paling sering kelupaan.
```

> Ada kalanya system prompt bisa "ditembus" — prompt yang membuatnya bocor disebut *jailbreak*. Secara teori aturan internal menang, tapi praktikamente ini kadang berhasil. Jangan andalkan itu untuk keamanan.

### Reasoning tokens

Beberapa model punya **reasoning tokens**: bagian dari jawaban assistant tempat model menghitung dulu sebelum memberi jawaban final. Ini bukan pesan terpisah. Dia bagian dari pesan assistant yang sama, seperti paragraf tambahan di awal jawaban.

Bagian ini penting karena memberi kamu satu alat tambahan: melihat proses berpikir model, bukan cuma hasil akhirnya.

### Satu pesan bisa punya banyak bagian

Pesan tidak harus cuma teks. Dia bisa membawa:

- **Teks** — pesan biasa
- **File** — PDF, gambar, dokumen, yang kamu lampirkan
- **Tool call** — permintaan model untuk menjalankan sesuatu

Kalau kamu kirim PDF dan bilang "ringkas ini", model membacanya, lalu menjawab dengan ringkasan. Alurnya sama saja: pesan masuk, pesan keluar.

### Alur tool call

Tool call adalah bagian paling penting dari modul ini, karena inilah yang membedakan aplikasi AI biasa dari agent.

```text
1. System prompt berisi definisi tool: writeFile(path, content)
2. User: "Buat file todo.md"
3. Assistant: tool call { id: call_1, args: { path: "todo.md" } }
4. Aplikasi: menjalankan tool, file benar-benar dibuat
5. User: tool result { id: call_1, result: "File todo.md dibuat" }
6. Assistant: "Selesai. Isi todo.md-nya apa yang mau kamu tambahkan?"
```

Perhatikan langkah 3 dan 4. Di langkah 3 model **hanya meminta**. Belum ada yang terjadi. Di langkah 4 barulah aplikasi kamu yang menjalankan tool-nya. Dan langkah 5 hasilnya dikembalikan ke model dengan **id yang sama** — itulah cara model tahu yang mana jawaban untuk permintaan yang mana.

Kalau tool gagal, hasilnya tetap dikembalikan, hanya isinya error. Model butuh informasi itu untuk mencoba strategi lain.

## Perintah Praktis

Lihat langsung apa yang terjadi di dalam percakapan:

```bash
# Lihat seluruh system prompt + tool schema yang sedang aktif
hermes prompt-size

# Lihat sesi yang sedang berjalan
hermes sessions list
```

## Catatan Penting

- System prompt bukan tempat yang user-facing. Kamu tidak akan pernah melihatnya di chat biasa.
- Urutan pesan itu penting. Menaruh instruksi di awal jauh lebihandal daripada di akhir.
- Tool call tanpa aplikasi yang mengeksekusinya = tidak ada yang terjadi.
- Id pada tool call dan tool result **harus sama**. Kalau tidak, model tidak tahu mana jawaban untuk permintaan yang mana.
- Error yang disembunyikan membuat model berputar. Kirimkan error, biarkan ia beradaptasi.
- File di dalam pesan assistant, bukan pesan user. User mengirim file, model mengembalikan file.

## Apa Selanjutnya

Lanjut ke [Modul 02](/modul/token), karena sekarang kamu tahu *siapa* bicara. Selanjutnya kita lihat *dengan satuan apa* model menghitung.
