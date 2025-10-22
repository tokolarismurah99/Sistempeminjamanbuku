import { Borrowing, Book, User } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Printer, X, FileDown } from 'lucide-react';
import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner@2.0.3';

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
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      
      const imgWidthMM = imgWidth * 0.264583;
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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedDueDate = new Date(borrowing.dueDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedReturnDate = borrowing.returnDate
    ? new Date(borrowing.returnDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  const formattedTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="no-print">
            <DialogTitle className="flex items-center justify-between">
              <span>Nota {type === 'borrow' ? 'Peminjaman' : 'Pengembalian'}</span>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} size="sm" variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
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

          {/* Thermal Receipt Style */}
          <div ref={printRef} className="print-content bg-white p-6 text-black font-mono text-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
              <div className="text-base font-bold">SMARTLIB UBHARA</div>
              <div className="text-xs mt-1">Perpustakaan</div>
              <div className="text-xs">Universitas Bhayangkara</div>
              <div className="text-xs">Jakarta Raya</div>
            </div>

            {/* Transaction Type */}
            <div className="text-center py-2 mb-3 border-b border-black">
              <div className="font-bold text-base">
                {type === 'borrow' ? 'BUKTI PEMINJAMAN' : 'BUKTI PENGEMBALIAN'}
              </div>
            </div>

            {/* Date & Time */}
            <div className="text-xs mb-3 space-y-1">
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{type === 'borrow' ? formattedBorrowDate : formattedReturnDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>No. Invoice</span>
                <span className="font-bold">{borrowing.id}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-black my-3"></div>

            {/* Member Info */}
            <div className="text-xs mb-3 space-y-1">
              <div className="font-bold mb-1">DATA ANGGOTA:</div>
              <div className="flex justify-between">
                <span>Nama</span>
                <span className="font-bold">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span>ID</span>
                <span>{user.membershipId}</span>
              </div>
              <div className="flex justify-between">
                <span>Telp</span>
                <span>{user.phone}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-black my-3"></div>

            {/* Books List */}
            <div className="text-xs mb-3">
              <div className="font-bold mb-2">DAFTAR BUKU:</div>
              {borrowing.details.map((detail, index) => {
                const book = books.find((b) => b.id === detail.bookId);
                if (!book) return null;
                return (
                  <div key={detail.id} className="mb-2 pb-2 border-b border-gray-300">
                    <div className="font-bold">{index + 1}. {book.title}</div>
                    <div className="text-gray-700 ml-3">by {book.author}</div>
                    <div className="flex justify-between ml-3 mt-1">
                      <span>Qty</span>
                      <span className="font-bold">{detail.quantity} eks</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-black my-3"></div>

            {/* Summary */}
            <div className="text-xs mb-3 space-y-1">
              <div className="flex justify-between font-bold">
                <span>TOTAL BUKU</span>
                <span>{totalBooks} eksemplar</span>
              </div>
              
              {type === 'borrow' && (
                <>
                  <div className="flex justify-between mt-2">
                    <span>Tgl Pinjam</span>
                    <span>{formattedBorrowDate}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>BATAS KEMBALI</span>
                    <span>{formattedDueDate}</span>
                  </div>
                </>
              )}

              {type === 'return' && (
                <>
                  <div className="flex justify-between">
                    <span>Batas Kembali</span>
                    <span>{formattedDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tgl Kembali</span>
                    <span>{formattedReturnDate}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>STATUS</span>
                    <span>{daysLate > 0 ? `Terlambat ${daysLate} hari` : 'Tepat Waktu'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Late Fee */}
            {type === 'return' && lateFee > 0 && (
              <>
                <div className="border-t-2 border-black my-3"></div>
                <div className="text-xs mb-3 space-y-1">
                  <div className="text-center font-bold mb-2">⚠️ DENDA KETERLAMBATAN ⚠️</div>
                  <div className="flex justify-between">
                    <span>Keterlambatan</span>
                    <span>{daysLate} hari</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarif</span>
                    <span>Rp 2.000/hari/buku</span>
                  </div>
                  <div className="flex justify-between font-bold text-base mt-2">
                    <span>TOTAL DENDA</span>
                    <span>Rp {lateFee.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-dashed border-black my-3"></div>

            {/* Barcode */}
            <div className="text-center text-xs mb-3">
              <div className="mb-1">Barcode</div>
              <div className="font-bold tracking-widest text-base">
                {type === 'borrow' ? borrowing.barcode : borrowing.returnBarcode}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-black my-3"></div>

            {/* Footer */}
            <div className="text-center text-xs space-y-1 mb-3">
              <div>Terima kasih</div>
              <div>Harap simpan bukti ini</div>
              <div className="text-[10px] mt-2 text-gray-600">
                Dicetak: {new Date().toLocaleString('id-ID')}
              </div>
            </div>

            {/* Bottom Border */}
            <div className="border-b-2 border-dashed border-black"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
