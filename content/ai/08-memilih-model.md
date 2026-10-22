---
title: "5 Pertanyaan Sebelum Memilih Model"
slug: memilih-model
bagian: 2
modul: 8
durasi: 15 menit
titlePendek: Memilih Model
ringkasan: Lima pertanyaan sebelum memilih model: open atau closed, berapa biaya yang bisa diterima, berapa latensi yang bisa diterima, cara menilai performa, dan berapa besar context window yang dibutuhkan.
prasyarat: []
diagram: d24-pilih-model
---

# 5 Pertanyaan Sebelum Memilih Model

## Gambaran Umum

Memilih model bukan keputusan sekali pakai. Kamu memilihnya, aplikasi jalan, lalu tiga bulan kemudian model baru muncul dan segalanya berubah. Jadi yang kamu butuhkan bukan jawaban final, tapi **kerangka berpikir** yang bisa dipakai berulang kali.

Kerangka yang paling berguna sederhana: lima pertanyaan. Jawab kelima-limanya dulu, baru sentuh daftar model. Urutannya penting. Kebanyakan orang kebalik: mereka lihat-lihat model yang tersedia, tergoda pada model terkuat, baru sadar belakangan bahwa biaya atau latensinya tidak masuk akal.

Prinsip lainnya juga penting: jangan pilih model terkuat. Model kecil dengan prompt yang bagus sering menang telak dibanding model besar dengan prompt asal. Model besar hanya unggul kalau kamu memang memaksanya untuk task yang berat.

## Yang Akan Kamu Pelajari

- Kenapa memilih model adalah keputusan berlapis, bukan sekali seumur hidup
- Lima pertanyaan yang harus dijawab sebelum melihat daftar model
- Peran open model versus closed model dalam keputusan arsitektur
- Batas biaya dan latensi yang realistis untuk aplikasi produksi
- Kenapa prompt yang baik sering lebih berpengaruh daripada ukuran model

## Konsep Kunci

### 1. Lima pertanyaan

Berikut lima pertanyaan yang harus punya jawaban sebelum kamu memilih model apa pun.

| Pertanyaan | Kenapa penting | Contoh jawaban |
|---|---|---|
| Open atau closed model? | Menentukan kontrol, biaya, dan dependensi kamu | Closed, karena butuh keandalan tanpa operasional server |
| Berapa biaya yang bisa diterima? | Menentukan apakah pemakaian per token atau per seat | Maksimal 200 ribu rupiah per bulan |
| Berapa latensi yang ditoleransi? | Menentukan apakah streaming dan model kecil wajib | Di bawah 2 detik untuk jawaban pertama |
| Bagaimana cara menilai performa model? | Menentukan cara kamu membandingkan kandidat | Benchmark publik + eval sendiri |
| Seberapa besar context window yang dibutuhkan? | Menentukan model mana yang muat | 128k token untuk dokumen panjang |

Urutannya penting. Pertanyaan biaya dan latensi paling sering mengunci pilihan, jadi jawab itu lebih dulu.

### 2. Open atau closed model?

Model **closed** diakses lewat API. Kamu tidak bisa mengintip isinya, tapi kamu dapat kemampuan terbaik, endpoint yang stabil, dan tidak ada urusan dengan GPU.

Model **open** bisa kamu unduh, host sendiri, modifikasi, dan jalankan di perangkat sendiri. Hasilnya: kontrol penuh atas data, tanpa biaya token per pemakaian, tapi kamu menanggung beban infrastruktur.

Kabar baiknya, perbedaannya makin tipis di sisi kemampuan. Banyak model open sekarang sudah sangat kuat untuk task produksi. Yang perlu kamu sadari: startup biasanya mulai dari model closed demi kecepatan, lalu pindah ke model open kalau biaya atau kepatuhan jadi masalah.

### 3. Berapa biaya yang bisa diterima?

Pertanyaan ini paling sering mengunci pilihan, jadi jawab paling dulu.

Provider besar biasanya menagih per token. Ada harga untuk token input (kamu
bicara) dan harga terpisah untuk token output (model menjawab). Harganya
biasanya ditulis sebagai "harga per 1 juta token", jadi yang perlu kamu hitung
adalah berapa banyak token keluar dari aplikasimu per bulan.

Alternatifnya adalah **hosting sendiri model open**. Alih-alih bayar per token,
kamu bayar biaya tetap untuk server. Bonusnya, data sepenuhnya ada di tanganmu.
Ini penting kalau soal lokasi data atau privasi. Tapi hardware mahal, dan kamu
yang bertanggung jawab menjaga server tetap hidup.

### 4. Berapa latensi yang bisa diterima?

Untuk chat, yang pengguna rasakan bukan total waktu, tapi **waktu sampai token
pertama muncul**. Di sinilah streaming jadi penting. Jawaban mengalir, jadi
terasa cepat walau total waktunya sama. Model kecil juga hampir selalu lebih
cepat di token pertama.

Kalau targetmu "jawaban pertama di bawah 2 detik", ini membatasi pilihanmu
ke model kecil dan server yang dekat dengan pengguna.

### 5. Bagaimana cara menilai performa model?

Ini pertanyaan yang paling sering dilewati. Banyak tim mengira model besar
selalu lebih baik untuk tugas yang sulit. Itu belum tentu benar.

Untuk sebagian besar tugas produksi, prompt yang rapi sudah menyelesaikan
masalah. Kalau prompt-nya ambigu, model besar akan memberi jawaban yang ambigu
juga, hanya dengan lebih banyak kata. Sebaliknya, prompt yang spesifik membuat
model kecil menjawab dengan presisi tinggi, dan model kecil jauh lebih murah
serta lebih cepat.

Jadi urutan yang benar: tulis prompt dengan baik dulu, ukur hasilnya, lalu
naikkan ukuran model kalau memang masih kurang. Jangan lewati langkah pertama.

Cara mengukurnya harus kamu tentukan juga. Pilihannya: benchmark publik,
eval buatanmu sendiri, atau keduanya. Eval buatanmu sendiri lebih akurat karena
mengukur kasus yang benar-benar kamu hadapi.

### 6. Seberapa besar context window yang dibutuhkan?

Context window menentukan berapa banyak isi yang muat sekaligus. Kalau
dokumenmu panjang, model dengan context kecil akan memotong isi atau
menolak.

Tapi context besar bukan berarti selalu lebih baik. Model dengan context besar
kadang lebih lambat dan lebih mahal, dan bagian yang tidak kamu butuhkan tetap
memakan token. Kalau kebutuhanmu jelas, pilih model yang cukup.

### Jawaban ini tidak pernah final

Evolusi model terjadi cepat. Model yang bulan lalu terlalu mahal bisa bulan ini
jadi pilihan paling masuk akal.

Jadi dua kebiasaan ini penting. Pertama, catat alasan di balik setiap pilihan
model dalam file README atau dokumen keputusan. Bukan karena modelnya perlu
disempurnakan, tapi karena enam bulan kemudian kamu perlu tahu apa yang berubah.

Kedua, sisakan jalur migrasi sejak awal. Sembunyikan pemanggilan model di satu
lapisan, simpan nama model di konfigurasi, dan jangan tulis nama model secara
langsung di dalam logika bisnis.

## Perintah Praktis

```bash
# Lihat model dan provider default yang aktif
hermes model

# Segarkan daftar model dari setiap provider
hermes model --refresh

# Uji satu model tertentu dengan prompt yang sama, lalu bandingkan hasilnya
hermes -z "Ringkas teks berikut jadi 3 bullet: <teks>" -m <nama-model>

# Cek status komponen dan konfigurasi provider
hermes status --full
```

Uji bandingkan dengan satu prompt yang sama adalah cara paling murah untuk melihat perbedaan model. Ubah satu variabel saja per percobaan: modelnya. Kalau kamu ubah prompt dan model sekaligus, kamu tidak akan tahu apa penyebabnya.

## Catatan Penting

- Jawaban lima pertanyaan ini berubah setiap kali model baru rilis. Yang penting adalah pertanyaannya, bukan jawabannya.
- Jangan jadikan model terkuat sebagai default. Ia biasanya boros dan lambat untuk task sederhana.
- Latensi bukan cuma soal kecepatan. Untuk user, kecepatan kesan menentukan apakah dia menunggu atau pergi.
- Structured output dan tool calling adalah fitur teknis. Cek kompatibilitasnya sebelum memilih, bukan sesudahnya.
- Model open memberi kontrol data, tapi menambah beban operasional. Hitung biaya engineering-nya.
- Kalau biayanya tidak masuk akal, turunkan ukuran model dan perbaiki prompt dulu. Bukan mencari diskon.

## Apa Selanjutnya

Lanjut ke [Modul 09](/modul/membuat-model), supaya kamu paham isi file model dan kenapa ukurannya memengaruhi pilihanmu.
