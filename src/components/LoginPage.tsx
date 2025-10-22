import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Library, LogIn, User as UserIcon, Shield, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { currentUser, adminUser } from '../data/mockData';
import { toast } from 'sonner@2.0.3';
import { Logo } from './Logo';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
  users: User[];
  usersLoading?: boolean;
}

export function LoginPage({ onLogin, onRegister, users, usersLoading = false }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Username/Email dan password harus diisi!');
      return;
    }

    // Cari user berdasarkan email atau membership ID
    // Gunakan users prop jika tersedia, fallback ke mockData
    const userList = users.length > 0 ? users : [currentUser, adminUser];
    const user = userList.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        u.membershipId.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      toast.error('Username/Email/ID Keanggotaan tidak ditemukan!');
      return;
    }

    // Validasi password
    // Di production, password akan diverifikasi dengan hash (bcrypt, etc.)
    if (user.password !== password) {
      toast.error('Password salah!');
      return;
    }

    onLogin(user);
  };

  const handleQuickLogin = (user: User) => {
    // Quick login langsung tanpa validasi database
    // Karena ini demo mode, kita asumsikan user sudah di-seed di database
    // Jika belum ada, akan ditambahkan otomatis oleh handleLogin di App.tsx
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="w-full max-w-md" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="inline-flex items-center justify-center mb-4" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo size="lg" />
          </div>
          <h1 className="mb-2 text-emerald-400" style={{ fontSize: '2.25rem', fontWeight: '800', color: '#34d399', marginBottom: '0.5rem', lineHeight: '1.2' }}>SmartLib Ubhara</h1>
          <p className="text-orange-400" style={{ fontSize: '1rem', color: '#fb923c', lineHeight: '1.5' }}>Perpustakaan Universitas Bhayangkara Jakarta Raya</p>
        </div>

        <Card className="shadow-lg bg-slate-900 border-slate-700" style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.7)' }}>
          <CardHeader className="text-center">
            <CardTitle className="text-gray-100">Masuk ke Akun Anda</CardTitle>
            <CardDescription className="text-gray-400">
              Masukkan kredensial untuk mengakses sistem perpustakaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Username / Email / ID Keanggotaan</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Masukkan email / username"
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
                    placeholder="••••••••"
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

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" style={{ width: '100%', backgroundColor: '#f97316', color: 'white', padding: '0.625rem 1rem', fontSize: '1rem', fontWeight: '600', borderRadius: '0.5rem' }}>
                <LogIn className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            </form>

            {/* Demo Mode Toggle */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-300 hover:text-gray-100 hover:bg-slate-800"
                onClick={() => setShowDemo(!showDemo)}
              >
                {showDemo ? 'Sembunyikan' : 'Tampilkan'} Mode Demo
              </Button>

              {showDemo && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-400">Quick Login untuk Demo:</p>
                  
                  {usersLoading && (
                    <div className="p-3 bg-blue-950/30 border border-blue-800 rounded text-center">
                      <p className="text-xs text-blue-300">
                        ⏳ Memuat data dari database...
                      </p>
                    </div>
                  )}
                  
                  {!usersLoading && users.length === 0 && (
                    <div className="p-3 bg-orange-950/30 border border-orange-800 rounded">
                      <p className="text-xs text-orange-300 mb-2">
                        ⚠️ Database belum di-setup atau kosong!
                      </p>
                      <p className="text-xs text-orange-200">
                        📌 Quick login akan otomatis membuat user demo jika database sudah siap.
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100"
                    onClick={() => handleQuickLogin(currentUser)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-900/50 p-2 rounded-full">
                        <UserIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-100">Login sebagai Anggota (Budi)</p>
                        <p className="text-xs text-gray-400">Username: {currentUser.email} • Password: {currentUser.password}</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-slate-800 border-slate-600 hover:bg-slate-700 text-gray-100"
                    onClick={() => handleQuickLogin(adminUser)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-900/50 p-2 rounded-full">
                        <Shield className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-100">Login sebagai Admin</p>
                        <p className="text-xs text-gray-400">Username: {adminUser.email} • Password: {adminUser.password}</p>
                      </div>
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-400">
            Belum punya akun?{' '}
            <button onClick={onRegister} className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium">
              Daftar sebagai anggota
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Untuk akun admin, silakan hubungi pengelola perpustakaan
          </p>
        </div>
      </div>
    </div>
  );
}
