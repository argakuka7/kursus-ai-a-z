---
title: Browser, Hooks & Permission
slug: izin
bagian: 3
modul: 28
durasi: 45 menit
titlePendek: Izin & Hooks
ringkasan: Di mana batas Hermes saat menjalankan command, mengklik di web, dan memicu otomatisasi.
prasyarat: [mulai-cepat, semua-sisi]
diagram: d15-izin
---

# Browser, Hooks & Permission

## Gambaran Umum

Hermes bukan chatbot pasif. Dia bisa menjalankan command di shell, membaca dan menulis file, lalu mengklik tombol di halaman web seperti manusia. Semua itu berarti Hermes bisa merusak mesinmu tanpa sengaja. Satu keputusan salah dari model, misalnya `rm -rf` atau `DROP TABLE`, bisa menghapus pekerjaanmu. Jadi di antara "model memutuskan" dan "sistem benar-benar menjalankannya", ada satu gerbang. Modul ini membahas gerbang itu.

Gerbang di Hermes punya bentuk yang spesifik. Ini bukan daftar izin generik untuk semua tool. Hermes memindai command terminal dengan daftar regex pola berbahaya. Kalau tidak cocok, command langsung jalan. Kalau cocok, Hermes menanyakannya ke kamu, dan kamu punya empat pilihan jawaban. Sebelum itu, Hermes sering bertanya dulu ke LLM pembantu apakah command itu benar-benar berbahaya.

Sisi lain dari dunia Hermes adalah otomatisasi. Browser tool membuat agent bisa mengisi form dan menekan tombol, bukan cuma menarik HTML. Hooks membuat kamu bisa menyisipkan logika sendiri di titik-titik penting siklus hidup agent, tanpa menyentuh kode inti. Dan semua itu dilingkupi satu aturan keamanan sederhana: beri toolset sekecil mungkin, dan jalankan agent yang tidak kamu percaya di backend terisolasi.

## Yang Akan Kamu Pelajari

- Alur persetujuan command berbahaya, dari cek YOLO sampai bertanya ke kamu
- Empat pilihan approval: once, session, always, dan deny
- Kenapa permission Hermes hanya mengunci command terminal, bukan semua tool
- Cara smart approval memakai LLM pembantu untuk menilai risiko
- Kenapa browser tool membaca accessibility tree, bukan HTML atau screenshot
- Dua sistem hook: yang berbasis file di gateway dan yang berbasis kode di agent
- Prinsip keamanan: toolset terkecil dan backend terisolasi

## Konsep Kunci

### Permission: hanya mengunci command terminal

Hermes menyimpan lebih dari 100 pola regex, masing-masing berpasangan dengan deskripsi singkat. Polanya mencakup penghapusan file rekursif, format disk (`mkfs`), SQL destruktif (`DROP TABLE`, `DELETE FROM` tanpa `WHERE`), sinyal proses (`kill -9 -1`), eksekusi script jarak jauh (`curl ... | sh`), dan operasi Git destruktif seperti `git reset --hard`.

Yang penting dipahami: daftar ini hanya berlaku untuk tool terminal. `read_file` dan `web_search` tidak lewat flow ini. Alasannya sederhana. Membaca file tidak merusak apa pun. Menghapus seluruh disk iya. Kalau semua tool dicek, sistem jadi berisik dan kamu akhirnya akan mematikan promptnya sendiri. Yang dikunci hanya operasi yang benar-benar tidak bisa dibatalkan.

Pengaman tambahan: sebelum pencocokan, Hermes menormalisasi command. Karakter fullwidth dan escape sequence ANSI dibuang, supaya pola tidak bisa ditipu. Ada juga hardline blocklist, yaitu lantai bawah yang tidak bisa dilewati. Command seperti menghapus root filesystem atau menulis langsung ke block device tetap ditolak meski YOLO aktif.

### Alur approval: dari YOLO sampai smart approval

Urutannya tetap. Command masuk ke tool terminal, lalu Hermes mengecek YOLO mode. Kalau aktif, command langsung jalan tanpa cek lain. Ini bukan default, dan hanya berlaku untuk sesi tempat kamu mengaktifkannya.

Kalau YOLO mati, command dicocokkan ke daftar pola. Tidak cocok, jalan. Cocok, Hermes cek allowlist: pernah di-setujui untuk sesi ini atau tersimpan permanen di `command_allowlist` pada `config.yaml`? Sudah ada, jalan.

Kalau belum ada di allowlist, barulah Hermes bertanya. Di CLI kamu dapat prompt terminal, di gateway kamu dapat tombol di Telegram atau Slack. Jawabannya empat: `once` untuk sekali ini saja, `session` untuk jenis operasi ini sepanjang sesi, `always` untuk disimpan permanen di config, dan `deny` untuk menolak. Kalau kamu tidak menjawab dalam batas waktu, default-nya deny.

Pilihan `once` tidak disimpan apa pun. `session` dan `always` disimpan, jadi command serupa tidak akan memunculkan prompt lagi. Caching per sesi penting. Tanpa itu, setiap `pip install` memunculkan prompt dan kamu akan mematikan seluruh sistem persetujuan.

Smart approval bekerja di tengah alur itu. Ada satu LLM kedua yang acting sebagai penjaga. Sebelum kamu ditanya, command yang tertahan dikirim ke model pembantu untuk dinilai risikonya. Model itu menjawab `APPROVE`, `DENY`, atau `ESCALATE`. Risiko rendah lolos otomatis, risiko nyata ditolak, kasus yang ambigu naik ke prompt manual.

Tujuannya mengurangi gangguan, bukan menghapus persetujuan. Perintah aman seperti `python -c "print('hello')"` tidak perlu mengganggu kamu. Perintah yang benar-benar berbahaya tetap tertahan.

Command juga diperlakukan sebagai input tak tepercaya, karena teksnya berasal dari model utama yang bisa saja kena prompt injection. Komentar shell dibuang sebelum penilaian, command dibungkus delimiter, dan sistem prompt penjaga diminta mengabaikan instruksi apa pun di dalam blok command. Di config, `approvals.mode` punya tiga nilai: `smart` (default), `manual`, dan `off`.

Command yang ditolak juga dicatat. Dari riwayat approval itu kamu bisa menyusun allowlist lagi, supaya pola yang memang sering kamu setujui tidak memblokirmu berulang kali.

### Browser membaca accessibility tree

Saat agent membuka halaman, yang dia terima bukan HTML dan bukan screenshot. Yang dia terima adalah accessibility tree, yaitu pohon semantik yang menjelaskan elemen interaktif apa saja yang ada di halaman. Pohon ini awalnya dibuat untuk screen reader, tapi justru cocok untuk agent, karena menjawab pertanyaan yang benar-benar diperhatikan agent: apa yang bisa diklik, diisi, dan dibaca.

Perbedaannya dengan DOM. DOM menggambarkan struktur, yaitu div di dalam div. Accessibility tree menggambarkan makna: "ini kotak pencarian", "ini tombol submit". Tiap elemen interaktif mendapat nomor referensi, misalnya `@e1`, `@e2`. Saat agent mau klik, dia tidak menulis selector CSS. Dia menulis `browser_click(ref="e3")`.

| Cara membaca halaman | Kelebihan | Kekurangan |
|---|---|---|
| HTML mentah | Lengkap | Terlalu panjang, banyak tag tak berguna |
| Screenshot + model vision | Paling mirip mata manusia | Lambat, mahal, koordinat rapuh |
| Accessibility tree | Ringkas, semantik, punya referensi elemen | Tidak melihat gaya visual |

Hermes memakai `browser_snapshot` sebagai default, dan hanya beralih ke `browser_vision` saat butuh memahami tampilan, misalnya mencari CAPTCHA atau membaca grafik. Nomor referensi berlaku sampai halaman berubah. Kalau ada dialog muncul, ambil snapshot baru. Referensi lama sudah tidak valid.

State juga bertahan antar-panggilan. Browser berjalan sebagai satu proses Chromium yang panjang umur, jadi cookie dan status login tetap hidup. Tiap `task_id` punya sesinya sendiri, dan sub-agent tidak berbagi sesi browser dengan agent induk.

### Dua sistem hook

Hook adalah callback yang kamu pasang di titik tertentu. Hermes punya dua sistem dengan granularitas berbeda.

Gateway hook berbasis file. Letakkan folder di `~/.hermes/hooks/<nama>/` yang berisi `HOOK.yaml` dan `handler.py`. Manifest itu menyatakan event mana yang didengarkan, misalnya `agent:start` atau `command:*`. Fungsi di `handler.py` wajib bernama `handle`, boleh `def` atau `async def`. Hook ditemukan otomatis saat gateway start, dan hanya berjalan di gateway, bukan di CLI.

Tool dan agent hook berbasis kode, terdaftar lewat `ctx.register_hook("pre_tool_call", ...)` di dalam plugin. Hook ini jalan di CLI maupun gateway, dan punya kekuatan lebih: `pre_tool_call` bisa memblokir pemanggilan tool dengan mengembalikan `{"action": "block"}`, atau mengubah argumennya. Ada juga shell hook, yaitu skrip yang dideklarasikan di blok `hooks:` pada `config.yaml` dan dijalankan sebagai subprocess.

Errornya tidak pernah meneruskan. Kalau satu handler gagal, error dicatat dan agent jalan lagi. Hook rusak tidak menjatuhkan Hermes.

### Model keamanan: toolset terkecil, backend terisolasi

Dua aturan menutup bagian ini.

Pertama, toolset sekecil mungkin. Setiap tool yang aktif adalah permukaan serangan tambahan. Kalau satu workflow cuma butuh web search, matikan toolset lain untuk platform itu. Sub-agent yang diberi tugas sempit juga diberi toolset sempit.

Kedua, untuk agent yang tidak kamu percaya, jangan beri akses ke host. Hermes punya beberapa terminal backend: `local`, `ssh`, `docker`, `modal`, `daytona`, `vercel_sandbox`. Di backend berbasis container atau cloud sandbox, pengecekan command berbahaya dilewati justru karena isolation-nya sudah jadi batasnya. Damage yang mungkin terjadi tertahan di dalam sandbox, bukan di mesinmu.

## Perintah Praktis

```bash
# Lihat keputusan approval tanpa menjalankan command apa pun
hermes approvals test -- rm -rf ./build

# Ubah mode persetujuan: smart (default), manual, atau off
hermes config get approvals.mode
hermes config set approvals.mode manual

# Lihat toolset yang aktif, lalu matikan yang tidak perlu
hermes tools list
hermes tools disable browser

# Lihat, uji, dan periksa hook yang terdaftar
hermes hooks list
hermes hooks test pre_tool_call
hermes hooks doctor

# Tambak allowlist dari riwayat approval yang pernah kamu setujui
hermes approvals suggest

# Jalankan sesi tanpa prompt persetujuan (hanya untuk lingkungan yang kamu percaya)
hermes --yolo
```

## Catatan Penting

- Permission Hermes bukan pipeline izin generik. Kalau kamu membentuk agent di framework lain dan menguji semua tool, kamu akan menguji hal yang tidak diuji Hermes.
- `--yolo` dan `/yolo` mematikan prompt, tapi tidak mematikan hardline blocklist. Perintah yang menghapus root filesystem tetap ditolak.
- Timeout approval berarti deny, bukan allow. Kalau kamu tidak menjawab, command diblokir. Ini yang membuat safe by default.
- Prompt injection bisa masuk lewat isi halaman web. Command yang akan dijalankan Hermes harus diperlakukan sebagai input tak tepercaya, bukan instruksi. Smart approval hanya menilai command, bukan konten halaman.
- Hook di `~/.hermes/hooks/` diproses dalam proses gateway, dengan akses yang sama seperti gateway itu sendiri. Tidak ada sandbox dan tidak ada prompt consent. Baca `handler.py` sebelum ditaruh di sana, persis seperti kamu membaca plugin.
- Toolset yang tidak aktif dan backend yang terisolasi adalah dua lapisan berbeda. Yang pertama mengurangi kemampuan agent, yang kedua mengurangi radius dampak.
- Sesi browser terisolasi per `task_id`. Dua agent yang jalan bersamaan tidak berbagi cookie, jadi login yang sudah kamu lakukan tidak otomatis berlaku untuk agent lain.

## Apa Selanjutnya

Sudah kamu kumpulkan gambaran utuhnya: Hermes sampai sini bisa mengingat, mendelegasikan, berjalur di web, dan kini tahu di mana batasnya. Lanjut ke [Modul 29](/modul/penutup) untuk merangkai semuanya jadi rutinitas kerja harian.
