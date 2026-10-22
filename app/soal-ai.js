/**
 * Soal kuis untuk modul AI Engineer (bagian 1, modul 6-12).
 *
 * Dipisah dari soal.js supaya file utama tetap ringkas. Format sama:
 * { pertanyaan, opsi[4], jawaban (index), pembahasan }.
 */

export const SOAL_AI_ENGINEER = {
  "ai-engineer": {
    modul: "ai-engineer",
    pertanyaan: "Apa perbedaan paling mendasar antara AI Engineer dan ML Engineer?",
    opsi: [
      "AI Engineer boleh tanpa background pemrograman sama sekali.",
      "AI Engineer membangun aplikasi yang memakai model lewat API; ML Engineer membangun model atau API-nya sendiri.",
      "AI Engineer wajib hafal matematika; ML Engineer tidak.",
      "Keduanya sama saja, hanya beda nama jabatan.",
    ],
    jawaban: 1,
    pembahasan:
      "Batasnya ada di API. AI Engineer berdiri di sisi yang memakai model lewat API: membangun aplikasi, RAG, sistem eval. ML Engineer berdiri di sisi yang membangun model itu sendiri: pelatihan, optimasi, arsitektur. Persamaan pentingnya: AI Engineer tetap butuh fundamentals software engineering yang kuat.",
  },

  "kegunaan-llm": {
    modul: "kegunaan-llm",
    pertanyaan: "Kapan LLM sebaiknya TIDAK dipakai?",
    opsi: [
      "Saat kamu perlu mengubah data tak terstruktur jadi data terstruktur.",
      "Saat tugasnya bisa dibangun deterministik, seperti menghitung total tagihan.",
      "Saat kamu butuh klasifikasi label.",
      "Saat pertanyaanmu butuh data terbaru.",
    ],
    jawaban: 1,
    pembahasan:
      "Aturannya: kalau bisa dibangun deterministik, harus begitu. Menghitung total tagihan dengan LLM berarti menambah biaya, menambah latensi, dan menambah kemungkinan salah — untuk hasil yang tidak perlu ditebak. LLM unggul di tempat yang sulit: data tak terstruktur, klasifikasi, jawaban berbasis dokumen, dan tindakan di dunia nyata.",
  },

  "memilih-model": {
    modul: "memilih-model",
    pertanyaan: "Model 70B jalannya sekitar 10x lebih lambat dari model 7B. Apa implikasinya?",
    opsi: [
      "Model 7B selalu lebih bagus karena lebih cepat.",
      "Ada tradeoff ukuran otak vs kecepatan, jadi model besar tidak selalu pilihan terbaik.",
      "Model besar selalu menang karena otaknya lebih besar.",
      "Kecepatan tidak berpengaruh ke kualitas jawaban.",
    ],
    jawaban: 1,
    pembahasan:
      "Jumlah parameter menentukan ukuran otak model, dan model berotak besar umumnya lebih akurat — tapi juga lebih lambat dan lebih mahal. Jadi memilih model selalu trade-off. Praktisnya: jangan langsung ambil yang terkuat. Ambil yang paling kecil yang masih memenuhi kebutuhanmu, dan naikkan hanya kalau ada bukti eval yang bilang perlu.",
  },

  "membuat-model": {
    modul: "membuat-model",
    pertanyaan: "Kenapa model butuh post-training, bukan cuma pre-training?",
    opsi: [
      "Karena pre-training tidak bisa mengubah jumlah parameter.",
      "Karena tanpa post-training, model cuma gumpalan pengetahuan tanpa tahu harus berperilaku seperti asisten.",
      "Karena post-training menambah data latihnya.",
      "Karena post-training membuat model lebih kecil.",
    ],
    jawaban: 1,
    pembahasan:
      "Pre-training memberi model pengetahuan: data internet dikompres jadi angka-angka parameter. Post-training yang membentuk perilaku: instruksi dan contoh mengajari model cara merespons. Tanpa post-training, model punya pengetahuan tapi tidak tahu harus jadi asisten yang helpful.",
  },

  mindset: {
    modul: "mindset",
    pertanyaan: "Kenapa evaluator (eval) disebut 'unit test-nya AI Engineer'?",
    opsi: [
      "Karena eval menjalankan kode secara otomatis persis seperti unit test biasa.",
      "Karena eval mengukur sistem probabilistik dengan skor, sementara unit test biasa hanya pass atau fail.",
      "Karena eval lebih cepat dijalankan.",
      "Karena eval tidak perlu data nyata.",
    ],
    jawaban: 1,
    pembahasan:
      "Perbedaannya pada sifatnya. Unit test biasa: input tertentu menghasilkan output tertentu, jadi assert-nya biner. Sistem LLM: outputnya bisa jadi bagus atau buruk tanpa batas tegas, jadi yang kamu butuh adalah skor. Dengan skor, perubahan bisa diukur: jadi 5% lebih baik, atau 50% lebih buruk. Tanpa itu, kamu cuma menebak-nebak.",
  },

  evals: {
    modul: "evals",
    pertanyaan: "Kenapa 'manual QA saja' berbahaya untuk aplikasi LLM?",
    opsi: [
      "Karena QA manual selalu lebih lambat dari otomatis.",
      "Karena di sistem probabilistik, setiap perubahan bisa memengaruhi seluruh sistem, jadi kamu tidak bisa tahu sedang membaik atau memburuk hanya dari beberapa contoh.",
      "Karena QA manual tidak bisa menguji output yang panjang.",
      "Karena sistem LLM selalu berubah tiap menit.",
    ],
    jawaban: 1,
    pembahasan:
      "Di software deterministik, satu perubahan hanya menyentuh satu halaman, dan QA bisa menguji halaman itu plus smoke test halaman lain. Di sistem LLM, perubahan kecil saja bisa menggeser seluruh perilaku. Dan karena outputnya bervariasi, 'rasanya lebih bagus' bukan bukti. Karena itu eval harus otomatis dan berjalan tiap kali kamu berubah.",
  },

  "teknik-perbaikan": {
    modul: "teknik-perbaikan",
    pertanyaan: "Apa 'Staircase of Complexity Hell' dalam memperbaiki aplikasi LLM?",
    opsi: [
      "Urutan teknik dari yang paling sederhana dan murah ke yang paling mahal dan rumit.",
      "Cara membuat model dilatih ulang setiap minggu.",
      "Daftar tempat menyimpan API key.",
      "Urutan template untuk agent yang paling cepat.",
    ],
    jawaban: 0,
    pembahasan:
      "Urutannya jelas: ubah prompt itu murah. Melatih model dari nol itu sangat mahal. Jadi mulai dari atas tangga dan turun hanya kalau semua opsi sederhana sudah kamu coba. Teknik sederhana sering memberi peningkatan besar dengan usaha kecil — dan hampir selalu lebih murah daripada melompat ke fine-tuning.",
  },
};
