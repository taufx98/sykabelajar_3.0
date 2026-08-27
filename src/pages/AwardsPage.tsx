import { useMemo, useState } from 'react';
import { Calendar, Eye, Filter, Lock, Medal, Award as AwardIcon, BadgeCheck, Printer, Share2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import { formatShortDate } from '@/lib/utils';
import type { Award, AwardType } from '@/types';

export function AwardsPage() {
  const { user, awards, toast } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | AwardType>('all');
  const [sort, setSort] = useState<'date' | 'type'>('date');
  const [viewAward, setViewAward] = useState<Award | null>(null);
  const [shareLink, setShareLink] = useState('');

  const visibleAwards = useMemo(() => {
    const rows = filter === 'all' ? [...awards] : awards.filter((a) => a.type === filter);
    return rows.sort((a, b) => sort === 'type' ? a.type.localeCompare(b.type) : new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [awards, filter, sort]);

  const share = (award: Award) => {
    const code = award.certificateId;
    if (!code) {
      toast('Award ini belum memiliki kode sertifikat/verifikasi.', 'info');
      return;
    }
    setShareLink(`${window.location.origin}/#/verify/${encodeURIComponent(code)}`);
  };

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2"><Lock size={16} className="text-moss-400"/><h2 className="font-display font-bold text-lg text-white">Awards Saya</h2></div>
        <p className="text-xs text-slate-500 mt-0.5">Data pribadi dari backend.</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['all','certificate','medal','badge'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filter===f?'bg-moss-500/15 text-moss-300':'bg-ink-800 text-slate-400'}`}>{f==='all'?'Semua':f==='certificate'?'Sertifikat':f==='medal'?'Medali':'Badge'}</button>)}
          <div className="ml-auto flex items-center gap-1"><Filter size={14} className="text-slate-500"/><select value={sort} onChange={(e)=>setSort(e.target.value as 'date'|'type')} className="bg-ink-800 text-xs text-slate-300 rounded-lg px-2 py-1.5"><option value="date">Terbaru</option><option value="type">Tipe</option></select></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {visibleAwards.map((award)=><Card key={award.id} className="overflow-hidden"><div className="h-28 bg-gradient-to-br from-ink-800 to-ink-900 flex items-center justify-center"><AwardIcon size={28} className="text-moss-400"/></div><div className="p-3"><p className="text-sm font-semibold text-white truncate">{award.title}</p><p className="text-xs text-slate-500 truncate">{award.subtitle}</p><p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1"><Calendar size={10}/>{formatShortDate(award.date)}</p><div className="flex gap-1.5 mt-3"><Button size="sm" variant="outline" className="flex-1" onClick={()=>setViewAward(award)} icon={<Eye size={12}/>}>Lihat</Button><Button size="sm" variant="ghost" onClick={()=>share(award)} icon={<Share2 size={12}/>}>Bagikan</Button>{(award.type==='medal'||award.type==='certificate')&&<Button size="sm" variant="ghost" onClick={()=>navigate('/orders',{state:{prefill:{category:award.type==='medal'?'medali':'sertifikat',itemName:award.title}}})} icon={<Printer size={12}/>}>Cetak</Button>}</div></div></Card>)}
          {!visibleAwards.length&&<Card className="p-8 text-center text-sm text-slate-500 col-span-full">Belum ada award pada akun ini.</Card>}
        </div>
      </div>
      {viewAward&&<Modal open onClose={()=>setViewAward(null)} title={viewAward.title} size="xl"><div className="space-y-4"><div className="aspect-[4/3] rounded-xl border border-moss-500/20 bg-gradient-to-br from-ink-800 to-ink-950 p-8 flex flex-col items-center justify-center text-center"><ShieldCheck size={42} className="text-moss-400 mb-4"/><p className="text-xs uppercase tracking-widest text-moss-400">Sertifikat Penghargaan</p><p className="text-xs text-slate-500 mt-4">Diberikan kepada</p><p className="font-display text-2xl font-bold text-white mt-1">{user?.displayName || 'Pengguna'}</p><p className="text-sm text-slate-300 mt-3">{viewAward.subtitle}</p>{viewAward.points ? <p className="text-sm text-moss-300 font-semibold mt-2">+{viewAward.points} poin</p> : null}<div className="flex items-center gap-6 mt-6"><div><p className="text-[10px] text-slate-500">Tanggal</p><p className="text-xs text-white">{formatShortDate(viewAward.date)}</p></div><div className="w-px h-8 bg-white/10"/><div><p className="text-[10px] text-slate-500">Kode</p><p className="text-xs text-moss-300 font-mono">{viewAward.certificateId || 'Belum tersedia'}</p></div></div></div><Button fullWidth variant="outline" onClick={()=>share(viewAward)} icon={<Share2 size={15}/>}>Bagikan Link Verifikasi</Button></div></Modal>}
      {shareLink&&<Modal open onClose={()=>setShareLink('')} title="Link Verifikasi"><div className="space-y-4"><div className="p-3 rounded-xl bg-ink-800 text-xs text-moss-300 font-mono break-all">{shareLink}</div><Button fullWidth onClick={()=>{void navigator.clipboard?.writeText(shareLink);toast('Link verifikasi disalin.','success');setShareLink('')}}>Salin Link</Button></div></Modal>}
    </div>
  );
}
