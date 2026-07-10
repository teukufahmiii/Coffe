# Analisis Platform LNR Coffee

## 1. Perkenalan Singkat
LNR Coffee Platform adalah sistem manajemen *Coffee Shop* berbasis web modern (Web App) berskala *enterprise* yang dirancang khusus untuk menangani operasi banyak cabang (multi-outlet) secara terpusat. Dibangun dengan teknologi terkini (React, TypeScript, Vite, Tailwind CSS, dan Supabase), platform ini menghubungkan tiga pilar utama dalam bisnis F&B: Pelanggan, Staf Outlet (Kasir/Barista), dan Pemilik Bisnis (Master Admin).

## 2. Masalah yang Dipecahkan (Problem Statement)
Platform ini diciptakan untuk menjawab berbagai tantangan operasional bisnis F&B modern, di antaranya:
- **Antrean Fisik yang Panjang:** Mengatasi penumpukan pelanggan di kasir dengan sistem pesanan digital mandiri (*Pick Up* & *Delivery*) serta sistem Nomor Antrean Harian.
- **Manajemen Multi-Cabang yang Rumit:** Menghilangkan kebingungan manajemen menu dan harga di banyak cabang. Pemilik bisnis dapat mengubah menu dari satu tempat, dan otomatis ter-update di seluruh cabang.
- **Keterbatasan Pelacakan Keuangan:** Mencegah kebocoran data finansial dengan laporan penjualan otomatis secara *real-time* untuk setiap outlet yang hanya bisa diakses oleh Master Admin.
- **Friction (Hambatan) Login Pelanggan:** Menghilangkan keharusan mengingat email dan password yang rumit. Pelanggan cukup login menggunakan Nomor WhatsApp.
- **Keamanan Akun Karyawan:** Mencegah pembajakan akun atau karyawan nakal dengan sistem *Live Session Monitoring* (Aktivitas Login) di mana pusat bisa memaksa *logout* (mengeluarkan) perangkat yang mencurigakan.

## 3. Fitur Utama (Key Features)

### A. Fitur Pelanggan (Customer Facing)
- **Deteksi Lokasi Pintar:** Otomatis mendeteksi jarak pengguna menggunakan GPS dan merekomendasikan Outlet LNR Coffee terdekat.
- **Pemesanan Multi-Mode:** Mendukung pemesanan *Dine-in* (Makan di tempat), *Pick Up* (Ambil sendiri), dan *Delivery* (Pesan antar).
- **Sistem Poin & Voucher:** Pelanggan mendapatkan poin dari setiap transaksi yang dapat ditukar dengan voucher diskon (*Loyalty Program*).
- **WhatsApp Integration:** Login yang sangat mudah menggunakan nomor WA.
- **Live Tracking Pesanan:** Pelanggan dapat melihat status pesanannya secara *real-time* (Pending ➔ Dimasak ➔ Disajikan).
- **Sistem Ulasan (Review):** Memungkinkan pelanggan memberikan rating dan ulasan per produk setelah pesanan selesai.

### B. Fitur Dashboard Outlet (Admin Cabang / Kasir)
- **Mode Kasir Khusus:** Memungkinkan staf outlet membuat pesanan langsung untuk pelanggan yang datang secara offline (Walk-in).
- **Manajemen Pesanan Real-time:** Notifikasi instan saat pesanan baru masuk, lengkap dengan fitur ubah status pesanan (Cooking, Served, Completed).
- **Sistem Antrean Otomatis:** Pembuatan nomor antrean harian yang reset setiap hari untuk ketertiban operasional.
- **Login PIN Aman:** Akses dashboard dibatasi oleh PIN 6 digit unik untuk setiap outlet.

### C. Fitur Master Admin (Pemilik Bisnis)
- **Manajemen Outlet Sentral:** Tambah, edit, tutup/buka cabang, dan atur PIN masing-masing cabang dari pusat.
- **Manajemen Menu Global:** Tambah menu kopi/makanan yang otomatis tersinkronisasi ke seluruh outlet.
- **Laporan Keuangan Komprehensif:** Rekap pendapatan kotor, bersih, dan jumlah pesanan dengan filter tanggal dan grafik.
- **Kelola Diskon & Voucher:** Membuat kupon promo baik yang permanen maupun sementara berbasis periode waktu.
- **QR Code Website:** Pembuatan QR Code otomatis yang bisa dicetak untuk di-scan oleh pelanggan di meja.

### D. Fitur Developer / Super Admin
- **Dashboard Developer Tersembunyi:** Akses khusus menggunakan PIN Developer untuk manajemen tingkat lanjut.
- **Login Activity Manager:** Pemantauan alamat IP, lokasi, dan perangkat siapa saja yang sedang login di sistem, dengan tombol *Force Logout* (Keluarkan Paksa).
- **Database Tools:** Alat untuk membersihkan riwayat log (*Clear Logs*) untuk menjaga performa database agar tidak penuh.
