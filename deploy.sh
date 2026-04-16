#!/bin/bash
# ==============================================================
# SIMASET Deploy Script
# Jalankan dari komputer lokal: bash deploy.sh
# Mendukung initial deploy & update deploy
# Flow update: backup → deploy → verify → cleanup/rollback
# ==============================================================
set -e

# --- Konfigurasi ---
SERVER_IP="103.127.139.87"
SERVER_USER="ardhian"
SSH_PORT="22797"
REMOTE_DIR="/var/www/simaset"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
PHP_FPM="php8.4-fpm"
BACKUP_DIR="/var/www/simaset-docs-backup-$(date +%Y%m%d%H%M%S)"
DOC_DIRS="asset-documents disposal-documents generated-documents"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

step() { echo -e "\n${GREEN}[STEP]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# SSH helper
remote() { ssh -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$@"; }

echo "==============================="
echo " SIMASET Deploy Script"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "==============================="
echo " Server : ${SERVER_USER}@${SERVER_IP}:${SSH_PORT}"
echo " Remote : ${REMOTE_DIR}"
echo " Backup : ${BACKUP_DIR}"
echo " Local  : ${LOCAL_DIR}"
echo "==============================="

# --- Detect deploy type ---
INITIAL_DEPLOY=false
if ! remote "[ -f '${REMOTE_DIR}/vendor/autoload.php' ]" 2>/dev/null; then
    INITIAL_DEPLOY=true
    warn "vendor/ tidak ditemukan di server — menjalankan INITIAL DEPLOY"
fi

# --- Pre-flight checks (lokal) ---
step "Pre-flight checks (lokal)"
command -v rsync >/dev/null 2>&1 || fail "rsync tidak ditemukan di lokal"
command -v ssh >/dev/null 2>&1 || fail "ssh tidak ditemukan di lokal"
[ -d "$LOCAL_DIR" ] || fail "Direktori lokal $LOCAL_DIR tidak ditemukan"
echo "Lokal OK."

# --- Pre-flight checks (server) ---
step "Pre-flight checks (server)"
remote "
    command -v php >/dev/null 2>&1 || { echo 'FAIL: PHP tidak ditemukan'; exit 1; }
    command -v composer >/dev/null 2>&1 || { echo 'FAIL: Composer tidak ditemukan'; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo 'FAIL: npm tidak ditemukan'; exit 1; }
    systemctl is-active --quiet postgresql || { echo 'FAIL: PostgreSQL tidak berjalan'; exit 1; }
    [ -f '${REMOTE_DIR}/.env' ] || { echo 'FAIL: .env tidak ditemukan — buat dulu di server (lihat DEPLOYMENT.md bagian 6.1)'; exit 1; }
    echo 'Server OK.'
" || fail "Pre-flight check server gagal"

# ==============================================================
# UPDATE DEPLOY (dengan backup & verifikasi)
# ==============================================================
if [ "$INITIAL_DEPLOY" = false ]; then

    # --- Backup dokumen di server ---
    step "Backup dokumen di server"
    remote "
        set -e
        STORAGE='${REMOTE_DIR}/storage/app/private'

        echo '>>> Hitung dokumen sebelum deploy...'
        DOC_COUNT=0
        for NAME in ${DOC_DIRS}; do
            DIR=\"\$STORAGE/\$NAME\"
            if [ -d \"\$DIR\" ]; then
                COUNT=\$(sudo find \"\$DIR\" -type f | wc -l)
                DOC_COUNT=\$((DOC_COUNT + COUNT))
                echo \"   \$NAME: \$COUNT files\"
            fi
        done
        echo \"\$DOC_COUNT\" > /tmp/simaset_doc_count_before.txt
        echo \">>> Total dokumen sebelum deploy: \$DOC_COUNT\"

        echo '>>> Backup dokumen ke ${BACKUP_DIR}...'
        sudo mkdir -p '${BACKUP_DIR}'
        for NAME in ${DOC_DIRS}; do
            DIR=\"\$STORAGE/\$NAME\"
            if [ -d \"\$DIR\" ]; then
                sudo cp -a \"\$DIR\" '${BACKUP_DIR}/'
            fi
        done
        echo '>>> Backup selesai.'
    " || fail "Backup gagal"

    # --- Rollback function ---
    rollback() {
        echo -e "\n${RED}[ROLLBACK]${NC} Deploy gagal! Mengembalikan dokumen dari backup..."
        remote "
            STORAGE='${REMOTE_DIR}/storage/app/private'

            # Restore dokumen dari backup
            for NAME in ${DOC_DIRS}; do
                if [ -d '${BACKUP_DIR}/'\"\$NAME\" ]; then
                    sudo rm -rf \"\$STORAGE/\$NAME\"
                    sudo cp -a '${BACKUP_DIR}/'\"\$NAME\" \"\$STORAGE/\"
                fi
            done

            # Fix permissions
            sudo chown -R ardhian:www-data '${REMOTE_DIR}/storage'

            # Restart services
            sudo systemctl restart ${PHP_FPM}
            sudo supervisorctl restart simaset-worker:* 2>/dev/null || true

            # Matikan maintenance mode
            cd '${REMOTE_DIR}' && php artisan up 2>/dev/null || true
            echo 'Rollback dokumen selesai.'
        " 2>/dev/null || echo -e "${RED}Rollback gagal! Restore manual dari ${BACKUP_DIR}${NC}"
        exit 1
    }
    trap rollback ERR

    # --- Maintenance mode ON ---
    step "Mengaktifkan maintenance mode"
    remote "cd ${REMOTE_DIR} && php artisan down --refresh=15"

    # --- Rsync files ke server ---
    step "Transfer file ke server (rsync)"
    rsync -avz --progress --delete \
        --exclude='node_modules' \
        --exclude='vendor' \
        --exclude='.env' \
        --exclude='storage/logs/*' \
        --exclude='storage/framework/cache/*' \
        --exclude='storage/framework/sessions/*' \
        --exclude='storage/framework/views/*' \
        --exclude='storage/app/*' \
        --exclude='bootstrap/cache/*' \
        --exclude='public/hot' \
        --exclude='.git' \
        -e "ssh -p ${SSH_PORT}" \
        "${LOCAL_DIR}/" \
        "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/" \
        || { RSYNC_EXIT=$?; [ $RSYNC_EXIT -eq 23 ] && warn "rsync partial transfer (exit 23) — non-critical, melanjutkan deploy" || exit $RSYNC_EXIT; }

    # --- Remote: install, build, migrate, cache ---
    step "Menjalankan deploy di server"
    remote "
        set -e
        cd ${REMOTE_DIR}

        echo '>>> Install PHP dependencies (composer)'
        composer install --no-dev --optimize-autoloader --no-interaction

        echo '>>> Install Node dependencies (npm)'
        npm ci

        echo '>>> Build frontend assets'
        npm run build

        echo '>>> Database migration'
        php artisan migrate --force

        echo '>>> Rebuild cache'
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache

        echo '>>> Set permissions'
        sudo chown -R ardhian:www-data storage bootstrap/cache
        chmod -R 775 storage bootstrap/cache

        echo '>>> Restart PHP-FPM'
        sudo systemctl restart ${PHP_FPM}

        echo '>>> Restart queue workers'
        sudo supervisorctl restart simaset-worker:*
    "

    # --- Verifikasi deploy ---
    step "Verifikasi deploy"
    remote "
        set -e
        cd '${REMOTE_DIR}'

        echo '>>> Cek artisan bisa berjalan...'
        php artisan --version || { echo 'FAIL: artisan tidak berjalan'; exit 1; }

        echo '>>> Cek route list...'
        php artisan route:list --json > /dev/null 2>&1 || { echo 'FAIL: route cache error'; exit 1; }

        echo '>>> Hitung dokumen setelah deploy...'
        STORAGE='${REMOTE_DIR}/storage/app/private'
        DOC_COUNT_AFTER=0
        for NAME in ${DOC_DIRS}; do
            DIR=\"\$STORAGE/\$NAME\"
            if [ -d \"\$DIR\" ]; then
                COUNT=\$(sudo find \"\$DIR\" -type f | wc -l)
                DOC_COUNT_AFTER=\$((DOC_COUNT_AFTER + COUNT))
                echo \"   \$NAME: \$COUNT files\"
            fi
        done

        DOC_COUNT_BEFORE=\$(cat /tmp/simaset_doc_count_before.txt 2>/dev/null || echo '0')
        echo \">>> Dokumen sebelum: \$DOC_COUNT_BEFORE, sesudah: \$DOC_COUNT_AFTER\"

        if [ \"\$DOC_COUNT_AFTER\" -lt \"\$DOC_COUNT_BEFORE\" ]; then
            echo \"FAIL: Dokumen berkurang! Sebelum: \$DOC_COUNT_BEFORE, Sesudah: \$DOC_COUNT_AFTER\"
            exit 1
        fi

        echo '>>> Semua verifikasi berhasil.'
    " || fail "Verifikasi gagal — rollback otomatis"

    # --- Nyalakan aplikasi ---
    step "Menonaktifkan maintenance mode"
    remote "cd ${REMOTE_DIR} && php artisan up"

    # --- Cleanup backup ---
    step "Menghapus backup (deploy berhasil)"
    remote "
        sudo rm -rf '${BACKUP_DIR}'
        rm -f /tmp/simaset_doc_count_before.txt
        echo 'Backup dihapus.'
    "

    # Clear trap
    trap - ERR

# ==============================================================
# INITIAL DEPLOY (tanpa backup)
# ==============================================================
else

    # --- Rsync files ke server ---
    step "Transfer file ke server (rsync)"
    rsync -avz --progress --delete \
        --exclude='node_modules' \
        --exclude='vendor' \
        --exclude='.env' \
        --exclude='storage/logs/*' \
        --exclude='storage/framework/cache/*' \
        --exclude='storage/framework/sessions/*' \
        --exclude='storage/framework/views/*' \
        --exclude='storage/app/*' \
        --exclude='bootstrap/cache/*' \
        --exclude='public/hot' \
        --exclude='.git' \
        -e "ssh -p ${SSH_PORT}" \
        "${LOCAL_DIR}/" \
        "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/" \
        || { RSYNC_EXIT=$?; [ $RSYNC_EXIT -eq 23 ] && warn "rsync partial transfer (exit 23) — non-critical, melanjutkan deploy" || exit $RSYNC_EXIT; }

    # --- Remote: install, build, migrate, seed, cache ---
    step "Menjalankan initial deploy di server"
    remote "
        set -e
        cd ${REMOTE_DIR}

        echo '>>> Install PHP dependencies (composer)'
        composer install --no-dev --optimize-autoloader --no-interaction

        echo '>>> Install Node dependencies (npm)'
        npm ci

        echo '>>> Build frontend assets'
        npm run build

        echo '>>> Generate application key'
        php artisan key:generate --force

        echo '>>> Database migration'
        php artisan migrate --force

        echo '>>> Seed data awal'
        php artisan db:seed --class=RoleSeeder --force
        php artisan db:seed --class=AdminUserSeeder --force
        php artisan db:seed --class=SettingSeeder --force

        echo '>>> Create storage link'
        php artisan storage:link

        echo '>>> Rebuild cache'
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache

        echo '>>> Set permissions'
        sudo chown -R ardhian:www-data storage bootstrap/cache
        chmod -R 775 storage bootstrap/cache
    "
fi

echo ""
echo "==============================="
echo -e " ${GREEN}Deploy selesai!${NC}"
if [ "$INITIAL_DEPLOY" = true ]; then
    echo -e " ${YELLOW}Initial deploy — pastikan setup Nginx, SSL,"
    echo -e " Supervisor, dan Cron sesuai DEPLOYMENT.md${NC}"
fi
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "==============================="
