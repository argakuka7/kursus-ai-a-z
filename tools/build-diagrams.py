#!/usr/bin/env python3
"""Bangun diagram AI dari A–Z sebagai SVG.

Sumber kebenaran tunggal: file ini. Keluaran:
  diagrams/sprite.svg   — semua diagram sebagai <symbol>, untuk <use> di situs
  diagrams/index.html   — halaman demo: 3 tema + perbandingan dengan PNG asli

Semua warna lewat CSS variable (--d-*), jadi diagram ikut tema halaman.
"""
from __future__ import annotations

import pathlib
import textwrap

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "diagrams"

# ---------------------------------------------------------------- helper ----


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    )


def text(x, y, s, cls="body", anchor="start", extra=""):
    return (
        f'<text x="{x}" y="{y}" class="d-{cls}" text-anchor="{anchor}"{extra}>{esc(s)}</text>'
    )


def box(x, y, w, h, cls="panel", rx=10, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="d-{cls}"{extra}/>'


def line(x1, y1, x2, y2, cls="line", extra=""):
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="d-{cls}"{extra}/>'
    )


def path(d, cls="line", extra=""):
    return f'<path d="{d}" class="d-{cls}"{extra}/>'


def arrow_down(x, y1, y2):
    return (
        f'<path d="M{x} {y1} L{x} {y2 - 6}" class="arrow"/>'
        f'<path d="M{x - 4.5} {y2 - 7.5} L{x} {y2 - 1} L{x + 4.5} {y2 - 7.5}" class="arrowhead"/>'
    )


def arrow_right(x1, x2, y):
    return (
        f'<path d="M{x1} {y} L{x2 - 6} {y}" class="arrow"/>'
        f'<path d="M{x2 - 7.5} {y - 4.5} L{x2 - 1} {y} L{x2 - 7.5} {y + 4.5}" class="arrowhead"/>'
    )


def arrow_up(x, y1, y2):
    return (
        f'<path d="M{x} {y1} L{x} {y2 + 6}" class="arrow"/>'
        f'<path d="M{x - 4.5} {y2 + 7.5} L{x} {y2 + 1} L{x + 4.5} {y2 + 7.5}" class="arrowhead"/>'
    )


def arrow_left(x1, x2, y):
    return (
        f'<path d="M{x1} {y} L{x2 + 6} {y}" class="arrow"/>'
        f'<path d="M{x2 + 7.5} {y - 4.5} L{x2 + 1} {y} L{x2 + 7.5} {y + 4.5}" class="arrowhead"/>'
    )


def badge(cx, cy, label, cls):
    return (
        f'<circle cx="{cx}" cy="{cy}" r="12" class="d-badge {cls}"/>'
        f'<text x="{cx}" y="{cy + 4}" class="d-badge-t" text-anchor="middle">{esc(label)}</text>'
    )


def qpoint(p0, c, p1, t):
    u = 1 - t
    return (
        u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
        u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
    )


# --------------------------------------------------------------- diagram 1 --
def d1_pesan() -> str:
    """Modul 1 — peran pesan: system, user, assistant, semuanya satu daftar."""
    rows = [
        ("system", "SYSTEM", "Kamu adalah Raka, tutor kelas AI. Jawab dalam Bahasa Indonesia."),
        ("user", "USER", "Jelaskan pakai analogi: kenapa context window penting?"),
        ("ai", "ASSISTEN", "Bayangkan meja kerja. Kalau penuh, yang paling lama diletakkan terlupai."),
    ]
    out = [text(330, 26, "SEBUAH PERCAKAPAN ADALAH SATU DAFTAR PESAN", "kicker", "middle")]
    y = 48
    for i, (cls, role, body) in enumerate(rows):
        out.append(box(48, y, 560, 64, "panel"))
        out.append(badge(80, y + 32, role[0], cls))
        out.append(text(104, y + 26, role, "mono"))
        out.append(text(104, y + 48, body, "body"))
        if i < len(rows) - 1:
            out.append(arrow_down(328, y + 64, y + 86))
        y += 86
    out.append(
        path("M34 40 L18 40 L18 284 L34 284", "bracket")
        + text(
            22,
            162,
            "CONTEXT WINDOW",
            "mono",
            "middle",
            ' transform="rotate(-90 22 162)"',
        )
    )
    out.append(
        text(
            328,
            322,
            "System prompt meletakkan aturan lebih dulu. Karena itu model cenderung mengikutinya.",
            "caption",
            "middle",
        )
    )
    return "".join(out)


# --------------------------------------------------------------- diagram 2 --
def d2_tokenisasi() -> str:
    """Modul 2 — teks jadi karakter, grup, kata, lalu angka."""
    out = [text(330, 24, "DARI TEKS KE ANGKA — EMPAT LANGKAH", "kicker", "middle")]
    out.append(box(40, 40, 620, 46, "panel accent"))
    out.append(text(350, 69, '"the cat sat on the mat"', "display", "middle"))

    stages = [
        ("1 · KAREKTER", "t h e · c a t · s a t · o n · t h e · m a t", "dim"),
        ("2 · GRUP", "[th] [he] [·] [c] [at] [·] [s] [at] [·] [o] [n]", "dim"),
        ("3 · KATA", "[the] [·] [cat] [·] [sat] [·] [on] [·] [the] [·] [mat]", "mono"),
        ("4 · ANGKA", "1  2  3  4  5  6  7  8  9  10  11  12  13  14", "num"),
    ]
    y = 116
    for i, (label, body, cls) in enumerate(stages):
        out.append(text(40, y + 18, label, "kicker"))
        out.append(line(176, y - 4, 176, y + 36, "sep"))
        out.append(text(196, y + 18, body, cls))
        if i < len(stages) - 1:
            out.append(arrow_down(100, y + 30, y + 52))
        y += 62
    out.append(
        text(
            350,
            380,
            "Model tidak membaca huruf. Ia hanya menghitung angka.",
            "caption",
            "middle",
        )
    )
    return "".join(out)


# --------------------------------------------------------------- diagram 3 --
def d3_lost() -> str:
    """Modul 3 — pengaruh pesan per posisi: tinggi di ujung, lemah di tengah."""
    out = [text(330, 24, "PENGARUH PESAN TERHADAP JAWABAN", "kicker", "middle")]
    x0, x1, ytop, ybot = 92, 606, 52, 292
    out.append(line(x0, ybot, x1, ybot, "axis"))
    out.append(line(x0, ytop - 12, x0, ybot, "axis"))
    out.append(path(f"M{x0} {ytop + 18} Q 349 {ybot + 46} {x1} {ytop + 18}", "curve"))

    p0, c, p1 = (x0, ytop + 18), (349, ybot + 46), (x1, ytop + 18)
    kinds = [
        "system", "user", "ai", "tool", "ai", "user",
        "tool", "ai", "user", "ai", "user", "system",
    ]
    for i, kind in enumerate(kinds):
        t = i / (len(kinds) - 1)
        px, py = qpoint(p0, c, p1, t)
        out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="7" class="d-dot {kind}"/>')
    out.append(text(x0 + 6, ytop + 12, "pengaruh kuat", "dim"))
    out.append(text(349, ybot + 20, "pengaruh lemah", "dim", "middle"))
    out.append(text(x1 - 6, ytop + 12, "pengaruh kuat", "dim", "end"))
    out.append(
        text(349, ybot + 44, "Posisi dalam percakapan", "mono", "middle")
        + text(
            34,
            (ytop + ybot) // 2,
            "Pengaruh ke output",
            "mono",
            "middle",
            ' transform="rotate(-90 34 %d)"' % ((ytop + ybot) // 2),
        )
    )
    legend = [
        ("system", "System"),
        ("user", "User"),
        ("ai", "Asisten"),
        ("tool", "Tool call"),
    ]
    lx = 196
    for kind, name in legend:
        out.append(f'<circle cx="{lx}" cy="366" r="6" class="d-dot {kind}"/>')
        out.append(text(lx + 12, 370, name, "dim"))
        lx += 108
    return "".join(out)


# --------------------------------------------------------------- diagram 4 --
def d4_tool() -> str:
    """Modul 4 — loop tool call enam langkah."""
    out = [text(330, 24, "SAAT MODEL MEMAKAI TOOL", "kicker", "middle")]
    steps = [
        ("1", "System prompt menyertakan definisi tool", "writeFile(path, content) dikirim ke model."),
        ("2", "User mengirim permintaan", '"Buat file .gitignore" — tanpa menyebut nama tool.'),
        ("3", "Model mengembalikan tool call", "id: call_1 · arguments: { path, content }"),
        ("4", "Aplikasi menjalankan tool", "File benar-benar dibuat. Model belum tahu apa pun."),
        ("5", "Tool result dikirim balik", 'id yang sama: call_1 · "File .gitignore dibuat".'),
        ("6", "Model menjawab ringkasan", '"Selesai. Isi .gitignore-nya apa yang mau ditambah?"'),
    ]
    y = 44
    for i, (n, title, desc) in enumerate(steps):
        last = i == len(steps) - 1
        out.append(box(96, y, 468, 52, "panel accent" if last else "panel"))
        out.append(badge(124, y + 26, n, "ai" if last else "num"))
        out.append(text(150, y + 23, title, "strong"))
        out.append(text(150, y + 41, desc, "dim"))
        if not last:
            out.append(arrow_down(330, y + 52, y + 72))
        y += 72
    out.append(path("M96 380 L60 380 L60 180 L92 180", "loop"))
    out.append(path("M86 175 L96 180 L86 185", "arrowhead"))
    out.append(
        text(
            44,
            280,
            "MODEL BISA MENGAJUKAN TOOL LAGI",
            "mono",
            "middle",
            ' transform="rotate(-90 44 280)"',
        )
    )
    out.append(
        text(330, 478, "Tool call adalah permintaan, bukan tindakan. Aplikasi yang menjalankannya.", "caption", "middle")
    )
    return "".join(out)


# --------------------------------------------------------------- diagram 5 --
def d5_agent() -> str:
    """Modul 5 — agent vs workflow: siapa yang memutuskan."""
    out = [text(330, 24, "AGENT VS WORKFLOW", "kicker", "middle")]
    for x, title, sub, cls in [
        (40, "WORKFLOW", "langkah ditentukan kode", "wf"),
        (352, "AGENT", "langkah ditentukan model", "ag"),
    ]:
        out.append(box(x, 42, 268, 236, "panel"))
        out.append(text(x + 20, 74, title, "kicker"))
        out.append(text(x + 20, 96, sub, "dim"))

    # workflow: urutan tetap
    wy = 116
    for i, name in enumerate(["Ambil teks", "Ringkas A", "Ringkas B", "Gabung"]):
        out.append(box(62, wy, 224, 32, "chip"))
        out.append(text(174, wy + 21, name, "small", "middle"))
        if i < 3:
            out.append(arrow_down(174, wy + 32, wy + 44))
        wy += 44
    out.append(text(174, 300, "Urutan sama setiap kali dijalankan", "dim", "middle"))

    # agent: model memilih
    out.append(f'<circle cx="486" cy="140" r="30" class="d-model"/>')
    out.append(f'<text x="486" y="146" class="d-badge-t" text-anchor="middle">MODEL</text>')
    for i, name in enumerate(["Tool A", "Tool B", "Tool C"]):
        ty = 96 + i * 62
        out.append(box(548, ty, 56, 28, "chip"))
        out.append(text(576, ty + 19, name, "small", "middle"))
        out.append(path(f"M514 128 Q 530 {ty + 14} 546 {ty + 14}", "arrow"))
        out.append(path(f"M546 {ty + 14} Q 530 {ty + 14} 514 152", "arrow"))
    out.append(path("M486 170 L486 236", "arrow"))
    out.append(box(430, 238, 112, 30, "chip"))
    out.append(text(486, 258, "Cukup? Berhenti", "small", "middle"))
    out.append(text(486, 300, "Model yang memutuskan tool dan berhenti", "dim", "middle"))

    out.append(
        text(330, 350, "Keduanya melakukan beberapa panggilan LLM. Bedanya: siapa yang memegang kendali.", "caption", "middle")
    )
    return "".join(out)


# --------------------------------------------------------------- diagram 6 --
def d6_konteks() -> str:
    """Modul 3 — isi context window dan batasnya."""
    out = [text(330, 24, "APA YANG MEMAKAI RUANG CONTEXT WINDOW", "kicker", "middle")]
    bx, by, bh = 40, 56, 58
    out.append(box(bx, by, 392, bh, "seg input"))
    out.append(box(bx + 392, by, 96, bh, "seg output"))
    out.append(box(bx + 488, by, 132, bh, "seg free"))
    out.append(text(bx + 16, by + 34, "INPUT · system prompt, definisi tool, riwayat", "seg-t"))
    out.append(text(bx + 404, by + 34, "OUTPUT", "seg-t"))
    out.append(text(bx + 500, by + 34, "SISA", "seg-t dim"))
    out.append(path(f"M{bx} {by + bh + 8} L{bx} {by + bh + 16} L{bx + 488} {by + bh + 16} L{bx + 488} {by + bh + 8}", "bracket"))
    out.append(
        text(284, by + bh + 38, "CONTEXT WINDOW = INPUT + OUTPUT", "mono", "middle")
    )
    out.append(line(bx, 196, bx + 620, 196, "sep"))
    out.append(text(bx, 224, "PENGARUH PER PESAN", "kicker"))
    bars = [("AWAL", 0.82, bx + 90), ("TENGAH", 0.3, bx + 310), ("AKHIR", 0.76, bx + 530)]
    for name, val, x in bars:
        h = 74 * val
        out.append(f'<rect x="{x - 34}" y="{300 - h}" width="68" height="{h:.0f}" rx="4" class="d-bar"/>')
        out.append(text(x, 320, name, "dim", "middle"))
    out.append(text(330, 356, "Konteks yang lebih pendek hampir selalu menghasilkan jawaban yang lebih tajam.", "caption", "middle"))
    return "".join(out)


# --------------------------------------------------------------- diagram 7 --
def d7_arsitektur() -> str:
    """Lapisan Hermes: dari antarmuka sampai model."""
    out = [text(340, 24, "LAPISAN HERMES", "kicker", "middle")]
    layers = [
        ("Antarmuka", "CLI · TUI · Telegram · Discord · Slack · WhatsApp", "user"),
        ("Gateway", "meruteks pesan, sesi, dan platform", "tool"),
        ("Agent Loop", "model → tool → hasil → model, sampai selesai", "ai"),
        ("Alat", "terminal · file · web · browser · MCP", "tool"),
        ("Model", "satu panggilan ke penyedia LLM", "system"),
    ]
    y = 46
    for nama, ket, cls in layers:
        out.append(box(60, y, 560, 54, "panel"))
        out.append(badge(92, y + 27, nama[0], cls))
        out.append(text(118, y + 24, nama, "strong"))
        out.append(text(118, y + 42, ket, "dim"))
        y += 66
    out.append(
        text(340, 390, "Satu agent, banyak pintu masuk. Semuanya berlapis di atas model yang sama.", "caption", "middle")
    )
    return "".join(out)


# --------------------------------------------------------------- diagram 8 --
def d8_memori() -> str:
    """Lapisan memori Hermes dari yang paling spesifik ke yang paling umum."""
    out = [text(330, 24, "LAPISAN MEMORI", "kicker", "middle")]
    layers = [
        ("Auto Memory", "~/.hermes/projects/<proyek>/memory/", "dipelajari otomatis", "ai"),
        ("Local Memory", "./HERMES.local.md", "pribadi, tidak masuk git", "tool"),
        ("User Memory", "~/.hermes/HERMES.md", "preferensi pribadi", "tool"),
        ("Project Rules", "./.hermes/rules/*.md", "standar tim, modular", "user"),
        ("Project Memory", "./HERMES.md", "standar tim, utama", "user"),
        ("Managed Policy", "sistem operasi, seluruh organisasi", "kebijakan organisasi", "system"),
    ]
    y = 44
    for nama, lokasi, ket, cls in layers:
        out.append(box(48, y, 564, 48, "panel"))
        out.append(badge(78, y + 24, nama[0], cls))
        out.append(text(102, y + 21, nama, "strong"))
        out.append(text(102, y + 38, lokasi, "dim"))
        out.append(text(596, y + 30, ket, "dim", "end"))
        y += 56
    out.append(
        text(330, 396, "Semakin spesifik letaknya, semakin dekat dengan tempat kamu bekerja.", "caption", "middle")
    )
    return "".join(out)


# --------------------------------------------------------------- diagram 9 --
def d9_skill() -> str:
    """Siklus pemuatan skill: progressive disclosure."""
    out = [text(330, 24, "CARA SKILL DIMUAT", "kicker", "middle")]
    steps = [
        ("1", "Model melihat daftar nama skill", "Hanya nama dan deskripsi satu baris."),
        ("2", "Yang cocok dibaca penuh", "Isi SKILL.md, sesuai kebutuhan tugas."),
        ("3", "Referensi lain dibaca seperlunya", "File pendukung baru dibuka bila dibutuhkan."),
    ]
    y = 52
    for n, judul, ket in steps:
        out.append(box(70, y, 520, 56, "panel"))
        out.append(badge(102, y + 28, n, "ai"))
        out.append(text(128, y + 24, judul, "strong"))
        out.append(text(128, y + 42, ket, "dim"))
        if n != "3":
            out.append(arrow_down(330, y + 56, y + 74))
        y += 74
    out.append(
        text(330, 292, "Skill yang tidak relevan tidak pernah dibaca. Itu gunanya progressive disclosure.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 10 --
def d10_delegasi() -> str:
    """Agent utama Mendelegasikan ke subagent paralel."""
    out = [text(330, 24, "DELEGASI KE SUBAGENT", "kicker", "middle")]
    out.append(f'<circle cx="330" cy="72" r="28" class="d-model"/>')
    out.append(text(330, 78, "UTAMA", "badge-t", "middle"))
    subs = [
        ("Reviewer", 120, "periksa diff"),
        ("Tester", 330, "jalankan test"),
        ("Dokumen", 540, "tulis docs"),
    ]
    for nama, x, ket in subs:
        out.append(box(x - 74, 140, 148, 46, "panel"))
        out.append(text(x, 162, nama, "strong", "middle"))
        out.append(text(x, 179, ket, "dim", "middle"))
        out.append(path(f"M330 100 Q {x} 110 {x} 136", "arrow"))
    out.append(path("M120 186 L120 214 L330 214 L540 214 L540 186", "arrow"))
    out.append(box(230, 214, 200, 40, "chip"))
    out.append(text(330, 232, "gabungkan hasil", "small", "middle"))
    out.append(path("M330 254 L330 286", "arrow"))
    out.append(box(240, 286, 180, 40, "chip"))
    out.append(text(330, 311, "satu jawaban ke user", "small", "middle"))
    out.append(
        text(330, 366, "Tiap subagent punya konteks sendiri. Konteks utama tetap bersih.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 11 --
def d11_mcp() -> str:
    """MCP: jembatan ke server tool eksternal."""
    out = [text(330, 24, "JEMBATAN MCP", "kicker", "middle")]
    out.append(box(52, 116, 116, 60, "panel"))
    out.append(text(110, 142, "Hermes", "strong", "middle"))
    out.append(text(110, 160, "agen", "dim", "middle"))
    out.append(box(230, 100, 200, 92, "panel accent"))
    out.append(text(330, 128, "MCP Bridge", "strong", "middle"))
    out.append(text(330, 147, "menerjemahkan", "dim", "middle"))
    out.append(text(330, 165, "protokol", "dim", "middle"))
    servers = [("File", 500, 60), ("Database", 500, 140), ("API", 500, 220)]
    for nama, x, y in servers:
        out.append(box(x, y, 108, 48, "chip"))
        out.append(text(x + 54, y + 29, nama, "small", "middle"))
        out.append(path(f"M430 146 Q 470 146 {x} {y + 24}", "arrow"))
    out.append(
        text(330, 306, "Server MCP mana pun bisa disambung tanpa mengubah Hermes.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 12 --
def d12_gateway() -> str:
    """Gateway: satu agent, banyak platform."""
    out = [text(330, 24, "SATU AGENT, BANYAK CHAT", "kicker", "middle")]
    out.append(box(240, 100, 180, 76, "panel accent"))
    out.append(text(330, 128, "Gateway", "strong", "middle"))
    out.append(text(330, 147, "satu proses", "dim", "middle"))
    out.append(text(330, 164, "semua platform", "dim", "middle"))
    platforms = [("Telegram", 70, 240), ("Discord", 200, 240), ("Slack", 330, 240), ("WhatsApp", 460, 240)]
    for nama, x, y in platforms:
        out.append(box(x - 56, y, 112, 44, "chip"))
        out.append(text(x, y + 27, nama, "small", "middle"))
        out.append(path(f"M330 176 Q {x} 200 {x} {y - 4}", "arrow"))
    out.append(
        text(330, 322, "Sesi ikut terbawa: obrolan dari CLI kelihatan di Telegram, dan sebaliknya.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 13 --
def d13_jadwal() -> str:
    """Cron: agent bekerja sendiri pada jadwal."""
    out = [text(330, 24, "AGENT BEKERJA SENDIRI", "kicker", "middle")]
    out.append(box(52, 92, 150, 76, "panel"))
    out.append(text(127, 122, "Cron", "strong", "middle"))
    out.append(text(127, 141, "penjadwal", "dim", "middle"))
    out.append(text(127, 158, "internal", "dim", "middle"))
    out.append(box(255, 92, 150, 76, "panel accent"))
    out.append(text(330, 122, "Hermes", "strong", "middle"))
    out.append(text(330, 141, "menjalankan tugas", "dim", "middle"))
    out.append(text(330, 158, "sendiri", "dim", "middle"))
    out.append(box(458, 92, 150, 76, "panel"))
    out.append(text(533, 122, "Kirim", "strong", "middle"))
    out.append(text(533, 141, "Telegram", "dim", "middle"))
    out.append(text(533, 158, "atau email", "dim", "middle"))
    out.append(arrow_right(202, 253, 130))
    out.append(arrow_right(405, 456, 130))
    out.append(path("M127 168 L127 210 L533 210 L533 168", "loop"))
    out.append(path("M527 174 L533 166 L539 174", "arrowhead"))
    out.append(
        text(330, 258, "Kamu menutup laptop. Tugas tetap jalan, dan hasilnya dikirim ke tempat kamu baca.", "caption", "middle")
    )
    return "".join(out)



# -------------------------------------------------------------- diagram 14 --
def d14_permukaan() -> str:
    """Satu agent, banyak permukaan."""
    out = [text(340, 24, "SATU AGENT, BANYAK PINTU", "kicker", "middle")]
    out.append(box(230, 52, 200, 56, "panel accent"))
    out.append(text(330, 78, "Hermes Agent", "strong", "middle"))
    out.append(text(330, 96, "otak + tool + memori", "dim", "middle"))

    permukaan = [
        ("CLI", "terminal", 52),
        ("TUI", "full-screen", 158),
        ("Web", "dashboard", 264),
        ("Desktop", "lokal", 370),
        ("ACP", "editor", 476),
        ("API", "OpenAI-compat", 582),
    ]
    for nama, ket, x in permukaan:
        out.append(box(x - 50, 176, 100, 52, "chip"))
        out.append(text(x, 199, nama, "small", "middle"))
        out.append(text(x, 215, ket, "dim", "middle"))
        out.append(path(f"M330 108 Q {x} 132 {x} 172", "arrow"))

    out.append(path("M52 232 L52 258 L582 258 L582 232", "loop"))
    out.append(path("M576 238 L582 232 L588 238", "arrowhead"))
    out.append(
        text(340, 292, "Skill dan memori terbaca di semua permukaan. Sesi boleh berbeda.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 15 --
def d15_izin() -> str:
    """Alur permission: dari command sampai dijalankan atau ditolak."""
    out = [text(330, 24, "YANG TERJADI SEBELUM COMMAND JALAN", "kicker", "middle")]
    steps = [
        ("1", "Command diterima tool terminal", "Hermes mau menjalankan sebuah perintah."),
        ("2", "YOLO mode aktif?", "Kalau /yolo aktif, langsung jalan. Bukan default."),
        ("3", "Cocok dengan pola berbahaya?", "Dicek terhadap daftar regex perintah berisiko."),
        ("4", "Sudah di-allowlist?", "Session atau config. Kalau ya, langsung jalan."),
        ("5", "Tanya user", "once · session · always · deny. Di sinilah kamu pegang kendali."),
    ]
    y = 48
    for n, judul, ket in steps:
        cls = "panel accent" if n == "5" else "panel"
        out.append(box(80, y, 500, 50, cls))
        out.append(badge(108, y + 25, n, "ai" if n == "5" else "num"))
        out.append(text(132, y + 22, judul, "strong"))
        out.append(text(132, y + 40, ket, "dim"))
        if n != "5":
            out.append(arrow_down(330, y + 50, y + 68))
        y += 68
    out.append(
        text(330, 404, "YOLO dimatikan secara default. Smart approval: LLM pembantu menilai risiko dulu.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 16 --
def d16_llm() -> str:
    """LLM: parameter, training, inference."""
    out = [text(330, 24, "DALAM MODEL ADA ANGKA-ANGKA", "kicker", "middle")]
    out.append(box(70, 52, 520, 74, "panel"))
    out.append(text(330, 78, "Parameter", "strong", "middle"))
    out.append(text(330, 98, "0.1239...  0.1515...  0.0871...  (16-bit float)", "dim", "middle"))

    out.append(box(40, 172, 176, 78, "panel accent"))
    out.append(text(128, 198, "Pre-training", "strong", "middle"))
    out.append(text(128, 217, "10TB data internet", "dim", "middle"))
    out.append(text(128, 234, "6.000 GPU · 12 hari", "dim", "middle"))

    out.append(box(242, 172, 176, 78, "panel accent"))
    out.append(text(330, 198, "Post-training", "strong", "middle"))
    out.append(text(330, 217, "instruksi + contoh", "dim", "middle"))
    out.append(text(330, 234, "membentuk perilaku", "dim", "middle"))

    out.append(box(444, 172, 176, 78, "panel"))
    out.append(text(532, 198, "Inference", "strong", "middle"))
    out.append(text(532, 217, "1 prompt -> 1 jawaban", "dim", "middle"))
    out.append(text(532, 234, "murah, jalan di laptop", "dim", "middle"))

    out.append(arrow_right(216, 242, 211))
    out.append(arrow_right(418, 444, 211))
    out.append(path("M532 250 L532 280 L330 280 L330 146", "loop"))
    out.append(path("M322 280 L330 272 L338 280", "arrowhead"))

    out.append(
        text(330, 316, "Tanpa post-training, model cuma gumpalan pengetahuan yang tidak tahu harus bersikap.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 17 --
def d17_kegunaan() -> str:
    """Kapan pakai LLM, kapan jangan."""
    out = [text(330, 24, "KAPAN PAKAI, KAPAN TIDAK", "kicker", "middle")]

    out.append(box(40, 48, 280, 226, "panel accent"))
    out.append(text(180, 74, "PAKAI LLM", "kicker", "middle"))
    for i, t in enumerate([
        "Data tak terstruktur -> terstruktur",
        "Labeling & klasifikasi",
        "Menjawab pertanyaan",
        "Agent: bertindak di dunia nyata",
    ]):
        y = 104 + i * 42
        out.append(text(58, y, "- " + t, "small"))
        out.append(line(58, y + 12, 302, y + 12, "sep"))

    out.append(box(340, 48, 280, 226, "panel"))
    out.append(text(480, 74, "JANGAN PAKAI LLM", "kicker", "middle"))
    for i, t in enumerate([
        "Naive chatbot tanpa safeguard",
        "Sistem yang bisa dihitung deterministic",
    ]):
        y = 104 + i * 60
        out.append(text(358, y, "- " + t, "small"))
        out.append(line(358, y + 12, 602, y + 12, "sep"))
    out.append(text(358, 190, "Aturan: kalau bisa dibangun", "dim"))
    out.append(text(358, 208, "deterministik, harus begitu.", "dim"))

    out.append(
        text(330, 312, "LLM itu probabilistik. Sistem deterministik lebih murah, lebih cepat, lebih predikibel.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 18 --
def d18_mindset() -> str:
    """Vibes-only trough vs data-driven slope."""
    out = [text(330, 24, "PERJALANAN PENGEMBANGAN AI", "kicker", "middle")]
    out.append(line(60, 300, 600, 300, "axis"))
    out.append(path("M60 288 L110 250 L170 220 L250 168 L330 118 L420 96 L520 88 L596 86", "curve"))
    out.append(path("M60 288 L120 272 L200 252 L280 220 L360 176 L440 132 L520 100 L596 92", "curve2"))
    out.append(text(80, 322, "Vibes-Only Trough", "dim"))
    out.append(text(300, 322, "Data-Driven Slope", "dim"))
    out.append(text(560, 74, "stabil", "dim", "end"))
    out.append(text(300, 108, "eval + data", "dim", "middle"))
    return "".join(out)


# -------------------------------------------------------------- diagram 19 --
def d19_evals() -> str:
    """Tiga jenis eval."""
    out = [text(330, 24, "TIGA JENIS EVAL", "kicker", "middle")]
    kinds = [
        ("Deterministic", "pass / fail", "assert panjang >= 300", "num"),
        ("Manusia", "mahal & lambat", "penilaian expert", "user"),
        ("LLM as Judge", "populer & berbayar", "skor otomatis", "ai"),
    ]
    x = 60
    for nama, ket, contoh, cls in kinds:
        out.append(box(x, 60, 180, 132, "panel accent" if nama == "LLM as Judge" else "panel"))
        out.append(badge(x + 26, 86, nama[0], cls))
        out.append(text(x + 50, 91, nama, "strong"))
        out.append(text(x + 16, 126, ket, "dim"))
        out.append(text(x + 16, 152, contoh, "small"))
        out.append(text(x + 16, 176, "biaya: " + ("rendah" if nama == "Deterministic" else "menengah"), "dim"))
        x += 200
    out.append(
        text(330, 236, "Skor, bukan pass/fail. Karena 5% lebih baik atau 50% lebih buruk itu mungkin terjadi.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 20 --
def d20_teknik() -> str:
    """Tangga kompleksitas: 7 tingkat yang memetakan 17 teknik."""
    out = [text(330, 24, "TANGGA KOMPLEKSITAS", "kicker", "middle")]
    # (nama tingkat, rentang teknik, biaya, tinggi bar)
    steps = [
        ("Prompt", "1-4", "murah", 44),
        ("Kontrol", "5-8", "sedang", 76),
        ("Data", "9-12", "sedang", 108),
        ("Agent", "13-14", "mahal", 140),
        ("Nilai", "15", "mahal", 172),
        ("Router", "16", "mahal", 204),
        ("Fine-tune", "17", "sangat mahal", 236),
    ]
    x = 40
    for i, (nama, rentang, biaya, h) in enumerate(steps):
        y = 286 - h
        op = 0.3 + i * 0.1
        out.append(f'<rect x="{x}" y="{y}" width="72" height="{h}" rx="4" class="d-bar" opacity="{op}"/>')
        out.append(text(x + 36, y - 8, nama, "small", "middle"))
        out.append(text(x + 36, 304, rentang, "mono", "middle"))
        out.append(text(x + 36, 324, biaya, "dim", "middle"))
        x += 84
    out.append(
        text(330, 352, "Angka di bawah nama = nomor teknik. Mulai dari atas, turun hanya", "caption", "middle")
    )
    out.append(
        text(330, 370, "kalau semua opsi yang lebih sederhana sudah kamu coba.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 21 --
def d21_rangkuman() -> str:
    """Peta perjalanan belajar: 4 bagian."""
    out = [text(330, 24, "PERJALANAN BELAJAR", "kicker", "middle")]
    bagian = [
        ("Fondasi AI", "5 modul", "cara kerja LLM", 90),
        ("AI Engineer", "7 modul", "peran, use case, eval", 250),
        ("Hermes Praktis", "16 modul", "jalankan agent", 420),
        ("Penutup", "2 modul", "rangkuman", 570),
    ]
    for nama, jumlah, ket, x in bagian:
        out.append(box(x - 68, 66, 136, 66, "panel accent" if nama == "Hermes Praktis" else "panel"))
        out.append(text(x, 92, nama, "small", "middle"))
        out.append(text(x, 110, jumlah, "mono", "middle"))
        out.append(text(x, 126, ket, "dim", "middle"))
    out.append(path("M90 100 L246 100", "arrow"))
    out.append(path("M254 100 L416 100", "arrow"))
    out.append(path("M424 100 L566 100", "arrow"))
    out.append(
        text(330, 186, 'Dari "apa itu AI" sampai "saya bisa menjalankan Hermes sendiri".', "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 25 --
def d25_checkpoint() -> str:
    """Siklus checkpoint: snapshot, ubah, bandingkan, rollback."""
    out = [text(330, 24, "SIKULUS CHECKPOINT", "kicker", "middle")]

    # Empat langkah dalam satu baris.
    langkah = [
        ("1", "Snapshot", "Sebelum tool", "merusak", "ai"),
        ("2", "Ubah", "Agent menulis", "atau patch", "tool"),
        ("3", "Bandingkan", "/rollback", "diff N", "ai"),
        ("4", "Kembalikan", "/rollback N", "", "system"),
    ]
    x = 30
    for n, judul, baris1, baris2, cls in langkah:
        out.append(box(x, 58, 142, 108, "panel"))
        # Badge di baris sendiri supaya judul punya lebar penuh.
        out.append(badge(x + 20, 80, n, cls))
        out.append(text(x + 38, 84, judul, "small"))
        # Keterangan dipecah dua baris supaya tidak melewati card.
        out.append(text(x + 12, 116, baris1, "dim"))
        out.append(text(x + 12, 134, baris2, "dim"))
        x += 152

    # Panah antar langkah.
    for i in range(3):
        x1 = 30 + i * 152 + 144
        x2 = 30 + (i + 1) * 152 - 2
        out.append(path(f"M{x1} 110 L{x2} 110", "arrow"))

    out.append(
        text(
            330,
            196,
            "Satu repositori shadow git di ~/.hermes/checkpoints/store/ — repo git asli proyekmu tidak tersentuh.",
            "caption",
            "middle",
        )
    )
    out.append(
        text(
            330,
            216,
            "Maksimal satu checkpoint per direktori per giliran percakapan.",
            "dim",
            "middle",
        )
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 22 --
def d22_ekosistem() -> str:
    """Lapis ekosistem Hermes."""
    out = [text(330, 24, "LAPIS EKOSISTEM HERMES", "kicker", "middle")]
    layers = [
        ("Inti", "Hermes Agent — CLI, TUI, dashboard, ACP, API", "system"),
        ("Konfigurasi", "Skills · Plugins · Toolsets · SOUL · Memory", "ai"),
        ("Integrasi", "MCP server · Platform chat · Terminal backend", "tool"),
        ("Ekosistem", "Katalog skill · Dashboard pihak ketiga · Buku", "user"),
    ]
    y = 52
    for nama, ket, cls in layers:
        out.append(box(60, y, 540, 58, "panel"))
        out.append(badge(92, y + 29, nama[0], cls))
        out.append(text(118, y + 26, nama, "strong"))
        out.append(text(118, y + 45, ket, "dim"))
        y += 68
    out.append(
        text(330, 330, "Semakin ke bawah, semakin opsional. Inti Hermes berdiri sendiri.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 23 --
def d23_peran() -> str:
    """Batas antara AI Engineer dan ML Engineer."""
    out = [text(330, 24, "BATAS ANTARA DUA PERAN", "kicker", "middle")]
    out.append(box(50, 56, 270, 190, "panel accent"))
    out.append(text(185, 84, "AI Engineer", "strong", "middle"))
    out.append(text(185, 106, "membangun APLIKASI", "dim", "middle"))
    for i, t in enumerate(["memakai model lewat API", "RAG & sistem eval", "arsitektur aplikasi", "pengalaman pengguna"]):
        out.append(text(74, 140 + i * 26, "- " + t, "small"))
    out.append(box(340, 56, 270, 190, "panel"))
    out.append(text(475, 84, "ML Engineer", "strong", "middle"))
    out.append(text(475, 106, "membangun MODELNYA", "dim", "middle"))
    for i, t in enumerate(["pelatihan & optimasi", "arsitektur model", "matematika & statistika", "infrastruktur training"]):
        out.append(text(364, 140 + i * 26, "- " + t, "small"))
    out.append(
        text(330, 286, "Batasnya ada di API: di atas API kamu AI Engineer, di bawahnya ML Engineer.", "caption", "middle")
    )
    return "".join(out)


# -------------------------------------------------------------- diagram 24 --
def d24_pilih_model() -> str:
    """Lima pertanyaan sebelum memilih model."""
    out = [text(330, 24, "LIMA PERTANYAAN SEBELUM MEMILIH", "kicker", "middle")]
    qs = [
        ("1", "Open atau closed model?", "kontrol vs keandalan"),
        ("2", "Berapa biaya yang bisa diterima?", "per token atau host sendiri"),
        ("3", "Berapa latensi yang bisa diterima?", "waktu sampai token pertama"),
        ("4", "Bagaimana cara menilai performa model?", "benchmark + eval sendiri"),
        ("5", "Seberapa besar context window?", "seberapa data yang harus muat"),
    ]
    y = 48
    for n, q, ket in qs:
        out.append(box(50, y, 560, 46, "panel"))
        out.append(badge(78, y + 23, n, "ai"))
        out.append(text(104, y + 21, q, "strong"))
        out.append(text(104, y + 38, ket, "dim"))
        y += 54
    out.append(
        text(330, 330, "Jawab semuanya dulu, baru lihat daftar model.", "caption", "middle")
    )
    return "".join(out)

DIAGRAMS = [
    ("d1-pesan", "Peran Pesan", 660, 340, d1_pesan, "Modul 1 · pesan, system prompt, reasoning"),
    ("d2-tokenisasi", "Tokenisasi", 700, 400, d2_tokenisasi, "Modul 2 · dari teks ke angka"),
    ("d3-lost-middle", "Lost in the Middle", 660, 386, d3_lost, "Modul 3 · pengaruh per posisi"),
    ("d4-tool-loop", "Loop Tool Call", 660, 496, d4_tool, "Modul 4 · enam langkah"),
    ("d5-agent-workflow", "Agent vs Workflow", 660, 366, d5_agent, "Modul 5 · siapa yang memutuskan"),
    ("d6-konteks", "Context Window", 660, 372, d6_konteks, "Modul 3 · apa yang memakai ruang"),
    ("d7-arsitektur", "Arsitektur Hermes", 680, 400, d7_arsitektur, "Hermes · lapisan agent"),
    ("d8-memori", "Hierarki Memori", 660, 380, d8_memori, "Hermes 02 · lapisan memori"),
    ("d9-skill", "Siklus Skill", 660, 340, d9_skill, "Hermes 03 · pemuatan skill"),
    ("d10-delegasi", "Delegasi", 660, 400, d10_delegasi, "Hermes 04 · subagent paralel"),
    ("d11-mcp", "Jembatan MCP", 660, 340, d11_mcp, "Hermes 05 · tool eksternal"),
    ("d12-gateway", "Gateway Pesan", 660, 360, d12_gateway, "Hermes 07 · Hermes di chat"),
    ("d13-jadwal", "Jadwal Cron", 660, 320, d13_jadwal, "Hermes 08 · agent otonom"),
    ("d14-permukaan", "Semua Permukaan", 660, 320, d14_permukaan, "Hermes 15 · CLI, web, desktop"),
    ("d15-izin", "Alur Permission", 660, 420, d15_izin, "Hermes 16 · sebelum command jalan"),
    ("d16-llm", "Anatomi LLM", 660, 336, d16_llm, "AI 06 · parameter, training, inference"),
    ("d17-kegunaan", "Kapan Pakai LLM", 660, 336, d17_kegunaan, "AI 07 · pakai vs jangan"),
    ("d18-mindset", "Perjalanan developments", 660, 336, d18_mindset, "AI 10 · vibes vs data"),
    ("d19-evals", "Tiga Jenis Eval", 660, 260, d19_evals, "AI 11 · deterministic, manusia, LLM judge"),
    ("d20-teknik", "Tangga Kompleksitas", 660, 390, d20_teknik, "AI 12 · dari prompt ke fine-tuning"),
    ("d21-rangkuman", "Perjalanan Belajar", 660, 210, d21_rangkuman, "Penutup · peta 4 bagian"),
    ("d22-ekosistem", "Lapis Ekosistem", 660, 350, d22_ekosistem, "Penutup · inti ke ekosistem"),
    ("d23-peran", "Dua Peran", 660, 306, d23_peran, "AI 06 · AI Engineer vs ML Engineer"),
    ("d24-pilih-model", "Lima Pertanyaan", 660, 350, d24_pilih_model, "AI 08 · sebelum memilih model"),
    ("d25-checkpoint", "Siklus Checkpoint", 660, 240, d25_checkpoint, "Hermes 24 · snapshot dan rollback"),
]

STYLE = """
.d-panel { fill: var(--d-panel); stroke: var(--d-line); stroke-width: 1.4; }
.d-chip  { fill: var(--d-panel-2); stroke: var(--d-line); stroke-width: 1.2; }
.d-accent{ fill: var(--d-panel-2); stroke: var(--d-accent); stroke-width: 1.6; }
.d-line  { stroke: var(--d-line); stroke-width: 1.4; fill: none; }
.d-sep   { stroke: var(--d-line); stroke-width: 1.2; stroke-dasharray: 3 5; }
.d-axis  { stroke: var(--d-line-2); stroke-width: 1.6; fill: none; }
.d-arrow { stroke: var(--d-ink-2); stroke-width: 1.5; fill: none; }
.d-arrowhead { fill: var(--d-ink-2); stroke: none; }
.d-bracket { stroke: var(--d-accent); stroke-width: 1.6; fill: none; }
.d-curve { stroke: var(--d-accent); stroke-width: 2.2; fill: none; stroke-linecap: round; }
.d-curve2 { stroke: var(--d-ink-2); stroke-width: 1.6; fill: none; stroke-linecap: round; stroke-dasharray: 5 4; opacity: .7; }
.d-loop  { stroke: var(--d-accent); stroke-width: 1.5; fill: none; stroke-dasharray: 5 4; }
.d-kicker { fill: var(--d-ink-2); font: 600 10.5px var(--d-mono); letter-spacing: .14em; }
.d-mono  { fill: var(--d-ink); font: 500 12px var(--d-mono); }
.d-num   { fill: var(--d-accent); font: 600 13px var(--d-mono); letter-spacing: .08em; }
.d-body  { fill: var(--d-ink); font: 400 14px var(--d-body); }
.d-strong{ fill: var(--d-ink); font: 600 14px var(--d-body); }
.d-display{ fill: var(--d-ink); font: 600 19px var(--d-body); }
.d-small { fill: var(--d-ink); font: 500 12.5px var(--d-body); }
.d-dim   { fill: var(--d-ink-2); font: 400 12.5px var(--d-mono); }
.d-caption{ fill: var(--d-ink-2); font: 400 13px var(--d-body); }
.d-badge { stroke: none; }
.d-badge-t { fill: var(--d-bg); font: 700 11px var(--d-mono); }
.d-badge.system { fill: var(--d-green); }
.d-badge.user   { fill: var(--d-blue); }
.d-badge.ai     { fill: var(--d-accent); }
.d-badge.tool   { fill: var(--d-amber); }
.d-badge.num    { fill: var(--d-ink-2); }
.d-dot { stroke: var(--d-bg); stroke-width: 2; }
.d-dot.system { fill: var(--d-green); }
.d-dot.user   { fill: var(--d-blue); }
.d-dot.ai     { fill: var(--d-accent); }
.d-dot.tool   { fill: var(--d-amber); }
.d-model { fill: var(--d-accent); stroke: none; }
.d-seg.input  { fill: var(--d-accent); opacity: .85; }
.d-seg.output { fill: var(--d-accent-2); opacity: .9; }
.d-seg.free   { fill: var(--d-line); opacity: .35; }
.d-seg-t { fill: var(--d-bg); font: 600 10.5px var(--d-mono); letter-spacing: .1em; }
.d-seg-t.dim { fill: var(--d-ink-2); }
.d-bar { fill: var(--d-accent); opacity: .8; }
"""


def build_sprite() -> str:
    symbols = []
    for sid, _name, w, h, fn, _cap in DIAGRAMS:
        symbols.append(
            f'<symbol id="{sid}" viewBox="0 0 {w} {h}">' + fn() + "</symbol>"
        )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'
        f"<defs><style>{STYLE}</style></defs>" + "".join(symbols) + "</svg>"
    )


PAGE_CSS = """
:root { --d-bg:#fbfaf7; --d-panel:#ffffff; --d-panel-2:#f1eee6; --d-ink:#1f1d19;
  --d-ink-2:#6b6455; --d-line:#d9d4c6; --d-line-2:#b9b3a2; --d-accent:#a8801a;
  --d-accent-2:#9c3b2e; --d-green:#2f7d4f; --d-blue:#2f5fd0; --d-amber:#b8770b;
  --d-mono:"JetBrains Mono",ui-monospace,monospace; --d-body:"Karla",ui-sans-serif,system-ui,sans-serif; }
body.tema-gelap { --d-bg:#0a0c10; --d-panel:#12151d; --d-panel-2:#1a1e28; --d-ink:#e8ebf2;
  --d-ink-2:#8b93a7; --d-line:#242a36; --d-line-2:#39414f; --d-accent:#29d3ff;
  --d-accent-2:#3ddc84; --d-green:#3ddc84; --d-blue:#5b8cff; --d-amber:#ffb020; }
body.tema-abu { --d-bg:#eceae4; --d-panel:#f7f6f2; --d-panel-2:#e3e1da; --d-ink:#2b2a27;
  --d-ink-2:#6d6a62; --d-line:#cfccc3; --d-line-2:#a9a59b; --d-accent:#4f72fc;
  --d-accent-2:#e03131; --d-green:#40c057; --d-blue:#4f72fc; --d-amber:#f76707; }
* { box-sizing:border-box; }
body { margin:0; background:var(--d-bg); color:var(--d-ink); font-family:var(--d-body);
  line-height:1.6; transition:background .3s, color .3s; }
.wrap { width:min(1180px,100% - 40px); margin-inline:auto; }
header { position:sticky; top:0; z-index:20; background:color-mix(in srgb, var(--d-bg) 88%, transparent);
  backdrop-filter:blur(12px); border-bottom:1px solid var(--d-line); }
.bar { display:flex; align-items:center; gap:14px; padding:14px 0; flex-wrap:wrap; }
.brand { font-weight:800; letter-spacing:-.02em; }
.spacer { margin-left:auto; }
.seg { display:flex; border:1px solid var(--d-line); border-radius:999px; overflow:hidden; }
.seg button { border:0; background:transparent; color:var(--d-ink-2); font:inherit; font-size:13px;
  padding:7px 14px; cursor:pointer; }
.seg button.on { background:var(--d-ink); color:var(--d-bg); }
.seg button:hover:not(.on) { background:var(--d-panel-2); color:var(--d-ink); }
main { padding:34px 0 80px; }
h1 { font-size:clamp(28px,4.6vw,44px); letter-spacing:-.03em; margin:0 0 10px; }
.intro { color:var(--d-ink-2); max-width:62ch; margin:0 0 28px; }
.card { border:1px solid var(--d-line); border-radius:14px; background:var(--d-panel); overflow:hidden; }
.grid { display:grid; gap:20px; }
.card .head { display:flex; align-items:baseline; gap:12px; padding:14px 18px; border-bottom:1px solid var(--d-line); }
.card .head b { font-size:15px; }
.card .head span { font:500 11.5px var(--d-mono); letter-spacing:.08em; color:var(--d-ink-2); text-transform:uppercase; }
.card .stage { padding:20px; display:grid; gap:18px; }
svg.dia { width:100%; height:auto; display:block; }
.bandingkan { display:none; grid-template-columns:1fr 1fr; gap:16px; }
.bandingkan.on { display:grid; }
.bandingkan figure { margin:0; }
.bandingkan img { width:100%; height:auto; display:block; border-radius:8px; background:#101011; }
.bandingkan figcaption { font:500 11px var(--d-mono); letter-spacing:.1em; text-transform:uppercase;
  color:var(--d-ink-2); margin-top:8px; }
footer { border-top:1px solid var(--d-line); padding:26px 0 50px; color:var(--d-ink-2); font-size:13px; }
code { font-family:var(--d-mono); font-size:.92em; background:var(--d-panel-2); padding:1px 5px; border-radius:4px; }
"""


def build_page() -> str:
    cards = []
    for sid, name, w, h, fn, cap in DIAGRAMS:
        png = {
            "d1-pesan": "m1-conversation.png",
            "d2-tokenisasi": "m2-tokenization.png",
            "d3-lost-middle": "m3-lost-middle.png",
            "d4-tool-loop": "m4-whole-flow.png",
            "d5-agent-workflow": "m5-comparison.png",
            "d6-konteks": "m3-input-output.png",
            "d7-arsitektur": "m1-tools.png",
            "d8-memori": "m3-long-conv.png",
            "d9-skill": "m2-flow.png",
            "d10-delegasi": "m5-agent.png",
            "d11-mcp": "m4-giving-tools.png",
            "d12-gateway": "m1-files.png",
            "d13-jadwal": "m2-vocab.png",
            "d14-permukaan": "m1-files.png",
            "d15-izin": "m3-limits.png",
            "d16-llm": "m2-encoding.png",
            "d17-kegunaan": "m5-comparison.png",
            "d18-mindset": "m3-lost-middle.png",
            "d19-evals": "m1-conversation.png",
            "d20-teknik": "m2-vocab.png",
            "d21-rangkuman": "m1-files.png",
            "d22-ekosistem": "m1-tools.png",
            "d23-peran": "m5-agent.png",
            "d24-pilih-model": "m1-conversation.png",
            "d25-checkpoint": "m1-files.png",
        }[sid]
        cards.append(
            f"""
    <div class="card" data-dia="{sid}">
      <div class="head"><b>{esc(name)}</b><span>{esc(cap)}</span></div>
      <div class="stage">
        <svg class="dia" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(name)}">
          <style>{STYLE}</style>
          <g>{fn()}</g>
        </svg>
        <div class="bandingkan">
          <figure><img src="../img/{png}" alt="Referensi bitmap"><figcaption>Versi bitmap</figcaption></figure>
          <figure><img src="../img-light/{png}" alt="Referensi bitmap versi terang"><figcaption>Bitmap · versi terang</figcaption></figure>
        </div>
      </div>
    </div>"""
        )
    return f"""<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Diagram SVG — AI dari A–Z</title>
<link rel="stylesheet" href="../fonts/karla.css">
<link rel="stylesheet" href="../fonts/jetbrains.css">
<style>{PAGE_CSS}</style>
</head>
<body>
<header>
  <div class="wrap bar">
    <span class="brand">AI dari A–Z</span>
    <span style="color:var(--d-ink-2);font-size:13px">Diagram SVG · remade</span>
    <span class="spacer"></span>
    <div class="seg" id="tema">
      <button data-t="tema-terang" class="on">Terang</button>
      <button data-t="tema-gelap">Gelap</button>
      <button data-t="tema-abu">Abu</button>
    </div>
    <button class="seg" id="banding">Bandingkan dengan asli</button>
  </div>
</header>
<main class="wrap">
  <h1>Diagram sebagai SVG, bukan gambar</h1>
  <p class="intro">
    Diagram inti dibuat dari nol sebagai SVG: warna, tipografi, dan ukurannya diambil
    dari CSS variable halaman, jadi ikut tema. Bandingkan dengan versi bitmap —
    isinya sama, bedanya di bitmap dan file berat.
  </p>
  <div class="grid">
  {"".join(cards)}
  </div>
</main>
<footer class="wrap">
  Generator: <code>tools/build-diagrams.py</code>
</footer>
<script>
  const body = document.body;
  document.querySelectorAll('#tema button').forEach(b => b.addEventListener('click', () => {{
    document.querySelectorAll('#tema button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    body.className = b.dataset.t;
  }}));
  document.getElementById('banding').addEventListener('click', (e) => {{
    const on = e.currentTarget.classList.toggle('on');
    document.querySelectorAll('.bandingkan').forEach(b => b.classList.toggle('on', on));
  }});
</script>
</body>
</html>
"""


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "sprite.svg").write_text(build_sprite(), encoding="utf-8")
    (OUT / "index.html").write_text(build_page(), encoding="utf-8")
    print(f"OK: {OUT / 'sprite.svg'}")
    print(f"OK: {OUT / 'index.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
