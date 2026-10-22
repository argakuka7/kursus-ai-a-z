/**
 * Muat dan indeks file materi.
 *
 * Sumber: ../../content/<bagian>/<file>.md
 * Frontmatter dibaca terpisah, lalu diurutkan berdasarkan field `modul`.
 */

import { parseFrontmatter } from "./markdown.js?v=129";

const DIRS = ["ai", "hermes", "penutup"];

const BAGIAN_META = {
  1: { slug: "fondasi", nama: "Fondasi AI", deskripsi: "Lima cara kerja LLM di balik layar." },
  2: { slug: "hermes", nama: "Hermes Praktis", deskripsi: "Belajar menjalankan agent Hermes sendiri." },
  3: { slug: "penutup", nama: "Penutup", deskripsi: "Konsolidasi dan langkah selanjutnya." },
};

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Gagal memuat ${path} (${res.status})`);
  return res.text();
}

/** Daftar file .md di satu folder, lewat index.json yang di-generate. */
async function listFiles(dir) {
  try {
    const res = await fetch(`content/${dir}/index.json`, { cache: "no-cache" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

let cache = null;

export async function muatSemua() {
  if (cache) return cache;

  const semua = [];

  for (const dir of DIRS) {
    const files = await listFiles(dir);
    for (const file of files) {
      const raw = await fetchText(`content/${dir}/${file}`);
      const { data, body } = parseFrontmatter(raw);
      semua.push({
        ...data,
        dir,
        file,
        body,
        jalur: `content/${dir}/${file}`,
      });
    }
  }

  // Urutkan: bagian dulu, lalu nomor modul.
  semua.sort((a, b) => {
    const ba = Number(a.bagian ?? 99);
    const bb = Number(b.bagian ?? 99);
    if (ba !== bb) return ba - bb;
    return (Number(a.modul ?? 0) || 0) - (Number(b.modul ?? 0) || 0);
  });

  // Normalisasi beberapa field.
  for (const m of semua) {
    m.modul = Number(m.modul) || 0;
    m.bagian = Number(m.bagian) || 1;
    m.prasyarat = Array.isArray(m.prasyarat) ? m.prasyarat.map(String) : [];
    m.durasi = m.durasi || "10 menit";
    m.ringkasan = m.ringkasan || "";
    m.titlePendek = m.titlePendek || m.title;
    m.slug = m.slug || m.file.replace(/^\d+-/, "").replace(/\.md$/, "");
  }

  // Peta slug -> modul, dan daftar per bagian.
  const bySlug = new Map(semua.map((m) => [m.slug, m]));
  const perBagian = {};
  for (const m of semua) {
    (perBagian[m.bagian] ||= []).push(m);
  }

  cache = { semua, bySlug, perBagian, BAGIAN_META };
  return cache;
}

export async function muatKamus() {
  try {
    const res = await fetch("content/kamus.json", { cache: "no-cache" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export function modulBerikutnya(daftar, sekarang) {
  const idx = daftar.findIndex((m) => m.slug === sekarang?.slug);
  return idx >= 0 && idx + 1 < daftar.length ? daftar[idx + 1] : null;
}

export function modulSebelumnya(daftar, sekarang) {
  const idx = daftar.findIndex((m) => m.slug === sekarang?.slug);
  return idx > 0 ? daftar[idx - 1] : null;
}
