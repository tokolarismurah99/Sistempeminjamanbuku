import { useState, useEffect, useRef } from 'react';
import { Book, Borrowing, User, CartItem, BorrowingDetail } from './types';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { BookCatalog } from './components/BookCatalog';
import { CartPage } from './components/CartPage';
import { BorrowingPage } from './components/BorrowingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminBookManagement } from './components/AdminBookManagement';
import { AdminBorrowingConfirmation } from './components/AdminBorrowingConfirmation';
import { AdminReturnConfirmation } from './components/AdminReturnConfirmation';
import { BarcodeDisplay } from './components/BarcodeDisplay';
import { PrintReceipt } from './components/PrintReceipt';
import { EditProfileDialog } from './components/EditProfileDialog';
import DatabasePage from './components/DatabasePage';
import { Logo } from './components/Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { BookOpen, Library, LayoutDashboard, User as UserIcon, LogOut, Shield, CheckSquare, ShoppingCart, Database } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { generateBarcode } from './utils/barcode';
import { mockBooks, currentUser as demoMember, adminUser } from './data/mockData';

export default function App() {
  // ============================================
  // LOCAL STATE - Pure Client-Side (No Supabase)
  // ============================================
  
  // Initialize data from localStorage or use mock data
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('smartlib_books');
    return saved ? JSON.parse(saved) : mockBooks;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('smartlib_users');
    return saved ? JSON.parse(saved) : [demoMember, adminUser];
  });

  const [borrowings, setBorrowings] = useState<Borrowing[]>(() => {
    const saved = localStorage.getItem('smartlib_borrowings');
    
    if (!saved) {
      console.log('📚 App.tsx - No borrowings in localStorage, returning empty array');
      return [];
    }
    
    try {
      // Parse and convert date strings back to Date objects
      const parsed = JSON.parse(saved);
      
      console.log('📚 App.tsx - Raw parsed from localStorage:', parsed);
      console.log('📚 App.tsx - Parsed count:', parsed.length);
      
      const deserialized = parsed.map((b: any) => ({
        ...b,
        borrowDate: b.borrowDate ? new Date(b.borrowDate) : new Date(),
        dueDate: b.dueDate ? new Date(b.dueDate) : new Date(),
        returnDate: b.returnDate ? new Date(b.returnDate) : undefined,
      }));
      
      console.log('📚 App.tsx - Deserialized borrowings:', deserialized.length);
      console.log('📚 App.tsx - Borrowings data:', deserialized);
      console.log('📚 App.tsx - Statuses:', deserialized.map(b => ({ 
        id: b.id, 
        status: b.status, 
        statusType: typeof b.status,
        detailCount: b.details?.length || 0
      })));
      
      // VALIDATION: Check for duplicate bookIds in details
      deserialized.forEach((b: any) => {
        if (b.details && b.details.length > 0) {
          const bookIds = b.details.map((d: any) => d.bookId);
          const uniqueIds = new Set(bookIds);
          if (bookIds.length !== uniqueIds.size) {
            console.error(`⚠️⚠️⚠️ CORRUPTED DATA DETECTED in borrowing ${b.id}!`);
            console.error('   Details have duplicate bookIds:', bookIds);
            console.error('   This borrowing has corrupted data and may cause stock issues!');
          }
        }
      });
      
      // VALIDATION: Check for duplicate borrowing IDs
      const borrowingIds = deserialized.map((b: any) => b.id);
      const uniqueBorrowingIds = new Set(borrowingIds);
      if (borrowingIds.length !== uniqueBorrowingIds.size) {
        console.error('⚠️⚠️⚠️ DUPLICATE BORROWING IDs DETECTED IN LOCALSTORAGE!');
        console.error('   Borrowing IDs:', borrowingIds);
        console.error('   Unique IDs:', Array.from(uniqueBorrowingIds));
        console.error('   This will cause DOUBLE STOCK REDUCTION!');
      }
      
      // VALIDATION: Check for multiple borrowings with same bookId+userId combo
      const activeborrowings = deserialized.filter((b: any) => b.status === 'active' || b.status === 'overdue' || b.status === 'returning');
      activeborrowings.forEach((b: any) => {
        b.details.forEach((detail: any) => {
          const duplicates = activeborrowings.filter((other: any) => 
            other.userId === b.userId && 
            other.details.some((d: any) => d.bookId === detail.bookId)
          );
          if (duplicates.length > 1) {
            console.warn(`⚠️ User ${b.userId} has ${duplicates.length} active borrowings for book ${detail.bookId}`);
            console.warn('   Borrowing IDs:', duplicates.map((d: any) => d.id));
          }
        });
      });
      
      return deserialized;
    } catch (error) {
      console.error('📚 App.tsx - Error loading borrowings:', error);
      return [];
    }
  });

  // Current user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartlib_currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Shopping cart (session only, not persisted)
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI State
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [currentBorrowing, setCurrentBorrowing] = useState<Borrowing | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [showRegister, setShowRegister] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDatabasePage, setShowDatabasePage] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState<{
    borrowing: Borrowing;
    type: 'borrow' | 'return';
    lateFee?: number;
    daysLate?: number;
  } | null>(null);

  // ============================================
  // REFS - Prevent Double Execution
  // ============================================
  
  const confirmingBorrowingRef = useRef<Set<string>>(new Set());
  const confirmingReturnRef = useRef<Set<string>>(new Set());
  const lastBooksUpdateRef = useRef<number>(0);
  const lastBorrowingsUpdateRef = useRef<number>(0);

  // ============================================
  // EFFECTS - Save to localStorage
  // ============================================

  // Force dark mode + Debug helpers
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    console.log('🌙 SmartLib Ubhara - Dark Mode PERMANENT');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📚 SmartLib Ubhara - Debugging Protocol ACTIVE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('🔍 TESTING PROTOCOL untuk Stock Bug:');
    console.log('   1. Clear localStorage (jika perlu): localStorage.clear()');
    console.log('   2. Reload page');
    console.log('   3. Login sebagai member (budi/budi123)');
    console.log('   4. Add 1 buku ke cart (pastikan quantity = 1)');
    console.log('   5. Checkout');
    console.log('   6. Login sebagai admin (admin/admin123)');
    console.log('   7. Confirm borrowing');
    console.log('   8. Check console logs untuk:');
    console.log('      - Cart validation (duplicate books?)');
    console.log('      - Borrowing details (quantity correct?)');
    console.log('      - Stock reduction (actual vs expected)');
    console.log('      - Duplicate borrowing IDs?');
    console.log('      - Rapid fire state updates?');
    console.log('');
    console.log('🛠️  DEBUG HELPERS (run di console):');
    console.log('   - window.debugStocks() = Tampilkan semua stock');
    console.log('   - window.debugBorrowings() = Tampilkan semua borrowings');
    console.log('   - window.debugCart() = Tampilkan cart saat ini');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Expose debug helpers
    (window as any).debugStocks = () => {
      const stored = localStorage.getItem('smartlib_books');
      const books = stored ? JSON.parse(stored) : [];
      console.table(books.map((b: any) => ({
        Title: b.title,
        Stock: b.stock,
        Category: b.category,
        ID: b.id
      })));
    };
    
    (window as any).debugBorrowings = () => {
      const stored = localStorage.getItem('smartlib_borrowings');
      const borrowings = stored ? JSON.parse(stored) : [];
      console.log('Total borrowings:', borrowings.length);
      borrowings.forEach((b: any) => {
        console.log(`\nBorrowing ${b.id}:`);
        console.log('  Status:', b.status);
        console.log('  User ID:', b.userId);
        console.log('  Details:', b.details);
        console.log('  Total books:', b.details.reduce((sum: number, d: any) => sum + d.quantity, 0));
      });
    };
    
    (window as any).debugCart = () => {
      console.log('Cart is session-only, check React state in component');
      console.log('Open React DevTools to inspect cart state');
    };
  }, []);

  // Save books to localStorage
  useEffect(() => {
    const stockSummary = books.slice(0, 5).map(b => `${b.title}: ${b.stock}`);
    console.log('💾 Books state changed. Saving to localStorage...');
    console.log('💾 Stock summary:', stockSummary);
    console.log('💾 Total books count:', books.length);
    console.log('💾 Total stock across all books:', books.reduce((sum, b) => sum + b.stock, 0));
    
    // AUDIT: Check for negative stock
    const negativeStockBooks = books.filter(b => b.stock < 0);
    if (negativeStockBooks.length > 0) {
      console.error('❌❌❌ NEGATIVE STOCK DETECTED!');
      negativeStockBooks.forEach(b => {
        console.error(`   "${b.title}": stock = ${b.stock}`);
      });
    }
    
    localStorage.setItem('smartlib_books', JSON.stringify(books));
  }, [books]);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('smartlib_users', JSON.stringify(users));
  }, [users]);

  // Save borrowings to localStorage
  useEffect(() => {
    console.log('💾 Saving borrowings to localStorage:', borrowings.length);
    console.log('💾 Borrowings data:', borrowings);
    localStorage.setItem('smartlib_borrowings', JSON.stringify(borrowings));
  }, [borrowings]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartlib_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smartlib_currentUser');
    }
  }, [currentUser]);

  // ============================================
  // AUTH HANDLERS
  // ============================================

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('confirmation');
    } else {
      setActiveTab('catalog');
    }
    toast.success(`Selamat datang, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setActiveTab('catalog');
    toast.info('Anda telah keluar dari sistem');
  };
  
  const handleResetData = () => {
    if (confirm('⚠️ PERHATIAN! Ini akan menghapus semua data (borrowings, custom books, dll) dan reset ke data awal. Lanjutkan?')) {
      console.log('🔄 ========== RESETTING ALL DATA ==========');
      
      // Clear ALL localStorage keys (including any potential corrupted data)
      const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('smartlib_'));
      keysToRemove.forEach(key => {
        console.log(`🔄 Removing localStorage key: ${key}`);
        localStorage.removeItem(key);
      });
      
      // Clear refs
      confirmingBorrowingRef.current.clear();
      confirmingReturnRef.current.clear();
      
      // Reset to mock data
      setBooks([...mockBooks]); // Create fresh copy
      setUsers([demoMember, adminUser]);
      setBorrowings([]);
      setCurrentUser(null);
      setCart([]);
      setActiveTab('catalog');
      
      console.log('🔄 Mock books reset. Stock sample:', mockBooks.slice(0, 3).map(b => `${b.title}: ${b.stock}`));
      toast.success('✅ Data berhasil direset ke kondisi awal!');
      console.log('🔄 ==========================================');
      
      // Force page reload after 500ms to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleRegister = (name: string, email: string, password: string, phone: string, address: string) => {
    // Check if email already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      toast.error('Email sudah terdaftar!');
      return;
    }

    const memberCount = users.filter(u => u.role === 'member').length;
    const membershipId = `MEM-${String(memberCount + 1).padStart(6, '0')}`;
    
    const newUser: User = {
      id: `member-${Date.now()}`,
      name,
      email,
      password,
      phone,
      address,
      membershipId,
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setShowRegister(false);
    setActiveTab('catalog');
    toast.success(`Selamat datang, ${name}! ID Keanggotaan: ${membershipId}`);
  };

  const handleSaveProfile = (updatedUser: User) => {
    // Update user in users array
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    // Update current user
    setCurrentUser(updatedUser);
    toast.success('Profil berhasil diperbarui!');
  };

  // ============================================
  // CART MANAGEMENT
  // ============================================

  const handleAddToCart = (book: Book) => {
    const existingItem = cart.find((item) => item.bookId === book.id);
    
    if (existingItem) {
      toast.info('Buku sudah ada di keranjang');
      return;
    }

    const newCartItem: CartItem = {
      bookId: book.id,
      quantity: 1,
    };

    setCart([...cart, newCartItem]);
    toast.success(`"${book.title}" ditambahkan ke keranjang`);
  };

  const handleUpdateCartQuantity = (bookId: string, newQty: number) => {
    setCart(cart.map(item => 
      item.bookId === bookId ? { ...item, quantity: newQty } : item
    ));
  };

  const handleRemoveFromCart = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setCart(cart.filter(item => item.bookId !== bookId));
    if (book) {
      toast.info(`"${book.title}" dihapus dari keranjang`);
    }
  };

  const handleCheckout = (borrowDate: Date, dueDate: Date) => {
    if (!currentUser || cart.length === 0) return;

    console.log('🛒 ========== CHECKOUT ==========');
    console.log('🛒 Cart items count (RAW):', cart.length);
    console.log('🛒 Cart items detail (RAW):', cart);
    
    // 🔧 FIX #1: DEDUPLICATE cart before checkout
    // Aggregate quantities for duplicate bookIds
    const cartMap = new Map<string, CartItem>();
    cart.forEach(item => {
      const existing = cartMap.get(item.bookId);
      if (existing) {
        console.warn(`⚠️ DUPLICATE IN CART! Aggregating quantities for bookId: ${item.bookId}`);
        console.warn(`   Existing qty: ${existing.quantity}, New qty: ${item.quantity}`);
        cartMap.set(item.bookId, {
          bookId: item.bookId,
          quantity: existing.quantity + item.quantity
        });
      } else {
        cartMap.set(item.bookId, { ...item });
      }
    });
    
    const deduplicatedCart = Array.from(cartMap.values());
    
    if (cart.length !== deduplicatedCart.length) {
      console.error('❌❌❌ DUPLICATES FOUND IN CART!');
      console.error(`   Original cart count: ${cart.length}`);
      console.error(`   Deduplicated count: ${deduplicatedCart.length}`);
    }
    
    console.log('🛒 Cart (AFTER DEDUPLICATION):', deduplicatedCart);
    console.log('🛒 Cart breakdown:', deduplicatedCart.map(c => {
      const book = books.find(b => b.id === c.bookId);
      return `${book?.title || 'Unknown'}: quantity=${c.quantity}`;
    }));
    console.log('🛒 Total quantity in cart:', deduplicatedCart.reduce((sum, c) => sum + c.quantity, 0));
    console.log('🛒 Borrow date:', borrowDate);
    console.log('🛒 Due date:', dueDate);

    // Create borrowing details from DEDUPLICATED cart
    const details: BorrowingDetail[] = deduplicatedCart.map(item => {
      const book = books.find(b => b.id === item.bookId)!;
      console.log(`🛒 Creating detail for "${book.title}": quantity = ${item.quantity}`);
      return {
        bookId: item.bookId,
        bookTitle: book.title,
        quantity: item.quantity,
      };
    });

    // Generate barcode for borrowing confirmation
    const barcode = generateBarcode(currentUser.membershipId);

    const newBorrowing: Borrowing = {
      id: `borrow-${Date.now()}`,
      userId: currentUser.id,
      details,
      borrowDate: borrowDate,
      dueDate: dueDate,
      status: 'pending',
      barcode,
    };

    console.log('🛒 Creating new borrowing:', newBorrowing);
    console.log('🛒 Total details:', details.length);
    console.log('🛒 Details breakdown:', details.map(d => `${d.bookTitle}: qty=${d.quantity}`));
    console.log('🛒 Current borrowings before:', borrowings.length);

    const updatedBorrowings = [...borrowings, newBorrowing];
    setBorrowings(updatedBorrowings);
    
    console.log('🛒 Updated borrowings after:', updatedBorrowings.length);
    console.log('🛒 New borrowing status:', newBorrowing.status);

    setCurrentBorrowing(newBorrowing);
    setShowBarcodeDialog(true);
    setCart([]);
    toast.success('Peminjaman berhasil dibuat! Tunjukkan barcode ke admin untuk konfirmasi.');
  };

  // ============================================
  // ADMIN - BORROWING CONFIRMATION
  // ============================================

  const handleConfirmBorrowing = (borrowingId: string) => {
    console.log('🎯 handleConfirmBorrowing called for:', borrowingId);
    console.log('🎯 Current confirming ref:', Array.from(confirmingBorrowingRef.current));
    
    // Guard: Prevent double execution using ref
    if (confirmingBorrowingRef.current.has(borrowingId)) {
      console.warn('⚠️⚠️⚠️ DOUBLE CALL BLOCKED! Already confirming:', borrowingId);
      toast.error('Sedang memproses konfirmasi, mohon tunggu...');
      return;
    }
    confirmingBorrowingRef.current.add(borrowingId);
    console.log('🎯 Added to confirming ref. Updated ref:', Array.from(confirmingBorrowingRef.current));
    
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) {
      console.error('❌ Borrowing not found:', borrowingId);
      confirmingBorrowingRef.current.delete(borrowingId);
      return;
    }
    
    // Guard: Only confirm if status is 'pending'
    if (borrowing.status !== 'pending') {
      console.warn('⚠️ Borrowing sudah dikonfirmasi sebelumnya. Status:', borrowing.status);
      toast.error('Peminjaman sudah dikonfirmasi sebelumnya!');
      confirmingBorrowingRef.current.delete(borrowingId);
      return;
    }
    
    console.log('✅ ========== KONFIRMASI PEMINJAMAN ==========');
    console.log('✅ Borrowing ID:', borrowingId);
    console.log('✅ User ID:', borrowing.userId);
    console.log('✅ Status SEBELUM:', borrowing.status);
    console.log('✅ Total details array length (RAW):', borrowing.details.length);
    console.log('✅ Details (RAW):', borrowing.details);
    
    // 🔧 FIX #1: DEDUPLICATE & AGGREGATE borrowing.details
    // If there are duplicate bookIds, aggregate quantities
    const detailsMap = new Map<string, BorrowingDetail>();
    borrowing.details.forEach(detail => {
      const existing = detailsMap.get(detail.bookId);
      if (existing) {
        console.warn(`⚠️ DUPLICATE DETECTED! Aggregating quantities for bookId: ${detail.bookId}`);
        console.warn(`   Existing qty: ${existing.quantity}, New qty: ${detail.quantity}`);
        detailsMap.set(detail.bookId, {
          ...existing,
          quantity: existing.quantity + detail.quantity
        });
      } else {
        detailsMap.set(detail.bookId, { ...detail });
      }
    });
    
    const deduplicatedDetails = Array.from(detailsMap.values());
    console.log('✅ Details (AFTER DEDUPLICATION):', deduplicatedDetails);
    console.log('✅ Details breakdown:', deduplicatedDetails.map(d => `${d.bookTitle}: qty=${d.quantity}, bookId=${d.bookId}`));
    console.log('✅ Total quantity dalam borrowing:', deduplicatedDetails.reduce((sum, d) => sum + d.quantity, 0));
    console.log('✅ Borrow Date:', borrowing.borrowDate);
    console.log('✅ Due Date:', borrowing.dueDate);
    
    if (borrowing.details.length !== deduplicatedDetails.length) {
      console.error('❌❌❌ DUPLICATES WERE FOUND AND REMOVED!');
      console.error(`   Original details count: ${borrowing.details.length}`);
      console.error(`   Deduplicated count: ${deduplicatedDetails.length}`);
    }
    
    // Check if there are other borrowings affecting the same books
    deduplicatedDetails.forEach(detail => {
      const otherActiveBorrowings = borrowings.filter(b => 
        b.id !== borrowingId && 
        (b.status === 'active' || b.status === 'overdue' || b.status === 'returning') &&
        b.details.some(d => d.bookId === detail.bookId)
      );
      if (otherActiveBorrowings.length > 0) {
        console.warn(`⚠️ Book "${detail.bookTitle}" is also in ${otherActiveBorrowings.length} other active borrowings:`);
        otherActiveBorrowings.forEach(b => {
          const bookDetail = b.details.find(d => d.bookId === detail.bookId);
          console.warn(`   - Borrowing ${b.id} (${b.status}): ${bookDetail?.quantity || 0}x`);
        });
      }
    });

    // 🔧 FIX #2: Validate stock availability BEFORE reduction
    let hasStockIssue = false;
    deduplicatedDetails.forEach(detail => {
      const book = books.find(b => b.id === detail.bookId);
      if (!book) {
        console.error(`❌ Book not found: ${detail.bookId}`);
        hasStockIssue = true;
      } else if (book.stock < detail.quantity) {
        console.error(`❌ Insufficient stock for "${book.title}": need ${detail.quantity}, have ${book.stock}`);
        hasStockIssue = true;
      }
    });
    
    if (hasStockIssue) {
      toast.error('Stok tidak mencukupi untuk beberapa buku!');
      confirmingBorrowingRef.current.delete(borrowingId);
      return;
    }

    // 🔧 FIX #3: Use deduplicated details for stock update
    const updatedBooks = books.map((book) => {
      const detail = deduplicatedDetails.find((d) => d.bookId === book.id);
      if (detail) {
        const newStock = book.stock - detail.quantity;
        console.log(`✅ Mengurangi stock buku "${book.title}": ${book.stock} - ${detail.quantity} = ${newStock}`);
        console.log(`✅   - Book ID: ${book.id}`);
        console.log(`✅   - Detail quantity: ${detail.quantity}`);
        console.log(`✅   - Stock BEFORE: ${book.stock}`);
        console.log(`✅   - Stock AFTER: ${newStock}`);
        return { ...book, stock: newStock };
      }
      return book;
    });
    
    console.log('✅ Books BEFORE update:');
    deduplicatedDetails.forEach(d => {
      const beforeBook = books.find(b => b.id === d.bookId);
      if (beforeBook) console.log(`   ${beforeBook.title}: stock = ${beforeBook.stock}`);
    });
    
    console.log('✅ Books AFTER update:');
    deduplicatedDetails.forEach(d => {
      const afterBook = updatedBooks.find(b => b.id === d.bookId);
      const beforeBook = books.find(b => b.id === d.bookId);
      if (afterBook && beforeBook) {
        const actualReduction = beforeBook.stock - afterBook.stock;
        const expectedReduction = d.quantity;
        console.log(`   ${afterBook.title}: stock = ${afterBook.stock}`);
        console.log(`      Actual reduction: ${actualReduction}, Expected: ${expectedReduction}`);
        if (actualReduction !== expectedReduction) {
          console.error(`      ❌❌❌ MISMATCH! Stock reduction tidak sesuai!`);
        }
      }
    });

    // 🔧 FIX #4: Update borrowing with DEDUPLICATED details AND status change
    const updatedBorrowings = borrowings.map((b) =>
      b.id === borrowingId ? { ...b, details: deduplicatedDetails, status: 'active' as const } : b
    );
    
    console.log('✅ Status SETELAH: active');
    console.log('✅ Updated borrowing:', updatedBorrowings.find(b => b.id === borrowingId));
    console.log('✅ ========================================');

    console.log('🎯 ========== UPDATING STATE ==========');
    console.log('🎯 About to call setBooks with updated stock');
    console.log('🎯 About to call setBorrowings with status=active AND deduplicated details');
    
    const now = Date.now();
    const timeSinceLastBooksUpdate = now - lastBooksUpdateRef.current;
    const timeSinceLastBorrowingsUpdate = now - lastBorrowingsUpdateRef.current;
    
    console.log(`🎯 Time since last books update: ${timeSinceLastBooksUpdate}ms`);
    console.log(`🎯 Time since last borrowings update: ${timeSinceLastBorrowingsUpdate}ms`);
    
    if (timeSinceLastBooksUpdate < 100) {
      console.error('❌❌❌ RAPID FIRE DETECTED! Books updated less than 100ms ago!');
      console.error('   This might be causing double stock reduction!');
    }
    
    lastBooksUpdateRef.current = now;
    lastBorrowingsUpdateRef.current = now;
    
    // 🔧 FIX #5: Atomic-like update - both or nothing
    setBooks(updatedBooks);
    setBorrowings(updatedBorrowings);

    console.log('🎯 State update called. Books and Borrowings should update now.');
    console.log('🎯 =====================================');

    // Show print dialog with deduplicated details
    setPrintData({ 
      borrowing: { ...borrowing, details: deduplicatedDetails, status: 'active' }, 
      type: 'borrow' 
    });
    setShowPrintDialog(true);

    toast.success('Peminjaman berhasil dikonfirmasi!');
    
    // Clean up ref after a delay to prevent immediate re-confirmation
    setTimeout(() => {
      console.log('🎯 Cleaning up confirming ref for:', borrowingId);
      confirmingBorrowingRef.current.delete(borrowingId);
      console.log('🎯 Ref after cleanup:', Array.from(confirmingBorrowingRef.current));
    }, 2000); // Increased to 2 seconds for extra safety
  };

  // ============================================
  // MEMBER - REQUEST RETURN
  // ============================================

  const handleRequestReturn = (borrowingId: string) => {
    // Get borrowing info to generate return barcode with membershipId
    const borrowing = borrowings.find(b => b.id === borrowingId);
    if (!borrowing) return;
    
    const user = users.find(u => u.id === borrowing.userId);
    const returnBarcode = generateBarcode(user?.membershipId, 'return');
    
    const updatedBorrowings = borrowings.map((b) =>
      b.id === borrowingId
        ? { ...b, status: 'returning' as const, returnBarcode, returnRequestDate: new Date().toISOString().split('T')[0] }
        : b
    );

    setBorrowings(updatedBorrowings);
    
    const updatedBorrowing = updatedBorrowings.find(b => b.id === borrowingId);
    if (updatedBorrowing) {
      setCurrentBorrowing(updatedBorrowing);
      setShowBarcodeDialog(true);
    }

    toast.success('Permintaan pengembalian berhasil! Tunjukkan barcode ke admin.');
  };

  // ============================================
  // ADMIN - RETURN CONFIRMATION
  // ============================================

  const handleConfirmReturn = (borrowingId: string) => {
    // Guard: Prevent double execution using ref
    if (confirmingReturnRef.current.has(borrowingId)) {
      console.warn('⚠️ DOUBLE CALL DETECTED! Already confirming return:', borrowingId);
      return;
    }
    confirmingReturnRef.current.add(borrowingId);
    
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) {
      console.error('❌ Borrowing not found:', borrowingId);
      confirmingReturnRef.current.delete(borrowingId);
      return;
    }
    
    // Guard: Only confirm return if status is 'returning'
    if (borrowing.status !== 'returning') {
      console.warn('⚠️ Pengembalian tidak dalam status returning. Status:', borrowing.status);
      toast.error('Status peminjaman tidak valid untuk pengembalian!');
      confirmingReturnRef.current.delete(borrowingId);
      return;
    }
    
    console.log('📦 ========== KONFIRMASI PENGEMBALIAN ==========');
    console.log('📦 Borrowing ID:', borrowingId);
    console.log('📦 Status SEBELUM:', borrowing.status);
    console.log('📦 Details:', borrowing.details);

    const returnDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(borrowing.dueDate);
    const returnDateObj = new Date(returnDate);
    const daysLate = Math.max(0, Math.floor((returnDateObj.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalBooksInBorrowing = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
    const lateFee = daysLate * totalBooksInBorrowing * 2000;
    
    console.log('📦 Days late:', daysLate);
    console.log('📦 Total books:', totalBooksInBorrowing);
    console.log('📦 Late fee:', lateFee);

    // Return books to stock
    const updatedBooks = books.map((book) => {
      const detail = borrowing.details.find((d) => d.bookId === book.id);
      if (detail) {
        console.log(`📦 Mengembalikan stock buku "${book.title}": ${book.stock} + ${detail.quantity} = ${book.stock + detail.quantity}`);
        return { ...book, stock: book.stock + detail.quantity };
      }
      return book;
    });

    // Update borrowing status
    const updatedBorrowings = borrowings.map((b) =>
      b.id === borrowingId
        ? { ...b, status: 'returned' as const, returnDate, lateFee, daysLate }
        : b
    );

    setBooks(updatedBooks);
    setBorrowings(updatedBorrowings);
    
    console.log('📦 Status SETELAH: returned');
    console.log('📦 ==========================================');

    // Show print dialog
    const updatedBorrowing = updatedBorrowings.find(b => b.id === borrowingId);
    if (updatedBorrowing) {
      setPrintData({
        borrowing: updatedBorrowing,
        type: 'return',
        lateFee,
        daysLate,
      });
      setShowPrintDialog(true);
    }

    if (daysLate > 0) {
      toast.success(`Pengembalian dikonfirmasi! Denda keterlambatan: Rp ${lateFee.toLocaleString('id-ID')}`);
    } else {
      toast.success('Pengembalian berhasil dikonfirmasi!');
    }
    
    // Clean up ref after a delay
    setTimeout(() => {
      confirmingReturnRef.current.delete(borrowingId);
    }, 1000);
  };

  // ============================================
  // ADMIN - BOOK MANAGEMENT
  // ============================================

  const handleAddBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
    };

    setBooks([...books, newBook]);
    toast.success(`Buku "${bookData.title}" berhasil ditambahkan!`);
  };

  const handleEditBook = (bookId: string, bookData: Partial<Book>) => {
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, ...bookData } : book
    ));
    toast.success('Buku berhasil diperbarui!');
  };

  const handleDeleteBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(books.filter(b => b.id !== bookId));
    if (book) {
      toast.success(`Buku "${book.title}" berhasil dihapus!`);
    }
  };

  const handleUpdateStock = (bookId: string, newStock: number) => {
    setBooks(books.map(book =>
      book.id === bookId ? { ...book, stock: newStock } : book
    ));
    toast.success('Stok berhasil diperbarui!');
  };

  // ============================================
  // RENDER
  // ============================================

  if (showRegister) {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={() => setShowRegister(true)}
        users={users}
        usersLoading={false}
      />
    );
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster />
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl text-emerald-400">SmartLib Ubhara</h1>
                <p className="text-sm text-orange-400">Sistem Peminjaman Buku</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Flow Sistem Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDatabasePage(true)}
                className="hidden sm:flex items-center gap-2 bg-emerald-950/30 border-emerald-700 text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300"
              >
                <Database className="w-4 h-4" />
                <span>Flow Sistem</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex gap-3 h-auto p-3 hover:bg-slate-800">
                    <Avatar>
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-100">{currentUser.name}</p>
                        {currentUser.role === 'admin' && (
                          <Badge variant="default" className="text-xs bg-orange-600 hover:bg-orange-700">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{currentUser.membershipId}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                  <DropdownMenuLabel className="text-gray-300">Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={() => setShowEditProfile(true)}
                    className="text-gray-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-gray-100 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Edit Profil
                  </DropdownMenuItem>
                  {currentUser.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        onClick={handleResetData}
                        className="text-yellow-400 hover:bg-yellow-950/30 focus:bg-yellow-950/30 focus:text-yellow-300 cursor-pointer"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Reset Data
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-orange-400 hover:bg-orange-950/30 focus:bg-orange-950/30 focus:text-orange-300 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Flow Sistem Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDatabasePage(true)}
                className="sm:hidden bg-emerald-950/30 border-emerald-700 text-emerald-400 hover:bg-emerald-950/50"
                title="Flow Sistem"
              >
                <Database className="w-5 h-5" />
              </Button>
              
              {/* Mobile User Icon */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden hover:bg-emerald-950/50">
                    <UserIcon className="w-5 h-5 text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                  <DropdownMenuLabel className="text-gray-300">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{currentUser.name}</span>
                      {currentUser.role === 'admin' && (
                        <Badge variant="default" className="text-xs bg-orange-600">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-normal text-gray-400">{currentUser.membershipId}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={() => setShowEditProfile(true)}
                    className="text-gray-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-gray-100 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Edit Profil
                  </DropdownMenuItem>
                  {currentUser.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        onClick={handleResetData}
                        className="text-yellow-400 hover:bg-yellow-950/30 focus:bg-yellow-950/30 focus:text-yellow-300 cursor-pointer"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Reset Data
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-orange-400 hover:bg-orange-950/30 focus:bg-orange-950/30 focus:text-orange-300 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {currentUser.role === 'admin' ? (
            <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8">
              <TabsTrigger value="confirmation">
                <CheckSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pinjam</span>
                <span className="sm:hidden">Pinjam</span>
                {borrowings.filter((b) => b.status === 'pending').length > 0 && (
                  <Badge className="ml-2 bg-orange-500 hover:bg-orange-600 text-white" variant="destructive">
                    {borrowings.filter((b) => b.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="return">
                <Library className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Kembali</span>
                <span className="sm:hidden">Kembali</span>
                {borrowings.filter((b) => b.status === 'returning').length > 0 && (
                  <Badge className="ml-2 bg-orange-500 hover:bg-orange-600 text-white" variant="destructive">
                    {borrowings.filter((b) => b.status === 'returning').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="catalog">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Katalog</span>
                <span className="sm:hidden">Buku</span>
              </TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
              <TabsTrigger value="catalog">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Katalog</span>
                <span className="sm:hidden">Katalog</span>
              </TabsTrigger>
              <TabsTrigger value="cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Keranjang</span>
                <span className="sm:hidden">Cart</span>
                {totalCartItems > 0 && (
                  <Badge className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    {totalCartItems}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="borrowings">
                <Library className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Peminjaman</span>
                <span className="sm:hidden">Pinjam</span>
              </TabsTrigger>
            </TabsList>
          )}

          {/* Admin Tabs */}
          {currentUser.role === 'admin' && (
            <>
              <TabsContent value="confirmation">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Konfirmasi Peminjaman</h2>
                  <p className="text-gray-400">
                    Scan barcode anggota untuk mengkonfirmasi peminjaman buku
                  </p>
                </div>
                <AdminBorrowingConfirmation
                  borrowings={borrowings}
                  books={books}
                  users={users}
                  onConfirmBorrowing={handleConfirmBorrowing}
                />
              </TabsContent>

              <TabsContent value="return">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Konfirmasi Pengembalian</h2>
                  <p className="text-gray-400">
                    Scan barcode anggota untuk mengkonfirmasi pengembalian buku
                  </p>
                </div>
                <AdminReturnConfirmation
                  borrowings={borrowings}
                  books={books}
                  users={users}
                  onConfirmReturn={handleConfirmReturn}
                />
              </TabsContent>

              <TabsContent value="dashboard">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Dashboard Statistik</h2>
                  <p className="text-gray-400">
                    Pantau aktivitas perpustakaan dan statistik peminjaman
                  </p>
                </div>
                <AdminDashboard books={books} borrowings={borrowings} users={users} />
              </TabsContent>

              <TabsContent value="catalog">
                <AdminBookManagement
                  books={books}
                  onAddBook={handleAddBook}
                  onEditBook={handleEditBook}
                  onDeleteBook={handleDeleteBook}
                  onUpdateStock={handleUpdateStock}
                />
              </TabsContent>
            </>
          )}

          {/* Member Tabs */}
          {currentUser.role === 'member' && (
            <>
              <TabsContent value="catalog">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Katalog Buku</h2>
                  <p className="text-gray-400">
                    Jelajahi koleksi dan tambahkan buku ke keranjang peminjaman
                  </p>
                </div>
                <BookCatalog books={books} cart={cart} onAddToCart={handleAddToCart} />
              </TabsContent>

              <TabsContent value="cart">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Keranjang Peminjaman</h2>
                  <p className="text-gray-400">
                    Kelola buku yang akan dipinjam
                  </p>
                </div>
                <CartPage
                  cart={cart}
                  books={books}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveFromCart}
                  onCheckout={handleCheckout}
                  onClearCart={() => setCart([])}
                />
              </TabsContent>

              <TabsContent value="borrowings">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Riwayat Peminjaman</h2>
                  <p className="text-gray-400">
                    Pantau status peminjaman buku Anda
                  </p>
                </div>
                <BorrowingPage
                  borrowings={borrowings.filter((b) => b.userId === currentUser.id)}
                  books={books}
                  onRequestReturn={handleRequestReturn}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center gap-2">
            <p className="text-sm text-gray-300">
              &copy; 2025 SmartLib Ubhara. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Universitas Bhayangkara Jakarta Raya
            </p>
          </div>
        </div>
      </footer>

      {/* Barcode Display Dialog */}
      {currentBorrowing && (
        <BarcodeDisplay
          barcode={currentBorrowing.returnBarcode || currentBorrowing.barcode || ''}
          bookTitle={`${currentBorrowing.details.length} Buku`}
          dueDate={currentBorrowing.dueDate}
          open={showBarcodeDialog}
          onOpenChange={setShowBarcodeDialog}
        />
      )}

      {/* Print Receipt Dialog */}
      {printData && (
        <PrintReceipt
          borrowing={printData.borrowing}
          books={books}
          user={users.find((u) => u.id === printData.borrowing.userId)!}
          type={printData.type}
          lateFee={printData.lateFee}
          daysLate={printData.daysLate}
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
        />
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        user={currentUser}
        onSave={handleSaveProfile}
      />

      {/* Database Documentation Page */}
      {showDatabasePage && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <div className="absolute top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-emerald-400" />
                <h2 className="text-emerald-400">Database Documentation</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDatabasePage(false)}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                ← Kembali ke Aplikasi
              </Button>
            </div>
          </div>
          <div className="pt-20 h-full overflow-y-auto">
            <DatabasePage />
          </div>
        </div>
      )}
    </div>
  );
}
