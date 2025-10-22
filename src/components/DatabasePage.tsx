import { Database, Table, Key, Link2, Box, FileCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export default function DatabasePage() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-10 h-10 text-emerald-400" />
            <h1 className="text-emerald-400">Database Documentation</h1>
          </div>
          <p className="text-gray-400">
            Dokumentasi lengkap struktur database sistem SmartLib Ubhara - Entitas, Relasi, Atribut & Keys
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="relations">Relations</TabsTrigger>
            <TabsTrigger value="storage">Storage Keys</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-emerald-400" />
                  Arsitektur Sistem
                </CardTitle>
                <CardDescription className="text-gray-400">
                  SmartLib Ubhara menggunakan localStorage untuk persistence data 100% client-side
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Table className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white">8 Entitas</h3>
                    </div>
                    <p className="text-gray-400 text-sm">Main data entities</p>
                  </div>
                  
                  <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="w-5 h-5 text-orange-400" />
                      <h3 className="text-white">7 Relasi</h3>
                    </div>
                    <p className="text-gray-400 text-sm">Entity relationships</p>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white">6 Storage Keys</h3>
                    </div>
                    <p className="text-gray-400 text-sm">LocalStorage keys</p>
                  </div>
                  
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="w-5 h-5 text-purple-400" />
                      <h3 className="text-white">TypeScript</h3>
                    </div>
                    <p className="text-gray-400 text-sm">Fully typed system</p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-white mb-3">Entity List</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: 'Book', desc: 'Data buku perpustakaan', color: 'emerald' },
                      { name: 'User', desc: 'Data anggota dan admin', color: 'blue' },
                      { name: 'CartItem', desc: 'Shopping cart peminjaman', color: 'orange' },
                      { name: 'Borrowing', desc: 'Transaksi peminjaman (header)', color: 'purple' },
                      { name: 'BorrowingDetail', desc: 'Detail item peminjaman', color: 'pink' },
                      { name: 'Return', desc: 'Transaksi pengembalian', color: 'yellow' },
                      { name: 'ReturnDetail', desc: 'Detail item pengembalian', color: 'green' },
                      { name: 'Activity', desc: 'Log aktivitas sistem', color: 'red' },
                    ].map((entity) => (
                      <div key={entity.name} className="bg-gray-900/50 border border-gray-700 rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white">{entity.name}</span>
                            <p className="text-gray-400 text-sm">{entity.desc}</p>
                          </div>
                          <Badge variant="outline" className={`border-${entity.color}-500 text-${entity.color}-400`}>
                            Entity
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENTITIES TAB */}
          <TabsContent value="entities" className="space-y-6">
            {/* BOOK ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-emerald-400">Book (Buku)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk menyimpan informasi buku yang tersedia di perpustakaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">id</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID unik buku</TableCell>
                      <TableCell><Badge className="bg-emerald-600">PK</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">title</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Judul buku</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">author</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Nama penulis</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">publisher</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Nama penerbit</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">genre</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Genre/kategori buku</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">description</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Deskripsi singkat buku</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">coverUrl</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">URL cover buku (Unsplash)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">publishYear</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Tahun terbit</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">stock</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Jumlah stok tersedia</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
                <div className="mt-4 bg-emerald-900/20 border border-emerald-700 rounded p-3">
                  <p className="text-emerald-400 text-sm">
                    <strong>Business Rules:</strong> Stok berkurang saat peminjaman, bertambah saat pengembalian. Buku dengan stok 0 tidak bisa dipinjam.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* USER ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">User (Pengguna)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk menyimpan data anggota perpustakaan dan admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">id</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID unik pengguna</TableCell>
                      <TableCell><Badge className="bg-blue-600">PK</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">name</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Nama lengkap</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">email</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Email/username login (unique)</TableCell>
                      <TableCell><Badge variant="outline" className="border-yellow-500 text-yellow-400">UNIQUE</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">password</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Password (plain text demo)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">phone</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Nomor HP</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">address</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Alamat lengkap</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">membershipId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID keanggotaan (MEM-XXX/ADM-XXX)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">role</TableCell>
                      <TableCell className="text-gray-400">'member' | 'admin'</TableCell>
                      <TableCell className="text-gray-400">Peran pengguna</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">joinDate</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Tanggal bergabung (YYYY-MM-DD)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">avatar</TableCell>
                      <TableCell className="text-gray-400">string?</TableCell>
                      <TableCell className="text-gray-400">URL avatar (Dicebear API)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
                <div className="mt-4 bg-blue-900/20 border border-blue-700 rounded p-3">
                  <p className="text-blue-400 text-sm">
                    <strong>Kredensial Demo:</strong> Admin (admin/admin123), Member (budi/budi123)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CARTITEM ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-orange-400">CartItem (Item Keranjang)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk shopping cart sebelum checkout peminjaman
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">bookId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID buku</TableCell>
                      <TableCell><Badge className="bg-purple-600">FK → Book</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">quantity</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Jumlah buku (min: 1, max: stock)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
                <div className="mt-4 bg-orange-900/20 border border-orange-700 rounded p-3">
                  <p className="text-orange-400 text-sm">
                    <strong>Business Rules:</strong> Cart bersifat temporary, direset setelah checkout. Quantity tidak boleh melebihi stok.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* BORROWING ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-purple-400">Borrowing (Peminjaman)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas utama untuk transaksi peminjaman buku (header invoice)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">id</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID unik peminjaman</TableCell>
                      <TableCell><Badge className="bg-purple-600">PK</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">userId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID anggota peminjam</TableCell>
                      <TableCell><Badge className="bg-purple-600">FK → User</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">borrowDate</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Tanggal peminjaman (YYYY-MM-DD)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">dueDate</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Batas pengembalian (+7 hari)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">returnDate</TableCell>
                      <TableCell className="text-gray-400">string?</TableCell>
                      <TableCell className="text-gray-400">Tanggal pengembalian aktual</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">returnRequestDate</TableCell>
                      <TableCell className="text-gray-400">string?</TableCell>
                      <TableCell className="text-gray-400">Tanggal request pengembalian</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">status</TableCell>
                      <TableCell className="text-gray-400">enum</TableCell>
                      <TableCell className="text-gray-400">pending | active | returned | overdue | returning</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">barcode</TableCell>
                      <TableCell className="text-gray-400">string?</TableCell>
                      <TableCell className="text-gray-400">Barcode peminjaman</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">returnBarcode</TableCell>
                      <TableCell className="text-gray-400">string?</TableCell>
                      <TableCell className="text-gray-400">Barcode pengembalian</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">details</TableCell>
                      <TableCell className="text-gray-400">BorrowingDetail[]</TableCell>
                      <TableCell className="text-gray-400">Array detail items</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
                <div className="mt-4 space-y-2">
                  <div className="bg-purple-900/20 border border-purple-700 rounded p-3">
                    <p className="text-purple-400 text-sm">
                      <strong>Status Flow:</strong> pending → active → returning → returned (atau overdue jika melewati due date)
                    </p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-700 rounded p-3">
                    <p className="text-purple-400 text-sm">
                      <strong>Denda:</strong> Rp 5.000/hari untuk setiap hari keterlambatan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BORROWINGDETAIL ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-pink-400">BorrowingDetail (Detail Peminjaman)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk detail item buku dalam satu transaksi peminjaman
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">bookId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID buku</TableCell>
                      <TableCell><Badge className="bg-purple-600">FK → Book</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">bookTitle</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Judul buku (denormalisasi)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">quantity</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Jumlah buku dipinjam</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
              </CardContent>
            </Card>

            {/* RETURN ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Return (Pengembalian)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk transaksi pengembalian buku
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">id</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID unik pengembalian</TableCell>
                      <TableCell><Badge className="bg-yellow-600">PK</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">borrowingId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID peminjaman</TableCell>
                      <TableCell><Badge className="bg-purple-600">FK → Borrowing</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">returnDate</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Tanggal pengembalian</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">lateFee</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Denda keterlambatan (Rupiah)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">details</TableCell>
                      <TableCell className="text-gray-400">ReturnDetail[]</TableCell>
                      <TableCell className="text-gray-400">Array detail pengembalian</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
                <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded p-3">
                  <p className="text-yellow-400 text-sm">
                    <strong>Rumus Denda:</strong> (hari terlambat) × Rp 5.000, dimana hari terlambat = returnDate - dueDate (jika {'>'} 0)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* RETURNDETAIL ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">ReturnDetail (Detail Pengembalian)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk detail item buku yang dikembalikan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">id</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID unik detail</TableCell>
                      <TableCell><Badge className="bg-green-600">PK</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">returnId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID pengembalian</TableCell>
                      <TableCell><Badge className="bg-yellow-600">FK → Return</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">bookId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID buku</TableCell>
                      <TableCell><Badge className="bg-emerald-600">FK → Book</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">quantityReturned</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Jumlah buku dikembalikan</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
              </CardContent>
            </Card>

            {/* ACTIVITY ENTITY */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-400">Activity (Log Aktivitas)</CardTitle>
                <CardDescription className="text-gray-400">
                  Entitas untuk tracking semua aktivitas sistem (audit trail)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Atribut</TableHead>
                      <TableHead className="text-gray-300">Tipe Data</TableHead>
                      <TableHead className="text-gray-300">Keterangan</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">id</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID unik aktivitas</TableCell>
                      <TableCell><Badge className="bg-red-600">PK</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">userId</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">ID user yang melakukan aksi</TableCell>
                      <TableCell><Badge className="bg-blue-600">FK → User</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">userName</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Nama user (denormalisasi)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">userRole</TableCell>
                      <TableCell className="text-gray-400">'member' | 'admin'</TableCell>
                      <TableCell className="text-gray-400">Role user (denormalisasi)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">action</TableCell>
                      <TableCell className="text-gray-400">enum</TableCell>
                      <TableCell className="text-gray-400">Jenis aksi (lihat action types)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">description</TableCell>
                      <TableCell className="text-gray-400">string</TableCell>
                      <TableCell className="text-gray-400">Deskripsi lengkap aktivitas</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">timestamp</TableCell>
                      <TableCell className="text-gray-400">Date</TableCell>
                      <TableCell className="text-gray-400">Waktu aktivitas (auto-generated)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-white">metadata</TableCell>
                      <TableCell className="text-gray-400">any?</TableCell>
                      <TableCell className="text-gray-400">Data tambahan (JSON)</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>
                <div className="mt-4 bg-red-900/20 border border-red-700 rounded p-3">
                  <p className="text-red-400 text-sm mb-2">
                    <strong>Action Types:</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div>• login</div>
                    <div>• logout</div>
                    <div>• register</div>
                    <div>• borrow_request</div>
                    <div>• borrow_confirm</div>
                    <div>• return_request</div>
                    <div>• return_confirm</div>
                    <div>• book_add</div>
                    <div>• book_edit</div>
                    <div>• book_delete</div>
                    <div>• stock_update</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RELATIONS TAB */}
          <TabsContent value="relations" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-emerald-400" />
                  Entity Relationship Diagram
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Relasi antar entitas dalam sistem SmartLib Ubhara
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ASCII ERD Diagram */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6 overflow-x-auto">
                  <pre className="text-emerald-400 text-sm">
{`
┌─────────────┐
│    USER     │
│ (Pengguna)  │
└──────┬──────┘
       │ 1
       │
       │ M
┌──────▼──────────┐        ┌─────────────────┐
│   BORROWING     │◄───────┤  BORROWINGDETAIL│
│  (Peminjaman)   │  1   M │ (Detail Pinjam) │
└────┬──────┬─────┘        └────────┬────────┘
     │ 1    │                       │
     │      │ 1                     │ M
     │      │                       │
     │ 1  ┌─▼──────┐                │
     │    │ RETURN │         ┌──────▼──────┐
     │    │(Kemb.) │◄────────┤ RETURNDETAIL│
     │    └────────┘   1   M │(Detail Kemb)│
     │                       └──────┬──────┘
     │ M                            │ M
     │                              │
┌────▼──────┐            ┌─────────▼────────┐
│ ACTIVITY  │            │      BOOK        │
│(Log Audit)│            │     (Buku)       │
└───────────┘            └──────────────────┘
                                  ▲
                                  │ M
                                  │
                            ┌─────┴──────┐
                            │  CARTITEM  │
                            │(Keranjang) │
                            └────────────┘

Legend:
─────  One-to-Many relationship
◄────  Foreign Key direction
1      One (cardinality)
M      Many (cardinality)
`}
                  </pre>
                </div>

                {/* Relasi Detail */}
                <div className="space-y-4">
                  <h3 className="text-white">Deskripsi Relasi</h3>
                  
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-600 mt-1">1:M</Badge>
                      <div>
                        <h4 className="text-white mb-1">USER → BORROWING</h4>
                        <p className="text-gray-400 text-sm">
                          Satu user (anggota) dapat memiliki banyak transaksi peminjaman. 
                          Relasi melalui <code className="text-emerald-400">Borrowing.userId</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-600 mt-1">1:M</Badge>
                      <div>
                        <h4 className="text-white mb-1">BORROWING → BORROWINGDETAIL</h4>
                        <p className="text-gray-400 text-sm">
                          Satu peminjaman dapat memiliki banyak detail item buku. 
                          Embedded array di <code className="text-emerald-400">Borrowing.details[]</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-yellow-600 mt-1">1:1</Badge>
                      <div>
                        <h4 className="text-white mb-1">BORROWING → RETURN</h4>
                        <p className="text-gray-400 text-sm">
                          Satu peminjaman memiliki satu pengembalian. 
                          Relasi melalui <code className="text-emerald-400">Return.borrowingId</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-green-600 mt-1">1:M</Badge>
                      <div>
                        <h4 className="text-white mb-1">RETURN → RETURNDETAIL</h4>
                        <p className="text-gray-400 text-sm">
                          Satu pengembalian dapat memiliki banyak detail item buku. 
                          Embedded array di <code className="text-emerald-400">Return.details[]</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-emerald-600 mt-1">1:M</Badge>
                      <div>
                        <h4 className="text-white mb-1">BOOK → BORROWINGDETAIL</h4>
                        <p className="text-gray-400 text-sm">
                          Satu buku dapat dipinjam di banyak transaksi. 
                          Relasi melalui <code className="text-emerald-400">BorrowingDetail.bookId</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-orange-600 mt-1">1:M</Badge>
                      <div>
                        <h4 className="text-white mb-1">BOOK → CARTITEM</h4>
                        <p className="text-gray-400 text-sm">
                          Satu buku dapat ada di banyak shopping cart (temporary). 
                          Relasi melalui <code className="text-emerald-400">CartItem.bookId</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-red-600 mt-1">1:M</Badge>
                      <div>
                        <h4 className="text-white mb-1">USER → ACTIVITY</h4>
                        <p className="text-gray-400 text-sm">
                          Satu user dapat memiliki banyak log aktivitas. 
                          Relasi melalui <code className="text-emerald-400">Activity.userId</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORAGE KEYS TAB */}
          <TabsContent value="storage" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  LocalStorage Keys
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Keys yang digunakan untuk menyimpan data di browser localStorage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Key Name</TableHead>
                      <TableHead className="text-gray-300">Data Type</TableHead>
                      <TableHead className="text-gray-300">Deskripsi</TableHead>
                      <TableHead className="text-gray-300">Persistent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-emerald-400">smartlib_books</TableCell>
                      <TableCell className="text-gray-400">Book[]</TableCell>
                      <TableCell className="text-gray-400">Daftar semua buku perpustakaan</TableCell>
                      <TableCell><Badge variant="outline" className="border-green-500 text-green-400">Yes</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-emerald-400">smartlib_users</TableCell>
                      <TableCell className="text-gray-400">User[]</TableCell>
                      <TableCell className="text-gray-400">Daftar semua pengguna (admin + member)</TableCell>
                      <TableCell><Badge variant="outline" className="border-green-500 text-green-400">Yes</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-emerald-400">smartlib_borrowings</TableCell>
                      <TableCell className="text-gray-400">Borrowing[]</TableCell>
                      <TableCell className="text-gray-400">Daftar semua transaksi peminjaman</TableCell>
                      <TableCell><Badge variant="outline" className="border-green-500 text-green-400">Yes</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-emerald-400">smartlib_activities</TableCell>
                      <TableCell className="text-gray-400">Activity[]</TableCell>
                      <TableCell className="text-gray-400">Log aktivitas sistem (audit trail)</TableCell>
                      <TableCell><Badge variant="outline" className="border-green-500 text-green-400">Yes</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-emerald-400">smartlib_currentUser</TableCell>
                      <TableCell className="text-gray-400">User | null</TableCell>
                      <TableCell className="text-gray-400">Session user yang sedang login</TableCell>
                      <TableCell><Badge variant="outline" className="border-yellow-500 text-yellow-400">Session</Badge></TableCell>
                    </TableRow>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="text-emerald-400">smartlib_borrowing_counter</TableCell>
                      <TableCell className="text-gray-400">number</TableCell>
                      <TableCell className="text-gray-400">Counter untuk generate barcode unique</TableCell>
                      <TableCell><Badge variant="outline" className="border-green-500 text-green-400">Yes</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </TableUI>

                <Separator className="bg-gray-700 my-6" />

                <div className="space-y-4">
                  <h3 className="text-white">Utility Functions</h3>
                  
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-emerald-400 mb-2">Initialization</h4>
                    <code className="text-gray-300 text-sm">initializeLocalStorage()</code>
                    <p className="text-gray-400 text-sm mt-2">
                      Menginisialisasi semua localStorage keys dengan data default saat pertama kali aplikasi dijalankan
                    </p>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-emerald-400 mb-2">CRUD Books</h4>
                    <div className="space-y-1 text-gray-300 text-sm">
                      <div><code>getBooks()</code> - Get all books</div>
                      <div><code>saveBooks(books)</code> - Save books array</div>
                      <div><code>addBook(book)</code> - Add new book</div>
                      <div><code>updateBook(id, updates)</code> - Update book</div>
                      <div><code>deleteBook(id)</code> - Delete book</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-emerald-400 mb-2">CRUD Users</h4>
                    <div className="space-y-1 text-gray-300 text-sm">
                      <div><code>getUsers()</code> - Get all users</div>
                      <div><code>saveUsers(users)</code> - Save users array</div>
                      <div><code>addUser(user)</code> - Add new user</div>
                      <div><code>getUserById(id)</code> - Get user by ID</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-emerald-400 mb-2">CRUD Borrowings</h4>
                    <div className="space-y-1 text-gray-300 text-sm">
                      <div><code>getBorrowings()</code> - Get all borrowings</div>
                      <div><code>saveBorrowings(borrowings)</code> - Save borrowings array</div>
                      <div><code>addBorrowing(borrowing)</code> - Add new borrowing</div>
                      <div><code>updateBorrowing(id, updates)</code> - Update borrowing</div>
                      <div><code>getBorrowingsByUser(userId)</code> - Get user's borrowings</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-emerald-400 mb-2">Activities</h4>
                    <div className="space-y-1 text-gray-300 text-sm">
                      <div><code>getActivities()</code> - Get all activities</div>
                      <div><code>saveActivities(activities)</code> - Save activities array</div>
                      <div><code>addActivity(userId, userName, userRole, action, description)</code> - Log new activity</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-emerald-400 mb-2">Session Management</h4>
                    <div className="space-y-1 text-gray-300 text-sm">
                      <div><code>getCurrentUser()</code> - Get current logged in user</div>
                      <div><code>saveCurrentUser(user)</code> - Save current user session</div>
                      <div><code>clearSession()</code> - Clear current user session (logout)</div>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <h4 className="text-red-400 mb-2">Reset / Clear</h4>
                    <div className="space-y-1 text-gray-300 text-sm">
                      <div><code>resetAllData()</code> - Reset semua data ke default (keep session)</div>
                      <div><code>clearAll()</code> - Clear semua localStorage termasuk session</div>
                    </div>
                    <p className="text-red-400 text-sm mt-2">⚠️ Hati-hati: Operasi ini tidak bisa di-undo!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="bg-gray-800/50 border-gray-700 mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileCode className="w-5 h-5 text-emerald-400 mt-1" />
              <div>
                <h4 className="text-white mb-1">Type Definitions</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Semua tipe data didefinisikan di <code className="text-emerald-400">/types/index.ts</code>
                </p>
                <p className="text-gray-400 text-sm">
                  Utility functions di <code className="text-emerald-400">/utils/localStorage.ts</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
