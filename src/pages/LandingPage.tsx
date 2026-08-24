import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Trophy, CalendarCheck, BarChart3, Award,
  ArrowRight, Sparkles, Users, ShieldCheck, Zap, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useApp } from '@/store/AppContext';
import { demoCompetitions, demoUsers, CATEGORY_LABELS } from '@/data/demo';
import { RankBadge } from '@/components/ui/Badge';

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAsGuest, toast } = useApp();
  const featured = demoCompetitions.filter((c) => c.featured);
  const topUsers = demoUsers.filter((u) => u.role === 'pelajar').slice(0, 5);

  const handleGuest = () => {
    loginAsGuest();
    toast('Masuk sebagai tamu. Daftar untuk berinteraksi penuh!', 'info');
    navigate('/home');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-moss flex items-center justify-center shadow-glow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">sykabelajar<span className="text-moss-400">.id</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleGuest} icon={<Eye size={16} />}>Lihat sebagai Tamu</Button>
            <Link to="/login"><Button variant="ghost" size="sm">Masuk</Button></Link>
            <Link to="/register"><Button size="sm">Daftar Gratis</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 chip bg-moss-500/10 text-moss-300 border border-moss-500/20 mb-6">
                <Sparkles size={14} /> Platform Uji Kompetensi Nasional Non-Formal
              </div>
              <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white leading-[1.1] mb-6">
                Belajar Jadi Seru,<br />
                <span className="gradient-text">Uji Kompetensi Setiap Hari</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
                Ikuti uji kompetensi, kerjakan daily tasks, kumpulkan poin, dan naiki papan peringkat. Dapatkan sertifikat yang bisa diverifikasi publik.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register"><Button size="lg" icon={<ArrowRight size={18} />}>Mulai Sekarang — Gratis</Button></Link>
                <Button variant="outline" size="lg" onClick={handleGuest} icon={<Eye size={18} />}>Lihat sebagai Tamu</Button>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div>
                  <p className="text-2xl font-bold text-white">12,000+</p>
                  <p className="text-xs text-slate-500">Peserta Aktif</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">150+</p>
                  <p className="text-xs text-slate-500">Uji Kompetensi</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">8,500+</p>
                  <p className="text-xs text-slate-500">Sertifikat Terbit</p>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in hidden md:block">
              <div className="absolute -inset-4 bg-moss-500/10 blur-3xl rounded-full" />
              <div className="relative card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={18} className="text-moss-400" />
                  <h3 className="font-display font-semibold text-white">Papan Peringkat</h3>
                  <span className="ml-auto chip bg-moss-500/10 text-moss-300 text-[10px]">Live</span>
                </div>
                <div className="space-y-3">
                  {topUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <RankBadge rank={u.rank} size="sm" />
                      <Avatar name={u.displayName} id={u.id} size={32} src={u.profilePhoto} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{u.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{u.school}</p>
                      </div>
                      <span className="text-sm font-semibold text-moss-300">{u.points.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 card p-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Trophy size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Juara 1</p>
                    <p className="text-sm font-semibold text-white">+1,500 poin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">Uji Kompetensi Unggulan</h2>
            <p className="text-slate-400">Mulai perjalananmu dari uji kompetensi pilihan ini</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {featured.map((c) => (
            <Link key={c.id} to="/home" onClick={handleGuest} className="card card-hover p-0 overflow-hidden group">
              <div className="h-40 bg-gradient-to-br from-ink-700 to-ink-850 relative">
                <img src={c.twibbonUrl} alt={c.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
                <div className="absolute top-3 left-3 chip bg-moss-500/20 text-moss-300 border border-moss-500/30">
                  {CATEGORY_LABELS[c.category]}
                </div>
                <div className="absolute top-3 right-3 chip bg-black/40 text-white">
                  <Users size={12} /> {c.participants.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg text-white mb-2 group-hover:text-moss-300 transition">{c.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{c.shortDesc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-moss-300 font-semibold">+{c.points} poin</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">Lihat detail <ArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-white text-center mb-12">Kenapa sykabelajar.id?</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Trophy, title: 'Uji Kompetensi', desc: 'Ratusan uji kompetensi dari Matematika, Sains, Seni, hingga Coding untuk semua jenjang SD–SMA sederajat.' },
            { icon: CalendarCheck, title: 'Daily Tasks', desc: 'Kerjakan quiz harian, jaga streak, dan klaim poin instan setiap hari.' },
            { icon: BarChart3, title: 'Leaderboard Real-time', desc: 'Pantau peringkatmu naik turun secara live. Berlomba dengan ribuan pelajar.' },
            { icon: Award, title: 'Sertifikat & Emblem', desc: 'Dapatkan sertifikat dan emblem yang bisa diverifikasi publik via QR code. Cetak fisik tersedia.' },
            { icon: ShieldCheck, title: 'Verifikasi Publik', desc: 'Setiap sertifikat punya kode unik. Sekolah dan instansi bisa cek keasliannya.' },
            { icon: Zap, title: 'Gamifikasi', desc: 'Badge, emblem, medali, poin, dan streak bikin belajar jadi menyenangkan.' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-6 hover:border-moss-500/20 transition">
                <div className="w-12 h-12 rounded-xl bg-moss-500/10 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-moss-400" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -inset-20 bg-moss-500/5 blur-3xl" />
          <div className="relative">
            <h2 className="font-display font-bold text-2xl md:text-4xl text-white mb-4">Siap Beruji Kompetensi?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">Gabung ribuan pelajar yang sudah mulai perjalanan mereka. Gratis, cukup daftar dengan email.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register"><Button size="lg" icon={<ArrowRight size={18} />}>Daftar Sekarang</Button></Link>
              <Button variant="outline" size="lg" onClick={handleGuest} icon={<Eye size={18} />}>Lihat sebagai Tamu</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-600">
          sykabelajar.id © 2026 — Platform Uji Kompetensi Nasional Non-Formal
        </div>
      </footer>
    </div>
  );
}
