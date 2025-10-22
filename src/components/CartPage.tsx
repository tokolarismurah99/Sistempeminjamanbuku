import { CartItem, Book } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart, Trash2, Plus, Minus, Calendar as CalendarIcon } from 'lucide-react';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface CartPageProps {
  cart: CartItem[];
  books: Book[];
  onUpdateQuantity: (bookId: string, newQty: number) => void;
  onRemoveItem: (bookId: string) => void;
  onCheckout: (borrowDate: Date, dueDate: Date) => void;
  onClearCart: () => void;
}

export function CartPage({
  cart,
  books,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
}: CartPageProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const defaultDueDate = new Date(today);
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  
  const [borrowDate, setBorrowDate] = useState<Date>(today);
  const [dueDate, setDueDate] = useState<Date>(defaultDueDate);

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);

  const totalBooks = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (bookId: string, delta: number) => {
    const item = cart.find((i) => i.bookId === bookId);
    const book = getBook(bookId);
    
    if (!item || !book) return;
    
    const newQty = item.quantity + delta;
    
    if (newQty < 1) {
      toast.error('Jumlah minimal 1');
      return;
    }
    
    if (newQty > book.stock) {
      toast.error(`Stok hanya tersedia ${book.stock}`);
      return;
    }
    
    onUpdateQuantity(bookId, newQty);
  };

  const handleBorrowDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    // Normalize date to remove time component
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    setBorrowDate(normalizedDate);
    
    // Auto-update due date to 14 days after borrow date
    const newDueDate = new Date(normalizedDate);
    newDueDate.setDate(newDueDate.getDate() + 14);
    setDueDate(newDueDate);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Validation
    if (borrowDate < today) {
      toast.error('Tanggal pinjam tidak boleh di masa lalu');
      return;
    }
    
    if (dueDate <= borrowDate) {
      toast.error('Tanggal kembali harus setelah tanggal pinjam');
      return;
    }
    
    // Check stock availability
    for (const item of cart) {
      const book = getBook(item.bookId);
      if (!book || book.stock < item.quantity) {
        toast.error(`Stok tidak mencukupi untuk "${book?.title}"`);
        return;
      }
    }
    
    onCheckout(borrowDate, dueDate);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-slate-800 p-8 rounded-full mb-6">
          <ShoppingCart className="w-16 h-16 text-gray-500" />
        </div>
        <h3 className="mb-2 text-gray-100">Keranjang Kosong</h3>
        <p className="text-gray-400 mb-6">Belum ada buku yang ditambahkan ke keranjang</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-100">Keranjang Peminjaman</h3>
            <p className="text-sm text-gray-400">
              {cart.length} judul • {totalBooks} buku
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearCart} className="text-gray-300 hover:text-gray-100 hover:bg-slate-800">
            <Trash2 className="w-4 h-4 mr-2" />
            Kosongkan
          </Button>
        </div>

        {cart.map((item) => {
          const book = getBook(item.bookId);
          if (!book) return null;

          return (
            <Card key={item.bookId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-slate-800">
                    <ImageWithFallback
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="line-clamp-2 mb-1 text-gray-100">{book.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{book.author}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="border-slate-600 text-gray-300">{book.genre}</Badge>
                      <span className="text-sm text-gray-400">Stok: {book.stock}</span>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100"
                          onClick={() => handleQuantityChange(item.bookId, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center text-gray-100">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100"
                          onClick={() => handleQuantityChange(item.bookId, 1)}
                          disabled={item.quantity >= book.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.bookId)}
                        className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checkout Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-gray-100">Ringkasan Peminjaman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Borrow Date */}
            <div className="space-y-2">
              <Label className="text-gray-300">Tanggal Pinjam</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(borrowDate, 'dd MMMM yyyy', { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={borrowDate}
                    onSelect={handleBorrowDateChange}
                    disabled={(date) => {
                      const compareDate = new Date(date);
                      compareDate.setHours(0, 0, 0, 0);
                      return compareDate < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-gray-300">Tanggal Kembali</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(dueDate, 'dd MMMM yyyy', { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      if (!date) return;
                      const normalizedDate = new Date(date);
                      normalizedDate.setHours(0, 0, 0, 0);
                      setDueDate(normalizedDate);
                    }}
                    disabled={(date) => {
                      const compareDate = new Date(date);
                      compareDate.setHours(0, 0, 0, 0);
                      return compareDate <= borrowDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-400">
                Durasi: {Math.ceil((dueDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24))} hari
              </p>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Judul:</span>
                <span className="text-gray-100">{cart.length} buku</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Buku:</span>
                <span className="text-gray-100">{totalBooks} eksemplar</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3">
              <p className="text-sm text-emerald-300">
                <strong className="text-emerald-400">Perhatian:</strong> Tunjukkan barcode yang dihasilkan ke petugas perpustakaan untuk konfirmasi peminjaman.
              </p>
            </div>

            {/* Checkout Button */}
            <Button onClick={handleCheckout} className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="lg">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Checkout
            </Button>

            {/* Late Fee Info */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-gray-400">
                💡 Denda keterlambatan: Rp 2.000/buku/hari
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
