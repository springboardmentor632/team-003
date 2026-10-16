#!/usr/bin/env bash
# ==============================================================================
# DecisionHub Let's Encrypt SSL Automated Provisioning Script (Linux/macOS)
# ==============================================================================
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"
STAGING="${3:-0}" # 1 for staging, 0 for production
RSA_KEY_SIZE=4096

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email> [staging: 0|1]"
    echo "Example: $0 decisionhub.org admin@decisionhub.org 0"
    exit 1
fi

echo "========================================================"
echo "   DecisionHub Let's Encrypt SSL Automated Provisioning "
echo "========================================================"

SSL_DIR="./nginx/ssl"
LIVE_DIR="${SSL_DIR}/live"
mkdir -p "${LIVE_DIR}"

FULLCHAIN="${LIVE_DIR}/fullchain.pem"
PRIVKEY="${LIVE_DIR}/privkey.pem"

# Bootstrap certificate if missing
if [ ! -f "$FULLCHAIN" ] || [ ! -f "$PRIVKEY" ]; then
    echo "[INFO] No existing certificate found. Generating bootstrap certificate..."
    ./scripts/generate-ssl-certs.sh "${LIVE_DIR}" "${DOMAIN}"
fi

echo "[INFO] Starting DecisionHub containers to bind port 80 & 443..."
docker compose up -d frontend

echo "[INFO] Waiting for Nginx to initialize..."
sleep 5

STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
    STAGING_ARG="--staging"
    echo "[NOTICE] Running in STAGING mode (test certificates issued)."
fi

echo "[INFO] Requesting CA-signed certificate from Let's Encrypt for '${DOMAIN}'..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --force-renewal" certbot

DOMAIN_CERT_DIR="${SSL_DIR}/live/${DOMAIN}"
if [ -f "${DOMAIN_CERT_DIR}/fullchain.pem" ]; then
    cp -f "${DOMAIN_CERT_DIR}/fullchain.pem" "${FULLCHAIN}"
    cp -f "${DOMAIN_CERT_DIR}/privkey.pem" "${PRIVKEY}"
    echo "[SUCCESS] CA-signed certificates placed in ${LIVE_DIR}"
fi

echo "[INFO] Reloading Nginx configuration with new TLS certificate..."
docker exec decisionhub-frontend nginx -s reload

echo "[SUCCESS] HTTPS is actively terminating on port 443 for https://${DOMAIN} !"
echo "[SUCCESS] HTTP port 80 is actively redirecting to HTTPS."
echo "[SUCCESS] Automated renewals handled in background by 'decisionhub-certbot' service."
