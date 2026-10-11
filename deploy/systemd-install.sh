#!/usr/bin/env bash
# ==============================================================================
# Helper Script: Install DecisionHub as a Systemd Service on Linux (Ubuntu/Debian)
# ==============================================================================
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] Please run this script as root or with sudo."
  exit 1
fi

APP_DIR="/opt/decisionhub"
USER_NAME="decisionhub"

echo "[INFO] Creating service user '$USER_NAME'..."
id -u $USER_NAME &>/dev/null || useradd -r -s /bin/false $USER_NAME

echo "[INFO] Setting up directories in $APP_DIR..."
mkdir -p "$APP_DIR/backend" "$APP_DIR/logs" "$APP_DIR/frontend"
chown -R $USER_NAME:$USER_NAME "$APP_DIR"

echo "[INFO] Installing systemd service..."
cp "$(dirname "$0")/decisionhub-backend.service" /etc/systemd/system/
systemctl daemon-reload

echo "[SUCCESS] Service installed. Start with:"
echo "  sudo systemctl enable --now decisionhub-backend"
echo "  sudo systemctl status decisionhub-backend"
