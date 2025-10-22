import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Library, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Logo } from './Logo';

interface RegisterPageProps {
  onRegister: (name: string, email: string, password: string, phone: string, address: string) => void;
  onBackToLogin: () => void;
}

export function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !address.trim()) {
      toast.error('Semua field harus diisi!');
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid!');
      return;
    }

    // Validasi password
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok!');
      return;
    }

    // Validasi phone
    if (phone.length < 10) {
      toast.error('Nomor telepon minimal 10 digit!');
      return;
    }

    onRegister(name, email, password, phone, address);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-gray-100">Daftar Anggota Baru</CardTitle>
            <CardDescription className="text-gray-400">
              Bergabung dengan SmartLib Ubhara untuk meminjam buku
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10 bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">Alamat Lengkap</Label>
              <Input
                id="address"
                type="text"
                placeholder="Jl. Contoh No. 123, Jakarta"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4">
              <p className="text-sm text-emerald-300">
                <strong className="text-emerald-400">Catatan:</strong> Setelah mendaftar, Anda akan mendapatkan ID keanggotaan yang dapat digunakan untuk login dan meminjam buku.
              </p>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Daftar Sekarang
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-300 hover:text-gray-100 hover:bg-slate-800"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-gray-400">
              Untuk akun admin, silakan hubungi pengelola perpustakaan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
