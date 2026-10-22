/**
 * AI dari A–Z — bootstrap aplikasi.
 *
 * Alur:
 *   1. muat konten (modul .md + kamus.json)
 *   2. bangun sidebar + routing
 *   3. render view sesuai route
 */

import { muatSemua, muatKamus, modulBerikutnya, modulSebelumnya } from "./content.js?v=126";
import { renderMarkdown, escapeHtml, aktifkanGeserTabel } from "./markdown.js?v=126";
import { initDiagram, renderMermaid, sisipkanDiagram, pasangViewbox } from "./diagrams.js?v=126";
import { Router, pasangScrollSpy, scrollKe } from "./router.js?v=126";
import { pasangLabToken, pasangLabKonteks, pasangLabTool, pasangLabKarakter, pasangLabToolset, pasangLabJadwal, pasangLabMemori, pasangLabMcp, pasangLabSkill, pasangLabDelegasi, pasangLabIzin, pasangLabModel } from "./labs.js?v=126";
import { buatKuis, bacaProgres, tandaiSelesai, tandaiKuis, hitungSkor } from "./quiz.js?v=126";
import { SOAL } from "./soal.js?v=126"
import { SOAL_AI_ENGINEER } from "./soal-ai.js";

const state = {
  semua: [],
  perBagian: {},
  bySlug: new Map(),
  kamus: [],
  modulAktif: null,
  unanswered: null,
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const BAGIAN_META = {
  1: { nama: "Fondasi AI", hint: "5 modul · cara kerja LLM" },
  2: { nama: "AI Engineer", hint: "7 modul · peran, use case, eval" },
  3: { nama: "Hermes Praktis", hint: "16 modul · jalankan agent sendiri" },
  4: { nama: "Penutup", hint: "rangkuman & ekosistem" },
};

/* ============================================================
   Tema
   ============================================================ */

const KUNCI_TEMA = "aiz-tema";

function pasangTema() {
  const saved = localStorage.getItem(KUNCI_TEMA);
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTema(saved || (prefersDark ? "gelap" : "terang"));
}

function setTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  localStorage.setItem(KUNCI_TEMA, tema);
  // Diagram & mermaid perlu render ulang supaya warna ikut.
  if (state.modulAktif) renderMermaid($("#view"));
}

/* ============================================================
   Sidebar
   ============================================================ */

function gambarSidebar() {
  const progres = bacaProgres();
  const grup = [];

  for (const bagian of Object.keys(BAGIAN_META).sort()) {
    const list = state.perBagian[bagian] || [];
    if (!list.length) continue;
    grup.push(`
      <div class="side-group">
        <div class="side-title">${BAGIAN_META[bagian].nama}</div>
        ${list
          .map(
            (m) => `<a class="side-link${progres[m.slug] ? " done" : ""}" href="#/modul/${m.slug}"
                data-slug="${m.slug}">
              <span class="side-num">${String(m.modul).padStart(2, "0")}</span>
              <span>${escapeHtml(m.titlePendek || m.title)}</span>
              <span class="side-meta" data-durasi>${escapeHtml(m.durasi)}</span>
            </a>`
          )
          .join("")}
      </div>`);
  }

  const total = state.semua.length;
  const done = state.semua.filter((m) => progres[m.slug]).length;

  return `
    ${grup.join("")}
    <div class="side-progress">
      <div class="side-progress-bar"><i style="width:${total ? (done / total) * 100 : 0}%"></i></div>
      <div class="side-progress-text">
        <span>Progresmu</span>
        <span>${done} / ${total}</span>
      </div>
      ${
        done
          ? `<button class="side-reset" id="sideReset">Reset progres</button>`
          : ""
      }
    </div>`;
}

function perbaruiSidebar() {
  const html = gambarSidebar();
  $("#sidebar").innerHTML = html;
  $("#drawerNav").innerHTML = html;
  $("#drawerNav").querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => tutupDrawer())
  );
  $$(".side-link").forEach((a) =>
    a.addEventListener("click", () => {
      // Sidebar hanya jadi tautan navigasi. Progres ditandai lewat
      // tombol "Tandai selesai" di akhir modul.
    })
  );
  const reset = $("#sideReset");
  if (reset) {
    reset.addEventListener("click", () => {
      if (!confirm("Hapus semua progres belajar di peramban ini?")) return;
      localStorage.removeItem("aiz-progress-v1");
      document.dispatchEvent(new CustomEvent("aiz:progress"));
    });
  }
  tandaiSidebarAktif();
}

function tandaiSidebarAktif() {
  const slug = state.modulAktif?.slug;
  // Durasi cuma relevan saat baca modul. Di halaman lain (kuis,
  // kamus, landing) sidebar cukup jadi daftar navigasi.
  const diModul = !!slug;
  $$("[data-durasi]").forEach((el) => {
    el.hidden = !diModul;
  });
  $$(".side-link").forEach((a) => {
    if (a.dataset.slug === slug) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}

/* ============================================================
   TOC
   ============================================================ */

function gambarToc(headings) {
  const nav = $("#tocLinks");
  const toc = $("#toc");
  const ada = headings && headings.length > 0;
  if (toc) toc.classList.toggle("kosong", !ada);
  if (!ada) {
    nav.innerHTML = "";
    return;
  }
  nav.innerHTML = headings
    .filter((h) => h.level >= 2 && h.level <= 3)
    .map(
      (h) =>
        `<a class="toc-link lvl-${h.level}" href="#${h.id}" data-toc="${h.id}">${escapeHtml(
          h.text
        )}</a>`
    )
    .join("");

  nav.querySelectorAll("[data-toc]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollKe(a.dataset.toc);
      history.replaceState(null, "", `#${a.dataset.toc}`);
    })
  );
}

/* ============================================================
   Landing
   ============================================================ */

function renderLanding() {
  state.modulAktif = null;
  const view = $("#view");
  const total = state.semua.length;
  const jam = state.semua.reduce((n, m) => n + (parseInt(m.durasi, 10) || 0), 0);

  // Jalur belajar: satu baris per bagian, urut dari 1. Baris ini
  // yang jadi主角 halaman, bukan grid kartu yang semua bentuknya sama.
  const jalur = Object.keys(BAGIAN_META)
    .sort()
    .map((b) => {
      const list = state.perBagian[b] || [];
      if (!list.length) return "";
      const meta = BAGIAN_META[b];
      const menit = list.reduce((n, m) => n + (parseInt(m.durasi, 10) || 0), 0);
      // Durasi bisa di bawah 1 jam (mis. 15 menit x 2 modul).
      // Tampilkan-menit saja kalau begitu, biar tidak jadi "0 jam".
      const durasiTeks =
        menit >= 60 ? `${Math.round(menit / 60)} jam` : `${menit} menit`;
      return `
        <button class="jalur-item" data-mulai="${list[0].slug}">
          <span class="jalur-no">${b}</span>
          <span class="jalur-teks">
            <span class="jalur-nama">${escapeHtml(meta.nama)}</span>
            <span class="jalur-ket">${escapeHtml(meta.hint)}</span>
          </span>
          <span class="jalur-meta">${list.length} modul · ${durasiTeks}</span>
          <span class="jalur-arrow" aria-hidden="true">→</span>
        </button>`;
    })
    .join("");

  view.innerHTML = `
    <div class="hero">
      <h1>Belajar AI dari nol, sampai kamu <em>jalanin Hermes sendiri</em>.</h1>
      <p>
        Empat bagian dalam satu tempat. Kamu mulai dari cara kerja LLM dari
        dalam, lanjut ke peran AI Engineer dan cara mengukur hasilnya, lalu
        menjalankan agent Hermes di komputer kamu sendiri sampai jadwal otomatis.
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/modul/${state.semua[0]?.slug || ""}">Mulai dari Modul 01</a>
        <a class="btn" href="#/kamus">Buka Kamus AI</a>
      </div>
    </div>

    <section class="jalur" aria-labelledby="jalurJudul">
      <h2 id="jalurJudul" class="jalur-judul">Jalur belajarmu</h2>
      <div class="jalur-list">${jalur}</div>
    </section>

    <div class="section">
      <h2>Cara belajar di sini</h2>
      <p>
        Setiap modul punya bagian yang sama supaya kamu tahu harus perhatikan ke mana.
      </p>
      <ol class="langkah">
        <li>
          <h3>Baca penjelasannya</h3>
          <p>Bahasa sehari-hari, tapi penjelasan KENAPA tetap ada. Kalau satu kalimat terasa kabur, baca ulang paragrafnya.</p>
        </li>
        <li>
          <h3>Coba lab-nya</h3>
          <p>Laboratorium interaktif di dalam modul. Ubah angkanya, lihat apa yang berubah. Paham lebih cepat daripada membaca.</p>
        </li>
        <li>
          <h3>Jawab kuisnya</h3>
          <p>Kuis dengan pembahasan. Salah itu bukan kegagalan, itu bagian dari proses. Tandai modul selesai kalau sudah paham.</p>
        </li>
      </ol>
    </div>

    <div class="section">
      <h2>Kalau kamu bingung</h2>
      <p>
        Ada Raka, asisten pribadi yang berjalan di server ini. Dia agent Hermes sungguhan,
        jadi jawabannya datang dari model dan skill milikmu sendiri, bukan dari daftar
        jawaban yang ditulis manual. Tanya kapan saja lewat tombol di kanan bawah.
      </p>
      <p style="margin-top:16px">
        <strong>${total} modul</strong> · total baca sekitar <strong>${jam >= 60 ? `${Math.round(jam / 60)} jam` : `${jam} menit`}</strong> ·
        <strong>${state.kamus.length}</strong> istilah AI di kamus.
      </p>
    </div>

    <div class="section">
      <h2>Kamu yang baru mulai? Ikuti urutan ini</h2>
      <p>
        Kalau kamu belum pernah memakai AI sama sekali, jangan mulai dari Modul 06.
        Urutan di bawah paling jarang bikin mentok.
      </p>
      <ol class="harian">
        <li>
          <span class="hari">Hari 1</span>
          <span class="hari-teks"><strong>Modul 01 dan 02</strong> — Pesan dan token. Dua ini kunci semua yang lain. Selesai, kamu tahu cara kerja model.</span>
        </li>
        <li>
          <span class="hari">Hari 2</span>
          <span class="hari-teks"><strong>Modul 03 dan 04</strong> — Context window dan tools. Di sinilah kamu mulai bisa mengukur dan meminta model bertindak.</span>
        </li>
        <li>
          <span class="hari">Hari 3</span>
          <span class="hari-teks"><strong>Modul 05, lalu pasang Hermes</strong> — Agent vs workflow. Setelah itu, pasang Hermes di komputermu sendiri lewat Modul 13.</span>
        </li>
      </ol>
      <p style="margin-top:24px">
        Butuh rujukan? Buka <a href="#/kamus">Kamus AI</a> dulu kalau ada istilah yang
        tidak kamu kenal, atau <a href="#/kuis">Kuis</a> kalau mau cek pemahamanmu.
      </p>
    </div>`;

  view.querySelectorAll("[data-mulai]").forEach((btn) =>
    btn.addEventListener("click", () => {
      window.location.hash = `#/modul/${btn.dataset.mulai}`;
    })
  );

  // Section keluar saat masuk viewport (satu kali, tidak diputar).
  // Fallback aman: kalau IntersectionObserver tidaksupported atau section
  // tidak pernah memicu (deep link, cetak), isinya tetap terlihat.
  const pasangReveal = (el) => {
    el.classList.add("reveal");
    el.classList.add("in");
  };

  if ("IntersectionObserver" in window) {
    // Class ini hanya aktif kalau observer bisa dipakai. Tanpa itu,
    // isi tetap terlihat (lihat .reveal di styles.css).
    view.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    view.querySelectorAll(".section, .path-card, .jalur-item").forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
      io.observe(el);
    });

    // Jaring pengaman: kalau observer tidak pernah memicu (tab tidak
    // aktif, browser lama, deep link), semua blok tetap ditampilkan
    // setelah 2,5 detik. Isi tidak boleh bergantung pada animasi.
    window.setTimeout(() => {
      view.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    }, 2500);
  } else {
    view.querySelectorAll(".section, .path-card, .jalur-item").forEach(pasangReveal);
  }

  gambarToc([]);
  perbaruiSidebar();
  window.scrollTo({ top: 0, behavior: "instant" });
  pasangRelJalur();
}

/**
 * Rel vertikal di halaman depan: garis amber tumbuh mengikuti posisi
 * scroll, jadi murid bisa lihat sejauh mana dia sudah jalan.
 */
function pasangRelJalur() {
  const list = document.querySelector(".jalur-list");
  if (!list) return;
  const update = () => {
    const b = list.getBoundingClientRect();
    const tinggi = list.offsetHeight;
    if (!tinggi) return;
    // 0% saat daftar belum masuk layar, 100% saat sudah lewat.
    const lewat = Math.min(Math.max((window.innerHeight * 0.7 - b.top) / tinggi, 0), 1);
    // Nilai dalam piksel, bukan persen: tinggi rel harus absolut.
    const px = Math.max(0, Math.round(lewat * tinggi - 28));
    list.style.setProperty("--rail", `${px}px`);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ============================================================
   Modul
   ============================================================ */

function labUntuk(modul) {
  const map = {
    pesan: null,
    token: "token",
    "context-window": "konteks",
    tools: "tool",
    agent: null,
    karakter: "karakter",
    toolsets: "toolset",
    jadwal: "jadwal",
    memori: "memori",
    mcp: "mcp",
    skills: "skill",
    delegasi: "delegasi",
    izin: "izin",
    "memilih-model": "model",
  };
  return map[modul.slug] || null;
}

function renderModul(slug) {
  const modul = state.bySlug.get(slug);
  if (!modul) {
    renderLanding();
    return;
  }
  state.modulAktif = modul;

  const { html, headings } = renderMarkdown(modul.body);
  const view = $("#view");
  // Fade tepi + petunjuk geser untuk tabel yang melebihi lebar layar.
  aktifkanGeserTabel(view);
  const bagian = BAGIAN_META[modul.bagian] || { nama: "" };
  const berikut = modulBerikutnya(state.semua, modul);
  const sebelum = modulSebelumnya(state.semua, modul);
  const soal = SOAL[modul.slug];

  view.innerHTML = `
    <article>
      <div class="mod-head">
        <div class="mod-crumbs">
          <a href="#/mulai">Mulai</a>
          <span>/</span>
          <span>${escapeHtml(bagian.nama)}</span>
          <span>/</span>
          <span>Modul ${String(modul.modul).padStart(2, "0")}</span>
        </div>
        <h1>${escapeHtml(modul.title)}</h1>
        ${
          modul.ringkasan ? `<p class="mod-lede">${escapeHtml(modul.ringkasan)}</p>` : ""
        }
        <div class="mod-meta">
          <span><b>Waktu</b> ${escapeHtml(modul.durasi)}</span>
          <span><b>Modul</b> ${modul.modul} dari ${state.semua.length}</span>
          ${
            modul.prasyarat?.length
              ? `<span class="mod-prasyarat">
                  <b>Perlu paham</b>
                  ${modul.prasyarat
                    .map(
                      (slug) =>
                        `<a href="#/modul/${slug}">${escapeHtml(
                          state.bySlug.get(slug)?.titlePendek || slug
                        )}</a>`
                    )
                    .join(", ")}
                </span>`
              : ""
          }
        </div>
      </div>

      <div class="prose" id="prose">${html}</div>

      <div id="labSlot"></div>

      ${
        soal
          ? `<div id="quizSlot"></div>`
          : `<p class="lab-note" style="margin-top:32px">
              Modul ini belum punya kuis. Kuis ada di modul fondasi (01–05).
            </p>`
      }

      <nav class="mod-nav">
        ${
          sebelum
            ? `<a href="#/modul/${sebelum.slug}">
                <span class="dir">← Sebelumnya</span>
                <span class="ttl">${escapeHtml(sebelum.title)}</span>
              </a>`
            : "<span style='flex:1'></span>"
        }
        ${
          berikut
            ? `<a href="#/modul/${berikut.slug}">
                <span class="dir">Selanjutnya →</span>
                <span class="ttl">${escapeHtml(berikut.title)}</span>
              </a>`
            : `<a href="#/kamus">
                <span class="dir">Selesai →</span>
                <span class="ttl">Lihat Kamus AI</span>
              </a>`
        }
      </nav>
    </article>`;

  // Fade tepi + petunjuk geser untuk tabel yang melebihi lebar layar.
  aktifkanGeserTabel(view);

  // Sisipkan diagram setelah paragraf pertama.
  if (modul.diagram) {
    const prose = $("#prose");
    const firstP = prose?.querySelector("p");
    if (firstP && prose) {
      const fig = sisipkanDiagram(modul.diagram, prose);
      pasangViewbox(fig, modul.diagram);
      firstP.insertAdjacentElement("afterend", fig);
    }
  }

  // Lab.
  const jenis = labUntuk(modul);
  if (jenis) {
    const slot = $("#labSlot");
    slot.innerHTML = htmlLab(jenis);
    if (jenis === "token") pasangLabToken(slot);
    if (jenis === "konteks") pasangLabKonteks(slot);
    if (jenis === "tool") pasangLabTool(slot);
    if (jenis === "karakter") pasangLabKarakter(slot);
    if (jenis === "toolset") pasangLabToolset(slot);
    if (jenis === "jadwal") pasangLabJadwal(slot);
    if (jenis === "memori") pasangLabMemori(slot);
    if (jenis === "mcp") pasangLabMcp(slot);
    if (jenis === "skill") pasangLabSkill(slot);
    if (jenis === "delegasi") pasangLabDelegasi(slot);
    if (jenis === "izin") pasangLabIzin(slot);
    if (jenis === "model") pasangLabModel(slot);
  }

  // Kuis.
  if (soal) {
    const slot = $("#quizSlot");
    slot.appendChild(buatKuis(soal, `kuis-${modul.slug}`));
  }

  // Modul dihitung selesai setelah kamu menekan tombolnya, bukan otomatis
  // saat halaman dibuka. Jadi progres mencerminkan usaha, bukan sekadar dibuka.
  const nav = view.querySelector(".mod-nav");
  if (nav) {
    const btn = document.createElement("button");
    btn.className = "btn btn-sm";
    const sudah = bacaProgres()[modul.slug]?.selesai;
    btn.textContent = sudah ? "Sudah selesai ✓" : "Tandai selesai ✓";
    btn.style.flex = "1 1 100%";
    btn.style.justifyContent = "center";
    if (sudah) btn.disabled = true;
    btn.addEventListener("click", () => {
      tandaiSelesai(modul.slug);
      btn.textContent = "Tersimpan ✓";
      btn.disabled = true;
      document.dispatchEvent(new CustomEvent("aiz:progress"));
    });
    nav.prepend(btn);
  }

  renderMermaid(view);
  gambarToc(headings);
  perbaruiSidebar();
  pasangScrollSpy(headings, (id) => {
    $$(".toc-link").forEach((a) => a.classList.toggle("active", a.dataset.toc === id));
  });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function htmlLab(jenis) {
  if (jenis === "token") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Token counter</h3>
          <span class="hint"> ketik untuk melihat pemecahan token</span>
        </div>
        <div class="lab-body">
          <div class="lab-stats">
            <div class="lab-stat"><b id="labTokenCount">0</b><span>Token</span></div>
            <div class="lab-stat"><b id="labTokenChars">0</b><span>Karakter</span></div>
            <div class="lab-stat"><b id="labTokenRatio">0</b><span>Char / token</span></div>
          </div>
          <label for="labTokenInput">Teks yang ingin dihitung</label>
          <textarea id="labTokenInput" rows="3" placeholder="Ketik sesuatu…">O Frabjous Day</textarea>
          <div class="lab-row" style="margin-top:12px">
            <button class="btn btn-sm" data-token-sample="Sahabat satu backers, sahabat tegar, SETIA.">Kata umum</button>
            <button class="btn btn-sm" data-token-sample="O Frabjous Day">Kata langka</button>
            <button class="btn btn-sm" data-token-sample="a3f9c2e1b7d4e8a">Kode acak</button>
          </div>
          <div class="lab-chips" id="labTokenChips" style="margin-top:12px"></div>
          <p class="lab-note">
            Ini estimasi lokal, bukan tokenizer asli. Aturan mainnya: kata umum jadi 1 token,
            kata panjang atau kapital di awal dipecah jadi beberapa. Tokenizer asli yang
            menentukan; ini cukup untuk melihat polanya.
          </p>
        </div>
      </div>`;
  }

  if (jenis === "konteks") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Context window</h3>
          <span class="hint"> geser jumlah riwayat</span>
        </div>
        <div class="lab-body">
          <div class="ctx-bar">
            <div class="ctx-seg in" id="labCtxIn" style="width:30%"></div>
            <div class="ctx-seg out" id="labCtxOut" style="width:20%"></div>
          </div>
          <div class="ctx-legend">
            <span><i style="background:var(--accent)"></i>Input <b id="labCtxInTxt">0</b></span>
            <span><i style="background:var(--accent-2)"></i>Output <b id="labCtxOutTxt">0</b></span>
            <span><i style="background:var(--surface-3)"></i>Sisa <b id="labCtxSisaTxt">0</b></span>
          </div>
          <label for="labCtxRange">Jumlah pesan dalam riwayat</label>
          <input type="range" id="labCtxRange" min="1" max="40" value="6" />
          <div class="lost-chart" id="labCtxChart" style="margin-top:12px"></div>
          <p class="lab-note">
            Bar yang rendah = pengaruh pesan ke jawaban kecil. Perhatikan pola U: pesan di
            awal dan akhir_history punya pengaruh besar, pesan di tengah hilang.
            Ini yang disebut "lost in the middle".
          </p>
        </div>
      </div>`;
  }

  if (jenis === "jadwal") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Kapan cron berikutnya jalan?</h3>
          <span class="hint"> atur jam & menit</span>
        </div>
        <div class="lab-body">
          <div class="lab-row" style="gap:20px">
            <div style="flex:1 1 140px">
              <label for="labCronJam">Jam</label>
              <input type="range" id="labCronJam" min="0" max="23" value="9" />
            </div>
            <div style="flex:1 1 140px">
              <label for="labCronMenit">Menit</label>
              <input type="range" id="labCronMenit" min="0" max="59" value="0" />
            </div>
          </div>
          <p class="lab-note" id="labCronHasil" style="margin-top:14px"></p>
        </div>
      </div>`;
  }

  if (jenis === "memori") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Di mana memori disimpan?</h3>
          <span class="hint"> klik tiap lapisan</span>
        </div>
        <div class="lab-body">
          <div class="lab-memori-list" id="labMemoriList"></div>
          <div class="lab-memori-detail" id="labMemoriDetail"></div>
        </div>
      </div>`;
  }

  if (jenis === "mcp") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Simulasikan satu tool call MCP</h3>
          <span class="hint"> klik tool untuk jalankan</span>
        </div>
        <div class="lab-body">
          <div class="lab-mcp-list" id="labMcpTools"></div>
          <div class="lab-mcp-log" id="labMcpLog"></div>
        </div>
      </div>`;
  }

  if (jenis === "skill") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Cek format SKILL.md</h3>
          <span class="hint"> ubah, lalu periksa</span>
        </div>
        <div class="lab-body">
          <label for="labSkillArea">Isi file SKILL.md</label>
          <textarea id="labSkillArea" rows="13" style="font-family:var(--font-mono);font-size:0.8rem;line-height:1.6"></textarea>
          <div class="lab-row" style="margin-top:12px">
            <button class="btn btn-primary btn-sm" id="labSkillCek">Periksa format</button>
          </div>
          <div id="labSkillHasil" class="lab-note" style="margin-top:12px"></div>
        </div>
      </div>`;
  }

  if (jenis === "delegasi") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Berapa subagent yang wajar?</h3>
          <span class="hint"> geser jumlah subagent</span>
        </div>
        <div class="lab-body">
          <label for="labDelegasiJumlah">Jumlah subagent</label>
          <input type="range" id="labDelegasiJumlah" min="0" max="8" value="2" />
          <div id="labDelegasiHasil" class="lab-note" style="margin-top:12px"></div>
        </div>
      </div>`;
  }

  if (jenis === "model") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Pilih model sesuai kebutuhan</h3>
          <span class="hint"> geser kebutuhan minimummu</span>
        </div>
        <div class="lab-body">
          <label for="labModelButuh">Kualitas minimum yang kamu butuhkan (0-100)</label>
          <input type="range" id="labModelButuh" min="30" max="100" value="60" />
          <div class="lab-model-list" id="labModelList" style="margin-top:12px"></div>
          <div id="labModelHasil" style="margin-top:12px"></div>
        </div>
      </div>`;
  }

  if (jenis === "izin") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Simulator persetujuan</h3>
          <span class="hint"> pilih command, lihat verdict</span>
        </div>
        <div class="lab-body">
          <label for="labIzinMode">Mode</label>
          <select id="labIzinMode" style="width:100%;padding:9px 12px;border-radius:var(--r-sm);border:1px solid var(--line-2);background:var(--bg);color:var(--text);font:inherit;font-size:var(--fs-sm)">
            <option value="normal">Normal (default)</option>
            <option value="yolo">YOLO mode (/yolo)</option>
          </select>
          <div class="lab-izin-list" id="labIzinList" style="margin-top:12px"></div>
          <div id="labIzinHasil" style="margin-top:12px"></div>
        </div>
      </div>`;
  }

  if (jenis === "karakter") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Susun SOUL.md</h3>
          <span class="hint"> ubah, lalu cek hasilnya</span>
        </div>
        <div class="lab-body">
          <label for="labSoulArea">Isi file SOUL.md</label>
          <textarea id="labSoulArea" rows="14" style="font-family:var(--font-mono);font-size:0.8rem;line-height:1.6"></textarea>
          <div class="lab-row" style="margin-top:12px">
            <button class="btn btn-primary btn-sm" id="labSoulCek">Periksa format</button>
          </div>
          <div id="labSoulHasil" class="lab-note" style="margin-top:12px"></div>
        </div>
      </div>`;
  }

  if (jenis === "toolset") {
    return `
      <div class="lab">
        <div class="lab-head">
          <h3>Lab · Berapa tool yang ideal?</h3>
          <span class="hint"> geser jumlah tool</span>
        </div>
        <div class="lab-body">
          <label for="labToolsetRange">Jumlah tool yang aktif</label>
          <input type="range" id="labToolsetRange" min="1" max="20" value="4" />
          <div style="height:26px;border-radius:var(--r-sm);border:1px solid var(--line);background:var(--bg);overflow:hidden;margin-top:8px">
            <div id="labToolsetBar" style="height:100%;width:30%;background:var(--accent);opacity:.8;transition:width 300ms var(--ease-out)"></div>
          </div>
          <p class="lab-note" id="labToolsetKet" style="margin-top:10px"></p>
        </div>
      </div>`;
  }

  return `
    <div class="lab">
      <div class="lab-head">
        <h3>Lab · Loop tool call</h3>
        <span class="hint"> klik jalan, lihat 6 langkahnya</span>
      </div>
      <div class="lab-body">
        <div class="loop-steps" id="labToolSteps"></div>
        <div class="lab-row">
          <button class="btn btn-primary btn-sm" id="labToolRun">Jalankan loop</button>
          <button class="btn btn-sm" id="labToolReset">Reset</button>
        </div>
        <p class="lab-note">
          Perhatikan langkah 3 dan 4. Di langkah 3 model hanya meminta. Yang benar-benar
          terjadi ada di langkah 4, di aplikasi kamu.
        </p>
      </div>
    </div>`;
}

/* ============================================================
   Kuis gabungan
   ============================================================ */

function renderKuis() {
  state.modulAktif = null;
  const view = $("#view");

  const modulDenganSoal = state.semua.filter((m) => SOAL[m.slug]);
  const totalSoal = modulDenganSoal.length;

  view.innerHTML = `
    <div class="mod-head">
      <div class="mod-crumbs"><a href="#/mulai">Mulai</a><span>/</span><span>Kuis</span></div>
      <h1>Uji Pemahamanmu</h1>
      <p class="mod-lede">
        ${totalSoal} soal dari modul yang kamu baca. Setiap jawaban salah disertai
        pembahasan, jadi kamu belajar dari kesalahan too. Skor tersimpan di
        peramban ini.
      </p>
    </div>

    <div class="skor-box" id="skorBox"></div>

    <div id="kuisSemua" class="quiz" style="max-width:760px"></div>

    <div class="section">
      <h2>Belajar lagi</h2>
      <p>Kalau soal tertentu masih membingungkan, buka lagi modul asalnya.</p>
      <div class="path">
        ${modulDenganSoal
          .map(
            (m) => `<button class="path-card" data-mulai="${m.slug}">
              <span class="n">MODUL ${String(m.modul).padStart(2, "0")}</span>
              <h3>${escapeHtml(m.titlePendek || m.title)}</h3>
              <p>${escapeHtml(m.ringkasan)}</p>
              <span class="cnt">${escapeHtml(m.durasi)}</span>
            </button>`
          )
          .join("")}
      </div>
    </div>`;

  // Kuis: skor di kotak atas harus ikut berubah saat menjawab.
  const holder = $("#skorBox");
  if (holder) {
    const paint = () => {
      const s = hitungSkor(SOAL, state.semua);
      holder.innerHTML = `
        <div class="skor-angka"><b>${s.benar}</b><span>dari ${s.dijawab} dijawab</span></div>
        <div class="skor-keterangan">
          ${
            s.dijawab === 0
              ? "Belum ada soal yang dijawab. Buka modul mana saja, lalu jawab pertanyaannya."
              : s.benar === s.dijawab
                ? "Semua jawabanmu tepat. Lanjut ke modul berikutnya."
                : `Ada ${s.dijawab - s.benar} yang belum tepat. Baca pembahasannya di bawah, lalu coba lagi.`
          }
        </div>
        <div class="skor-total">${s.benar} / ${s.total} soal</div>`;
    };
    document.addEventListener("aiz:progress", paint);
    paint();
  }

  const holder2 = $("#kuisSemua");
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gap = "20px";
  holder2.appendChild(wrap);

  for (const m of modulDenganSoal) {
    const soal = SOAL[m.slug];
    const blok = document.createElement("div");
    blok.style.borderTop = "1px solid var(--line)";
    blok.style.paddingTop = "18px";
    const label = document.createElement("div");
    label.className = "kamus-cat";
    label.textContent = `Modul ${String(m.modul).padStart(2, "0")} · ${m.titlePendek || m.title}`;
    blok.appendChild(label);
    blok.appendChild(buatKuis(soal, `kuis-semua-${m.slug}`));
    wrap.appendChild(blok);
  }

  view.querySelectorAll("[data-mulai]").forEach((btn) =>
    btn.addEventListener("click", () => {
      window.location.hash = `#/modul/${btn.dataset.mulai}`;
    })
  );

  gambarToc([]);
  perbaruiSidebar();
  window.scrollTo({ top: 0, behavior: "instant" });
  pasangRelJalur();
}

/* ============================================================
   Kamus
   ============================================================ */

function renderKamus() {
  state.modulAktif = null;
  const view = $("#view");

  const kategori = {};
  for (const k of state.kamus) (kategori[k.kategori] ||= []).push(k);

  // Sidebar kamus: daftar kategori, bukan 71 istilah yang duplikat
  // dengan kolom utama. Kalau dua-duanya ada, yang kedua jadi
  // kembar.
  const groups = Object.entries(kategori)
    .map(
      ([nama, list]) => `
      <div class="side-group">
        <div class="side-title">${escapeHtml(nama)}</div>
        <a class="side-link side-kategori" href="#/kamus" data-kamus-kat="${escapeHtml(nama)}">
          <span>${list.length} istilah</span>
        </a>
      </div>`
    )
    .join("");

  view.innerHTML = `
    <div class="mod-head">
      <div class="mod-crumbs"><a href="#/mulai">Mulai</a><span>/</span><span>Kamus AI</span></div>
      <h1>Kamus AI</h1>
      <p class="mod-lede">
        ${state.kamus.length} istilah AI, ditulis singkat dan dalam Bahasa Indonesia.
        Pakai ini kalau bingung membaca modul — tiap istilah punya penjelasan lengkap
        dan saling terhubung.
      </p>
    </div>

    <div class="kamus-search">
      <input type="text" id="kamusCari" placeholder="Cari istilah… (Ctrl+K)" autocomplete="off" />
    </div>

    <div class="kamus-wrap" id="kamusWrap">
      <div id="kamusList"></div>
      <aside class="kamus-detail" id="kamusDetail" aria-label="Detail istilah">
        <p class="kamus-detail-kosong">
          Pilih satu istilah di daftar untuk membaca penjelasan lengkapnya.
        </p>
      </aside>
    </div>`;

  const list = $("#kamusList");

  function gambar(query = "") {
    const q = query.trim().toLowerCase();
    const cocok = state.kamus.filter(
      (k) =>
        !q ||
        k.istilah.toLowerCase().includes(q) ||
        k.ringkas.toLowerCase().includes(q) ||
        k.kategori.toLowerCase().includes(q)
    );

    if (!cocok.length) {
      list.innerHTML = '<p class="lab-note">Tidak ada istilah yang cocok.</p>';
      return;
    }

    const byKat = {};
    for (const k of cocok) (byKat[k.kategori] ||= []).push(k);

    // Daftar baris, bukan grid kartu. Satu istilah = satu baris, jadi
    // 71 istilah terbaca sebagai daftar, bukan jadi dinding kartu.
    list.innerHTML = Object.entries(byKat)
      .map(
        ([nama, items]) => `
        <section class="kamus-kat">
          <h2 class="kamus-kat-judul">${escapeHtml(nama)}<span>${items.length}</span></h2>
          <ul class="kamus-rows">
            ${items
              .map(
                (k) => `<li>
                  <button class="kamus-row" data-slug="${k.slug}">
                    <span class="kamus-istilah">${escapeHtml(k.istilah)}</span>
                    <span class="kamus-ringkas">${escapeHtml(k.ringkas)}</span>
                  </button>
                </li>`
              )
              .join("")}
          </ul>
        </section>`
      )
      .join("");

    list.querySelectorAll(".kamus-row").forEach((btn) =>
      btn.addEventListener("click", () => bukaIstilah(btn.dataset.slug))
    );
  }

  function bukaIstilah(slug) {
    const k = state.kamus.find((x) => x.slug === slug);
    if (!k) return;
    const { html } = renderMarkdown(k.isi);
    const holder = $("#kamusDetail");
    if (!holder) return;
    holder.innerHTML = `
      <button class="kamus-detail-tutup" id="kamusTutup" aria-label="Tutup detail">&times;</button>
      <span class="kamus-cat">${escapeHtml(k.kategori)}</span>
      <h2>${escapeHtml(k.istilah)}</h2>
      <div class="isi">${html}</div>`;
    holder.hidden = false;
    holder.scrollTop = 0;
    document.body.classList.add("kamus-detail-terbuka");
    $$(".kamus-row").forEach((b) =>
      b.classList.toggle("dipilih", b.dataset.slug === slug)
    );
    // Di layar kecil panel detail ada di bawah daftar yang panjang.
    // Geser ke sana supaya penjelasannya langsung terlihat.
    if (window.matchMedia("(max-width: 1100px)").matches) {
      holder.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $("#kamusTutup").addEventListener("click", () => {
      holder.hidden = true;
      document.body.classList.remove("kamus-detail-terbuka");
      $$(".kamus-row").forEach((b) => b.classList.remove("dipilih"));
    });
    renderMermaid(holder);
  }

  $("#kamusCari").addEventListener("input", (e) => gambar(e.target.value));
  gambar();

  // Sidebar khusus kamus.
  $("#sidebar").innerHTML = groups;
  $("#drawerNav").innerHTML = groups;
  // Klik kategori: scroll ke kategori itu di daftar utama.
  $$("[data-kamus-kat]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const kat = a.dataset.kamusKat;
      const target = [...document.querySelectorAll(".kamus-kat-judul")].find((h) =>
        h.textContent.trim().startsWith(kat)
      );
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      tutupDrawer();
    })
  );

  gambarToc([]);
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ============================================================
   Drawer
   ============================================================ */

function bukaDrawer() {
  $("#drawer").classList.add("open");
  $("#drawerBackdrop").classList.add("open");
}

function tutupDrawer() {
  $("#drawer").classList.remove("open");
  $("#drawerBackdrop").classList.remove("open");
}

/* ============================================================
  lienAsisten
   ============================================================ */

const ASSISTEN_SUGGEST = [
  "Jelaskan Modul 3 pakai analogi sederhana",
  "Bedakan agent dan workflow",
  "Contoh system prompt yang bagus",
  "Buatkan latihan soal untuk saya",
];

function initAsisten() {
  const body = $("#asistenBody");
  const input = $("#asistenInput");
  const panel = $("#asistenPanel");
  let sessionId = null;
  let backendAda = false;

  const suggest = $("#asistenSuggest");
  suggest.innerHTML = ASSISTEN_SUGGEST.map(
    (s) => `<button type="button">${escapeHtml(s)}</button>`
  ).join("");

  function status(text, online) {
    const el = $("#asistenStatus");
    if (!el) return; // panel sudah dihapus (mode publik)
    el.className = online ? "st" : "st off";
    el.innerHTML = `<i></i><span>${escapeHtml(text)}</span>`;
  }

  function bubble(role, html) {
    const el = document.createElement("div");
    el.className = `msg-bubble ${role}`;
    el.innerHTML = html;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  bubble(
    "ai",
    "<b>Raka:</b> Hai. Aku Raka, asisten pribadi kelas ini. Tanya aku soal materi AI, Hermes, atau apa pun yang sedang kamu kerjakan."
  );

  // Cek backend Hermes.
  fetch("/api/health")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      backendAda = !!(d && d.asisten !== false);
      if (!backendAda) {
        // Mode publik: panel Raka disembunyikan, website tetap utuh.
        $("#asistenFab").remove();
        $("#asistenPanel").remove();
        status("Asisten dimatikan", false);
        return;
      }
      status(`Terhubung · profil ${d.profile}`, true);
    })
    .catch(() => {
      backendAda = false;
      status("Mode simulasi · backend tidak aktif", false);
    });

  const RESPONS_SIMULASI = [
    {
      pola: /(modul\s*3|context|konteks)/i,
      teks:
        "Context window itu seperti meja kerja LLM. Kalau meja penuh, file yang paling lama diletakkan paling sering terlupaan. Solusinya: pangkas konteks, jangan ditumpuk semuanya.",
    },
    {
      pola: /(agent|workflow)/i,
      teks:
        "Workflow = langkahnya ditulis developer di kode. Agent = LLM yang memutuskan sendiri tool mana dan kapan berhenti. Task yang jelas dan berulang? Pakai workflow. Jalannya belum pasti? Pakai agent.",
    },
    {
      pola: /(system prompt|prompt)/i,
      teks:
        "Contoh system prompt yang bagus: 'Kamu adalah Raka, tutor kelas AI. Jawab dalam Bahasa Indonesia, maksimal 3 kalimat, pakai analogi sehari-hari. Kalau di luar materi, jawab singkat saja.'",
    },
    {
      pola: /(latihan|soal|kuis|uji)/i,
      teks:
        "Coba latihan ini: 1) Jelaskan bedanya token dan context window. 2) Kapan workflow lebih baik dari agent? 3) Kenapa error tool harus dikembalikan ke model? Jawab satu per satu, aku koreksi.",
    },
  ];

  function simulasi(text) {
    for (const r of RESPONS_SIMULASI) if (r.pola.test(text)) return r.teks;
    return "Pertanyaan yang bagus. Di mode ini jawabannya masih simulasi. Nyalakan backend Hermes (node server/serve.mjs) supaya jawabannya datang dari agent sungguhan.";
  }

  async function kirim(text) {
    const pesan = (text ?? input.value).trim();
    if (!pesan) return;
    input.value = "";
    bubble("user", escapeHtml(pesan));

    // Sertakan konteks modul yang sedang dibaca supaya Raka Relevan.
    const mod = state.modulAktif;
    const prompt = mod
      ? `[Murid sedang belajar modul "${mod.title}" dari kelas AI dari A–Z. Jawab dalam Bahasa Indonesia, maksimal 120 kata, pakai analogi sederhana.]\n\n${pesan}`
      : pesan;

    if (!backendAda) {
      const thinking = bubble("ai", '<span class="typing"><i></i><i></i><i></i></span>');
      setTimeout(() => {
        thinking.innerHTML = `<b>Raka:</b> ${escapeHtml(simulasi(pesan))}`;
        body.scrollTop = body.scrollHeight;
      }, 650);
      return;
    }

    const pending = bubble("ai", '<span class="typing"><i></i><i></i><i></i></span>');
    let teks = "";
    let gagal = false;

    // Punya batas waktu: Hermes bisa lama (1-2 menit kalau model lambat).
    // Tanpa batas, gelembung “typing” bisa menggantung selamanya.
    const controller = new AbortController();
    const batasWaktu = setTimeout(() => controller.abort(), 120000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, sessionId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server menjawab ${res.status}`);
      }
      if (!res.body) {
        throw new Error("Server tidak mengirim jawaban");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const part of parts) {
          const evMatch = part.match(/^event: (.+)$/m);
          const dataMatch = part.match(/^data: (.+)$/m);
          if (!evMatch || !dataMatch) continue;
          const type = evMatch[1];
          let data;
          try {
            data = JSON.parse(dataMatch[1]);
          } catch {
            continue;
          }
          if (type === "text") {
            teks += data.text;
            pending.innerHTML = `<b>Raka:</b> ${escapeHtml(teks)}`;
            body.scrollTop = body.scrollHeight;
          } else if (type === "init" && data.session_id) {
            sessionId = data.session_id;
          } else if (type === "error") {
            gagal = true;
            teks += `\n\n${data.message}`;
            pending.innerHTML = `<b>Raka:</b> ${escapeHtml(teks)}`;
          }
        }
      }

      if (!teks.trim() && !gagal) {
        gagal = true;
        pending.innerHTML = `<b>Raka:</b> Belum ada jawaban yang masuk. Coba lagi sebentar lagi.`;
      }
    } catch (err) {
      gagal = true;
      const pesan =
        err.name === "AbortError"
          ? "Waktu tunggu habis. Hermes butuh lebih dari 2 menit. Coba lagi, atau tanya yang lebih singkat."
          : `Gagal menghubungi server: ${err.message}`;
      pending.innerHTML = `<b>Raka:</b> ${escapeHtml(pesan)}`;
    } finally {
      clearTimeout(batasWaktu);
    }
  }

  $("#asistenKirim").addEventListener("click", () => kirim());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") kirim();
  });
  suggest.querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => kirim(b.textContent))
  );

  // Panel asisten: TIDAK menutup sendiri.
  // Jawaban Hermes bisa butuh 20-60 detik; menutup panel di tengah
  // akan menyembunyikan jawabannya.
  // Scrim hanya menutupi area di atas panel, jadi konten yang masih
  // terlihat di atas sheet tetap bisa diklik.
  function sesuaikanTinggiScrim() {
    const tinggi = panel.getBoundingClientRect().height;
    document.documentElement.style.setProperty(
      "--asisten-tinggi",
      `${Math.round(tinggi)}px`
    );
  }

  function bukaPanel() {
    if (!panel) return;
    panel.classList.add("open");
    document.body.classList.add("asisten-terbuka");
    $("#asistenFab")?.classList.add("hidden");
    $("#asistenScrim")?.removeAttribute("hidden");
    sesuaikanTinggiScrim();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(sesuaikanTinggiScrim).observe(panel);
    }
    $("#asistenInput")?.focus();
  }
  function tutupPanel() {
    // Di instance publik, panel dan tombolnya dihapus dari DOM.
    // Semua akses harus aman kalau elemennya sudah tidak ada.
    panel?.classList.remove("open");
    document.body.classList.remove("asisten-terbuka");
    $("#asistenFab")?.classList.remove("hidden");
    $("#asistenScrim")?.setAttribute("hidden", "");
  }

  $("#asistenFab")?.addEventListener("click", bukaPanel);
  $("#asistenClose")?.addEventListener("click", tutupPanel);
  // Scrim hanya muncul di layar kecil (bottom sheet). Menutup panel
  // dengan mengetuk area di luar sheet.
  $("#asistenScrim")?.addEventListener("click", tutupPanel);
  // Panel ikut tertutup saat pindah halaman, supaya tidak menutupi
  // isi halaman baru.
  window.addEventListener("hashchange", tutupPanel);
}

/* ============================================================
   Search
   ============================================================ */

function initCari() {
  const btn = $("#cariBtn");
  btn.addEventListener("click", () => {
    window.location.hash = "#/kamus";
    setTimeout(() => $("#kamusCari")?.focus(), 120);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      window.location.hash = "#/kamus";
      setTimeout(() => $("#kamusCari")?.focus(), 120);
    }
  });
}

/* ============================================================
   Shortcut keyboard
   ------------------------------------------------------------
   j / k  : modul berikutnya / sebelumnya
   t      : ganti tema
   a      : buka/tutup asisten
   ?      : tampilkan daftar shortcut
   ============================================================ */

function initShortcut() {
  const modal = document.createElement("div");
  modal.className = "sc-modal";
  modal.innerHTML = `
    <div class="sc-box" role="dialog" aria-label="Daftar pintasan keyboard">
      <h2>Pintasan keyboard</h2>
      <dl>
        <dt>j</dt><dd>Modul berikutnya</dd>
        <dt>k</dt><dd>Modul sebelumnya</dd>
        <dt>t</dt><dd>Ganti tema terang/gelap</dd>
        <dt>a</dt><dd>Buka atau tutup asisten Raka</dd>
        <dt>Ctrl/⌘ + K</dt><dd>Cari istilah di kamus</dd>
        <dt>Esc</dt><dd>Tutup jendela ini</dd>
      </dl>
      <button class="btn btn-sm" id="scTutup">Tutup</button>
    </div>`;
  document.body.appendChild(modal);
  $("#scTutup").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const diInput = tag === "input" || tag === "textarea" || e.target.isContentEditable;
    if (diInput || e.ctrlKey || e.metaKey || e.altKey) return;

    const idx = state.semua.findIndex((m) => m.slug === state.modulAktif?.slug);

    switch (e.key) {
      case "j":
        if (idx >= 0 && state.semua[idx + 1]) {
          window.location.hash = `#/modul/${state.semua[idx + 1].slug}`;
        }
        break;
      case "k":
        if (idx > 0) {
          window.location.hash = `#/modul/${state.semua[idx - 1].slug}`;
        }
        break;
      case "t":
        $("#temaBtn").click();
        break;
      case "a": {
        const panel = $("#asistenPanel");
        const fab = $("#asistenFab");
        if (!panel || !fab) break; // asisten dimatikan di instance ini
        if (panel.classList.contains("open")) $("#asistenClose").click();
        else fab.click();
        break;
      }
      case "?":
        modal.classList.toggle("open");
        break;
      case "Escape":
        modal.classList.remove("open");
        break;
      default:
        break;
    }
  });
}

/* ============================================================
   Bootstrap
   ============================================================ */

async function main() {
  pasangTema();
  initDiagram();
  initAsisten();
  initCari();
  initShortcut();

  $("#menuBtn").addEventListener("click", bukaDrawer);
  $("#drawerBackdrop").addEventListener("click", tutupDrawer);
  $("#drawerClose").addEventListener("click", tutupDrawer);
  $("#temaBtn").addEventListener("click", () => {
    const now = document.documentElement.getAttribute("data-tema");
    setTema(now === "gelap" ? "terang" : "gelap");
  });

  document.addEventListener("aiz:progress", perbaruiSidebar);

  try {
    const { semua, perBagian, bySlug } = await muatSemua();
    state.semua = semua;
    state.perBagian = perBagian;
    state.bySlug = bySlug;
  } catch (err) {
    $("#view").innerHTML = `<p class="lab-note">Gagal memuat materi: ${escapeHtml(err.message)}</p>`;
    return;
  }

  state.kamus = await muatKamus();

  // Bank soal digabung: modul Hermes + modul AI Engineer.
  Object.assign(SOAL, SOAL_AI_ENGINEER);

  // Tautan modul di dalam konten: [label](/modul/slug)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='/modul/'], a[href^='/kamus'], a[href^='/kuis']");
    if (!link) return;
    e.preventDefault();
    window.location.hash = link.getAttribute("href");
  });

  const router = new Router({
    onChange: (route) => {
      if (route.name === "modul") renderModul(route.slug);
      else if (route.name === "kamus") renderKamus();
      else if (route.name === "kuis") renderKuis();
      else renderLanding();
      $("#headerNav").querySelectorAll("a").forEach((a) => {
        const isMulai = a.getAttribute("href") === "#/mulai";
        a.setAttribute("aria-current", isMulai && route.name === "mulai" ? "true" : "false");
      });
    },
  });
  router.start();
}

main();
