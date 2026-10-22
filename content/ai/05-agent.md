---
title: "Agent dan Workflow: Siapa yang Mengambil Keputusan?"
slug: agent
bagian: 1
modul: 5
durasi: 12 menit
titlePendek: Agent vs Workflow
ringkasan: Perbedaan workflow dan agent, dan kunci utamanya ada pada siapa yang memutuskan kapan program berhenti.
prasyarat: []
diagram: d5-agent-workflow
---

# Agent dan Workflow: Siapa yang Mengambil Keputusan?

## Gambaran Umum

Ada dua cara membangun sistem LLM yang kuat: **workflow** dan **agent**. Dua-duanya cara yang sama untuk mengorkestrasi beberapa panggilan LLM. Bedanya bukan di bahan, tapi di siapa yang memegang kendali.

**Workflow** memakai langkah-langkah yang sudah ditentukan sejak awal. Urutannya ditulis developer di dalam kode. Panggilan LLM pertama, lalu cek hasilnya, lalu panggilan LLM berikutnya, lalu seterusnya. Karena semuanya tertulis di kode, kapan program berhenti juga sudah pasti sejak awal. Tidak ada tebakan.

**Agent** tidak punya langkah yang sudah ditentukan. Model diberi sekumpulan tool, lalu **memutuskan sendiri** tool mana yang mau dipanggil dan kapan pekerjaan ini selesai. Dia berimprovisasi di jalan. Jalur yang dia tempuh bisa berbeda dari perkiraanmu, dan dia berhenti saat dia merasa sudah selesai.

Perbedaan paling penting dari semua ini cuma satu: **siapa yang memutuskan kapan program berhenti**. Di workflow, jawabannya kode kamu. Di agent, jawabannya model.

## Yang Akan Kamu Pelajari

- Bedanya workflow dan agent dalam satu kalimat
- Kenapa satu panggilan LLM bukan workflow maupun agent
- Siapa yang memegang kendali atas urutan langkah
- Kapan workflow lebih tepat, dan kapan agent lebih tepat
- Contoh workflow yang menjalankan pekerjaan secara paralel
- Kenapa workflow sering memberi hasil lebih baik daripada agent
- Risiko nyata dari agent: hasil yang sulit diprediksi

## Konsep Kunci

### Workflow: langkahnya kamu yang tentukan

Workflow adalah rantai panggilan LLM yang urutannya sudah jelas.

```text
Langkah 1: ambil teks dari sumber
Langkah 2: bersihkan teksnya
Langkah 3: kirim ke LLM untuk diringkas
Langkah 4: kirim hasil ringkasan ke LLM untuk dirapikan lagi
```

Semua baris di atas ditulis di kode. Kamu yang memutuskan kapan LLM dipanggil, dengan prompt apa, dan hasil sebelumnya masuk ke prompt berikutnya. Program berhenti setelah langkah terakhir selesai.

Keunggulannya jelas: hasil bisa diprediksi dan bisa diulang. Kalau task-nya sama, keluarannya sama. Kalau ada bagian yang gagal, kamu tahu bagian mana karena alurnya eksplisit.

### Agent: model yang memilih jalannya

Agent mengubah satu hal: kendali pindah dari kode ke model.

```text
Model menerima permintaan
Model memilih tool pertama
Tool dijalankan, hasilnya dikembalikan
Model membaca hasil, lalu memilih tool berikutnya
...ulangi...
Model memutuskan: "sudah cukup, aku berhenti"
```

Perhatikan, tidak ada daftar langkah di sana. Yang ada cuma sekumpulan tool dan satu permintaan. Model yang menentukan urutan, jumlah pemanggilan, dan titik akhirnya.

Ini memberi model kekuatan jauh lebih besar. Model bisa saja membaca file, mengeditnya, menjalankan test, melihat test gagal, lalu memperbaiki lagi. Kamu tidak menuliskan itu semua di kode.

### Kapan berhenti adalah inti pembeda

Kalau kamu hanya memanggil LLM sekali, kamu tidak sedang membangun workflow maupun agent. Keduanya selalu soal **mengorkestrasi beberapa panggilan LLM**. Syarat minimum: lebih dari satu panggilan.

Setelah itu, pertanyaan yang menentukan arsitekturmu adalah satu ini: siapa yang memutuskan kapan berhenti?

- Di workflow, **kode kamu** yang memutuskan. Jumlah panggilan dan urutan langkahnya tetap.
- Di agent, **model** yang memutuskan. Dia berhenti saat dia merasa jawabannya sudah lengkap.

Efeknya besar. Workflow bisa kamu uji, debug, dan perkirakan biayanya. Agent lebih fleksibel, tapi lebih sulit diprediksi. Kadang dia berhenti terlalu cepat. Kadang dia memanggil tool berulang-ulang tanpa progres. Kadang dia melewati langkah yang seharusnya wajib.

### Workflow paralel: contoh sederhana

Workflow tidak harus berurutan. Salah satu pola yang paling berguna adalah pemrosesan paralel.

Misalkan kamu punya teks panjang. Alurnya:

```text
1. Ambil teksnya
2. Potong jadi dua bagian
3. Ringkas bagian 1 dan bagian 2 secara paralel
4. Gabungkan dua ringkasan itu, lalu ringkas sekali lagi
```

Langkah 3 berjalan bersamaan, jadi total waktunya lebih singkat. Yang membuat ini workflow adalah urutan dan batasnya sudah kamu tentukan di kode. Kamu tidak bergantung pada model untuk memutuskan kapan harus berhenti.

### Memilih yang mana

Agent unggul saat langkah task-nya **tidak jelas**. Kalau cara menyelesaikannya harus dicari di jalan, model perlu berimprovisasi. Contohnya: mendiagnosis kenapa program gagal, mencari tahu di mana sebuah bug berada, menjelajah repo yang belum pernah dilihat.

Workflow unggul saat task harus dikerjakan **dengan cara yang sama lagi dan lagi**. Contohnya: meringkas dokumen, mengubah format data, membuat laporan mingguan, memproses antrean tiket.

Workflow sering dianggap kurang menarik, dan itu tidak adil. Justru dalam banyak kasus, hasilnya lebih baik daripada agent, selama task-nya jelas. Alasannya sederhana: alurnya eksplisit, tidak ada langkah yang terlewat, dan tidak ada percakapan yang berputar-putar.

Aturan praktisnya begini: kalau kamu bisa menuliskan langkahnya, pakai workflow. Kalau kamu tidak bisa menuliskan langkahnya, pertimbangkan agent.

## Perintah Praktis

Bandingkan dua cara kerja yang sama di Hermes:

```bash
# Workflow: satu perintah, langkah dan hasil jelas
hermes -z "Baca file /tmp/latihan.txt, lalu tulis 3 poin ringkasan"

# Agent: model yang memilih tool sendiri sampai merasa selesai
hermes chat -q "Periksa isi folder ini, lalu usulkan 3 perbaikan yang paling penting"

# Tool apa saja yang tersedia untuk dipilih agent
hermes tools list

# Telusuri riwayat sesi untuk melihat tool call
hermes sessions list
```

Kalau kamu mau melihat jejak langkahnya secara detail, jalankan agent dengan keluaran JSONL:

```bash
hermes chat -q "Cek isi /tmp/latihan.txt lalu jelaskan isinya" --format stream-json
```

Setiap baris adalah satu event: permintaan model, tool yang dipilih, hasil tool, dan bagian akhir jawabannya. Di situ kelihatan siapa yang mengambil keputusan.

## Catatan Penting

- Satu panggilan LLM bukan workflow dan bukan agent. Orkestrasi beberapa panggilan itu syaratnya.
- Alur agent yang tidak bisa diprediksi membuat pengujian jadi sulit. Kalau task-nya bisa diuji, tulis workflow.
- Agent yang tidak punya batas iterasi bisa berjalan terlalu lama dan menghabiskan kuota. Selalu ada batas maksimum langkah.
- Jangan buru-buru memakai agent karena kelihatannya lebih pintar. Agent menambah fleksibilitas sekaligus mengurangi kendali.
- Workflow paralel menambah beban, bukan hanya mempercepat. Beban dan budget token harus dihitung.
- Kalau task kamu berulang setiap minggu, tulis workflow. Kalau task-nya tiap kali berbeda dan butuh investigasi, pakai agent. Kombinasi juga mungkin: workflow yang di satu langkah memanggil agent untuk keputusan yang sulit diprediksi.

## Apa Selanjutnya

Lanjut ke [Modul 06](/modul/ai-engineer), supaya kamu mulai memakai Hermes secara nyata dan mencoba sendiri loop tool dan agent ini.
