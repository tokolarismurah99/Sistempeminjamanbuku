export interface Book {
  id: string;
  title: string; // judul
  author: string; // penulis
  publisher: string; // penerbit
  genre: string; // genre_buku
  description: string;
  coverUrl: string;
  publishYear: number; // tahun_terbit
  stock: number; // stok
}

export interface User {
  id: string;
  name: string; // nama
  email: string;
  password: string; // password (hashed in production)
  phone: string; // no_hp
  address: string; // alamat
  membershipId: string; // id_anggota
  role: 'member' | 'admin';
  joinDate: string; // tgl_daftar
  avatar?: string;
}

// Cart Item - untuk shopping cart sebelum checkout
export interface CartItem {
  bookId: string;
  quantity: number; // qty
}

// Detail Peminjaman - detail items dalam satu invoice peminjaman
export interface BorrowingDetail {
  id?: string; // optional id untuk tracking
  bookId: string; // id_buku
  bookTitle: string; // judul buku (untuk display)
  quantity: number; // qty
}

// Peminjaman (Invoice) - header peminjaman
export interface Borrowing {
  id: string; // id_peminjaman
  userId: string; // id_anggota
  borrowDate: Date | string; // tgl_pinjam (Date object in memory, string in localStorage)
  dueDate: Date | string; // tgl_kembali (Date object in memory, string in localStorage)
  returnDate?: Date | string; // tgl_pengembalian aktual
  returnRequestDate?: Date | string; // tgl request pengembalian
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'returning';
  barcode?: string;
  returnBarcode?: string;
  details: BorrowingDetail[]; // detail items
}

// Detail Pengembalian
export interface ReturnDetail {
  id: string;
  returnId: string;
  bookId: string;
  quantityReturned: number; // qty_kembali
}

// Pengembalian
export interface Return {
  id: string; // id_pengembalian
  borrowingId: string; // id_peminjaman
  returnDate: string; // tgl_pengembalian
  lateFee: number; // denda
  details: ReturnDetail[];
}

// Activity Log - untuk tracking semua aktivitas sistem
export interface Activity {
  id: string;
  userId: string; // user yang melakukan aksi
  userName: string; // nama user
  userRole: 'member' | 'admin';
  action: 'login' | 'logout' | 'register' | 'borrow_request' | 'borrow_confirm' | 'return_request' | 'return_confirm' | 'book_add' | 'book_edit' | 'book_delete' | 'stock_update';
  description: string; // deskripsi lengkap aktivitas
  timestamp: Date; // tanggal dan jam
  metadata?: any; // data tambahan jika diperlukan
}
