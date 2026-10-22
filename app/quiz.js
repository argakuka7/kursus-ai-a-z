/**
 * Bank soal + komponen kuis.
 *
 * Soal dikaitkan ke modul lewat field `modul` (slug). Skor disimpan di
 * localStorage per soal, jadi_progress terlihat di sidebar.
 */

const KUNCI = "aiz-progress-v1";

export function bacaProgres() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI) || "{}") || {};
  } catch {
    return {};
  }
}

export function tulisProgres(p) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(p));
  } catch {
    /* penyimpanan penuh atau ditolak: abaikan */
  }
}

export function tandaiSelesai(slug) {
  const p = bacaProgres();
  if (!p[slug]) {
    p[slug] = { selesai: true, waktu: Date.now() };
    tulisProgres(p);
  }
  return p;
}

export function tandaiKuis(slug, benar = false) {
  const p = bacaProgres();
  p[`kuis:${slug}`] = { selesai: true, benar: !!benar, waktu: Date.now() };
  tulisProgres(p);
  return p;
}

/**
 * Bangun komponen kuis untuk satu modul.
 * @param {object} soal {pertanyaan, opsi, jawaban, pembahasan}
 * @param {string} id
 */
export function buatKuis(soal, id) {
  const wrap = document.createElement("div");
  wrap.className = "quiz";
  wrap.id = id;

  const render = (dipilih) => {
    wrap.innerHTML = `
      <div class="quiz-q">${soal.pertanyaan}</div>
      <div class="quiz-opts">
        ${soal.opsi
          .map((o, i) => {
            let cls = "quiz-opt";
            if (dipilih !== null) {
              if (i === soal.jawaban) cls += " correct";
              else if (i === dipilih) cls += " wrong";
            }
            return `<button class="${cls}" data-pick="${i}" ${dipilih !== null ? "disabled" : ""}>
              <span class="key">${String.fromCharCode(65 + i)}</span>
              <span>${o}</span>
            </button>`;
          })
          .join("")}
      </div>
      ${
        dipilih !== null
          ? `<div class="quiz-fb"><b>${
              dipilih === soal.jawaban ? "Tepat." : "Belum tepat."
            }</b> ${soal.pembahasan}</div>`
          : ""
      }`;

    wrap.querySelectorAll("[data-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (dipilih !== null) return;
        render(Number(btn.dataset.pick));
        tandaiKuis(soal.modul, Number(btn.dataset.pick) === soal.jawaban);
        document.dispatchEvent(new CustomEvent("aiz:progress"));
      });
    });
  };

  render(null);
  return wrap;
}

/**
 * Ringkasan skor kuis: berapa soal yang sudah dijawab benar.
 * @param {object} soalBank map slug -> soal
 * @param {Array} daftarModul
 */
export function hitungSkor(soalBank, daftarModul) {
  const progres = bacaProgres();
  let benar = 0;
  let dijawab = 0;
  const rinci = [];

  for (const m of daftarModul) {
    const soal = soalBank[m.slug];
    if (!soal) continue;
    const p = progres[`kuis:${m.slug}`];
    if (!p) continue;
    dijawab += 1;
    const ok = p.benar;
    if (ok) benar += 1;
    rinci.push({ modul: m, benar: ok });
  }

  return { benar, dijawab, total: Object.keys(soalBank).length, rinci };
}
