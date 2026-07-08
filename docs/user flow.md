# User Flow Aplikasi LNR Coffee

Dokumen ini mendeskripsikan bagaimana alur pengguna (User Flow) dalam menggunakan aplikasi LNR Coffee, mulai dari pertama kali membuka aplikasi hingga berhasil melakukan pemesanan.

---

## 1. Akses Beranda & Autentikasi
1. **Membuka Aplikasi**: Pengguna membuka *Landing Page* (Beranda). 
2. **Cek Status Login**: Sistem akan memeriksa status autentikasi melalui `useAuth`. Jika belum login, tombol akses ke fitur krusial akan mengarahkan pengguna ke proses Login.
3. **Proses Login / Registrasi**: 
   - Pengguna memasukkan **Nomor WhatsApp** dan **PIN**.
   - Sistem memverifikasi data di Supabase (tabel `profiles`).
   - Jika berhasil, token sesi tersimpan, dan pengguna kembali diarahkan ke Beranda dengan tampilan yang menampilkan sapaan "Hi, [Nama]" serta jumlah LNR Point mereka.

---

## 2. Eksplorasi Fitur Beranda
Setelah login, pengguna memiliki beberapa pilihan navigasi dari halaman Beranda:
- **Promo & Banner**: Melihat *carousel* promosi terbaru.
- **LNR Asisten AI**: Mengakses fitur chatbot (didukung Groq API) untuk bertanya seputar menu atau cara pemesanan.
- **KopiPedia**: Mengakses artikel blog terkait kopi.
- **Tutorial & FAQ**: Menonton video tutorial atau membaca bantuan untuk pengguna baru.
- **Cari Outlet**: Menemukan lokasi outlet LNR di Google Maps.

---

## 3. Proses Pemesanan (Pusat Transaksi)
1. **Pilih Tipe Pesanan**: Di Beranda, pengguna memilih antara:
   - **Pick Up**: Ambil di kedai.
   - **Delivery**: Diantar ke rumah.
   - Atau **Scan QR Meja**: Jika pengguna sedang berada di kedai (Dine-in).
2. **Pilih Cabang (Lokasi)**: Pengguna memilih dari daftar outlet (cabang) yang sedang aktif.
3. **Jelajahi Menu**: Pengguna diarahkan ke Halaman Menu.
   - Menu dikelompokkan berdasarkan kategori (Coffee, Non-Coffee, Snack).
   - Pengguna dapat mencari nama produk.
4. **Kustomisasi Item (Add-on)**: Saat memilih kopi, muncul pop-up kustomisasi (ukuran cup, level gula, es, sirup ekstra). Setelah disesuaikan, item masuk ke **Keranjang (Cart)**.

---

## 4. Checkout & Pembayaran
1. **Review Keranjang**: Pengguna memeriksa pesanan dan total harga.
2. **Masukkan Detail Pengiriman / Meja**: 
   - *Delivery*: Memasukkan alamat lengkap dan catatan.
   - *Dine-in*: Nomor meja otomatis terisi atau diisi manual.
3. **Pilih Metode Pembayaran**:
   - **Tripay**: *Payment Gateway* untuk bayar via QRIS, Virtual Account, atau E-Wallet.
   - **Bayar Tunai / Kasir**: Bayar langsung di tempat (Manual).
   - **Gunakan LNR Point**: Menukar poin loyalitas jika mencukupi.
4. **Gunakan Voucher (Opsional)**: Memasukkan kode promo untuk memotong harga.
5. **Konfirmasi Pesanan**: Sistem mengirim data ke tabel `orders` dan men-generate ID pembayaran (jika via Tripay).

---

## 5. Lacak Pesanan (Real-Time)
1. **Halaman Status Pesanan**: Setelah checkout, pengguna diarahkan ke halaman detail pesanan.
2. **Real-time Updates**: Status berubah secara *real-time* (Pending ➔ Diproses Barista ➔ Siap Diambil / Diantar ➔ Selesai) berkat fitur *Supabase Realtime subscriptions*.
3. **Notifikasi Mengambang**: Jika pengguna kembali ke Beranda, terdapat pop-up status pesanan aktif di bagian bawah layar agar mereka dapat selalu melacaknya.

---

## 6. Selesai & Review
1. **Terima Pesanan**: Ketika status pesanan selesai, pengguna mendapatkan notifikasi (jika diaktifkan) dan LNR Points ditambahkan secara otomatis.
2. **Beri Ulasan**: Pengguna memberikan penilaian (Bintang 1-5) dan ulasan teks tentang pesanan tersebut (tersimpan di tabel `reviews`). Ulasan ini nantinya dapat dilihat oleh Admin pada *Review Board*.
