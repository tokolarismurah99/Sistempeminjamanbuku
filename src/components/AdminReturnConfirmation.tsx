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
import { Scan, CheckCircle, AlertCircle, Search, Package, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';

interface AdminReturnConfirmationProps {
  borrowings: Borrowing[];
  books: Book[];
  users: User[];
  onConfirmReturn: (borrowingId: string) => void;
}

export function AdminReturnConfirmation({
  borrowings,
  books,
  users,
  onConfirmReturn,
}: AdminReturnConfirmationProps) {
  const [scanInput, setScanInput] = useState('');
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const returningBorrowings = borrowings.filter((b) => b.status === 'returning');

  const handleScan = () => {
    if (!scanInput.trim()) {
      toast.error('Masukkan kode barcode terlebih dahulu');
      return;
    }

    const borrowing = returningBorrowings.find(
      (b) => b.returnBarcode === scanInput.trim()
    );

    if (borrowing) {
      setSelectedBorrowing(borrowing);
      setShowConfirmDialog(true);
      setScanInput('');
    } else {
      toast.error('Barcode tidak ditemukan atau belum mengajukan pengembalian');
    }
  };

  const handleConfirm = () => {
    if (selectedBorrowing) {
      onConfirmReturn(selectedBorrowing.id);
      setShowConfirmDialog(false);
      setSelectedBorrowing(null);
    }
  };

  const calculateLateFee = (borrowing: Borrowing) => {
    const today = new Date();
    const dueDate = new Date(borrowing.dueDate);
    const daysLate = differenceInDays(today, dueDate);
    const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
    return daysLate > 0 ? daysLate * totalBooks * 2000 : 0;
  };

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const ReturningBorrowingCard = ({ borrowing }: { borrowing: Borrowing }) => {
    const user = getUser(borrowing.userId);
    const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
    const lateFee = calculateLateFee(borrowing);
    const daysLate = differenceInDays(new Date(), new Date(borrowing.dueDate));

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
            <Badge variant="outline" className="border-violet-600 text-violet-400 bg-violet-950/30">
              <Package className="w-3 h-3 mr-1" />
              Pengembalian
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
                <div key={detail.id} className="flex gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
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
                      <Badge variant="secondary" className="text-xs">
                        {detail.quantity}x
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Late Fee Warning */}
          {lateFee > 0 && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300">
                    <strong>Terlambat {daysLate} hari</strong>
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Denda: Rp {lateFee.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date Info */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t text-sm">
            <div>
              <span className="text-gray-400">Tanggal Pinjam:</span>
              <p className="text-gray-100">{format(new Date(borrowing.borrowDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
            <div>
              <span className="text-gray-400">Jatuh Tempo:</span>
              <p className={daysLate > 0 ? 'text-red-400' : 'text-gray-100'}>
                {format(new Date(borrowing.dueDate), 'dd MMM yyyy', { locale: id })}
              </p>
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
            Proses Pengembalian
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
          <CardTitle className="text-gray-100">Scan Barcode Pengembalian</CardTitle>
          <CardDescription>
            Scan atau masukkan kode barcode untuk memproses pengembalian buku
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Masukkan atau scan barcode pengembalian..."
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

      {/* Returning Borrowings List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-100">Daftar Pengembalian Menunggu Konfirmasi</h3>
          <Badge variant="secondary">{returningBorrowings.length} pengembalian</Badge>
        </div>

        {returningBorrowings.length > 0 ? (
          <div className="grid gap-4">
            {returningBorrowings.map((borrowing) => (
              <ReturningBorrowingCard key={borrowing.id} borrowing={borrowing} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-400">Tidak ada pengembalian yang menunggu konfirmasi</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengembalian</DialogTitle>
            <DialogDescription>
              Verifikasi informasi pengembalian buku berikut
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
                </div>
              </div>

              {/* Late Fee */}
              {calculateLateFee(selectedBorrowing) > 0 && (
                <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <Label className="text-sm text-red-300">Keterlambatan</Label>
                      <p className="text-sm text-red-200 mt-1">
                        Terlambat {differenceInDays(new Date(), new Date(selectedBorrowing.dueDate))} hari
                      </p>
                      <p className="mt-2 text-red-100">
                        <strong className="text-red-200">Total Denda: Rp {calculateLateFee(selectedBorrowing).toLocaleString('id-ID')}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Books List */}
              <div>
                <Label className="mb-3 block text-gray-300">Buku yang Dikembalikan</Label>
                <div className="space-y-3">
                  {selectedBorrowing.details.map((detail) => {
                    const book = getBook(detail.bookId);
                    if (!book) return null;

                    return (
                      <div key={detail.id} className="p-4 border border-slate-600 rounded-lg bg-slate-800">
                        <div className="flex gap-3">
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
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-300">Jumlah: {detail.quantity} buku</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <Label className="text-sm mb-2 block text-gray-300">Ringkasan Pengembalian</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Buku:</span>
                    <span className="text-gray-200">{selectedBorrowing.details.reduce((sum, d) => sum + d.quantity, 0)} buku</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tanggal Pinjam:</span>
                    <span className="text-gray-200">{format(new Date(selectedBorrowing.borrowDate), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jatuh Tempo:</span>
                    <span className="text-gray-200">{format(new Date(selectedBorrowing.dueDate), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  {calculateLateFee(selectedBorrowing) > 0 && (
                    <div className="flex justify-between pt-2 border-t border-slate-600">
                      <span className="text-red-400">Denda:</span>
                      <span className="text-red-300">
                        Rp {calculateLateFee(selectedBorrowing).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Konfirmasi Pengembalian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
