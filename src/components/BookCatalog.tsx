import { useState } from 'react';
import { Book, CartItem } from '../types';
import { BookCard } from './BookCard';
import { BookDetailDialog } from './BookDetailDialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter } from 'lucide-react';

interface BookCatalogProps {
  books: Book[];
  cart: CartItem[];
  onAddToCart?: (book: Book) => void;
}

export function BookCatalog({ books, cart, onAddToCart }: BookCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.genre)))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || book.genre === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const isBookInCart = (bookId: string) => {
    return cart.some((item) => item.bookId === bookId);
  };

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari judul, penulis, penerbit, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 sm:w-64">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.slice(1).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Menampilkan {filteredBooks.length} dari {books.length} buku
        </p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onAddToCart={onAddToCart}
              onViewDetails={handleViewDetails}
              isInCart={isBookInCart(book.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Tidak ada buku yang ditemukan</p>
        </div>
      )}

      {/* Book Detail Dialog */}
      <BookDetailDialog
        book={selectedBook}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        onAddToCart={onAddToCart}
        isInCart={selectedBook ? isBookInCart(selectedBook.id) : false}
      />
    </div>
  );
}
