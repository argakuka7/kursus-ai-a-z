#!/usr/bin/env bash
# Jalankan server kursus "AI dari A–Z" + publish ke Tailscale.
#
#   bash server/run.sh            # start + publish Tailscale (dengan Hermes)
#   bash server/run.sh stop       # stop semua instance
#   bash server/run.sh status     # cek status
#
# Dua instance:
#   4310  -> Tailscale  (punya Hermes, untukmu)
#   4311  -> Cloudflare (tanpa Hermes, untuk demo klien)
#
# Link Tailscale: https://<host>.<tailnet>.ts.net:8449

set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-4310}"
PORT_PUBLIK="${PORT_PUBLIK:-4311}"
TS_PORT="${TS_PORT:-8449}"
LOG="${LOG:-/tmp/kursus-ai.log}"
LOG_PUBLIK="${LOG_PUBLIK:-/tmp/kursus-ai-publik.log}"

stop_server() {
  # Pola harus spesifik per port. Pola longgar bisa menewaskan proses
  # lain yang kebetulan punya string serupa di command line-nya.
  pkill -f "server/serve.mjs --port ${PORT}\$" 2>/dev/null || true
  pkill -f "server/serve.mjs --port ${PORT_PUBLIK}\$" 2>/dev/null || true
  # Tunnel Cloudflare sementara dijalankan sebagai service systemd
  # (kursus-ai-cf-tunnel.service), jadi tidak boleh di-bunuh di sini.
}

wait_ready() {
  local port="$1"
  for _ in $(seq 1 40); do
    if curl -sf -o /dev/null "http://127.0.0.1:$port/"; then return 0; fi
    sleep 0.3
  done
  return 1
}

case "${1:-start}" in
  stop)
    stop_server
    echo "dihentikan"
    exit 0
    ;;
  status)
    for p in "$PORT" "$PORT_PUBLIK"; do
      if curl -sf -o /dev/null "http://127.0.0.1:$p/"; then
        echo "server :$p  jalan  ($(curl -s http://127.0.0.1:$p/api/health))"
      else
        echo "server :$p  mati"
      fi
    done
    tailscale serve status 2>/dev/null | grep -A1 ":$TS_PORT" || true
    pgrep -af "cloudflared tunnel.*:$PORT_PUBLIK" | head -1 || true
    exit 0
    ;;
esac

stop_server
sleep 0.6

# Instance 1: Tailscale, Hermes aktif.
setsid nohup node server/serve.mjs --port "$PORT" > "$LOG" 2>&1 < /dev/null &

# Instance 2: Cloudflare, Hermes dimatikan.
ENABLE_ASSISTANT=0 setsid nohup node server/serve.mjs --port "$PORT_PUBLIK" > "$LOG_PUBLIK" 2>&1 < /dev/null &

if ! wait_ready "$PORT"; then
  echo "GAGAL: server utama tidak merespons"; tail -20 "$LOG"; exit 1
fi
wait_ready "$PORT_PUBLIK" || true

# Link publik lewat Tailscale Funnel. URL-nya tetap sama, tidak seperti
# quick tunnel Cloudflare yang ganti-ganti tiap restart (dan bisa kena
# rate limit).
if command -v tailscale >/dev/null 2>&1 && tailscale funnel --bg "$PORT_PUBLIK" >/dev/null 2>&1; then
  FUNNEL=1
else
  FUNNEL=0
fi

# Tunnel Cloudflare sementara, kalau servicenya ada. Dipakai sebagai
# link cadangan saat Funnel bermasalah.
if systemctl list-unit-files kursus-ai-cf-tunnel.service >/dev/null 2>&1; then
  systemctl start kursus-ai-cf-tunnel.service >/dev/null 2>&1 || true
fi

# Publish Tailscale.
if ! tailscale serve status 2>/dev/null | grep -q ":$TS_PORT"; then
  tailscale serve --bg --https="$TS_PORT" "http://127.0.0.1:$PORT" >/dev/null 2>&1 || true
fi

# Tunggu URL tunnel muncul.
URL=""
if [ "$FUNNEL" = "0" ]; then
  for _ in $(seq 1 30); do
    URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cf-kursus.log 2>/dev/null | tail -1)
    [ -n "$URL" ] && break
    sleep 1
  done
fi

HOST=$(tailscale status --json 2>/dev/null | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin); print(d.get('Self',{}).get('DNSName','').rstrip('.'))
except Exception:
    print('')
" 2>/dev/null)

echo "siap"
[ -n "$HOST" ] && echo "  Tailscale (dengan Hermes): https://${HOST}:${TS_PORT}"
if [ "$FUNNEL" = "1" ]; then
  [ -n "$HOST" ] && echo "  Publik Funnel (tanpa Hermes): https://${HOST}/"
fi
CF_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cf-kursus.log 2>/dev/null | tail -1)
[ -n "$CF_URL" ] && echo "  Cloudflare sementara (tanpa Hermes): ${CF_URL}"
