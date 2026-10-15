#!/usr/bin/env bash
# ==============================================================================
# DecisionHub Automated PostgreSQL Database Backup Script
# Creates timestamped, gzip-compressed database dumps with retention pruning
# ==============================================================================
set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/decisionhub_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Database connection variables (from environment or defaults)
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-decisionhub-postgres}"
POSTGRES_USER="${POSTGRES_USER:-decisionhub}"
POSTGRES_DB="${POSTGRES_DB:-decisionhub}"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting database backup for '${POSTGRES_DB}' at $(date)..."

# Execute pg_dump inside the container and pipe to gzip
if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    docker exec -t "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip > "${BACKUP_FILE}"
else
    echo "[INFO] Container '${POSTGRES_CONTAINER}' not found running. Attempting direct pg_dump..."
    pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip > "${BACKUP_FILE}"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[SUCCESS] Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Prune old backups older than retention window
echo "[INFO] Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "decisionhub_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -delete
echo "[SUCCESS] Backup workflow completed."
