#!/usr/bin/env bash
#
# SIMASET database backup
#   hourly   -> dump pg ke /var/backups/simaset/db-YYYY-MM-DD.sql.gz (overwrite tiap jam)
#   upload   -> upload backup HARI KEMARIN ke S3 + prune object > S3_RETENTION_DAYS
#   prune    -> (manual) hapus object S3 db-YYYY-MM-DD.sql.gz lebih lama dari S3_RETENTION_DAYS
#
# Cron contoh (di server, akses via `ssh simaset`):
#   0 * * * *  /opt/simaset/scripts/backup-db.sh hourly >> /var/log/simaset-backup.log 2>&1
#   5 2 * * *  /opt/simaset/scripts/backup-db.sh upload >> /var/log/simaset-backup.log 2>&1
#
# Dependency: postgresql-client (pg_dump), awscli v2, gzip
# Kredensial DB: pakai ~/.pgpass atau export PGPASSWORD sebelum dipanggil cron.
# Kredensial AWS: pakai IAM role atau ~/.aws/credentials.

set -euo pipefail

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-simaset}"
DB_USER="${DB_USER:-simaset}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/simaset}"
S3_URI="${S3_URI:-s3://db-apps-backup/simaset-dishubclp/}"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"
S3_RETENTION_DAYS="${S3_RETENTION_DAYS:-30}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { log "ERROR: $*"; exit 1; }

yesterday_date() {
  if date -d 'yesterday' '+%Y-%m-%d' >/dev/null 2>&1; then
    date -d 'yesterday' '+%Y-%m-%d'
  else
    date -v -1d '+%Y-%m-%d'
  fi
}

backup_hourly() {
  command -v pg_dump >/dev/null || die "pg_dump tidak ditemukan"
  mkdir -p "$BACKUP_DIR"

  local date_str file tmp
  date_str="$(date '+%Y-%m-%d')"
  file="${BACKUP_DIR}/db-${date_str}.sql.gz"
  tmp="${file}.tmp"

  log "Dump ${DB_NAME}@${DB_HOST}:${DB_PORT} -> ${file}"
  pg_dump \
    --host="$DB_HOST" --port="$DB_PORT" \
    --username="$DB_USER" --dbname="$DB_NAME" \
    --no-owner --no-privileges --clean --if-exists \
    | gzip -9 > "$tmp"

  mv -f "$tmp" "$file"
  log "Selesai. Ukuran: $(du -h "$file" | cut -f1)"

  find "$BACKUP_DIR" -maxdepth 1 -name 'db-*.sql.gz' -type f \
    -mtime "+${LOCAL_RETENTION_DAYS}" -delete
}

upload_s3() {
  command -v aws >/dev/null || die "aws cli tidak ditemukan"

  local date_str file key
  date_str="$(yesterday_date)"
  file="${BACKUP_DIR}/db-${date_str}.sql.gz"
  key="${S3_URI%/}/db-${date_str}.sql.gz"

  [[ -f "$file" ]] || die "backup tidak ditemukan: $file"

  log "Upload ${file} -> ${key}"
  aws s3 cp "$file" "$key" --only-show-errors
  log "Upload selesai"

  prune_s3
}

prune_s3() {
  command -v aws >/dev/null || die "aws cli tidak ditemukan"

  local cutoff prefix bucket key_prefix
  if date -d "${S3_RETENTION_DAYS} days ago" '+%Y-%m-%d' >/dev/null 2>&1; then
    cutoff="$(date -d "${S3_RETENTION_DAYS} days ago" '+%Y-%m-%d')"
  else
    cutoff="$(date -v "-${S3_RETENTION_DAYS}d" '+%Y-%m-%d')"
  fi

  prefix="${S3_URI#s3://}"
  bucket="${prefix%%/*}"
  key_prefix="${prefix#*/}"

  log "Prune s3://${bucket}/${key_prefix} (cutoff < ${cutoff})"

  local deleted=0 kept=0
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    local fname="${key##*/}"
    if [[ "$fname" =~ ^db-([0-9]{4}-[0-9]{2}-[0-9]{2})\.sql\.gz$ ]]; then
      local file_date="${BASH_REMATCH[1]}"
      if [[ "$file_date" < "$cutoff" ]]; then
        log "  hapus ${key} (date=${file_date})"
        aws s3 rm "s3://${bucket}/${key}" --only-show-errors
        deleted=$((deleted + 1))
      else
        kept=$((kept + 1))
      fi
    fi
  done < <(aws s3api list-objects-v2 --bucket "$bucket" --prefix "$key_prefix" \
            --query 'Contents[].Key' --output text 2>/dev/null | tr '\t' '\n')

  log "Prune selesai: ${deleted} dihapus, ${kept} dipertahankan"
}

case "${1:-}" in
  hourly) backup_hourly ;;
  upload) upload_s3 ;;
  prune)  prune_s3 ;;
  *) die "Usage: $0 {hourly|upload|prune}" ;;
esac
