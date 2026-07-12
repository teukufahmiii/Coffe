# Entity Relationship Diagram (ERD) LNR Coffee

Berikut adalah representasi visual ERD dari arsitektur database Supabase LNR Coffee, yang telah diperbarui dengan fitur-fitur terbaru (Aktivitas Login, Keamanan PIN, dan Dashboard Terpisah).

## Diagram Skema (Mermaid)

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : "places (by customer_phone)"
    PROFILES ||--o{ REVIEWS : "writes"
    
    BRANCHES ||--o{ ORDERS : "receives"
    BRANCHES ||--o{ REVIEWS : "gets"
    
    MENU_ITEMS ||--o{ ORDER_ITEMS : "included_in"
    
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ REVIEWS : "linked_to"
    
    PROFILES {
        uuid id PK
        text phone "UNIQUE"
        text name
        text pin
        text avatar_url
        integer points
        timestamp created_at
    }

    BRANCHES {
        uuid id PK
        text name
        text slug "UNIQUE"
        text address
        float latitude
        float longitude
        text phone
        text access_pin "Dashboard PIN"
        boolean is_active
        integer avg_prep_time_minutes
    }

    MENU_ITEMS {
        uuid id PK
        text name
        text category "coffee / non-coffee / snack"
        integer price
        text description
        text image_url
        boolean available
    }

    ORDERS {
        uuid id PK
        integer table_number
        text status "pending / cooking / served / completed dll"
        numeric total
        text note
        uuid branch_id FK "Refs branches(id)"
        text order_type "dine-in / pickup / delivery / kasir"
        integer queue_number "Daily queue"
        text customer_name
        text customer_phone
        text customer_address
        float customer_lat
        float customer_lng
        text driver_type "gosend / grabexpress"
        text payment_channel
        timestamp created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK "Refs orders(id)"
        uuid menu_item_id FK "Refs menu_items(id)"
        text name
        numeric price
        integer qty
        text note
    }

    REVIEWS {
        uuid id PK
        uuid order_id FK "Refs orders(id) UNIQUE"
        uuid branch_id FK "Refs branches(id)"
        integer rating "1 to 5"
        text[] tags
        text comment
        jsonb product_ratings
        timestamp created_at
    }

    VOUCHERS {
        uuid id PK
        text code "UNIQUE"
        text title
        text discount_type "percentage / fixed"
        numeric discount_amount
        numeric min_order_amount
        boolean is_active
        integer points_required
    }

    MASTER_ADMIN_SETTINGS {
        integer id PK
        text pin "Master PIN"
        text developer_pin "Dev PIN"
        timestamp updated_at
    }

    LOGIN_SESSIONS {
        uuid id PK
        text user_type "admin / developer / master"
        text identifier
        text ip_address
        text location
        text user_agent
        boolean is_active
        timestamp login_time
        timestamp last_active
    }
```

## Rincian Perubahan & Penjelasan Relasi

1. **BRANCHES**
   - Kolom `latitude` dan `longitude` digunakan untuk deteksi outlet terdekat secara otomatis.
   - Kolom `access_pin` memisahkan akses PIN per outlet (Bukan lagi satu PIN Master untuk semua outlet).

2. **ORDERS**
   - Kolom `order_type` sekarang mendukung `'kasir'` selain mode pelanggan (dine-in, pickup, delivery).
   - Penambahan `queue_number` untuk mengatur antrean cetak struk (reset setiap hari).
   - Detail pembeli langsung disimpan di orders (`customer_name`, `customer_phone`, dll) tanpa harus memaksa Foreign Key ke tabel profiles, memudahkan pesanan *Guest* / kasir offline.

3. **ORDER_ITEMS & MENU_ITEMS**
   - Rincian pesanan langsung menempel di `orders` dan mereferensikan `menu_items` jika ID-nya masih ada.

4. **MASTER_ADMIN_SETTINGS**
   - Memisahkan otentikasi `pin` (Pemilik) dengan `developer_pin` (IT / Pengembang) agar akses sistem sangat aman.

5. **LOGIN_SESSIONS**
   - Tabel independen untuk melacak siapa saja yang sedang mengakses dashboard (Outlet, Master, atau Dev).
   - Kolom `is_active` digunakan untuk melakukan fitur **Force Logout** dari jarak jauh (ditangani oleh realtime listener).

6. **CATATAN SISTEM AI ASISTEN**
   - **LNR Asisten AI** tidak memiliki tabel khusus di Supabase. Sistem AI bersifat *stateless* (tidak menyimpan data percakapan di database). Percakapan berjalan murni di sisi memori lokal pengguna (browser RAM) untuk menjaga privasi pengguna serta menghemat beban pembacaan/penulisan *(read/write)* server secara drastis. State nama pengguna yang digunakan oleh AI diambil secara langsung melalui sesi *Login* yang aktif pada browser.
