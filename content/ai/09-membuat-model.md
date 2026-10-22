---
title: "Bagaimana Model Dibuat?"
slug: membuat-model
bagian: 2
modul: 9
durasi: 15 menit
titlePendek: Bagaimana Model Dibuat
ringkasan: Parameter, pre-training, post-training, inference, dan sampling strategy, dibedah dari nol.
prasyarat: []
diagram: d16-llm
---

# Bagaimana Model Dibuat?

## Gambaran Umum

Bayangkan sebuah LLM sebagai file kompresi raksasa, kira-kira seperti zip berukuran 1 TB. Bedanya, kalau zip berisi file, file ini berisi angka. Ribuan miliar angka floating point 16-bit. Angka-angka itu disebut **parameter**, dan itulah seluruh isi model.

Parameter adalah "otak" model. Dia lahir dari satu proses yang namanya **pre-training**: proses kompresi data teks masif menjadi angka-angka itu. Jadi model pada dasarnya adalah hasil kompresi pengetahuan manusia ke dalam bentuk yang bisa dihitung.

Ukuran otak itu penting. Model 70 miliar parameter berjalan sekitar 10 kali lebih lambat daripada model 7 miliar parameter. Di situlah letak trade-off ukuran versus kecepatan, dan di situ juga alasan memilih model bukan soal "mana yang paling besar".

Yang perlu kamu ingat: kamu tidak perlu paham matematikanya untuk memakainya dengan baik.

## Yang Akan Kamu Pelajari

- Apa itu parameter dan kenapa isi seluruh model bahasa adalah angka
- Peran pre-training dan post-training dalam pembuatan model
- Kenapa post-training itu wajib, bukan pelengkap
- Apa yang sebenarnya terjadi saat inference
- Empat sampling strategy dan kapan kamu boleh menyentuhnya
- Peran tokenizer dan kenapa input selalu dipecah jadi token
- Angka kasar di balik satu siklus training

## Konsep Kunci

### 1. Parameter: otak model

Parameter adalah angka-angka yang menyimpan semua yang dipelajari model. Bukan program, bukan aturan, tapi angka hasil latihan yang sangat banyak.

Jumlah parameter menentukan ukuran otak. Model 7 miliar parameter punya otak yang jauh lebih kecil dari model 70 miliar parameter. Otak yang lebih besar umumnya lebih pintar, tapi butuh lebih banyak waktu dan memori untuk bekerja. Trade-off ukuran versus kecepatan ini yang akan kamu rasakan langsung di API: model besar itu lambat dan mahal per token.

### 2. Cara membuat model: training

Ada dua tahap, dan keduanya wajib.

**Pre-training** memberi model pengetahuan. Data teks dalam jumlah masif, misalnya 10 TB, diproses untuk mengompres pengetahuan itu menjadi parameter. Ini tahap paling lama dan paling mahal.

**Post-training** membentuk kepribadian dan perilaku model. Di tahap ini model belajar mengikuti instruksi dan meniru contoh-contoh yang baik.

Tanpa post-training, model cuma gumpalan pengetahuan. Dia tahu banyak hal, tapi tidak tahu harus bersikap sebagai asisten. Dia bisa menjawab pertanyaan, tapi tidak bisa mengikuti instruksi.

Jadi post-training bukan pelengkap. Di sinilah model belajar berubah jadi asisten yang bisa diperintah.

### 3. Inference: memakai model

Inference adalah proses mengirim teks ke model dan menerima jawaban balik. Di balik layar, ada inference function: perangkat lunak yang jalan di atas parameter itu untuk mencari token berikutnya.

Inilah yang membedakan inference dari pre-training. Inference jauh lebih murah, dan bisa jalan di laptop sendiri. Setiap kali kamu chat dengan model, kamu sedang menjalankan inference.

### 4. Sampling strategy: cara model memilih token berikutnya

Model tidak "mengambil jawaban" dari daftar. Dia menghitung probabilitas, lalu memilih satu token. Cara pilihnya disebut sampling strategy. Ada empat yang penting:

- **Greedy.** Selalu ambil token yang paling mungkin. Hasilnya paling konsisten, tapi bisa repetitif.
- **Top-K.** Ambil dari K token teratas, lalu pilih salah satunya secara acak.
- **Top-P.** Ambil dari kumpulan token yang bersama-sama mencakup P persen dari total probability mass.
- **Temperature.** Memasukkan unsur acak ke dalam perhitungan. Makin rendah, makin mirip greedy. Makin tinggi, makin beragam dan makin berisiko.

Biasanya kamu tidak bisa mengganti strateginya. Yang bisa kamu tweak hanya temperature. Kalau butuh kontrol lain, kamu bekerja di level prompt.

### 5. Tokenizer: kenapa input selalu dipecah

Teks yang kamu kirim tidak langsung masuk ke engine. Dia di-tokenize dulu. Tiap model punya tokenizer sendiri, jadi pemotongan kata bisa berbeda antar model.

Konsekuensinya nyata: jumlah token untuk teks yang sama bisa berbeda di model yang berbeda. Budget context window, perkiraan biaya, dan batas panjang input semuanya dihitung dalam token model tersebut, bukan dalam karakter.

### 6. Angka kasar dan introspeksi

Satu siklus training skala besar kira-kira begini: 10 TB data, 6.000 GPU, 12 hari, dengan biaya sekitar 2 juta dolar. Hasilnya file model sekitar 140 GB.

Angka itu berguna sebagai konteks. Kamu tidak akan melakukan hal ini sendiri. Yang kamu lakukan adalah memakai model yang sudah dilatih, lalu menyesuaikan perilakunya lewat prompt, tool, dan RAG.

Salah satu hal yang paling menarik dari model bahasa: mereka bisa diintrospeksi, walau sulit. Anthropic menemukan bahwa model bisa berbagi konsep lintas bahasa, merencanakan ke depan, memakai jalur neural yang paralel, dan kadang mengarang reasoning yang tampak masuk akal.

Artinya, perilaku model bisa diselidiki, dan penemuannya bisa dipakai untuk memahami apa yang sebenarnya terjadi di dalam sana. Kamu tidak perlu memahami matematikanya untuk memakainya dengan baik.

## Perintah Praktis

```bash
# Lihat model default dan provider yang dipakai
hermes model

# Segarkan daftar model yang tersedia dari provider aktif
hermes model --refresh

# Hitung berapa token yang akan dikirim sebelum request dikirim
hermes prompt-size

# Lihat komponen dan konfigurasi yang aktif
hermes status
```

`hermes prompt-size` berguna untuk modul ini. Karena tokenizer setiap model berbeda, jumlah token itu penting untuk menghitung biaya dan memastikan muat di context window.

## Catatan Penting

- Parameter itu angka, bukan kode. Model adalah hasil kompresi pengetahuan, bukan program yang ditulis tangan.
- Pre-training memberi pengetahuan, post-training memberi perilaku. Model tanpa post-training tidak bisa diperintah.
- Inference jauh lebih murah dan praktis daripada training. Jangan jalankan proses yang tidak perlu.
- Kamu biasanya tidak bisa mengganti sampling strategy. Temperature satu-satunya knob yang paling sering kamu pakai.
- Tokenizer berbeda antar model. Jangan menghitung token dengan asumsi satu kata sama dengan satu token.
- Ukuran model punya harga: memori, latensi, dan biaya. Model lebih besar tidak selalu lebih baik.
- Memahami cara model dibuat tidak berarti kamu harus bisa membuatnya. Pemahaman ini cukup untuk memakainya dengan lebih baik.

## Apa Selanjutnya

Lanjut ke [Modul 10](/modul/mindset), supaya kamu melihat bagaimana semua konsep ini bekerja bersama saat model mulai memakai tool dan mengambil tindakan.
