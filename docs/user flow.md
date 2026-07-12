# User Flow Aplikasi LNR Coffee

Dokumen ini mendeskripsikan bagaimana alur pengguna (User Flow) dalam menggunakan aplikasi LNR Coffee, mencakup berbagai peran (Pelanggan, Kasir, Master Admin, dan Developer).

---

## 1. Alur Pelanggan (Customer Flow)

### A. Akses Beranda & Autentikasi
1. **Membuka Aplikasi**: Pengguna membuka *Landing Page*.
2. **Proses Login**: Pelanggan cukup memasukkan **Nomor WhatsApp**.
3. **Pilih Tipe Pesanan**: Memilih antara **Pick Up**, **Delivery**, atau **Dine-in** (Scan QR di meja).

### B. Pemilihan Lokasi & Menu
1. **Pilih Cabang Pintar**: Sistem mendeteksi lokasi pelanggan menggunakan GPS dan langsung menyorot cabang dengan label **Terdekat**.
2. **Kustomisasi Item**: Memilih menu kopi/snack dan menambahkannya ke keranjang.

### C. Pembayaran & Pelacakan
1. **Checkout**: Mengonfirmasi pesanan dan menggunakan voucher diskon atau *LNR Points*.
2. **Pembayaran**: Integrasi otomatis menggunakan metode pembayaran yang disediakan.
3. **Lacak Real-Time**: Status pesanan berubah seketika tanpa perlu *refresh* (Pending ➔ Dimasak ➔ Disajikan).
4. **Ulasan**: Pelanggan dapat memberikan rating bintang setelah pesanan selesai.

### D. Interaksi & Bantuan Pintar
1. **LNR Asisten AI**: Pelanggan dapat membuka menu *LNR Asisten* di beranda untuk bertanya jawab dengan AI (diotaki oleh LLaMA 3.1).
2. **Personalisasi AI**: AI akan mengenali nama pelanggan jika sudah *login*, dan memandu cara order, menjelaskan menu, atau memberikan nomor Customer Service. AI dibatasi agar tidak mengetahui rahasia dapur atau data transaksi konfidensial pengguna.

---

## 2. Alur Staf Outlet (Kasir & Barista)

1. **Login Keamanan Tinggi**: Staf membuka `/admin/login` dan harus memasukkan **PIN Login Dashboard Outlet** yang spesifik hanya untuk cabang mereka.
2. **Manajemen Antrean**: 
   - Melihat pesanan online yang masuk secara *real-time*.
   - Mengubah status pesanan dari "Pending" menjadi "Cooking" hingga "Completed".
3. **Mode Kasir Offline**: Staf menggunakan tab *Kasir* untuk menginput pesanan manual (Walk-in), di mana sistem akan otomatis mencetak/mengeluarkan **Nomor Antrean Harian**.
4. **Validasi QR Website**: Staf dapat mengakses halaman "QR Website" untuk ditunjukkan kepada pelanggan di toko.

---

## 3. Alur Master Admin (Pemilik Bisnis)

1. **Login Master**: Menggunakan PIN Master khusus (`/master/login`).
2. **Pantau Keseluruhan Cabang**: Mengelola (tambah, edit, tutup) cabang di seluruh sistem, serta mengganti PIN akses setiap cabang.
3. **Menu Global**: Mengedit harga atau nama kopi dari satu tempat yang akan langsung ter-update di seluruh cabang.
4. **Laporan Keuangan**: Melihat rekap pendapatan harian/bulanan dengan grafik yang jelas, serta mengunduh rincian penjualan.
5. **Pemantauan Sesi Aktif**: Master Admin bisa melihat siapa saja yang sedang membuka dashboard, lengkap dengan alamat IP dan lokasinya, dan berhak menekan **Force Logout** untuk memutus akses staf dari jauh secara paksa.

---

## 4. Alur Developer (IT & Pengembang)

1. **Akses Tersembunyi**: Developer masuk ke rute khusus rahasia (`/admin/developer`) menggunakan **Developer PIN**.
2. **Pembersihan Database**: Terdapat fitur *"Clear Logs"* dan pembersihan data _orphaned_ untuk menjaga performa server (database Supabase) agar tidak lelet atau penuh.
3. **Monitor Aktivitas Ekstrem**: Melihat rincian teknis _session_ dan _system health_ dari keseluruhan platform web LNR Coffee.
