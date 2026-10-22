---
title: "Tools: Menghubungkan LLM dengan Mesin Kamu"
slug: tools
bagian: 1
modul: 4
durasi: 12 menit
titlePendek: Tools
ringkasan: Cara kerja tool pada LLM, kenapa tool call hanyalah permintaan, dan bagaimana hasilnya dikembalikan ke model.
prasyarat: []
diagram: d4-tool-loop
---

# Tools: Menghubungkan LLM dengan Mesin Kamu

## Gambaran Umum

LLM pada dasarnya hanya bisa memprediksi teks berikutnya. Dia tidak bisa membaca file di laptop kamu, tidak bisa menjalankan perintah, dan tidak bisa mengirim pesan ke server lain. Semua kemampuan itu datang dari luar model, lewat mekanisme yang namanya **tool**.

Mekanismenya sendiri tidak ajaib. Saat kamu "memberi tool ke LLM", yang kamu lakukan sebenarnya adalah menyisipkan deskripsi tool ke dalam system prompt. Deskripsi itu dibaca model seperti teks biasa. Tidak ada sihir, tidak ada channel tersembunyi. Cuma teks.

Begitu deskripsi tool ada di system prompt, model mulai punya pilihan baru. Dia bisa memilih salah satu tool itu, lalu mengeluarkan **tool call**: pesan berisi nama tool, id, dan argumen. Yang perlu kamu ingat sedalam-dalamnya: tool call itu **permintaan**, bukan kejadian. Belum ada file yang ditulis, belum ada perintah yang dijalankan.

Aplikasi kamulah yang menjalankan tool itu. Setelah selesai, hasilnya dikirim balik ke model sebagai **tool result**, memakai id yang sama dengan tool call tadi. Model membaca hasilnya, lalu menjawab. Loop sederhana inilah yang membuat aplikasi seperti Claude Code atau Cursor bisa bekerja: model meminta, aplikasi mengeksekusi, model membaca hasil.

## Yang Akan Kamu Pelajari

- Kenapa LLM butuh tool untuk melakukan sesuatu, bukan cuma menjawab
- Tiga bagian wajib dari setiap definisi tool
- Peran JSON Schema dalam menjelaskan parameter tool
- Bedanya tool call (permintaan) dan tool execution (eksekusi)
- Cara mengembalikan tool result dengan id yang benar
- Kenapa error harus dikirim balik ke model, bukan disembunyikan
- Enam langkah lengkap dari system prompt sampai ringkasan akhir

## Konsep Kunci

### Tool adalah deskripsi, bukan kemampuan

Tool itu ibarat daftar kemampuan yang kamu tulis di system prompt. Kamu menulis, misalnya: "Kamu punya akses ke tool berikut." Lalu kamu tempelkan definisinya.

Model tidak punya akses ke file system kamu. Model juga tidak punya channel komunikasi ke server mana pun. Yang dia punya adalah daftar tool, dan daftar itu di-inject ke system prompt, di atas informasi lain yang sudah kamu tulis di sana.

Jadi memberitahu model tentang tool itu sama pentingnya dengan menulis instruksi biasa. Kalau deskripsinya kabur, model akan salah pilih atau tidak pernah memakainya. Kalau deskripsinya detail, model akan memakainya dengan benar.

### Tiga bagian wajib setiap definisi tool

Setiap tool punya tiga bagian: **nama**, **deskripsi**, dan **parameter**.

```json
{
  "name": "writeFile",
  "description": "Tulis isi ke sebuah file di file system",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Lokasi file yang akan ditulis"
      },
      "content": {
        "type": "string",
        "description": "Isi file"
      }
    },
    "required": ["path", "content"]
  }
}
```

Parameter ditulis dalam **JSON Schema**. Artinya kamu bisa menulis tipe sederhana seperti string, number, boolean, dan array, maupun tipe kompleks seperti object bersarang. Model akan menghasilkan argumen yang sesuai dengan skema itu.

Kuncinya: deskripsi itu bukan hiasan. "Tulis isi ke sebuah file" jauh lebih berguna daripada "writeFile". Deskripsi yang jelas membuat model paham kapan tool ini harus dipakai.

### Tool call hanya permintaan

Setelah deskripsi tool tersedia, model memilih sendiri tool yang cocok. Kamu tidak perlu memaksa "panggil tool ini". Cukup kirim permintaan biasa, misalnya "Buat file baru bernama .gitignore".

Model membalas dengan pesan assistant yang berisi tool call:

```json
{
  "id": "call_1",
  "name": "writeFile",
  "arguments": {
    "path": ".gitignore",
    "content": ""
  }
}
```

Perhatikan, ini baru permintaan. Yang terjadi di dunia nyata: **belum ada**. Tidak ada file yang dibuat. Model cuma bilang, "Aku mau panggil writeFile dengan argumen ini."

Di titik inilah banyak orang salah paham. Mereka mengira model sudah mengerjakan sesuatu. Model tidak punya akses ke mesin kamu. Dia cuma bisa menulis pesan. Selalu ada pihak ketiga, yaitu aplikasi kamu, yang mengeksekusi.

### Tool result: kirim balik dengan id yang sama

Aplikasi kamu membaca tool call, menjalankan tool yang sesuai, lalu mengirim balik hasilnya. Hasil dikirim sebagai pesan user dengan **id yang sama** dengan tool call sebelumnya.

```json
{
  "tool_call_id": "call_1",
  "content": "File .gitignore dibuat, 0 byte"
}
```

Id itu yang mengikat permintaan dengan jawabannya. Kalau id-nya berbeda atau hilang, model tidak tahu hasil mana untuk permintaan mana, dan percakapan ini akan kacau.

Soal error, aturan ini penting: **error harus dikembalikan ke model, bukan disembunyikan**. Kalau file sudah ada dan tool gagal, kirim pesan error itu apa adanya sebagai tool result. Model butuh tahu apa yang salah supaya dia bisa mencoba strategi lain, misalnya membaca file yang ada dulu sebelum menulis. Kalau kamu swallow error-nya, model tidak punya bahan untuk beradaptasi dan cenderung mengulang permintaan yang sama.

### Enam langkah loop tool

Alur lengkapnya selalu sama:

```text
1. Definisi tool ada di system prompt ("Kamu punya akses ke tool berikut")
2. User mengirim permintaan ("Buat file baru bernama .gitignore")
3. Model membuat tool call { id, name, arguments }
4. Aplikasi menjalankan tool di mesin
5. Aplikasi mengirim tool result dengan id yang sama
6. Model membaca seluruh riwayat dan memberi ringkasan
```

Langkah 6 penting. Setelah hasil sampai, model tidak berhenti di situ. Dia meringkas untuk pengguna, atau langsung melangkah ke tool call berikutnya kalau task-nya belum selesai.

Inilah gunanya tools: cara membuat LLM menghasilkan pesan dengan format tertentu yang bisa kamu tangkap dan jalankan. Dari situ, aplikasi apa pun bisa dibangun: hanya loop di atas, plus logika kecil di sekelilingnya.

## Perintah Praktis

Lihat sendiri bagaimana tool bekerja di Hermes:

```bash
# Tool apa saja yang aktif, per platform
hermes tools list

# Ringkasan tool per platform
hermes tools --summary

# Seberapa besar system prompt dan tool schema yang dimuat
hermes prompt-size

# Amati tool call dan tool result apa adanya
hermes chat -q "Buat file /tmp/latihan.txt yang berisi satu baris teks" --format stream-json
```

Output perintah terakhir keluar sebagai JSONL, satu event per baris. Event `tool_use` adalah tool call. Event `tool_result` adalah hasil yang dikembalikan ke model:

```text
{"type": "tool_use", "name": "write_file", "input": {"path": "/tmp/latihan.txt", "content": "..."}}
{"type": "tool_result", "name": "write_file", "output": "{\"files_modified\": [\"/tmp/latihan.txt\"]}", "is_error": false}
```

## Catatan Penting

- Tool call tanpa aplikasi yang mengeksekusinya sama dengan tidak menjalankan tool. Model hanya bisa meminta.
- Id pada tool call dan tool result harus sama persis. Ini satu-satunya penanda yang mengikat dua sisi percakapan.
- Jangan pernah menyembunyikan error dari model. Error adalah informasi, bukan kegagalan yang perlu ditutupi.
- Terlalu banyak tool membuat prompt bengkak dan biaya naik. `hermes prompt-size` menunjukkan berapa byte yang dipakai tool schema.
- Deskripsi tool yang kabur adalah penyebab paling umum tool tidak pernah terpakai. Tuliskan kapan tool itu harus dipakai, bukan hanya apa yang dilakukan.
- Tool punya akses ke mesin kamu. Beri izin secukupnya, dan jangan pernah menaruh tool yang menulis file di server produksi tanpa review. Tool juga boleh dipanggil berkali-kali, jadi siapkan batas iterasi supaya loop tidak berputar tanpa henti.

## Apa Selanjutnya

Lanjut ke [Modul 05](/modul/agent), karena sekarang kamu tahu cara memberi tool ke model. Selanjutnya kita lihat siapa yang memutuskan langkah berikutnya.
