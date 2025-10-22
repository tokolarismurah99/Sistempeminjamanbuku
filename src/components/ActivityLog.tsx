import { Activity } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  LogIn, 
  LogOut, 
  UserPlus, 
  BookPlus, 
  BookOpen, 
  Trash2, 
  Package, 
  CheckSquare, 
  RotateCcw,
  Clock
} from 'lucide-react';

interface ActivityLogProps {
  activities: Activity[];
}

const actionIcons = {
  login: LogIn,
  logout: LogOut,
  register: UserPlus,
  borrow_request: BookOpen,
  borrow_confirm: CheckSquare,
  return_request: RotateCcw,
  return_confirm: Package,
  book_add: BookPlus,
  book_edit: BookOpen,
  book_delete: Trash2,
  stock_update: Package,
};

const actionColors = {
  login: 'text-emerald-300 bg-emerald-950/30 border border-emerald-800/50',
  logout: 'text-gray-300 bg-slate-800 border border-slate-600',
  register: 'text-blue-300 bg-blue-950/30 border border-blue-800/50',
  borrow_request: 'text-orange-300 bg-orange-950/30 border border-orange-800/50',
  borrow_confirm: 'text-teal-300 bg-teal-950/30 border border-teal-800/50',
  return_request: 'text-violet-300 bg-violet-950/30 border border-violet-800/50',
  return_confirm: 'text-emerald-300 bg-emerald-950/30 border border-emerald-800/50',
  book_add: 'text-green-300 bg-green-950/30 border border-green-800/50',
  book_edit: 'text-blue-300 bg-blue-950/30 border border-blue-800/50',
  book_delete: 'text-red-300 bg-red-950/30 border border-red-800/50',
  stock_update: 'text-amber-300 bg-amber-950/30 border border-amber-800/50',
};

const actionLabels = {
  login: 'Login',
  logout: 'Logout',
  register: 'Registrasi',
  borrow_request: 'Permintaan Pinjam',
  borrow_confirm: 'Konfirmasi Pinjam',
  return_request: 'Permintaan Kembali',
  return_confirm: 'Konfirmasi Kembali',
  book_add: 'Tambah Buku',
  book_edit: 'Edit Buku',
  book_delete: 'Hapus Buku',
  stock_update: 'Update Stok',
};

export function ActivityLog({ activities }: ActivityLogProps) {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  // Safety check for activities
  const safeActivities = activities || [];
  
  const sortedActivities = [...safeActivities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <Card className="border-emerald-100/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-100">Log Aktivitas Sistem</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Riwayat aktivitas pengguna dan admin
            </p>
          </div>
          <Badge variant="secondary">
            {safeActivities.length} aktivitas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedActivities.map((activity) => {
              const Icon = actionIcons[activity.action];
              const colorClass = actionColors[activity.action];
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-emerald-800/30 hover:shadow-xl hover:border-emerald-700/50 transition-all"
                >
                  <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs text-gray-100 border-gray-600">
                          {actionLabels[activity.action]}
                        </Badge>
                        {activity.userRole === 'admin' && (
                          <Badge variant="default" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-100 mb-1">
                      {activity.description}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      oleh <span className="font-medium text-gray-300">{activity.userName}</span>
                    </p>
                  </div>
                </div>
              );
            })}
            
            {safeActivities.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada aktivitas</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
