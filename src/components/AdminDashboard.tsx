import { useState } from 'react';
import { Book, Borrowing, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Users, TrendingUp, AlertTriangle, Clock, Package, ChevronRight, Calendar, User as UserIcon, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  exportToExcel, 
  exportToPDF, 
  prepareBookDataForExport,
  prepareBorrowingDataForExport,
  preparePopularBooksForExport,
  prepareActiveMembersForExport
} from '../utils/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AdminDashboardProps {
  books: Book[];
  borrowings: Borrowing[];
  users: User[];
}

type DetailView = 
  | { type: 'borrowed' }
  | { type: 'pending' }
  | { type: 'active' }
  | { type: 'overdue' }
  | { type: 'returning' }
  | null;

export function AdminDashboard({ books, borrowings, users }: AdminDashboardProps) {
  const [detailView, setDetailView] = useState<DetailView>(null);

  // Debug: Log received props
  console.log('📊 AdminDashboard - Received borrowings:', borrowings.length);
  console.log('📊 AdminDashboard - Borrowings:', borrowings);
  
  if (borrowings.length > 0) {
    console.log('📊 First borrowing sample:', {
      id: borrowings[0].id,
      status: borrowings[0].status,
      statusType: typeof borrowings[0].status,
      details: borrowings[0].details,
      borrowDate: borrowings[0].borrowDate,
      dueDate: borrowings[0].dueDate
    });
  }

  // Export handlers
  const handleExportBooks = (format: 'excel' | 'pdf') => {
    const data = prepareBookDataForExport(books);
    if (format === 'excel') {
      exportToExcel(data, 'Data_Buku_SmartLib');
    } else {
      exportToPDF('Data Buku', data, Object.keys(data[0]));
    }
  };

  const handleExportBorrowings = (format: 'excel' | 'pdf', status?: string) => {
    let filteredBorrowings = borrowings;
    let title = 'Data Peminjaman';
    
    if (status === 'borrowed') {
      filteredBorrowings = borrowings.filter(b => 
        b.status === 'active' || b.status === 'overdue' || b.status === 'returning'
      );
      title = 'Buku Dipinjam';
    } else if (status === 'active') {
      filteredBorrowings = activeBorrowings;
      title = 'Peminjaman Aktif';
    } else if (status === 'pending') {
      filteredBorrowings = pendingBorrowings;
      title = 'Konfirmasi Peminjaman';
    } else if (status === 'returning') {
      filteredBorrowings = returningBorrowings;
      title = 'Konfirmasi Pengembalian';
    } else if (status === 'overdue') {
      filteredBorrowings = overdueBorrowings;
      title = 'Peminjaman Terlambat';
    }
    
    const data = prepareBorrowingDataForExport(filteredBorrowings, books, users);
    
    if (data.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }
    
    if (format === 'excel') {
      exportToExcel(data, `${title.replace(/ /g, '_')}_SmartLib`);
    } else {
      exportToPDF(title, data, Object.keys(data[0]));
    }
  };

  const handleExportPopularBooks = (format: 'excel' | 'pdf') => {
    const data = preparePopularBooksForExport(books, borrowings);
    if (data.length === 0) {
      alert('Belum ada data peminjaman');
      return;
    }
    
    if (format === 'excel') {
      exportToExcel(data, 'Buku_Populer_SmartLib');
    } else {
      exportToPDF('Buku Paling Populer', data, Object.keys(data[0]));
    }
  };

  const handleExportMembers = (format: 'excel' | 'pdf') => {
    const data = prepareActiveMembersForExport(users, borrowings);
    if (format === 'excel') {
      exportToExcel(data, 'Data_Anggota_SmartLib');
    } else {
      exportToPDF('Data Anggota', data, Object.keys(data[0]));
    }
  };

  // 🔧 FIX: Calculate stock correctly
  // totalBooks = current stock (sudah dikurangi saat confirm borrowing)
  // Ini SUDAH represent available books, TIDAK perlu dikurangi lagi!
  const totalBooks = books.reduce((sum, book) => sum + book.stock, 0);
  
  // Calculate borrowed books from CONFIRMED borrowings only (active, overdue, returning)
  // TIDAK termasuk 'pending' karena belum dikonfirmasi admin
  const filteredForBorrowed = borrowings.filter((b) => 
    b.status === 'active' || b.status === 'overdue' || b.status === 'returning'
  );
  
  console.log('📊 Filtered borrowings for borrowed count (active/overdue/returning):', filteredForBorrowed);
  console.log('📊 Filtered count:', filteredForBorrowed.length);
  
  const borrowedBooksCount = filteredForBorrowed.reduce((sum, borrowing) => {
    const detailCount = borrowing.details.reduce((detailSum, detail) => detailSum + detail.quantity, 0);
    console.log(`   Borrowing ${borrowing.id}: ${detailCount} books`);
    return sum + detailCount;
  }, 0);
  
  console.log('📊 Total borrowedBooksCount:', borrowedBooksCount);
  
  // 🔧 FIX: totalBooks SUDAH adalah available books!
  // Stock sudah dikurangi saat konfirmasi, jadi TIDAK perlu dikurangi lagi
  const availableBooks = totalBooks;

  const pendingBorrowings = borrowings.filter((b) => b.status === 'pending');
  const activeBorrowings = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'overdue'
  );
  const overdueBorrowings = borrowings.filter((b) => b.status === 'overdue');
  const returningBorrowings = borrowings.filter((b) => b.status === 'returning');
  
  console.log('📊 ============ STATS CALCULATION ============');
  console.log('📊 Total borrowings in system:', borrowings.length);
  console.log('📊 Breakdown by status:');
  console.log('   - Pending (belum konfirmasi):', pendingBorrowings.length);
  console.log('   - Active (sedang dipinjam):', activeBorrowings.length);
  console.log('   - Overdue (terlambat):', overdueBorrowings.length);
  console.log('   - Returning (proses pengembalian):', returningBorrowings.length);
  console.log('📊 All statuses:', borrowings.map(b => `${b.id}: ${b.status}`));
  console.log('📊 Borrowed books count (active+overdue+returning):', borrowedBooksCount);
  
  if (pendingBorrowings.length > 0) {
    console.log('⚠️ ADA BORROWINGS PENDING! Konfirmasi dulu di tab "Konfirmasi Peminjaman"');
  }

  // Get unique users who have borrowed (CONFIRMED only, not pending)
  const borrowedByUsers = new Set(
    borrowings
      .filter(b => b.status === 'active' || b.status === 'overdue' || b.status === 'returning')
      .map(b => b.userId)
  ).size;

  // Calculate late fees
  const calculateLateFee = (borrowing: Borrowing) => {
    const today = new Date();
    const dueDate = borrowing.dueDate instanceof Date ? borrowing.dueDate : new Date(borrowing.dueDate);
    const daysLate = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalBooksInBorrowing = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
    return daysLate * totalBooksInBorrowing * 2000;
  };

  const totalLateFees = borrowings
    .filter(b => b.status === 'overdue' || b.status === 'returning')
    .reduce((sum, b) => sum + calculateLateFee(b), 0);

  // Popular books based on borrowing frequency
  const bookBorrowCounts = new Map<string, number>();
  borrowings.forEach((borrowing) => {
    borrowing.details.forEach((detail) => {
      const current = bookBorrowCounts.get(detail.bookId) || 0;
      bookBorrowCounts.set(detail.bookId, current + detail.quantity);
    });
  });

  const popularBooks = books
    .map((book) => ({
      ...book,
      borrowCount: bookBorrowCounts.get(book.id) || 0,
    }))
    .filter(b => b.borrowCount > 0)
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 5);

  const getUser = (userId: string) => users.find(u => u.id === userId);
  const getBook = (bookId: string) => books.find(b => b.id === bookId);

  // STOCK VALIDATION
  console.log('📊 ═══════════ STOCK VALIDATION ═══════════');
  console.log(`📊 Available books (current stock): ${availableBooks} books across ${books.length} titles`);
  console.log(`📊 Currently borrowed: ${borrowedBooksCount} books`);
  console.log(`📊 Formula: Available = Current Stock (sudah dikurangi saat confirm)`);
  console.log(`📊 Logic: Ketika confirm borrowing, stock LANGSUNG dikurangi`);
  console.log(`📊        Jadi totalBooks SUDAH represent available books`);
  console.log(`📊 ✅ No double counting! Stock reduction only happens ONCE at confirmation.`);
  console.log('📊 ═══════════════════════════════════════');

  const stats = [
    {
      title: 'Stok Buku Tersedia',
      value: availableBooks,
      subtitle: `${books.length} judul • ${availableBooks} eks tersedia`,
      icon: BookOpen,
      color: 'text-emerald-400',
      bgColor: 'bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-800/30',
      clickable: false,
    },
    {
      title: 'Buku Dipinjam',
      value: borrowedBooksCount,
      subtitle: borrowedBooksCount > 0 
        ? `${borrowedByUsers} anggota • ${activeBorrowings.length + returningBorrowings.length} invoice`
        : 'Belum ada buku dipinjam',
      icon: TrendingUp,
      color: 'text-teal-400',
      bgColor: 'bg-gradient-to-br from-teal-950/40 to-cyan-950/40 border border-teal-800/30',
      clickable: true,
      onClick: () => setDetailView({ type: 'borrowed' }),
    },
    {
      title: 'Konfirmasi Peminjaman',
      value: pendingBorrowings.length,
      subtitle: pendingBorrowings.length > 0 ? `${pendingBorrowings.length} invoice menunggu` : 'Tidak ada pending',
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-gradient-to-br from-orange-950/40 to-amber-950/40 border border-orange-800/30',
      clickable: true,
      onClick: () => setDetailView({ type: 'pending' }),
    },
    {
      title: 'Konfirmasi Pengembalian',
      value: returningBorrowings.length,
      subtitle: returningBorrowings.length > 0 ? `${returningBorrowings.length} invoice menunggu` : 'Tidak ada pending',
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/30',
      clickable: true,
      onClick: () => setDetailView({ type: 'returning' }),
    },
    {
      title: 'Keterlambatan',
      value: overdueBorrowings.length,
      subtitle: `Denda: Rp ${totalLateFees.toLocaleString('id-ID')}`,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-gradient-to-br from-red-950/40 to-pink-950/40 border border-red-800/30',
      clickable: true,
      onClick: () => setDetailView({ type: 'overdue' }),
    },
  ];

  const renderBorrowingDetail = (borrowing: Borrowing) => {
    const user = getUser(borrowing.userId);
    const lateFee = calculateLateFee(borrowing);
    const dueDate = borrowing.dueDate instanceof Date ? borrowing.dueDate : new Date(borrowing.dueDate);
    const daysLate = differenceInDays(new Date(), dueDate);
    const totalBooks = borrowing.details.reduce((sum, d) => sum + d.quantity, 0);

    return (
      <Card key={borrowing.id} className="mb-4">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-100">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.membershipId}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <Badge 
                variant="outline" 
                className={
                  borrowing.status === 'active' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-700' :
                  borrowing.status === 'overdue' ? 'bg-red-950/30 text-red-400 border-red-700' :
                  borrowing.status === 'pending' ? 'bg-orange-950/30 text-orange-400 border-orange-700' :
                  borrowing.status === 'returning' ? 'bg-blue-950/30 text-blue-400 border-blue-700' :
                  ''
                }
              >
                {borrowing.status === 'active' && '✓ Aktif'}
                {borrowing.status === 'overdue' && '⚠ Terlambat'}
                {borrowing.status === 'pending' && '⏳ Pending'}
                {borrowing.status === 'returning' && '↩ Returning'}
              </Badge>
              <p className="text-xs text-gray-500">#{borrowing.barcode}</p>
              <p className="text-xs text-gray-400">
                {totalBooks} eks • {borrowing.details.length} judul
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-400 mb-1">Tanggal Pinjam</p>
              <p className="text-sm text-gray-100">{format(borrowing.borrowDate instanceof Date ? borrowing.borrowDate : new Date(borrowing.borrowDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Tanggal Kembali</p>
              <p className="text-sm text-gray-100">{format(borrowing.dueDate instanceof Date ? borrowing.dueDate : new Date(borrowing.dueDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
          </div>

          {/* Late fee if applicable */}
          {lateFee > 0 && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-300">Denda Keterlambatan</p>
                  <p className="text-xs text-red-400">{daysLate} hari terlambat</p>
                </div>
                <p className="font-medium text-red-200">Rp {lateFee.toLocaleString('id-ID')}</p>
              </div>
            </div>
          )}

          {/* Books List */}
          <div className="space-y-2">
            <p className="text-sm text-gray-300 mb-2">Buku yang Dipinjam:</p>
            {borrowing.details.map((detail, idx) => {
              const book = getBook(detail.bookId);
              if (!book) return null;

              return (
                <div key={detail.id || `${detail.bookId}-${idx}`} className="flex items-center gap-3 p-2 bg-slate-800 border border-slate-600 rounded">
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-slate-700">
                    <ImageWithFallback
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-1 text-gray-100">{book.title}</p>
                    <p className="text-xs text-gray-400">{book.author}</p>
                  </div>
                  <Badge variant="secondary">x{detail.quantity}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailDialog = () => {
    if (!detailView) return null;

    let title = '';
    let description = '';
    let data: Borrowing[] = [];

    switch (detailView.type) {
      case 'borrowed':
        title = 'Detail Buku Sedang Dipinjam';
        description = `Total ${borrowedBooksCount} eksemplar buku sedang dipinjam oleh ${borrowedByUsers} anggota (${activeBorrowings.length + returningBorrowings.length} invoice peminjaman)`;
        data = borrowings.filter(b => 
          b.status === 'active' || b.status === 'overdue' || b.status === 'returning'
        );
        break;
      case 'pending':
        title = 'Konfirmasi Peminjaman';
        description = `${pendingBorrowings.length} peminjaman menunggu konfirmasi admin`;
        data = pendingBorrowings;
        break;
      case 'active':
        title = 'Peminjaman Aktif';
        description = `${activeBorrowings.length} peminjaman sedang berjalan`;
        data = activeBorrowings;
        break;
      case 'overdue':
        title = 'Keterlambatan';
        description = `${overdueBorrowings.length} peminjaman terlambat • Total denda: Rp ${totalLateFees.toLocaleString('id-ID')}`;
        data = overdueBorrowings;
        break;
      case 'returning':
        title = 'Konfirmasi Pengembalian';
        description = `${returningBorrowings.length} peminjaman menunggu konfirmasi pengembalian`;
        data = returningBorrowings;
        break;
    }

    return (
      <Dialog open={true} onOpenChange={() => setDetailView(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {data.length > 0 ? (
              data.map(renderBorrowingDetail)
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mb-2 text-gray-400" />
                <p className="text-sm">Tidak ada data</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="border-emerald-100/50"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-200">{stat.title}</CardTitle>
              <div className="flex items-center gap-2">
                {(index === 0 || index === 1 || index === 2 || index === 3 || index === 4) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30" onClick={(e) => e.stopPropagation()}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        if (index === 0) handleExportBooks('excel');
                        else if (index === 1) handleExportBorrowings('excel', 'borrowed');
                        else if (index === 2) handleExportBorrowings('excel', 'pending');
                        else if (index === 3) handleExportBorrowings('excel', 'returning');
                        else if (index === 4) handleExportBorrowings('excel', 'overdue');
                      }}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        if (index === 0) handleExportBooks('pdf');
                        else if (index === 1) handleExportBorrowings('pdf', 'borrowed');
                        else if (index === 2) handleExportBorrowings('pdf', 'pending');
                        else if (index === 3) handleExportBorrowings('pdf', 'returning');
                        else if (index === 4) handleExportBorrowings('pdf', 'overdue');
                      }}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <div 
                  className={`p-2 rounded-lg ${stat.bgColor} ${stat.clickable ? 'cursor-pointer' : ''}`}
                  onClick={stat.clickable ? stat.onClick : undefined}
                >
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent 
              className={stat.clickable ? 'cursor-pointer' : ''}
              onClick={stat.clickable ? stat.onClick : undefined}
            >
              <div className={`text-3xl mb-1 ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-gray-400">{stat.subtitle}</p>
              {stat.clickable && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 hover:text-emerald-400">
                  <span>Lihat detail</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Borrowings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-200">
              <TrendingUp className="w-5 h-5" />
              Status Peminjaman
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setDetailView({ type: 'pending' })}
              className="w-full flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm text-yellow-900 dark:text-yellow-200">Menunggu Konfirmasi</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  {pendingBorrowings.reduce((sum, b) => sum + b.details.reduce((s, d) => s + d.quantity, 0), 0)} buku
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400">
                  {pendingBorrowings.length}
                </Badge>
                <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </button>
            
            <button
              onClick={() => setDetailView({ type: 'active' })}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-200 dark:border-teal-800 rounded-lg hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-950/50 dark:hover:to-cyan-950/50 transition-all"
            >
              <div className="text-left">
                <p className="text-sm text-teal-900 dark:text-teal-200">Peminjaman Aktif</p>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">
                  {activeBorrowings.reduce((sum, b) => sum + b.details.reduce((s, d) => s + d.quantity, 0), 0)} buku
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-teal-500 dark:border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900">
                  {activeBorrowings.length}
                </Badge>
                <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
            </button>
            
            <button
              onClick={() => setDetailView({ type: 'returning' })}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 rounded-lg hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/50 transition-all"
            >
              <div className="text-left">
                <p className="text-sm text-violet-900 dark:text-violet-200">Menunggu Pengembalian</p>
                <p className="text-xs text-violet-700 dark:text-violet-400 mt-1">
                  {returningBorrowings.reduce((sum, b) => sum + b.details.reduce((s, d) => s + d.quantity, 0), 0)} buku
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-violet-500 dark:border-violet-600 text-violet-700 dark:text-violet-400 bg-white dark:bg-slate-900">
                  {returningBorrowings.length}
                </Badge>
                <ChevronRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
            </button>
            
            <button
              onClick={() => setDetailView({ type: 'overdue' })}
              className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm text-red-900 dark:text-red-200">Terlambat</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Denda: Rp {totalLateFees.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  {overdueBorrowings.length}
                </Badge>
                <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Popular Books */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-200">
                <TrendingUp className="w-5 h-5" />
                Buku Paling Populer
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportPopularBooks('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportPopularBooks('pdf')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {popularBooks.length > 0 ? (
              <div className="space-y-3">
                {popularBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-700 dark:text-emerald-300 flex-shrink-0 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-1 text-gray-900 dark:text-gray-100">{book.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{book.author}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {book.borrowCount}x
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mb-2 text-gray-500" />
                <p className="text-sm">Belum ada data peminjaman</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      {renderDetailDialog()}
    </div>
  );
}
