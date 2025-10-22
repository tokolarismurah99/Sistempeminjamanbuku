-- ============================================
-- CLEAR BORROWINGS & ACTIVITIES ONLY
-- SmartLib Ubhara - Clear Peminjaman Script
-- ============================================
-- Script ini HANYA menghapus borrowings dan activities
-- Books dan Users TIDAK DIHAPUS
-- Gunakan ini untuk clear peminjaman yang "nyangkut"
-- ============================================

-- STEP 1: Hapus semua activities (log aktivitas)
-- ============================================
DELETE FROM activities;
SELECT 'All activities deleted!' as message;

-- STEP 2: Hapus semua borrowings (peminjaman)
-- ============================================
DELETE FROM borrowings;
SELECT 'All borrowings deleted!' as message;

-- STEP 3: Reset stok buku ke default (5 untuk semua)
-- ============================================
-- Ini akan mengembalikan semua stok buku ke 5
UPDATE books SET stok = 5;
SELECT 'All book stocks reset to 5!' as message;

-- ============================================
-- FINAL CONFIRMATION
-- ============================================

SELECT 
  'BORROWINGS & ACTIVITIES CLEARED!' as status,
  (SELECT COUNT(*) FROM books) as total_books,
  (SELECT SUM(stok) FROM books) as total_stock,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM borrowings) as total_borrowings,
  (SELECT COUNT(*) FROM activities) as total_activities;

-- Expected Result:
-- total_borrowings: 0 (semua peminjaman terhapus)
-- total_activities: 0 (semua log aktivitas terhapus)
-- total_stock: 100 (20 buku × 5 stok)
-- total_books: 20
-- total_users: 2

-- ============================================
-- NOTES
-- ============================================
-- ✅ Borrowings terhapus (6 buku yang nyangkut akan bebas)
-- ✅ Activities terhapus (log bersih)
-- ✅ Stok buku direset ke 5 semua
-- ❌ Books TIDAK dihapus (data buku tetap ada)
-- ❌ Users TIDAK dihapus (user tetap bisa login)
