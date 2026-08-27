import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User as UserIcon, School, GraduationCap, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmblemIcon } from '@/components/ui/Emblem';
import { useApp } from '@/store/AppContext';
import { LEVEL_LABELS, CATEGORY_LABELS } from '@/data/catalog';
import { uploadImage } from '@/services/cloudinary.service';
import type { EducationLevel, CompetitionCategory } from '@/types';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, toast } = useApp();
  const [form, setForm] = useState({
    displayName: user?.displayName || '', username: user?.username || '', bio: user?.bio || '',
    school: user?.school || '', birthDate: user?.birthDate || '',
    educationLevel: (user?.educationLevel || '') as EducationLevel | '',
    profilePhoto: user?.profilePhoto || user?.avatarUrl || '', coverPhoto: user?.coverPhoto || '',
    favoriteCategories: (user?.favoriteCategories || []) as CompetitionCategory[],
    showcaseEmblems: (user?.showcaseEmblems || user?.emblems?.slice(0, 3).map((e) => e.id) || []) as string[],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'profile' | 'cover' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null); const coverRef = useRef<HTMLInputElement>(null);
  if (!user) return null;
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCat = (cat: CompetitionCategory) => setForm((f) => ({ ...f, favoriteCategories: f.favoriteCategories.includes(cat) ? f.favoriteCategories.filter((c) => c !== cat) : [...f.favoriteCategories, cat] }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'profile' | 'cover') => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { toast('File harus berupa gambar', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('Ukuran foto maksimal 5MB', 'error'); return; }
    setUploading(kind);
    try {
      const result = await uploadImage(file, `sykabelajar/${kind}/${user.id}`);
      set(kind === 'profile' ? 'profilePhoto' : 'coverPhoto', result.secure_url);
      toast(kind === 'profile' ? 'Foto profil berhasil diunggah.' : 'Foto sampul berhasil diunggah.', 'success');
    } catch (error: any) { toast(error?.message || 'Upload gagal.', 'error'); }
    finally { setUploading(null); e.target.value = ''; }
  };

  const handleSave = async () => {
    if (!form.displayName || !form.username) { toast('Nama dan username wajib diisi', 'error'); return; }
    setSaving(true);
    try {
      await updateProfile({ displayName: form.displayName, username: form.username, bio: form.bio, school: form.school, birthDate: form.birthDate, educationLevel: form.educationLevel || undefined, profilePhoto: form.profilePhoto || undefined, coverPhoto: form.coverPhoto || undefined, favoriteCategories: form.favoriteCategories, showcaseEmblems: form.showcaseEmblems });
      toast('Profil berhasil diperbarui!', 'success'); navigate(`/profile/${form.username}`);
    } catch (error: any) { toast(error?.message || 'Profil gagal diperbarui.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center gap-3"><button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={20} className="text-slate-300" /></button><h2 className="font-display font-semibold text-sm text-white">Edit Profil</h2></div>
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card className="p-0 overflow-hidden"><div className="relative h-32 bg-gradient-to-br from-ink-700 to-ink-850">{form.coverPhoto && <img src={form.coverPhoto} alt="Cover" className="w-full h-full object-cover" />}<button type="button" disabled={uploading==='cover'} onClick={() => coverRef.current?.click()} className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-black/80 transition"> <Camera size={14} /> {uploading==='cover'?'Mengunggah…':'Ganti Sampul'}</button><input ref={coverRef} type="file" accept="image/*" onChange={(e)=>void handleImage(e,'cover')} className="hidden" /></div></Card>
        <Card className="p-6 text-center"><div className="relative inline-block">{form.profilePhoto?<img src={form.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-2 ring-moss-500/30"/>:<Avatar name={form.displayName} id={user.id} size={80} ring/>}<button type="button" disabled={uploading==='profile'} onClick={()=>fileRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-moss-600 flex items-center justify-center border-2 border-ink-900 hover:bg-moss-500 transition"><Camera size={14} className="text-white"/></button></div><button type="button" onClick={()=>fileRef.current?.click()} className="text-xs text-moss-400 hover:underline mt-3">{uploading==='profile'?'Mengunggah…':form.profilePhoto?'Ganti foto profil':'Upload foto profil'}</button>{form.profilePhoto&&<button type="button" onClick={()=>set('profilePhoto','')} className="text-xs text-red-400 hover:text-red-300 ml-3">Hapus</button>}<input ref={fileRef} type="file" accept="image/*" onChange={(e)=>void handleImage(e,'profile')} className="hidden"/></Card>
        <Card className="p-4 space-y-4"><h3 className="font-display font-semibold text-sm text-white">Informasi Dasar</h3><div><label className="label">Nama Tampilan</label><div className="relative"><UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="input pl-9" value={form.displayName} onChange={(e)=>set('displayName',e.target.value)}/></div></div><div><label className="label">Username</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span><input className="input pl-7" value={form.username} onChange={(e)=>set('username',e.target.value.replace(/\s/g,'').toLowerCase())}/></div></div><div><label className="label">Bio</label><textarea className="input min-h-[80px] resize-y" placeholder="Ceritakan sedikit tentang kamu..." value={form.bio} onChange={(e)=>set('bio',e.target.value)} maxLength={160}/><p className="text-[10px] text-slate-600 mt-1">{form.bio.length}/160</p></div><div><label className="label">Tanggal Lahir</label><div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/><input type="date" className="input pl-9" value={form.birthDate} onChange={(e)=>set('birthDate',e.target.value)} max={new Date().toISOString().slice(0,10)}/></div></div></Card>
        <Card className="p-4 space-y-4"><h3 className="font-display font-semibold text-sm text-white">Pendidikan</h3><div><label className="label">Sekolah / Institusi</label><div className="relative"><School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="input pl-9" value={form.school} onChange={(e)=>set('school',e.target.value)} placeholder="cth. SMP Negeri 1 Bandung"/></div></div>{user.role==='pelajar'&&<div><label className="label">Jenjang Kelas</label><div className="relative"><GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/><select className="input pl-9 appearance-none cursor-pointer" value={form.educationLevel} onChange={(e)=>set('educationLevel',e.target.value as EducationLevel)}><option value="">Pilih jenjang...</option>{(['sd','smp','sma'] as EducationLevel[]).map((lv)=><option key={lv} value={lv}>{LEVEL_LABELS[lv]}</option>)}</select></div></div>}</Card>
        <Card className="p-4 space-y-3"><h3 className="font-display font-semibold text-sm text-white">Kategori Favorit</h3><div className="grid grid-cols-2 gap-2">{Object.entries(CATEGORY_LABELS).map(([key,label])=>{const selected=form.favoriteCategories.includes(key as CompetitionCategory);return <button key={key} onClick={()=>toggleCat(key as CompetitionCategory)} className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${selected?'border-moss-500 bg-moss-500/10 text-moss-300':'border-white/10 text-slate-300 hover:border-white/20'}`}>{label}{selected&&<Check size={16}/>}</button>;})}</div></Card>
        {user.emblems.length>0&&<Card className="p-4 space-y-3"><div><h3 className="font-display font-semibold text-sm text-white">Emblem Showcase</h3><p className="text-xs text-slate-500 mt-0.5">Pilih maksimal 3 emblem yang tampil di samping nama kamu saat berkomentar.</p></div><div className="flex flex-wrap gap-2">{user.emblems.map((emblem)=>{const selected=form.showcaseEmblems.includes(emblem.id);const canSelect=selected||form.showcaseEmblems.length<3;return <button key={emblem.id} onClick={()=>setForm(f=>({...f,showcaseEmblems:selected?f.showcaseEmblems.filter(id=>id!==emblem.id):f.showcaseEmblems.length<3?[...f.showcaseEmblems,emblem.id]:f.showcaseEmblems}))} className={`p-1.5 rounded-xl border transition-all ${selected?'border-moss-500 bg-moss-500/10 ring-1 ring-moss-500/30':canSelect?'border-white/10 hover:border-white/20':'border-white/5 opacity-40'}`} title={emblem.name}><EmblemIcon emblem={emblem} size={28}/></button>;})}</div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="text-moss-400 font-semibold">{form.showcaseEmblems.length}/3</span><span>emblem dipilih</span></div></Card>}
        <div className="flex gap-2 pb-4"><Button variant="outline" fullWidth onClick={()=>navigate(-1)}>Batal</Button><Button fullWidth loading={saving} onClick={()=>void handleSave()}>Simpan Perubahan</Button></div>
      </div>
    </div>
  );
}
