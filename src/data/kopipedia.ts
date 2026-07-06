export interface KopipediaArticle {
  id: string;
  title: string;
  summary: string;
  content: string[];
  readTime: string;
  category: string;
}

export const KOPIPEDIA_ARTICLES: KopipediaArticle[] = [
  {
    id: "sejarah-singkat",
    title: "Mengenal Kopi: Sejarah Singkat Minuman Paling Populer",
    summary: "Mari kita telusuri bagaimana secangkir kopi berawal dari Ethiopia hingga menjadi gaya hidup dunia.",
    category: "Sejarah",
    readTime: "3 Min",
    content: [
      "Kopi adalah salah satu minuman yang paling banyak dikonsumsi di dunia, namun tahukah Anda dari mana asalnya?",
      "Legenda menceritakan bahwa kopi pertama kali ditemukan di Ethiopia oleh seorang penggembala kambing bernama Kaldi pada abad ke-9. Ia menyadari kambing-kambingnya menjadi sangat energik dan tidak bisa tidur setelah memakan buah beri merah dari pohon tertentu.",
      "Dari Ethiopia, kopi menyebar ke Semenanjung Arab. Pada abad ke-15, kopi mulai dibudidayakan di distrik Yaman di Arab dan pada abad ke-16 mulai dikenal di Persia, Mesir, Suriah, dan Turki.",
      "Kopi tidak hanya dinikmati di rumah-rumah, tetapi juga melahirkan 'kedai kopi' (qahveh khaneh) publik yang menjadi pusat interaksi sosial, diskusi, dan pertukaran informasi.",
      "Kini, berabad-abad kemudian, kopi telah berevolusi menjadi seni, gaya hidup, dan kebutuhan esensial jutaan orang setiap pagi, termasuk di LNR Coffee Shop!"
    ]
  },
  {
    id: "asal-usul-americano",
    title: "Asal Usul Americano: Kopi Historis Perang Dunia II",
    summary: "Mengapa disebut Americano? Ternyata ada kisah menarik dari para tentara Amerika di masa perang.",
    category: "Fakta Kopi",
    readTime: "2 Min",
    content: [
      "Caffè Americano, atau biasa disebut Americano, adalah salah satu menu wajib di setiap kedai kopi masa kini. Rasanya ringan, namun tetap membawa karakter espresso yang khas.",
      "Istilah 'Americano' ternyata berasal dari masa Perang Dunia II. Saat itu, tentara Amerika yang ditugaskan di Italia merasa bahwa espresso tradisional Italia terlalu kuat dan pahit untuk selera mereka.",
      "Untuk mengatasi hal ini, mereka mulai menambahkan air panas ke dalam espresso agar rasanya lebih ringan dan volumenya setara dengan kopi seduh (drip coffee) yang biasa mereka minum di rumah.",
      "Metode sederhana—menuangkan espresso lalu ditambahkan air panas (atau sebaliknya, yang sering disebut Long Black)—ternyata populer dan bertahan hingga sekarang.",
      "Jadi, setiap kali Anda memesan Americano, Anda sebenarnya sedang menikmati secangkir sejarah yang mendunia!"
    ]
  },
  {
    id: "budaya-ngopi-indonesia",
    title: "Budaya Ngopi: Mengapa Orang Indonesia Sangat Suka Kopi?",
    summary: "Indonesia adalah salah satu penghasil dan konsumen kopi terbesar. Apa yang membuat kita begitu cinta kopi?",
    category: "Budaya",
    readTime: "4 Min",
    content: [
      "Indonesia dan kopi adalah dua hal yang tidak terpisahkan. Mulai dari kopi tubruk di warung kopi pinggir jalan hingga es kopi susu kekinian di cafe estetis, kopi selalu menemani aktivitas orang Indonesia.",
      "Secara statistik, lebih dari 70% masyarakat Indonesia menikmati kopi setidaknya satu cangkir setiap hari. Mengapa hal ini bisa terjadi?",
      "Pertama, Indonesia memiliki tanah vulkanis yang sangat subur, menjadikannya salah satu produsen kopi (Arabica dan Robusta) terbesar di dunia sejak zaman kolonial Belanda dengan 'Tanam Paksa'.",
      "Kedua, budaya nongkrong. Orang Indonesia pada dasarnya sangat sosial. Warung kopi tradisional (warkop) selalu menjadi ruang netral untuk berkumpul, berdiskusi, hingga menyelesaikan masalah tanpa memandang kasta.",
      "Ketiga, inovasi tiada henti. Lahirnya tren 'es kopi susu gula aren' beberapa tahun lalu membuat kopi bisa dinikmati oleh berbagai kalangan, bahkan yang awalnya tidak menyukai rasa pahit kopi.",
      "Ngopi bukan lagi sekadar minum; ini adalah momen relaksasi, pencarian inspirasi, dan koneksi. Apa kopi pesanan favoritmu saat nongkrong di LNR?"
    ]
  },
  {
    id: "jenis-biji-kopi",
    title: "Mengenal Jenis-Jenis Biji Kopi Terbaik di Dunia",
    summary: "Arabica vs Robusta? Apa bedanya? Mari kenali ragam biji kopi yang ada di cangkir Anda.",
    category: "Edukasi",
    readTime: "3 Min",
    content: [
      "Secara umum, ada dua jenis biji kopi komersial yang paling merajai pasar dunia: Arabica dan Robusta. Namun, ada juga Liberica dan Excelsa yang tidak kalah menarik.",
      "**1. Kopi Arabica (Coffea arabica):** Menguasai sekitar 60-70% produksi dunia. Arabica dikenal dengan rasanya yang kompleks, memiliki tingkat keasaman (acidity) yang lebih tinggi, dan aroma buah atau bunga. Kadar kafeinnya juga lebih rendah dibandingkan Robusta.",
      "**2. Kopi Robusta (Coffea canephora):** Tumbuh di dataran yang lebih rendah dan lebih tahan terhadap hama. Rasanya lebih pahit, kental (full body), dengan sedikit nuansa kacang-kacangan atau cokelat. Robusta memiliki kadar kafein yang hampir dua kali lipat lebih tinggi dari Arabica, membuatnya sangat cocok dijadikan Espresso base.",
      "**3. Kopi Liberica:** Memiliki ukuran biji yang lebih besar dan rasa yang unik, sering digambarkan memiliki sentuhan *smoky* atau *woody*. Produksinya sangat terbatas.",
      "Di LNR Coffee, kami memadukan biji-biji kopi pilihan (house blend) yang dirancang khusus untuk menciptakan harmoni rasa terbaik di setiap seruputan."
    ]
  }
];
