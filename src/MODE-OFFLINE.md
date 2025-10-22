# 🔌 Mode Offline - SmartLib Ubhara

## 📋 Overview

SmartLib Ubhara sekarang mendukung **mode offline/demo** yang otomatis menggunakan data mock jika Supabase tidak tersedia.

---

## ✅ Fitur yang Tersedia di Mode Offline

### 🔓 Login & Authentication
- ✅ Login dengan 2 user demo:
  - **Admin**: username `admin` / password `admin123`
  - **Member**: username `budi` / password `budi123`
- ✅ Quick login button berfungsi penuh
- ✅ Session management tetap berjalan

### 📚 Katalog Buku
- ✅ Menampilkan **20 buku** dari mock data
- ✅ Pencarian & filter berfungsi normal
- ✅ Detail buku dapat dilihat
- ✅ Add to cart berfungsi

### 🛒 Shopping Cart
- ✅ Menambah/mengurangi buku di cart
- ✅ Set tanggal peminjaman
- ✅ Lihat ringkasan peminjaman

### 📊 Dashboard Admin (View Only)
- ✅ Melihat statistik dasar
- ✅ Melihat activity log demo
- ✅ Navigasi antar tab berfungsi

---

## ❌ Fitur yang Tidak Tersedia di Mode Offline

Fitur berikut akan menampilkan error "Database offline":

- ❌ **Checkout/Peminjaman Buku**: Tidak bisa membuat transaksi baru
- ❌ **Registrasi Member Baru**: Tidak bisa mendaftar user baru
- ❌ **Manajemen Buku (Admin)**: Tidak bisa tambah/edit/hapus buku
- ❌ **Konfirmasi Peminjaman (Admin)**: Tidak bisa approve/reject
- ❌ **Konfirmasi Pengembalian (Admin)**: Tidak bisa proses return
- ❌ **Real-time Sync**: Perubahan tidak tersinkronisasi

---

## 🎯 Data Mock yang Tersedia

### 📖 Buku (20 items)
- Laskar Pelangi - Andrea Hirata
- Bumi Manusia - Pramoedya Ananta Toer
- Filosofi Teras - Henry Manampiring
- Sapiens - Yuval Noah Harari
- Atomic Habits - James Clear
- The Psychology of Money - Morgan Housel
- Algoritma dan Pemrograman - Rinaldi Munir
- Sejarah Indonesia Modern - M.C. Ricklefs
- Clean Code - Robert C. Martin
- Rich Dad Poor Dad - Robert Kiyosaki
- **Harry Potter Series** (7 buku)
- **Fantastic Beasts Series** (3 buku)

### 👥 Users (2 items)
```javascript
// Admin
{
  id: 'admin-001',
  name: 'Admin Perpustakaan',
  email: 'admin',
  password: 'admin123',
  membershipId: 'ADM-000001',
  role: 'admin'
}

// Member
{
  id: 'member-001',
  name: 'Budi Santoso',
  email: 'budi',
  password: 'budi123',
  membershipId: 'MEM-000001',
  role: 'member'
}
```

### 📝 Activities (3 demo logs)
- Admin login ke sistem
- Budi Santoso registrasi
- Admin menambahkan buku Laskar Pelangi

### 📦 Borrowings
- Kosong (tidak ada data peminjaman)

---

## 🚀 Cara Mengaktifkan Mode Online

Jika ingin mengaktifkan fitur database penuh:

### 1️⃣ Buat Project Supabase Baru
```bash
# Buka https://supabase.com
# Buat project baru
# Catat Project ID dan Anon Key
```

### 2️⃣ Update Credentials
Edit file `/utils/supabase/info.tsx`:
```typescript
export const projectId = "your-project-id-here"
export const publicAnonKey = "your-anon-key-here"
```

### 3️⃣ Setup Database
Jalankan SQL files di Supabase SQL Editor:
1. `/supabase/schema.sql` - Buat tabel
2. `/supabase/seed-data.sql` - Isi data awal

### 4️⃣ Refresh Aplikasi
Setelah setup, refresh browser dan semua fitur akan aktif!

---

## 🔍 Cara Mendeteksi Mode Offline

Sistem otomatis mendeteksi mode offline dengan:

1. **Console Warning**: Lihat browser console untuk pesan:
   ```
   ⚠️ Supabase tidak tersedia, menggunakan mock data untuk books
   ⚠️ Supabase tidak tersedia, menggunakan mock data untuk users
   ```

2. **Error Message**: Saat mencoba fitur write (checkout, register, dll):
   ```
   Database offline - fitur peminjaman tidak tersedia dalam mode demo
   ```

3. **Quick Login Warning**: Di halaman login, jika database belum setup akan muncul warning orange.

---

## 💡 Tips Development

### Testing UI/UX
Mode offline sangat cocok untuk:
- ✅ Testing layout & styling
- ✅ Validasi flow user interface
- ✅ Demo ke stakeholder
- ✅ Development frontend tanpa backend

### Testing Fitur Lengkap
Untuk testing fitur database (checkout, dll), **harus setup Supabase**.

---

## 🎨 Placeholder di Login Form

Placeholder input sekarang lebih jelas:
- **Email/Username**: "Masukkan email / username"
- **Password**: "••••••••"

---

## 📞 Troubleshooting

### Q: Kenapa buku tidak muncul?
**A**: Periksa browser console. Jika ada error selain warning Supabase, mungkin ada masalah lain.

### Q: Kenapa Quick Login tidak berfungsi?
**A**: Quick login seharusnya selalu berfungsi di mode offline. Cek console untuk error.

### Q: Bisa tambah buku di mode offline?
**A**: Tidak bisa. Fitur write (tambah/edit/hapus) memerlukan database aktif.

### Q: Data hilang setelah refresh?
**A**: Di mode offline, data mock selalu fresh setiap refresh. Session user tersimpan di localStorage.

---

## 🌟 Kesimpulan

Mode offline memungkinkan development dan demo tanpa setup database Supabase. Untuk fitur lengkap, hubungkan ke Supabase sesuai panduan di atas.

**Status Saat Ini**: 📱 Full Local Development Mode ✅
