# 🔧 FIX: Double Counting Bug di Dashboard

## 📋 Problem Statement

**Bug:** Pinjam 2 buku → "Stok Buku Tersedia" berkurang 4 (bukan 2)

**Expected:** 
- Pinjam 2 buku → Stok tersedia berkurang 2
- Total stok 100 → Pinjam 2 → Tersedia 98

**Actual (BEFORE FIX):**
- Pinjam 2 buku → Stok tersedia berkurang 4
- Total stok 100 → Pinjam 2 → Tersedia 96 ❌

## 🔍 Root Cause: DOUBLE COUNTING

### Konsep Stock Management di Sistem

Sistem menggunakan **REAL-TIME STOCK REDUCTION**:
1. Saat admin **confirm borrowing**, stock LANGSUNG dikurangi dari database
2. Stock di `books` array represent **CURRENT AVAILABLE STOCK**
3. Stock TIDAK perlu dikurangi lagi di calculation!

### Bug di AdminDashboard (BEFORE FIX)

```typescript
// ❌ SALAH - Double counting!
const totalBooks = books.reduce((sum, book) => sum + book.stock, 0);
const borrowedBooksCount = /* count dari active borrowings */
const availableBooks = totalBooks - borrowedBooksCount; // ← BUG!
```

**Kenapa ini salah?**

Flow yang sebenarnya terjadi:
```
Initial State:
- Book A: stock = 10
- Book B: stock = 10
- Total = 20
- Available = 20

User pinjam 2 buku (A=1, B=1):
1. Checkout → Create borrowing (status='pending')
   - Stock BELUM berubah
   
2. Admin confirm:
   - handleConfirmBorrowing() dipanggil
   - Stock DIKURANGI: Book A = 9, Book B = 9
   - Total = 18 ← Stock sudah berkurang!
   - Borrowing status: pending → active
   
3. Dashboard calculation (BUG):
   - totalBooks = 18 (current stock)
   - borrowedBooksCount = 2 (from active borrowings)
   - availableBooks = 18 - 2 = 16 ❌ SALAH!
   
Harusnya:
   - availableBooks = 18 ✅ (stock sudah dikurangi!)
```

**Stock dikurangi 2x:**
1. ✅ Reduction #1: Saat confirm (Book A: 10→9, Book B: 10→9) - BENAR
2. ❌ Reduction #2: Di calculation (18 - 2 = 16) - SALAH!

## 🛠️ The Fix

### Perubahan di AdminDashboard.tsx

```typescript
// ✅ CORRECT - No double counting!
const totalBooks = books.reduce((sum, book) => sum + book.stock, 0);

// totalBooks SUDAH adalah available books!
// Stock sudah dikurangi saat konfirmasi, jadi TIDAK perlu dikurangi lagi
const availableBooks = totalBooks;

const borrowedBooksCount = /* count dari active borrowings */ // For display only
```

### Flow Setelah Fix

```
User pinjam 2 buku (A=1, B=1):

1. Checkout → borrowing created (pending)
   - Stock: Book A=10, Book B=10
   
2. Admin confirm:
   - Stock reduction: Book A=9, Book B=9
   - Total stock = 18
   - Borrowing status = active
   
3. Dashboard display (FIXED):
   - "Stok Buku Tersedia" = 18 ✅
   - "Buku Dipinjam" = 2 ✅
   - 18 + 2 = 20 (original total) ✅
```

## 📊 Stats Card Changes

**BEFORE:**
- Title: "Total Stok Buku Tersedia"
- Value: `totalBooks - borrowedBooksCount` ❌
- Subtitle: "X judul • Y eks siap dipinjam"

**AFTER:**
- Title: "Stok Buku Tersedia"
- Value: `totalBooks` ✅
- Subtitle: "X judul • Y eks tersedia"

## 🎯 Key Concepts

### Real-time Stock Management
```
Stock Reduction terjadi di: handleConfirmBorrowing()
├─ Saat admin CONFIRM borrowing
├─ Stock langsung dikurangi dari books array
├─ Disimpan ke localStorage
└─ Dashboard tinggal DISPLAY current stock

TIDAK ada reduction di:
├─ Dashboard calculation
├─ Display/render
└─ Report generation
```

### Stock Lifecycle
```
1. CHECKOUT (Member)
   → Create borrowing (status='pending')
   → Stock BELUM berubah
   
2. CONFIRM (Admin)
   → Stock DIKURANGI ← Only reduction!
   → Borrowing status = active
   
3. RETURN (Admin)
   → Stock DIKEMBALIKAN
   → Borrowing status = completed
```

## ✅ Testing

### Test Scenario
```javascript
// Initial state
localStorage.clear();
// Book A: stock = 10
// Book B: stock = 10
// Total = 20

// Test 1: Pinjam 1 buku
Member checkout: Book A qty=1
Admin confirm
Expected: Tersedia = 19, Dipinjam = 1 ✅

// Test 2: Pinjam 2 buku berbeda
Member checkout: Book A qty=1, Book B qty=1
Admin confirm
Expected: Tersedia = 18, Dipinjam = 2 ✅

// Test 3: Kembalikan buku
Admin confirm return: Book A qty=1
Expected: Tersedia = 19, Dipinjam = 1 ✅
```

## 🔍 Console Logs

Setelah fix, console log akan menunjukkan:
```
📊 ═══════════ STOCK VALIDATION ═══════════
📊 Available books (current stock): 18 books across 20 titles
📊 Currently borrowed: 2 books
📊 Formula: Available = Current Stock (sudah dikurangi saat confirm)
📊 Logic: Ketika confirm borrowing, stock LANGSUNG dikurangi
📊        Jadi totalBooks SUDAH represent available books
📊 ✅ No double counting! Stock reduction only happens ONCE at confirmation.
📊 ═══════════════════════════════════════
```

## 📝 Files Changed

1. `/components/AdminDashboard.tsx`
   - Line 149: `const availableBooks = totalBooks;` (was: `totalBooks - borrowedBooksCount`)
   - Line 213-225: Updated validation logs
   - Line 229: Updated stats card title & subtitle

## ✅ Status: RESOLVED

Bug "stock berkurang 2x lipat" sudah **100% FIXED**.

**Root cause:** Double counting (stock dikurangi saat confirm + dikurangi lagi di calculation)
**Solution:** Remove subtraction di calculation, karena stock sudah represent available books
**Result:** Stock reduction hanya terjadi 1x (saat confirm), calculation hanya display value
