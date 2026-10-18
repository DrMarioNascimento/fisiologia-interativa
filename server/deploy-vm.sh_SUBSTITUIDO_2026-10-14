#!/usr/bin/env bash
# Run with sudo on the dedicated Debian VM. Never include credentials in this file.
set -euo pipefail
test "$(id -u)" = 0
app=/opt/tutor-fisiologia
host=tutor-fisiologia.35.208.107.43.sslip.io
if ! test -x /opt/tutor-node/bin/node; then
  download=$(mktemp -d)
  cd "$download"
  curl -fsSLO https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt
  archive=$(awk '/-linux-x64.tar.xz$/ {print $2}' SHASUMS256.txt)
  test -n "$archive"
  curl -fsSLO "https://nodejs.org/dist/latest-v24.x/$archive"
  awk '/-linux-x64.tar.xz$/' SHASUMS256.txt | sha256sum -c -
  install -d /opt/tutor-node
  tar -xJf "$archive" -C /opt/tutor-node --strip-components=1
fi
if ! test -d "$app/.git"; then
  git clone --depth=1 --branch=main https://github.com/DrMarioNascimento/fisiologia-interativa.git "$app"
else
  git -C "$app" pull --ff-only origin main
fi
id tutor-fisiologia >/dev/null 2>&1 || useradd --system --home-dir /var/lib/tutor-fisiologia --create-home --shell /usr/sbin/nologin tutor-fisiologia
install -d -m 700 /etc/tutor-fisiologia
cat > /etc/systemd/system/tutor-fisiologia.service <<'SERVICE'
[Unit]
Description=Tutor Gemini de Fisiologia
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tutor-fisiologia
Group=tutor-fisiologia
WorkingDirectory=/opt/tutor-fisiologia
EnvironmentFile=-/etc/tutor-fisiologia/gemini.env
Environment=HOST=127.0.0.1
Environment=PORT=8787
Environment=TUTOR_SERVE_SITE=0
Environment=TUTOR_ALLOWED_ORIGINS=https://drmarionascimento.github.io
Environment=TUTOR_DAILY_LIMIT=100
ExecStart=/opt/tutor-node/bin/node /opt/tutor-fisiologia/server/tutor.cjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
MemoryMax=256M
TasksMax=64

[Install]
WantedBy=multi-user.target
SERVICE
if ! test -f /etc/caddy/Caddyfile.before-tutor; then
  cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.before-tutor
fi
cat > /etc/caddy/Caddyfile <<CADDY
$host {
  @tutor path /api/tutor /api/tutor/status
  handle @tutor {
    reverse_proxy 127.0.0.1:8787
  }
  handle {
    respond "Not found" 404
  }
}
CADDY
caddy validate --config /etc/caddy/Caddyfile
systemctl daemon-reload
systemctl enable --now tutor-fisiologia
systemctl restart tutor-fisiologia
systemctl reload caddy
systemctl is-active tutor-fisiologia caddy convite-bot
/opt/tutor-node/bin/node --version
curl --retry 5 --retry-connrefused --retry-delay 1 -fsS http://127.0.0.1:8787/api/tutor/status
