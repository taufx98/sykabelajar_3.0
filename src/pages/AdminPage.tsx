import { useState } from 'react';
import {
  LayoutDashboard, Trophy, Users, ShoppingBag, FileCheck, Settings,
  Plus, Edit3, Trash2, Check, X, Search, TrendingUp, Clock, Package,
  ShieldCheck, AlertCircle, Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import { demoCompetitions, demoUsers, demoOrders, LEVEL_LABELS, CATEGORY_LABELS } from '@/data/demo';
import { formatShortDate, formatRupiah } from '@/lib/utils';
import type { Competition, OrderStatus, EducationLevel } from '@/types';

type AdminTab = 'dashboard' | 'competitions' | 'users' | 'orders' | 'verifications' | 'settings';

export function AdminPage() {
  const { orders, toast } = useApp();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [competitions, setCompetitions] = useState<Competition[]>([...demoCompetitions]);
  const [orderList, setOrderList] = useState(orders);
  const [users] = useState(demoUsers);
  const [editComp, setEditComp] = useState<Competition | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const stats = {
    totalUsers: users.length,
    totalCompetitions: competitions.length,
    totalOrders: orderList.length,
    pendingOrders: orderList.filter((o) => o.status === 'pending').length,
    totalRevenue: orderList.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    activeCompetitions: competitions.filter((c) => c.status === 'open' || c.status === 'in-progress').length,
  };

  const navItems: { key: AdminTab; label: string; icon: typeof Trophy }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'competitions', label: 'Lomba', icon: Trophy },
    { key: 'verifications', label: 'Verifikasi', icon: FileCheck },
    { key: 'users', label: 'Pengguna', icon: Users },
    { key: 'orders', label: 'Pesanan', icon: ShoppingBag },
    { key: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrderList((prev) => prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
    toast(`Status pesanan diperbarui ke "${status}"`, 'success');
  };

  const deleteCompetition = (id: string) => {
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
    toast('Lomba dihapus', 'success');
  };

  const saveCompetition = (comp: Competition) => {
    if (competitions.some((c) => c.id === comp.id)) {
      setCompetitions((prev) => prev.map((c) => (c.id === comp.id ? comp : c)));
      toast('Lomba diperbarui', 'success');
    } else {
      setCompetitions((prev) => [comp, ...prev]);
      toast('Lomba baru ditambahkan', 'success');
    }
    setEditComp(null);
    setCreateOpen(false);
  };

  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.school || '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingVerifications = users.filter((u) => !u.verified && u.role === 'pelajar').slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-moss-400" />
          <div>
            <h2 className="font-display font-bold text-lg text-white">Panel Admin</h2>
            <p className="text-xs text-slate-500">Kelola lomba, pengguna, pesanan & verifikasi</p>
          </div>
        </div>
        <Badge color="moss">Admin</Badge>
      </div>

      <div className="flex flex-col">
        {/* Side tabs */}
        <div className="w-full shrink-0 border-b border-white/5 p-2 md:p-3 sticky top-[57px] self-start flex items-center gap-1 overflow-x-auto bg-ink-950/95 backdrop-blur-xl z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? 'bg-moss-500/15 text-moss-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 space-y-4">
          {tab === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <StatCard icon={<Users size={20} />} label="Total Pengguna" value={stats.totalUsers.toString()} color="text-sky-400" />
                <StatCard icon={<Trophy size={20} />} label="Lomba Aktif" value={stats.activeCompetitions.toString()} color="text-moss-400" />
                <StatCard icon={<ShoppingBag size={20} />} label="Pesanan Pending" value={stats.pendingOrders.toString()} color="text-amber-400" />
                <StatCard icon={<TrendingUp size={20} />} label="Total Pendapatan" value={formatRupiah(stats.totalRevenue)} color="text-moss-300" />
                <StatCard icon={<Package size={20} />} label="Total Pesanan" value={stats.totalOrders.toString()} color="text-slate-300" />
                <StatCard icon={<Trophy size={20} />} label="Total Lomba" value={stats.totalCompetitions.toString()} color="text-sky-300" />
              </div>

              <Card className="p-4">
                <h3 className="font-display font-semibold text-white mb-3">Pesanan Terbaru</h3>
                <div className="space-y-2">
                  {orderList.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center gap-3 p-2 rounded-lg bg-ink-800/50">
                      <div className="w-8 h-8 rounded-lg bg-moss-500/15 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-moss-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{o.code}</p>
                        <p className="text-xs text-slate-500">{formatShortDate(o.createdAt)}</p>
                      </div>
                      <span className="text-sm font-semibold text-white">{formatRupiah(o.total)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-display font-semibold text-white mb-3">Verifikasi Menunggu</h3>
                {pendingVerifications.length === 0 ? (
                  <p className="text-sm text-slate-500">Tidak ada verifikasi pending</p>
                ) : (
                  <div className="space-y-2">
                    {pendingVerifications.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-ink-800/50">
                        <Avatar name={u.displayName} id={u.id} size={32} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{u.displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{u.school}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => toast(`${u.displayName} diverifikasi`, 'success')} className="w-7 h-7 rounded-lg bg-moss-500/20 text-moss-300 flex items-center justify-center hover:bg-moss-500/30"><Check size={14} /></button>
                          <button onClick={() => toast(`Verifikasi ${u.displayName} ditolak`, 'error')} className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {tab === 'competitions' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-white">Kelola Lomba</h3>
                <Button size="sm" onClick={() => setCreateOpen(true)} icon={<Plus size={14} />}>Tambah Lomba</Button>
              </div>
              <div className="space-y-2">
                {competitions.map((c) => (
                  <Card key={c.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-moss-500/15 flex items-center justify-center shrink-0">
                        <Trophy size={18} className="text-moss-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                        <p className="text-xs text-slate-500 truncate">{CATEGORY_LABELS[c.category]} · {c.participants.toLocaleString('id-ID')} peserta</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge color={c.status === 'open' ? 'moss' : c.status === 'in-progress' ? 'info' : c.status === 'upcoming' ? 'warn' : 'default'}>
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditComp(c)} className="w-8 h-8 rounded-lg bg-ink-700 text-slate-300 flex items-center justify-center hover:bg-ink-600"><Edit3 size={14} /></button>
                        <button onClick={() => deleteCompetition(c.id)} className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center hover:bg-red-500/25"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {tab === 'verifications' && (
            <>
              <h3 className="font-display font-semibold text-white">Verifikasi Twibbon & Akun</h3>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <AlertCircle size={16} />
                  <p className="text-xs">Daftar pengguna yang belum terverifikasi</p>
                </div>
                <div className="space-y-2">
                  {users.filter((u) => !u.verified).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/50">
                      <Avatar name={u.displayName} id={u.id} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{u.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">@{u.username} · {u.school}</p>
                      </div>
                      <Button size="sm" variant="outline" icon={<Eye size={12} />} onClick={() => toast(`Melihat detail ${u.displayName}`, 'info')}>Lihat</Button>
                      <Button size="sm" icon={<Check size={12} />} onClick={() => toast(`${u.displayName} diverifikasi`, 'success')}>Setujui</Button>
                      <button onClick={() => toast(`Verifikasi ${u.displayName} ditolak`, 'error')} className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center hover:bg-red-500/25"><X size={14} /></button>
                    </div>
                  ))}
                  {users.filter((u) => !u.verified).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">Semua pengguna sudah terverifikasi</p>
                  )}
                </div>
              </Card>
            </>
          )}

          {tab === 'users' && (
            <>
              <h3 className="font-display font-semibold text-white">Kelola Pengguna</h3>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, username, sekolah..." className="input pl-9" />
              </div>
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <Card key={u.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.displayName} id={u.id} size={36} src={u.profilePhoto} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                          {u.displayName}
                          {u.verified && <ShieldCheck size={12} className="text-moss-400" />}
                        </p>
                        <p className="text-xs text-slate-500 truncate">@{u.username} · {u.school}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-moss-300">{u.points.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] text-slate-600">poin</p>
                      </div>
                      <Badge color={u.role === 'guru' ? 'info' : 'default'}>{u.role}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {tab === 'orders' && (
            <>
              <h3 className="font-display font-semibold text-white">Kelola Pesanan</h3>
              <div className="space-y-2">
                {orderList.map((o) => (
                  <Card key={o.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{o.code}</p>
                        <p className="text-xs text-slate-500">{formatShortDate(o.createdAt)}</p>
                      </div>
                      <Badge color={o.status === 'pending' ? 'warn' : o.status === 'paid' ? 'info' : o.status === 'shipped' ? 'info' : o.status === 'completed' ? 'moss' : 'err'}>
                        {o.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 mb-2">
                      {o.items.map((item) => (
                        <p key={item.id} className="text-xs text-slate-400">{item.quantity}× {item.itemName}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-sm font-bold text-white">{formatRupiah(o.total)}</span>
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-ink-800 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Dibayar</option>
                        <option value="shipped">Dikirim</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </div>
                  </Card>
                ))}
                {orderList.length === 0 && <p className="text-sm text-slate-500 text-center py-8">Belum ada pesanan</p>}
              </div>
            </>
          )}

          {tab === 'settings' && (
            <>
              <h3 className="font-display font-semibold text-white">Pengaturan</h3>
              <Card className="p-4 space-y-4">
                <div>
                  <label className="label">Nomor WhatsApp Admin</label>
                  <input className="input" defaultValue="6281234567890" />
                </div>
                <div>
                  <label className="label">Harga Sertifikat (Rp)</label>
                  <input className="input" type="number" defaultValue={25000} />
                </div>
                <div>
                  <label className="label">Harga Medali (Rp)</label>
                  <input className="input" type="number" defaultValue={75000} />
                </div>
                <div>
                  <label className="label">Harga Emblem (Rp)</label>
                  <input className="input" type="number" defaultValue={15000} />
                </div>
                <Button onClick={() => toast('Pengaturan disimpan', 'success')}>Simpan Pengaturan</Button>
              </Card>
            </>
          )}
        </div>
      </div>

      {(editComp || createOpen) && (
        <CompetitionEditor
          competition={editComp}
          onClose={() => { setEditComp(null); setCreateOpen(false); }}
          onSave={saveCompetition}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </Card>
  );
}

function CompetitionEditor({ competition, onClose, onSave }: {
  competition: Competition | null;
  onClose: () => void;
  onSave: (c: Competition) => void;
}) {
  const isEdit = !!competition;
  const [form, setForm] = useState({
    title: competition?.title || '',
    category: competition?.category || 'mtk',
    shortDesc: competition?.shortDesc || '',
    status: competition?.status || 'upcoming',
    level: competition?.level || 'SD 4–6 s/d SMA 1–3 Sederajat',
    startDate: competition?.startDate || '',
    endDate: competition?.endDate || '',
    registrationDeadline: competition?.registrationDeadline || '',
    points: competition?.points || 100,
  });

  const handleSave = () => {
    if (!form.title.trim()) return;
    const comp: Competition = {
      id: competition?.id || 'c-' + Math.random().toString(36).slice(2),
      slug: competition?.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title: form.title,
      category: form.category as Competition['category'],
      shortDesc: form.shortDesc,
      description: competition?.description || form.shortDesc,
      juknis: competition?.juknis || '',
      prizes: competition?.prizes || [],
      points: form.points,
      startDate: form.startDate,
      endDate: form.endDate,
      registrationDeadline: form.registrationDeadline,
      status: form.status as Competition['status'],
      participants: competition?.participants || 0,
      level: form.level,
      twibbonUrl: competition?.twibbonUrl || '',
      hasQuestions: competition?.hasQuestions || false,
    };
    onSave(comp);
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Lomba' : 'Tambah Lomba Baru'} size="lg">
      <div className="space-y-3">
        <div>
          <label className="label">Judul Lomba</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Uji Kompetensi..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Kategori</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Competition['category'] })}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Competition['status'] })}>
              <option value="upcoming">Upcoming</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Deskripsi Singkat</label>
          <textarea className="input min-h-[60px]" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
        </div>
        <div>
          <label className="label">Jenjang</label>
          <input className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Mulai</label>
            <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Selesai</label>
            <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Deadline Daftar</label>
            <input className="input" type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Poin Partisipasi</label>
          <input className="input" type="number" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" fullWidth onClick={onClose}>Batal</Button>
          <Button fullWidth onClick={handleSave}>{isEdit ? 'Simpan' : 'Tambah'}</Button>
        </div>
      </div>
    </Modal>
  );
}
