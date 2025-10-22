import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle, QrCode } from 'lucide-react';
import Barcode from 'react-barcode';

interface BarcodeDisplayProps {
  barcode: string;
  bookTitle: string;
  dueDate: Date | string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isReturn?: boolean;
}

export function BarcodeDisplay({
  barcode,
  bookTitle,
  dueDate,
  open,
  onOpenChange,
  isReturn = false,
}: BarcodeDisplayProps) {
  // Convert dueDate to Date object if it's a string
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <DialogTitle>
              {isReturn ? 'Permintaan Pengembalian Berhasil!' : 'Peminjaman Berhasil!'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isReturn 
              ? 'Silakan tunjukkan barcode ini ke petugas perpustakaan untuk konfirmasi pengembalian'
              : 'Silakan tunjukkan barcode ini ke petugas perpustakaan untuk mengambil buku'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4 bg-emerald-950/30 border-emerald-800/50">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">Judul Buku</p>
                <p className="font-medium text-gray-100">{bookTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Tanggal Kembali</p>
                <p className="font-medium text-gray-100">
                  {dueDateObj.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-slate-300">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-3 text-slate-800">
                <QrCode className="w-5 h-5" />
                <p className="text-sm font-medium">{isReturn ? 'Kode Pengembalian' : 'Kode Peminjaman'}</p>
              </div>
              <Barcode 
                value={barcode} 
                format="CODE128"
                width={2}
                height={60}
                fontSize={14}
                margin={10}
              />
            </div>
          </Card>

          <div className="bg-orange-950/30 border border-orange-800/50 p-3 rounded-lg">
            <p className="text-sm text-orange-300">
              <strong className="text-orange-200">Penting:</strong> Simpan atau screenshot barcode ini. Tunjukkan ke
              petugas perpustakaan untuk konfirmasi {isReturn ? 'pengembalian' : 'dan pengambilan'} buku.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
