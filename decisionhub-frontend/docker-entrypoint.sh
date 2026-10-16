#!/bin/sh
set -e

# Ensure SSL and ACME challenge directories exist
mkdir -p /etc/nginx/ssl/live /var/www/certbot

# Auto-generate fallback self-signed SSL certificate if certificates are missing
if [ ! -f /etc/nginx/ssl/live/fullchain.pem ] || [ ! -f /etc/nginx/ssl/live/privkey.pem ]; then
    echo "[INFO] No SSL certificates found in /etc/nginx/ssl/live/. Generating self-signed fallback certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/live/privkey.pem \
        -out /etc/nginx/ssl/live/fullchain.pem \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" 2>/dev/null
    echo "[SUCCESS] Self-signed SSL certificate generated successfully."
fi

exec "$@"
