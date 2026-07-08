# Naskah Presentasi Proyek LNR Coffee (Sistem 4 Pemateri)

Naskah ini dirancang khusus untuk dipresentasikan oleh 4 orang secara bergantian. Bagian Fahmi difokuskan pada penjelasan teknis tingkat lanjut (Backend, Integrasi API, dan Real-time Database) yang merupakan bagian paling kompleks dalam arsitektur proyek ini.

---

## 🎙️ SESI 1: Pembukaan & Antarmuka Pengguna (Frontend)
**Pemateri: Syarif**
**Fokus: Intro, Teknologi UI/UX, dan Fitur Beranda (Login - Homepage)**

**Syarif:**
"Selamat Pagi/Siang Bapak, Ibu, dan teman-teman sekalian. Kami dari kelompok [Sebut Nama Kelompok/Tim] yang beranggotakan saya Syarif, Fahmi, Desvian, dan Arya. Pada kesempatan kali ini, kami akan mendemokan sebuah sistem *Restaurant Management* modern bernama **LNR Coffee**."

"Aplikasi LNR Coffee hadir untuk mendigitalisasi pengalaman ngopi. Kami menyelesaikan masalah antrean panjang dengan fitur pemesanan interaktif—baik itu *Dine-in* melalui *Scan QR Meja*, *Pick-Up*, maupun *Delivery*."

*(Beralih ke layar Login)*
"Mari kita mulai dari sisi *Frontend* (Antarmuka). Aplikasi ini dibangun murni menggunakan **React** dan **TypeScript** dengan *build tool* **Vite**, sehingga performanya sangat ringan dan bebas dari *error runtime*. Untuk perpindahan halamannya, kami menggunakan **TanStack Router** yang sangat efisien."

"Untuk masuk ke dalam aplikasi, kami mendesain proses Autentikasi yang *seamless*. Pengguna cukup login menggunakan Nomor WhatsApp dan PIN. Sangat simpel tanpa perlu verifikasi email yang panjang."

*(Beralih ke layar Beranda)*
"Setelah masuk, desain UI yang kami gunakan mengusung konsep *Modern Premium*. Dibangun menggunakan **Tailwind CSS**, tampilannya dilengkapi warna yang *vibrant*, elemen tembus pandang (*glassmorphism*), dan animasi mikro ketika disentuh."

"Di Beranda ini, selain spanduk promosi, pengguna bisa mengakses beberapa fitur tambahan:
1. **LNR Asisten AI**: Ini adalah *chatbot* cerdas berbasis *Artificial Intelligence* yang bisa melayani pertanyaan pelanggan seputar menu.
2. **KopiPedia & Tutorial**: Blog edukasi kopi dan panduan penggunaan aplikasi.
3. **Pencarian Outlet**: Untuk menemukan cabang terdekat via Google Maps."

"Selanjutnya, untuk melihat bagaimana alur pelanggan saat memesan kopi, akan didemokan oleh rekan saya, Desvian. Silakan."

---

## 🎙️ SESI 2: Alur Pemesanan (Customer Journey)
**Pemateri: Desvian**
**Fokus: Demo Pemesanan, Kustomisasi Menu, dan Keranjang (Checkout)**

**Desvian:**
"Terima kasih, Syarif. Sekarang, mari kita lihat bagaimana mudahnya pelanggan memesan kopi di LNR Coffee."

*(Sambil mendemokan layar di proyektor)*
"Di beranda, pelanggan dihadapkan pada pilihan metode pesanan: *Pick Up* (Ambil di tempat) atau *Delivery* (Diantar). Jika pelanggan sedang duduk di kafe, mereka cukup men-scan *QR Code* di meja, dan nomor mejanya akan otomatis terisi di sistem."

*(Masuk ke layar Menu)*
"Ini adalah halaman Menu Katalog. Kami merancangnya agar sangat informatif. Ketika pelanggan mengeklik salah satu kopi, misalnya 'Aren Latte', akan muncul Pop-up Kustomisasi *(Add-ons)*."
"Di sini letak fleksibilitasnya. Pelanggan bisa mengatur ukuran cup (Regular/Large), *Sweetness* (tingkat gula), jumlah *Ice Cube*, hingga menambah jumlah *Shot Espresso* atau sirup ekstra. Setiap tambahan atau kustomisasi ini akan otomatis mengkalkulasi total harga secara akurat."

*(Masuk ke layar Keranjang / Checkout)*
"Setelah memasukkan pesanan ke keranjang, kita masuk ke halaman *Checkout*. Pada halaman ini, kami mengintegrasikan fitur **Voucher Promo** dan **LNR Point**. Pelanggan setia yang memiliki poin bisa menukarkannya langsung di sini untuk mendapat potongan harga."

"Untuk pembayarannya, pelanggan hanya perlu memilih apakah ingin membayar langsung di kasir (Tunai), atau bayar *Online* menggunakan Tripay. Nah, untuk bagaimana pembayaran *online* ini diproses secara aman di belakang layar, serta bagaimana arsitektur teknis database-nya bekerja, akan dijelaskan lebih mendalam oleh Fahmi."

---

## 🎙️ SESI 3: Arsitektur Backend, Pembayaran & Real-time (Sesi Paling Kompleks)
**Pemateri: Fahmi (Anda)**
**Fokus: Supabase Serverless, Relational Database (ERD), Tripay Edge Functions, & Real-time Subscriptions**

**Fahmi:**
"Terima kasih, Desvian. Baik, di balik UI yang cantik tadi, LNR Coffee didukung oleh arsitektur *Backend* yang sangat canggih. Kami tidak menggunakan server konvensional, melainkan pendekatan **Serverless Backend** menggunakan ekosistem **Supabase**."

*(Menampilkan slide/gambar Skema Database (ERD))*
"Pertama, dari sisi struktur data. Kami menggunakan **PostgreSQL**. Database relasional ini sangat ketat. Misalnya, ketika pesanan masuk, ia tercatat di tabel `orders` yang berelasi langsung dengan tabel `order_items` (untuk detail menunya) dan tabel `branches` (untuk mendeteksi cabang mana yang menerima pesanan). Data harga *(price_at_time)* dikunci secara independen di setiap transaksi, jadi walaupun admin mengubah harga menu besok harinya, riwayat harga transaksi kemarin tidak akan rusak."

"Kedua, terkait **Keamanan (Security)**. Karena aplikasi langsung menembak ke database, bagaimana cara mencegah *hacker* melihat pesanan orang lain? Kami mengimplementasikan **Row Level Security (RLS)** dari Supabase. Dengan RLS, *query database* otomatis difilter di tingkat server. Pengguna *User A* secara kriptografi mustahil bisa membaca baris data milik *User B*."

*(Menampilkan/Menjelaskan proses Checkout Payment)*
"Ketiga, integrasi **Tripay Payment Gateway** dan **Groq AI**. Di dalam pemrograman, menaruh *API Key* rahasia di dalam *Frontend* adalah kesalahan fatal (sangat tidak aman). Oleh karena itu, saya membangun **Supabase Edge Functions**."
"Ini adalah fungsi server berbasis *Deno V8 Engine* yang terisolasi. Jadi, ketika pengguna mengklik 'Bayar Online', React akan memanggil *Edge Function* kami, lalu server *Edge* inilah yang diam-diam menghubungi Tripay dan mengamankan kunci rahasianya, sebelum mengembalikan tautan *Virtual Account* atau QRIS ke layar pelanggan."

*(Menampilkan halaman Live Tracking Pesanan)*
"Terakhir, yang paling membanggakan adalah fitur **Real-time Order Tracking**. LNR Coffee menggunakan *WebSocket Connections* dari Supabase. Artinya, ketika barista di dapur memencet tombol 'Pesanan Siap', layar HP pelanggan akan **berkedip dan berubah detik itu juga** tanpa pelanggan harus melakukan *refresh* halaman sama sekali. Semuanya instan."

"Lalu, seperti apa bentuk layar yang dilihat oleh Barista dan Admin? Hal tersebut akan ditutup oleh rekan saya, Arya."

---

## 🎙️ SESI 4: Dashboard Admin & Penutup
**Pemateri: Arya**
**Fokus: Barista Command Center, Manajemen Master Data, dan Closing**

**Arya:**
"Terima kasih, Fahmi. Sebagai penutup dari alur aplikasi, kita akan melihat sisi *Back-Office*, tempat di mana pemilik toko dan barista bekerja."

*(Membuka layar Dashboard Admin)*
"Kami membangun apa yang kami sebut sebagai **Barista Command Center**. Layar ini secara khusus dirancang untuk diakses melalui tablet di dapur atau meja kasir."
"Di sini terdapat *Kanban Board* (papan pesanan) yang terbagi dua: *Pick Up* dan *Delivery*. Barista bisa melihat pesanan masuk secara langsung *(real-time)*. Dengan satu klik, mereka bisa mengubah status dari 'Pending' menjadi 'Diproses', lalu menjadi 'Selesai'."

*(Beralih ke tab Master Settings)*
"Tidak hanya pesanan, Dashboard ini juga menjadi Pusat Pengaturan Global. Admin dapat:
1. **Mengelola Menu**: Menambah produk baru, mengatur varian sirup/es, dan mengunggah gambar kopi. Menu yang ditambahkan di sini akan langsung tersinkronisasi ke seluruh layar pelanggan.
2. **Manajemen Cabang**: Pemilik bisnis bisa membuka atau menutup cabang (*is_active* toggle) jika toko sedang tutup.
3. **Manajemen Voucher & Banner**: Membuat kode promo baru (misal: Diskon 20% khusus member baru) dan mengatur spanduk bergulir di beranda.
4. **Keuangan Outlet**: Melihat rekapitulasi finansial secara terpusat."

**Penutup (Closing)**
"Sebagai kesimpulan, **LNR Coffee** dirancang lebih dari sekadar aplikasi pemesanan (*e-menu*). Ini adalah sistem hulu ke hilir *(End-to-End)* yang mengamankan transaksi, mempercepat kinerja barista, dan memanjakan pelanggan dengan antarmuka premium."

"Sekian presentasi dari kelompok kami. Jika ada pertanyaan mengenai teknologi, logika alur pembayaran, atau ingin melihat demonstrasi fitur tertentu secara langsung, kami persilakan. Terima kasih atas perhatiannya."
