import { Book } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingCart, Check, Info } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
  onViewDetails?: (book: Book) => void;
  showActions?: boolean;
  isInCart?: boolean;
}

export function BookCard({ book, onAddToCart, onViewDetails, showActions = true, isInCart = false }: BookCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300 border-emerald-900/30 flex flex-col h-full">
      <div 
        className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 cursor-pointer"
        onClick={() => onViewDetails?.(book)}
      >
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
        <p className="text-xs text-gray-400 mb-2">{book.publisher} • {book.publishYear}</p>
        <p className="text-xs text-gray-400 line-clamp-2 mb-1">
          {book.description}
        </p>
        {book.description && (
          <button
            onClick={() => onViewDetails?.(book)}
            className="text-xs text-orange-400 hover:text-orange-300 font-medium text-left mb-3 flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            Lihat Detail
          </button>
        )}
        <div className="flex items-center justify-between text-sm mt-auto">
          <span className="text-gray-400 text-xs">Stok</span>
          <span className={book.stock > 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
            {book.stock}
          </span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-3 pt-0 flex flex-col gap-2">
          {isInCart ? (
            <Button className="w-full" size="sm" variant="secondary" disabled>
              <Check className="w-3 h-3 mr-2" />
              Di Keranjang
            </Button>
          ) : (
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
              onClick={() => onAddToCart?.(book)}
              disabled={book.stock === 0}
            >
              <ShoppingCart className="w-3 h-3 mr-2" />
              {book.stock > 0 ? 'Tambah' : 'Habis'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
