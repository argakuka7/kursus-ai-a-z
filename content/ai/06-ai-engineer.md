---
title: "Apa Itu AI Engineer?"
slug: ai-engineer
bagian: 2
modul: 6
durasi: 15 menit
titlePendek: Peran AI Engineer
ringkasan: AI Engineer adalah software developer yang membangun aplikasi bertenaga AI secara andal, bukan orang yang membuat model AI dari nol.
prasyarat: []
diagram: d23-peran
---

# Apa Itu AI Engineer?

## Gambaran Umum

AI Engineer adalah software developer yang membangun aplikasi bertenaga AI. Istilah ini muncul bukan karena kita butuh pangkat baru, tapi karena ada satu kelompok orang yang bekerja tepat di antara dua dunia: rekayasa perangkat lunak dan machine learning. Peran mereka menarik, karena mereka tahu cara membangun sistem yang andal, sekaligus paham kemampuan dan keterbatasan model bahasa.

Kabar baiknya, syarat masuk ke peran ini jauh lebih ringan dari yang dibayangkan banyak orang. Kamu **tidak perlu** linear algebra. Kamu **tidak perlu** mahir matematika lanjutan. Kamu **tidak perlu** membuat model dari nol. Kamu juga **tidak perlu** membaca artikel "Attention is All You Need" dari awal sampai akhir supaya bisa mengirim permintaan ke API model.

Yang kamu perlukan ada di sisi lain. Rekayasa perangkat lunak yang kuat. Kemampuan membangun aplikasi yangandal dan bisa-diskalakan. Pengetahuan soal perkakas dan kerangka kerja AI modern. Dan fokus pada pengalaman pengguna, bukan pada serum model.

Jadi AI Engineer adalah jembatan antara software engineering tradisional dan AI. Rekayasa tradisional mengajari cara membuat sistem yang tidak roboh. AI memberi kemampuan baru. Tugasmu adalah menggabungkan keduanya.

## Yang Akan Kamu Pelajari

- Definisi peran AI Engineer dan batasnya terhadap pekerjaan ML
- Kemampuan yang tidak perlu kamu kuasai saat mulai berkarya di AI
- Skill yang justru menentukan seberapa baik aplikasi AI-mu
- Perbandingan AI Engineer, ML Engineer, dan AI-assisted Developer
- Kenapa pengalaman web developer sangat transferabel ke peran ini
- Kenapa user experience punya bobot yang sama besar dengan kualitas model

## Konsep Kunci

### Yang tidak perlu kamu kuasai

Ini daftar yang paling sering membuat orang mundur. Semua hal berikut **tidak** syarat untuk menjadi AI Engineer:

- Linear algebra dan matematika lanjutan
- Kemampuan membuat model machine learning dari nol
- Membaca paper akademik secara lengkap, termasuk "Attention is All You Need"
- Mengingat rumus atau membalik turunan secara hafal

Alasannya sederhana. Model yang kuat sudah ada dan bisa diakses lewat API. Tugasmu bukan membuat otaknya, tapi membangun aplikasi yang memakainya dengan benar. Otak itu disewa, bukan dirancang ulang.

### Yang perlu kamu kuasai

Yang perlu kamu kuasai adalah sisi rekayasa perangkat lunak, dengan tambahan awareness tentang perilaku model:

- **Software engineering fundamentals.** Version control, testing, deployment, error handling. Ini pondasi.
- **Aplikasi yangandal dan skalabel.** Model lambat, mahal, dan kadang gagal. Sistem kamu harus tetap berdiri saat model error.
- **Tool dan framework AI modern.** SDK, prompt, tool calling, RAG, eval, vector database.
- **User experience.** Orang berinteraksi dengan aplikasi, bukan dengan model.

Poin terakhir sering terlewat. Model yang benar-benar pintar pun gagal kalau pengalamannya buruk. Presisi tinggi, tapi jawabannya tidak bisa dipercaya, tidak bisa disalin, dan tidak memberi jalan keluar.

### AI Engineer vs ML Engineer

Dua peran ini sering tertukar. Bedanya cukup tegas, dan tabel ini membantu kamu memilih jalur.

| Aspek | AI Engineer | ML Engineer |
|---|---|---|
| Fokus | Membangun aplikasi yang memakai model lewat API | Melatih, menyetel, dan mengoptimalkan model |
| Expertise | Rekayasa perangkat lunak | Matematika, statistika, arsitektur model |
| Bahasa | Python, TypeScript, dan bahasa web lain | Python saja |
| Pendidikan | Latar belakang software engineering | Latar belakang lanjutan |
| Pasar | Tumbuh cepat dan mudah dipelajari | Spesialisasi sempit |

Perhatikan baris bahasa. AI Engineer tidak terkunci di Python. Peran ini terbuka untuk siapa saja yang bisa membangun aplikasi. Sebaliknya, ML Engineer butuh fondasi yang lebih dalam dan lebih lama.

### AI Engineer vs AI-assisted Developer

Dua label ini terdengar mirip, tapi arahnya berlawanan:

- **AI Engineer** membangun aplikasi yang **memakai** AI. AI adalah fitur produk.
- **AI-assisted Developer** memakai tool AI untuk **menulis kode** lebih cepat. AI adalah alat bantu kerja.

Kamu bisa jadi keduanya sekaligus. Tapi kalau kamu sedang menyelesaikan soal pemrograman dengan bantuan autocomplete, kamu belum otomatis jadi AI Engineer. Bedanya ada pada produk yang keluar, bukan pada alat yang kamu pakai.

### Jalur masuk dari web developer

Kalau kamu sudah web developer, kamu punya hampir semua yang dibutuhkan. Dua insting yang kamu bangun selama ini sangat transferabel:

- **Insting pengiriman praktis.** Tau cara mengantarkan fitur ke production, bukan cuma di localhost.
- **Insting kebutuhan user.** Tau bahwa masalah user itu nyata, dan solusi yang rapi saja belum tentu cukup.

UX juga punya bobot yang sama. Aplikasi AI sering punya ketidakpastian di baliknya. Kamu yang harus merapikan itu: cara menyajikan jawaban yang mungkin salah, cara menangani kegagalan, dan cara membuat alur tetap jelas bagi orang yang bukan insinyur.

## Perintah Praktis

Perintah di bawah ini bukan materi teori. Ini contoh nyata alat yang akan kamu pakai sehari-hari sebagai AI Engineer.

```bash
# Lihat seluruh perintah yang tersedia
hermes --help

# Pilih model dan provider default untuk sesi kerjamu
hermes model

# Cek tool apa saja yang bisa dipanggil agent
hermes tools list

# Cek status komponen dan konfigurasi saat ini
hermes status
```

Kalau kamu baru mulai, urutannya jelas. Pilih model dulu, lalu pakai `hermes tools list` untuk tahu batas kemampuan yang tersedia. Setelah itu baru bangun aplikasinya.

## Catatan Penting

- Peran AI Engineer dibangun di atas rekayasa perangkat lunak, bukan di atas riset machine learning.
- Model dengan parameter paling banyak belum tentu paling berguna untuk produkmu.
- Prompt, tool calling, dan evaluasi adalah skill teknis, bukan sekadar "mengetik dengan rapi".
- Jangan skip pengujian. Output LLM tidak deterministik, dan itu justru alasan kamu butuh test yang baik.
- Pengalaman shipping lebih dihargai daripada sertifikat. Portofolio aplikasi yang jalan lebih meyakinkan.
- Kalau timmu butuh model khusus yang dilatih sendiri, barulah kamu perlu masuk ke wilayah ML Engineer.

## Apa Selanjutnya

Lanjut ke [Modul 07](/modul/kegunaan-llm), supaya kamu tahu kasus apa yang layak diberi model dan mana yang cukup diselesaikan dengan kode biasa.
