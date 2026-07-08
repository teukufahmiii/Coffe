# Entity Relationship Diagram (ERD) LNR Coffee

Berikut adalah representasi visual ERD dari arsitektur database Supabase LNR Coffee, direpresentasikan dalam format **Mermaid.js** agar dapat dirender secara visual pada penampil Markdown yang mendukung (seperti GitHub).

## Diagram Skema (Mermaid)

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : "places"
    PROFILES ||--o{ POINT_TRANSACTIONS : "has"
    PROFILES ||--o{ REVIEWS : "writes"
    
    BRANCHES ||--o{ ORDERS : "receives"
    BRANCHES ||--o{ REVIEWS : "gets"
    
    MENU_ITEMS ||--o{ ORDER_ITEMS : "included_in"
    
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ REVIEWS : "linked_to"
    
    PROFILES {
        uuid id PK "auth.users ID"
        text name
        text phone "UNIQUE"
        text pin "For Auth"
        text role "customer / admin"
        integer points "Default: 0"
        timestamp created_at
    }

    BRANCHES {
        uuid id PK
        text name
        text slug "UNIQUE"
        text address
        boolean is_active "Default: true"
    }

    MENU_ITEMS {
        uuid id PK
        text name
        text category "coffee / non-coffee dll"
        integer price
        text description
        text image_url
        text[] available_branches "Array of branch slugs"
        jsonb options "Add-ons, cup size dll"
    }

    ORDERS {
        uuid id PK
        uuid user_id FK "Refs profiles(id)"
        text branch_slug FK "Refs branches(slug)"
        text type "pickup / delivery / dine-in"
        text status "pending / processing / ready / completed"
        integer total "Total Price"
        text payment_method "tripay / kasir / point"
        text payment_status "unpaid / paid / failed"
        text checkout_url "Tripay URL"
        text table_number "For Dine-in"
        text delivery_address "For Delivery"
        timestamp created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK "Refs orders(id)"
        uuid menu_item_id FK "Refs menu_items(id)"
        integer quantity
        integer price_at_time
        jsonb options_selected
        text notes
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK "Refs profiles(id)"
        uuid order_id FK "Refs orders(id)"
        text branch_slug FK "Refs branches(slug)"
        integer rating "1 to 5"
        text comment
        timestamp created_at
    }

    VOUCHERS {
        uuid id PK
        text code "UNIQUE"
        text discount_type "percentage / fixed"
        integer discount_value
        integer min_purchase
        boolean is_active
    }

    POINT_TRANSACTIONS {
        uuid id PK
        uuid user_id FK "Refs profiles(id)"
        integer amount "+ or -"
        text type "earned / redeemed"
        text description
        timestamp created_at
    }
```

## Rincian Relasi & Penjelasan

1. **PROFILES (One-to-Many) ke ORDERS, REVIEWS, POINT_TRANSACTIONS**
   - Setiap pengguna (`profiles`) bisa memiliki banyak pesanan (`orders`), menulis banyak ulasan (`reviews`), dan memiliki banyak riwayat poin (`point_transactions`).
   - `id` di `profiles` berelasi langsung dengan tabel bawaan `auth.users` di Supabase.

2. **BRANCHES (One-to-Many) ke ORDERS & REVIEWS**
   - Satu cabang / outlet (`branches`) dapat menerima banyak pesanan dan mendapatkan banyak ulasan. Relasi dikaitkan menggunakan kolom `slug` agar URL mudah dibaca.

3. **ORDERS (One-to-Many) ke ORDER_ITEMS**
   - Satu pesanan (`orders`) harus memiliki satu atau lebih rincian barang/minuman (`order_items`).
   - Apabila baris di tabel `orders` dihapus, seluruh baris `order_items` miliknya juga akan terhapus (*CASCADE DELETE*).

4. **ORDERS (One-to-One / One-to-Many) ke REVIEWS**
   - Satu pesanan dapat diberikan satu ulasan oleh pelanggan setelah status pesanan berubah menjadi `completed`.

5. **MENU_ITEMS (One-to-Many) ke ORDER_ITEMS**
   - Setiap minuman / menu (`menu_items`) dapat dibeli berkali-kali di berbagai transaksi pesanan (`order_items`).
   - Harga saat dibeli (`price_at_time`) disimpan terpisah di `order_items` untuk mencegah perubahan riwayat harga jika harga asli di `menu_items` diubah oleh admin.

6. **VOUCHERS (Independen)**
   - Vouchers berdiri sendiri dan divalidasi pada saat proses checkout menggunakan kolom unik `code`.
