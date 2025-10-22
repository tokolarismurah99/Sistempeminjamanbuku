import { useState, useEffect } from 'react';
import { Book } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (book: Partial<Book>) => void;
  book?: Book;
  mode: 'add' | 'edit';
}

const genres = [
  'Fiksi',
  'Non-Fiksi',
  'Fantasi',
  'Sains',
  'Teknologi',
  'Sejarah',
  'Biografi',
  'Filosofi',
  'Psikologi',
  'Bisnis',
  'Keuangan',
  'Seni',
  'Agama',
  'Kesehatan',
  'Kuliner',
  'Pengembangan Diri',
  'Anak-anak'
];

export function BookFormDialog({ open, onOpenChange, onSubmit, book, mode }: BookFormDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    genre: '',
    description: '',
    publishYear: new Date().getFullYear(),
    stock: 1,
    coverUrl: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (book && mode === 'edit') {
      setFormData({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        genre: book.genre,
        description: book.description,
        publishYear: book.publishYear,
        stock: book.stock,
        coverUrl: book.coverUrl
      });
      setImagePreview(book.coverUrl);
    } else if (mode === 'add') {
      setFormData({
        title: '',
        author: '',
        publisher: '',
        genre: '',
        description: '',
        publishYear: new Date().getFullYear(),
        stock: 1,
        coverUrl: ''
      });
      setImagePreview('');
    }
  }, [book, mode, open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }

    // Create preview and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData({ ...formData, coverUrl: base64String });
      toast.success('Gambar berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData({ ...formData, coverUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Judul buku harus diisi');
      return;
    }
    if (!formData.author.trim()) {
      toast.error('Penulis harus diisi');
      return;
    }
    if (!formData.publisher.trim()) {
      toast.error('Penerbit harus diisi');
      return;
    }
    if (!formData.genre) {
      toast.error('Genre harus dipilih');
      return;
    }
    if (!formData.coverUrl) {
      toast.error('Cover buku harus diunggah');
      return;
    }

    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-100">
            {mode === 'add' ? 'Tambah Buku Baru' : 'Edit Buku'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'add' 
              ? 'Masukkan informasi buku yang akan ditambahkan ke koleksi perpustakaan'
              : 'Perbarui informasi buku di koleksi perpustakaan'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">Cover Buku *</Label>
            {imagePreview ? (
              <div className="relative w-full h-64 bg-slate-800 rounded-lg overflow-hidden group">
                <ImageWithFallback
                  src={imagePreview}
                  alt="Cover Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hapus Gambar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors bg-slate-800/50">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-500 mb-4" />
                  <Label htmlFor="cover-upload" className="cursor-pointer text-gray-300">
                    <span className="text-emerald-400 hover:text-emerald-300">
                      Klik untuk upload
                    </span>
                    {' '}atau drag & drop
                  </Label>
                  <p className="text-sm text-gray-400 mt-2">
                    PNG, JPG, JPEG (Max. 5MB)
                  </p>
                  <Input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title" className="text-gray-300">Judul Buku *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul buku"
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="text-gray-300">Penulis *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nama penulis"
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            {/* Publisher */}
            <div className="space-y-2">
              <Label htmlFor="publisher" className="text-gray-300">Penerbit *</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Nama penerbit"
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-gray-300">Genre *</Label>
              <Select 
                value={formData.genre} 
                onValueChange={(value) => setFormData({ ...formData, genre: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Publish Year */}
            <div className="space-y-2">
              <Label htmlFor="publishYear" className="text-gray-300">Tahun Terbit</Label>
              <Input
                id="publishYear"
                type="number"
                value={formData.publishYear}
                onChange={(e) => setFormData({ ...formData, publishYear: parseInt(e.target.value) || new Date().getFullYear() })}
                min="1900"
                max={new Date().getFullYear()}
                className="bg-slate-800 border-slate-600 text-gray-100"
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-gray-300">Stok *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 1 })}
                min="1"
                required
                className="bg-slate-800 border-slate-600 text-gray-100"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description" className="text-gray-300">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat tentang buku..."
                rows={4}
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100">
              Batal
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              {mode === 'add' ? 'Tambah Buku' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
