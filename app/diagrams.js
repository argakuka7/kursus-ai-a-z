/**
 * Diagram SVG.
 *
 * Sprite memuat <symbol> untuk tiap diagram. Modul memanggil <use href="#id">
 * supaya warnanya ikut CSS variable halaman (satu sumber kebenaran).
 *
 * Kalau mermaid tersedia (CDN), blok mermaid di konten dirender jadi SVG.
 * Kalau tidak, blok itu tetap tampil sebagai kode — substansinya tidak hilang.
 */

let mermaidPromise = null;

export function initDiagram() {
  // Muat sprite berisi <symbol>.
  // Query versi supaya browser tidak memakai sprite lama dari cache.
  const v = window.__KURSUS_V__ || "dev";
  fetch(`diagrams/sprite.svg?v=${v}`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.text() : ""))
    .then((text) => {
      if (!text) return;
      const holder = document.createElement("div");
      holder.style.display = "none";
      holder.innerHTML = text;
      const svg = holder.querySelector("svg");
      if (!svg) return;
      // Pindahkan <symbol> ke body supaya bisa dipakai <use> dari mana saja.
      document.body.appendChild(svg);
      svg.setAttribute("aria-hidden", "true");
      svg.style.display = "none";
    })
    .catch(() => {});
}

function ensureMermaid() {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = new Promise((resolve) => {
    if (window.mermaid) return resolve(window.mermaid);
    // Mermaid dimuat lokal (vendor/mermaid.min.js) supaya halaman tetap
    // jalan tanpa internet. Bundle UMD, bukan ESM, supaya tidak butuh
    // file chunk terpisah.
    const s = document.createElement("script");
    s.src = "../vendor/mermaid.min.js";
    s.onload = () => resolve(window.mermaid || null);
    s.onerror = () => {
      // Fallback terakhir: coba CDN.
      const c = document.createElement("script");
      c.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      c.onload = () => resolve(window.mermaid || null);
      c.onerror = () => resolve(null);
      document.head.appendChild(c);
    };
    document.head.appendChild(s);
  });
  return mermaidPromise;
}

let counter = 0;

/**
 * Render semua blok mermaid di dalam container.
 * Blok yang gagal dirender dibiarkan sebagai kode.
 */
export async function renderMermaid(container) {
  const blocks = Array.from(container.querySelectorAll("pre.mermaid"));
  if (!blocks.length) return;

  const mermaid = await ensureMermaid();
  if (!mermaid) {
    // Tanpa mermaid: beri tahu pembaca, tapi isi kode tetap ada.
    blocks.forEach((b) => b.classList.add("mermaid-fallback"));
    return;
  }

  // Mermaid hanya menerima warna hex, bukan CSS variable.
  // Ambil nilainya dari style yang terhitung supaya diagram ikut tema.
  const cs = getComputedStyle(document.documentElement);
  const hex = (name, fallback) => {
    const v = cs.getPropertyValue(name).trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback;
  };

  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      fontFamily: cs.getPropertyValue("--font-mono") || "monospace",
      fontSize: "13px",
      primaryColor: hex("--surface-2", "#f1eee6"),
      primaryTextColor: hex("--text", "#1f1d19"),
      primaryBorderColor: hex("--line-2", "#c9c3b4"),
      lineColor: hex("--text-3", "#8a8375"),
      secondaryColor: hex("--surface-3", "#e8e4d9"),
      tertiaryColor: hex("--surface", "#ffffff"),
      background: hex("--bg", "#fbfaf7"),
    },
    flowchart: { curve: "basis", htmlLabels: true },
  });

  for (const block of blocks) {
    const source = block.textContent || "";
    try {
      counter += 1;
      const { svg } = await mermaid.render(`mmd-${counter}`, source);
      const holder = document.createElement("div");
      holder.className = "mermaid-holder";
      holder.innerHTML = svg;
      block.replaceWith(holder);
    } catch (err) {
      block.classList.add("mermaid-fallback");
    }
  }
}

/**
 * Sisipkan diagram SVG (symbol) di bawah sebuah blok heading.
 * @param {string} id id symbol di sprite.svg
 */
export function sisipkanDiagram(id, container) {
  if (!id) return null;
  const fig = document.createElement("figure");
  fig.className = "diagram";
  fig.innerHTML = `
    <div class="diagram-scroll" tabindex="0" role="group" aria-label="Diagram ${id}, bisa digeser ke samping">
      <svg class="diagram-svg" viewBox="0 0 660 340" role="img" aria-label="Diagram ${id}">
        <use href="#${id}"></use>
      </svg>
    </div>
    <p class="diagram-hint" hidden>Geser ke samping untuk melihat bagian yang terpotong.</p>`;
  container.appendChild(fig);

  // Tampilkan petunjuk hanya kalau diagram memang lebih lebar dari
  // wadahnya. Kalau muat, keterannya tidak perlu.
  const scroll = fig.querySelector(".diagram-scroll");
  const hint = fig.querySelector(".diagram-hint");
  const perbarui = () => {
    const perlu = scroll.scrollWidth > scroll.clientWidth + 4;
    hint.hidden = !perlu;
    fig.classList.toggle("bisa-geser", perlu);
  };
  // Tunggu layout selesai supaya clientWidth sudah benar.
  requestAnimationFrame(perbarui);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(perbarui).observe(scroll);
  } else {
    window.addEventListener("resize", perbarui);
  }
  scroll.addEventListener("scroll", perbarui, { passive: true });

  return fig;
}

/** Viewbox per symbol, supaya SVG tidak terpotong. */
export const VIEWBOX = {
  "d1-pesan": "0 0 660 340",
  "d2-tokenisasi": "0 0 700 400",
  "d3-lost-middle": "0 0 660 386",
  "d4-tool-loop": "0 0 660 496",
  "d5-agent-workflow": "0 0 660 366",
  "d6-konteks": "0 0 660 372",
  "d7-arsitektur": "0 0 680 400",
  "d8-memori": "0 0 660 380",
  "d9-skill": "0 0 660 340",
  "d10-delegasi": "0 0 660 400",
  "d11-mcp": "0 0 660 340",
  "d12-gateway": "0 0 660 360",
  "d13-jadwal": "0 0 660 320",
  "d14-permukaan": "0 0 660 320",
  "d15-izin": "0 0 660 420",
  "d16-llm": "0 0 660 336",
  "d17-kegunaan": "0 0 660 336",
  "d18-mindset": "0 0 660 336",
  "d19-evals": "0 0 660 260",
  "d20-teknik": "0 0 660 380",
  "d21-rangkuman": "0 0 660 210",
  "d22-ekosistem": "0 0 660 350",
  "d23-peran": "0 0 660 306",
  "d24-pilih-model": "0 0 660 350",
};

export function pasangViewbox(fig, id) {
  const svg = fig?.querySelector("svg");
  const vb = VIEWBOX[id];
  if (svg && vb) svg.setAttribute("viewBox", vb);
}
