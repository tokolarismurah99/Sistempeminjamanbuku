import { Borrowing, Book, User } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Printer, X, FileDown } from 'lucide-react';
import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner@2.0.3';
import { Logo } from './Logo';

interface PrintReceiptProps {
  borrowing: Borrowing;
  books: Book[];
  user: User;
  type: 'borrow' | 'return';
  lateFee?: number;
  daysLate?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintReceipt({
  borrowing,
  books,
  user,
  type,
  lateFee = 0,
  daysLate = 0,
  open,
  onOpenChange,
}: PrintReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = printRef.current;
    if (!element) {
      toast.error('Gagal mengekspor PDF');
      return;
    }

    try {
      const loadingToast = toast.loading('Membuat PDF...');
      
      // Wait a bit to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        allowTaint: true,
        useCORS: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate proper scaling
      const imgWidthMM = imgWidth * 0.264583; // Convert px to mm
      const imgHeightMM = imgHeight * 0.264583;
      const scale = Math.min(pdfWidth / imgWidthMM, pdfHeight / imgHeightMM);
      
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;
      const x = (pdfWidth - finalWidth) / 2;
      const y = 5;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      const fileName = `${type === 'borrow' ? 'Peminjaman' : 'Pengembalian'}_${borrowing.id}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast.dismiss(loadingToast);
      toast.success('PDF berhasil diunduh!');
    } catch (error) {
      toast.dismiss();
      toast.error('Gagal mengekspor PDF. Silakan coba lagi.');
      console.error('PDF Export Error:', error);
    }
  };

  const totalBooks = borrowing.details.reduce((sum, detail) => sum + detail.quantity, 0);
  const formattedBorrowDate = new Date(borrowing.borrowDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDueDate = new Date(borrowing.dueDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedReturnDate = borrowing.returnDate
    ? new Date(borrowing.returnDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle className="flex items-center justify-between">
              <span>{type === 'borrow' ? 'Bukti Peminjaman' : 'Bukti Pengembalian'}</span>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} size="sm" variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handlePrint} size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div ref={printRef} className="print-content">
          <div className="receipt border-2 border-emerald-600 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full p-2 flex items-center justify-center">
                <Logo size="lg" />
              </div>
              <h1 className="text-2xl mb-2">SmartLib Ubhara</h1>
              <p className="text-sm opacity-90">Perpustakaan Universitas Bhayangkara Jakarta Raya</p>
              <p className="text-lg mt-3">
                {type === 'borrow' ? '📚 BUKTI PEMINJAMAN BUKU' : '✅ BUKTI PENGEMBALIAN BUKU'}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Transaction Info */}
              <div className="mb-6">
                <h3 className="text-base mb-3 pb-2 border-b-2 border-gray-200 text-emerald-600">
                  Informasi Transaksi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. Transaksi</p>
                    <p className="text-sm">{borrowing.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tanggal {type === 'borrow' ? 'Peminjaman' : 'Pengembalian'}</p>
                    <p className="text-sm">{type === 'borrow' ? formattedBorrowDate : formattedReturnDate}</p>
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="mb-6">
                <h3 className="text-base mb-3 pb-2 border-b-2 border-gray-200 text-emerald-600">
                  Data Anggota
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                    <p className="text-sm">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ID Anggota</p>
                    <p className="text-sm">{user.membershipId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. Telepon</p>
                    <p className="text-sm">{user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Books List */}
              <div className="mb-6">
                <h3 className="text-base mb-3 pb-2 border-b-2 border-gray-200 text-emerald-600">
                  Daftar Buku
                </h3>
                <ul className="space-y-2">
                  {borrowing.details.map((detail, index) => {
                    const book = books.find((b) => b.id === detail.bookId);
                    if (!book) return null;
                    return (
                      <li key={detail.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-sm">
                            {index + 1}. {book.title}
                          </p>
                          <p className="text-xs text-gray-500">{book.author}</p>
                        </div>
                        <span className="text-sm text-emerald-600">{detail.quantity} eks</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Summary */}
              <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-5">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span>Total Buku</span>
                  <span className="text-emerald-600">{totalBooks} eksemplar</span>
                </div>
                {type === 'borrow' && (
                  <>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span>Tanggal Peminjaman</span>
                      <span>{formattedBorrowDate}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-emerald-600">
                      <span className="text-base">Batas Pengembalian</span>
                      <span className="text-base">{formattedDueDate}</span>
                    </div>
                  </>
                )}
                {type === 'return' && (
                  <>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span>Batas Pengembalian</span>
                      <span>{formattedDueDate}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span>Tanggal Pengembalian</span>
                      <span>{formattedReturnDate}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-emerald-600">
                      <span className="text-base">Status</span>
                      <span className="text-base">
                        {daysLate > 0 ? `Terlambat ${daysLate} hari` : 'Tepat Waktu'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Late Fee Warning */}
              {type === 'return' && lateFee > 0 && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4 mt-4 text-center">
                  <p className="text-sm text-amber-800 mb-1">⚠️ Denda Keterlambatan</p>
                  <p className="text-2xl text-red-600 my-2">Rp {lateFee.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-600">
                    {daysLate} hari × {totalBooks} buku × Rp 2.000 = Rp {lateFee.toLocaleString('id-ID')}
                  </p>
                </div>
              )}

              {/* Barcode */}
              <div className="bg-gray-50 rounded-lg p-5 mt-6 text-center">
                <p className="text-xs text-gray-500 mb-2">Kode Barcode Transaksi</p>
                <p className="font-mono text-lg tracking-wider">
                  {type === 'borrow' ? borrowing.barcode : borrowing.returnBarcode}
                </p>
              </div>

              {/* Signature Area */}
              <div className="grid grid-cols-2 gap-10 mt-10">
                <div className="text-center">
                  <p className="text-sm mb-16">Petugas Perpustakaan</p>
                  <div className="border-t border-gray-800 pt-2">
                    <p className="text-xs text-gray-500">Tanda Tangan & Nama</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm mb-16">Anggota</p>
                  <div className="border-t border-gray-800 pt-2">
                    <p className="text-xs text-gray-500">{user.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-5 text-center border-t-2 border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                Dokumen ini dicetak oleh sistem SmartLib Ubhara
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © 2024 Perpustakaan Universitas Bhayangkara Jakarta Raya
              </p>
            </div>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
