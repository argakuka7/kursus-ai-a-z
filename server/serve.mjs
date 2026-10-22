#!/usr/bin/env node
/**
 * Server statis untuk website kursus "AI dari A-Z".
 *
 * Fitur yang dibutuhkan:
 *   - serve file statis dari root project
 *   - fallback ke index.html untuk route SPA
 *   - endpoint /api/chat -> memanggil agent Hermes dan stream jawabannya (SSE)
 *
 * Pakai: node server/serve.mjs [--port 4310] [--root <dir>]
 */

import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------- argumen --
function parseArgs(argv) {
  const out = { port: 4310, root: PROJECT_ROOT };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--port" && argv[i + 1]) out.port = Number(argv[++i]);
    else if (a === "--root" && argv[i + 1]) out.root = path.resolve(argv[++i]);
  }
  return out;
}
const args = parseArgs(process.argv);

// ------------------------------------------------------------------ mime --
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

// --------------------------------------------------------------- helpers --
function send(res, code, body, headers = {}) {
  res.writeHead(code, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

async function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const stat = await fsp.stat(filePath);
  // Modul ES di-cache browser secara agresif. Kirim no-store supaya
  // perubahan selalu langsung terlihat saat reload.
  const noStore = ext === ".html" || ext === ".js" || ext === ".mjs" || ext === ".svg" || ext === ".json";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Cache-Control": noStore ? "no-store, must-revalidate" : "public, max-age=300",
  });
  fs.createReadStream(filePath).pipe(res);
}

/** Cegah path traversal: hasil resolve harus tetap di dalam root. */
function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const target = path.resolve(root, "." + path.posix.normalize(decoded));
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

// --------------------------------------------------------------- Hermes ---
const HERMES_PROFILE = process.env.HERMES_PROFILE || "kelas-ai";
const HERMES_BIN = process.env.HERMES_BIN || "hermes";

// Assistant boleh dimatikan untuk link publik: isi web tetap jalan,
// tapi panel "Tanya Raka" disembunyikan dan /api/chat tidak dilayani.
const ASSISTEN_AKTIF = process.env.ENABLE_ASSISTANT !== "0";

// --- Rate limit (untuk link publik) -------------------------------------
// Tanpa ini, siapa pun yang tahu URL-nya bisa memakai agent Hermes
// milikmu tanpa batas. Batasnya per IP, dan jendela waktunya pendek.
const BATAS_PER_MENIT = Number(process.env.CHAT_RATE_LIMIT || 8);
const jendela = new Map();

function bolehChat(ip) {
  const sekarang = Date.now();
  const waktu = (jendela.get(ip) || []).filter((t) => sekarang - t < 60_000);
  if (waktu.length >= BATAS_PER_MENIT) {
    jendela.set(ip, waktu);
    return false;
  }
  waktu.push(sekarang);
  jendela.set(ip, waktu);
  // Bersihkan entry yang sudah lama agar map tidak tumbuh terus.
  if (jendela.size > 500) {
    for (const [k, v] of jendela) {
      if (!v.some((t) => sekarang - t < 60_000)) jendela.delete(k);
    }
  }
  return true;
}

/**
 * Panggil Hermes sekali dan stream event JSONL-nya ke klien lewat SSE.
 *
 * `hermes chat -q <prompt> --format stream-json [--resume <id>]`
 * Menghasilkan: system/init, text, tool_use, tool_result, result.
 */
function streamHermes(req, res, { prompt, sessionId }) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const args = ["-p", HERMES_PROFILE, "chat", "--query-file", "-", "--format", "stream-json"];
  if (sessionId) args.push("--resume", sessionId);

  const child = spawn(HERMES_BIN, args, {
    cwd: PROJECT_ROOT,
    env: { ...process.env, HERMES_NO_UPDATE_CHECK: "1" },
  });

  // Prompt lewat stdin: aman dari karakter khusus shell.
  child.stdin.write(prompt);
  child.stdin.end();

  let buffer = "";
  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      let evt;
      try {
        evt = JSON.parse(line);
      } catch {
        continue;
      }
      if (evt.type === "text") sendEvent("text", { text: evt.text });
      else if (evt.type === "tool_use") sendEvent("tool", { name: evt.name, input: evt.input });
      else if (evt.type === "tool_result")
        sendEvent("tool_result", { name: evt.name, output: evt.output, is_error: evt.is_error });
      else if (evt.type === "system") sendEvent("init", { session_id: evt.session_id, model: evt.model });
      else if (evt.type === "result")
        sendEvent("result", {
          session_id: evt.session_id,
          text: evt.text,
          tokens: evt.tokens,
          duration_ms: evt.duration_ms,
        });
    }
  });

  child.stderr.on("data", (chunk) => {
    const s = chunk.toString("utf8").trim();
    if (s) sendEvent("log", { text: s.slice(0, 400) });
  });

  child.on("error", (err) => {
    sendEvent("error", { message: `Gagal menjalankan Hermes: ${err.message}` });
    res.end();
  });

  child.on("close", (code) => {
    sendEvent("done", { code });
    res.end();
  });

  req.on("close", () => {
    if (!child.killed) child.kill("SIGTERM");
  });
}

async function readBody(req, limit = 64 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("Body terlalu besar");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// --------------------------------------------------------------- routes --
const server = http.createServer(async (req, res) => {
  const url = req.url || "/";

  if (url.startsWith("/api/chat") && req.method === "POST") {
    if (!ASSISTEN_AKTIF) {
      return send(res, 503, JSON.stringify({ error: "Asisten dimatikan di instance ini." }), {
        "Content-Type": "application/json",
      });
    }
    const ip =
      (req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown")
        .toString()
        .split(",")[0]
        .trim();
    if (!bolehChat(ip)) {
      return send(res, 429, JSON.stringify({ error: "Terlalu banyak permintaan. Tunggu sebentar." }), {
        "Content-Type": "application/json",
      });
    }
    try {
      const raw = await readBody(req);
      const { prompt, sessionId } = JSON.parse(raw || "{}");
      if (!prompt || !String(prompt).trim()) {
        return send(res, 400, JSON.stringify({ error: "prompt kosong" }), {
          "Content-Type": "application/json",
        });
      }
      return streamHermes(req, res, { prompt: String(prompt), sessionId });
    } catch (err) {
      return send(res, 500, JSON.stringify({ error: String(err.message) }), {
        "Content-Type": "application/json",
      });
    }
  }

  if (url.startsWith("/api/health")) {
    return send(
      res,
      200,
      JSON.stringify({ ok: true, profile: HERMES_PROFILE, asisten: ASSISTEN_AKTIF }),
      { "Content-Type": "application/json" }
    );
  }

  // File statis.
  let target = safeJoin(args.root, url);
  if (!target) return send(res, 400, "path tidak valid");

  try {
    const stat = await fsp.stat(target).catch(() => null);
    if (stat?.isDirectory()) target = path.join(target, "index.html");
    await serveFile(res, target);
  } catch {
    // Fallback: index.html untuk route SPA.
    try {
      await serveFile(res, path.join(args.root, "index.html"));
    } catch {
      send(res, 404, "404 — tidak ditemukan");
    }
  }
});

server.listen(args.port, "127.0.0.1", () => {
  console.log(`AI dari A–Z siap di http://127.0.0.1:${args.port}`);
  console.log(`root: ${args.root}`);
});
