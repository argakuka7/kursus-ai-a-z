/**
 * Bank soal kuis, dikunci ke slug modul.
 *
 * Setiap soal: pertanyaan, 4 opsi, indeks jawaban benar, pembahasan.
 * Pembahasan menjelaskan KENAPA, bukan cuma mengulang jawaban.
 */

export const SOAL = {
  pesan: {
    modul: "pesan",
    pertanyaan: "Kalau system prompt dan pesan user saling bertentangan, apa yang biasanya terjadi?",
    opsi: [
      "Model selalu mengikuti pesan user, karena user yang membayar.",
      "Model biasanya tetap mengikuti system prompt.",
      "Model berhenti menjawab dan meminta klarifikasi.",
      "Model memilih secara acak antara keduanya.",
    ],
    jawaban: 1,
    pembahasan:
      "System prompt punya otoritas lebih tinggi karena posisinya di awal riwayat dan dibaca sebagai instruksi yang berlaku untuk seluruh percakapan.Pengecualian tetap ada: prompt yang ditulis khusus untuk membocorkan system prompt kadang berhasil, dan itu dikenal sebagai jailbreak. Jadi andalkan system prompt untuk aturan, bukan untuk keamanan.",
  },

  token: {
    modul: "token",
    pertanyaan: "Kenapa Bahasa Indonesia umumnya lebih boros token daripada Bahasa Inggris?",
    opsi: [
      "Karena model dilatih dengan korpus Bahasa Inggris yang jauh lebih besar.",
      "Karena Bahasa Indonesia punya banyak prefiks dan sufiks, dan kata yang jarang muncul di data latihan dipecah jadi banyak potongan.",
      "Karena tokenizer Bahasa Indonesia selalu keliru.",
      "Karena token hanya bisa menghitung huruf Latin.",
    ],
    jawaban: 1,
    pembahasan:
      "Dua hal bertemu. Pertama, Bahasa Indonesia banyak memakai prefiks (me-, ber-, pe-, ke-, di-) dan sufiks (-kan, -nya, -i), sehingga satu kata dasar bisa jadi beberapa bentuk panjang. Kedua, tokenizer dilatih dari korpus yang didominasi Inggris, jadi kata Indonesia yang tidak umum akan dipecah menjadi potongan-potongan kecil. Efeknya: teks yang sama bisa memakan lebih banyak token, dan token input berbayar.",
  },

  "context-window": {
    modul: "context-window",
    pertanyaan: "Apa itu masalah \"lost in the middle\"?",
    opsi: [
      "Model kehilangan kemampuan bahasa tertentu setelah terlalu lama dipakai.",
      "Pesan di tengah riwayat jauh lebih jarang dibaca model dibanding pesan di awal dan akhir.",
      "Jawaban model terpotong di tengah karena batas token.",
      "Model lupa pesan dari sesi sebelumnya.",
    ],
    jawaban: 1,
    pembahasan:
      "Perhatian model tidak merata ke seluruh riwayat. Pesan paling awal (system prompt, aturan) dan pesan paling akhir (permintaan terbaru) punya pengaruh paling besar. Pesan di tengah sering terlewat. Efeknya makin kuat seiring bertambahnya ukuran context window. Praktisnya: konteks yang penting ditaruh di awal atau akhir, jangan disimpan di tengah.",
  },

  tools: {
    modul: "tools",
    pertanyaan: "Saat LLM \"memilih\" sebuah tool, apa yang sebenarnya terjadi?",
    opsi: [
      "Tool langsung dijalankan di server penyedia model.",
      "Model menghasilkan pesan tool call berisi id dan argumen, dan aplikasimu yang menjalankannya.",
      "Tool di-install permanen di akun pengguna.",
      "Model mengirim email ke developer tool itu.",
    ],
    jawaban: 1,
    pembahasan:
      "Tool call hanyalah pesan. Model tidak punya akses ke filesystem atau shell kamu. Aplikasi yang membaca pesan itu, menjalankan tool, lalu mengirim balik tool result dengan id yang sama. Kalau aplikasinya tidak ada, tool call itu tidak akan pernah terjadi. Inilah pembeda antara aplikasi AI biasa dan agent.",
  },

  agent: {
    modul: "agent",
    pertanyaan: "Apa pembeda utama antara agent dan workflow?",
    opsi: [
      "Agent selalu lebih akurat karena punya lebih banyak tool.",
      "Workflow lebih mahal karena butuh banyak panggilan LLM.",
      "Siapa yang memutuskan kapan program berhenti.",
      "Agent tidak pernah memakai tool eksternal.",
    ],
    jawaban: 2,
    pembahasan:
      "Keduanya melakukan beberapa panggilan LLM, jadi itu bukan pembeda. Perbedaannya siapa yang memegang kendali: di workflow, developer menulis langkah-langkahnya di kode dan kode yang memutuskan kapan berhenti. Di agent, model yang memutuskan tool mana yang dipanggil dan kapan selesai. Agent lebih fleksibel tapi hasilnya lebih sulit diprediksi. Kalau task-nya jelas dan bisa diulang, workflow biasanya menang.",
  },
  "mulai-cepat": {
    modul: "mulai-cepat",
    pertanyaan: "Perintah mana yang paling tepat untuk mengecek apakah Hermes di komputermu sehat?",
    opsi: [
      "hermes --version",
      "hermes doctor",
      "hermes status --all",
      "hermes tools list",
    ],
    jawaban: 1,
    pembahasan:
      "hermes doctor menjalankan diagnosa: memeriksa credential, konfigurasi, koneksi ke penyedia model, dan tool yang bermasalah. --version hanya menampilkan nomor versi. tools list hanya enumerasi tool, bukan mengecek kesehatan. Kalau doctor menemukan masalah, dia juga memberi saran perbaikan.",
  },

  memori: {
    modul: "memori",
    pertanyaan: "Kamu mau aturan yang hanya berlaku untukmu, dan tidak ikut masuk ke git repo tim. File mana yang tepat?",
    opsi: [
      "./HERMES.md",
      "./.hermes/rules/tim.md",
      "./HERMES.local.md",
      "~/.hermes/HERMES.md",
    ],
    jawaban: 2,
    pembahasan:
      "HERMES.local.md di root proyek adalah memori lokal: berlaku untukmu, tapi di-ignore oleh git sehingga tidak ikut ter-commit. HERMES.md di root dipakai tim dan biasanya ikut version control. ~/.hermes/HERMES.md berlaku untukmu di semua proyek, bukan cuma satu. Aturan tim modular ada di .hermes/rules/.",
  },

  skills: {
    modul: "skills",
    pertanyaan: "Kenapa skill dimuat secara bertahap (progressive disclosure) dan bukan seluruhnya sekaligus?",
    opsi: [
      "Supaya Hermes lebih cepat startup.",
      "Supaya definisi skill yang tidak relevan tidak pernah dibaca dan tidak memakan konteks.",
      "Supaya skill bisa diedit tanpa restart.",
      "Supaya agent tidak pernah salah memanggil skill.",
    ],
    jawaban: 1,
    pembahasan:
      "Yang dimuat duluan cuma nama dan deskripsi satu baris. Isi SKILL.md baru dibaca kalau tugasnya cocok, dan file pendukung lebih jauh baru dibuka kalau benar-benar dibutuhkan. Efeknya: konteks tetap berisi yang relevan, dan biaya token tidak meledak saat jumlah skill banyak.",
  },

  delegasi: {
    modul: "delegasi",
    pertanyaan: "Kapan delegasi ke subagent lebih baik daripada mengerjakan sendiri?",
    opsi: [
      "Setiap kali tugasnya butuh lebih dari satu langkah.",
      "Saat ada beberapa pekerjaan independen yang bisa berjalan paralel, atau saat konteks utama perlu tetap bersih.",
      "Saat kamu butuh jawaban yang pasti benar.",
      "Saat tugasnya satu dan jelas sekali.",
    ],
    jawaban: 1,
    pembahasan:
      "Delegasi membayar mahal: satu konteks tambahan per subagent. Jadi pakai kalau ada hasil nyata: beberapa subtask independen yang bisa jalan paralel, atau saat subtask-nya begitu besar sampai konteks utama perlu tetap bersih. Kalau tugasnya satu, jelas, dan kecil, kerjakan sendiri lebih cepat dan lebih murah.",
  },
  mcp: {
    modul: "mcp",
    pertanyaan: "Apa peran MCP Bridge dalam Hermes?",
    opsi: [
      "Menjalankan model LLM secara lokal.",
      "Menerjemahkan antara protokol Hermes dan protokol server tool eksternal.",
      "Menyimpan riwayat obrolan di database.",
      "Mengatur jadwal agent agar jalan otomatis.",
    ],
    jawaban: 1,
    pembahasan:
      "MCP (Model Context Protocol) adalah protokol standar untuk menyambungkan tool dari luar. Hermes kalau speak MCP, bukan tool langsung. Bridge menerjemahkan permintaan Hermes jadi format MCP, lalu menerjemahkan hasilnya kembali. Karena itu server MCP mana pun bisa disambung tanpa mengubah Hermes.",
  },

  jadwal: {
    modul: "jadwal",
    pertanyaan: "Jadwal cron Hermes: lima kolom apa yang dipakai?",
    opsi: [
      "menit, jam, hari, bulan, hari dalam minggu",
      "detik, menit, jam, hari, bulan",
      "jam, menit, hari, minggu, tahun",
      "menit, jam, hari dalam bulan, bulan, hari dalam minggu",
    ],
    jawaban: 0,
    pembahasan:
      "Urutannya: menit (0-59), jam (0-23), hari dalam bulan (1-31), bulan (1-12 atau JAN-DEC), hari dalam minggu (0-7 atau MON-SUN). Lima kolom itu yang selalu ada. Kalau hanya mau jalankan tiap hari jam 9 pagi, cukup di kolom menit, jam, dan sisanya pakai bintang.",
  },

  karakter: {
    modul: "karakter",
    pertanyaan: "Apa bedanya SOUL.md dengan memory (HERMES.md)?",
    opsi: [
      "SOUL.md menyimpan fakta, memory menyimpan gaya bicara.",
      "SOUL.md menentukan cara agent bicara dan berperilaku, sementara memory menyimpan fakta dan konteks.",
      "Keduanya sama saja, cuma nama berbeda.",
      "SOUL.md hanya untuk profil berbeda, memory untuk profil default.",
    ],
    jawaban: 1,
    pembahasiaan: "",
    penjelasan: "",
    pembahasan:
      "SOUL.md adalah identitas dan perilaku: nada bicara, panjang jawaban, aturan, persona. Memory adalah pengetahuan: fakta tentang proyek, preferensi, hasil belajar. Beda ini penting karena SOUL sering disalin ke banyak profil, sedangkan memory spesifik per konteks kerja.",
  },

  "konteks-rujuk": {
    modul: "konteks-rujuk",
    pertanyaan: "Kenapa perlu context reference (rujuk file) daripada menyalin isi file ke prompt?",
    opsi: [
      "Supaya Hermes tidak perlu restarted.",
      "Supaya hanya bagian yang dibutuhkan yang masuk ke konteks, dan isinya selalu versi terbaru.",
      "Supaya file bisa dienkripsi.",
      "Supaya Hermes tidak bisa salah membaca.",
    ],
    jawaban: 1,
    pembahasiaan: "",
    penjelasan: "",
    pembahasan:
      "Rujukan membuat Hermes membaca file itu sendiri saat dibutuhkan, bukan kamu yang menempelkan isinya. Efeknya: konteks tetap ramping, dan tidak ada salinan yang basi kalau filenya berubah di tengah sesi. Kamu juga bisa menunjuk bagian spesifik, misalnya satu fungsi atau satu rentang baris.",
  },

  penutup: {
    modul: "penutup",
    pertanyaan: "Kamu bekerja lambat dan sering lupa instruksi awal. Apa yang paling mungkin jadi penyebabnya?",
    opsi: [
      "Modelnya terlalu bodoh.",
      "Context window-nya penuh karena riwayat menumpuk.",
      "Token-nya terlalu banyak dibayar.",
      "Provider-nya salah.",
    ],
    jawaban: 1,
    pembahasiaan: "",
    penjelasan: "",
    pembahasan:
      "Lupa instruksi awal hampir selalu karena konteks penuh, bukan karena model bodoh. Seiring riwayat menumpuk, pesan di tengah makin terlewat (lost in the middle). Solusinya: pangkas riwayat, jalankan /init di awal sesi, dan simpan instruksi penting di system prompt atau memory.",
  },
  "semua-sisi": {
    modul: "semua-sisi",
    pertanyaan: "Kamu mau Hermes jalan di server VPS, lalu diajak dari HP saat bepergian. Permukaan Hermes mana yang dipakai?",
    opsi: [
      "CLI di HP, karena CLI itu paling ringan",
      "Web di server, diakses lewat jaringan pribadi (Tailscale atau VPN)",
      "Desktop di HP, karena lebih cepat",
      "ACP, karena itu untuk perangkat mobile",
    ],
    jawaban: 1,
    pembahasan:
      "Dashboard web Hermes plus Tailscale adalah pola yang paling masuk akal: agent tetap jalan di server, kamu akses dari browser HP lewat jaringan pribadi. CLI tidak ada di HP. Desktop berarti agent jalan di HP, bukan di server. Dan untuk publik, Hermes sendiri sudah menolak bind ke alamat non-loopback kalau belum ada auth provider terdaftar.",
  },

  izin: {
    modul: "izin",
    pertanyaan: "Hermes mau menjalankan command yang cocok dengan daftar pola berbahaya, dan belum pernah kamu allow. Apa yang terjadi?",
    opsi: [
      "Command dibatalkan otomatis demi keamanan.",
      "Kamu dimintai persetujuan: once, session, always, atau deny.",
      "Command dijalankan, tapi hasilnya dikirim ke log.",
      "Command dijalankan di YOLO mode secara default.",
    ],
    jawaban: 1,
    pembahasan:
      "Hermes tidak menolak outright, tapi menahan dan meminta keputusan. Empat pilihan: once (izinkan sekali), session (izinkan jenis ini untuk sesi ini), always (simpan permanen di config), atau deny. YOLO mode (/yolo) yang melewati semua ini harus kamu nyalakan sendiri — secara default tidak aktif. Kalau sering dimintai persetujuan, smart approval bisa LLM pembantu menilai risikonya dulu.",
  },
};
