# 🔐 SMARTLIB UBHARA - LOGIN CREDENTIALS

**Quick Reference untuk Testing**

---

## 👤 ADMIN ACCOUNT

```
Username: admin
Password: admin123
Role:     Admin
ID:       ADM-000001
Name:     Admin Perpustakaan
```

**Access:**
- ✅ Konfirmasi Peminjaman
- ✅ Konfirmasi Pengembalian  
- ✅ Dashboard Analytics
- ✅ Kelola Buku (Add/Edit/Delete)
- ✅ View all borrowings
- ✅ Export data (Excel/PDF)

---

## 👤 MEMBER ACCOUNT

```
Username: budi
Password: budi123
Role:     Member
ID:       MEM-000001
Name:     Budi Santoso
```

**Access:**
- ✅ Browse Katalog Buku
- ✅ Add to Cart
- ✅ Checkout (Request Borrowing)
- ✅ View Pinjaman Saya
- ✅ Request Return

**Pre-loaded Borrowings:**
🧹 **NONE - Database dimulai BERSIH!**

Test dengan create borrowing baru via checkout flow.

---

## 🔧 TESTING FLOWS:

### Flow 1: Member Checkout
```
1. Login as Budi
2. Browse Katalog → Add buku ke cart
3. Go to Keranjang
4. Set tanggal pinjam & kembali
5. Click "Checkout"
6. ✅ Show barcode dialog
7. Screenshot barcode
```

### Flow 2: Admin Confirm Borrowing
```
1. Login as Admin
2. Go to "Konfirmasi Peminjaman"
3. Scan/input barcode dari step 6 di atas
4. ✅ Dialog shows borrowing details
5. Click "Konfirmasi"
6. ✅ Status: pending → active
```

### Flow 3: Member Request Return
```
1. Login as Budi
2. Go to "Pinjaman Saya" → Active tab
3. Click "Ajukan Pengembalian"
4. ✅ Show return barcode
5. Screenshot return barcode
```

### Flow 4: Admin Confirm Return
```
1. Login as Admin
2. Go to "Konfirmasi Pengembalian"
3. Scan/input return barcode from step 5
4. ✅ Dialog shows return details
5. If late: Shows late fee calculation
6. Click "Konfirmasi Pengembalian"
7. ✅ Status: active/overdue → returned
8. ✅ Print receipt available
```

### Flow 5: Admin Dashboard
```
1. Login as Admin
2. Go to "Dashboard"
3. View stats:
   - Total Buku (20)
   - Sedang Dipinjam (tergantung aktif borrowings)
   - Menunggu Konfirmasi (tergantung pending)
   - Keterlambatan (tergantung overdue)
4. Click any stat card (if has data)
5. ✅ Dialog shows borrowing list
6. ✅ Text visible (white/gray)
```

### Flow 6: Admin Manage Books
```
1. Login as Admin
2. Go to "Kelola Buku"
3. Click "Tambah Buku"
4. Fill form → Save
5. ✅ Book added to catalog
6. Edit existing book
7. ✅ Book updated
8. Delete book
9. ✅ Confirmation dialog → Delete
```

---

## 📊 PRE-LOADED DATA:

### Books: 20
- Indonesian books (3)
- Self-development (3)
- Technology (3)
- Harry Potter series (7)
- Fantastic Beasts series (3)
- Economics (2)

### Users: 2
- 1 Admin
- 1 Member (Budi)

### Borrowings: 0
🧹 **DATABASE BERSIH - NO SAMPLE DATA!**
Test dengan create borrowing sendiri via checkout.

---

## 🎯 BARCODE EXAMPLES:

```
Borrow Barcode Format:  BC-MEM001-001
Return Barcode Format:  RET-BC-MEM001-002-xxxxx
```

**Existing Barcodes:**
🧹 **NONE - Database kosong!**

Barcode akan di-generate otomatis saat checkout:
- Format: `BC-<MembershipID>-<Counter>`
- Example: `BC-MEM000001-001`

---

## ⚠️ IMPORTANT NOTES:

1. **Late Fee Calculation:**
   ```
   Denda = Days Late × Total Books × Rp 2,000
   Example: 2 hari × 6 buku × Rp 2,000 = Rp 24,000
   ```

2. **Borrowing Status Flow:**
   ```
   pending → active → returning → returned
                ↓
             overdue (if late)
   ```

3. **Default Due Date:**
   - Auto-set to +14 days from borrow date
   - Can be customized before checkout

4. **Stock Management:**
   - Stock decreases when admin confirms borrowing
   - Stock increases when admin confirms return
   - Cart validates stock availability

---

**SIAP UNTUK TESTING!** 🚀
