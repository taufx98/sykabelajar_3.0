import { useEffect, useState } from 'react';
import { ExternalLink, ImagePlus, RefreshCw, Upload } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/services/cloudinary.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/AppContext';

export function TwibbonPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, toast } = useApp();
  const [templates, setTemplates] = useState<any[]>([]);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [postUrl, setPostUrl] = useState('');

  const load = async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    const [{ data: t }, { data: r }] = await Promise.all([
      supabase.from('twibbon_templates').select('*').eq('competition_id', id).eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('registrations').select('*').eq('competition_id', id).eq('user_id', user.id).maybeSingle(),
    ]);
    setTemplates(t ?? []); setRegistration(r); setPostUrl(r?.social_proof_url ?? ''); setLoading(false);
  };
  useEffect(() => { void load(); }, [id, user?.id]);

  const uploadProof = async (file: File) => {
    if (!registration) { toast('Belum ada pendaftaran untuk lomba ini.', 'error'); return; }
    setBusy(true);
    try {
      const result = await uploadImage(file, `sykabelajar/twibbon/${id}/${user?.id}`);
      const { error } = await supabase.from('registrations').update({ twibbon_asset_url: result.secure_url, twibbon_public_id: result.public_id, updated_at: new Date().toISOString() }).eq('id', registration.id).eq('user_id', user!.id);
      if (error) throw error;
      setRegistration({ ...registration, twibbon_asset_url: result.secure_url, twibbon_public_id: result.public_id });
      toast('Bukti twibbon berhasil diunggah ke Cloudinary.', 'success');
    } catch (e: any) { toast(e?.message ?? 'Upload gagal.', 'error'); }
    finally { setBusy(false); }
  };

  const savePost = async () => {
    if (!registration || !postUrl.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('registrations').update({ social_proof_url: postUrl.trim(), submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', registration.id).eq('user_id', user!.id);
    setBusy(false);
    if (error) toast(error.message, 'error'); else { toast('Bukti posting tersimpan.', 'success'); await load(); }
  };

  if (!user) return <div className="p-8 text-center">Silakan login terlebih dahulu.</div>;
  return <div className="min-h-screen bg-ink-950 p-5 md:p-8 text-slate-200"><div className="max-w-5xl mx-auto space-y-5">
    <div className="flex items-center justify-between"><div><p className="text-xs text-moss-400 uppercase">Twibbon</p><h1 className="font-display text-2xl font-bold text-white">Bukti Twibbon & Social Proof</h1></div><Button variant="outline" onClick={()=>void load()} loading={loading} icon={<RefreshCw size={15}/>}>Refresh</Button></div>
    {!registration && !loading && <Card className="p-6"><p className="text-sm text-slate-400">Pendaftaran untuk lomba ini belum ditemukan pada akunmu.</p><Button className="mt-4" onClick={()=>navigate(-1)}>Kembali</Button></Card>}
    {registration && <>
      <Card className="p-5"><div className="flex items-start gap-3"><ImagePlus className="text-moss-400"/><div className="flex-1"><h2 className="font-semibold text-white">Template Twibbon</h2><p className="text-xs text-slate-500 mt-1">Template aktif dari penyelenggara, langsung dari Supabase.</p></div></div><div className="grid sm:grid-cols-2 gap-3 mt-4">{templates.map(t=><a key={t.id} href={t.image_url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-white/10 bg-white/[.03] hover:border-moss-500/40"><img src={t.image_url} alt={t.name} className="w-full aspect-square object-cover"/><div className="p-3 flex items-center justify-between"><span className="text-sm text-white">{t.name}</span><ExternalLink size={15} className="text-slate-500"/></div></a>)}{!templates.length&&<p className="text-sm text-slate-500">Belum ada template twibbon aktif.</p>}</div></Card>
      <Card className="p-5"><h2 className="font-semibold text-white">Upload hasil twibbon</h2><p className="text-xs text-slate-500 mt-1">Foto akan diunggah ke Cloudinary lalu URL-nya disimpan di registrasi Supabase.</p><div className="mt-4 flex flex-wrap gap-3"><label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-moss-600 text-white text-sm cursor-pointer"><Upload size={16}/><span>Pilih foto</span><input type="file" accept="image/*" className="hidden" disabled={busy} onChange={e=>e.target.files?.[0]&&void uploadProof(e.target.files[0])}/></label>{registration.twibbon_asset_url&&<a href={registration.twibbon_asset_url} target="_blank" rel="noreferrer" className="text-sm text-moss-300 inline-flex items-center gap-2">Lihat bukti <ExternalLink size={14}/></a>}</div>{registration.twibbon_asset_url&&<img src={registration.twibbon_asset_url} alt="Bukti twibbon" className="mt-4 max-w-sm rounded-xl border border-white/10"/>}</Card>
      <Card className="p-5"><h2 className="font-semibold text-white">Social proof</h2><p className="text-xs text-slate-500 mt-1">Tempel URL posting Instagram/TikTok yang diwajibkan lomba.</p><div className="flex gap-2 mt-4"><input className="input flex-1" value={postUrl} onChange={e=>setPostUrl(e.target.value)} placeholder="https://..."/><Button loading={busy} onClick={()=>void savePost()}>Simpan</Button></div></Card>
    </>}
  </div></div>;
}
