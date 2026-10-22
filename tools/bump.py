#!/usr/bin/env python3
"""Naikkan versi cache-buster untuk semua modul ES.

Browser menyimpan modul ES dengan pengenal URL. Query ?v=N memaksa
browser mengambil ulang. Semua import lokal harus memakai versi yang sama,
termasuk import di dalam modul lain (content.js mengimpor markdown.js).

Pakai: python3 tools/bump.py
"""

import pathlib
import re
import sys

APP = pathlib.Path(__file__).resolve().parent.parent / "app"
INDEX = pathlib.Path(__file__).resolve().parent.parent / "index.html"


def versi_terakhir(teks: str) -> int:
    found = [int(m) for m in re.findall(r"\?v=(\d+)", teks)]
    return max(found) if found else 0


def main() -> int:
    semua = sorted(APP.glob("*.js"))
    combined = "\n".join(p.read_text(encoding="utf-8") for p in semua)
    baru = versi_terakhir(combined) + 1

    # 1. Samakan semua ?v=N lama ke versi baru.
    for p in semua:
        s = p.read_text(encoding="utf-8")
        s2 = re.sub(r"\?v=\d+", f"?v={baru}", s)
        # 2. Import lokal tanpa versi -> beri versi.
        s2 = re.sub(r'from "\./([A-Za-z0-9_]+)\.js"', lambda m: f'from "./{m.group(1)}.js?v={baru}"', s2)
        if s2 != s:
            p.write_text(s2, encoding="utf-8")
            print(f"  {p.name} -> v{baru}")

    # 3. Tag script di index.html + global versi (dipakai diagrams.js).
    h = INDEX.read_text(encoding="utf-8")
    h2 = re.sub(r"app/app\.js\?v=\d+", f"app/app.js?v={baru}", h)
    h2 = re.sub(r"app/styles\.css\?v=\d+", f"app/styles.css?v={baru}", h2)
    h2 = re.sub(r'window\.__KURSUS_V__ = "\d+"', f'window.__KURSUS_V__ = "{baru}"', h2)
    if h2 != h:
        INDEX.write_text(h2, encoding="utf-8")
        print(f"  index.html -> v{baru}")

    print(f"versi sekarang: {baru}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
