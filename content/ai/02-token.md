---
title: Token: Satuan Pengecekan Model Bahasa
slug: token
bagian: 1
modul: 2
durasi: 12 menit
titlePendek: Token
ringkasan: Kenapa model bahasa menghitung teks dalam token, kenapa token itu menentukan biaya, dan kenapa beberapa kata boros.
prasyarat: []
diagram: d2-tokenisasi
---

# Token: Satuan Pengecekan Model Bahasa

## Gambaran Umum

Model bahasa tidak membaca teks seperti kamu. Dia tidak melihat huruf, kata, atau paragraf. Yang dia lihat hanya **angka**. Setiap keping teks dikonversi menjadi satu atau beberapa angka, dan angka itulah yang jadi bahan bakar utama model.

Angka-angka itu disebut **token**. Satu token adalah satu bilangan. Teks "kucing" berubah menjadi beberapa bilangan, lalu bilangan-bilangan itu diproses model, lalu hasilnya diubah kembali menjadi teks yang bisa dibaca manusia. Proses bolak-balik inilah yang membuat LLM terasa seperti sedang "berpikir" dalam bahasa manusia.

Kenapa ini penting untuk kamu? Karena token adalah satuan ukur yang dipakai semua API LLM untuk menghitung tagihan. Setiap karakter yang kamu kirim dan setiap karakter yang model balas dihitung. Jadi memahami token berarti kamu bisa memprediksi biaya, mengatur panjang jawaban, dan memilih model yang tepat.

## Yang Akan Kamu Pelajari

- Apa itu token dan kenapa token adalah angka, bukan potongan kata
- Bedanya encoding (teks jadi angka) dan decoding (angka jadi teks)
- Alur lengkap dari teks kamu sampai jawaban model
- Input tokens versus output tokens, dan mana yang lebih mahal
- Bagaimana tokenizer dilatih dari korpus teks besar
- Kenapa ukuran vocabulary menentukan efisiensi token
- Kenapa kata langka dan Bahasa Indonesia lebih boros token

## Konsep Kunci

### Token adalah angka yang mewakili teks

Tokenizer bekerja dalam dua tahap. Pertama, ia memotong teks menjadi potongan-potongan yang dikenali. Kedua, tiap potongan itu diganti menjadi sebuah bilangan. Angka-angka itulah yang dikirim ke model.

Jadi token bukan "potongan kata" dalam arti yang rapi. Dia lebih dekat ke potongan kompresi data: pola yang sering muncul dipakai utuh, sisanya dipotong lebih kecil.

### Encoding dan decoding

**Encoding** adalah perubahan teks menjadi token. **Decoding** adalah kebalikannya: token diubah kembali menjadi teks lalu digabung jadi kalimat utuh.

```text
Teks   : "kucing duduk di atas tikar"
Encode : [4821, 778, 4419, 312, 9014, 12007]
Decode : "kucing duduk di atas tikar"
```

Perhatikan arahnya. Model hanya mengenal arah kedua: dia menerima angka, menghasilkan angka, lalu angkanya didecode supaya kamu bisa membacanya.

### Alur lengkap dari prompt ke jawaban

```text
1. Tokenizer mengubah prompt kamu menjadi token input
2. LLM memproses token input
3. LLM menghasilkan token output
4. Token output didecode menjadi teks yang bisa dibaca
```

Yang sering tidak disadari: **langkah 1 terjadi setiap kali kamu mengirim pesan**. Riwayat percakapan, system prompt, dan definisi tool semuanya ikut di-encode ulang dan dikirim lagi. Percakapan yang panjang berarti pengiriman ulang yang panjang.

### Input tokens dan output tokens

Input token adalah semua yang masuk: riwayat percakapan, system prompt, definisi tool, dan pesan user terbaru. Output token adalah jawaban model.

Keduanya dibayar, dan tarifnya biasanya berbeda. Tarif output token umumnya lebih tinggi karena model harus menghasilkan token satu per satu, sementara input hanya perlu dibaca.

Cara paling efektif menghemat: rancang prompt supaya jawabannya pendek dan spesifik. Prompt yang lebar membuat model panjang dalam menjelaskan. Prompt yang sempit membuat model langsung menjawab.

### Tokenizer dilatih dari korpus teks besar

Untuk memahami kenapa sebagian kata boros, bayangkan corpus kecil: "the cat sat on the mat".

Tahap pertama, semua karakter dipisah dan masing-masing jadi token sendiri:

```text
T H E (spasi) C A T (spasi) S A T (spasi) O N (spasi) T H E (spasi) M A T
```

Tahap kedua, kelompok karakter yang sering muncul digabung jadi token baru:

```text
"TH" muncul di "the" dua kali
"HE" muncul di "the" dua kali
"AT" muncul di "cat", "sat", dan "mat"
```

Tahap ketiga, kelompok dari kelompok digabung lagi. "TH" + "HE" jadi "THE", yaitu kata "the" utuh, dan sekarang punya token sendiri.

Ini menjelaskan kenapa tokenizer bisa memahami kata Bahasa Inggris dengan sangat sedikit token. Pola huruf itu sudah dihafal model sejak latihan.

### Ukuran vocabulary menentukan efisiensi

Tujuan seluruh proses ini adalah membuat vocabulary sebesar mungkin. Vocabulary besar memecah kata jadi lebih sedikit token.

```text
"understanding"
  vocabulary  1.000  ->  5 token
  vocabulary 50.000  ->  3 token
  vocabulary 200.000 ->  2 token
```

Perhatikan bahwa teks yang sama punya biaya berbeda tergantung model yang dipakai. Model dengan vocabulary 200.000 memproses teks yang sama lebih murah dan lebih cepat, karena lebih sedikit token yang harus diproses.

### Kata langka pecah jadi banyak token

Tokenizer hanya hemat untuk pola yang sering dia lihat di data latihan. Kata yang jarang muncul harus dipecah karakter demi karakter.

Contoh klasik dari puisi Lewis Carroll:

```text
"O Frabjous Day"  ->  7 token
```

Hanya 15 karakter, tapi jadi 7 token. Kata "Frabjous" sengaja dibuat khusus dan tidak ada di corpus latihan, jadi tokenizer tidak punya token untuk itu dan harus memotongnya.

### Bahasa Indonesia lebih boros

Bahasa Indonesia secara umum butuh lebih banyak token per kalimat daripada Bahasa Inggris. Alasannya sederhana: pola sufiks dan prefiks Bahasa Indonesia lebih beragam, sementara tokenizer dilatih dengan korpus yang didominasi Bahasa Inggris.

Konsekuensinya nyata. Prompt Bahasa Inggris yang 100 token bisa jadi 130 token dalam Bahasa Indonesia. Kalau kamu menulis aplikasi dengan budget token ketat, ini selisih yang perlu diperhitungkan.

## Perintah Praktis

Lihat sendiri berapa banyak yang kamu kirim dan terima:

```bash
# Rincian system prompt + definisi tool yang aktif saat ini
hermes prompt-size

# Token yang terpakai dan biayanya dalam 7 hari terakhir
hermes insights --days 7

# Cari sesi yang boros token (minimal 50.000 token)
hermes sessions export --format jsonl - --min-tokens 50000 --dry-run

# Eksperimen langsung: buka playground tokenizer
# https://tiktokenizer.vercel.app
```

Untuk pengujian cepat, tiktokenizer.vercel.app adalah kanvas paling praktis. Tempel teks, lihat potongannya, dan ubah-ubah tokenizer untuk membandingkan model yang berbeda.

## Catatan Penting

- Satu token bukan satu kata. Satu kata bisa jadi beberapa token, dan satu token bisa berisi beberapa kata.
- "Karakter" dan "token" bukan hal yang sama. 1.000 karakter bisa berarti 250 token atau 800 token, tergantung isinya.
- Riwayat percakapan dikirim ulang setiap kali kamu kirim pesan. Ongkosnya menumpuk, bukan sekali bayar.
- Output token sering lebih mahal dari input token. Jawabannya yang perlu dipotong, bukan promptnya.
- Prompt yang terlalu lebar membuat output panjang dan mahal. Minta satu hal dengan format yang jelas.
- Bahasa Indonesia memakai lebih banyak token daripada Bahasa Inggris untuk isi yang setara. Hitung ulang budgetnya.
- Jangan menebak jumlah token. Pakai playground tokenizer atau API penghitung token untuk angka pasti.

## Apa Selanjutnya

Lanjut ke [Modul 03](/modul/context-window), karena sekarang kamu tahu dengan satuan apa model menghitung. Selanjutnya kita lihat batas keras dari satuan itu.
