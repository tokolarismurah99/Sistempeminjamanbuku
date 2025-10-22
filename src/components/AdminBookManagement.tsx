import { useState } from 'react';
import { Book } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BookFormDialog } from './BookFormDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Filter, Plus, Edit, Trash2, PackagePlus, PackageMinus, BookOpen } from 'lucide-react';

interface AdminBookManagementProps {
  books: Book[];
  onAddBook: (book: Partial<Book>) => void;
  onEditBook: (id: string, book: Partial<Book>) => void;
  onDeleteBook: (id: string) => void;
  onUpdateStock: (id: string, increment: number) => void;
}

export function AdminBookManagement({ 
  books, 
  onAddBook, 
  onEditBook, 
  onDeleteBook,
  onUpdateStock 
}: AdminBookManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedBook, setSelectedBook] = useState<Book | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.genre)))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || book.genre === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setDialogMode('add');
    setSelectedBook(undefined);
    setShowBookDialog(true);
  };

  const handleEdit = (book: Book) => {
    setDialogMode('edit');
    setSelectedBook(book);
    setShowBookDialog(true);
  };

  const handleDeleteClick = (bookId: string) => {
    setBookToDelete(bookId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bookToDelete) {
      onDeleteBook(bookToDelete);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const handleFormSubmit = (bookData: Partial<Book>) => {
    if (dialogMode === 'add') {
      onAddBook(bookData);
    } else if (selectedBook) {
      onEditBook(selectedBook.id, bookData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-gray-100">Manajemen Koleksi Buku</h3>
          <p className="text-sm text-gray-400">
            Kelola data buku dan stok perpustakaan
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Buku Baru
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari judul, penulis, atau penerbit..."
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Buku</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-2xl text-gray-100">{filteredBooks.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Stok</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-green-600" />
              <span className="text-2xl text-gray-100">
                {filteredBooks.reduce((sum, book) => sum + book.stock, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stok Tersedia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              <span className="text-2xl text-gray-100">
                {filteredBooks.reduce((sum, book) => sum + book.stock, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stok Habis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-orange-600" />
              <span className="text-2xl text-gray-100">
                {filteredBooks.filter(book => book.stock === 0).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300 border-emerald-100/50 flex flex-col h-full">
              <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-emerald-50 to-orange-50">
                <ImageWithFallback
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3 flex-1 flex flex-col">
                <Badge className="mb-2 w-fit text-xs bg-gradient-to-r from-emerald-500 to-teal-500">
                  {book.genre}
                </Badge>
                <h3 className="text-base line-clamp-2 mb-1 text-gray-100">{book.title}</h3>
                <p className="text-sm text-gray-400 mb-1">{book.author}</p>
                <p className="text-xs text-gray-500 mb-2">{book.publisher} • {book.publishYear}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {book.description}
                </p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-gray-400 text-xs">Stok</span>
                  <div className="flex items-center gap-1">
                    <span className={book.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {book.stock}
                    </span>
                    {book.stock === 0 && (
                      <Badge variant="destructive" className="text-xs h-4 px-1">Habis</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(book)} className="h-7 text-xs px-2 border-emerald-700 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onUpdateStock(book.id, 1)}
                    className="h-7 text-xs px-2 border-emerald-700 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300"
                  >
                    <PackagePlus className="w-3 h-3 mr-1" />
                    +
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onUpdateStock(book.id, -1)}
                    disabled={book.stock === 0}
                    className="h-7 text-xs px-2 border-orange-700 text-orange-400 hover:bg-orange-950/30 hover:text-orange-300 disabled:opacity-50"
                  >
                    <PackageMinus className="w-3 h-3 mr-1" />
                    -
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteClick(book.id)}
                    className="h-7 text-xs px-2 border-red-700 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Del
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Tidak ada buku yang ditemukan</p>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Buku Pertama
          </Button>
        </div>
      )}

      {/* Book Form Dialog */}
      <BookFormDialog
        open={showBookDialog}
        onOpenChange={setShowBookDialog}
        onSubmit={handleFormSubmit}
        book={selectedBook}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Buku?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus buku ini dari perpustakaan? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
