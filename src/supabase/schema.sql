-- ============================================
-- SMARTLIB UBHARA DATABASE SCHEMA
-- Sistem Peminjaman Buku Perpustakaan
-- ============================================

-- ============================================
-- TABLE: books
-- Menyimpan data koleksi buku perpustakaan
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  genre_buku TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  tahun_terbit INTEGER NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre_buku);

-- ============================================
-- TABLE: users
-- Menyimpan data anggota dan admin
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  membership_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member')) NOT NULL,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk login dan pencarian
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX idx_users_membership_id ON users(membership_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLE: borrowings
-- Menyimpan data peminjaman buku
-- ============================================
CREATE TABLE IF NOT EXISTS borrowings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT CHECK (status IN ('pending', 'active', 'returned', 'overdue', 'returning')) NOT NULL,
  barcode TEXT NOT NULL,
  return_barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_borrowings_user_id ON borrowings(user_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_barcode ON borrowings(barcode);
CREATE INDEX IF NOT EXISTS idx_borrowings_borrow_date ON borrowings(borrow_date);

-- ============================================
-- TABLE: borrowing_details
-- Menyimpan detail buku yang dipinjam
-- ============================================
CREATE TABLE IF NOT EXISTS borrowing_details (
  id TEXT PRIMARY KEY,
  borrowing_id TEXT NOT NULL REFERENCES borrowings(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk join operations
CREATE INDEX IF NOT EXISTS idx_borrowing_details_borrowing_id ON borrowing_details(borrowing_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_details_book_id ON borrowing_details(book_id);

-- ============================================
-- TABLE: activities
-- Menyimpan log aktivitas sistem
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT CHECK (user_role IN ('admin', 'member')) NOT NULL,
  action TEXT CHECK (action IN ('login', 'logout', 'register', 'borrow_request', 'borrow_confirm', 'return_request', 'return_confirm', 'book_add', 'book_edit', 'book_delete')) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk sorting dan filtering
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Books: Public read, admin write
CREATE POLICY "Books are viewable by everyone" 
  ON books FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Books are insertable by admins" 
  ON books FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Books are updatable by admins" 
  ON books FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Books are deletable by admins" 
  ON books FOR DELETE 
  TO authenticated
  USING (true);

-- Users: Users can view their own data
CREATE POLICY "Users can view all users" 
  ON users FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users are insertable" 
  ON users FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  TO authenticated
  USING (true);

-- Borrowings: Users can view their own, admins can view all
CREATE POLICY "Users can view all borrowings" 
  ON borrowings FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert borrowings" 
  ON borrowings FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Borrowings are updatable" 
  ON borrowings FOR UPDATE 
  TO authenticated
  USING (true);

-- Borrowing Details: Follow borrowing permissions
CREATE POLICY "Borrowing details are viewable" 
  ON borrowing_details FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Borrowing details are insertable" 
  ON borrowing_details FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Activities: All authenticated users can view and insert
CREATE POLICY "Activities are viewable" 
  ON activities FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Activities are insertable" 
  ON activities FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for all tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE books;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE borrowings;
ALTER PUBLICATION supabase_realtime ADD TABLE borrowing_details;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update borrowing status to overdue
CREATE OR REPLACE FUNCTION update_overdue_borrowings()
RETURNS void AS $$
BEGIN
  UPDATE borrowings
  SET status = 'overdue'
  WHERE status = 'active'
  AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA SEEDING
-- Run this after creating tables
-- ============================================

-- Insert default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (id, name, email, password, phone, address, membership_id, role, join_date, avatar) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Administrator', 'admin@ubhara.ac.id', 'admin123', '021-1234567', 'Universitas Bhayangkara Jakarta Raya', 'ADM-000001', 'admin', CURRENT_DATE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
ON CONFLICT (id) DO NOTHING;

-- Insert sample member (password: member123)
INSERT INTO users (id, name, email, password, phone, address, membership_id, role, join_date, avatar) 
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Budi Santoso', 'budi.santoso@student.ubhara.ac.id', 'member123', '081234567890', 'Jakarta Selatan', 'MEM-000001', 'member', CURRENT_DATE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE books IS 'Tabel untuk menyimpan koleksi buku perpustakaan';
COMMENT ON TABLE users IS 'Tabel untuk menyimpan data anggota dan admin';
COMMENT ON TABLE borrowings IS 'Tabel untuk menyimpan transaksi peminjaman';
COMMENT ON TABLE borrowing_details IS 'Tabel detail buku yang dipinjam per transaksi';
COMMENT ON TABLE activities IS 'Tabel log aktivitas sistem untuk audit trail';
