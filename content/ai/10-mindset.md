---
title: "Mindset AI Engineer: Beralih ke Sistem Probabilistik"
slug: mindset
bagian: 2
modul: 10
durasi: 18 menit
titlePendek: Mindset AI Engineer
ringkasan: Cara berpikir sebagai AI Engineer: mengukur dari pada menebak, menyiapkan eval sebelum menulis kode, dan memanfaatkan setiap interaksi pengguna sebagai data.
prasyarat: []
diagram: d18-mindset
---

# Mindset AI Engineer: Beralih ke Sistem Probabilistik

## Gambaran Umum

Software yang biasa kamu tulis bersifat deterministik. Input yang sama menghasilkan output yang sama. Login berhasil berarti berhasil. Fungsi tambah selalu menjumlahkan. Kalau ada bug, ada input yang bisa direproduksi, dan memperbaiki kode membuat bug itu hilang untuk selamanya.

Begitu kamu masuk ke dunia LLM, aturan itu berubah. Model bahasa bersifat **probabilistik**. Input yang sama bisa menghasilkan output yang berbeda, dan tidak ada yang bisa kamu patch. Tidak ada stack trace yang menunjukkan baris mana yang salah. Yang ada cuma jawaban yang "kelihatan" benar, lalu ternyata salah.

Inilah pergeseran inti yang harus kamu diterima sebagai AI Engineer: kamu tidak lagi membangun sistem yang deterministik. Kamu membangun sistem yang **belum tentu bisa diprediksi**, lalu merancang cara untuk mengukurnya. Kalau dulu "memperbaiki bug" berarti membuat kondisi benar, sekarang berarti membuat angka metrik membaik.

Dua sisi pekerjaan ini muncul bersamaan. Sisi pertama adalah **sistemnya**: prompt, tools, model, alur. Sisi kedua adalah **pengukurannya**: eval, metrik, data. Expertise di sisi kedua yang membedakan aplikasi LLM yang bisa dipercaya dari yang cuma terlihat meyakinkan.

## Yang Akan Kamu Pelajari

- Kenapa membangun dengan LLM berarti meninggalkan determinisme dan masuk ke wilayah probabilistik
- Apa itu Vibes-Only Trough dan kenapa jalan di demo tapi gagal di tangan user asli
- Kenapa Data-Driven Slope mengubah cara kamu bekerja
- Cara menulis kriteria sukses yang spesifik dan terukur sebelum menulis kode
- Kenapa data interaksi pengguna adalah aset paling berharga milikmu
- Empat cara interaksi user bisa dimanfaatkan: prompt, fine-tuning, tingkat keberhasilan, kasus tepi

## Konsep Kunci

### Dari deterministik ke probabilistik

Perbandingan ini penting untuk dipahami secara eksplisit, karena cara kerjamu berubah total.

| Aspek | Software deterministik | Aplikasi LLM |
|---|---|---|
| Hubungan input dan output | Pasti satu hasil | Kemungkinan beberapa hasil |
| Cara menemukan bug | Reproduksi input, baca stack trace | Bandingkan output dengan kriteria |
| Cara memperbaiki | Ubah kode, bug hilang permanen | Ubah prompt atau model, ukur ulang |
| Ukuran keberhasilan | Biner: jalan atau tidak | Kontinu: 80% atau 92% benar |
| Sumber kebenaran | spesifikasi kode | data dan penilaian manusia |

Perhatikan baris terakhir. Pada software biasa, kebenaran datang dari kode yang kamu tulis. Pada aplikasi LLM, kebenaran datang dari data nyata dan penilaian orang. Karena itu mengumpulkan data bukan kegiatan sampingan. Itu inti pekerjaannya.

### Vibes-Only Trough: kelihatan jalan, padahal rapuh

Ini pola yang dialami hampir setiap orang yang baru membangun aplikasi LLM.

```text
Bikin demo  -> jalan
Tes 5 contoh -> kelihatan bagus
Tayang ke user asli -> user berinteraksi dengan cara yang tidak kamu bayangkan
```

Kenapa ini terjadi? Karena bahasa alami itu fleksibel. User tidak akan terjebak pada kasus penggunaan yang kamu rancang. Dia akan minta hal yang tidak ada di contohmu. Dia akan salah ketik. Dia akan menanyakan hal yang tidak ada jawabannya.

Dan kamu tidak bisa melihat kegagalan itu. Demo yang gagal diam-diam, tanpa error. Tidak ada monitor yang berteriak. Efeknya, kamu mengambil keputusan berdasarkan feelings, lalu kesimpulanmu berbalik arah tiap kali kamu deploy.

### Data-Driven Slope: keputusan dari metrik

Solusinya bukan berhenti bereksperimen. Justru sebaliknya. Kamu tetap bereksperimen, tapi setiap eksperimen punya ukuran.

```text
1. Tentukan kriteria sukses yang terukur
2. Bangun eval yang menguji kriteria itu
3. Kumpulkan data dari produksi
4. Ukur performa, lalu putuskan perubahan berikutnya
```

Kualitas aplikasi memang akan naik-turun liar saat kamu bereksperimen. Itu bagian normal dari permainannya. Triknya bukan menghilangkan naik-turunnya, tapi **melacak perubahan secara sistematis** dan belajar dari setiap iterasi.

### Kriteria sukses: langkah pertama, bukan langkah terakhir

Banyak orang menulis kode dulu, lalu bertanya pada diri "ini sukses kalau apa?". Urutannya terbalik. Kriteria sukses harus ditulis lebih dulu.

Perbedaan penting: di software biasa, sukses itu biner. Di LLM, tidak pernah biner. Contoh sistem sentiment analysis bisa punya kriteria seperti ini:

| Kriteria | Target | Cara diukur |
|---|---|---|
| Akurasi | 92% | Cocok dengan label expert manusia lintas industri |
| Response time | 95% | Klasifikasi selesai dalam 500ms |
| Confidence scoring | 90% | Prediksi confident (di atas 0.9) cocok penilaian manusia |

Kuncinya ada di dua hal. Pertama, kriteria harus **spesifik**. "Performa bagus" bukan kriteria, karena tidak bisa diuji. Kedua, kriteria harus **terukur**, artinya ada angka dan ada cara menghitung angka itu.

Dan Ingat: janganlah membidik target mustahil. 100% akurasi pada data dunia nyata adalah target yang tidak akan pernah tercapai, dan karena itu tidak berguna sebagai arah. Target 92% yang bisa kamu ukur dan pelajari jauh lebih berguna.

### Data adalah aset paling berharga

Performa aplikasimu tidak akan pernah lebih baik daripada data yang kamu kumpulkan. Bukan karena modelnya kurang pintar, tapi karena model hanya bisa dievaluasi terhadap sesuatu. Tanpa data, kamu tidak punya arah.

Ini berarti kamu harus membangun **budaya berbasis data**: keputusan diambil dari metrik nyata, bukan dari perasaan. Dan setiap interaksi user adalah satu titik data. Bukan satu titik data kecil. Empat jenis kegunaannya:

| Kegunaan | Data yang dipakai | Hasilnya |
|---|---|---|
| Perbaikan prompt | Respons sukses dan respons gagal | Prompt jadi lebih tajam |
| Fine-tuning | Interaksi berkualitas | Model khusus untuk kasusmu |
| Pelacakan tingkat keberhasilan | Data per fitur | Tahu fitur mana yang paling membantu |
| Penemuan kasus tepi | Setiap kegagalan | Eval makin lengkap |

Mulai dari mekanisme feedback yang paling sederhana, lalu tambah kompleksitasnya. Tombol thumbs up dan down di setiap jawaban sudah sangat berharga. Dari situ kamu bisa lihat polanya.

Salah satu platform code generation terbesar punya Slack channel khusus. Setiap downvote memicu notifikasi ke developer untuk investigasi. Itu contoh nyata bahwa feedback user diperlakukan sebagai data, bukan sebagai keluhan.

Kuncinya satu kalimat: **kalau tidak bisa diukur, tidak bisa diperbaiki.**

## Perintah Praktis

Mulai dari mengukur, bukan dari menebak. Perintah ini membantu kamu melihat kondisi nyata aplikasimu:

```bash
# Lihat ukuran prompt yang sebenarnya dikirim ke model
hermes prompt-size

# Token, biaya, dan pola pemakaian tool 7 hari terakhir
hermes insights --days 7

# Sesi terakhir beserta aktivitasnya
hermes sessions list --limit 10

# Cek kondisi komponen dan tool yang aktif
hermes status
hermes tools list
```

Setelah itu, tulis kriteria suksesmu dalam bahasa yang bisa diukur. Contoh: "jawaban selalu berbentuk JSON valid dengan field `label` dan `alasan`", bukan "jawabannya bagus".

## Catatan Penting

- Probabilitas bukan bug, bukan kesalahan. Itu konsekuensi desain, dan cara menanganinya adalah dengan mengukur.
- Demo yang lolos 5 contoh belum berarti apa-apa. User nyata akan menemukan jalur yang tidak kamu rancang.
- Kriteria sukses ditulis sebelum kode, bukan sesudah. Tanpa itu, kamu tidak bisa tahu apakah perubahanmu memperbaiki atau merusak.
- Target yang mustahil membuat tim menyerah. Pilih angka yang bisa dicapai dan bisa dipertanggungjawabkan.
- Data interaksi user adalah aset. Kumpulkan sejak hari pertama, jangan menunggu produk meledak.
- Mulai dari feedback paling sederhana. Thumb up dan down sudah cukup untuk memulai.
- Kualitas akan naik-turun saat bereksperimen. Yang membuatnya terkendali adalah pencatatan perubahan, bukan penghentian eksperimen.

## Apa Selanjutnya

Lanjut ke [Modul 11](/modul/evals), supaya kamu punya cara mengukur sistem probabilistik secara otomatis, lengkap dengan tiga jenis eval yang bisa kamu pakai.
