---
title: "Untuk Apa LLM Dipakai?"
slug: kegunaan-llm
bagian: 2
modul: 7
durasi: 15 menit
titlePendek: Kegunaan LLM
ringkasan: Empat kegunaan LLM yang paling kuat, dan dua jenis masalah yang seharusnya tidak kamu serahkan ke model.
prasyarat: []
diagram: d17-kegunaan
---

# Untuk Apa LLM Dipakai?

## Gambaran Umum

Pertanyaan paling penting dari seorang AI Engineer bukan "model mana yang terbaik", tapi "tasks apa yang memang layak diselesaikan LLM". Jawaban yang benar membuat produkmu murah, cepat, dan bisa dipercaya. Jawaban yang salah membuatmu membangun sistem yang rapuh tanpa sadar.

LLM punya satu kekuatan inti: bisa membaca bahasa yang tidak terstruktur, lalu mengubahnya jadi bentuk yang bisa diproses. Teks, transkrip, email, dokumen, log. Semuanya masuk, semuanya bisa diolah. Dan justru di situlah nilainya. Banyak data yang dulu tidak terjangkau, karena tidak ada yang punya waktu atau biaya untuk membacanya satu per satu.

Tapi ada juga hal yang **tidak** boleh kamu serahkan ke LLM. Aturan bakunya sederhana: kalau bisa dibangun deterministik, harus begitu. Model bahasa bersifat probabilistik. Output-nya bisa berbeda untuk input yang sama. Sistem yang butuh kepastian tidak boleh bergantung pada itu.

## Yang Akan Kamu Pelajari

- Empat kegunaan LLM yang paling umum dan paling kuat
- Cara mengubah data tak terstruktur jadi data terstruktur
- Kenapa LLM membuat klasifikasi jadi murah dan cepat
- Batas pengetahuan model, dan cara mengatasinya dengan sumber data eksternal
- Bedanya model yang hanya menjawab dan model yang bisa bertindak
- Dua kesalahan besar: membangun chatbot yang asal jalan dan memaksa LLM jadi sistem deterministik

## Konsep Kunci

### 1. Data tak terstruktur menjadi terstruktur

Ini kasus paling umum dan paling powerful. Data dunia nyata datang dalam bentuk teks bebas: transkrip customer support, email, invoice, notulen rapat. Semuanya sulit dicari, sulit dianalisis, dan menyebalkan untuk dibaca satu per satu.

Contoh yang sering disebut: log migrasi server dari abad ke-19. Data itu ada, tapi formatnya berantakan, tiap orang menulis dengan gaya sendiri. Dengan LLM, kamu mengubah setiap baris log menjadi baris tabel yang punya kolom yang sama. Setelah itu, data itu bisa difilter, diurutkan, dan dihitung.

Kasus yang paling bernilai sering bukan "mempercantik data", tapi "membuka data yang tadinya mati". Data yang mustahil dibaca manusia dalam jumlah besar, jadi bisa dipakai.

### 2. Labeling dan klasifikasi

Pola ini sederhana: berikan input ke LLM, minta label. Klasifikasi yang dulu butuh ribuan contoh data latih, sekarang cukup satu prompt yang jelas.

The Prompt Report pernah menguji model untuk mendeteksi sinyal risiko bunuh diri dari teks di r/SuicideWatch. Hasilnya lalu dicocokkan dengan analisis para expert. Model tidak bisa menggantikan expert, tapi model bisa menjadi filter pertama yang menyaring ribuan baris supaya expert cukup memeriksa sisanya.

Bedanya dengan pendekatan lama: tidak ada data latih, tidak ada pipeline training, tidak ada model yang harus dirawat. Kamu ubah prompt, dan perilaku klasifikasinya ikut berubah.

### 3. Question answering, dan batasnya

Model bisa menjawab pertanyaan dari pengetahuan yang tersimpan di parameternya. Tapi ada dua batas yang harus kamu tahu:

- **Knowledge cutoff.** Model punya batas waktu untuk data yang pernah dilihatnya. Peristiwa setelah tanggal itu tidak dia ketahui.
- **Tidak bisa sitasi sumber.** Jawaban model berdiri sendiri. Kamu tidak bisa memverifikasi asalnya, dan kamu juga tidak bisa menunjukkan bukti ke pengguna.

Solusinya: sambungkan model ke sumber data eksternal. Database, search engine, API internal. Model memanggil tool, lalu masukkan hasilnya ke konteks sebagai bahan jawaban. Pola ini dikenal sebagai RAG, dan akan dibahas terpisah.

DeepResearch adalah contoh yang lebih ambisius. Alih-alih menjawab dari ingatan, sistem seperti itu melakukan beberapa putaran: mencari, membaca, mencari lagi, lalu menyusun laporan dengan rujukan.

### 4. Agent: LLM yang bisa bertindak

Naik satu level, LLM tidak hanya menghasilkan teks. LLM bisa mengakses tool eksternal, lalu **berkaksi** di dunia nyata.

Agent adalah sistem yang bisa mengambil tindakan, merespons pengguna, dan berinteraksi dengan sistem lain. Bedanya dengan chatbot biasa: chatbot memberi jawaban, agent mengubah keadaan.

Contohnya agent yang bisa membaca file, mengubahnya, menjalankan test, lalu memperbaiki kode yang gagal. Di sinilah agent menjadi anggota tim, bukan sekadar alat bantu.

Tapi ada satu hal yang harus kamu ingat. Agent belum punya momen terobosan seperti chatbot. Chatbot mengubah cara orang berinteraksi dengan komputer. Agent belum sampai sana. Ia berkembang, dan untuk sebagian task ia sudah sangat berguna.

### 5. Dua hal yang jangan kamu kerjakan dengan LLM

**Naive chatbot.** Chatbot production itu jauh lebih sulit dari yang dibayangkan. Bot bisa membuat frustrasi user dan merusak brand. Guardrail dari model besar belum cukup untuk menjaganya. Ada contoh nyata di mana Gemini meminta user untuk mati. Dan satu user yang berhasil jailbreak sudah cukup untuk menimbulkan masalah besar.

Aturannya: jangan ship chatbot tanpa safeguard. Kalau kamu tetap mau membuatnya, harus ada guardrail berlapis, fallback ke manusia, dan log yang bisa diaudit.

**Deterministic system.** Kalau aturan bisnis bisa ditulis jadi kode, tulis jadi kode. Aturan "diskon 10 persen kalau total di atas 500 ribu" tidak butuh LLM. Aturan "kategorikan tiket ini berdasarkan kata kuncinya" juga tidak, kalau daftar keyword-nya sudah jelas.

LLM hanya masuk kalau task-nya memang punya bagian yang tidak bisa ditulis eksplisit: bahasa manusia, interpretasi maksud, atau ketidakpastian.

## Perintah Praktis

```bash
# Ubah data tak terstruktur jadi terstruktur
hermes -z "Baca file /tmp/transkrip.txt, lalu ubah isinya menjadi tabel markdown dengan kolom: waktu, topik, keputusan"

# Klasifikasi beberapa baris sekaligus
hermes -z "Baca /tmp/tiket.txt, lalu beri label priority pada setiap baris: rendah, sedang, tinggi"

# Lihat tool yang bisa dipakai untuk menjangkau sumber data eksternal
hermes tools list

# Ringkasan tool yang aktif per platform
hermes tools --summary list
```

## Catatan Penting

- Kegunaan LLM paling bernilai ada pada data yang dulu tidak terjangkau, bukan pada data yang sudah rapi.
- Klasifikasi dengan LLM bisa jadi sangat murah, tapi selalu ada false positive dan false negative. Ambang batasnya harus diuji.
- Jangan percaya model yang menyebut sumber. Dia tidak bisa mengakses sumber aslinya kecuali kamu berikan tool-nya.
- Agent bisa bertindak. Karena itu, hati-hatikan akses tool yang kamu berikan, dan selalu sediakan jalur berhenti.
- Naive chatbot hampir selalu lebih sulit daripada perkiraan tim di awal.
- Aturan paling aman: kalau bisa ditulis deterministik, tulis deterministik. Hemat token, dan hasilnya bisa diprediksi.

## Apa Selanjutnya

Lanjut ke [Modul 08](/modul/memilih-model), supaya kamu punya kerangka yang jelas saat harus memilih model untuk setiap kasus.
