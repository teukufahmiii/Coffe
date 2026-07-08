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
- `/admin/`: Komponen khusus untuk Dashboard Admin (seperti `ReviewBoard.tsx`, `MenuManager.tsx`, `DashboardPesananAktif.tsx`).
- `/home/`: Komponen khusus untuk halaman beranda pengguna (seperti `BerandaHero.tsx`, `BerandaLayanan.tsx`).
- `/ui/`: Komponen UI dasar *(Base UI)* seperti tombol, input teks, modal, dsb.

### 📁 `/src/routes`
Pusat dari aplikasi ini karena proyek menggunakan **TanStack Router** dengan sistem *file-based routing*. Setiap file di sini secara otomatis akan menjadi sebuah halaman (URL).
- `__root.tsx`: File root (induk) dari seluruh layout aplikasi.
- `index.tsx`: Halaman Beranda (Landing Page).
- `_authenticated/`: Direktori dengan proteksi (pengguna harus login).
  - `admin.index.tsx` & `admin.settings.tsx`: Halaman Dashboard & Pengaturan Master Admin.
  - `profile.tsx`, `orders.tsx`, `checkout.tsx`: Halaman khusus untuk pengguna biasa yang sudah login.
- `menu.tsx`: Halaman daftar menu LNR Coffee.
- `ai-assistant.tsx`: Halaman interaksi chatbot dengan AI Groq.

### 📁 `/src/hooks`
Kumpulan *Custom React Hooks* untuk logika aplikasi.
- `useAuth.tsx`: Mengelola logika *authentication* (Login, Logout, sesi pengguna).

### 📁 `/src/types`
Definisi tipe data TypeScript untuk struktur data yang sering dipakai.
- `menu.ts`: Struktur untuk *MenuItem*, *Category*, dan *Options*.
- `order.ts`: Struktur untuk objek pesanan.

### 📁 `/src/lib`
Kumpulan fungsi utilitas *(Helper functions)*.
- `format.ts`: Fungsi format Rupiah, format tanggal, dll.
- `utils.ts`: Fungsi penggabung class Tailwind (misal: `cn`).

---

## ⚙️ 2. Backend & Database (`/supabase`)
Karena aplikasi ini *serverless*, backend mengandalkan ekosistem Supabase.

### 📁 `/supabase/migrations`
Berisi skema database PostgreSQL.
- `00_skema_lengkap_database_lnr.sql`: File krusial yang menyimpan struktur seluruh tabel *(Tables)*, aturan keamanan tingkat baris *(Row Level Security / RLS)*, serta fungsi trigger di database.

### 📁 `/supabase/functions`
Berisi **Supabase Edge Functions** (fungsi serverless berbasis Deno & TypeScript) untuk memproses logika backend yang memerlukan kerahasiaan API Key.
- `/create-tripay-transaction/`: Menghubungi API Tripay untuk membuat transaksi pembayaran dan men-generate *Virtual Account* atau QRIS.
- `/get-tripay-channels/`: Mengambil daftar metode pembayaran yang didukung oleh Tripay secara real-time.
- *(Rencana / Segera)* `/lnr-ai-assistant/`: Edge Function yang akan memanggil API Groq secara aman untuk chatbot AI.
