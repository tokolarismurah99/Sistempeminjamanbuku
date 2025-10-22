import { useState } from 'react';
import { Borrowing, Book, User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Scan, CheckCircle, Clock, AlertCircle, Search, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AdminBorrowingConfirmationProps {
  borrowings: Borrowing[];
  books: Book[];
  users: User[];
  onConfirmBorrowing: (borrowingId: string) => void;
}

export function AdminBorrowingConfirmation({
  borrowings,
  books,
  users,
  onConfirmBorrowing,
}: AdminBorrowingConfirmationProps) {
  const [scanInput, setScanInput] = useState('');
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const pendingBorrowings = borrowings.filter((b) => b.status === 'pending');

  const handleScan = () => {
    if (!scanInput.trim()) {
      toast.error('Masukkan kode barcode terlebih dahulu');
      return;
    }

    const borrowing = pendingBorrowings.find((b) => b.barcode === scanInput.trim());

    if (borrowing) {
      setSelectedBorrowing(borrowing);
      setShowConfirmDialog(true);
      setScanInput('');
    } else {
      toast.error('Barcode tidak ditemukan atau sudah dikonfirmasi');
    }
  };

  const handleConfirm = () => {
    if (!selectedBorrowing || isConfirming) {
      console.warn('⚠️ Button protection: Cannot confirm -', !selectedBorrowing ? 'no borrowing selected' : 'already confirming');
      return;
    }
    
    console.log('🔘 Button: Starting confirmation process for', selectedBorrowing.id);
    setIsConfirming(true);
    
    // Call parent handler
    onConfirmBorrowing(selectedBorrowing.id);
    
    // Close dialog and clear selection immediately
    setShowConfirmDialog(false);
    setSelectedBorrowing(null);
    
    // Reset isConfirming after delay (safety buffer)
    setTimeout(() => {
      console.log('🔘 Button: Resetting isConfirming state');
      setIsConfirming(false);
    }, 3000); // Increased to 3 seconds for extra safety
  };

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const PendingBorrowingCard = ({ borrowing }: { borrowing: Borrowing }) => {
    const user = getUser(borrowing.userId);
    const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base mb-1 text-gray-100">
                {user?.name}
              </CardTitle>
              <p className="text-sm text-gray-400">{user?.membershipId}</p>
            </div>
            <Badge variant="outline" className="border-yellow-600 text-yellow-400 bg-yellow-950/30">
              <Clock className="w-3 h-3 mr-1" />
              Menunggu
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Book Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Package className="w-4 h-4" />
              <span>{totalBooks} buku • {borrowing.details.length} judul</span>
            </div>
            {borrowing.details.map((detail) => {
              const book = getBook(detail.bookId);
              if (!book) return null;

              return (
                <div key={detail.bookId} className="flex gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-slate-700">
                    <ImageWithFallback
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm line-clamp-1 mb-1 text-gray-100">{book.title}</h5>
                    <p className="text-xs text-gray-400 mb-2">{book.author}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-400">Qty: {detail.quantity}</span>
                      <span className="text-gray-500">Stok: {book.stock}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Date Info */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t text-sm">
            <div>
              <span className="text-gray-400">Tanggal Pinjam:</span>
              <p className="text-gray-100">{format(new Date(borrowing.borrowDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
            <div>
              <span className="text-gray-400">Jatuh Tempo:</span>
              <p className="text-gray-100">{format(new Date(borrowing.dueDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedBorrowing(borrowing);
              setShowConfirmDialog(true);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Konfirmasi Peminjaman
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Barcode Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-100">Scan Barcode Peminjaman</CardTitle>
          <CardDescription>
            Scan atau masukkan kode barcode untuk mengkonfirmasi peminjaman
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Masukkan atau scan barcode..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleScan();
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button onClick={handleScan} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Search className="w-4 h-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Borrowings List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-100">Daftar Peminjaman Menunggu Konfirmasi</h3>
          <Badge variant="secondary">{pendingBorrowings.length} peminjaman</Badge>
        </div>

        {pendingBorrowings.length > 0 ? (
          <div className="grid gap-4">
            {pendingBorrowings.map((borrowing) => (
              <PendingBorrowingCard key={borrowing.id} borrowing={borrowing} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-400">Tidak ada peminjaman yang menunggu konfirmasi</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Peminjaman</DialogTitle>
            <DialogDescription>
              Pastikan semua detail peminjaman sudah benar sebelum mengkonfirmasi
            </DialogDescription>
          </DialogHeader>

          {selectedBorrowing && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4">
                <Label className="text-sm text-emerald-300">Informasi Peminjam</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-200">
                    <strong className="text-gray-100">Nama:</strong> {getUser(selectedBorrowing.userId)?.name}
                  </p>
                  <p className="text-sm text-gray-200">
                    <strong className="text-gray-100">ID Anggota:</strong> {getUser(selectedBorrowing.userId)?.membershipId}
                  </p>
                  <p className="text-sm text-gray-200">
                    <strong className="text-gray-100">Email:</strong> {getUser(selectedBorrowing.userId)?.email}
                  </p>
                </div>
              </div>

              {/* Books Detail */}
              <div>
                <Label className="mb-3 block text-gray-300">Detail Buku yang Dipinjam</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedBorrowing.details.map((detail) => {
                    const book = getBook(detail.bookId);
                    if (!book) return null;

                    const hasEnoughStock = book.stock >= detail.quantity;

                    return (
                      <div
                        key={detail.bookId}
                        className={`flex gap-3 p-3 rounded-lg border ${
                          hasEnoughStock ? 'bg-slate-800 border-slate-700' : 'bg-red-950/30 border-red-800'
                        }`}
                      >
                        <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-slate-700">
                          <ImageWithFallback
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm line-clamp-1 text-gray-100">{book.title}</h5>
                          <p className="text-xs text-gray-400 mb-1">{book.author}</p>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300">
                            <span>Qty: {detail.quantity}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <span className={hasEnoughStock ? 'text-green-400' : 'text-red-400'}>
                              Stok: {book.stock}
                            </span>
                          </div>
                          {!hasEnoughStock && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>Stok tidak mencukupi!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-400">Tanggal Pinjam</Label>
                  <p className="text-sm mt-1 text-gray-200">
                    {format(new Date(selectedBorrowing.borrowDate), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Jatuh Tempo</Label>
                  <p className="text-sm mt-1 text-gray-200">
                    {format(new Date(selectedBorrowing.dueDate), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-3">
                <p className="text-sm text-yellow-300">
                  <strong>Perhatian:</strong> Pastikan buku tersedia sebelum menyerahkan kepada peminjam.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isConfirming}>
              Batal
            </Button>
            <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isConfirming}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isConfirming ? 'Memproses...' : 'Konfirmasi Peminjaman'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
