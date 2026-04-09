# Panduan Deploy SIMASET di VPS Ubuntu

Panduan lengkap instalasi dan deploy aplikasi SIMASET (Sistem Manajemen Aset) di VPS Ubuntu 22.04/24.04 LTS.

**Spesifikasi minimum VPS:** 1 vCPU, 1GB RAM, 20GB SSD

---

## Daftar Isi

1. [Initial Server Setup & Security](#1-initial-server-setup--security)
2. [Install Dependencies](#2-install-dependencies)
3. [Setup PostgreSQL](#3-setup-postgresql)
4. [Setup Nginx](#4-setup-nginx)
5. [Deploy Aplikasi](#5-deploy-aplikasi)
6. [Konfigurasi Laravel](#6-konfigurasi-laravel)
7. [SSL Certificate (HTTPS)](#7-ssl-certificate-https)
8. [Setup Queue Worker & Scheduler](#8-setup-queue-worker--scheduler)
9. [Setup Backup Otomatis](#9-setup-backup-otomatis)
10. [Hardening & Monitoring](#10-hardening--monitoring)
11. [Maintenance & Update](#11-maintenance--update)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Initial Server Setup & Security

### 1.1. Login sebagai root

```bash
ssh root@103.127.139.87
```

### 1.2. Update sistem

```bash
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.3. Buat user sudo `ardhian`

```bash
adduser ardhian
usermod -aG sudo ardhian
```

### 1.4. Setup SSH key authentication

Di **komputer lokal** (bukan server):

```bash
# Generate SSH key jika belum punya
ssh-keygen -t ed25519 -C "ardhian@simaset"

# Copy public key ke server
ssh-copy-id -p 22 ardhian@103.127.139.87
```

### 1.5. Konfigurasi SSH (port 22797 + hardening)

Di **server** sebagai root:

```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
nano /etc/ssh/sshd_config
```

Ubah/tambahkan baris berikut:

```
Port 22797
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowUsers ardhian
```

Test config lalu restart:

```bash
sshd -t
systemctl restart sshd
```

> **PENTING:** Jangan tutup session saat ini! Buka terminal baru dan test login:
> ```bash
> ssh -p 22797 ardhian@103.127.139.87
> ```
> Pastikan berhasil sebelum menutup session root.

### 1.6. Setup Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22797/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
```

### 1.7. Install Fail2Ban

```bash
sudo apt install -y fail2ban
sudo nano /etc/fail2ban/jail.local
```

Isi dengan:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
banaction = ufw

[sshd]
enabled = true
port = 22797
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 1.8. Disable unused services

```bash
# Nonaktifkan IPv6 jika tidak dibutuhkan
sudo nano /etc/sysctl.conf
```

Tambahkan:

```
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
```

```bash
sudo sysctl -p
```

### 1.9. Setup automatic security updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 1.10. Setup Swap Memory

> **PENTING:** Untuk VPS dengan RAM 1GB, swap sangat direkomendasikan agar proses `composer install` dan `npm run build` tidak gagal karena kehabisan memori (OOM killed).

```bash
# Cek apakah sudah ada swap
sudo swapon --show
free -h

# Buat swap file 2GB (2x RAM untuk VPS 1GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verifikasi
free -h
```

Agar swap aktif setelah reboot:

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Optimasi swappiness (agar swap hanya dipakai saat RAM benar-benar hampir penuh):

```bash
# Set swappiness rendah (default 60, kita pakai 10)
sudo sysctl vm.swappiness=10

# Permanen
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 2. Install Dependencies

### 2.1. PHP 8.4 + Extensions

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4-fpm php8.4-cli php8.4-common \
    php8.4-pgsql php8.4-mbstring php8.4-xml php8.4-bcmath \
    php8.4-curl php8.4-zip php8.4-gd php8.4-intl php8.4-readline \
    php8.4-opcache php8.4-tokenizer
```

Verifikasi:

```bash
php -v
php -m | grep -E "pgsql|mbstring|xml|gd|zip|intl|bcmath|curl"
```

### 2.2. Konfigurasi PHP-FPM

```bash
sudo nano /etc/php/8.4/fpm/pool.d/www.conf
```

Ubah:

```ini
user = ardhian
group = ardhian
listen.owner = ardhian
listen.group = ardhian

pm = dynamic
pm.max_children = 10
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 5
pm.max_requests = 500
```

```bash
sudo nano /etc/php/8.4/fpm/php.ini
```

Ubah:

```ini
upload_max_filesize = 10M
post_max_size = 12M
memory_limit = 256M
max_execution_time = 60
max_input_vars = 5000
date.timezone = Asia/Jakarta

; OPcache
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 0
opcache.revalidate_freq = 0
```

> **Catatan:** `opcache.validate_timestamps = 0` artinya PHP tidak auto-detect perubahan file. Setelah deploy harus jalankan `php artisan opcache:clear` atau restart PHP-FPM.

```bash
sudo systemctl restart php8.4-fpm
```

### 2.3. Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 2.4. Node.js 22 LTS (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 2.5. Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## 3. Setup PostgreSQL

### 3.1. Install PostgreSQL 16

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-client-16
```

### 3.2. Buat database dan user

```bash
sudo -u postgres psql
```

```sql
CREATE USER simaset WITH PASSWORD 'GANTI_PASSWORD_YANG_KUAT';
CREATE DATABASE simaset OWNER simaset;
GRANT ALL PRIVILEGES ON DATABASE simaset TO simaset;
\q
```

> **PENTING:** Ganti `GANTI_PASSWORD_YANG_KUAT` dengan password yang benar-benar kuat (minimal 20 karakter, campuran huruf besar/kecil, angka, simbol). Simpan password ini di tempat aman.

### 3.3. Hardening PostgreSQL

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Pastikan koneksi lokal menggunakan `scram-sha-256`:

```
# IPv4 local connections:
host    simaset    simaset    127.0.0.1/32    scram-sha-256
```

```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Ubah:

```ini
listen_addresses = 'localhost'
port = 5432
max_connections = 50
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB
log_statement = 'ddl'
log_connections = on
log_disconnections = on
```

```bash
sudo systemctl restart postgresql
```

Verifikasi koneksi:

```bash
psql -h 127.0.0.1 -U simaset -d simaset -c "SELECT version();"
```

---

## 4. Setup Nginx

### 4.1. Buat konfigurasi site

```bash
sudo nano /etc/nginx/sites-available/simaset
```

> **Catatan:** Panduan ini menggunakan IP address tanpa domain. Ganti `103.127.139.87` dengan IP publik VPS Anda.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 103.127.139.87;  # Ganti dengan IP publik VPS

    # Redirect semua HTTP ke HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 103.127.139.87;  # Ganti dengan IP publik VPS

    # SSL (self-signed, akan dikonfigurasi di bagian 7)
    ssl_certificate /etc/ssl/simaset/simaset.crt;
    ssl_certificate_key /etc/ssl/simaset/simaset.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    root /var/www/simaset/public;
    index index.php;

    charset utf-8;
    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_vary on;
    gzip_min_length 1024;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;

        # Timeout
        fastcgi_read_timeout 60;
        fastcgi_send_timeout 60;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to sensitive files
    location ~* \.(env|log|sql|bak|conf|ini|sh)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 4.2. Aktifkan site

```bash
sudo ln -s /etc/nginx/sites-available/simaset /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

> **Catatan:** Jangan reload Nginx dulu. SSL certificate belum dibuat, Nginx akan error. Lanjut ke [bagian 7](#7-ssl-certificate-https) setelah deploy aplikasi untuk generate certificate, baru kemudian `sudo nginx -t && sudo systemctl reload nginx`.

### 4.3. Hardening Nginx global

```bash
sudo nano /etc/nginx/nginx.conf
```

Di dalam block `http { }`, tambahkan/ubah:

```nginx
# Hide nginx version
server_tokens off;

# Limit request body size
client_max_body_size 10M;

# Timeouts
client_body_timeout 12;
client_header_timeout 12;
send_timeout 10;
keepalive_timeout 15;

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
```

---

## 5. Deploy Aplikasi

### 5.1. Buat direktori dan set ownership

```bash
sudo mkdir -p /var/www/simaset
sudo chown ardhian:ardhian /var/www/simaset
```

### 5.2. Transfer file dari lokal ke server

Dari **komputer lokal**:

```bash
# Opsi A: rsync (recommended)
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='vendor' \
    --exclude='.env' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    -e "ssh -p 22797" \
    /Users/ardhianhanum/Projects/simaset/ \
    ardhian@103.127.139.87:/var/www/simaset/

# Opsi B: tar + scp
cd /Users/ardhianhanum/Projects/simaset
tar czf /tmp/simaset.tar.gz \
    --exclude='node_modules' \
    --exclude='vendor' \
    --exclude='.env' \
    .
scp -P 22797 /tmp/simaset.tar.gz ardhian@103.127.139.87:/var/www/simaset/
# Lalu di server:
cd /var/www/simaset && tar xzf simaset.tar.gz && rm simaset.tar.gz
```

### 5.3. Install dependencies di server

```bash
cd /var/www/simaset

# PHP dependencies (production)
composer install --no-dev --optimize-autoloader --no-interaction

# Node dependencies + build assets
npm ci
npm run build
```

### 5.4. Set permission

```bash
cd /var/www/simaset

# Ownership
sudo chown -R ardhian:ardhian .

# Directory permissions
find . -type d -exec chmod 755 {} \;

# File permissions
find . -type f -exec chmod 644 {} \;

# Storage & cache writable
chmod -R 775 storage bootstrap/cache
sudo chgrp -R ardhian storage bootstrap/cache
```

---

## 6. Konfigurasi Laravel

### 6.1. Setup .env

```bash
cd /var/www/simaset
cp .env.example .env
nano .env
```

```env
APP_NAME=SIMASET
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://103.127.139.87

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=simaset
DB_USERNAME=simaset
DB_PASSWORD=GANTI_PASSWORD_YANG_KUAT

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true

FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
```

### 6.2. Generate key dan migrasi

```bash
cd /var/www/simaset

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed data awal (roles, admin, settings)
php artisan db:seed --class=RoleSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan db:seed --class=SettingSeeder --force

# JANGAN jalankan DemoSeeder di production!
```

### 6.3. Optimasi Laravel untuk production

```bash
cd /var/www/simaset

# Cache config, routes, views
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Create storage link
php artisan storage:link
```

### 6.4. Verifikasi

```bash
# Test di terminal
php artisan about

# Cek koneksi database
php artisan tinker --execute="DB::connection()->getPdo(); echo 'DB OK';"
```

Buka browser: `https://103.127.139.87` — seharusnya sudah bisa diakses (accept warning SSL self-signed).

---

## 7. SSL Certificate (HTTPS)

Karena menggunakan IP tanpa domain, kita pakai **self-signed certificate**. Koneksi tetap terenkripsi, hanya browser akan tampilkan warning "Your connection is not private" saat pertama kali akses — klik **Advanced > Proceed** untuk melanjutkan.

> **Jika nanti sudah punya domain**, bisa langsung ganti ke Let's Encrypt (lihat [bagian 7.4](#74-upgrade-ke-lets-encrypt-jika-nanti-punya-domain)).

### 7.1. Generate self-signed certificate

```bash
# Buat direktori
sudo mkdir -p /etc/ssl/simaset

# Generate certificate (valid 10 tahun)
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/ssl/simaset/simaset.key \
    -out /etc/ssl/simaset/simaset.crt \
    -subj "/C=ID/ST=Indonesia/L=Jakarta/O=SIMASET/CN=103.127.139.87"
```

> Ganti `103.127.139.87` dengan IP publik VPS.

Set permission:

```bash
sudo chmod 600 /etc/ssl/simaset/simaset.key
sudo chmod 644 /etc/ssl/simaset/simaset.crt
```

### 7.2. Aktifkan Nginx

Sekarang certificate sudah ada, aktifkan Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7.3. Verifikasi HTTPS

Buka browser: `https://103.127.139.87`

- Browser akan tampilkan warning karena self-signed certificate
- Klik **Advanced** > **Proceed to 103.127.139.87 (unsafe)** / **Accept the Risk and Continue**
- Ini hanya warning tentang trust sertifikat, **koneksi tetap terenkripsi**
- Warning ini hanya muncul sekali per browser (setelah accept, tidak muncul lagi)

### 7.4. Upgrade ke Let's Encrypt (jika nanti punya domain)

Jika di kemudian hari sudah punya domain, bisa upgrade ke trusted certificate:

```bash
# 1. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Update Nginx server_name
sudo nano /etc/nginx/sites-available/simaset
# Ganti server_name dari IP ke domain, contoh:
#   server_name simaset.dinas.go.id;

# 3. Update .env
# APP_URL=https://simaset.dinas.go.id

# 4. Generate certificate
sudo certbot --nginx -d simaset.dinas.go.id

# 5. Rebuild cache
cd /var/www/simaset
php artisan config:cache

# 6. Verifikasi auto-renewal
sudo certbot renew --dry-run
```

### 7.5. Renew self-signed certificate (jika diperlukan)

Certificate berlaku 10 tahun. Jika perlu regenerate:

```bash
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/ssl/simaset/simaset.key \
    -out /etc/ssl/simaset/simaset.crt \
    -subj "/C=ID/ST=Indonesia/L=Jakarta/O=SIMASET/CN=103.127.139.87"

sudo systemctl reload nginx
```

---

## 8. Setup Queue Worker & Scheduler

### 8.1. Queue Worker (Supervisor)

```bash
sudo apt install -y supervisor
```

```bash
sudo nano /etc/supervisor/conf.d/simaset-worker.conf
```

```ini
[program:simaset-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/simaset/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=ardhian
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/simaset/storage/logs/worker.log
stdout_logfile_maxbytes=5MB
stdout_logfile_backups=3
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start simaset-worker:*
sudo supervisorctl status
```

### 8.2. Laravel Scheduler (Cron)

```bash
crontab -e
```

Tambahkan:

```
* * * * * cd /var/www/simaset && php artisan schedule:run >> /dev/null 2>&1
```

---

## 9. Setup Backup Otomatis

Aplikasi sudah menggunakan `spatie/laravel-backup`. Konfigurasi:

### 9.1. Buat direktori backup

```bash
mkdir -p /var/www/simaset/storage/app/backups
```

### 9.2. Verifikasi konfigurasi backup

```bash
cd /var/www/simaset
php artisan backup:run --only-db
php artisan backup:list
```

### 9.3. Schedule backup harian

Pastikan di `app/Console/Kernel.php` atau `routes/console.php` sudah ada schedule backup. Jika belum, tambahkan di `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:run --only-db')->dailyAt('02:00');
Schedule::command('backup:clean')->dailyAt('03:00');
```

### 9.4. Backup off-site (opsional tapi recommended)

Copy backup ke lokasi lain secara berkala:

```bash
# Tambahkan ke crontab
0 4 * * * rsync -az /var/www/simaset/storage/app/backups/ /mnt/backup/simaset/
```

---

## 10. Hardening & Monitoring

### 10.1. Kernel security parameters

```bash
sudo nano /etc/sysctl.conf
```

Tambahkan:

```ini
# Prevent IP spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# SYN flood protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2

# Log Martians
net.ipv4.conf.all.log_martians = 1
```

```bash
sudo sysctl -p
```

### 10.2. Setup Logrotate untuk Laravel

```bash
sudo nano /etc/logrotate.d/simaset
```

```
/var/www/simaset/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
    su ardhian ardhian
}
```

### 10.3. Monitoring disk space

```bash
# Tambahkan ke crontab
0 8 * * * df -h / | awk 'NR==2 {if ($5+0 > 85) print "DISK WARNING: "$5" used on simaset server"}' | mail -s "SIMASET Disk Alert" admin@domain.com 2>/dev/null
```

Atau setup sederhana tanpa mail:

```bash
# Buat script monitoring
sudo nano /usr/local/bin/simaset-health-check.sh
```

```bash
#!/bin/bash
LOG="/var/log/simaset-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$DATE [ERROR] Nginx is down, restarting..." >> $LOG
    systemctl restart nginx
fi

# Check PHP-FPM
if ! systemctl is-active --quiet php8.4-fpm; then
    echo "$DATE [ERROR] PHP-FPM is down, restarting..." >> $LOG
    systemctl restart php8.4-fpm
fi

# Check PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    echo "$DATE [ERROR] PostgreSQL is down, restarting..." >> $LOG
    systemctl restart postgresql
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$DATE [WARNING] Disk usage is ${DISK_USAGE}%" >> $LOG
fi
```

```bash
sudo chmod +x /usr/local/bin/simaset-health-check.sh

# Jalankan setiap 5 menit
sudo crontab -e
# Tambahkan:
*/5 * * * * /usr/local/bin/simaset-health-check.sh
```

### 10.4. Nginx rate limiting untuk login

Update `/etc/nginx/sites-available/simaset`, tambahkan di dalam block `server { }`:

```nginx
    # Rate limit for login endpoint
    location = /login {
        limit_req zone=login burst=3 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }
```

---

## 11. Maintenance & Update

### 11.1. Script deploy update

Buat script untuk mempermudah deploy:

```bash
nano /var/www/simaset/deploy.sh
```

```bash
#!/bin/bash
set -e

APP_DIR="/var/www/simaset"
echo "=== SIMASET Deploy Script ==="
echo "$(date)"

cd $APP_DIR

# Maintenance mode
php artisan down --refresh=15

# Update files (sesuaikan dengan metode transfer Anda)
# Jika pakai rsync, jalankan dari lokal, bukan dari script ini

# Install dependencies
composer install --no-dev --optimize-autoloader --no-interaction
npm ci
npm run build

# Migrate database
php artisan migrate --force

# Clear & rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart services
sudo systemctl restart php8.4-fpm
sudo supervisorctl restart simaset-worker:*

# Keluar maintenance mode
php artisan up

echo "=== Deploy selesai ==="
```

```bash
chmod +x /var/www/simaset/deploy.sh
```

### 11.2. Proses deploy update

```bash
# 1. Transfer file dari lokal (jalankan di komputer lokal)
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='vendor' \
    --exclude='.env' \
    --exclude='storage/' \
    --exclude='bootstrap/cache/' \
    -e "ssh -p 22797" \
    /Users/ardhianhanum/Projects/simaset/ \
    ardhian@103.127.139.87:/var/www/simaset/

# 2. Jalankan deploy script di server
ssh -p 22797 ardhian@103.127.139.87 "cd /var/www/simaset && bash deploy.sh"
```

### 11.3. Rollback

Jika terjadi masalah setelah deploy:

```bash
# Restore database dari backup
php artisan backup:list
# Restore manual menggunakan pg_restore atau psql

# Kembalikan maintenance mode jika diperlukan
php artisan down --refresh=15

# Fix masalah, lalu:
php artisan up
```

---

## 12. Troubleshooting

### Masalah umum

| Masalah | Solusi |
|---------|--------|
| 502 Bad Gateway | `sudo systemctl restart php8.4-fpm` |
| 403 Forbidden | Cek permission: `ls -la /var/www/simaset/public/` |
| 500 Internal Server Error | Cek log: `tail -50 /var/www/simaset/storage/logs/laravel.log` |
| Halaman blank / asset tidak load | Pastikan `npm run build` sudah dijalankan |
| Session tidak tersimpan | Cek tabel `sessions` ada: `php artisan migrate:status` |
| Permission denied (storage) | `chmod -R 775 storage bootstrap/cache` |
| CSS/JS tidak update | `php artisan view:clear && npm run build` |

### Perintah cek status

```bash
# Status semua services
sudo systemctl status nginx
sudo systemctl status php8.4-fpm
sudo systemctl status postgresql
sudo supervisorctl status

# Laravel logs
tail -f /var/www/simaset/storage/logs/laravel.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.4-fpm.log

# Cek port yang listening
sudo ss -tlnp

# Cek disk space
df -h

# Cek memory
free -h
```

### Test koneksi database

```bash
cd /var/www/simaset
php artisan tinker --execute="
    try {
        DB::connection()->getPdo();
        echo 'Database: OK (' . DB::connection()->getDatabaseName() . ')\n';
        echo 'Tables: ' . count(DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'')) . '\n';
    } catch (\Exception \$e) {
        echo 'Error: ' . \$e->getMessage() . '\n';
    }
"
```

---

## Checklist Setelah Deploy

- [ ] Bisa login ke SSH via port 22797
- [ ] Root login disabled
- [ ] UFW aktif (hanya port 22797, 80, 443)
- [ ] Fail2Ban aktif
- [ ] Aplikasi bisa diakses di browser (`https://IP_SERVER`)
- [ ] HTTPS aktif (self-signed certificate, warning di-accept)
- [ ] Login admin berhasil (admin@simaset.local / password)
- [ ] **Segera ganti password admin default!**
- [ ] Upload & download file berfungsi
- [ ] Import Excel berfungsi
- [ ] Export PDF berfungsi
- [ ] Queue worker berjalan (`sudo supervisorctl status`)
- [ ] Cron scheduler berjalan
- [ ] Backup database berhasil (`php artisan backup:run --only-db`)
- [ ] `APP_DEBUG=false` di .env
- [ ] `APP_ENV=production` di .env
