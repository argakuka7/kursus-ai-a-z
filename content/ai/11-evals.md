---
title: "Eval: Menguji Sistem yang Tidak Bisa Diprediksi"
slug: evals
bagian: 2
modul: 11
durasi: 18 menit
titlePendek: Eval
ringkasan: Eval adalah unit test untuk AI Engineer: cara menguji perilaku sistem probabilistik secara otomatis, dari assertion sederhana sampai LLM as judge.
prasyarat: []
diagram: d19-evals
---

# Eval: Menguji Sistem yang Tidak Bisa Diprediksi

## Gambaran Umum

Semua software punya cara memastikan dirinya benar. Ada unit test, ada integration test, ada test yang dijalankan setiap kali kode berubah. Kalau test gagal, deployment berhenti. Aturan ini sudah melekat di kepala setiap engineer.

Untuk sistem LLM, aturan itu tidak bisa dipakai apa adanya. Kamu tidak bisa menulis `assert output === "jawaban yang benar"`, karena tidak ada satu jawaban yang benar untuk input yang sama. Yang ada adalah rentang jawaban yang bisa diterima, dan pertanyaan seberapa sering sistemmu berada di dalam rentang itu.

Nah, **eval** adalah jawaban industri atas masalah ini. Eval adalah unit test-nya AI Engineer. Dia membuat perilaku sistem probabilistik bisa diuji, diam-diam, dan otomatis.

Kunci yang perlu kamu pegang di awal: eval tidak terpisah dari produksi. Eval yang baik tidak hanya menguji di awal proyek, tapi terus berjalan sepanjang umur aplikasi, diperbarui dengan data nyata, dan dipakai sebagai satu-satunya dasar untuk mengambil keputusan.

## Yang Akan Kamu Pelajari

- Kenapa testing traditional dan manual QA sama-sama tidak cukup untuk aplikasi LLM
- Apa itu eval dan bagaimana eval menguji perilaku probabilistik
- Kapan eval harus deterministik, dan kapan butuh skor
- Tiga jenis eval: deterministik, human evaluation, dan LLM as judge
- Cara mengatur cadence eval supaya biayanya terkendali
- Kenapa dataset eval harus terus diperbarui dengan data produksi
- Kenapa observability dan sistem feedback harus dibangun sejak awal

## Konsep Kunci

### Kenapa testing traditional tidak cukup

Testing traditional bergantung pada hubungan deterministik: input tertentu menghasilkan output tertentu, jadi kamu bisa menulis assertion yang pasti benar atau pasti salah.

Di sistem LLM, **tidak ada perubahan yang kecil**. Mekanisme internal model, yaitu attention dan transformasi, tidak bisa dibaca oleh siapa pun. Kamu tidak bisa bilang "ah, ini cuma beda satu kata, jadi efeknya pasti kecil".

Bukti paling jelas ada di kasus yang paling sering dipakai. Kalimat butterfly:

```text
"butterfly flaps"  -> output A
"Butterfly Flaps"  -> output B
```

Hanya beda huruf besar. Tapi outputnya bisa berbeda, karena cara tokenisasi dan attention menduga konteks berubah. Jadi assertion deterministik yang biasa kamu pakai, di sini tidak berlaku.

### Manual QA juga tidak cukup

Bayangkan kamu bangun fitur baru. Kamu tes manual, semua beres. Kamu deploy. Tapi ada bagian lain dari sistem yang ikut berubah atau terpengaruh, dan sekarang ada regression yang tidak kamu sadari.

Di software biasa, test suite yang menangkap ini. Di LLM, kamu butuh cara yang sama untuk tahu sedang membaik atau sedang memburuk. Bekerja dengan "rasa" di sini sangat berbahaya, karena rasa itu tidak bisa direview, tidak bisa diulang, dan tidak bisa diaudit.

Inilah alasan kata otomatisasi. Evaluasi harus berjalan otomatis setiap kali kamu mengubah sesuatu, atau setiap kali model di bawahnya berubah. Manual QA tetap berguna untuk eksplorasi, tapi tidak bisa jadi satu-satunya penaga.

### Jenis eval pertama: deterministik

Ini eval yang paling sederhana dan paling murah. Kamu menentukan kondisi yang harus terpenuhi, dan sistem melolos atau tidak.

```text
assert panjang artikel >= 300 kata
assert panjang artikel <= 2000 kata
assert output valid JSON
assert tidak mengandung kata forbidden
```

Kodenya jelas, biayanya murah, hasilnya konsisten. Mulai dari sini. Banyak eval produksi yang gagal hanya karena tidak punya eval deterministik dasar.

### Kapan pass/fail tidak cukup

Masalahnya, banyak metrik yang penting bersifat kualitatif:

| Metrik | Pertanyaan | Tipe |
|---|---|---|
| Factuality | Apakah semua pernyataan dalam jawaban benar? | Kualitatif |
| Writing style | Apakah teksnya elegan dan enak dibaca? | Kualitatif |
| Prompt fidelity | Apakah output sesuai permintaan user? | Kualitatif |
| Panjang artikel | Apakah antara 300 dan 2000 kata? | Deterministik |

Untuk tiga metrik pertama, pass/fail tidak menjawab pertanyaan yang kamu butuhkan. Yang kamu butuh tahu: **setiap perubahan membuat 5% lebih baik atau 50% lebih buruk?**

Perhatikan selisihnya. "Lebih baik" saja tidak cukup. Kamu butuh angka, karena perubahan kecil dan perubahan besar menghasilkan efek yang sangat berbeda. Dan yang kamu cari bukan absolute, tapi **perbandingan**: apakah ini lebih baik dari versi sebelumnya? Ini alasan utama kenapa eval butuh skor, bukan sekadar pass atau fail.

### Tiga jenis eval

| Jenis | Cara kerja | Kelebihan | Kekurangan | Biaya |
|---|---|---|---|---|
| Deterministic | Assertion sederhana, pass atau fail | Cepat, murah, konsisten | Tidak bisa ukur kualitas | Rendah |
| Human evaluation | Expert menilai output | Jadi acuan kebenaran | Lambat, mahal, tidak skala | Tinggi |
| LLM as judge | Output dikirim ke LLM lain sebagai penilai, ditambah ground truth | Otomatis, bisa skala | Ada biaya, ada bias | Sedang |

**Human evaluation** murah di awal, dan mahal serta lambat begitu datanya bertambah. Tapi semua sistem AI bergantung pada input manusia sampai tingkat tertentu. Penilaian manusia tetap menjadi acuan.

**LLM as judge** adalah yang paling populer untuk operasional. Cara kerjanya: output sistem kamu dikirim ke LLM lain sebagai penilai, ditambah ground truth sebagai pembanding. LLM penilai menilai, memberi skor, atau memberi label.

Biaya LLM as judge tidak bisa diabaikan. Karena itu atur cadence-nya. Strategi umum yang dipakai:

```text
Set kecil  -> dijalankan setiap perubahan, lokal, otomatis
Set besar  -> dijalankan harian, di CI
```

Set kecil memberi umpan balik cepat saat kamu bereksperimen. Set besar memberi gambaran yang lebih stabil dan menangkap kasus yang jarang muncul.

### Eval harus hidup bersama data produksi

Eval yang kamu tulis di hari pertama akan cepat usang. Cara memperbaikinya: **dataset eval harus representatif dengan data produksi**.

Kalau kamu membuat classifier, eval harus mencakup semua kasus tepi yang muncul di dunia nyata. Kalau tidak, skor eval kamu jadi terlalu optimis, dan kamu mendorongnya ke produksi dengan sistem yang belum pernah diuji pada kasus sulit.

Praktik yang berhasil: ambil data produksi, bersihkan, labeli, lalu masukkan sebagai kasus uji baru. Setiap kasus kegagalan di produksi sebaiknya punya counterpart di dataset eval. Kalau belum, itu lubang di eval kamu.

### Observability dan feedback harus dari awal

Ini bagian yang sering diabaikan: **observability dan sistem feedback wajib dibangun dari awal**, bukan setelah produk meledak.

Setelah deploy, user menjadi penilai. Tombol thumbs up dan down saja sudah sangat berharga, karena memberi label gratis pada ribuan interaksi. Dari situ kamu bisa memetakan mana yang bagus dan mana yang buruk.

Prinsip yang sama dipakai Vercel dengan konsep **data flywheel**: data terbaik untuk eval datang dari user. Setiap interaksi yang diberi rating adalah bahan mentah untuk eval berikutnya. Sistem yang mulai dari nol dengan data flywheel akan selalu lebih cepat membaik daripada sistem yang menggali data lama dari arsip.

## Perintah Praktis

Mulai dari mengukur apa yang sudah terjadi, lalu jadikan itu bahan eval:

```bash
# Pola pemakaian, token, biaya, dan tool yang sering dipanggil
hermes insights --days 7

# Daftar sesi terakhir, cek interaksi yang gagal
hermes sessions list --limit 10

# Cari percakapan yang gagal atau berhenti di tengah
hermes sessions export --format jsonl - --end-reason error

# Ukur berapa prompt yang sebenarnya kamu kirim ke model
hermes prompt-size
```

Buat folder `evals/` di repo aplikasimu. Isi dengan dua hal: file kasus uji (input, ground truth, dan kriteria yang harus terpenuhi) dan skrip penilaian. Jalankan skrip itu setiap kali prompt berubah.

## Catatan Penting

- Eval adalah unit test-nya AI Engineer. Tanpa eval, kamu cuma menebak.
- Tidak ada perubahan kecil di LLM. Perubahan kecil di prompt bisa mengubah output secara drastis.
- Manual QA tidak bisa jadi satu-satunya penaga, karena kamu tidak akan pernah tahu bagian mana yang memburuk.
- Otomatisasi itu wajib. Evaluasi setiap kali ada perubahan, atau setiap kali model di bawahnya berubah.
- Mulai dari eval deterministik, karena murah dan cepat. Tambahkan eval kualitatif setelahnya.
- Kualitas butuh skor, bukan pass/fail. "Lebih baik" tanpa angka tidak bisa dipakai mengambil keputusan.
- LLM as judge paling populer untuk operasional, tapi biayanya nyata. Atur cadence, jangan menjalankan eval pada set besar untuk setiap perubahan.
- Dataset eval harus mencerminkan data produksi. Edge case yang belum masuk eval berarti belum diuji.
- Bangun observability dan tombol feedback sejak awal. Data user adalah bahan eval terbaik yang pernah ada.

## Apa Selanjutnya

Lanjut ke [Modul 12](/modul/teknik-perbaikan), supaya kamu punya urutan teknik perbaikan, dari yang paling murah sampai yang paling mahal.
