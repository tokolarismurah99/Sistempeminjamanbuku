-- ============================================
-- SEED DATA FOR SMARTLIB UBHARA
-- Initial data untuk testing dan development
-- ============================================

-- Insert 20 Books dengan cover REAL dari Unsplash
INSERT INTO books (id, title, author, publisher, genre_buku, description, cover_url, tahun_terbit, stok) VALUES

-- Buku Indonesia
('1', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 'Fiksi', 'Novel tentang perjuangan anak-anak Belitung untuk mendapatkan pendidikan.', 'https://images.unsplash.com/photo-1676747484510-755c231ae83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2005, 5),

('2', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 'Fiksi', 'Novel sejarah tentang kehidupan di masa kolonial Belanda.', 'https://images.unsplash.com/photo-1642775421580-1a859d8bbab6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 1980, 5),

('3', 'Filosofi Teras', 'Henry Manampiring', 'Penerbit Buku Kompas', 'Non-Fiksi', 'Buku tentang filosofi Stoicisme untuk kehidupan sehari-hari.', 'https://images.unsplash.com/photo-1569997851406-472ce7b75c6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2019, 5),

-- Buku Sains & Self-Development
('4', 'Sapiens', 'Yuval Noah Harari', 'Harper', 'Sains', 'Sejarah singkat tentang umat manusia dari zaman batu hingga modern.', 'https://images.unsplash.com/photo-1657062664857-e423f5a20c34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2011, 5),

('5', 'Atomic Habits', 'James Clear', 'Avery', 'Pengembangan Diri', 'Panduan praktis untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk.', 'https://images.unsplash.com/photo-1615253892603-719d2472c74c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2018, 5),

('6', 'The Psychology of Money', 'Morgan Housel', 'Harriman House', 'Keuangan', 'Pelajaran abadi tentang kekayaan, keserakahan, dan kebahagiaan.', 'https://images.unsplash.com/photo-1613870221528-f7a918522a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2020, 5),

-- Buku Teknologi & Sejarah
('7', 'Algoritma dan Pemrograman', 'Rinaldi Munir', 'Informatika', 'Teknologi', 'Buku teks tentang dasar-dasar algoritma dan pemrograman komputer.', 'https://images.unsplash.com/photo-1580121441575-41bcb5c6b47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2016, 5),

('8', 'Sejarah Indonesia Modern', 'M.C. Ricklefs', 'Gadjah Mada University Press', 'Sejarah', 'Kompilasi lengkap sejarah Indonesia dari masa ke masa.', 'https://images.unsplash.com/photo-1663580109859-b63aafcb275e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2008, 5),

('9', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 'Teknologi', 'Panduan untuk menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.', 'https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2008, 5),

('10', 'Rich Dad Poor Dad', 'Robert Kiyosaki', 'Warner Books', 'Keuangan', 'Pelajaran tentang keuangan dan investasi dari dua sosok ayah yang berbeda.', 'https://images.unsplash.com/photo-1625887261583-202fb61d4446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 1997, 5),

-- Harry Potter Series (7 books)
('11', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Harry Potter menemukan bahwa dia adalah penyihir dan memulai petualangan di Hogwarts School of Witchcraft and Wizardry.', 'https://images.unsplash.com/photo-1609881583306-39c8b7eea68b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 1997, 5),

('12', 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Tahun kedua Harry di Hogwarts penuh dengan misteri ketika Kamar Rahasia dibuka dan monster mengancam siswa.', 'https://images.unsplash.com/photo-1628175806356-53c2b2734ca4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 1998, 5),

('13', 'Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Harry belajar tentang masa lalu keluarganya ketika seorang tahanan berbahaya melarikan diri dari Azkaban.', 'https://images.unsplash.com/photo-1631204027661-4feef74c0118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 1999, 5),

('14', 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Harry dipilih untuk berkompetisi dalam Triwizard Tournament yang berbahaya, meskipun dia masih terlalu muda.', 'https://images.unsplash.com/photo-1565815967314-5187f844fd2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2000, 5),

('15', 'Harry Potter and the Order of the Phoenix', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Harry membentuk Dumbledore''s Army untuk melawan kembalinya Lord Voldemort dan korupsi di Kementerian Sihir.', 'https://images.unsplash.com/photo-1669205617241-bf837080affd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2003, 5),

('16', 'Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Harry belajar tentang masa lalu Voldemort dan mempersiapkan pertempuran final yang akan datang.', 'https://images.unsplash.com/photo-1630419544962-97655e1e88c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2005, 5),

('17', 'Harry Potter and the Deathly Hallows', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Petualangan final Harry dalam pertempuran melawan Lord Voldemort dan pencarian Horcrux.', 'https://images.unsplash.com/photo-1706812783210-56e7100e1a75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2007, 5),

-- Fantastic Beasts Series (3 books)
('18', 'Fantastic Beasts and Where to Find Them', 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Panduan lengkap tentang makhluk-makhluk ajaib di dunia sihir, ditulis oleh magizoologist Newt Scamander.', 'https://images.unsplash.com/photo-1685478237148-aaf613b2e8ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2001, 5),

('19', 'Fantastic Beasts: The Crimes of Grindelwald', 'J.K. Rowling', 'Scholastic', 'Fantasi', 'Newt Scamander bergabung dengan Albus Dumbledore untuk menghentikan penyihir gelap Gellert Grindelwald.', 'https://images.unsplash.com/photo-1606568699878-520721032279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2018, 5),

('20', 'Fantastic Beasts: The Secrets of Dumbledore', 'J.K. Rowling', 'Scholastic', 'Fantasi', 'Albus Dumbledore mengungkap rahasia masa lalunya sambil memimpin pertempuran melawan Grindelwald.', 'https://images.unsplash.com/photo-1706564480451-9690ca2d5d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 2022, 5)

ON CONFLICT (id) DO NOTHING;

-- Confirmation
SELECT 'Seeded ' || COUNT(*) || ' books successfully!' as message FROM books;

-- ============================================
-- SEED USERS - Default Admin & Member
-- ============================================

INSERT INTO users (id, name, email, password, phone, address, membership_id, role, join_date, avatar) VALUES

-- Admin User
('admin-001', 'Admin Perpustakaan', 'admin', 'admin123', '081234567890', 'Universitas Bhayangkara Jakarta Raya, Jl. Perjuangan, Bekasi', 'ADM-000001', 'admin', '2024-01-01', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),

-- Member User (Demo)
('member-001', 'Budi Santoso', 'budi', 'budi123', '081298765432', 'Jl. Raya Bekasi No. 123, Jakarta Timur', 'MEM-000001', 'member', '2024-01-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi')

ON CONFLICT (id) DO NOTHING;

-- Confirmation
SELECT 'Seeded ' || COUNT(*) || ' users successfully!' as message FROM users;

-- ============================================
-- NO SAMPLE BORROWINGS - START CLEAN!
-- ============================================
-- Database dimulai dari kosong, user akan create borrowing sendiri
