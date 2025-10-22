import { Book } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingCart, Check, BookOpen, Calendar, Building2, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Separator } from './ui/separator';

interface BookDetailDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (book: Book) => void;
  isInCart?: boolean;
  showActions?: boolean;
}

export function BookDetailDialog({ 
  book, 
  open, 
  onOpenChange, 
  onAddToCart,
  isInCart = false,
  showActions = true 
}: BookDetailDialogProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3 text-gray-100">
            <BookOpen className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
            <span className="flex-1">Detail Buku</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Informasi lengkap tentang buku ini
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Book Cover */}
          <div className="md:col-span-2">
            <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg">
              <ImageWithFallback
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="md:col-span-3 space-y-4">
            {/* Genre Badge */}
            <div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500">
                {book.genre}
              </Badge>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl mb-1 text-gray-100">{book.title}</h3>
            </div>

            <Separator />

            {/* Author */}
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Penulis</p>
                <p className="text-base text-gray-200">{book.author}</p>
              </div>
            </div>

            {/* Publisher */}
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Penerbit</p>
                <p className="text-base text-gray-200">{book.publisher}</p>
              </div>
            </div>

            {/* Publish Year */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400 mb-1">Tahun Terbit</p>
                <p className="text-base text-gray-200">{book.publishYear}</p>
              </div>
            </div>

            <Separator />

            {/* Stock */}
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300">Stok Tersedia</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl ${book.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {book.stock}
                  </span>
                  <span className="text-sm text-gray-400">buku</span>
                </div>
              </div>
              {book.stock === 0 && (
                <p className="text-sm text-red-400 mt-2">
                  Buku sedang tidak tersedia
                </p>
              )}
              {book.stock > 0 && book.stock <= 2 && (
                <p className="text-sm text-orange-400 mt-2">
                  Stok terbatas, segera pinjam!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h4 className="mb-2 text-gray-300">Deskripsi Buku</h4>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {book.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Tutup
            </Button>
            {isInCart ? (
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" 
                disabled
              >
                <Check className="w-4 h-4 mr-2" />
                Sudah di Keranjang
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                onClick={() => {
                  onAddToCart?.(book);
                  onOpenChange(false);
                }}
                disabled={book.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {book.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
