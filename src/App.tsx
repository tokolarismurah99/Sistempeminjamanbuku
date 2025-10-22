import { useState, useEffect } from 'react';
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
  // EFFECTS - Save to localStorage
  // ============================================

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    console.log('🌙 SmartLib Ubhara - Dark Mode PERMANENT');
  }, []);

  // Save books to localStorage
  useEffect(() => {
    localStorage.setItem('smartlib_books', JSON.stringify(books));
  }, [books]);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('smartlib_users', JSON.stringify(users));
  }, [users]);

  // Save borrowings to localStorage
  useEffect(() => {
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

  const handleCheckout = () => {
    if (!currentUser || cart.length === 0) return;

    // Create borrowing details from cart
    const details: BorrowingDetail[] = cart.map(item => {
      const book = books.find(b => b.id === item.bookId)!;
      return {
        bookId: item.bookId,
        bookTitle: book.title,
        quantity: item.quantity,
      };
    });

    // Generate barcode for borrowing confirmation
    const barcode = generateBarcode(currentUser.membershipId);
    const borrowDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newBorrowing: Borrowing = {
      id: `borrow-${Date.now()}`,
      userId: currentUser.id,
      details,
      borrowDate,
      dueDate,
      status: 'pending',
      barcode,
    };

    setBorrowings([...borrowings, newBorrowing]);
    setCurrentBorrowing(newBorrowing);
    setShowBarcodeDialog(true);
    setCart([]);
    toast.success('Peminjaman berhasil dibuat! Tunjukkan barcode ke admin untuk konfirmasi.');
  };

  // ============================================
  // ADMIN - BORROWING CONFIRMATION
  // ============================================

  const handleConfirmBorrowing = (borrowingId: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) return;

    // Update book stock
    const updatedBooks = books.map((book) => {
      const detail = borrowing.details.find((d) => d.bookId === book.id);
      if (detail) {
        return { ...book, stock: book.stock - detail.quantity };
      }
      return book;
    });

    // Update borrowing status
    const updatedBorrowings = borrowings.map((b) =>
      b.id === borrowingId ? { ...b, status: 'borrowed' as const } : b
    );

    setBooks(updatedBooks);
    setBorrowings(updatedBorrowings);

    // Show print dialog
    setPrintData({ borrowing: { ...borrowing, status: 'borrowed' }, type: 'borrow' });
    setShowPrintDialog(true);

    toast.success('Peminjaman berhasil dikonfirmasi!');
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
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) return;

    const returnDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(borrowing.dueDate);
    const returnDateObj = new Date(returnDate);
    const daysLate = Math.max(0, Math.floor((returnDateObj.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const lateFee = daysLate * 2000;

    // Return books to stock
    const updatedBooks = books.map((book) => {
      const detail = borrowing.details.find((d) => d.bookId === book.id);
      if (detail) {
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
                  onRemove={handleRemoveFromCart}
                  onCheckout={handleCheckout}
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-300">
                &copy; 2025 SmartLib Ubhara. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Universitas Bhayangkara Jakarta Raya
              </p>
            </div>
            <div className="flex gap-6">
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
