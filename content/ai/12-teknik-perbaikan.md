---
title: 17 Teknik Memperbaiki Aplikasi LLM
slug: teknik-perbaikan
bagian: 2
modul: 12
durasi: 20 menit
titlePendek: Teknik Perbaikan
ringkasan: Urutan 17 teknik perbaikan aplikasi LLM, dari yang paling murah sampai yang paling mahal, plus panduan memilih teknik berikutnya berdasarkan eval.
prasyarat: []
diagram: d20-teknik
---

# 17 Teknik Memperbaiki Aplikasi LLM

## Gambaran Umum

Sudah punya kriteria sukses yang jelas, sudah pilih model, sudah tulis eval
dasar? Sekarang baru waktunya memperbaiki sistemnya.

Memperbaiki sistem LLM itu sebenarnya dua hal: memperbaiki **feedback loop**
(eval) dan memperbaiki **performa** sistemnya sendiri.

Tapi ada urutan yang harus dijaga. Teknik yang lebih baik tidak selalu yang
lebih mahal. Mengubah prompt itu murah. Melatih model dari nol itu sangat
mahal. Jadi mulai dari yang paling atas daftar, dan turun hanya kalau semua
opsi yang lebih sederhana sudah kamu coba.

## Yang Akan Kamu Pelajari

- Kenapa urutan kompleksitas itu penting
- 17 teknik perbaikan, dari prompt pertama sampai fine-tuning
- Teknik mana yang biasanya dipakai di dunia nyata
- Cara memutuskan teknik berikutnya berdasarkan hasil eval

## Konsep Kunci

### Urutan kompleksitas

Bayangkan tangga. Di anak tangga paling atas ada teknik yang murah dan
perubahan hasilnya besar. Di bawah ada yang mahal dan hasilnya kecil. Kamu
turun turun hanya kalau yang atas sudah mentok.

| Teknik | Biaya | Kapan dipakai |
|---|---|---|
| 1. Prompt pertama | Murah | Selalu. Prompt yang jelas, langsung, spesifik. |
| 2. Role-based prompting | Murah | Kamu mau gaya jawaban konsisten. |
| 3. XML tags | Murah | Banyak bagian info dalam satu prompt, atau mau atur struktur output. |
| 4. Membatasi format respons | Murah | Butuh JSON atau label tertentu. |
| 5. Structured outputs | Sedang | Butuh jaminan bentuk output yang persis. |
| 6. Reasoning | Sedang | Tugas yang butuh berpikir berlapis. |
| 7. Multishot prompting | Sedang | Contoh lebih bicara daripada deskripsi. |
| 8. Temperature | Murah | Butuh variasi lebih, atau lebih konsisten. |
| 9. Tool calling | Sedang | Butuh akses ke data atau tindakan nyata. |
| 10. Rantai panggilan LLM | Sedang | Output satu langkah jadi input langkah berikutnya. |
| 11. RAG | Sedang | Pengetahuan harus datang dari sumbermu, bukan dari ingatan model. |
| 12. Chunking | Sedang | Dokumenmu besar dan retrieval harus mengambil semuanya. |
| 13. Agentic loops | Mahal | Tugas perlu beberapa langkah dengan keputusan di tengah. |
| 14. Paralelkan panggilan LLM | Mahal | Banyak bagian independen yang bisa jalan bareng. |
| 15. Evaluator-optimizer | Mahal | Butuh penilaian otomatis yang berulang. |
| 16. LLM routers | Mahal | Banyak tipe tugas dengan model berbeda. |
| 17. Fine-tuning | Sangat mahal | Perilaku atau gaya yang sudah kamu coba sampai habis lewat prompt. |

### 1–4: prompt yang lebih baik

Ini empat teknik pertama, semuanya soal prompt.

**Prompt pertama.** Prompt yang paling jelas, langsung, dan spesifik. Bayangkan
LLM sebagai karyawan yang cerdas tapi baru hari pertama: dia tidak tahu
norma, gaya, atau aturanmu.

**Role-based prompting.** Minta model jadi persona tertentu. Bisa soal nada
bicara, aksen, atau topik:

```
You are a friendly support engineer. Answer in short, plain sentences.
```

Ini teknik yang sangat umum dan sangat murah. Biasanya ditaruh di system
prompt.

**XML tags.** Dipakai untuk memisahkan bagian-bagian prompt, dan untuk
mengatur struktur output. Contoh laporan keuangan:

```
<documents>
  <document index="1">
    <source>2025 annual report</source>
    <document_content>Pendapatan naik 18% dibanding tahun lalu...</document_content>
  </document>
</documents>

Using only the documents above, summarize the main business risks.
```

Kamu juga bisa minta model menjawab dengan struktur tertentu:

```
Review this article and respond using this exact structure:
<summary>One paragraph summary</summary>
<critique>What is unclear or unsupported</critique>
<recommended_changes>Concrete edits to make next</recommended_changes>
```

**Membatasi format respons.** Mau JSON atau satu label tertentu? Struktur output
terkunci (JSON schema) adalah cara paling andal. Cara sederhana: cukup
instruksi di system prompt.

```
Reply with exactly one of these labels: bug, feature-request, billing, or other.
Do not include any explanation.
```

### 5–8: kendali dan kontrol

**Structured outputs** menjamin bentuk respons sesuai skema JSON. Kalau kamu
pakai Vercel AI SDK, pakai `generateObject` atau `streamObject`.

**Reasoning** adalah memberi model ruang untuk berpikir. Model dengan
kemampuan reasoning punya parameter `effort` untuk mengatur seberapa dalam ia
berpikir.

**Multishot prompting** adalah memberikan beberapa contoh daripada
mendeskripsikan aturan. Kalau aturanmu sulit dijelaskan tapi mudah
didemonstrasikan, contoh menang.

**Temperature** mengatur seberapa acak pilihan model. Temperature rendah
(atau nol) bikin output konsisten dan berulang — penting untuk pipeline yang
dipakai otomatis. Temperature tinggi bikin lebih beragam — berguna untuk
menghasilkan ide.

### 9–12: mengambil data dan melakukan tindakan

**Tool calling** memberi model akses ke sistem nyata: database, file, API.
Inilah fondasi agent.

**Rantai panggilan LLM** memakai output satu panggilan sebagai input
panggilan berikutnya. Ini pola dasar workflow.

**RAG** (Retrieval-Augmented Generation) menjawab pertanyaan dengan
mengambil bagian relevan dari dokumenmu lebih dulu, lalu menempelkannya ke
prompt. Ini menyelesaikan dua masalah sekaligus: pengetahuan model yang
basi, dan tidak adanya sumber yang bisa disitasi.

**Chunking** adalah memecah dokumen jadi potongan-potongan sebelum disimpan
untuk retrieval. Potongan terlalu besar membuat konteks penuh derau. Terlalu kecil
membuat konteks kehilangan makna. Ini keputusan yang menentukan kualitas RAG.

### 13–17: yang berat

**Agentic loops** membiarkan model memutuskan langkah berikutnya sendiri. Ini
Hermes. Ini juga yang paling mahal, karena tiap putaran adalah panggilan LLM.

**Paralelkan panggilan LLM** menjalankan beberapa prompt sekaligus. Kalau
tugasmu bisa dipecah jadi bagian independen, ini penghematan waktu besar.

**Evaluator-optimizer** adalah dua model: satu menilai, satu memperbaiki.
Mulai dengan draf, agar dinilai, lalu perbaiki. Ulangi sampai nilainya cukup baik.
Berguna untuk tugas menulis panjang atau kode yang butuh standar tinggi.

**LLM routers** memakai LLM kecil sebagai penjaga: dia memutuskan permintaan
mana yang perlu model besar, mana yang cukup model kecil. Ini memotong biaya
jauh.

**Fine-tuning** melatih model lebih jauh dengan data contohmu sendiri. Ini
paling mahal dan paling lambat, jadi cuma kalau semua pilihan lain sudah
gagal. Fine-tune untuk perilaku yang konsisten dan berulang, bukan untuk
mengajar model fakta baru (untuk itu RAG lebih tepat).

## Perintah Praktis

Untuk mencoba langsung di Hermes:

```bash
# Lihat model yang tersedia
hermes model

# Lihat ukuran prompt yang sedang aktif
hermes prompt-size

# Ukur token biaya sebelum memilih model
hermes insights --days 7
```

## Catatan Penting

- Prompt yang jelas mengalahkan model yang lebih besar. Hampir selalu.
- Jangan lompat ke fine-tuning dulu. Cek eval-mu: kalau prompt yang lebih baik sudah tidak membantu, baru naik satu tangga.
- Fine-tuning bukan cara mengajar model fakta baru. Untuk itu, pakai RAG.
- Mengatur `temperature` hampir gratis dan sering menyelesaikan masalah konsistensi.
- Rantai panggilan dan agentic loop sama-sama mahal. Pastikan ada eval yang mengukurnya sebelum kamu menambahkannya.
- Setiap teknik layak punya eval sendiri. Kalau tidak ada cara mengukur apakah tekniknya membantu, kamu cuma menebak.

## Apa Selanjutnya

Lanjut ke [Modul 13](/modul/mulai-cepat), supaya kamu melihat
bagaimana semua teknik ini bekerja bersama di dalam agent yang menjalankan
banyak langkah.
