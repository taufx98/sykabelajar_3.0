import { useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, Users, Calendar, Clock, Award,
  Check, Download, Image as ImageIcon, Instagram,
  ExternalLink, Sparkles, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CommentsSection } from '@/components/ui/Comments';
import { EmblemBadge, EmblemPopup } from '@/components/ui/Emblem';
import { useApp } from '@/store/AppContext';
import { demoCompetitions, CATEGORY_LABELS, demoFeed, getEmblem } from '@/data/demo';
import { formatShortDate, countdown } from '@/lib/utils';
import { fireConfetti } from '@/components/ui/Confetti';
import { submitRegistration } from '@/services/registration.service';
import type { Emblem } from '@/types';

export function CompetitionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, toast, addNotification, feed, isGuest } = useApp();
  const competition = demoCompetitions.find((c) => c.slug === slug);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [juknisOpen, setJuknisOpen] = useState(false);
  const [popupEmblem, setPopupEmblem] = useState<Emblem | null>(null);

  if (!competition) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Uji kompetensi tidak ditemukan.</p>
        <Link to="/home"><Button variant="ghost" className="mt-4">Kembali ke beranda</Button></Link>
      </div>
    );
  }

  const cd = countdown(competition.registrationDeadline);
  const statusLabels = {
    upcoming: { label: 'Segera Buka', color: 'info' as const },
    open: { label: 'Pendaftaran Dibuka', color: 'moss' as const },
    'in-progress': { label: 'Sedang Berlangsung', color: 'warn' as const },
    completed: { label: 'Selesai', color: 'default' as const },
  };
  const status = statusLabels[competition.status];
  const postComments = feed.find((p) => p.competitionId === competition.id)?.comments || [];

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={20} className="text-slate-300" /></button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-sm text-white truncate">{competition.title}</h2>
          <p className="text-xs text-slate-500">{competition.participants.toLocaleString('id-ID')} peserta</p>
        </div>
      </div>

      <div className="relative h-56 md:h-72 bg-ink-800">
        <img src={competition.posterUrl} alt={competition.title} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2"><Badge color={status.color}>{status.label}</Badge><Badge>{CATEGORY_LABELS[competition.category]}</Badge></div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">{competition.title}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center"><Users size={18} className="text-moss-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{competition.participants.toLocaleString('id-ID')}</p><p className="text-[11px] text-slate-500">Peserta</p></Card>
          <Card className="p-3 text-center"><Trophy size={18} className="text-amber-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">+{competition.points}</p><p className="text-[11px] text-slate-500">Poin</p></Card>
          <Card className="p-3 text-center"><Calendar size={18} className="text-sky-400 mx-auto mb-1" /><p className="text-sm font-bold text-white">{cd.days}</p><p className="text-[11px] text-slate-500">Hari lagi</p></Card>
        </div>

        {competition.status === 'open' && !cd.expired && (
          <Card className="p-4 bg-gradient-to-r from-moss-500/10 to-transparent">
            <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-moss-400" /><p className="text-sm font-semibold text-white">Pendaftaran ditutup dalam</p></div>
            <div className="grid grid-cols-4 gap-2">{[
              { v: cd.days, l: 'Hari' }, { v: cd.hours, l: 'Jam' }, { v: cd.minutes, l: 'Menit' }, { v: cd.seconds, l: 'Detik' },
            ].map((t) => <div key={t.l} className="text-center"><div className="bg-ink-800/60 rounded-lg py-2"><span className="text-xl font-bold text-moss-300 tabular-nums">{String(t.v).padStart(2, '0')}</span></div><p className="text-[10px] text-slate-500 mt-1">{t.l}</p></div>)}</div>
          </Card>
        )}

        <Card className="p-4"><h3 className="font-display font-semibold text-white mb-2">Tentang Uji Kompetensi</h3><p className="text-sm text-slate-300 leading-relaxed">{competition.description}</p></Card>

        <div className="flex gap-2">
          {competition.status === 'open' && <Button fullWidth size="lg" disabled={isGuest || !user} onClick={() => setRegisterOpen(true)} icon={<Trophy size={18} />}>{isGuest ? 'Masuk untuk Daftar' : 'Daftar Sekarang'}</Button>}
          {competition.status === 'in-progress' && competition.hasQuestions && <Button fullWidth size="lg" disabled={isGuest} onClick={() => navigate(`/lomba/${competition.slug}/kerja`)} icon={<Trophy size={18} />}>Kerjakan Uji Kompetensi</Button>}
          {competition.status === 'upcoming' && <Button fullWidth size="lg" disabled icon={<Clock size={18} />}>Belum Dibuka</Button>}
          <Button variant="outline" size="lg" onClick={() => setJuknisOpen(true)} icon={<FileText size={18} />}>Juknis</Button>
        </div>

        <Card className="p-4"><h3 className="font-display font-semibold text-white mb-3">Timeline</h3><div className="space-y-3">{[
          { label: 'Pendaftaran dibuka', date: formatShortDate(competition.startDate), done: competition.status !== 'upcoming' },
          { label: 'Batas pendaftaran', date: formatShortDate(competition.registrationDeadline), done: false, active: competition.status === 'open' },
          { label: 'Uji kompetensi dimulai', date: formatShortDate(competition.startDate), done: false },
          { label: 'Uji kompetensi selesai', date: formatShortDate(competition.endDate), done: false },
          { label: 'Pengumuman', date: formatShortDate(competition.endDate), done: false },
        ].map((t, i) => <div key={i} className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${t.done ? 'bg-moss-500' : t.active ? 'bg-amber-400 animate-pulse' : 'bg-ink-600'}`} /><div className="flex-1"><p className={`text-sm ${t.done ? 'text-slate-400' : 'text-white'}`}>{t.label}</p></div><span className="text-xs text-slate-500">{t.date}</span></div>)}</div></Card>

        <Card className="p-4"><h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2"><Award size={16} className="text-amber-400" /> Hadiah & Poin</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500 border-b border-white/5"><th className="pb-2 pr-2 font-medium">No</th><th className="pb-2 pr-2 font-medium">Detail</th><th className="pb-2 pr-2 font-medium">Emblem</th><th className="pb-2 font-medium text-right">Poin</th></tr></thead><tbody>{competition.prizes.map((p, i) => <tr key={i} className="border-b border-white/5 last:border-0"><td className="py-3 pr-2"><span className={`font-bold ${i === 0 ? 'text-amber-400' : 'text-slate-300'}`}>{p.position}</span></td><td className="py-3 pr-2 text-slate-300">{p.detail}</td><td className="py-3 pr-2">{p.emblems.length > 0 ? <div className="flex gap-1.5">{p.emblems.map((eid) => { const emblem = getEmblem(eid); return emblem ? <EmblemBadge key={eid} emblemId={eid} size={24} onClick={() => setPopupEmblem(emblem)} /> : null; })}</div> : <span className="text-xs text-slate-600">—</span>}</td><td className="py-3 text-right font-semibold text-moss-300">+{p.points}</td></tr>)}</tbody></table></div></Card>

        <Card className="p-4 bg-moss-500/5 border-moss-500/20"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-moss-500/20 flex items-center justify-center shrink-0"><Sparkles size={18} className="text-moss-400" /></div><div><p className="text-sm font-semibold text-white">Twibbon Wajib</p><p className="text-xs text-slate-400 mt-1">Semua peserta wajib memasang twibbon, posting ke Instagram/TikTok, dan menyertakan bukti link postingan saat mendaftar.</p></div></div></Card>

        <Card className="p-4"><CommentsSection postId={feed.find((p) => p.competitionId === competition.id)?.id || 'f-0'} comments={postComments} /></Card>
      </div>

      <Modal open={juknisOpen} onClose={() => setJuknisOpen(false)} title="Juknis — Petunjuk Teknis" size="xl">
        <div className="space-y-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" icon={<Download size={14} />} onClick={() => competition.juknisPdfUrl && window.open(competition.juknisPdfUrl, '_blank')}>Download PDF</Button></div><div className="rounded-xl overflow-hidden bg-white" style={{ height: '60vh' }}><iframe src={competition.juknisPdfUrl} title="Juknis PDF" className="w-full h-full border-0" /></div><div className="bg-ink-800/50 rounded-xl p-3"><p className="text-xs text-slate-400 whitespace-pre-wrap font-sans">{competition.juknis}</p></div></div>
      </Modal>

      <TwibbonRegistrationModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        competition={competition}
        userId={user?.id}
        onComplete={(created) => {
          setRegisterOpen(false);
          fireConfetti();
          toast(created ? 'Pendaftaran tersimpan. Status: Pending (menunggu acc admin).' : 'Kamu sudah pernah mendaftar untuk uji kompetensi ini.', 'success');
          void addNotification({
            type: 'twibbon-verified',
            title: created ? 'Pendaftaran Diterima' : 'Pendaftaran Sudah Ada',
            body: created ? `Pendaftaranmu di ${competition.title} sedang diverifikasi admin.` : `Kamu sudah memiliki pendaftaran di ${competition.title}.`,
            link: `/lomba/${competition.slug}`,
            icon: 'clock',
          });
        }}
      />

      <EmblemPopup emblem={popupEmblem} onClose={() => setPopupEmblem(null)} />
    </div>
  );
}

function TwibbonRegistrationModal({ open, onClose, competition, userId, onComplete }: {
  open: boolean;
  onClose: () => void;
  competition: typeof demoCompetitions[0];
  userId?: string;
  onComplete: (created: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [composited, setComposited] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [username, setUsername] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setStep(1); setPhoto(null); setComposited(null); setUsername(''); setPostUrl(''); };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); window.setTimeout(() => composite(reader.result as string), 0); };
    reader.readAsDataURL(file);
  };

  const composite = useCallback((photoSrc: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 800; canvas.height = 800;
    const photoImg = new Image();
    photoImg.onload = () => {
      const scale = Math.max(canvas.width / photoImg.width, canvas.height / photoImg.height);
      const w = photoImg.width * scale; const h = photoImg.height * scale;
      ctx.drawImage(photoImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      const twibbonImg = new Image();
      twibbonImg.crossOrigin = 'anonymous';
      twibbonImg.onload = () => {
        ctx.drawImage(twibbonImg, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(7,11,20,0.7)'; ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
        ctx.fillStyle = '#34d399'; ctx.font = 'bold 28px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('sykabelajar.id', canvas.width / 2, canvas.height - 70);
        ctx.fillStyle = '#fff'; ctx.font = '16px Inter, sans-serif'; ctx.fillText(competition.title.slice(0, 40), canvas.width / 2, canvas.height - 40);
        setComposited(canvas.toDataURL('image/jpeg', 0.9)); setStep(2);
      };
      twibbonImg.onerror = () => { setComposited(canvas.toDataURL('image/jpeg', 0.9)); setStep(2); };
      twibbonImg.src = competition.twibbonUrl || competition.posterUrl || '';
    };
    photoImg.src = photoSrc;
  }, [competition]);

  const download = () => {
    if (!composited) return;
    const a = document.createElement('a'); a.href = composited; a.download = `twibbon-${competition.slug}.jpg`; a.click();
  };

  const handleSubmit = async () => {
    if (!userId) { throw new Error('Sesi login tidak ditemukan. Silakan masuk kembali.'); }
    if (!username.trim() || !postUrl.trim()) return;
    setSubmitting(true);
    try {
      const existing = await submitRegistration({ competitionId: competition.id, userId, socialPlatform: platform, socialUsername: username, socialProofUrl: postUrl });
      reset();
      onComplete(existing.id === undefined ? true : false);
    } catch (error: any) {
      console.error('[SykaBelajar] registration submit failed', error);
      alert(error?.message ?? 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title="Daftar Uji Kompetensi" size="lg">
      <div className="flex items-center gap-2 mb-5">{['Foto', 'Posting', 'Bukti'].map((s, i) => <div key={s} className="flex items-center gap-2 flex-1"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-moss-500 text-white' : step === i + 1 ? 'bg-moss-500/20 text-moss-300 border border-moss-500/40' : 'bg-ink-700 text-slate-500'}`}>{step > i + 1 ? <Check size={12} /> : i + 1}</div><span className={`text-xs ${step >= i + 1 ? 'text-slate-200' : 'text-slate-500'}`}>{s}</span>{i < 2 && <div className="flex-1 h-px bg-white/10" />}</div>)}</div>
      <canvas ref={canvasRef} className="hidden" />

      {step === 1 && <div className="space-y-4"><div className="card p-4 bg-moss-500/5 border-moss-500/20"><p className="text-sm text-slate-300"><span className="font-semibold text-moss-300">Langkah 1:</span> Upload fotomu, sistem akan menggabungkannya dengan template twibbon.</p></div>{!photo ? <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-white/10 rounded-xl py-12 flex flex-col items-center gap-3 hover:border-moss-500/40 hover:bg-moss-500/5 transition"><ImageIcon size={32} className="text-slate-500" /><p className="text-sm text-slate-400">Klik untuk upload foto</p><p className="text-xs text-slate-600">JPG/PNG, maks 5MB</p></button> : <div className="rounded-xl overflow-hidden"><img src={photo} alt="Foto" className="w-full max-h-80 object-contain bg-ink-800" /></div>}<input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />{photo && !composited && <p className="text-xs text-slate-500 text-center">Memproses komposit...</p>}{composited && <div className="space-y-3"><div className="rounded-xl overflow-hidden"><img src={composited} alt="Twibbon result" className="w-full max-h-80 object-contain bg-ink-800" /></div><Button fullWidth onClick={() => setStep(2)} icon={<Check size={18} />}>Lanjut ke Posting</Button></div>}</div>}

      {step === 2 && <div className="space-y-4">{composited && <div className="rounded-xl overflow-hidden mb-2"><img src={composited} alt="Twibbon" className="w-full max-h-64 object-contain bg-ink-800" /></div>}<div className="card p-4 bg-moss-500/5 border-moss-500/20"><p className="text-sm text-slate-300"><span className="font-semibold text-moss-300">Langkah 2:</span> Download hasil twibbon, lalu posting ke Instagram atau TikTok.</p></div><Button fullWidth onClick={download} icon={<Download size={18} />}>Download Hasil Twibbon (JPG)</Button><div className="flex gap-2"><Button variant="outline" fullWidth onClick={() => setStep(1)}>Kembali</Button><Button fullWidth onClick={() => setStep(3)}>Sudah Diposting</Button></div></div>}

      {step === 3 && <div className="space-y-4"><div className="card p-4 bg-moss-500/5 border-moss-500/20"><p className="text-sm text-slate-300"><span className="font-semibold text-moss-300">Langkah 3:</span> Masukkan username dan link postingan sebagai bukti.</p></div><div><label className="label">Platform</label><div className="grid grid-cols-2 gap-2">{(['instagram', 'tiktok'] as const).map((p) => <button key={p} onClick={() => setPlatform(p)} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition ${platform === p ? 'border-moss-500 bg-moss-500/10 text-moss-300' : 'border-white/10 text-slate-400'}`}>{p === 'instagram' ? <Instagram size={18} /> : <ExternalLink size={18} />}<span className="text-sm font-medium capitalize">{p}</span></button>)}</div></div><div><label className="label">Username {platform === 'instagram' ? 'Instagram' : 'TikTok'}</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span><input className="input pl-7" placeholder="username kamu" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} /></div></div><div><label className="label">Link Postingan</label><input className="input" placeholder="https://instagram.com/p/..." value={postUrl} onChange={(e) => setPostUrl(e.target.value)} /></div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Kembali</Button><Button fullWidth loading={submitting} disabled={!username || !postUrl || !userId} onClick={() => void handleSubmit()}>Kirim Pendaftaran</Button></div><p className="text-xs text-slate-500 text-center">Setelah dikirim, status pendaftaran: <span className="text-amber-400 font-medium">Pending</span> (menunggu acc admin)</p></div>}
    </Modal>
  );
}
