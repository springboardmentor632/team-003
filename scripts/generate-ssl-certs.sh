#!/usr/bin/env bash
# ==============================================================================
# Generate Self-Signed SSL/TLS Certificates for Staging/Local Testing
# ==============================================================================
set -euo pipefail

CERT_DIR="${1:-./nginx/ssl/live}"
DOMAIN="${2:-localhost}"

mkdir -p "${CERT_DIR}"

echo "[INFO] Generating 2048-bit RSA private key and self-signed certificate for '${DOMAIN}'..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "${CERT_DIR}/privkey.pem" \
  -out "${CERT_DIR}/fullchain.pem" \
  -subj "/C=US/ST=State/L=City/O=DecisionHub/OU=Engineering/CN=${DOMAIN}" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:*.${DOMAIN},IP:127.0.0.1"

echo "[SUCCESS] SSL certificates generated at: ${CERT_DIR}"
echo "  - Certificate: ${CERT_DIR}/fullchain.pem"
echo "  - Private Key: ${CERT_DIR}/privkey.pem"
