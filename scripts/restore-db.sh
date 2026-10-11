#!/usr/bin/env bash
# ==============================================================================
# DecisionHub Database Restore Script
# Restores a SQL dump or .sql.gz backup to PostgreSQL database
# ==============================================================================
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql or .sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-decisionhub-postgres}"
POSTGRES_USER="${POSTGRES_USER:-decisionhub}"
POSTGRES_DB="${POSTGRES_DB:-decisionhub}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file '${BACKUP_FILE}' does not exist!"
    exit 1
fi

echo "[WARNING] This will restore '${BACKUP_FILE}' into '${POSTGRES_DB}'."
read -p "Are you sure you want to proceed? (y/N): " -r CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Restore aborted by user."
    exit 0
fi

echo "[INFO] Restoring database from '${BACKUP_FILE}'..."

CONTAINER_ID=$(docker ps --filter "name=postgres" -q | head -n 1)

if [ -n "${CONTAINER_ID}" ]; then
    if [[ "${BACKUP_FILE}" == *.gz ]]; then
        gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_ID}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
    else
        docker exec -i "${CONTAINER_ID}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "${BACKUP_FILE}"
    fi
else
    if [[ "${BACKUP_FILE}" == *.gz ]]; then
        gunzip -c "${BACKUP_FILE}" | psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
    else
        psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "${BACKUP_FILE}"
    fi
fi

echo "[SUCCESS] Database restoration complete!"
