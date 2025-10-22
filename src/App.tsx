import { useState, useEffect } from 'react';
import { Book, Borrowing, User, CartItem, BorrowingDetail, Activity } from './types';
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
import { Logo } from './components/Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { BookOpen, Library, LayoutDashboard, User as UserIcon, LogOut, Shield, CheckSquare, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { generateBarcode } from './utils/barcode';

// Import Supabase hooks
import { useBooks, useUsers, useBorrowings, useActivities } from './utils/supabase/hooks';

export default function App() {
  // ============================================
  // SUPABASE HOOKS - Real-time data sync
  // ============================================
  const { books, loading: booksLoading, error: booksError, addBook, updateBook, deleteBook } = useBooks();
  const { users, loading: usersLoading, error: usersError, addUser } = useUsers();
  const { borrowings, loading: borrowingsLoading, error: borrowingsError, addBorrowing, updateBorrowing } = useBorrowings();
  const { activities, loading: activitiesLoading, error: activitiesError, addActivity: addActivityToDb } = useActivities();

  // ============================================
  // LOCAL STATE - Session & Cart (not in DB)
  // ============================================
  
  // Current user session (localStorage only)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartlib_currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Shopping cart (client-side only, not persisted to DB)
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI State
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [currentBorrowing, setCurrentBorrowing] = useState<Borrowing | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [showRegister, setShowRegister] = useState(false);
  // DARK MODE PERMANENT - No Toggle Needed!
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState<{
    borrowing: Borrowing;
    type: 'borrow' | 'return';
    lateFee?: number;
    daysLate?: number;
  } | null>(null);

  // ============================================
  // EFFECTS & HANDLERS
  // ============================================

  // 🌙 FORCE DARK MODE PERMANENT - NO LIGHT MODE!
  useEffect(() => {
    // Always enable dark mode - no exceptions!
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    console.log('🌙 SmartLib Ubhara - Dark Mode PERMANENT');
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartlib_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smartlib_currentUser');
    }
  }, [currentUser]);

  // Validate current user exists in database (auto-logout if user was deleted)
  useEffect(() => {
    if (currentUser && !usersLoading && users.length > 0) {
      const userExists = users.some(u => u.id === currentUser.id);
      if (!userExists) {
        console.warn('⚠️ User tidak ditemukan di database. Auto logout...');
        toast.error('Sesi Anda tidak valid. Silakan login kembali.', {
          duration: 5000,
        });
        setCurrentUser(null);
        setCart([]);
        setActiveTab('catalog');
      }
    }
  }, [currentUser, users, usersLoading]);

  // Show errors if any
  useEffect(() => {
    if (booksError) toast.error(`Books error: ${booksError}`);
    if (usersError) toast.error(`Users error: ${usersError}`);
    if (borrowingsError) toast.error(`Borrowings error: ${borrowingsError}`);
    if (activitiesError) toast.error(`Activities error: ${activitiesError}`);
  }, [booksError, usersError, borrowingsError, activitiesError]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Add activity log to Supabase
  const addActivity = async (action: Activity['action'], description: string, metadata?: any, skipUserCheck = false, userOverride?: User) => {
    const user = userOverride || currentUser;
    if (!user) return;
    
    // Check if user exists in database first (unless explicitly skipped for new registrations)
    if (!skipUserCheck) {
      const userExists = users.some(u => u.id === user.id);
      if (!userExists) {
        console.warn('Cannot add activity: User not found in database');
        return;
      }
    }
    
    const activityData: Omit<Activity, 'id'> = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      description,
      timestamp: new Date(),
      metadata: metadata || null,
    };
    
    try {
      const result = await addActivityToDb(activityData);
      if (!result.success) {
        console.error('Failed to add activity:', result.error);
        // Don't show error toast to user - just log it
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      // Silently fail - activity log is not critical
    }
  };

  // ============================================
  // AUTH HANDLERS
  // ============================================

  const handleLogin = async (user: User) => {
    console.log('🔐 Login attempt:', { 
      userId: user.id, 
      name: user.name, 
      usersInArray: users.length 
    });
    
    // ✅ VALIDATE: Ensure user exists in database
    const userInDb = users.find(u => u.id === user.id);
    
    if (!userInDb) {
      // User not in database array - probably quick login before data fully loaded
      console.warn('⚠️ User not found in local array, attempting to add to database...');
      
      // Try to add user to database
      const result = await addUser(user);
      
      if (!result.success) {
        // Check if error is duplicate key (user already exists in DB)
        const isDuplicate = result.error?.includes('duplicate key') || 
                           result.error?.includes('users_membership_id_key') ||
                           result.error?.includes('users_email_key') ||
                           result.error?.includes('users_pkey');
        
        if (isDuplicate) {
          // User already in DB, just not loaded yet - that's OK!
          console.log('✅ User already exists in database (duplicate key) - proceeding with login');
          // Don't show error toast - this is expected behavior
        } else {
          // Real error - database not setup or connection issue
          console.error('❌ Failed to add user to database:', result.error);
          toast.warning('⚠️ Login berhasil, tapi database belum tersinkronisasi. Beberapa fitur mungkin tidak berfungsi.', {
            duration: 5000,
          });
          // TETAP LOGIN - jangan return!
          // User bisa login dan lihat UI, tapi database functions mungkin tidak work
        }
      } else {
        console.log('✅ User added to database successfully');
        toast.success(`User berhasil ditambahkan! Selamat datang, ${user.name}!`);
      }
    } else {
      console.log('✅ User found in local array');
    }
    
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('confirmation');
    } else {
      setActiveTab('catalog');
    }
    
    // Add login activity (pass user explicitly since state might not be updated yet)
    addActivity('login', `${user.role === 'admin' ? 'Admin' : 'Anggota'} login ke sistem`, undefined, false, user);
    
    if (userInDb) {
      toast.success(`Selamat datang, ${user.name}!`);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      addActivity('logout', `${currentUser.role === 'admin' ? 'Admin' : 'Anggota'} logout dari sistem`);
    }
    
    setCurrentUser(null);
    setCart([]); // Clear cart on logout
    setActiveTab('catalog');
    toast.info('Anda telah keluar dari sistem');
  };

  const handleRegister = async (name: string, email: string, password: string, phone: string, address: string) => {
    // Check if email already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      toast.error('Email sudah terdaftar!');
      return;
    }

    const memberCount = users.filter(u => u.role === 'member').length;
    const membershipId = `MEM-${String(memberCount + 1).padStart(6, '0')}`;
    
    const newUserData: Omit<User, 'id'> = {
      name,
      email,
      password, // In production, this should be hashed
      phone,
      address,
      membershipId,
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };

    const result = await addUser(newUserData);
    
    if (result.success && result.data) {
      // Map database user to application User type
      const newUser: User = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        phone: result.data.phone,
        address: result.data.address,
        membershipId: result.data.membership_id,
        role: result.data.role as 'admin' | 'member',
        joinDate: result.data.join_date,
        avatar: result.data.avatar,
      };

      setCurrentUser(newUser);
      setShowRegister(false);
      setActiveTab('catalog');
      
      // Add register activity - skip user check since this is a fresh registration
      await addActivity('register', `Pendaftaran anggota baru: ${name} (${membershipId})`, null, true);
      
      toast.success(`Selamat datang, ${name}! ID Keanggotaan: ${membershipId}`);
    } else {
      toast.error(result.error || 'Gagal mendaftar. Silakan coba lagi.');
    }
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
      item.bookId === bookId 
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const handleRemoveFromCart = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setCart(cart.filter((item) => item.bookId !== bookId));
    toast.success(`"${book?.title}" dihapus dari keranjang`);
  };

  const handleClearCart = () => {
    setCart([]);
    toast.info('Keranjang telah dikosongkan');
  };

  // ============================================
  // BORROWING HANDLERS
  // ============================================

  const handleCheckout = async (borrowDate: Date, dueDate: Date) => {
    if (cart.length === 0 || !currentUser) return;

    // Generate barcode
    const barcode = generateBarcode(currentUser.id);

    // Create borrowing details from cart
    const details: Omit<BorrowingDetail, 'id' | 'borrowingId'>[] = cart.map((item) => ({
      bookId: item.bookId,
      quantity: item.quantity,
    }));

    const borrowingData: Omit<Borrowing, 'id'> = {
      userId: currentUser.id,
      borrowDate: borrowDate,
      dueDate: dueDate,
      status: 'pending',
      barcode,
      details: details, // Pass cart items as borrowing details
    };

    const result = await addBorrowing(borrowingData);

    if (result.success && result.data) {
      const totalBooks = cart.reduce((sum, item) => sum + item.quantity, 0);
      const bookTitles = cart.map(item => {
        const book = books.find(b => b.id === item.bookId);
        return book?.title;
      }).join(', ');

      // Find the newly created borrowing from the list
      const newBorrowing = borrowings.find(b => b.barcode === barcode);
      if (newBorrowing) {
        setCurrentBorrowing(newBorrowing);
        setShowBarcodeDialog(true);
      }

      setCart([]); // Clear cart after checkout
      setActiveTab('borrowings'); // Switch to borrowings tab
      
      await addActivity('borrow_request', `Mengajukan peminjaman ${totalBooks} buku: ${bookTitles}`, { barcode });
      
      toast.success('Peminjaman berhasil dibuat! Tunjukkan barcode ke petugas.');
    } else {
      // Show detailed error message
      console.error('Checkout error:', result.error);
      
      // Check if it's a foreign key constraint error
      if (result.error?.includes('foreign key constraint') || result.error?.includes('violates')) {
        toast.error('Data tidak valid! Silakan logout dan login kembali, lalu coba lagi.');
      } else {
        toast.error(result.error || 'Gagal membuat peminjaman. Silakan coba lagi.');
      }
    }
  };

  const handleConfirmBorrowing = async (borrowingId: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) return;

    // Check stock availability for all items
    for (const detail of borrowing.details) {
      const book = books.find((b) => b.id === detail.bookId);
      if (!book || book.stock < detail.quantity) {
        toast.error(`Stok buku tidak mencukupi untuk "${book?.title}"`);
        return;
      }
    }

    // Update borrowing status
    const updateResult = await updateBorrowing(borrowingId, { status: 'active' });

    if (updateResult.success) {
      // Reduce stock for each book
      for (const detail of borrowing.details) {
        const book = books.find(b => b.id === detail.bookId);
        if (book) {
          await updateBook(detail.bookId, { stock: book.stock - detail.quantity });
        }
      }

      const user = users.find((u) => u.id === borrowing.userId);
      const totalBooks = borrowing.details.reduce((sum, d) => sum + d.quantity, 0);
      
      await addActivity('borrow_confirm', `Mengkonfirmasi peminjaman ${totalBooks} buku untuk ${user?.name} (${user?.membershipId})`, { borrowingId });
      
      toast.success(`Peminjaman dikonfirmasi! ${user?.name} dapat mengambil buku.`);

      // Show print dialog
      setPrintData({
        borrowing,
        type: 'borrow',
      });
      setShowPrintDialog(true);
    } else {
      toast.error(updateResult.error || 'Gagal mengkonfirmasi peminjaman.');
    }
  };

  const handleReturnBook = async (borrowingId: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) return;

    const returnBarcode = generateBarcode(`RETURN-${currentUser?.id}-${Date.now()}`);

    const result = await updateBorrowing(borrowingId, { 
      status: 'returning', 
      returnBarcode 
    });

    if (result.success) {
      const totalBooks = borrowing.details.reduce((sum, d) => sum + d.quantity, 0);
      await addActivity('return_request', `Mengajukan pengembalian ${totalBooks} buku`, { borrowingId });

      toast.success('Permintaan pengembalian berhasil! Tunjukkan barcode ke petugas.');
    } else {
      toast.error(result.error || 'Gagal mengajukan pengembalian.');
    }
  };

  const handleConfirmReturn = async (borrowingId: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) return;

    const returnDate = new Date();
    const daysLate = Math.max(
      0,
      Math.floor(
        (returnDate.getTime() - borrowing.dueDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    
    // Calculate late fee per book per day (Rp 2,000 per book per day)
    const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
    const lateFee = daysLate * totalBooks * 2000;

    const updateResult = await updateBorrowing(borrowingId, { 
      status: 'returned', 
      returnDate 
    });

    if (updateResult.success) {
      // Return stock for each book
      for (const detail of borrowing.details) {
        const book = books.find(b => b.id === detail.bookId);
        if (book) {
          await updateBook(detail.bookId, { stock: book.stock + detail.quantity });
        }
      }

      const user = users.find((u) => u.id === borrowing.userId);
      const description = lateFee > 0 
        ? `Mengkonfirmasi pengembalian ${totalBooks} buku dari ${user?.name} - Denda: Rp ${lateFee.toLocaleString('id-ID')} (${daysLate} hari)`
        : `Mengkonfirmasi pengembalian ${totalBooks} buku dari ${user?.name}`;
      
      await addActivity('return_confirm', description, { borrowingId, lateFee, daysLate });

      if (lateFee > 0) {
        toast.warning(`Pengembalian dikonfirmasi. Denda keterlambatan: Rp ${lateFee.toLocaleString('id-ID')}`);
      } else {
        toast.success('Pengembalian dikonfirmasi!');
      }

      // Show print dialog
      const updatedBorrowing = { ...borrowing, returnDate };
      setPrintData({
        borrowing: updatedBorrowing,
        type: 'return',
        lateFee,
        daysLate,
      });
      setShowPrintDialog(true);
    } else {
      toast.error(updateResult.error || 'Gagal mengkonfirmasi pengembalian.');
    }
  };

  // ============================================
  // BOOK MANAGEMENT (ADMIN)
  // ============================================

  const handleAddBook = async (bookData: Partial<Book>) => {
    const result = await addBook(bookData);
    
    if (result.success && result.data) {
      await addActivity('book_add', `Menambahkan buku baru: "${bookData.title}" (${bookData.stock} eksemplar)`, { bookId: result.data.id });
      toast.success(`Buku "${bookData.title}" berhasil ditambahkan!`);
    } else {
      toast.error(result.error || 'Gagal menambahkan buku.');
    }
  };

  const handleEditBook = async (id: string, bookData: Partial<Book>) => {
    const book = books.find(b => b.id === id);
    const result = await updateBook(id, bookData);
    
    if (result.success) {
      await addActivity('book_edit', `Mengedit data buku: "${book?.title}"`, { bookId: id });
      toast.success('Data buku berhasil diperbarui!');
    } else {
      toast.error(result.error || 'Gagal memperbarui buku.');
    }
  };

  const handleDeleteBook = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      const result = await deleteBook(id);
      
      if (result.success) {
        await addActivity('book_delete', `Menghapus buku: "${book.title}"`, { bookId: id });
        toast.success(`Buku "${book.title}" berhasil dihapus!`);
      } else {
        toast.error(result.error || 'Gagal menghapus buku.');
      }
    }
  };

  const handleUpdateStock = async (id: string, increment: number) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const newStock = book.stock + increment;
    
    if (newStock < 0) {
      toast.error('Stok tidak boleh kurang dari 0');
      return;
    }
    
    const result = await updateBook(id, { stock: newStock });
    
    if (result.success) {
      toast.success(
        increment > 0 
          ? 'Stok berhasil ditambah!' 
          : 'Stok berhasil dikurangi!'
      );
    } else {
      toast.error(result.error || 'Gagal mengupdate stok.');
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  const isLoading = booksLoading || usersLoading || borrowingsLoading || activitiesLoading;

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-100">Memuat data dari Supabase...</p>
          <p className="text-sm text-gray-400 mt-2">Menghubungkan ke database real-time</p>
        </div>
      </div>
    );
  }

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
        usersLoading={usersLoading}
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
              <Card className="hidden sm:block">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
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
                  </div>
                </CardContent>
              </Card>
              <Button variant="ghost" size="icon" className="sm:hidden hover:bg-emerald-950/50">
                <UserIcon className="w-5 h-5 text-gray-300" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-orange-400 hover:bg-orange-950/30 hover:text-orange-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
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
                <span className="sm:hidden">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="catalog">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Kelola Buku</span>
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
                  <Badge className="ml-2 bg-orange-600 hover:bg-orange-700 text-white" variant="default">
                    {totalCartItems}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="borrowings">
                <Library className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pinjaman</span>
                <span className="sm:hidden">Pinjam</span>
                {borrowings.filter((b) => b.userId === currentUser.id && (b.status === 'pending' || b.status === 'active' || b.status === 'overdue' || b.status === 'returning')).length > 0 && (
                  <Badge className="ml-2 bg-orange-500 hover:bg-orange-600 text-white" variant="secondary">
                    {borrowings.filter((b) => b.userId === currentUser.id && (b.status === 'pending' || b.status === 'active' || b.status === 'overdue' || b.status === 'returning')).length}
                  </Badge>
                )}
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
                  <h2 className="mb-2 text-gray-100">Dashboard Admin</h2>
                  <p className="text-gray-400">
                    Pantau aktivitas perpustakaan dan statistik peminjaman
                  </p>
                </div>
                <AdminDashboard books={books} borrowings={borrowings} users={users} activities={activities} />
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
                <BookCatalog 
                  books={books}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                />
              </TabsContent>

              <TabsContent value="cart">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Keranjang Peminjaman</h2>
                  <p className="text-gray-400">
                    Atur buku yang akan dipinjam dan lakukan checkout
                  </p>
                </div>
                <CartPage
                  cart={cart}
                  books={books}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveFromCart}
                  onCheckout={handleCheckout}
                  onClearCart={handleClearCart}
                />
              </TabsContent>

              <TabsContent value="borrowings">
                <div className="mb-6">
                  <h2 className="mb-2 text-gray-100">Peminjaman Saya</h2>
                  <p className="text-gray-400">
                    Kelola peminjaman buku dan lihat riwayat
                  </p>
                </div>
                <BorrowingPage
                  borrowings={borrowings.filter(b => b.userId === currentUser.id)}
                  books={books}
                  onReturn={handleReturnBook}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 backdrop-blur-md border-t border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2024 SmartLib Ubhara. Perpustakaan Universitas Bhayangkara Jakarta Raya.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Tentang
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Bantuan
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Kontak
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Barcode Display Dialog */}
      {currentBorrowing && (
        <BarcodeDisplay
          barcode={currentBorrowing.barcode || currentBorrowing.returnBarcode || ''}
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
    </div>
  );
}
