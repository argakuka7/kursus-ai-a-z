---
title: Context Window: Batas Ingatan Model
slug: context-window
bagian: 1
modul: 3
durasi: 12 menit
titlePendek: Context Window
ringkasan: Apa itu context window, kenapa model bisa kehabisan token di tengah jawaban, dan kenapa konteks lebih pendek hampir selalu lebih baik.
prasyarat: []
diagram: d3-lost-middle
---

# Context Window: Batas Ingatan Model

## Gambaran Umum

Bayangkan kamu sedang ngobrol dengan seseorang yang sangat pintar, tapi ingetannya cuma lima menit. Setiap kalimat yang diucapkan orang itu, dia ingat. Tapi begitu obrolan sudah terlalu panjang, kalimat-kalimat awal keluar dari kepalanya. Lebih buruk, dia tidak memberi tahu. Dia tetap bicara dengan nada yakin, padahal sebagian besar dari yang dia ingat sudah hilang.

LLM bekerja persis seperti itu. Ada batas keras berapa banyak yang bisa dia "lihat" pada satu waktu. Batas itu disebut **context window**.

Isi context window itu sederhana: input token plus output token. Input token mencakup system prompt, definisi tool, dan seluruh riwayat percakapan. Output token adalah jawaban model itu sendiri. Jadi context window bukan sekadar ruang masuk, tapi ruang masuk sekaligus ruang keluar.

Konsekuensinya besar. Kalau kamu ingin ngobrol lama, atau menyuapi model dengan banyak dokumen, kamu diam-diam sedang memakai kuota yang sama dengan jawaban yang ingin kamu dapat.

## Yang Akan Kamu Pelajari

- Apa itu context window dan apa saja yang masuk ke dalamnya
- Kenapa input dan output token berbagi satu kuota
- Batas keras yang sudah ditentukan di dalam model
- Error yang muncul saat konteks melebihi batas
- Kenapa jawaban bisa mentok di tengah jalan
- Masalah "lost in the middle" dan kenapa makin parah pada konteks besar
- Kenapa konteks pendek dan relevan menang dari konteks besar

## Konsep Kunci

### Definisi context window

Context window adalah gabungan token input dan token output yang bisa dilihat model dalam satu waktu.

```text
Context window = input tokens + output tokens

Input tokens  : system prompt
              + definisi tool
              + seluruh riwayat percakapan
              + pesan user terbaru

Output tokens : jawaban model
```

Perhatikan bahwa definisi tool masuk hitungan. Kalau aplikamu mendaftarkan 20 tool dengan skema yang panjang, semuanya memakan kuota sebelum percakapan dimulai.

### Setiap model punya batas keras

Batas ini ditentukan di dalam model dan tidak bisa dinegosiasikan. Model satu bisa punya 8.000 token, model lain bisa lebih dari 100.000. Kamu tidak bisa menambahkannya.

Akibatnya, percakapan yang panjang selalu berakhir di batas ini: semakin banyak pesan yang masuk ke riwayat, semakin banyak token yang terpakai, dan pada akhirnya kuota habis.

### Melewati batas menghasilkan error

Kalau kamu mengirim permintaan yang total input token-nya sudah melebihi batas, API akan mengembalikan error. Kamu tidak akan mendapat jawaban, hanya penolakan.

Yang lebih sering terlewat: batas bisa terlampaui di tengah proses. Pesan yang sedang ditulis bisa mulai di dalam batas, lalu mentok sebelum selesai karena output token-nya tidak cukup ruang.

```text
Input  : 7.900 token
Batas  : 8.000 token
Sisa   : 100 token untuk output

Model mulai menjawab, lalu berhenti di 100 token pertama.
```

Hasilnya, jawaban yang terpotong di tengah kalimat. Tidak ada error yang eksplisit, tapi jawabannya jadi tidak utuh.

### Model tidak bisa melewati batas sendiri

Model ini tidak cukup pintar untuk menemukan jalan keluar dari batasnya sendiri. Dia tidak bisa memutuskan "ah, bagian awal tidak penting, saya lewati saja". Dia akan tetap mencoba memproses semuanya, lalu gagal atau terpotong.

Akibatnya, tugas memangkas konteks jatuh ke kamu. Periksa dulu jumlah token sebelum memanggil model, dan putuskan sendiri apa yang layak dibuang.

### Masalah "lost in the middle"

Ini masalah paling besar dari context window, dan bukan soal batas. Yang ini soal kualitas.

Kalau kita lihat riwayat percakapan sebagai lingkaran-ringkaran (masing-masing satu pesan), polanya seperti ini:

```text
[ Awal riwayat ]    ->  pengaruh besar
[ Pertanyaan ]      ->  pengaruh kecil
[ Konteks tengah ]  ->  pengaruh kecil
[ Pesan terakhir ]  ->  pengaruh besar
```

Pesan di awal dan pesan di akhir punya pengaruh besar terhadap jawaban. Pesan di tengah sering diabaikan. Ini yang disebut **lost in the middle**.

Efeknya makin parah seiring context window makin besar. Model dengan 1 juta token bukan model yang "menyimpan 1 juta token dengan rapi". Justru di dalam konteks sebesar itu, sebagian besar isinya bisa terlewat.

### Context besar bukan jaminan hasil bagus

Ini kesimpulan paling penting dari modul ini. Jangan menilai model hanya dari angka context window-nya. "128.000 token, keren" bukan alasan yang cukup.

Model dengan context window besar masih punya masalah lost in the middle. Dia masih bisa kesulitan mengambil informasi dari context window-nya sendiri. Kalau kamu menaruh 100 dokumen di dalam konteks, dia bisa saja tidak menemukan bagian yang tepat.

Hampir selalu, konteks yang lebih pendek dan lebih relevan menghasilkan jawaban yang lebih tajam. Padranya: potong yang tidak perlu, simpan yang relevan, ulang yang penting di bagian paling awal atau paling akhir.

## Perintah Praktis

Periksa pemakaian token sebelum dan sesudah percakapan panjang:

```bash
# Berapa yang sudah dipakai system prompt + tool schema saat ini
hermes prompt-size

# Total input/output token dan biaya 7 hari terakhir
hermes insights --days 7

# Sesi yang boros token, untuk ditinjau dan dipangkas
hermes sessions export --format jsonl - --min-tokens 50000 --dry-run

# Lihat daftar sesi yang aktif beserta ukurannya
hermes sessions list --limit 10
```

Di aplikasi kamu sendiri, selalu lakukan dua hal: hitung token prompt sebelum mengirim, dan sediakan jalur untuk memotong riwayat lama kalau kuota hampir habis.

## Catatan Penting

- Context window adalah input plus output. Menjawab panjang berarti mengurangi ruang untuk input.
- Batasnya keras dan spesifik per model. Jangan menulis kode yang mengira request pasti muat.
- Pesan yang mentok di tengah jalan gagal tanpa error yang jelas. Periksa jawaban yang selalu terpotong.
- Model tidak akan mencari jalan keluar sendiri. Pemangkasan konteks itu tugasmu, bukan tugasnya.
- "Lost in the middle" nyata. Informasi penting diletakkan di awal atau akhir riwayat, bukan di tengah.
- Context window besar membuat masalah lost in the middle makin parah, bukan makin ringan.
- Singkat dan relevan menang atas banyak dan berantakan. Pangkas konteks sebelum menambah model.

## Apa Selanjutnya

Lanjut ke [Modul 04](/modul/tools), karena sekarang kamu paham batas memori model. Selanjutnya kita lihat bagaimana model bisa melakukan sesuatu di luar dunia teks.
