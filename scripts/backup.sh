#!/usr/bin/env bash
# ============================================================
# SomaTek Database Backup Script
# Usage: ./scripts/backup.sh
# Cron:  0 2 * * * /home/deploy/somatek/scripts/backup.sh >> /var/log/somatek-backup.log 2>&1
# Retention: 7 days
# ============================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.production"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y-%m-%d_%H%M)
RETENTION_DAYS=7

# Load env vars
set -a
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backups..."

# -----------------------------------------------------------
# PostgreSQL backup
# -----------------------------------------------------------
echo "[$(date)] Backing up PostgreSQL..."
docker exec somatek-postgres pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --no-owner \
    --no-privileges \
    | gzip > "$BACKUP_DIR/postgres_${DATE}.sql.gz"
echo "[$(date)] PostgreSQL backup complete: postgres_${DATE}.sql.gz"

# -----------------------------------------------------------
# MongoDB backup
# -----------------------------------------------------------
echo "[$(date)] Backing up MongoDB..."
docker exec somatek-mongodb mongodump \
    --username="$MONGO_ROOT_USERNAME" \
    --password="$MONGO_ROOT_PASSWORD" \
    --authenticationDatabase=admin \
    --db=somatek \
    --archive \
    --gzip \
    > "$BACKUP_DIR/mongodb_${DATE}.archive.gz"
echo "[$(date)] MongoDB backup complete: mongodb_${DATE}.archive.gz"

# -----------------------------------------------------------
# Qdrant snapshot
# -----------------------------------------------------------
echo "[$(date)] Creating Qdrant snapshot..."
docker exec somatek-qdrant curl -sf -X POST \
    "http://localhost:6333/collections/somatek_documents/snapshots" \
    > "$BACKUP_DIR/qdrant_snapshot_${DATE}.json" 2>/dev/null \
    && echo "[$(date)] Qdrant snapshot created" \
    || echo "[$(date)] Qdrant snapshot skipped (collection may not exist yet)"

# -----------------------------------------------------------
# Cleanup old backups
# -----------------------------------------------------------
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete!"
ls -lh "$BACKUP_DIR"
