import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { User, UserCircle, Phone, MapPin, Save, Mail, Lock } from 'lucide-react';
import { User as UserType } from '../types';
import { toast } from 'sonner@2.0.3';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType;
  onSave: (updatedUser: UserType) => void;
}

export function EditProfileDialog({ open, onOpenChange, user, onSave }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    address: user.address,
    email: user.email,
    password: user.password,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!formData.name.trim()) {
      toast.error('Nama tidak boleh kosong!');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email/Username tidak boleh kosong!');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Password tidak boleh kosong!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Nomor telepon tidak boleh kosong!');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Alamat tidak boleh kosong!');
      return;
    }

    // Update user
    const updatedUser: UserType = {
      ...user,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    onSave(updatedUser);
    onOpenChange(false);
    toast.success('Profil berhasil diperbarui!');
  };

  const handleReset = () => {
    setFormData({
      name: user.name,
      phone: user.phone,
      address: user.address,
      email: user.email,
      password: user.password,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-emerald-400" />
            Edit Profil
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Perbarui informasi profil Anda. Klik simpan untuk menyimpan perubahan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nama Lengkap
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              required
            />
          </div>

          {/* Email/Username */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email / Username
            </Label>
            <Input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Masukkan email atau username"
              className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Masukkan password (min. 6 karakter)"
              className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              required
              minLength={6}
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Nomor Telepon
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Contoh: 081234567890"
              className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500"
              required
            />
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-300 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Alamat Lengkap
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Masukkan alamat lengkap"
              className="bg-slate-800 border-slate-600 text-gray-100 placeholder:text-gray-500 min-h-[100px]"
              required
            />
          </div>

          {/* Info Membership (Read-only) */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">ID Keanggotaan:</span>
              <span className="text-sm text-gray-200">{user.membershipId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Role:</span>
              <span className="text-sm text-gray-200 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Bergabung:</span>
              <span className="text-sm text-gray-200">{user.joinDate}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * ID Keanggotaan dan Role tidak dapat diubah
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 bg-slate-800 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
