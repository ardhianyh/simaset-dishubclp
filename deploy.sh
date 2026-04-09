#!/bin/bash
# ==============================================================
# SIMASET Deploy Script
# Jalankan dari komputer lokal: bash deploy.sh
# Mendukung initial deploy & update deploy
# ==============================================================
set -e

# --- Konfigurasi ---
SERVER_IP="103.127.139.87"
SERVER_USER="ardhian"
SSH_PORT="22797"
REMOTE_DIR="/var/www/simaset"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
PHP_FPM="php8.4-fpm"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "\n${GREEN}[STEP]${NC} $1"; }
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

# --- Maintenance mode ON (hanya jika bukan initial deploy) ---
if [ "$INITIAL_DEPLOY" = false ]; then
    step "Mengaktifkan maintenance mode"
    remote "cd ${REMOTE_DIR} && php artisan down --refresh=15"
    trap 'echo -e "\n${RED}Deploy gagal! Menonaktifkan maintenance mode...${NC}"; remote "cd ${REMOTE_DIR} && php artisan up" 2>/dev/null; exit 1' ERR
fi

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
    --exclude='storage/app/backups/*' \
    --exclude='storage/app/public/*' \
    --exclude='storage/app/documents/*' \
    --exclude='bootstrap/cache/*' \
    --exclude='public/hot' \
    --exclude='.git' \
    -e "ssh -p ${SSH_PORT}" \
    "${LOCAL_DIR}/" \
    "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"

# --- Remote: install, build, migrate, cache ---
step "Menjalankan deploy di server"
if [ "$INITIAL_DEPLOY" = true ]; then
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
else
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

        echo '>>> Menonaktifkan maintenance mode'
        php artisan up
    "
fi

# Clear trap
trap - ERR

echo ""
echo "==============================="
echo -e " ${GREEN}Deploy selesai!${NC}"
if [ "$INITIAL_DEPLOY" = true ]; then
    echo -e " ${YELLOW}Initial deploy — pastikan setup Nginx, SSL,"
    echo -e " Supervisor, dan Cron sesuai DEPLOYMENT.md${NC}"
fi
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "==============================="
