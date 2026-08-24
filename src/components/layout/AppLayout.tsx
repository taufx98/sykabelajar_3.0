import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home, Trophy, CalendarCheck, BarChart3, Award, Bell, ShoppingBag,
  User as UserIcon, LogOut, Menu, Search, Sparkles, GraduationCap,
  LogIn, UserPlus, ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, demoCompetitions } from '@/data/demo';
import { RankBadge } from '@/components/ui/Badge';
import { formatShortDate } from '@/lib/utils';

export function AppLayout() {
  const { user, isAuthenticated, isGuest, logout, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = isGuest
    ? [
        { to: '/home', label: 'Beranda', icon: Home },
        { to: '/leaderboard', label: 'Peringkat', icon: BarChart3 },
        { to: '/awards', label: 'Awards', icon: Award },
      ]
    : [
        { to: '/home', label: 'Beranda', icon: Home },
        { to: '/daily-tasks', label: 'Daily Tasks', icon: CalendarCheck },
        { to: '/leaderboard', label: 'Peringkat', icon: BarChart3 },
        { to: '/awards', label: 'Awards', icon: Award },
        { to: '/notifications', label: 'Notifikasi', icon: Bell },
        { to: '/orders', label: 'Pesanan', icon: ShoppingBag },
        { to: '/admin', label: 'Admin', icon: ShieldCheck },
        { to: user ? `/profile/${user.username}` : '/home', label: 'Profil', icon: UserIcon },
      ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to: string) => location.pathname === to || (to !== '/home' && location.pathname.startsWith(to));

  return (
    <div className="min-h-screen mx-auto max-w-[1400px] flex">
      {/* Left sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-[260px] xl:w-[280px] shrink-0 sticky top-0 h-screen border-r border-white/5 px-3 py-4">
        <Link to="/home" className="flex items-center gap-2 px-3 py-2 mb-4">
          <div className="w-9 h-9 rounded-xl gradient-moss flex items-center justify-center shadow-glow">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">sykabelajar</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                  active ? 'bg-moss-500/10 text-moss-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.to === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-err text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {isGuest ? (
          <div className="mt-auto space-y-2">
            <div className="card p-4 bg-moss-500/5 border-moss-500/20">
              <p className="text-sm font-semibold text-white mb-1">Mode Tamu</p>
              <p className="text-xs text-slate-400 mb-3">Daftar untuk ikut lomba, komentar, & klaim poin</p>
              <Link to="/register" className="block"><Button fullWidth size="sm" className="mb-2" icon={<UserPlus size={16} />}>Daftar Gratis</Button></Link>
              <Link to="/login" className="block"><Button fullWidth variant="outline" size="sm" icon={<LogIn size={16} />}>Masuk</Button></Link>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-err/10 hover:text-red-300 transition">
              <LogOut size={18} /> Keluar
            </button>
          </div>
        ) : user ? (
          <div className="mt-auto space-y-3">
            <Link to={`/profile/${user.username}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition">
              <Avatar name={user.displayName} id={user.id} size={40} ring src={user.profilePhoto} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
              </div>
            </Link>
            <div className="card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Poin & Peringkat</span>
                <RankBadge rank={user.rank} size="sm" />
              </div>
              <p className="text-2xl font-bold gradient-text">{user.points.toLocaleString('id-ID')}</p>
              <p className="text-xs text-slate-500">Peringkat #{user.rank} nasional</p>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-err/10 hover:text-red-300 transition">
              <LogOut size={18} /> Keluar
            </button>
          </div>
        ) : null}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-moss flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">sykabelajar</span>
        </Link>
        <div className="flex items-center gap-2">
          {!isGuest && (
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-white/5">
              <Bell size={20} className="text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-err text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
              )}
            </Link>
          )}
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-lg hover:bg-white/5">
            <Menu size={20} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 card rounded-r-2xl rounded-l-none p-4 animate-slide-down flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-white">Menu</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">✕</button>
            </div>
            {isGuest ? (
              <div className="card p-3 mb-3 bg-moss-500/5 border-moss-500/20">
                <p className="text-sm font-semibold text-white mb-2">Mode Tamu</p>
                <Link to="/register" onClick={() => setDrawerOpen(false)}><Button fullWidth size="sm" className="mb-2">Daftar Gratis</Button></Link>
                <Link to="/login" onClick={() => setDrawerOpen(false)}><Button fullWidth variant="outline" size="sm">Masuk</Button></Link>
              </div>
            ) : user && (
              <Link to={`/profile/${user.username}`} onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 p-2 mb-3 rounded-xl hover:bg-white/5">
                <Avatar name={user.displayName} id={user.id} size={40} ring src={user.profilePhoto} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{user.points.toLocaleString('id-ID')} poin · #{user.rank}</p>
                </div>
              </Link>
            )}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${isActive(item.to) ? 'bg-moss-500/10 text-moss-300' : 'text-slate-300 hover:bg-white/5'}`}>
                    <Icon size={18} /> {item.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-err/10 hover:text-red-300">
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 border-x border-white/5 min-h-screen pb-20 md:pb-0 pt-14 md:pt-0">
        <Outlet />
      </main>

      {/* Right sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-[320px] xl:w-[350px] shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-thin px-3 py-4 gap-4">
        <RightSidebar />
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 px-2 py-1.5 flex items-center justify-around">
        {(isGuest
          ? [
              { to: '/home', icon: Home, label: 'Beranda' },
              { to: '/leaderboard', icon: BarChart3, label: 'Peringkat' },
              { to: '/awards', icon: Award, label: 'Awards' },
            ]
          : [
              { to: '/home', icon: Home, label: 'Beranda' },
              { to: '/daily-tasks', icon: CalendarCheck, label: 'Tasks' },
              { to: '/leaderboard', icon: BarChart3, label: 'Peringkat' },
              { to: '/awards', icon: Award, label: 'Awards' },
              { to: user ? `/profile/${user.username}` : '/home', icon: UserIcon, label: 'Profil' },
            ]
        ).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${active ? 'text-moss-400' : 'text-slate-500'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function RightSidebar() {
  const trendingCompetitions = demoCompetitions.filter((c) => c.status === 'open' || c.status === 'in-progress').slice(0, 3);
  const topLeaderboard = [
    { rank: 1, name: 'Mira Cendekia', points: 9100, id: 'u-1' },
    { rank: 2, name: 'Bagaskara Wibawa', points: 8450, id: 'u-2' },
    { rank: 3, name: 'Larasati Ayu', points: 7320, id: 'u-3' },
    { rank: 4, name: 'Dimas Pratama', points: 6810, id: 'u-4' },
    { rank: 5, name: 'Naila Zahra', points: 6200, id: 'u-5' },
  ];

  return (
    <>
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input placeholder="Cari lomba, pengguna..." className="input pl-9 bg-ink-800/50" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-moss-400" />
          <h3 className="font-display font-semibold text-sm text-white">Uji Kompetensi Trending</h3>
        </div>
        <div className="space-y-3">
          {trendingCompetitions.map((c, i) => (
            <Link key={c.id} to={`/lomba/${c.slug}`} className="flex gap-3 group">
              <div className="w-7 text-moss-400 font-bold text-sm shrink-0 pt-0.5">{i + 1}</div>
              <div className="min-w-0">
                <p className="text-sm text-slate-200 group-hover:text-moss-300 transition line-clamp-2 font-medium">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{CATEGORY_LABELS[c.category]} · {c.participants.toLocaleString('id-ID')} peserta</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm text-white">Top 5 Peringkat</h3>
          <Link to="/leaderboard" className="text-xs text-moss-400 hover:underline">Lihat semua</Link>
        </div>
        <div className="space-y-2.5">
          {topLeaderboard.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <RankBadge rank={u.rank} size="sm" />
              <Avatar name={u.name} id={u.id} size={28} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 truncate">{u.name}</p>
              </div>
              <span className="text-xs font-semibold text-moss-300">{u.points.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck size={16} className="text-amber-400" />
          <h3 className="font-display font-semibold text-sm text-white">Deadline Terdekat</h3>
        </div>
        <div className="space-y-2.5">
          {demoCompetitions.filter((c) => c.status === 'open').slice(0, 2).map((c) => (
            <Link key={c.id} to={`/lomba/${c.slug}`} className="block p-2.5 rounded-lg hover:bg-white/5 transition">
              <p className="text-sm text-slate-200 line-clamp-1 font-medium">{c.title}</p>
              <p className="text-xs text-amber-400 mt-1">Daftar sebelum {formatShortDate(c.registrationDeadline)}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-600 px-2 text-center">
        sykabelajar.id © 2026 · Platform Uji Kompetensi Nasional Non-Formal
      </p>
    </>
  );
}
