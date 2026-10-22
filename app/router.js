/**
 * Navigasi: hash router + scroll spy + prev/next.
 *
 * Format URL: #/modul/<slug>  |  #/kamus  |  #/mulai
 */

export class Router {
  constructor({ onChange }) {
    this.onChange = onChange;
    this.current = null;
    window.addEventListener("hashchange", () => this.handle());
  }

  parse() {
    const hash = window.location.hash.replace(/^#/, "");
    const parts = hash.split("/").filter(Boolean);
    if (!parts.length) return { name: "mulai" };
    if (parts[0] === "modul" && parts[1]) return { name: "modul", slug: parts[1] };
    if (parts[0] === "kamus") return { name: "kamus" };
    if (parts[0] === "kuis") return { name: "kuis" };
    return { name: "mulai" };
  }

  handle() {
    const route = this.parse();
    const key = route.name === "modul" ? `modul:${route.slug}` : route.name;
    if (key === this.current) return;
    this.current = key;
    this.onChange(route);
  }

  start() {
    this.handle();
  }

  static go(path) {
    window.location.hash = path;
  }
}

/**
 * Scroll spy: tandai heading yang sedang terlihat di daftar TOC.
 */
export function pasangScrollSpy(headings, onActive) {
  if (!headings.length) return () => {};

  const observed = [];
  const els = headings
    .map((h) => document.getElementById(h.id))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || !els.length) return () => {};

  const visible = new Set();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      });
      // Ambil heading paling atas yang sedang terlihat.
      const first = headings.find((h) => visible.has(h.id));
      if (first) onActive(first.id);
    },
    { rootMargin: "-72px 0px -70% 0px", threshold: 0 }
  );

  els.forEach((el) => {
    io.observe(el);
    observed.push(el);
  });

  return () => io.disconnect();
}

/** Gulir halus ke elemen, dengan offset untuk header lengket. */
export function scrollKe(id, offset = 84) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}
