# 🚀 SmartLib Ubhara - Supabase Setup Guide

## ✅ Connection Status
**Supabase Project ID:** `edhsgpjzreojwucbhbyr`  
**Status:** ✅ **CONNECTED**

---

## 📋 Step-by-Step Setup Instructions

### **Step 1: Access Supabase SQL Editor**

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Login ke project Anda: `edhsgpjzreojwucbhbyr`
3. Di sidebar kiri, klik **"SQL Editor"**

---

### **Step 2: Create Database Schema**

1. Di SQL Editor, klik **"New Query"**
2. Copy seluruh isi file `/supabase/schema.sql`
3. Paste ke SQL Editor
4. Klik tombol **"Run"** (atau tekan `Ctrl + Enter`)

**Yang akan dibuat:**
- ✅ Table `books` - Koleksi buku perpustakaan
- ✅ Table `users` - Data anggota & admin
- ✅ Table `borrowings` - Data peminjaman
- ✅ Table `borrowing_details` - Detail buku yang dipinjam
- ✅ Table `activities` - Log aktivitas sistem
- ✅ Indexes untuk performa query
- ✅ Row Level Security (RLS) policies
- ✅ Real-time subscriptions enabled
- ✅ 2 default users (Admin & Member)

---

### **Step 3: Seed Initial Data (20 Books)**

1. Buat **New Query** lagi di SQL Editor
2. Copy seluruh isi file `/supabase/seed-data.sql`
3. Paste ke SQL Editor
4. Klik **"Run"**

**Hasil:**
- ✅ 20 buku dengan cover REAL dari Unsplash
- ✅ Termasuk seri Harry Potter (7 buku)
- ✅ Termasuk seri Fantastic Beasts (3 buku)
- ✅ Buku Indonesia, Sains, Teknologi, Finance, dll

---

### **Step 4: Verify Data**

Di SQL Editor, jalankan query ini untuk cek data:

```sql
-- Cek jumlah buku
SELECT COUNT(*) as total_books FROM books;

-- Cek jumlah users
SELECT COUNT(*) as total_users FROM users;

-- Lihat semua buku
SELECT title, author, genre_buku, stok FROM books ORDER BY created_at;

-- Lihat users
SELECT name, email, role, membership_id FROM users;
```

**Expected Results:**
- `total_books`: **20**
- `total_users`: **2** (1 Admin + 1 Member)

---

### **Step 5: Enable Realtime (PENTING!)**

1. Di Supabase Dashboard, klik **"Database"** di sidebar
2. Klik tab **"Replication"**
3. Pastikan semua table berikut **ENABLED**:
   - ☑️ `books`
   - ☑️ `users`
   - ☑️ `borrowings`
   - ☑️ `borrowing_details`
   - ☑️ `activities`

4. Jika belum enabled, klik toggle untuk setiap table

---

## 🔐 Default Users

### Admin Account
```
Email: admin@ubhara.ac.id
Password: admin123
Membership ID: ADM-000001
Role: admin
```

### Member Account
```
Email: budi.santoso@student.ubhara.ac.id
Password: member123
Membership ID: MEM-000001
Role: member
```

---

## 📊 Database Schema Overview

### **Table: books**
```sql
Column         | Type    | Description
---------------|---------|---------------------------
id             | UUID    | Primary Key
title          | TEXT    | Judul buku
author         | TEXT    | Pengarang
publisher      | TEXT    | Penerbit
genre_buku     | TEXT    | Genre (sesuai requirement!)
description    | TEXT    | Deskripsi buku
cover_url      | TEXT    | URL cover dari Unsplash
tahun_terbit   | INTEGER | Tahun terbit
stok           | INTEGER | Jumlah stok tersedia
created_at     | TIMESTAMP | Waktu dibuat
```

### **Table: users**
```sql
Column         | Type    | Description
---------------|---------|---------------------------
id             | UUID    | Primary Key
name           | TEXT    | Nama lengkap
email          | TEXT    | Email (UNIQUE)
password       | TEXT    | Password (plain - untuk demo)
phone          | TEXT    | Nomor telepon
address        | TEXT    | Alamat
membership_id  | TEXT    | ID Keanggotaan (UNIQUE)
role           | TEXT    | 'admin' atau 'member'
join_date      | DATE    | Tanggal bergabung
avatar         | TEXT    | URL avatar
created_at     | TIMESTAMP | Waktu dibuat
```

### **Table: borrowings**
```sql
Column         | Type    | Description
---------------|---------|---------------------------
id             | UUID    | Primary Key
user_id        | UUID    | Foreign Key -> users.id
borrow_date    | DATE    | Tanggal pinjam
due_date       | DATE    | Tanggal jatuh tempo
return_date    | DATE    | Tanggal kembali (nullable)
status         | TEXT    | pending/active/returned/overdue/returning
barcode        | TEXT    | Barcode peminjaman
return_barcode | TEXT    | Barcode pengembalian (nullable)
created_at     | TIMESTAMP | Waktu dibuat
```

### **Table: borrowing_details**
```sql
Column         | Type    | Description
---------------|---------|---------------------------
id             | UUID    | Primary Key
borrowing_id   | UUID    | Foreign Key -> borrowings.id
book_id        | UUID    | Foreign Key -> books.id
quantity       | INTEGER | Jumlah buku
created_at     | TIMESTAMP | Waktu dibuat
```

### **Table: activities**
```sql
Column         | Type    | Description
---------------|---------|---------------------------
id             | UUID    | Primary Key
user_id        | UUID    | Foreign Key -> users.id
user_name      | TEXT    | Nama user
user_role      | TEXT    | Role user
action         | TEXT    | Jenis aksi (login/logout/borrow/etc)
description    | TEXT    | Deskripsi aktivitas
metadata       | JSONB   | Data tambahan (nullable)
timestamp      | TIMESTAMP | Waktu aktivitas
created_at     | TIMESTAMP | Waktu dibuat
```

---

## 🔥 Real-time Features

### **Auto-sync antar device:**
- ✅ Tambah buku → **Langsung muncul di semua device!**
- ✅ Konfirmasi peminjaman → **Real-time update!**
- ✅ Update stok → **Semua device sync!**
- ✅ Aktivitas → **Live log!**

### **Subscriptions Enabled:**
```typescript
// Frontend sudah punya hooks di /utils/supabase/hooks.ts
import { useBooks, useBorrowings, useActivities } from './utils/supabase/hooks';

// Otomatis listen real-time changes! ⚡
const { books } = useBooks(); // Auto-update!
const { borrowings } = useBorrowings(); // Auto-sync!
const { activities } = useActivities(); // Live log!
```

---

## ⚠️ Important Notes

### **Security (RLS Policies)**
- ✅ Row Level Security **ENABLED** di semua table
- ✅ Public dapat view data (read-only untuk anon)
- ✅ Authenticated users dapat CRUD
- ⚠️ **Untuk production:** Tambahkan auth policies lebih ketat!

### **Password Storage**
- ⚠️ Password saat ini **PLAIN TEXT** untuk demo
- ⚠️ **Untuk production:** Gunakan **bcrypt/argon2** untuk hashing
- ⚠️ Atau gunakan **Supabase Auth** untuk authentication

### **API Keys**
- ✅ Anon key sudah configured di `/utils/supabase/info.tsx`
- ⚠️ **JANGAN** share Service Role Key di frontend!
- ✅ Anon key AMAN untuk client-side (protected by RLS)

---

## 🧪 Testing Real-time Sync

### **Test 1: Multi-device Book Sync**
1. Buka app di 2 browser berbeda (Chrome + Firefox)
2. Login sebagai Admin di browser 1
3. Tambah buku baru
4. **✅ Buku langsung muncul di browser 2!** (tanpa refresh)

### **Test 2: Borrowing Real-time**
1. Login sebagai Member di device 1
2. Login sebagai Admin di device 2
3. Member checkout buku → Admin langsung lihat pending!
4. Admin konfirmasi → Member langsung update status!

### **Test 3: Stock Update Sync**
1. Admin update stok buku di device 1
2. **✅ Stok langsung sync di device 2!**
3. Member lihat perubahan real-time tanpa refresh!

---

## 📱 Next Steps

### **After Setup:**
1. ✅ Run schema.sql
2. ✅ Run seed-data.sql
3. ✅ Enable Realtime Replication
4. ✅ Verify data in SQL Editor
5. ✅ Test login dengan default users
6. 🎉 **DONE! App sudah real-time multi-device!**

### **Frontend Integration:**
- App.tsx akan otomatis pakai Supabase hooks
- LocalStorage sebagai fallback/cache
- Real-time subscriptions aktif
- Multi-device sync enabled

---

## 🆘 Troubleshooting

### **Problem: Data tidak sync**
**Solution:**
1. Cek Realtime Replication enabled
2. Cek RLS policies (boleh jadi block)
3. Open browser console, lihat error messages

### **Problem: Query error**
**Solution:**
1. Pastikan schema.sql sudah di-run semua
2. Cek table names (case-sensitive!)
3. Cek foreign key constraints

### **Problem: Login gagal**
**Solution:**
1. Pastikan seed-data.sql sudah di-run
2. Cek users table ada 2 default users
3. Password: `admin123` dan `member123`

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

---

**SmartLib Ubhara - Real-time Multi-device Library System** 🚀📚  
*Powered by Supabase & React*
