# PRD - SIMASET (Sistem Manajemen Aset)

> Aplikasi pengelolaan aset dinas untuk memudahkan petugas lapangan / PNS dalam mengelola inventaris barang milik daerah.

---

## 1. Latar Belakang

Pengelolaan aset dinas saat ini masih menggunakan metode manual (spreadsheet/dokumen fisik) yang rentan terhadap kesalahan, sulit dicari, dan tidak efisien. Diperlukan sistem digital yang mampu:

- Mencatat seluruh aset berdasarkan klasifikasi KIB (Kartu Inventaris Barang)
- Memberikan akses terbatas sesuai wilayah kerja petugas
- Menyediakan fitur pencarian dan visualisasi lokasi aset
- Menghasilkan laporan rekapitulasi sesuai format standar pemerintah

---

## 2. Tujuan Produk

1. Digitalisasi pencatatan aset dinas berdasarkan 6 jenis KIB (A, B, C, D, E, L)
2. Pembagian akses aset berdasarkan wilayah kerja petugas
3. Kemudahan pencarian dan visualisasi aset (tabel & peta interaktif)
4. Export laporan rekapitulasi KIB sesuai format standar pemerintah daerah
5. Penyimpanan dokumen pendukung aset (BAST, foto serah terima, dll)

---

## 3. User & Role

### 3.1. Admin
- Akses penuh ke seluruh fitur dan seluruh data aset (tanpa batasan wilayah)
- Mengelola data user (CRUD)
- Mengelola data wilayah (CRUD)
- Mengelola seluruh aset KIB A-L
- Assign aset ke wilayah manapun
- Assign staff ke wilayah
- Export rekapitulasi KIB

### 3.2. Staff
- Hanya dapat mengakses aset yang berada di wilayah yang terafiliasi dengannya
- Mengelola aset (CRUD) **hanya di wilayah afiliasinya**
- Saat membuat aset baru, pilihan wilayah dibatasi hanya wilayah yang terafiliasi
- Upload dokumen pendukung aset
- Export rekapitulasi KIB (hanya data di wilayahnya)

---

## 4. Modul & Fitur

### 4.1. Autentikasi
| Fitur | Deskripsi |
|---|---|
| Login | Login dengan username/email dan password |
| Logout | Keluar dari sistem |
| Session management | Menjaga sesi login tetap aktif |

### 4.2. Dashboard
| Fitur | Deskripsi |
|---|---|
| Ringkasan total aset | Jumlah aset per jenis KIB |
| Ringkasan nilai aset | Total nilai aset (Rp) per jenis KIB |
| Ringkasan per wilayah | Distribusi aset per wilayah |
| Peta overview | Peta Leaflet menampilkan sebaran lokasi aset (jika ada koordinat) |

### 4.3. Management KIB (Kartu Inventaris Barang)

Setiap KIB memiliki form input dan tabel rekapitulasi yang sesuai dengan kolom-kolom standar pemerintah. Fitur umum berlaku untuk semua jenis KIB:

#### Fitur Umum (berlaku untuk semua KIB):
| Fitur | Deskripsi |
|---|---|
| Tambah aset | Form input sesuai kolom masing-masing jenis KIB |
| Edit aset | Mengubah data aset yang sudah ada |
| Hapus aset | Menghapus data aset (soft delete, bisa di-restore) |
| Penanggung jawab | Setiap aset wajib memiliki nama penanggung jawab. NIP dan nomor telepon bersifat opsional |
| Upload dokumen | Upload file pendukung (BAST, foto serah terima, sertifikat, dll). Mendukung multi-file per aset |
| Assign wilayah | Aset di-assign ke satu wilayah |
| Export rekapitulasi | Export ke PDF dengan format sesuai template KIB standar pemerintah |

---

#### 4.3.1. KIB A - Tanah

**Kolom data:**

| No | Field | Tipe | Wajib |
|---|---|---|---|
| 1 | Jenis Barang / Nama Barang | Text | Ya |
| 2 | Kode Barang | Text (format: XX.XX.XX.XX.XXX) | Ya |
| 3 | Nomor Register | Text | Ya |
| 4 | Luas (M2) | Decimal | Ya |
| 5 | Tahun Pengadaan | Year | Ya |
| 6 | Letak/Alamat | Text | Ya |
| 7 | Hak Tanah | Enum (Hak Pakai, Hak Pengelolaan, Hak Milik, dll) | Tidak |
| 8 | Sertifikat - Tanggal | Date | Tidak |
| 9 | Sertifikat - Nomor | Text | Tidak |
| 10 | Penggunaan | Text | Tidak |
| 11 | Asal Usul | Enum (Pembelian, Hibah, Sumbangan, dll) | Ya |
| 12 | Harga (Rp) | Decimal | Ya |
| 13 | Keterangan | Text | Tidak |

**Format Export:** Tabel landscape dengan header instansi, footer tanda tangan Kepala Dinas & Petugas Pengurus Barang, serta total harga.

---

#### 4.3.2. KIB B - Peralatan dan Mesin

**Kolom data:**

| No | Field | Tipe | Wajib |
|---|---|---|---|
| 1 | Jenis Barang / Nama Barang | Text | Ya |
| 2 | Kode Barang | Text (format: XX.XX.XX.XX.XXX) | Ya |
| 3 | Nomor Register | Text | Ya |
| 4 | Merk/Type | Text | Tidak |
| 5 | Ukuran/CC | Text | Tidak |
| 6 | Bahan | Text | Tidak |
| 7 | Tahun Pembelian | Year | Ya |
| 8 | Nomor Pabrik | Text | Tidak |
| 9 | Nomor Rangka | Text | Tidak |
| 10 | Nomor Mesin | Text | Tidak |
| 11 | Nomor Polisi | Text | Tidak |
| 12 | Nomor BPKB | Text | Tidak |
| 13 | Asal Usul | Enum (Pembelian, Hibah, dll) | Ya |
| 14 | Harga (Rp) | Decimal | Ya |
| 15 | Keterangan | Text | Tidak |

**Format Export:** Tabel landscape dengan kolom nomor kendaraan/mesin, header instansi, footer tanda tangan & total harga.

---

#### 4.3.3. KIB C - Gedung dan Bangunan

**Kolom data:**

| No | Field | Tipe | Wajib |
|---|---|---|---|
| 1 | Jenis Barang / Nama Barang | Text | Ya |
| 2 | Kode Barang | Text | Ya |
| 3 | Nomor Register | Text | Ya |
| 4 | Kondisi | Enum (Baik, Kurang Baik, Rusak Berat) | Ya |
| 5 | Bangunan Bertingkat | Boolean (Ya/Tidak) | Ya |
| 6 | Konstruksi Beton | Boolean (Beton/Tidak) | Ya |
| 7 | Luas Lantai (M2) | Decimal | Tidak |
| 8 | Letak/Lokasi Alamat | Text | Ya |
| 9 | Dokumen Gedung - Tanggal | Date | Tidak |
| 10 | Dokumen Gedung - Nomor | Text | Tidak |
| 11 | Status Tanah | Enum (Tanah Milik Pemda, Tanah Milik Negara, dll) | Tidak |
| 12 | Nomor Kode Tanah | Text | Tidak |
| 13 | Asal Usul | Enum | Ya |
| 14 | Harga (Rp) | Decimal | Ya |
| 15 | Keterangan | Text | Tidak |

**Format Export:** Tabel landscape multi-halaman dengan kolom konstruksi, dokumen gedung, dan status tanah.

---

#### 4.3.4. KIB D - Jalan, Irigasi, dan Jaringan

**Kolom data:**

| No | Field | Tipe | Wajib |
|---|---|---|---|
| 1 | Jenis Barang / Nama Barang | Text | Ya |
| 2 | Kode Barang | Text | Ya |
| 3 | Nomor Register | Text | Ya |
| 4 | Konstruksi | Text | Tidak |
| 5 | Panjang (Km) | Decimal | Tidak |
| 6 | Lebar (M) | Decimal | Tidak |
| 7 | Luas (M2) | Decimal | Tidak |
| 8 | Letak/Lokasi Alamat | Text | Ya |
| 9 | Dokumen - Tanggal | Date | Tidak |
| 10 | Dokumen - Nomor | Text | Tidak |
| 11 | Status Tanah | Enum | Tidak |
| 12 | Nomor Kode Tanah | Text | Tidak |
| 13 | Asal Usul | Enum | Ya |
| 14 | Harga (Rp) | Decimal | Ya |
| 15 | Kondisi | Enum (Baik, Kurang Baik, Rusak Berat) | Tidak |
| 16 | Keterangan | Text | Tidak |

**Format Export:** Tabel landscape dengan dimensi infrastruktur (panjang, lebar, luas).

---

#### 4.3.5. KIB E - Aset Tetap Lainnya

**Kolom data:**

| No | Field | Tipe | Wajib |
|---|---|---|---|
| 1 | Jenis Barang / Nama Barang | Text | Ya |
| 2 | Kode Barang | Text | Ya |
| 3 | Nomor Register | Text | Ya |
| 4 | Judul/Pencipta (Buku/Perpustakaan) | Text | Tidak |
| 5 | Spesifikasi (Buku/Perpustakaan) | Text | Tidak |
| 6 | Asal Daerah (Kesenian/Kebudayaan) | Text | Tidak |
| 7 | Pencipta (Kesenian/Kebudayaan) | Text | Tidak |
| 8 | Bahan (Kesenian/Kebudayaan) | Text | Tidak |
| 9 | Jenis (Hewan/Tumbuhan) | Text | Tidak |
| 10 | Ukuran (Hewan/Tumbuhan) | Text | Tidak |
| 11 | Jumlah | Integer | Ya |
| 12 | Tahun Cetak/Pembelian | Year | Ya |
| 13 | Asal Usul | Enum | Ya |
| 14 | Harga (Rp) | Decimal | Ya |
| 15 | Keterangan | Text | Tidak |

**Catatan:** KIB E memiliki kolom yang bersifat kategorikal. Tidak semua kolom relevan untuk semua jenis barang. Field akan ditampilkan secara kondisional berdasarkan sub-kategori barang.

**Format Export:** Tabel landscape dengan 3 grup kolom (Buku, Kesenian, Hewan/Tumbuhan).

---

#### 4.3.6. KIB L - Aset Lainnya (Aset Tak Berwujud)

**Kolom data:**

| No | Field | Tipe | Wajib |
|---|---|---|---|
| 1 | Jenis Barang / Nama Barang | Text | Ya |
| 2 | Kode Barang | Text (format: X.X.XX.XXX.XXX.XXX) | Ya |
| 3 | Nomor Register | Text | Ya |
| 4 | Tahun Pengadaan | Year | Ya |
| 5 | Judul/Nama | Text | Tidak |
| 6 | Pencipta | Text | Tidak |
| 7 | Spesifikasi | Text | Tidak |
| 8 | Kondisi | Text | Tidak |
| 9 | Asal Usul | Enum | Ya |
| 10 | Harga (Rp) | Decimal | Ya |
| 11 | Keterangan | Text | Tidak |

**Format Export:** Tabel landscape, terutama berisi aset intangible (lisensi, software, kajian).

---

### 4.4. Management Wilayah

| Fitur | Deskripsi |
|---|---|
| Tambah wilayah | Membuat wilayah baru (nama, deskripsi) |
| Edit wilayah | Mengubah data wilayah |
| Hapus wilayah | Menghapus wilayah (dengan validasi jika masih ada aset/staff terkait) |
| Assign staff ke wilayah | Menambahkan satu atau lebih staff ke wilayah tertentu |
| Lihat daftar aset per wilayah | Melihat seluruh aset yang ter-assign di wilayah tersebut |
| Lihat staff per wilayah | Melihat staff yang terafiliasi dengan wilayah |

**Aturan bisnis:**
- Satu wilayah bisa memiliki banyak staff (many-to-many)
- Satu staff bisa terafiliasi ke banyak wilayah (many-to-many)
- Satu aset hanya di-assign ke satu wilayah (many-to-one)
- Admin: bisa membuat aset dan assign ke wilayah manapun
- Staff: saat membuat aset, hanya muncul pilihan wilayah yang terafiliasi dengannya
- Staff: hanya bisa melihat/mengelola aset yang ada di wilayah afiliasinya

---

### 4.5. Management User

> Hanya dapat diakses oleh role **Admin**

| Fitur | Deskripsi |
|---|---|
| Tambah user | Membuat user baru dengan role Admin atau Staff |
| Edit user | Mengubah data user (nama, email, password, role) |
| Hapus user | Menonaktifkan/menghapus user |
| Lihat daftar user | Menampilkan semua user beserta role dan wilayah afiliasinya |
| Assign wilayah | Mengatur wilayah afiliasi untuk user Staff |

**Data user:**
- Nama lengkap
- NIP (opsional)
- Email / Username
- Password (hashed)
- Role (Admin / Staff)
- Nomor Telepon (opsional)
- Status aktif/nonaktif

---

### 4.6. Pencarian & Visualisasi Aset

| Fitur | Deskripsi |
|---|---|
| Search by wilayah | Filter aset berdasarkan wilayah |
| Search by penanggung jawab | Filter aset berdasarkan nama penanggung jawab |
| Search by lokasi | Filter aset berdasarkan alamat/lokasi teks |
| Search by jenis KIB | Filter berdasarkan tipe KIB (A/B/C/D/E/L) |
| Search global | Pencarian teks bebas di seluruh field |
| Tampilan tabel | Hasil pencarian ditampilkan dalam tabel interaktif (sortable, paginated) |
| Tampilan peta (Leaflet) | Aset yang memiliki koordinat ditampilkan sebagai marker di peta interaktif |
| Detail popup pada peta | Klik marker untuk melihat ringkasan data aset |
| Cluster markers | Pengelompokan marker jika banyak aset berdekatan |

**Catatan koordinat:** Perlu ditambahkan field **latitude** dan **longitude** (opsional) pada setiap aset agar bisa ditampilkan di peta. Field ini bersifat opsional karena tidak semua aset memiliki koordinat lokasi.

---

### 4.7. Upload Dokumen Pendukung

| Fitur | Deskripsi |
|---|---|
| Upload file | Upload satu atau lebih file per aset (PDF, gambar, dll) |
| Jenis dokumen | Label/kategori dokumen (BAST, Foto Serah Terima, Sertifikat, Lainnya) |
| Preview dokumen | Preview file yang sudah di-upload |
| Download dokumen | Download file dokumen |
| Hapus dokumen | Menghapus file dokumen yang sudah di-upload |

**Batasan:**
- Format file: PDF, JPG, JPEG, PNG, DOC, DOCX
- Maksimal ukuran per file: 10MB (configurable)
- Tidak ada batasan jumlah file per aset

---

### 4.8. Export & Laporan

| Fitur | Deskripsi |
|---|---|
| Export per jenis KIB | Generate PDF rekapitulasi per jenis KIB |
| Format sesuai standar | Layout sesuai template PDF yang diberikan (landscape, header instansi, kolom standar, footer tanda tangan) |
| Filter export | Export bisa difilter berdasarkan wilayah, periode, dll |
| Header dinamis | Nama instansi, bidang, unit organisasi, kode lokasi bisa dikonfigurasi |
| Footer tanda tangan | Nama & NIP Kepala Dinas dan Petugas Pengurus Barang bisa dikonfigurasi |

**Struktur Export:**
```
┌────────────────────────────────────────────────────┐
│              PEMERINTAH KABUPATEN XXXXX             │
│      REKAPITULASI KARTU INVENTARIS BARANG (KIB) X   │
│                    [JENIS KIB]                      │
├────────────────────────────────────────────────────┤
│ Provinsi          : ...                             │
│ Kab./Kota         : ...                             │
│ Bidang            : ...                             │
│ Unit Organisasi   : ...                             │
│ Sub Unit Organisasi: ...                            │
│ No. Kode Lokasi   : ...                             │
├────────────────────────────────────────────────────┤
│            [TABEL DATA ASET PER KOLOM KIB]          │
├────────────────────────────────────────────────────┤
│                              Jumlah Harga: Rp XXXX  │
│                                                      │
│ MENGETAHUI                    [Kota], [Tanggal]      │
│ KEPALA DINAS                  PETUGAS PENGURUS BARANG│
│                                                      │
│ [Nama]                        [Nama]                 │
│ NIP. [NIP]                    NIP. [NIP]             │
└────────────────────────────────────────────────────┘
```

---

## 5. Informasi Tambahan per Aset (Cross-KIB)

Selain kolom spesifik masing-masing KIB, setiap record aset juga menyimpan:

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| Penanggung Jawab - Nama | Text | Ya | Nama penanggung jawab aset |
| Penanggung Jawab - NIP | Text | Tidak | NIP penanggung jawab |
| Penanggung Jawab - No. Telp | Text | Tidak | Nomor telepon penanggung jawab |
| Wilayah | Relation (many-to-one) | Tidak | Wilayah tempat aset di-assign (1 aset = 1 wilayah) |
| Koordinat - Latitude | Decimal | Tidak | Untuk tampilan peta |
| Koordinat - Longitude | Decimal | Tidak | Untuk tampilan peta |
| Dokumen Pendukung | File[] | Tidak | File-file pendukung (BAST, foto, dll) |
| Dibuat oleh | User (auto) | Ya | User yang membuat record |
| Diubah oleh | User (auto) | Ya | User yang terakhir mengubah |
| Tanggal dibuat | Timestamp (auto) | Ya | Timestamp pembuatan |
| Tanggal diubah | Timestamp (auto) | Ya | Timestamp perubahan terakhir |

---

## 6. Relasi Antar Entitas

```
┌──────────┐     many-to-many     ┌──────────┐
│   User   │◄────────────────────►│ Wilayah  │
│ (Staff)  │                      │          │
└──────────┘                      └────┬─────┘
                                       │
                                       │ one-to-many (1 wilayah → banyak aset)
                                       │
                                  ┌────▼─────┐
                                  │   Aset   │
                                  │(KIB A-L) │
                                  └────┬─────┘
                                       │
                                       │ one-to-many
                                       │
                                  ┌────▼─────┐
                                  │ Dokumen  │
                                  │Pendukung │
                                  └──────────┘
```

- **User ↔ Wilayah:** Many-to-many (satu staff bisa di banyak wilayah, satu wilayah bisa punya banyak staff)
- **Aset → Wilayah:** Many-to-one (satu aset hanya di satu wilayah, satu wilayah bisa punya banyak aset)
- **Aset → Dokumen:** One-to-many (satu aset bisa punya banyak dokumen pendukung)
- **Aset → User (PJ):** Penanggung jawab disimpan sebagai field di aset (bukan relasi ke tabel user, karena PJ bisa orang di luar sistem)

---

## 7. Aturan Bisnis & Akses

| Aturan | Deskripsi |
|---|---|
| Scope data Staff | Staff hanya bisa melihat & mengelola aset yang ada di wilayah afiliasinya |
| Pembuatan aset oleh Staff | Pilihan wilayah saat membuat aset dibatasi ke wilayah afiliasi staff tersebut |
| Pembuatan aset oleh Admin | Admin bisa memilih semua wilayah yang tersedia |
| Hapus wilayah | Tidak bisa dihapus jika masih ada aset atau staff yang terafiliasi (atau tampilkan konfirmasi) |
| Soft delete aset | Aset yang dihapus tidak langsung hilang, bisa di-restore |
| Audit trail | Setiap perubahan data aset tercatat (siapa, kapan) |

---

## 8. Halaman / Screen List

| No | Halaman | Akses |
|---|---|---|
| 1 | Login | Public |
| 2 | Dashboard | Admin, Staff |
| 3 | Daftar Aset KIB A (Tanah) | Admin, Staff (filtered) |
| 4 | Daftar Aset KIB B (Peralatan & Mesin) | Admin, Staff (filtered) |
| 5 | Daftar Aset KIB C (Gedung & Bangunan) | Admin, Staff (filtered) |
| 6 | Daftar Aset KIB D (Jalan, Irigasi, Jaringan) | Admin, Staff (filtered) |
| 7 | Daftar Aset KIB E (Aset Tetap Lainnya) | Admin, Staff (filtered) |
| 8 | Daftar Aset KIB L (Aset Lainnya) | Admin, Staff (filtered) |
| 9 | Form Tambah/Edit Aset (per jenis KIB) | Admin, Staff |
| 10 | Detail Aset + Dokumen Pendukung | Admin, Staff (filtered) |
| 11 | Pencarian Aset (Tabel) | Admin, Staff (filtered) |
| 12 | Pencarian Aset (Peta/Leaflet) | Admin, Staff (filtered) |
| 13 | Management Wilayah | Admin |
| 14 | Management User | Admin |
| 15 | Pengaturan Instansi (header/footer export) | Admin |

---

## 9. Tech Stack

| Layer | Teknologi |
|---|---|
| **Database** | PostgreSQL |
| **Backend** | Laravel 11 (PHP) |
| **Frontend Bridge** | Inertia.js |
| **Frontend** | React + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Peta Interaktif** | Leaflet.js (react-leaflet) |
| **PDF Export** | DomPDF / Snappy (wkhtmltopdf) |
| **RBAC** | Spatie Laravel Permission |
| **File Upload** | Laravel Storage (local, migrasi ke S3 jika diperlukan) |
| **Auth Scaffold** | Laravel Breeze (Inertia + React) |

---

## 10. Keamanan Aplikasi

### 10.1. Autentikasi

| Aspek | Implementasi |
|---|---|
| Password hashing | Bcrypt (default Laravel) — password tidak pernah disimpan dalam bentuk plain text |
| Rate limiting login | Maksimal 5 percobaan login gagal per menit per IP. Setelah itu akun terkunci sementara (throttle) |
| Session management | Session server-side dengan expiry (idle timeout). Session dihancurkan saat logout |
| Session single device | (Opsional) Hanya satu sesi aktif per user, login dari device lain akan menghapus sesi sebelumnya |
| Password policy | Minimal 8 karakter, kombinasi huruf dan angka |

### 10.2. Otorisasi & Akses Data

| Aspek | Implementasi |
|---|---|
| RBAC | Role-based access control menggunakan Spatie Laravel Permission (Admin, Staff) |
| Laravel Policy | Setiap model aset memiliki Policy class untuk memvalidasi hak akses (view, create, update, delete) |
| Wilayah scoping | Query aset untuk Staff otomatis di-filter berdasarkan wilayah afiliasi melalui Laravel Global Scope |
| Route middleware | Semua route dilindungi middleware `auth` dan `role` — tidak ada endpoint yang bisa diakses tanpa login |
| Menu & UI filtering | Menu dan tombol aksi di frontend disembunyikan berdasarkan role (tetap di-enforce di backend) |

### 10.3. Perlindungan Input & Request

| Aspek | Implementasi |
|---|---|
| CSRF protection | Token CSRF otomatis di setiap form (built-in Laravel + Inertia) |
| SQL injection | Dicegah melalui Eloquent ORM (parameterized queries) — tidak menggunakan raw query |
| XSS prevention | Output escaping otomatis di React. Data dari user di-sanitize sebelum disimpan |
| Mass assignment | Hanya field yang di-whitelist via `$fillable` yang bisa diisi — mencegah manipulasi field berbahaya |
| Request validation | Semua input divalidasi server-side menggunakan Laravel Form Request sebelum diproses |
| File upload validation | Validasi tipe file (whitelist: PDF, JPG, PNG, DOC, DOCX), ukuran maksimal, dan pemeriksaan MIME type asli (bukan hanya ekstensi) |

### 10.4. Keamanan File & Dokumen

| Aspek | Implementasi |
|---|---|
| Private storage | File dokumen disimpan di luar direktori `public/` — tidak bisa diakses langsung via URL |
| Authorized download | Download file hanya melalui route yang ter-autentikasi dan terotorisasi (cek hak akses ke aset terkait) |
| Nama file aman | File yang di-upload di-rename menggunakan UUID/hash untuk mencegah path traversal dan overwrite |
| Validasi MIME type | Mengecek MIME type asli file (bukan hanya ekstensi) untuk mencegah upload file berbahaya |

### 10.5. Audit Trail & Logging

| Aspek | Implementasi |
|---|---|
| Activity log | Setiap operasi CRUD pada aset dicatat (siapa, kapan, aksi apa, data sebelum & sesudah perubahan) menggunakan Spatie Activity Log |
| Auth log | Mencatat login, logout, dan percobaan login gagal beserta IP address dan user agent |
| Soft delete tracking | Aset yang dihapus tercatat siapa yang menghapus dan kapan — bisa di-restore oleh Admin |

### 10.6. Keamanan Transport & Infrastruktur

| Aspek | Implementasi |
|---|---|
| HTTPS enforcement | Seluruh traffic wajib melalui HTTPS (redirect HTTP → HTTPS) |
| Security headers | Header keamanan: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Content-Security-Policy` |
| CORS policy | Hanya origin yang diizinkan yang bisa mengakses aplikasi |
| Environment variables | Kredensial (DB password, app key, dll) disimpan di `.env` — tidak pernah di-commit ke repository |
| APP_DEBUG | Mode debug dimatikan di production (`APP_DEBUG=false`) untuk mencegah leak informasi sensitif |

### 10.7. Backup & Recovery

| Aspek | Implementasi |
|---|---|
| Database backup | Backup otomatis berkala (harian) menggunakan Laravel Backup (spatie/laravel-backup) |
| File backup | Dokumen pendukung ikut di-backup bersama database |
| Restore capability | Prosedur restore yang terdokumentasi untuk disaster recovery |

---

## 11. Desain Database

### Strategi: Base Table + Detail Tables

Karena 6 jenis KIB memiliki kolom yang sangat berbeda, digunakan pola **base table + detail table**:
- Tabel `assets` menyimpan field-field yang **sama di semua KIB** (nama barang, kode, harga, wilayah, penanggung jawab, koordinat, dll)
- Masing-masing KIB memiliki **detail table** tersendiri untuk kolom spesifik (`kib_a_details`, `kib_b_details`, dst)
- Pencarian lintas KIB cukup query di tabel `assets`
- Export per KIB tinggal join `assets` + detail table yang relevan

### 11.1. Tabel `users`

```
users
├── id                  BIGINT PK AUTO
├── nama                VARCHAR(255) NOT NULL
├── nip                 VARCHAR(50) NULL
├── email               VARCHAR(255) UNIQUE NOT NULL
├── password            VARCHAR(255) NOT NULL
├── role                ENUM('admin','staff') NOT NULL DEFAULT 'staff'
├── telepon             VARCHAR(20) NULL
├── is_active           BOOLEAN DEFAULT true
├── remember_token      VARCHAR(100) NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.2. Tabel `wilayahs`

```
wilayahs
├── id                  BIGINT PK AUTO
├── nama                VARCHAR(255) NOT NULL
├── deskripsi           TEXT NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.3. Tabel `user_wilayah` (Pivot)

```
user_wilayah
├── id                  BIGINT PK AUTO
├── user_id             BIGINT FK -> users.id ON DELETE CASCADE
├── wilayah_id          BIGINT FK -> wilayahs.id ON DELETE CASCADE
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
UNIQUE(user_id, wilayah_id)
```

### 11.4. Tabel `assets` (Base Table)

```
assets
├── id                  BIGINT PK AUTO
├── kib_type            ENUM('A','B','C','D','E','L') NOT NULL
├── nama_barang         VARCHAR(500) NOT NULL
├── kode_barang         VARCHAR(50) NOT NULL
├── nomor_register      VARCHAR(50) NOT NULL
├── wilayah_id          BIGINT FK -> wilayahs.id NULL ON DELETE SET NULL
├── pj_nama             VARCHAR(255) NOT NULL
├── pj_nip              VARCHAR(50) NULL
├── pj_telepon          VARCHAR(20) NULL
├── latitude            DECIMAL(10,8) NULL
├── longitude           DECIMAL(11,8) NULL
├── asal_usul           ENUM('Pembelian','Hibah','Sumbangan','Tukar Menukar','Lainnya') NOT NULL
├── harga               DECIMAL(15,2) NOT NULL DEFAULT 0
├── keterangan          TEXT NULL
├── created_by          BIGINT FK -> users.id NULL
├── updated_by          BIGINT FK -> users.id NULL
├── deleted_at          TIMESTAMP NULL (soft delete)
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP

INDEX(kib_type)
INDEX(wilayah_id)
INDEX(kode_barang)
INDEX(pj_nama)
INDEX(deleted_at)
```

### 11.5. Tabel `kib_a_details` (Tanah)

```
kib_a_details
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE UNIQUE
├── luas_m2             DECIMAL(12,2) NOT NULL
├── tahun_pengadaan     SMALLINT NOT NULL
├── alamat              TEXT NOT NULL
├── hak_tanah           VARCHAR(100) NULL          -- Hak Pakai, Hak Pengelolaan, dll
├── sertifikat_tanggal  DATE NULL
├── sertifikat_nomor    VARCHAR(100) NULL
├── penggunaan          VARCHAR(255) NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.6. Tabel `kib_b_details` (Peralatan & Mesin)

```
kib_b_details
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE UNIQUE
├── merk_type           VARCHAR(255) NULL
├── ukuran_cc           VARCHAR(100) NULL
├── bahan               VARCHAR(100) NULL
├── tahun_pembelian     SMALLINT NOT NULL
├── nomor_pabrik        VARCHAR(100) NULL
├── nomor_rangka        VARCHAR(100) NULL
├── nomor_mesin         VARCHAR(100) NULL
├── nomor_polisi        VARCHAR(20) NULL
├── nomor_bpkb          VARCHAR(100) NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.7. Tabel `kib_c_details` (Gedung & Bangunan)

```
kib_c_details
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE UNIQUE
├── kondisi             ENUM('Baik','Kurang Baik','Rusak Berat') NOT NULL
├── bertingkat          BOOLEAN NOT NULL DEFAULT false
├── beton               BOOLEAN NOT NULL DEFAULT false
├── luas_lantai_m2      DECIMAL(12,2) NULL
├── alamat              TEXT NOT NULL
├── dokumen_tanggal     DATE NULL
├── dokumen_nomor       VARCHAR(255) NULL
├── status_tanah        VARCHAR(100) NULL          -- Tanah Milik Pemda, Tanah Milik Negara, dll
├── nomor_kode_tanah    VARCHAR(100) NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.8. Tabel `kib_d_details` (Jalan, Irigasi, Jaringan)

```
kib_d_details
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE UNIQUE
├── konstruksi          VARCHAR(255) NULL
├── panjang_km          DECIMAL(10,3) NULL
├── lebar_m             DECIMAL(10,3) NULL
├── luas_m2             DECIMAL(12,2) NULL
├── alamat              TEXT NOT NULL
├── dokumen_tanggal     DATE NULL
├── dokumen_nomor       VARCHAR(255) NULL
├── status_tanah        VARCHAR(100) NULL
├── nomor_kode_tanah    VARCHAR(100) NULL
├── kondisi             ENUM('Baik','Kurang Baik','Rusak Berat') NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.9. Tabel `kib_e_details` (Aset Tetap Lainnya)

```
kib_e_details
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE UNIQUE
├── judul_pencipta      VARCHAR(255) NULL          -- Buku/Perpustakaan
├── spesifikasi         TEXT NULL                   -- Buku/Perpustakaan
├── asal_daerah         VARCHAR(255) NULL          -- Kesenian/Kebudayaan
├── pencipta            VARCHAR(255) NULL          -- Kesenian/Kebudayaan
├── bahan               VARCHAR(255) NULL          -- Kesenian/Kebudayaan
├── jenis               VARCHAR(255) NULL          -- Hewan/Tumbuhan
├── ukuran              VARCHAR(255) NULL          -- Hewan/Tumbuhan
├── jumlah              INTEGER NOT NULL DEFAULT 1
├── tahun_cetak         SMALLINT NOT NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.10. Tabel `kib_l_details` (Aset Lainnya)

```
kib_l_details
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE UNIQUE
├── tahun_pengadaan     SMALLINT NOT NULL
├── judul_nama          VARCHAR(500) NULL
├── pencipta            VARCHAR(255) NULL
├── spesifikasi         TEXT NULL
├── kondisi             VARCHAR(100) NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

### 11.11. Tabel `asset_documents`

```
asset_documents
├── id                  BIGINT PK AUTO
├── asset_id            BIGINT FK -> assets.id ON DELETE CASCADE
├── jenis_dokumen       ENUM('BAST','Foto','Sertifikat','SK','Lainnya') NOT NULL
├── nama_asli           VARCHAR(255) NOT NULL      -- nama file asli dari user
├── nama_file           VARCHAR(255) NOT NULL      -- nama file UUID di storage
├── path                VARCHAR(500) NOT NULL
├── ukuran_bytes        INTEGER NOT NULL
├── mime_type           VARCHAR(100) NOT NULL
├── uploaded_by         BIGINT FK -> users.id NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP

INDEX(asset_id)
```

### 11.12. Tabel `settings`

```
settings
├── id                  BIGINT PK AUTO
├── key                 VARCHAR(255) UNIQUE NOT NULL
├── value               TEXT NULL
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

**Default settings keys:**
```
instansi_nama           = "PEMERINTAH KABUPATEN ..."
instansi_provinsi       = "PROVINSI JAWA TENGAH"
instansi_kabkota        = "PEMERINTAH KABUPATEN ..."
instansi_bidang         = "Bidang ..."
instansi_unit           = "Dinas ..."
instansi_sub_unit       = "..."
instansi_kode_lokasi    = "XX.XX.XX.XX.XX.XX.XX"
ttd_kepala_nama         = "..."
ttd_kepala_nip          = "..."
ttd_pengurus_nama       = "..."
ttd_pengurus_nip        = "..."
ttd_kota                = "Cilacap"
```

### 11.13. ERD (Entity Relationship Diagram)

```
┌────────────┐        ┌──────────────┐        ┌────────────┐
│   users    │◄──M:N──►  user_wilayah │◄──M:N──►  wilayahs  │
│            │        └──────────────┘        │            │
│ id         │                                │ id         │
│ nama       │                                │ nama       │
│ email      │                                │ deskripsi  │
│ role       │                                └─────┬──────┘
│ ...        │                                      │
└──────┬─────┘                                      │ 1:N
       │                                            │
       │ created_by / updated_by              ┌─────▼──────┐
       └─────────────────────────────────────►│   assets    │
                                              │            │
                                              │ id         │
                                              │ kib_type   │
                                              │ nama_barang│
                                              │ kode_barang│
                                              │ harga      │
                                              │ pj_nama    │
                                              │ ...        │
                                              └──┬───┬─────┘
                                                 │   │
                          ┌──────────────────────┘   └──────────────────┐
                          │ 1:1                                         │ 1:N
                          ▼                                             ▼
              ┌───────────────────┐                         ┌──────────────────┐
              │  kib_[A-L]_details│                         │ asset_documents   │
              │                   │                         │                  │
              │ KIB A: tanah      │                         │ id               │
              │ KIB B: mesin      │                         │ asset_id         │
              │ KIB C: gedung     │                         │ jenis_dokumen    │
              │ KIB D: jalan      │                         │ nama_file        │
              │ KIB E: aset tetap │                         │ path             │
              │ KIB L: aset lain  │                         │ ...              │
              └───────────────────┘                         └──────────────────┘
```

---

## 12. Struktur Folder Project

```
simaset/
├── app/
│   ├── Enums/
│   │   ├── KibType.php                    # Enum: A, B, C, D, E, L
│   │   ├── UserRole.php                   # Enum: admin, staff
│   │   ├── AsalUsul.php                   # Enum: Pembelian, Hibah, dll
│   │   ├── Kondisi.php                    # Enum: Baik, Kurang Baik, Rusak Berat
│   │   └── JenisDokumen.php              # Enum: BAST, Foto, Sertifikat, dll
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                      # Login, Logout (dari Breeze)
│   │   │   ├── DashboardController.php
│   │   │   ├── Asset/
│   │   │   │   ├── KibAController.php     # CRUD KIB A
│   │   │   │   ├── KibBController.php     # CRUD KIB B
│   │   │   │   ├── KibCController.php     # CRUD KIB C
│   │   │   │   ├── KibDController.php     # CRUD KIB D
│   │   │   │   ├── KibEController.php     # CRUD KIB E
│   │   │   │   └── KibLController.php     # CRUD KIB L
│   │   │   ├── AssetDocumentController.php
│   │   │   ├── AssetSearchController.php  # Pencarian tabel & peta
│   │   │   ├── ExportController.php       # PDF export
│   │   │   ├── WilayahController.php
│   │   │   ├── UserController.php
│   │   │   └── SettingController.php
│   │   │
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php
│   │   │
│   │   └── Requests/
│   │       ├── Asset/
│   │       │   ├── StoreKibARequest.php
│   │       │   ├── UpdateKibARequest.php
│   │       │   └── ... (per KIB)
│   │       ├── StoreWilayahRequest.php
│   │       ├── StoreUserRequest.php
│   │       └── StoreDocumentRequest.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Wilayah.php
│   │   ├── Asset.php                      # Base model (soft delete, scopes)
│   │   ├── KibADetail.php
│   │   ├── KibBDetail.php
│   │   ├── KibCDetail.php
│   │   ├── KibDDetail.php
│   │   ├── KibEDetail.php
│   │   ├── KibLDetail.php
│   │   ├── AssetDocument.php
│   │   └── Setting.php
│   │
│   ├── Policies/
│   │   ├── AssetPolicy.php                # Cek akses CRUD + wilayah
│   │   ├── WilayahPolicy.php
│   │   └── UserPolicy.php
│   │
│   ├── Scopes/
│   │   └── WilayahScope.php               # Global scope: filter aset by wilayah staff
│   │
│   └── Services/
│       ├── AssetService.php               # Business logic CRUD aset
│       └── ExportService.php              # Logic generate PDF
│
├── database/
│   ├── migrations/
│   │   ├── 0001_create_users_table.php
│   │   ├── 0002_create_wilayahs_table.php
│   │   ├── 0003_create_user_wilayah_table.php
│   │   ├── 0004_create_assets_table.php
│   │   ├── 0005_create_kib_a_details_table.php
│   │   ├── 0006_create_kib_b_details_table.php
│   │   ├── 0007_create_kib_c_details_table.php
│   │   ├── 0008_create_kib_d_details_table.php
│   │   ├── 0009_create_kib_e_details_table.php
│   │   ├── 0010_create_kib_l_details_table.php
│   │   ├── 0011_create_asset_documents_table.php
│   │   ├── 0012_create_settings_table.php
│   │   └── 0013_create_activity_log_table.php   # Spatie Activity Log
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── AdminUserSeeder.php
│       ├── WilayahSeeder.php
│       └── SettingSeeder.php              # Default settings instansi
│
├── resources/
│   ├── js/
│   │   ├── app.tsx                        # Entry point Inertia
│   │   │
│   │   ├── types/
│   │   │   └── index.d.ts                 # TypeScript types (Asset, User, Wilayah, dll)
│   │   │
│   │   ├── Layouts/
│   │   │   ├── AuthenticatedLayout.tsx    # Layout utama (sidebar, navbar)
│   │   │   └── GuestLayout.tsx            # Layout login
│   │   │
│   │   ├── Components/
│   │   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── DataTable.tsx              # Reusable tabel dengan sort & pagination
│   │   │   ├── MapView.tsx                # Komponen peta Leaflet
│   │   │   ├── FileUploader.tsx           # Komponen upload dokumen
│   │   │   └── AssetForm/
│   │   │       ├── KibAForm.tsx           # Form fields spesifik KIB A
│   │   │       ├── KibBForm.tsx
│   │   │       ├── KibCForm.tsx
│   │   │       ├── KibDForm.tsx
│   │   │       ├── KibEForm.tsx
│   │   │       └── KibLForm.tsx
│   │   │
│   │   └── Pages/
│   │       ├── Auth/
│   │       │   └── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Assets/
│   │       │   ├── KibA/
│   │       │   │   ├── Index.tsx          # Daftar aset KIB A
│   │       │   │   ├── Create.tsx
│   │       │   │   ├── Edit.tsx
│   │       │   │   └── Show.tsx           # Detail + dokumen
│   │       │   ├── KibB/
│   │       │   │   └── ... (sama)
│   │       │   ├── KibC/ ... KibD/ ... KibE/ ... KibL/
│   │       │   └── Search/
│   │       │       ├── Index.tsx          # Pencarian tabel
│   │       │       └── Map.tsx            # Pencarian peta
│   │       ├── Wilayah/
│   │       │   ├── Index.tsx
│   │       │   ├── Create.tsx
│   │       │   └── Edit.tsx
│   │       ├── Users/
│   │       │   ├── Index.tsx
│   │       │   ├── Create.tsx
│   │       │   └── Edit.tsx
│   │       └── Settings/
│   │           └── Index.tsx              # Pengaturan instansi
│   │
│   └── views/
│       └── exports/                       # Blade template untuk PDF
│           ├── kib-a.blade.php
│           ├── kib-b.blade.php
│           ├── kib-c.blade.php
│           ├── kib-d.blade.php
│           ├── kib-e.blade.php
│           └── kib-l.blade.php
│
├── routes/
│   └── web.php                            # Semua route (Inertia, tidak perlu api.php)
│
├── storage/
│   └── app/
│       └── documents/                     # Private storage untuk dokumen aset
│
└── tests/
    ├── Feature/
    │   ├── Auth/
    │   ├── Asset/
    │   ├── Wilayah/
    │   └── Export/
    └── Unit/
        ├── AssetServiceTest.php
        └── ExportServiceTest.php
```

---

## 13. Rencana Implementasi (Fase)

### Fase 1 — Foundation (Setup & Auth)
- [ ] Setup project Laravel 11 + Breeze (Inertia + React + TypeScript)
- [ ] Konfigurasi PostgreSQL
- [ ] Install & konfigurasi Tailwind CSS + shadcn/ui
- [ ] Migrasi tabel `users`, `wilayahs`, `user_wilayah`
- [ ] Setup Spatie Permission (role Admin & Staff)
- [ ] Halaman Login & Logout
- [ ] Layout utama (sidebar, navbar, responsive)
- [ ] Seeder: Admin default

### Fase 2 — Management Wilayah & User
- [ ] CRUD Wilayah (Admin only)
- [ ] CRUD User (Admin only)
- [ ] Assign staff ke wilayah
- [ ] Middleware & Policy untuk otorisasi role

### Fase 3 — Core Asset Management
- [ ] Migrasi tabel `assets` + semua `kib_*_details`
- [ ] Model Asset + relasi ke detail tables
- [ ] WilayahScope (global scope filter aset untuk Staff)
- [ ] AssetPolicy (otorisasi CRUD berdasarkan role + wilayah)
- [ ] CRUD KIB A (Tanah) — sebagai template/pattern
- [ ] CRUD KIB B (Peralatan & Mesin)
- [ ] CRUD KIB C (Gedung & Bangunan)
- [ ] CRUD KIB D (Jalan, Irigasi, Jaringan)
- [ ] CRUD KIB E (Aset Tetap Lainnya)
- [ ] CRUD KIB L (Aset Lainnya)
- [ ] Soft delete & restore

### Fase 4 — Dokumen & Penanggung Jawab
- [ ] Migrasi tabel `asset_documents`
- [ ] Upload dokumen (multi-file per aset)
- [ ] Preview & download dokumen (authorized)
- [ ] Hapus dokumen
- [ ] Input penanggung jawab pada form aset

### Fase 5 — Pencarian & Peta
- [ ] Halaman pencarian aset (tabel dengan filter)
- [ ] Filter by wilayah, penanggung jawab, lokasi, jenis KIB
- [ ] Global text search
- [ ] Integrasi Leaflet (react-leaflet)
- [ ] Tampilan peta dengan marker & cluster
- [ ] Popup detail aset pada marker

### Fase 6 — Export PDF & Dashboard
- [ ] Migrasi tabel `settings`
- [ ] Halaman pengaturan instansi
- [ ] Blade template PDF untuk setiap KIB (sesuai format pemerintah)
- [ ] Generate & download PDF via DomPDF/Snappy
- [ ] Halaman Dashboard (ringkasan total, nilai, per wilayah)

### Fase 7 — Audit, Security & Polish
- [ ] Setup Spatie Activity Log
- [ ] Auth logging (login, logout, failed attempts)
- [ ] Security headers middleware
- [ ] Testing (feature & unit tests)
- [ ] Setup Laravel Backup
- [ ] Final QA & bug fixing

---

## 14. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| Responsif | Aplikasi bisa diakses dari desktop dan mobile browser |
| Performa | Halaman daftar aset harus bisa menampilkan 1000+ record dengan pagination |
| Availability | Target uptime 99% |
| Browser support | Chrome, Firefox, Safari, Edge (versi terbaru) |

---

## 15. Glosarium

| Istilah | Definisi |
|---|---|
| KIB | Kartu Inventaris Barang - format standar pencatatan aset pemerintah |
| KIB A | Kartu Inventaris Barang untuk kategori Tanah |
| KIB B | Kartu Inventaris Barang untuk kategori Peralatan dan Mesin |
| KIB C | Kartu Inventaris Barang untuk kategori Gedung dan Bangunan |
| KIB D | Kartu Inventaris Barang untuk kategori Jalan, Irigasi, dan Jaringan |
| KIB E | Kartu Inventaris Barang untuk kategori Aset Tetap Lainnya |
| KIB L | Kartu Inventaris Barang untuk kategori Aset Lainnya (Tak Berwujud) |
| BAST | Berita Acara Serah Terima |
| NIP | Nomor Induk Pegawai |
| PJ | Penanggung Jawab |
| Wilayah | Unit geografis/organisasi yang digunakan untuk membatasi akses staff terhadap aset |
