import { Link } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trophy, Play, TrendingUp, Truck,
  Clock, AlertCircle, MoreHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { timeAgo } from '@/lib/utils';
import type { NotificationType } from '@/types';

const ICONS: Record<NotificationType, React.ReactNode> = {
  'competition-start': <Play size={16} className="text-sky-400" />,
  'result-out': <Trophy size={16} className="text-amber-400" />,
  'registration-approved': <Check size={16} className="text-moss-400" />,
  'registration-rejected': <AlertCircle size={16} className="text-red-400" />,
  'order-update': <Truck size={16} className="text-sky-400" />,
  'daily-reminder': <Clock size={16} className="text-amber-400" />,
  'rank-up': <TrendingUp size={16} className="text-moss-400" />,
  'twibbon-verified': <Check size={16} className="text-moss-400" />,
};

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, toast } = useApp();
  const unread = notifications.filter((n) => !n.read);

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Notifikasi</h2>
          <p className="text-xs text-slate-500">{unread.length} belum dibaca</p>
        </div>
        {unread.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => { markAllNotificationsRead(); toast('Semua notifikasi ditandai dibaca', 'info'); }} icon={<CheckCheck size={14} />}>
            Tandai Semua
          </Button>
        )}
      </div>

      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              to={n.link || '#'}
              onClick={() => markNotificationRead(n.id)}
            >
              <Card className={`p-4 flex items-start gap-3 transition cursor-pointer ${!n.read ? 'border-moss-500/20 bg-moss-500/5' : 'opacity-70'}`}>
                <div className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center shrink-0">
                  {ICONS[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-moss-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <button className="p-1 text-slate-600 hover:text-slate-400" onClick={(e) => { e.preventDefault(); markNotificationRead(n.id); }}>
                  {n.read ? <MoreHorizontal size={14} /> : <div className="w-2 h-2 rounded-full bg-moss-400" />}
                </button>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
