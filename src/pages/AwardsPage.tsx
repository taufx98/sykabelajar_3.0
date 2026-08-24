import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, Share2, Calendar, Filter, Printer, QrCode, ShieldCheck, Award as AwardIcon, Medal, BadgeCheck, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import { demoAwards } from '@/data/demo';
import { formatShortDate } from '@/lib/utils';
import type { Award, AwardType } from '@/types';

export function AwardsPage() {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | AwardType>('all');
  const [sort, setSort] = useState<'date' | 'type'>('date');
  const [viewAward, setViewAward] = useState<Award | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  let awards = [...demoAwards];
  if (filter !== 'all') awards = awards.filter((a) => a.type === filter);
  if (sort === 'date') awards.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (sort === 'type') awards.sort((a, b) => a.type.localeCompare(b.type));

  const typeIcons: Record<AwardType, React.ReactNode> = {
    certificate: <AwardIcon size={20} className="text-white/90" />,
    medal: <Medal size={20} className="text-white/90" />,
    badge: <BadgeCheck size={20} className="text-white/90" />,
  };

  const handleCetak = (award: Award) => {
    const itemCategory = award.type === 'medal' ? 'medali' : 'sertifikat';
    navigate('/orders', { state: { prefill: { category: itemCategory, itemName: award.title } } });
  };

  const handleShare = (award: Award) => {
    const code = award.certificateId || 'SBJ-' + award.id.toUpperCase();
    const link = `${window.location.origin}/verify/${code}`;
    setShareLink(link);
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard?.writeText(shareLink);
      toast('Link verifikasi disalin', 'success');
      setShareLink(null);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-moss-400" />
          <h2 className="font-display font-bold text-lg text-white">Awards Saya</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Pribadi — hanya kamu yang bisa melihat detail</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="card p-3 flex items-center gap-3 bg-moss-500/5 border-moss-500/20">
          <ShieldCheck size={20} className="text-moss-400 shrink-0" />
          <p className="text-xs text-slate-300">Awards kamu bersifat pribadi. Orang lain hanya bisa melihat melalui link verifikasi khusus (scan barcode), dan hanya bisa melihat — tidak bisa mengunduh.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['all', 'certificate', 'medal', 'badge'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${filter === f ? 'bg-moss-500/15 text-moss-300' : 'bg-ink-800 text-slate-400 hover:text-slate-200'}`}
            >
              {f === 'all' ? 'Semua' : f === 'certificate' ? 'Sertifikat' : f === 'medal' ? 'Medali' : 'Badge'}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <Filter size={14} className="text-slate-500" />
            <select value={sort} onChange={(e) => setSort(e.target.value as 'date' | 'type')} className="bg-ink-800 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none">
              <option value="date">Terbaru</option>
              <option value="type">Tipe</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {awards.map((award) => (
            <Card key={award.id} hover className="p-0 overflow-hidden group">
              <div className={`h-32 bg-gradient-to-br ${award.color} flex items-center justify-center relative`}>
                {typeIcons[award.type]}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                {award.type === 'certificate' && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/90 rounded p-1.5 text-center">
                      <p className="text-[8px] font-bold text-ink-900 uppercase tracking-wide">Sertifikat</p>
                      <p className="text-[7px] text-ink-700 truncate">{award.title}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-white line-clamp-1">{award.title}</p>
                <p className="text-xs text-slate-500 line-clamp-1 mb-1">{award.subtitle}</p>
                <p className="text-[10px] text-slate-600 mb-2 flex items-center gap-1"><Calendar size={10} /> {formatShortDate(award.date)}</p>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setViewAward(award)} icon={<Eye size={12} />}>Lihat</Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleCetak(award)} icon={<Printer size={12} />}>Cetak</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {viewAward && (
        <Modal open onClose={() => setViewAward(null)} title={viewAward.title} size="xl">
          <CertificateView award={viewAward} onShare={() => handleShare(viewAward)} />
        </Modal>
      )}

      {shareLink && (
        <Modal open onClose={() => setShareLink(null)} title="Link Verifikasi Publik" size="sm">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                <QrCode size={80} className="text-ink-900" />
              </div>
            </div>
            <p className="text-xs text-slate-400">Bagikan link ini untuk verifikasi publik. Penerima hanya bisa melihat, tidak bisa mengunduh.</p>
            <div className="bg-ink-800/50 rounded-xl p-3 text-left">
              <p className="text-xs text-moss-300 font-mono break-all">{shareLink}</p>
            </div>
            <Button fullWidth onClick={copyLink}>Salin Link</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CertificateView({ award, onShare }: { award: Award; onShare: () => void }) {
  const cert = award.certificateId;
  return (
    <div>
      <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-moss-500/30 p-6 md:p-10 relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-moss-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-moss-500 blur-3xl" />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-slate-600">
          <Lock size={10} /> Pribadi
        </div>
        <div className="relative text-center flex flex-col items-center justify-center h-full">
          <div className="w-14 h-14 rounded-xl gradient-moss flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <p className="text-xs text-moss-400 uppercase tracking-widest mb-2">Sertifikat Penghargaan</p>
          <p className="text-xs text-slate-500 mb-1">Diberikan kepada</p>
          <p className="font-display font-bold text-xl md:text-2xl text-white mb-3">Aruna Putra</p>
          <p className="text-sm text-slate-300 max-w-md mb-4">{award.subtitle}</p>
          {award.points ? <p className="text-sm text-moss-300 font-semibold mb-4">+{award.points} poin</p> : null}
          <div className="flex items-center gap-6 mt-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase">Tanggal</p>
              <p className="text-xs text-white">{formatShortDate(award.date)}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase">Kode</p>
              <p className="text-xs text-moss-300 font-mono">{cert || 'SBJ-2026-XXXXXX'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" fullWidth onClick={onShare} icon={<Share2 size={16} />}>Bagikan Link Verifikasi</Button>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-600">
        <Download size={12} className="text-slate-700" />
        <span>Unduhan dinonaktifkan — ini bukti keikutsertaan resmi, hanya untuk dilihat.</span>
      </div>
    </div>
  );
}
