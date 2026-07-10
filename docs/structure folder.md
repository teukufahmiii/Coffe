# Struktur Folder LNR Coffee

Proyek LNR Coffee menggunakan arsitektur Modern Web dengan pemisahan yang rapi antara Frontend (React) dan Backend Serverless (Supabase). Berikut adalah rincian lengkap mengenai struktur direktori proyek beserta fungsi dari setiap file dan folder krusial.

## 📂 Root Directory
- `package.json` & `pnpm-lock.yaml`: Mengatur dependensi proyek (menggunakan pnpm).
- `vite.config.ts`: Konfigurasi *bundler* Vite untuk frontend.
- `tailwind.config.ts` & `postcss.config.js`: Konfigurasi *styling* menggunakan Tailwind CSS.
- `tsconfig.json`: Konfigurasi TypeScript untuk memastikan *type-safety*.
- `.env`: Menyimpan variabel lingkungan *(environment variables)* yang sensitif (seperti API Keys Supabase, Groq AI, dan Tripay).

---

## 💻 1. Frontend (`/src`)
Folder `src/` berisi seluruh kode sumber (Source Code) antarmuka pengguna (User Interface) yang dibangun dengan React, TypeScript, dan Tailwind CSS.

### 📁 `/src/components`
Berisi komponen React UI yang dapat digunakan kembali *(reusable components)*.
- `/admin/`: Komponen khusus untuk Dashboard Admin (seperti `ReviewBoard.tsx`, `MenuManager.tsx`, `LoginManager.tsx` dan `OutletManager.tsx`).
- `/home/`: Komponen khusus untuk halaman beranda pengguna (seperti `BerandaHero.tsx`, `BerandaLayanan.tsx`).
- `/ui/`: Komponen UI dasar *(Base UI)*.
- `PinGuard.tsx`: Komponen khusus pelindung keamanan (Otentikasi PIN & Verifikasi Sesi Login) untuk memblokir akses yang tidak sah ke dalam Dashboard.

### 📁 `/src/routes`
Pusat dari aplikasi ini karena proyek menggunakan **TanStack Router** dengan sistem *file-based routing*. Setiap file di sini secara otomatis akan menjadi sebuah halaman (URL).
- `__root.tsx`: File root (induk) dari seluruh layout aplikasi.
- `index.tsx`: Halaman Beranda (Landing Page).
- `_authenticated/`: Direktori dengan proteksi PIN dan *Auth*.
  - `admin.*/`: Rute untuk Dashboard Outlet / Kasir (`admin.index.tsx`, `admin.qr.tsx`).
  - `master.*/`: Rute untuk Dashboard Master Admin / Pemilik (`master.index.tsx`, `master.settings.tsx`).
  - `admin.developer.tsx`: Rute super rahasia untuk Developer / IT (mengakses *System Logs* dan *Database Tools*).
- `menu.tsx`: Halaman daftar menu LNR Coffee.
- `select-location.tsx`: Halaman pemilihan outlet terdekat berdasarkan jarak (GPS).

### 📁 `/src/hooks`
Kumpulan *Custom React Hooks* untuk logika aplikasi.
- `useAuth.tsx`: Mengelola logika *authentication* pelanggan (Nomor WhatsApp).
- `useNearestBranch.ts`: Algoritma perhitungan jarak (Haversine formula) untuk mencari cabang terdekat.

### 📁 `/src/types`
Definisi tipe data TypeScript untuk struktur data yang sering dipakai.
- `branch.ts`: Menyimpan antarmuka tipe-tipe tabel database yang ditarik dari Supabase.

---

## ⚙️ 2. Backend & Database (`/supabase`)
Karena aplikasi ini *serverless*, backend mengandalkan ekosistem Supabase.

### 📁 `/supabase/migrations`
Berisi 10 file skema database PostgreSQL yang rapi dan dikelompokkan secara abjad:
- `a_tabel_menu_items.sql` hingga `i_tabel_login_sessions.sql`: Skema per-tabel lengkap dengan relasi (Foreign Keys).
- `j_semua_kebijakan_keamanan.sql`: Menyimpan aturan keamanan tingkat baris *(Row Level Security / RLS)* untuk seluruh tabel, demi mengamankan data lintas outlet.

### 📁 `/supabase/functions`
Berisi **Supabase Edge Functions** (fungsi serverless berbasis Deno & TypeScript) untuk memproses logika backend yang memerlukan kerahasiaan API Key.
- `/create-tripay-transaction/`: Menghubungi API Tripay untuk membuat transaksi pembayaran dan men-generate *Virtual Account* atau QRIS.
- `/get-tripay-channels/`: Mengambil daftar metode pembayaran yang didukung oleh Tripay secara real-time.
