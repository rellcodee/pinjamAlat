# 📦 Aplikasi Peminjaman Alat

Aplikasi berbasis web untuk mengelola peminjaman dan pengembalian alat laboratorium/inventaris. Dibangun menggunakan **Next.js**, **Prisma ORM**, dan **MySQL**.

---

## 📋 Daftar Isi

- [Analisis Kebutuhan](#-analisis-kebutuhan)
- [Use Case Diagram](#-use-case-diagram)
- [Skenario Use Case](#-skenario-use-case)
- [ERD (Entity Relationship Diagram)](#-erd-entity-relationship-diagram)
- [Alur Sistem (Flow)](#-alur-sistem-flow)
- [Aturan Bisnis (Business Rules)](#-aturan-bisnis-business-rules)
- [Teknologi](#-teknologi)
- [Cara Menjalankan](#-cara-menjalankan)

---

## 📌 Analisis Kebutuhan

### Kebutuhan Fungsional

| No | Kebutuhan | Aktor |
|----|-----------|-------|
| 1 | Sistem dapat melakukan autentikasi pengguna (login/logout) | Admin, Petugas, Peminjam |
| 2 | Admin dapat mengelola data pengguna (CRUD) | Admin |
| 3 | Admin dapat mengelola data kategori alat (CRUD) | Admin |
| 4 | Admin dapat mengelola data alat (CRUD) | Admin |
| 5 | Admin dapat mengelola data unit alat (CRUD) | Admin |
| 6 | Admin dapat melihat data peminjaman dan pengembalian | Admin |
| 7 | Admin dapat melihat log aktivitas sistem | Admin |
| 8 | Peminjam dapat melihat daftar alat yang tersedia | Peminjam |
| 9 | Peminjam dapat memilih alat dan menambahkannya ke keranjang | Peminjam |
| 10 | Peminjam dapat mengajukan peminjaman dengan mengisi form tanggal | Peminjam |
| 11 | Peminjam dapat melihat riwayat peminjaman miliknya | Peminjam |
| 12 | Peminjam dapat meminta pengembalian (request) | Peminjam |
| 13 | Petugas dapat menyetujui atau menolak peminjaman | Petugas |
| 14 | Petugas dapat memproses pengembalian alat | Petugas |
| 15 | Petugas dapat melihat dashboard statistik peminjaman | Petugas |
| 16 | Petugas dapat mengekspor data peminjaman & pengembalian ke Excel | Petugas |
| 17 | Sistem menghitung denda otomatis jika terlambat mengembalikan | Sistem |
| 18 | Sistem mencatat semua aktivitas ke log | Sistem |

### Kebutuhan Non-Fungsional

| No | Kebutuhan |
|----|-----------|
| 1 | Sistem menggunakan autentikasi berbasis JWT (NextAuth) |
| 2 | Password di-hash menggunakan bcrypt |
| 3 | Middleware melindungi route berdasarkan role pengguna |
| 4 | Sistem responsif dan dapat diakses dari perangkat mobile |
| 5 | Sistem menggunakan database MySQL dengan Prisma ORM |

---

## 📊 Cara Melihat Diagram

Diagram di bawah menggunakan format **Mermaid**. Untuk melihatnya:

| Cara | Keterangan |
|------|------------|
| **GitHub** | Otomatis ter-render jika file di-push ke GitHub |
| **VS Code** | Install extension: `Markdown Preview Mermaid Support` atau `Mermaid Markdown Syntax Highlighting` |
| **Online** | Buka [mermaid.live](https://mermaid.live) lalu paste kode Mermaid-nya |
| **CLI** | Install `npm install -g @mermaid-js/mermaid-cli` lalu jalankan `mmdc -i input.md -o output.png` untuk generate gambar |

---

## 🎯 Use Case Diagram

```mermaid
graph TB
    subgraph Sistem["🖥️ Sistem Peminjaman Alat"]

        UC1["🔐 Login"]
        UC2["🚪 Logout"]

        subgraph Admin_UC["👑 Use Case Admin"]
            UC3["📋 Kelola Data User"]
            UC4["📂 Kelola Kategori"]
            UC5["🔧 Kelola Alat"]
            UC6["🏷️ Kelola Unit Alat"]
            UC7["📊 Lihat Peminjaman"]
            UC8["📊 Lihat Pengembalian"]
            UC9["📝 Lihat Log Aktivitas"]
        end

        subgraph Petugas_UC["👨‍💼 Use Case Petugas"]
            UC10["✅ Setujui / Tolak Peminjaman"]
            UC11["🔄 Proses Pengembalian"]
            UC12["📈 Lihat Dashboard"]
            UC13["📥 Export Data Excel"]
        end

        subgraph Peminjam_UC["👤 Use Case Peminjam"]
            UC14["🔍 Lihat Daftar Alat"]
            UC15["🛒 Tambah ke Keranjang"]
            UC16["📝 Ajukan Peminjaman"]
            UC17["📋 Lihat Riwayat Peminjaman"]
            UC18["🔄 Request Pengembalian"]
        end

        UC19["💰 Hitung Denda Otomatis"]
        UC20["📝 Catat Log Aktivitas"]
    end

    Admin(("👑 Admin"))
    Petugas(("👨‍💼 Petugas"))
    Peminjam(("👤 Peminjam"))

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9

    Petugas --> UC1
    Petugas --> UC2
    Petugas --> UC10
    Petugas --> UC11
    Petugas --> UC12
    Petugas --> UC13

    Peminjam --> UC1
    Peminjam --> UC2
    Peminjam --> UC14
    Peminjam --> UC15
    Peminjam --> UC16
    Peminjam --> UC17
    Peminjam --> UC18

    UC11 -.->|"include"| UC19
    UC3 -.->|"include"| UC20
    UC4 -.->|"include"| UC20
    UC5 -.->|"include"| UC20
    UC6 -.->|"include"| UC20
    UC10 -.->|"include"| UC20
    UC11 -.->|"include"| UC20
    UC16 -.->|"include"| UC20
```

---

## 📝 Skenario Use Case

### UC-01: Login

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin, Petugas, Peminjam |
| **Deskripsi** | Pengguna melakukan autentikasi untuk masuk ke sistem |
| **Pre-condition** | Pengguna sudah terdaftar di sistem |
| **Post-condition** | Pengguna berhasil masuk dan diarahkan ke halaman sesuai role |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Membuka halaman login | Menampilkan form login (username & password) |
| 2 | Mengisi username dan password | Melakukan validasi credential |
| 3 | Menekan tombol login | Jika valid: buat session JWT, redirect ke `/{role}`. Jika tidak valid: tampilkan pesan error |

**Skenario Alternatif:**
- **3a.** Username tidak ditemukan → Tampilkan error "Credential tidak valid"
- **3b.** Password salah → Tampilkan error "Credential tidak valid"
- **3c.** Sudah login → Redirect otomatis ke halaman role

---

### UC-02: Logout

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin, Petugas, Peminjam |
| **Deskripsi** | Pengguna keluar dari sistem |
| **Pre-condition** | Pengguna sudah login |
| **Post-condition** | Session dihapus, pengguna diarahkan ke halaman login |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Menekan tombol logout | Menghapus session/JWT |
| 2 | — | Redirect ke halaman `/login` |

---

### UC-03: Kelola Data User (Admin)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin |
| **Deskripsi** | Admin dapat membuat, melihat, mengedit, dan menghapus data pengguna |
| **Pre-condition** | Admin sudah login |
| **Post-condition** | Data user berhasil dikelola |

**Skenario: Tambah User**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Membuka halaman Kelola User | Menampilkan daftar user |
| 2 | Klik tombol "Tambah User" | Menampilkan form input (nama, username, password, role) |
| 3 | Mengisi data dan submit | Validasi username unik, hash password dengan bcrypt, simpan ke DB |
| 4 | — | Tampilkan notifikasi berhasil, catat ke log aktivitas |

**Skenario Alternatif:**
- **3a.** Username sudah dipakai → Tampilkan error "Username sudah dipakai"

**Skenario: Edit User**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik tombol edit pada salah satu user | Menampilkan form edit dengan data terisi |
| 2 | Mengubah data dan submit | Validasi, update data di DB, catat log aktivitas |

**Skenario: Hapus User**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik tombol hapus pada user | Menampilkan konfirmasi hapus |
| 2 | Konfirmasi hapus | Hapus data user dari DB, catat log aktivitas |

---

### UC-04: Kelola Kategori (Admin)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin |
| **Deskripsi** | Admin mengelola kategori alat (CRUD) |
| **Pre-condition** | Admin sudah login |
| **Post-condition** | Data kategori berhasil dikelola |

**Skenario: Tambah Kategori**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Membuka halaman Kategori | Menampilkan daftar kategori beserta jumlah alat |
| 2 | Klik "Tambah Kategori" | Menampilkan form (nama, deskripsi) |
| 3 | Mengisi data dan submit | Cek duplikat nama, simpan ke DB, catat log |

**Skenario Alternatif:**
- **3a.** Nama kategori sudah ada → Tampilkan error "Kategori sudah ada"

**Skenario: Hapus Kategori**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik hapus pada kategori | Cek apakah masih ada alat di kategori tersebut |
| 2 | — | Jika masih ada alat → error "Kategori masih punya alat, hapus dulu alatnya" |
| 3 | Jika kosong → hapus | Hapus dari DB, catat log |

---

### UC-05: Kelola Alat (Admin)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin |
| **Deskripsi** | Admin mengelola data alat (CRUD) |
| **Pre-condition** | Admin sudah login, minimal 1 kategori sudah ada |
| **Post-condition** | Data alat berhasil dikelola |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Membuka halaman Alat | Menampilkan daftar alat (nama, kategori, stok tersedia, gambar) |
| 2 | Klik "Tambah Alat" | Menampilkan form (nama, deskripsi, kategori, gambar) |
| 3 | Mengisi data dan submit | Validasi kategori exists, simpan ke DB, catat log |

**Catatan:** Stok dihitung otomatis dari jumlah `AlatUnit` yang berstatus `tersedia`.

---

### UC-06: Kelola Unit Alat (Admin)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin |
| **Deskripsi** | Admin mengelola unit fisik dari alat (CRUD) |
| **Pre-condition** | Admin sudah login, minimal 1 alat sudah ada |
| **Post-condition** | Unit alat berhasil dikelola |

**Skenario: Tambah Unit**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Pilih alat, klik "Tambah Unit" | Generate kode unit otomatis (contoh: `MS001`, `MS002`) |
| 2 | — | Simpan unit dengan status `tersedia` dan kondisi `baik`, catat log |

**Skenario: Edit Unit**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik edit pada unit | Tampilkan form (status, kondisi) |
| 2 | Ubah status/kondisi | Validasi enum (`tersedia`/`dipinjam`/`tidak_tersedia`, `baik`/`rusak_ringan`/`rusak_berat`), update DB |

---

### UC-07: Lihat Daftar Alat (Peminjam)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Peminjam |
| **Deskripsi** | Peminjam melihat alat yang tersedia untuk dipinjam |
| **Pre-condition** | Peminjam sudah login |
| **Post-condition** | Daftar alat ditampilkan |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Membuka halaman Peminjam | Fetch daftar alat dari API |
| 2 | — | Tampilkan grid alat yang **stok > 0** (nama, kategori, stok, gambar) |

---

### UC-08: Tambah ke Keranjang (Peminjam)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Peminjam |
| **Deskripsi** | Peminjam memilih alat dan memasukkannya ke keranjang |
| **Pre-condition** | Peminjam sudah melihat daftar alat |
| **Post-condition** | Alat masuk ke keranjang (localStorage) |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik tombol "Ambil" pada alat | Toggle alat ke keranjang (localStorage) |
| 2 | — | Tampilkan badge jumlah item di ikon keranjang |
| 3 | Klik lagi pada alat yang dipilih | Hapus dari keranjang |

---

### UC-09: Ajukan Peminjaman (Peminjam)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Peminjam |
| **Deskripsi** | Peminjam mengajukan peminjaman resmi setelah mengisi form |
| **Pre-condition** | Keranjang tidak kosong |
| **Post-condition** | Peminjaman tercatat di DB dengan status `pending` |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Buka halaman Keranjang | Tampilkan alat yang dipilih dengan pengaturan jumlah (±) |
| 2 | Atur jumlah per alat | Validasi tidak melebihi stok |
| 3 | Isi Tanggal Pinjam dan Tanggal Kembali | — |
| 4 | Klik "Ajukan Peminjaman" | Sistem melakukan **transaksi**: |
|   | | → Validasi semua unit masih `tersedia` |
|   | | → Buat record peminjaman (status = `pending`) |
|   | | → Buat detail peminjaman (auto-assign unit) |
|   | | → Update status unit menjadi `dipinjam` |
|   | | → Catat log aktivitas |
| 5 | — | Tampilkan notifikasi berhasil, kosongkan keranjang, redirect ke riwayat |

**Skenario Alternatif:**
- **4a.** Ada unit yang sudah tidak tersedia → Error "Ada unit yang tidak tersedia"
- **4b.** Stok tidak cukup → Error "Stok [nama alat] tidak cukup"
- **2a.** Tanggal tidak diisi → Error "Tanggal wajib diisi"

---

### UC-10: Setujui / Tolak Peminjaman (Petugas)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Petugas |
| **Deskripsi** | Petugas mereview dan memproses peminjaman yang masuk |
| **Pre-condition** | Petugas sudah login, ada peminjaman berstatus `pending` |
| **Post-condition** | Status peminjaman berubah menjadi `disetujui` atau `ditolak` |

**Skenario: Setujui**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Buka halaman Peminjaman | Tampilkan daftar peminjaman |
| 2 | Klik "Setujui" | Update status → `disetujui`, set petugasId, unit tetap `dipinjam` |
| 3 | — | Catat log aktivitas |

**Skenario: Tolak**

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik "Tolak" | Update status → `ditolak`, **kembalikan semua unit ke `tersedia`** |
| 2 | — | Catat log aktivitas |

**Skenario Alternatif:**
- **2a.** Status bukan `pending` → Error "Status sudah diproses"

---

### UC-11: Request Pengembalian (Peminjam)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Peminjam |
| **Deskripsi** | Peminjam meminta pengembalian setelah selesai menggunakan alat |
| **Pre-condition** | Peminjaman berstatus `disetujui` |
| **Post-condition** | Status berubah menjadi `menunggu_pengembalian` |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Buka riwayat peminjaman | Tampilkan daftar peminjaman milik user |
| 2 | Klik "Request Pengembalian" | Validasi peminjaman milik user dan status = `disetujui` |
| 3 | — | Update status → `menunggu_pengembalian` |

**Skenario Alternatif:**
- **2a.** Peminjaman bukan milik user → Error "Bukan milik user"
- **2b.** Status bukan `disetujui` → Error "Tidak bisa request pengembalian"

---

### UC-12: Proses Pengembalian (Petugas)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Petugas |
| **Deskripsi** | Petugas memproses pengembalian alat dan menghitung denda |
| **Pre-condition** | Peminjaman berstatus `disetujui` atau `menunggu_pengembalian` |
| **Post-condition** | Record pengembalian dibuat, status peminjaman menjadi `selesai`, unit dikembalikan |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Buka halaman Pengembalian | Tampilkan daftar pengembalian |
| 2 | Pilih peminjaman, isi tanggal kembali aktual | — |
| 3 | Submit pengembalian | Sistem menghitung: |
|   | | → **Hari terlambat** = tanggal kembali aktual - tanggal rencana kembali |
|   | | → **Total denda** = hari terlambat × Rp 5.000 |
|   | | → Buat record pengembalian |
|   | | → Update semua unit terkait → `tersedia` |
|   | | → Update status peminjaman → `selesai` |
|   | | → Catat log aktivitas |

**Skenario Alternatif:**
- **3a.** Sudah dikembalikan sebelumnya → Error "Sudah dikembalikan"
- **3b.** Status tidak valid → Error "Tidak bisa dikembalikan"

---

### UC-13: Lihat Dashboard (Petugas)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Petugas |
| **Deskripsi** | Petugas melihat ringkasan statistik peminjaman |
| **Pre-condition** | Petugas sudah login |
| **Post-condition** | Dashboard ditampilkan |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Buka halaman Dashboard Petugas | Fetch data summary dari API |
| 2 | — | Tampilkan 3 card: Sedang Dipinjam, Sudah Dikembalikan, Total Denda |
| 3 | — | Tampilkan grafik bar chart statistik peminjaman per alat (bulan ini) |
| 4 | — | Tampilkan tabel pengembalian terbaru |

---

### UC-14: Export Data Excel (Petugas)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Petugas |
| **Deskripsi** | Petugas mengunduh data peminjaman/pengembalian dalam format Excel |
| **Pre-condition** | Petugas sudah login |
| **Post-condition** | File Excel terdownload |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Klik "Export Peminjaman" atau "Export Pengembalian" | Generate file `.xlsx` dari data DB |
| 2 | — | Download file ke perangkat user |

---

### UC-15: Lihat Log Aktivitas (Admin)

| Komponen | Deskripsi |
|----------|-----------|
| **Aktor** | Admin |
| **Deskripsi** | Admin melihat catatan semua aktivitas yang terjadi di sistem |
| **Pre-condition** | Admin sudah login |
| **Post-condition** | Daftar log ditampilkan |

| No | Aksi Aktor | Reaksi Sistem |
|----|-----------|---------------|
| 1 | Buka halaman Log Aktivitas | Fetch 50 log terbaru |
| 2 | — | Tampilkan tabel (user, aksi, keterangan, waktu) dengan badge warna per aksi (CREATE=hijau, UPDATE=kuning, DELETE=merah) |

---

## 🗃️ ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    users {
        INT id PK
        VARCHAR nama
        VARCHAR username UK
        VARCHAR password
        ENUM role "admin | petugas | peminjam"
        TIMESTAMP created_at
    }

    kategori {
        INT id PK
        VARCHAR nama UK
        TEXT deskripsi
    }

    alat {
        INT id PK
        INT kategori_id FK
        VARCHAR nama
        TEXT deskripsi
        VARCHAR image
        INT stok
    }

    alat_unit {
        INT id PK
        INT alat_id FK
        VARCHAR kode_unit UK
        ENUM kondisi "baik | rusak_ringan | rusak_berat"
        ENUM status "tersedia | dipinjam | tidak_tersedia"
    }

    peminjaman {
        INT id PK
        INT peminjam_id FK
        INT petugas_id FK
        DATE tanggal_pinjam
        DATE tanggal_rencana_kembali
        ENUM status "pending | disetujui | menunggu_pengembalian | ditolak | selesai"
        TIMESTAMP created_at
    }

    detail_peminjaman {
        INT id PK
        INT peminjaman_id FK
        INT alat_unit_id FK
    }

    pengembalian {
        INT id PK
        INT peminjaman_id FK "UNIQUE"
        INT petugas_id FK
        DATE tanggal_kembali_aktual
        INT jumlah_hari_terlambat
        INT total_denda
        TIMESTAMP created_at
    }

    log_aktivitas {
        INT id PK
        INT user_id FK
        VARCHAR aksi
        TEXT keterangan
        TIMESTAMP waktu
    }

    %% === RELASI ===
    kategori ||--o{ alat : "memiliki"
    alat ||--o{ alat_unit : "memiliki"
    users ||--o{ peminjaman : "mengajukan (peminjam)"
    users ||--o{ peminjaman : "memproses (petugas)"
    peminjaman ||--o{ detail_peminjaman : "berisi"
    alat_unit ||--o{ detail_peminjaman : "dipinjam dalam"
    peminjaman ||--o| pengembalian : "dikembalikan"
    users ||--o{ pengembalian : "memproses (petugas)"
    users ||--o{ log_aktivitas : "melakukan"
```

---

## 🔄 Alur Sistem (Flow)

### Alur Status Peminjaman

```mermaid
stateDiagram-v2
    [*] --> pending : Peminjam ajukan peminjaman
    pending --> disetujui : Petugas menyetujui
    pending --> ditolak : Petugas menolak

    ditolak --> [*] : Unit dikembalikan ke "tersedia"

    disetujui --> menunggu_pengembalian : Peminjam request pengembalian
    disetujui --> selesai : Petugas proses langsung

    menunggu_pengembalian --> selesai : Petugas proses pengembalian

    selesai --> [*] : Unit dikembalikan ke "tersedia"
```

### Alur Status Unit Alat

```mermaid
stateDiagram-v2
    [*] --> tersedia : Unit dibuat (kondisi: baik)
    tersedia --> dipinjam : Peminjaman diajukan
    dipinjam --> tersedia : Peminjaman ditolak / selesai dikembalikan
    tersedia --> tidak_tersedia : Admin nonaktifkan
    tidak_tersedia --> tersedia : Admin aktifkan kembali
```

### Flow Peminjaman End-to-End

```mermaid
sequenceDiagram
    actor P as Peminjam
    participant S as Sistem
    actor T as Petugas

    P->>S: Login
    S-->>P: Redirect ke /peminjam

    P->>S: Lihat daftar alat (stok > 0)
    P->>S: Pilih alat → masuk keranjang (localStorage)
    P->>S: Buka keranjang, atur qty
    P->>S: Isi tanggal pinjam & kembali
    P->>S: Submit "Ajukan Peminjaman"

    S->>S: Validasi unit tersedia
    S->>S: Buat peminjaman (status: pending)
    S->>S: Lock unit → status: dipinjam
    S->>S: Catat log aktivitas
    S-->>P: Notifikasi berhasil

    T->>S: Login
    S-->>T: Redirect ke /petugas

    T->>S: Lihat daftar peminjaman (pending)
    T->>S: Klik "Setujui"
    S->>S: Update status → disetujui
    S->>S: Catat log

    P->>S: Request pengembalian
    S->>S: Update status → menunggu_pengembalian

    T->>S: Proses pengembalian
    S->>S: Hitung denda (terlambat × Rp 5.000)
    S->>S: Buat record pengembalian
    S->>S: Update unit → tersedia
    S->>S: Update peminjaman → selesai
    S-->>T: Pengembalian tercatat
```

---

## 📏 Aturan Bisnis (Business Rules)

### Autentikasi & Otorisasi

| No | Aturan |
|----|--------|
| 1 | Semua route dilindungi oleh middleware, kecuali `/login` dan `/api/auth` |
| 2 | User yang sudah login dan mengakses `/login` akan di-redirect ke halaman role-nya |
| 3 | User tidak bisa mengakses halaman role lain (misal peminjam tidak bisa ke `/admin`) |
| 4 | Password di-hash menggunakan **bcrypt** sebelum disimpan |
| 5 | Session menggunakan strategi **JWT** via NextAuth |

### Peminjaman

| No | Aturan |
|----|--------|
| 1 | Peminjaman hanya bisa diajukan jika semua unit yang dipilih berstatus `tersedia` |
| 2 | Saat peminjaman diajukan, unit **langsung dikunci** (status → `dipinjam`) |
| 3 | Hanya peminjaman berstatus `pending` yang bisa disetujui/ditolak |
| 4 | Jika **ditolak**, semua unit **dikembalikan** ke status `tersedia` |
| 5 | Jika peminjaman dihapus, semua unit terkait **dikembalikan** ke `tersedia` |
| 6 | Peminjam hanya bisa request pengembalian jika status = `disetujui` |
| 7 | Peminjam hanya bisa request pengembalian untuk **peminjaman miliknya** |

### Pengembalian & Denda

| No | Aturan |
|----|--------|
| 1 | Pengembalian hanya bisa dibuat jika status peminjaman = `disetujui` atau `menunggu_pengembalian` |
| 2 | Satu peminjaman hanya boleh memiliki **satu pengembalian** (relasi 1:1) |
| 3 | **Denda** dihitung otomatis: `hari_terlambat × Rp 5.000` |
| 4 | `hari_terlambat = tanggal_kembali_aktual - tanggal_rencana_kembali` (jika negatif → 0) |
| 5 | Setelah pengembalian dibuat, semua unit → `tersedia`, peminjaman → `selesai` |
| 6 | Jika pengembalian dihapus, unit → `dipinjam` (rollback), peminjaman → `disetujui` |
| 7 | Jika tanggal pengembalian diupdate, denda **dihitung ulang** otomatis |

### Unit Alat

| No | Aturan |
|----|--------|
| 1 | Kode unit di-generate otomatis dari inisial nama alat + nomor urut (contoh: `MS001`) |
| 2 | Stok alat dihitung secara **dinamis** dari jumlah unit berstatus `tersedia` |
| 3 | Kondisi unit: `baik`, `rusak_ringan`, `rusak_berat` |
| 4 | Status unit: `tersedia`, `dipinjam`, `tidak_tersedia` |

### Kategori

| No | Aturan |
|----|--------|
| 1 | Nama kategori harus **unik** |
| 2 | Kategori **tidak bisa dihapus** jika masih memiliki alat |

### Log Aktivitas

| No | Aturan |
|----|--------|
| 1 | Setiap operasi CRUD dicatat ke tabel `log_aktivitas` |
| 2 | Log mencatat: user yang melakukan, jenis aksi, keterangan, dan waktu |
| 3 | Hanya **Admin** yang bisa melihat log aktivitas |
| 4 | Log ditampilkan maksimal **50 record terbaru** |

---

## 🛠️ Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MySQL |
| ORM | Prisma |
| Autentikasi | NextAuth.js (JWT Strategy) |
| Password Hashing | bcryptjs |
| Chart | Recharts |
| Export Excel | (API `/api/export`) |
| Icons | Lucide React |

---

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone <repo-url>
cd pinjamalat
npm install
```

### 2. Setup Environment

Buat file `.env` dengan isi:

```env
DATABASE_URL="mysql://user:password@localhost:3306/pinjamalat"
AUTH_SECRET="your-secret-key"
```

### 3. Setup Database

```bash
npx prisma db push
npx prisma generate
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Default Roles

| Role | Akses |
|------|-------|
| `admin` | `/admin` — Kelola user, kategori, alat, unit, lihat log |
| `petugas` | `/petugas` — Dashboard, kelola peminjaman & pengembalian, export |
| `peminjam` | `/peminjam` — Browse alat, keranjang, ajukan peminjaman, riwayat |
