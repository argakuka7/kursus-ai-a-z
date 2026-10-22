/**
 * Lab interaktif: token counter, context window, loop tool call.
 *
 * Semua berjalan di browser tanpa dependensi.
 */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------------------------------------------------------------
   Heuristik token.
  _WORD -> kata umum = 1 token; kata panjang = beberapa.
   Ini estimasi, bukan tokenizer asli. UI menyatakannya terus terang.
   --------------------------------------------------------------- */
const KATA_UMUM = new Set(
  (
    "yang dan di ke dari untuk dengan pada adalah ini itu tidak akan sudah bisa kami saya kamu dia " +
    "kamu mereka kita anda jadi atau tapi juga seperti dalam oleh karena agar dapat ada harus mau " +
    "ingin supaya sebagai lebih paling sangat sekali nya itu ini jika karena maka lebih hanya " +
    "sebuah atau tetapi anda kita bahwa untuk dengan dari adalah ini"
  ).split(" ")
);

function pecahKata(text) {
  const out = [];
  const re = /[A-Za-zÀ-ÿ]+(?:['’-][A-Za-zÀ-ÿ]+)?|\d+|[^\sA-Za-zÀ-ÿ\d]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[0]);
  return out;
}

function biayaToken(kata) {
  if (KATA_UMUM.has(kata.toLowerCase())) return 1;
  if (/^[A-ZÀ-Þ]/.test(kata) && kata.length > 3) return 3;
  if (kata.length > 8) return 3;
  if (kata.length > 4) return 2;
  return 1;
}

export function pasangLabToken(root) {
  const input = root.querySelector("#labTokenInput");
  const chips = root.querySelector("#labTokenChips");
  const statCount = root.querySelector("#labTokenCount");
  const statChars = root.querySelector("#labTokenChars");
  const statRatio = root.querySelector("#labTokenRatio");
  if (!input) return;

  function hitung() {
    const text = input.value;
    const kata = pecahKata(text);
    const html = kata
      .map((k) => {
        const c = biayaToken(k);
        const cls = c >= 3 ? "lab-chip rare" : "lab-chip";
        return `<span class="${cls}">${esc(k)}${c > 1 ? `<sup>×${c}</sup>` : ""}</span>`;
      })
      .join("");
    if (chips) {
      chips.innerHTML =
        html || '<span class="lab-note">Ketik sesuatu untuk melihat pemecahan tokennya.</span>';
    }
    const total = kata.reduce((a, k) => a + biayaToken(k), 0);
    if (statCount) statCount.textContent = total;
    if (statChars) statChars.textContent = text.length;
    if (statRatio)
      statRatio.textContent = text.length ? (text.length / Math.max(total, 1)).toFixed(1) : "0";
  }

  input.addEventListener("input", hitung);
  root.querySelectorAll("[data-token-sample]").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.tokenSample;
      hitung();
    });
  });
  hitung();
}

/* ---------------------------------------------------------------
   Context window + lost in the middle
   --------------------------------------------------------------- */
export function pasangLabKonteks(root) {
  const range = root.querySelector("#labCtxRange");
  const barIn = root.querySelector("#labCtxIn");
  const barOut = root.querySelector("#labCtxOut");
  const txtIn = root.querySelector("#labCtxInTxt");
  const txtOut = root.querySelector("#labCtxOutTxt");
  const txtSisa = root.querySelector("#labCtxSisaTxt");
  const chart = root.querySelector("#labCtxChart");
  if (!range) return;

  const LIMIT = 100;

  function hitung() {
    const pesan = Number(range.value);
    const output = 20;
    let input = 10 + pesan * pesan * 1.55;
    if (input > LIMIT - output) input = LIMIT - output;

    const pIn = (input / LIMIT) * 100;
    const pOut = (output / LIMIT) * 100;

    if (barIn) barIn.style.width = `${pIn}%`;
    if (barOut) barOut.style.width = `${pOut}%`;
    if (txtIn) txtIn.textContent = Math.round(input);
    if (txtOut) txtOut.textContent = output;
    if (txtSisa) txtSisa.textContent = Math.round(LIMIT - input - output);

    if (chart) {
      const n = Math.min(pesan, 12);
      let html = "";
      for (let i = 0; i < n; i += 1) {
        const pos = n === 1 ? 1 : i / (n - 1);
        const pengaruh = 0.3 + 0.7 * Math.abs(pos - 0.5) * 2;
        const h = Math.round(10 + pengaruh * 52);
        html += `<div style="height:${h}px" title="Pesan ${i + 1}"></div>`;
      }
      chart.innerHTML = html;
    }
  }

  range.addEventListener("input", hitung);
  hitung();
}

/* ---------------------------------------------------------------
   Lab karakter (SOUL): draf personality dan lihat hasilnya.
   --------------------------------------------------------------- */
const CONTOH_SOUL = `---
name: Raka
description: Tutor pribadi untuk kelas AI
---

Kamu adalah Raka, tutor pribadi untuk kelas AI.

## Gaya bicara
- Bahasa Indonesia, hangat, singkat
- Maksimal 3 kalimat per jawaban
- Pakai analogi sehari-hari

## Aturan
- Kalau di luar materi, jawab singkat saja
- Kalau tidak tahu, bilang tidak tahu`;

export function pasangLabKarakter(root) {
  const area = root.querySelector("#labSoulArea");
  const cek = root.querySelector("#labSoulCek");
  const hasil = root.querySelector("#labSoulHasil");
  if (!area) return;

  area.value = CONTOH_SOUL;

  if (cek) {
    cek.addEventListener("click", () => {
      const isi = area.value.trim();
      const cek2 = [];
      if (!/^---\n/.test(isi)) cek2.push("Belum ada frontmatter (--- ... ---) di bagian atas.");
      if (!/^name:/m.test(isi)) cek2.push("Field <code>name</code> belum ada.");
      if (!/^description:/m.test(isi)) cek2.push("Field <code>description</code> belum ada.");
      if (cek2.length === 0) {
        const baris = isi.split("\n").length;
        hasil.innerHTML = `<b style="color:var(--ok)">Sudah benar.</b> Frontmatter lengkap, ${baris} baris. Simpan sebagai <code>SOUL.md</code> lalu jalankan <code>hermes /memory</code> untuk memuatnya.`;
      } else {
        hasil.innerHTML = `<b style="color:var(--bad)">Ada yang kurang.</b><ul style="margin:8px 0 0 18px">${cek2
          .map((c) => `<li>${c}</li>`)
          .join("")}</ul>`;
      }
    });
  }
}

/* ---------------------------------------------------------------
   Lab jadwal: hitung kapan cron berikutnya jalan.
   --------------------------------------------------------------- */
export function pasangLabJadwal(root) {
  const jam = root.querySelector("#labCronJam");
  const menit = root.querySelector("#labCronMenit");
  const hasil = root.querySelector("#labCronHasil");
  if (!jam) return;

  const BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  function hitung() {
    const h = Number(jam.value);
    const m = Number(menit.value);
    const now = new Date();
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const selisih = Math.round((next - now) / 60000);
    const jamLagi = Math.floor(selisih / 60);
    const menitLagi = selisih % 60;

    if (hasil) {
      const tanggal = `${HARI[next.getDay()]}, ${next.getDate()} ${BULAN[next.getMonth()]}`;
      hasil.innerHTML =
        `Cron <code>${m} ${h} * * *</code> jalan berikutnya: <b>${tanggal}</b> pukul ` +
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}. ` +
        `<span class="muted">(${jamLagi} jam ${menitLagi} menit lagi)</span>`;
    }
  }

  jam.addEventListener("input", hitung);
  menit.addEventListener("input", hitung);
  hitung();
}

/* ---------------------------------------------------------------
   Lab toolset: lihat dampak jumlah tool terhadap ketepatan pilihan model.
   --------------------------------------------------------------- */
export function pasangLabToolset(root) {
  const slider = root.querySelector("#labToolsetRange");
  const bar = root.querySelector("#labToolsetBar");
  const ket = root.querySelector("#labToolsetKet");
  if (!slider) return;

  function hitung() {
    const n = Number(slider.value);
    const lebar = Math.min(100, 20 + n * 3.2);
    if (bar) bar.style.width = `${lebar}%`;
    if (!ket) return;

    if (n <= 3) {
      ket.innerHTML = `<b style="color:var(--ok)">Bagus.</b> ${n} tool: model jarang salah pilih, dan tiap panggilan tool cepat.`;
    } else if (n <= 7) {
      ket.innerHTML = `<b style="color:var(--warn)">Masih oke.</b> ${n} tool: began bercampur, tapi masih wajar. Kalau agent sering salah panggil, pangkas dulu di sini.`;
    } else if (n <= 12) {
      ket.innerHTML = `<b style="color:var(--warn)">Mulai banyak.</b> ${n} tool: deskripsi tool mulai saling tumpang tindih. Model butuh lebih banyak token untuk membaca semua definisi.`;
    } else {
      ket.innerHTML = `<b style="color:var(--bad)">Terlalu banyak.</b> ${n} tool: definição tool memakan konteks besar dan memperlambat setiap panggilan. Pecah jadi beberapa toolset.`;
    }
  }

  slider.addEventListener("input", hitung);
  hitung();
}
const LANGKAH_TOOL = [
  ["System prompt menyertakan definisi tool", "writeFile(path, content) — deskripsi dan JSON Schema dikirim ke model."],
  ["User mengirim permintaan", '"Buat file .gitignore" — tanpa perlu menyebut nama tool-nya.'],
  ["Model mengembalikan tool call", "id: call_1 · arguments: { path: '.gitignore', content: '' }"],
  ["Aplikasi menjalankan tool", "File benar-benar dibuat di disk. Model belum tahu apa pun."],
  ["Tool result dikirim balik", 'id yang sama: call_1 · hasil: "File .gitignore dibuat".'],
  ["Model menjawab ringkasan", '"Selesai. Isi .gitignore-nya mau ditambah apa?"'],
];

export function pasangLabTool(root) {
  const box = root.querySelector("#labToolSteps");
  const jalankan = root.querySelector("#labToolRun");
  const reset = root.querySelector("#labToolReset");
  if (!box) return;

  box.innerHTML = LANGKAH_TOOL.map(
    (l, i) => `<div class="loop-step" data-step="${i}">
      <div class="loop-num">${i + 1}</div>
      <div><b>${esc(l[0])}</b><p>${esc(l[1])}</p></div>
    </div>`
  ).join("");

  const steps = Array.from(box.querySelectorAll(".loop-step"));
  let timers = [];

  function jalankanLoop() {
    timers.forEach(clearTimeout);
    timers = [];
    steps.forEach((s) => s.classList.remove("on", "done"));
    steps.forEach((s, i) => {
      timers.push(
        setTimeout(() => {
          s.classList.add("on");
          timers.push(
            setTimeout(() => {
              s.classList.remove("on");
              s.classList.add("done");
            }, 850)
          );
        }, i * 650)
      );
    });
  }

  if (jalankan) jalankan.addEventListener("click", jalankanLoop);
  if (reset)
    reset.addEventListener("click", () => {
      timers.forEach(clearTimeout);
      timers = [];
      steps.forEach((s) => s.classList.remove("on", "done"));
    });
}

/* ---------------------------------------------------------------
   Lab memori: pilih file dan lihat who'd melihat isinya.
   --------------------------------------------------------------- */
const LAPISAN_MEMORI = [
  {
    file: "HERMES.md",
    tempat: "root proyek",
    cakupan: "Seluruh tim",
    git: "Ya, ikut ter-commit",
    when: "Standar dan keputusan proyek yang harus dibaca semua orang.",
  },
  {
    file: ".hermes/rules/*.md",
    tempat: "root proyek",
    cakupan: "Seluruh tim",
    git: "Ya, ikut ter-commit",
    when: "Aturan modular per topik. Bagus kalau aturanmu banyak dan berlapis.",
  },
  {
    file: "HERMES.local.md",
    tempat: "root proyek",
    cakupan: "Hanya kamu",
    git: "Tidak, di-ignore git",
    when: "Aturan pribadi di satu proyek. Tidak mengganggu tim yang lain.",
  },
  {
    file: "~/.hermes/HERMES.md",
    tempat: "rumah kamu",
    cakupan: "Hanya kamu, semua proyek",
    git: "Tidak berlaku",
    when: "Preferensi yang berlaku di mana saja: gaya jawaban, bahasa, tool favorit.",
  },
  {
    file: "~/.hermes/projects/<proyek>/memory/",
    tempat: "rumah kamu",
    cakupan: "Hanya kamu, per proyek",
    git: "Tidak berlaku",
    when: "Pelajaran yang Hermes pelajari sendiri dari pemakaian nyata.",
  },
];

export function pasangLabMemori(root) {
  const list = root.querySelector("#labMemoriList");
  if (!list) return;

  list.innerHTML = LAPISAN_MEMORI.map(
    (m, i) => `
    <button class="lab-memori ${i === 0 ? "on" : ""}" data-i="${i}">
      <span class="lm-num">${i + 1}</span>
      <span class="lm-body">
        <b>${esc(m.file)}</b>
        <span class="lm-meta">${esc(m.tempat)} · ${esc(m.cakupan)}</span>
      </span>
    </button>`
  ).join("");

  const detail = root.querySelector("#labMemoriDetail");
  const items = Array.from(list.querySelectorAll(".lab-memori"));

  function pilih(i) {
    items.forEach((el, k) => el.classList.toggle("on", k === i));
    const m = LAPISAN_MEMORI[i];
    if (detail) {
      detail.innerHTML = `
        <p><b>${esc(m.file)}</b></p>
        <p>${esc(m.when)}</p>
        <dl class="lab-kv">
          <dt>Di mana</dt><dd>${esc(m.tempat)}</dd>
          <dt>Siapa yang lihat</dt><dd>${esc(m.cakupan)}</dd>
          <dt>Version control</dt><dd>${esc(m.git)}</dd>
        </dl>`;
    }
  }

  items.forEach((el) =>
    el.addEventListener("click", () => pilih(Number(el.dataset.i)))
  );
  pilih(0);
}

/* ---------------------------------------------------------------
   Lab MCP: simulasi permintaan lewat bridge.
   --------------------------------------------------------------- */
const TOOL_MCP = [
  { nama: "read_file", server: "filesystem", args: '{"path":"README.md"}' },
  { nama: "query", server: "database", args: '{"sql":"select * from users limit 5"}' },
  { nama: "create_issue", server: "github", args: '{"title":"Bug di login"}' },
  { nama: "send_message", server: "slack", args: '{"channel":"#dev","text":"Deploy selesai"}' },
];

export function pasangLabMcp(root) {
  const list = root.querySelector("#labMcpTools");
  const log = root.querySelector("#labMcpLog");
  if (!list) return;

  list.innerHTML = TOOL_MCP.map(
    (t, i) => `<button class="lab-mcp-tool" data-i="${i}">${esc(t.nama)}<span>${esc(t.server)}</span></button>`
  ).join("");

  const steps = Array.from(list.querySelectorAll(".lab-mcp-tool"));

  steps.forEach((btn) =>
    btn.addEventListener("click", () => {
      const t = TOOL_MCP[Number(btn.dataset.i)];
      steps.forEach((s) => s.classList.remove("on"));
      btn.classList.add("on");
      if (!log) return;
      log.innerHTML = `
        <div class="lmcp-step"><b>1 · Hermes</b> <code>${esc(t.nama)}</code> dipanggil</div>
        <div class="lmcp-step"><b>2 · MCP Bridge</b> menerjemahkan ke protokol MCP</div>
        <div class="lmcp-step"><b>3 · Server ${esc(t.server)}</b> menjalankan: <code>${esc(t.args)}</code></div>
        <div class="lmcp-step"><b>4 · Hasil</b> dikembalikan ke Hermes, lalu ke model</div>`;
    })
  );
}

/* ---------------------------------------------------------------
   Lab skill: cek apakah SKILL.md punya bagian yang wajib.
   --------------------------------------------------------------- */
export function pasangLabSkill(root) {
  const area = root.querySelector("#labSkillArea");
  const cek = root.querySelector("#labSkillCek");
  const hasil = root.querySelector("#labSkillHasil");
  if (!area) return;

  area.value = `---
name: fix-issue
description: Perbaiki bug yang dilaporkan
---

# Fix Issue

1. Baca laporan bug.
2. Temukan penyebabnya.
3. Perbaiki, lalu jalankan test.

## Detail
Referensi: \`templates/report.md\``;

  if (!cek) return;
  cek.addEventListener("click", () => {
    const isi = area.value;
    const kurang = [];

    if (!/^---\n/.test(isi)) kurang.push("Frontmatter (--- ... ---) belum ada.");
    if (!/^name:/m.test(isi)) kurang.push("Field <code>name</code> belum ada.");
    if (!/^description:/m.test(isi))
      kurang.push("Field <code>description</code> belum ada — ini yang dilihat model untuk memutuskan apakah skill ini dipakai.");
    if (!/^#\s+\S/m.test(isi))
      kurang.push("Tidak ada judul utama (<code># Judul</code>) yang menjelaskan skill ini.");

    if (!kurang.length) {
      hasil.innerHTML = `<b style="color:var(--ok)">Format lengkap.</b> Skill punya nama, deskripsi, dan instruksi utama. Referensi tambahan (seperti <code>templates/report.md</code>) hanya dibaca kalau memang dibutuhkan.`;
    } else {
      hasil.innerHTML = `<b style="color:var(--bad)">Ada yang kurang.</b><ul style="margin:8px 0 0 18px">${kurang
        .map((c) => `<li>${c}</li>`)
        .join("")}</ul>`;
    }
  });
}

/* ---------------------------------------------------------------
   Lab delegasi: hitung biaya & waktu delegasi.
   --------------------------------------------------------------- */
export function pasangLabDelegasi(root) {
  const slider = root.querySelector("#labDelegasiJumlah");
  const hasil = root.querySelector("#labDelegasiHasil");
  if (!slider) return;

  function hitung() {
    const n = Number(slider.value);
    const konteksTambahan = n * 6000; // token perkiraan per subagent
    const biaya = (konteksTambahan / 1_000_000) * 3.0; // $/jt token masuk (perkiraan kasar)
    const waktu = n <= 1 ? 0 : Math.ceil(n / 3) * 0.5; // menit, asumsi 3 paralel

    if (hasil) {
      hasil.innerHTML = `
        <p><b>${n} subagent</b> → tambahan konteks sekitar <b>${(konteksTambahan / 1000).toFixed(0)}k token</b>.</p>
        <p class="muted" style="margin-top:6px">
          Perkiraan biaya input: <b>$${biaya.toFixed(3)}</b> · perkiraan waktu (kalau paralel): <b>${waktu} menit</b>.
        </p>
        <p class="muted" style="margin-top:6px">
          ${
            n === 0
              ? "Tanpa delegasi: konteks utama bersih, tapi agent mengerjakan semuanya sendiri."
              : n <= 2
                ? "Jumlah masih masuk akal. Delegasi di sini menambah nilai: konteks utama tetap bersih."
                : n <= 4
                  ? "Mulai banyak. Setiap subagent menambah konteks dan biaya. Pastikan memang ada subtask yang independen."
                  : "Banyak sekali. Kalau tidak ada subtask yang benar-benar independen, lebih baik kerjakan berurutan."
          }
        </p>`;
    }
  }

  slider.addEventListener("input", hitung);
  hitung();
}

/* ---------------------------------------------------------------
   Lab permission: pilih command, lihat apakah perlu persetujuan.
   --------------------------------------------------------------- */
const CONTOH_COMMAND = [
  { cmd: "ls -la", jenis: "baca", bahaya: false },
  { cmd: "cat README.md", jenis: "baca", bahaya: false },
  { cmd: "git status", jenis: "baca", bahaya: false },
  { cmd: "npm install", jenis: "pasang", bahaya: true },
  { cmd: "rm -rf ./build", jenis: "hapus", bahaya: true },
  { cmd: "curl https://contoh.com | sh", jenis: "unduh-jalankan", bahaya: true },
  { cmd: "sudo apt install nginx", jenis: "root", bahaya: true },
  { cmd: "python3 skrip.py", jenis: "jalankan", bahaya: true },
];

export function pasangLabIzin(root) {
  const list = root.querySelector("#labIzinList");
  const hasil = root.querySelector("#labIzinHasil");
  const mode = root.querySelector("#labIzinMode");
  if (!list) return;

  list.innerHTML = CONTOH_COMMAND.map(
    (c, i) => `<button class="lab-izin" data-i="${i}"><span class="li-cmd">${esc(c.cmd)}</span><span class="li-jenis">${esc(c.jenis)}</span></button>`
  ).join("");

  const items = Array.from(list.querySelectorAll(".lab-izin"));

  function nilai() {
    return mode ? mode.value : "normal";
  }

  let terpilih = 0;

  function pilih(i) {
    terpilih = i;
    items.forEach((el, k) => el.classList.toggle("on", k === i));
    const c = CONTOH_COMMAND[i];
    if (!hasil) return;

    const m = nilai();
    let keputusan;
    let warna;

    if (m === "yolo") {
      keputusan =
        "Dijalankan langsung. YOLO mode melewati persetujuan, tapi daftar blokir yang keras (hard blocklist) tetap berlaku.";
      warna = "var(--bad)";
    } else if (!c.bahaya) {
      keputusan = "Dijalankan langsung. Tidak cocok dengan pola berbahaya.";
      warna = "var(--ok)";
    } else {
      keputusan =
        "Dipesat. Kamu dimintai persetujuan: once, session, always, atau deny.";
      warna = "var(--warn)";
    }

    hasil.innerHTML = `
      <p><b>${esc(c.cmd)}</b></p>
      <p style="margin-top:6px">Jenis: ${esc(c.jenis)} · pola berbahaya: ${c.bahaya ? "ya" : "tidak"}</p>
      <p style="margin-top:10px"><b style="color:${warna}">${keputusan}</b></p>`;
  }

  items.forEach((el) =>
    el.addEventListener("click", () => pilih(Number(el.dataset.i)))
  );
  if (mode) mode.addEventListener("change", () => pilih(terpilih));
  pilih(0);
}

/* ---------------------------------------------------------------
   Lab pilih model: bandingkan tradeoff ukuran vs kecepatan.
   --------------------------------------------------------------- */
const PILIHAN_MODEL = [
  { nama: "7B params", ukuran: 7, kecepatan: 92, biaya: 0.2, kualitas: 58, konteks: 8 },
  { nama: "13B params", ukuran: 13, kecepatan: 80, biaya: 0.35, kualitas: 66, konteks: 16 },
  { nama: "70B params", ukuran: 70, kecepatan: 24, biaya: 1.4, kualitas: 84, konteks: 32 },
  { nama: "405B params", ukuran: 405, kecepatan: 8, biaya: 3.2, kualitas: 93, konteks: 128 },
];

export function pasangLabModel(root) {
  const list = root.querySelector("#labModelList");
  const hasil = root.querySelector("#labModelHasil");
  const slider = root.querySelector("#labModelButuh");
  if (!list) return;

  list.innerHTML = PILIHAN_MODEL.map(
    (m, i) => `<button class="lab-model" data-i="${i}">
      <span class="lm-name">${esc(m.nama)}</span>
      <span class="lm-tags">kualitas ${m.kualitas} · konteks ${m.konteks}k</span>
    </button>`
  ).join("");

  const items = Array.from(list.querySelectorAll(".lab-model"));

  function pilih(i) {
    items.forEach((el, k) => el.classList.toggle("on", k === i));
    const m = PILIHAN_MODEL[i];
    if (!hasil) return;

    // Kebutuhan minimum dari slider (0-100).
    const butuh = slider ? Number(slider.value) : 60;
    const cukupKualitas = m.kualitas >= butuh;

    const bar = (label, nilai, maks = 100) => {
      const w = Math.round((nilai / maks) * 100);
      return `<div style="display:grid;grid-template-columns:96px 1fr 42px;gap:10px;align-items:center;margin-top:7px">
        <span style="font-size:.76rem;color:var(--text-3)">${label}</span>
        <span style="height:7px;border-radius:99px;background:var(--surface-3);overflow:hidden">
          <span style="display:block;height:100%;width:${w}%;background:var(--accent);opacity:.8"></span>
        </span>
        <span style="font-family:var(--font-mono);font-size:.72rem;color:var(--text-2)">${nilai}</span>
      </div>`;
    };

    hasil.innerHTML = `
      <p><b>${esc(m.nama)}</b></p>
      ${bar("Kualitas", m.kualitas)}
      ${bar("Kecepatan", m.kecepatan)}
      ${bar("Konteks", m.konteks, 128)}
      <p style="margin-top:12px;font-size:.84rem;color:var(--text-2)">
        ${
          cukupKualitas
            ? `<b style="color:var(--ok)">Cukup.</b> Kualitas ${m.kualitas} memenuhi kebutuhanmu (${butuh}).`
            : `<b style="color:var(--bad)">Kurang.</b> Kualitas ${m.kualitas} di bawah kebutuhanmu (${butuh}). Cari model yang lebih besar, atau perbaiki prompt dulu.`
        }
      </p>
      <p style="margin-top:6px;font-size:.84rem;color:var(--text-2)">
        Biaya relatif ${m.biaya}× · kecepatan ${m.kecepatan}/100.
      </p>
      <p style="margin-top:4px;font-size:.84rem;color:var(--text-2)">
        ${
          m.biaya > 1
            ? "Model besar dan mahal. Pakai untuk tugas yang benar-benar butuh."
            : "Model kecil dan murah. Default yang masuk akal untuk kebanyakan tugas."
        }
      </p>`;
  }

  items.forEach((el) =>
    el.addEventListener("click", () => pilih(Number(el.dataset.i)))
  );
  if (slider) slider.addEventListener("input", () => pilih(0));
  pilih(0);
}
