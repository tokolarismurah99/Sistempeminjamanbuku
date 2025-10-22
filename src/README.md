# 📚 SmartLib Ubhara - Real-Time Library Management System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Supabase](https://img.shields.io/badge/Supabase-Real--time%20Sync-green)
![React](https://img.shields.io/badge/React-TypeScript-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4.0-cyan)

> Sistem Peminjaman Buku Perpustakaan berbasis web dengan Real-time Sync untuk **Universitas Bhayangkara Jakarta Raya**

---

## 🌟 Highlights

- ⚡ **Real-time Sync** - Perubahan data langsung terlihat di semua device
- 🌐 **Multi-device Support** - Akses dari laptop, tablet, smartphone bersamaan
- 🛒 **Shopping Cart System** - E-commerce style borrowing experience
- 📱 **Barcode System** - QR code untuk peminjaman & pengembalian
- 💰 **Auto Late Fee** - Perhitungan denda otomatis (Rp 2,000/buku/hari)
- 📊 **Admin Dashboard** - Statistik lengkap & activity log real-time
- 🎨 **Modern UI** - Emerald green & warm orange theme (Ubhara colors)
- 📅 **Flexible Dates** - Member bisa pilih tanggal mulai peminjaman
- 🔐 **Secure** - Row Level Security (RLS) policies

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd smartlib-ubhara
npm install
```

### 2. Setup Supabase
1. Buat Supabase project baru di https://supabase.com
2. Copy URL & Anon Key ke `/utils/supabase/info.tsx`
3. Run `/supabase/schema.sql` di Supabase SQL Editor
4. Run `/supabase/seed-data.sql`
5. Disable RLS untuk development (optional)

### 3. Run & Test
```bash
npm run dev
```

**Login:**
- Admin: `admin@ubhara.ac.id` / `admin123`
- Member: `budi.santoso@student.ubhara.ac.id` / `member123`

### 4. Deploy ke Netlify
```bash
# Push to GitHub first
git add .
git commit -m "SmartLib Ubhara - Production Ready"
git push

# Connect to Netlify via UI atau CLI
npm install -g netlify-cli
netlify deploy --prod
```
**Environment Variables di Netlify:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 📖 Documentation

| File | Purpose | 
|------|---------|
| **[DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)** | 🚀 Deploy ke Vercel - Step by Step |
| **[Attributions.md](./Attributions.md)** | 📚 Credits & Licenses |

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime (WebSocket)
- **Icons**: Lucide React
- **Notifications**: Sonner Toast

### Database Schema
```
┌─────────┐
│  users  │ (Admin & Members)
└────┬────┘
     │
     ▼
┌──────────────┐
│  borrowings  │ (Transactions + Barcode)
└──────┬───────┘
       │
       ▼
┌───────────────────┐      ┌────────┐
│ borrowing_details │─���───►│  books │ (20+ books)
└───────────────────┘      └────────┘

┌────────────┐
│ activities │ (Activity Log)
└────────────┘
```

**5 Tables**:
1. `books` - Koleksi buku (20 buku initial)
2. `users` - Admin & Member accounts
3. `borrowings` - Transaksi peminjaman
4. `borrowing_details` - Detail buku per transaksi
5. `activities` - Log semua aktivitas sistem

---

## ✨ Features

### 👤 Member Features
- ✅ Browse katalog buku dengan filter & search
- ✅ Shopping cart untuk multiple books
- ✅ Pilih tanggal mulai & durasi peminjaman
- ✅ Generate QR barcode untuk scan di petugas
- ✅ Track status peminjaman real-time
- ✅ Request pengembalian dengan barcode
- ✅ Lihat history peminjaman
- ✅ Daftar akun sendiri (self-registration)

### 🛡️ Admin Features
- ✅ Dashboard dengan statistik lengkap
- ✅ Kelola buku (tambah/edit/hapus)
- ✅ Update stock real-time
- ✅ Konfirmasi peminjaman via barcode scan
- ✅ Konfirmasi pengembalian dengan auto late fee
- ✅ Activity log real-time (semua user actions)
- ✅ Print receipt peminjaman & pengembalian
- ✅ Lihat semua borrowings & users

### 🔥 Real-time Sync
- ⚡ Books update sync (add/edit/delete)
- ⚡ Stock changes sync across devices
- ⚡ Borrowing status sync (member ↔ admin)
- ⚡ Activity log live stream
- ⚡ Multi-user concurrent access
- ⚡ Auto-reconnect on network issues

---

## 📊 Project Structure

```
smartlib-ubhara/
├── App.tsx                    # Main app dengan Supabase integration
├── components/
│   ├── LoginPage.tsx          # Login form
│   ├── RegisterPage.tsx       # Member registration
│   ├── BookCatalog.tsx        # Browse books (Member)
│   ├── CartPage.tsx           # Shopping cart
│   ├── BorrowingPage.tsx      # My borrowings (Member)
│   ├── AdminDashboard.tsx     # Statistics & charts
│   ├── AdminBookManagement.tsx # CRUD books
│   ├── AdminBorrowingConfirmation.tsx  # Confirm borrows
│   ├── AdminReturnConfirmation.tsx     # Confirm returns
│   ├── BarcodeDisplay.tsx     # QR code dialog
│   ├── PrintReceipt.tsx       # Print receipt
│   └── ui/                    # Shadcn components
├── utils/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client
│   │   ├── hooks.ts           # Custom real-time hooks
│   │   └── info.tsx           # Project credentials
│   ├── barcode.ts             # Barcode generator
│   └── export.ts              # Export utilities
├── supabase/
│   ├── schema.sql             # Database schema + RLS
│   └── seed-data.sql          # 20 books seed data
├── types/
│   └── index.ts               # TypeScript types
└── data/
    └── mockData.ts            # Mock data for reference
```

---

## 🎯 Workflow

### Member Borrowing Flow
1. **Browse** katalog buku
2. **Add to cart** multiple books
3. **Set dates** (tanggal pinjam & kembali)
4. **Checkout** → Generate barcode
5. **Show barcode** ke petugas admin
6. **Wait** → Admin confirm
7. **Status active** → Ambil buku
8. **Due date** reminder
9. **Return request** → Generate return barcode
10. **Admin confirm** → Buku dikembalikan

### Admin Confirmation Flow
1. **Dashboard** → Monitor pending requests
2. **Tab "Pinjam"** → Lihat pending borrowings
3. **Scan/input barcode** member
4. **Verify stock** available
5. **Confirm** → Stock berkurang otomatis
6. **Print receipt** untuk member
7. **Activity logged** real-time

---

## 🔧 Configuration

### Supabase Project
```
Project ID:   tvxoisuuyxvvbglhkwnt
URL:          https://tvxoisuuyxvvbglhkwnt.supabase.co
Anon Key:     (Stored in /utils/supabase/info.tsx)
```

### Environment
No `.env` file needed! Credentials hardcoded in `/utils/supabase/info.tsx` (auto-generated).

---

## 🧪 Testing

### Real-time Multi-device Test
1. **Buka 2 browser berbeda** (Chrome + Firefox)
2. **Browser 1:** Login sebagai Admin
3. **Browser 2:** Login sebagai Member
4. **Test:** Admin tambah buku → Langsung muncul di Member tanpa refresh! ✨

### Borrowing Flow Test
1. **Member:** Add buku ke cart → Checkout
2. **Member:** Dapat barcode → Status "Pending"
3. **Admin:** Tab "Pinjam" → Confirm
4. **Member:** Status auto update ke "Active" (real-time!)
5. **Member:** Request pengembalian
6. **Admin:** Confirm pengembalian → Stock auto update!

---

## 📚 Initial Data

### Books (20 buku)
- **7 Harry Potter series** (Philosopher's Stone → Deathly Hallows)
- **3 Fantastic Beasts series**
- **Indonesia**: Laskar Pelangi, Bumi Manusia, Filosofi Teras
- **International**: Sapiens, Atomic Habits, Psychology of Money
- **Tech**: Clean Code, Algoritma & Pemrograman

All with:
- ✅ Real cover images (Unsplash)
- ✅ Stock: 5 eksemplar per buku
- ✅ Complete metadata (author, publisher, year, genre)

### Users (2 accounts)
```
Admin:
  Name:  Administrator
  Email: admin@ubhara.ac.id
  Pass:  admin123
  ID:    ADM-000001

Member:
  Name:  Budi Santoso
  Email: budi.santoso@student.ubhara.ac.id
  Pass:  member123
  ID:    MEM-000001
```

---

## 🔐 Security

### Row Level Security (RLS)
- ✅ Enabled untuk semua tables
- ✅ Public read untuk books (catalog)
- ✅ Authenticated write untuk borrowings
- ✅ Activity log read-only untuk audit

### Best Practices
- ⚠️ Passwords stored plain text (for demo)
- 🔒 Production: Use Supabase Auth + bcrypt
- 🔒 Production: Implement role-based policies
- 🔒 Production: HTTPS only

---

## 🚀 Deployment

### Deploy ke Netlify (Recommended)

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "SmartLib Ubhara - Production Ready"
git push origin main
```

**Step 2: Connect to Netlify**
1. Login ke https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub repository
4. **Build settings:**
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
5. **Environment variables:**
   - `VITE_SUPABASE_URL` = `https://tvxoisuuyxvvbglhkwnt.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
6. Click **"Deploy site"**

**Step 3: Auto Deploy**
✅ Every push to `main` = Auto deploy!

### Netlify CLI (Alternative)
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Development
```bash
npm run dev
# → http://localhost:5173
```

---

## 🐛 Troubleshooting

### ❌ Data tidak muncul / Loading stuck
```sql
-- Check data di Supabase SQL Editor
SELECT COUNT(*) FROM books; -- Harus 20
SELECT COUNT(*) FROM users; -- Harus 2
```

### ❌ RLS blocking insert/update
```sql
-- Disable RLS untuk development
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
```

### ❌ Realtime tidak sync
1. Check browser console (F12)
2. Pastikan Realtime enabled untuk 5 tables
3. Hard refresh browser (Ctrl+Shift+R)

### ❌ Deployment error "Failed to fetch"
1. Set environment variables di Vercel
2. Check VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
3. Redeploy

---

## 📞 Support

- 📖 **Docs**: See `/QUICK-START.md` untuk setup
- 🐛 **Issues**: Check console errors first
- 💬 **Supabase Discord**: https://discord.supabase.com
- 📚 **Supabase Docs**: https://supabase.com/docs

---

## 📝 License

Educational project untuk **Universitas Bhayangkara Jakarta Raya**

---

## 🙏 Credits

**Built with**:
- React + TypeScript
- Supabase (PostgreSQL + Real-time)
- Tailwind CSS v4
- Shadcn/UI
- Lucide Icons
- Unsplash (Book covers)

**Logo**: Universitas Bhayangkara Jakarta Raya

---

## 🎉 Ready to Go!

1. **Setup Database**: Run `schema.sql` & `seed-data.sql` di Supabase
2. **Run Locally**: `npm run dev`
3. **Test Real-time**: Open 2 browsers, lihat magic! ✨
4. **Deploy Live**: `vercel` → Online dalam 2 menit! 🚀

**Panduan Deploy Lengkap:** [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)

---

**SmartLib Ubhara v2.0**  
*Real-time Multi-device Library Management System*

**Status**: ✅ Production Ready | 🚀 Deployed  
**Supabase Project**: tvxoisuuyxvvbglhkwnt  
**Last Updated**: October 21, 2025

---

⭐ **Happy Coding & Deploying!** ⭐
