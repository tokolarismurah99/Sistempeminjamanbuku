# 🐛 Debugging Guide: Stock Reduction Issue

## Masalah
Saat konfirmasi peminjaman 1 buku, stock berkurang 2 (seharusnya hanya berkurang 1).

## Fix yang Sudah Diterapkan

### 1. ✅ Barcode Dialog Conflict - FIXED
**Masalah**: Saat klik "Ajukan Pengembalian", muncul 2 dialog (barcode pengembalian + barcode peminjaman)

**Root Cause**: 
- `BorrowingPage.tsx` menggunakan **single state** `showReturnBarcode` untuk:
  - Barcode peminjaman (status pending)
  - Barcode pengembalian (status returning)
- Saat klik button, kedua dialog ter-trigger karena:
  - `handleReturnClick` set `showReturnBarcode(true)` 
  - `App.tsx` juga set `showBarcodeDialog(true)`

**Solution**:
- Memisahkan state menjadi 2:
  - `showBorrowBarcode` untuk status pending
  - `showReturnBarcode` untuk status returning
- Render 2 dialog terpisah dengan conditional berdasarkan `borrowing.status`

### 2. 🔍 Enhanced Debugging untuk Stock Issue

**Comprehensive Logging Added**:

#### A. Cart Validation
```typescript
- Check duplicate bookIds in cart
- Validate total quantity
- Display cart breakdown
```

#### B. Borrowing Creation
```typescript
- Log borrowing details saat checkout
- Validate detail.quantity
- Check for duplicate details
```

#### C. Stock Confirmation
```typescript
- Pre-confirmation validation:
  - Duplicate borrowing IDs check
  - Duplicate bookIds in details check
  - Other active borrowings affecting same books
  
- During confirmation:
  - Stock BEFORE and AFTER
  - Actual vs Expected reduction
  - Rapid fire detection (< 100ms)
  
- Post-confirmation:
  - Negative stock detection
  - Total stock audit
```

#### D. localStorage Validation
```typescript
- Check duplicate borrowing IDs on load
- Check duplicate bookIds in details on load
- Detect corrupted data
```

#### E. AdminDashboard Stock Validation
```typescript
- Real-time validation: Total = Available + Borrowed
- Display mismatch errors
- Log calculation breakdown
```

## Testing Protocol

### Step-by-Step Testing
1. **Clear localStorage** (jika perlu full reset):
   ```javascript
   localStorage.clear()
   ```

2. **Reload page**

3. **Login sebagai member**: 
   - Username: `budi`
   - Password: `budi123`

4. **Add buku ke cart**:
   - Pilih 1 buku
   - Pastikan quantity = 1 (check di cart badge)
   - Jangan add buku yang sama 2x

5. **Checkout**:
   - Set tanggal pinjam dan kembali
   - Check console logs untuk cart validation

6. **Logout, login sebagai admin**:
   - Username: `admin`
   - Password: `admin123`

7. **Konfirmasi peminjaman**:
   - Go to Dashboard
   - Check "Konfirmasi Peminjaman"
   - Klik "Konfirmasi"
   - **WATCH CONSOLE LOGS CAREFULLY**

8. **Analyze logs** untuk detect:
   - ❌ Duplicate books in cart?
   - ❌ Borrowing details quantity != 1?
   - ❌ Actual reduction != Expected?
   - ❌ Duplicate borrowing IDs?
   - ❌ Rapid fire state updates?

### Debug Helpers (run di browser console)

```javascript
// Tampilkan semua stock
window.debugStocks()

// Tampilkan semua borrowings
window.debugBorrowings()

// Check cart (via React DevTools)
window.debugCart()
```

## Possible Root Causes

### Theory 1: Cart has Duplicate Entries ❌
- **Unlikely**: `handleAddToCart` checks `existingItem` before adding
- **Check**: Console logs will show if cart has duplicate bookIds

### Theory 2: Borrowing Details Corrupted ❌
- **Possible**: Details array might have duplicate bookIds
- **Check**: localStorage validation will detect this on load

### Theory 3: Double Confirmation ❌
- **Prevented**: Guard using `confirmingBorrowingRef` with 2s timeout
- **Check**: Console will show "DOUBLE CALL BLOCKED" if triggered

### Theory 4: Rapid Fire State Updates ❌
- **Detected**: Now tracking time between setState calls
- **Check**: Console will show warning if < 100ms between updates

### Theory 5: Multiple Borrowings for Same Book ⚠️
- **Possible**: User might have created multiple borrowings
- **Check**: Validation checks for this and logs warning

### Theory 6: localStorage Corruption ⚠️
- **Possible**: Data in localStorage might be corrupted
- **Solution**: Clear localStorage and test fresh

## Expected Console Output (Normal Flow)

### When Checkout:
```
🛒 ========== CHECKOUT ==========
🛒 Cart items count: 1
🛒 Cart breakdown: ["Laskar Pelangi: quantity=1"]
🛒 Total quantity in cart: 1
✅ No duplicate bookIds in cart
```

### When Confirm:
```
✅ ========== KONFIRMASI PEMINJAMAN ==========
✅ Borrowing ID: borrow-xxx
✅ Total details array length: 1
✅ Details breakdown: ["Laskar Pelangi: qty=1, bookId=xxx"]
✅ Total quantity dalam borrowing: 1
✅ No duplicate bookIds in details
✅ Stock BEFORE: 100
✅ Stock AFTER: 99
✅ Actual reduction: 1, Expected: 1
✅ Stock reduction CORRECT ✓
```

### In AdminDashboard:
```
📊 ═══════════ STOCK VALIDATION ═══════════
📊 Total books in system: 100 books
📊 Currently borrowed: 1 books
📊 Available (calculated): 99 books
📊 ✅ Stock calculation CORRECT!
```

## What to Look For (Red Flags)

### 🚨 ERROR Indicators:
- `❌❌❌ DUPLICATE BOOK IDs IN CART!`
- `❌❌❌ CORRUPTED DATA DETECTED in borrowing`
- `❌❌❌ DUPLICATE BORROWING IDs DETECTED`
- `❌❌❌ MISMATCH! Stock reduction tidak sesuai!`
- `❌❌❌ RAPID FIRE DETECTED!`
- `❌❌❌ NEGATIVE STOCK DETECTED!`

### ⚠️ WARNING Indicators:
- `⚠️⚠️⚠️ DOUBLE CALL BLOCKED!`
- `⚠️ User has multiple active borrowings for same book`
- `⚠️ Borrowing sudah dikonfirmasi sebelumnya`

## Next Steps

1. **Run the test** dengan protocol di atas
2. **Share console logs** jika issue masih terjadi
3. **Check localStorage** dengan `window.debugBorrowings()`
4. **Analyze** which validation failed

## Notes
- Semua logging sudah sangat comprehensive
- Guards sudah diperkuat untuk prevent double execution
- Validation checks akan detect semua possible corruption sources
- Jika issue masih terjadi, console logs akan menunjukkan EXACTLY dimana masalahnya
