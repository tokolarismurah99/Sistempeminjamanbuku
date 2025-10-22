import { useState } from 'react';
import { Borrowing, Book } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BarcodeDisplay } from './BarcodeDisplay';
import { Calendar, Clock, AlertCircle, CheckCircle, QrCode, PackageOpen, BookOpen } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';

interface BorrowingPageProps {
  borrowings: Borrowing[];
  books: Book[];
  onRequestReturn: (borrowingId: string) => void;
}

export function BorrowingPage({ borrowings, books, onRequestReturn }: BorrowingPageProps) {
  const [showBorrowBarcode, setShowBorrowBarcode] = useState(false);
  const [showReturnBarcode, setShowReturnBarcode] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);

  const handleReturnClick = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    onRequestReturn(borrowing.id);
    // Note: barcode dialog will be triggered from App.tsx via showBarcodeDialog state
  };

  const pendingBorrowings = borrowings.filter((b) => b.status === 'pending');
  const activeBorrowings = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'overdue' || b.status === 'returning'
  );
  const returnedBorrowings = borrowings.filter((b) => b.status === 'returned');

  const calculateLateFee = (borrowing: Borrowing, returnDate?: Date) => {
    const due = borrowing.dueDate instanceof Date ? borrowing.dueDate : new Date(borrowing.dueDate);
    const returned = returnDate || new Date();
    const daysLate = differenceInDays(returned, due);
    const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
    return daysLate > 0 ? daysLate * totalBooks * 2000 : 0;
  };

  const BorrowingCard = ({ borrowing, showReturn = false }: { borrowing: Borrowing; showReturn?: boolean }) => {
    const dueDate = borrowing.dueDate instanceof Date ? borrowing.dueDate : new Date(borrowing.dueDate);
    const daysUntilDue = differenceInDays(dueDate, new Date());
    const lateFee = calculateLateFee(borrowing);
    const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);

    return (
      <Card className="border-emerald-100/50 hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base mb-1 text-gray-100">
                Peminjaman #{borrowing.id.slice(-6).toUpperCase()}
              </CardTitle>
              <p className="text-sm text-gray-400">
                {totalBooks} buku • {borrowing.details.length} judul
              </p>
            </div>
            {borrowing.status === 'pending' && (
              <Badge variant="outline" className="border-yellow-600 text-yellow-400 bg-yellow-950/30">
                <Clock className="w-3 h-3 mr-1" />
                Menunggu Konfirmasi
              </Badge>
            )}
            {borrowing.status === 'active' && (
              <Badge 
                variant={daysUntilDue < 3 ? 'destructive' : 'default'}
                className={daysUntilDue >= 3 ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                {daysUntilDue >= 0 ? `${daysUntilDue} hari lagi` : 'Terlambat'}
              </Badge>
            )}
            {borrowing.status === 'overdue' && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Terlambat
              </Badge>
            )}
            {borrowing.status === 'returning' && (
              <Badge variant="outline" className="border-violet-600 text-violet-400 bg-violet-950/30">
                <QrCode className="w-3 h-3 mr-1" />
                Menunggu Pengembalian
              </Badge>
            )}
            {borrowing.status === 'returned' && (
              <Badge variant="outline" className="border-emerald-600 text-emerald-400 bg-emerald-950/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Dikembalikan
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Book Details */}
          <div className="space-y-3">
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

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Tanggal Pinjam</span>
              </div>
              <p className="text-sm text-gray-100">{format(new Date(borrowing.borrowDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Jatuh Tempo</span>
              </div>
              <p className="text-sm text-gray-100">{format(new Date(borrowing.dueDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
          </div>

          {/* Late Fee Warning */}
          {(borrowing.status === 'active' || borrowing.status === 'overdue') && daysUntilDue < 0 && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300">
                    <strong>Terlambat {Math.abs(daysUntilDue)} hari</strong>
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Estimasi denda: Rp {lateFee.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Return Info */}
          {borrowing.status === 'returned' && lateFee > 0 && (
            <div className="bg-orange-950/30 border border-orange-800/50 rounded-lg p-3">
              <p className="text-sm text-orange-300">
                <strong>Denda Keterlambatan:</strong> Rp {lateFee.toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {/* Barcode Section */}
          {borrowing.status === 'pending' && borrowing.barcode && (
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3">
              <p className="text-sm text-emerald-300 mb-2">
                <strong className="text-emerald-200">Barcode Peminjaman</strong>
              </p>
              <p className="text-xs text-emerald-400 mb-2">
                Tunjukkan barcode ini ke petugas untuk konfirmasi peminjaman
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-emerald-700 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300"
                onClick={() => {
                  setSelectedBorrowing(borrowing);
                  setShowBorrowBarcode(true);
                }}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Tampilkan Barcode
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          {showReturn && borrowing.status === 'active' && (
            <Button
              onClick={() => handleReturnClick(borrowing)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              variant="default"
            >
              <PackageOpen className="w-4 h-4 mr-2" />
              Ajukan Pengembalian
            </Button>
          )}

          {borrowing.status === 'returning' && borrowing.returnBarcode && (
            <div className="bg-violet-950/30 border border-violet-800/50 rounded-lg p-3">
              <p className="text-sm text-violet-300 mb-2">
                <strong className="text-violet-200">Barcode Pengembalian</strong>
              </p>
              <p className="text-xs text-violet-400 mb-2">
                Tunjukkan barcode ini ke petugas untuk konfirmasi pengembalian
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-violet-700 text-violet-400 hover:bg-violet-950/30 hover:text-violet-300"
                onClick={() => {
                  setSelectedBorrowing(borrowing);
                  setShowReturnBarcode(true);
                }}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Tampilkan Barcode Pengembalian
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Menunggu
            {pendingBorrowings.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {pendingBorrowings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktif
            {activeBorrowings.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeBorrowings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingBorrowings.length > 0 ? (
            pendingBorrowings.map((borrowing) => (
              <BorrowingCard key={borrowing.id} borrowing={borrowing} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400">Tidak ada peminjaman menunggu konfirmasi</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeBorrowings.length > 0 ? (
            activeBorrowings.map((borrowing) => (
              <BorrowingCard key={borrowing.id} borrowing={borrowing} showReturn={borrowing.status !== 'returning'} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400">Tidak ada peminjaman aktif</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {returnedBorrowings.length > 0 ? (
            returnedBorrowings.map((borrowing) => (
              <BorrowingCard key={borrowing.id} borrowing={borrowing} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400">Belum ada riwayat peminjaman</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Borrow Barcode Dialog (untuk status pending) */}
      {selectedBorrowing && selectedBorrowing.status === 'pending' && (
        <BarcodeDisplay
          barcode={selectedBorrowing.barcode || ''}
          bookTitle={`${selectedBorrowing.details.length} Judul Buku`}
          dueDate={selectedBorrowing.dueDate}
          open={showBorrowBarcode}
          onOpenChange={setShowBorrowBarcode}
        />
      )}

      {/* Return Barcode Dialog (untuk status returning) */}
      {selectedBorrowing && selectedBorrowing.status === 'returning' && (
        <BarcodeDisplay
          barcode={selectedBorrowing.returnBarcode || ''}
          bookTitle={`${selectedBorrowing.details.length} Judul Buku`}
          dueDate={selectedBorrowing.dueDate}
          open={showReturnBarcode}
          onOpenChange={setShowReturnBarcode}
        />
      )}
    </div>
  );
}
