import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft, Check, User as UserIcon, School, Building2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useApp } from '@/store/AppContext';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/data/live';
import { uploadImage } from '@/services/cloudinary.service';
import type { Role, EducationLevel, CompetitionCategory } from '@/types';

const ROLE_OPTIONS: { value: Exclude<Role, 'admin'>; label: string; icon: typeof UserIcon }[] = [
  { value: 'pelajar', label: 'Pelajar', icon: UserIcon },
  { value: 'guru', label: 'Guru', icon: School },
  { value: 'penyelenggara', label: 'Penyelenggara', icon: Building2 },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', role: 'pelajar' as Exclude<Role, 'admin'>,
    displayName: '', username: '', birthDate: '', school: '',
    educationLevel: '' as EducationLevel | '', favoriteCategories: [] as CompetitionCategory[],
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggleCategory = (category: CompetitionCategory) => setForm((current) => ({ ...current, favoriteCategories: current.favoriteCategories.includes(category) ? current.favoriteCategories.filter((x) => x !== category) : [...current.favoriteCategories, category] }));
  const step1Valid = form.email.includes('@') && form.password.length >= 6 && form.password === form.confirmPassword;
  const step2Valid = !!form.displayName && !!form.username && !!form.birthDate && !!form.school && (form.role === 'guru' || !!form.educationLevel);

  const selectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { toast('Foto harus gambar dan maksimal 5MB.', 'error'); return; }
    setPhotoFile(file);
  };

  const handleSubmit = async () => {
    if (!form.favoriteCategories.length) { toast('Pilih minimal 1 kategori lomba favorit', 'error'); return; }
    setLoading(true);
    try {
      let profilePhoto: string | undefined;
      if (photoFile) {
        const uploaded = await uploadImage(photoFile, 'sykabelajar/users/profiles');
        profilePhoto = uploaded.secure_url;
      }
      const result = await register({
        email: form.email, password: form.password, displayName: form.displayName, username: form.username,
        role: form.role, school: form.school, birthDate: form.birthDate, educationLevel: form.educationLevel || undefined,
        profilePhoto, favoriteCategories: form.favoriteCategories,
      });
      if (!result.ok) { toast(result.error || 'Pendaftaran gagal', 'error'); return; }
      toast('Pendaftaran berhasil. Silakan masuk dengan role yang sama.', 'success');
      navigate('/login');
    } catch (error: any) {
      toast(error?.message ?? 'Pendaftaran gagal.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 h-16 flex items-center justify-between border-b border-white/5">
        <Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg gradient-moss flex items-center justify-center"><GraduationCap size={16} className="text-white" /></div><span className="font-display font-bold text-white">sykabelajar<span className="text-moss-400">.id</span></span></Link>
        <Link to="/login" className="text-sm text-slate-400 hover:text-white">Sudah punya akun? <span className="text-moss-400">Masuk</span></Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-10"><div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">{[1,2,3].map((s) => <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-ink-700"><div className={`h-full transition-all ${s <= step ? 'gradient-moss w-full' : 'w-0'}`} /></div>)}</div>
        {step === 1 && <div className="card p-6 animate-slide-up"><h1 className="font-display font-bold text-2xl text-white mb-1">Buat Akun</h1><p className="text-sm text-slate-400 mb-6">Mulai perjalananmu di sykabelajar.id</p><div className="space-y-4"><div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="nama@email.com" /></div><div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Minimal 6 karakter" /></div><div><label className="label">Konfirmasi Password</label><input className="input" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Ulangi password" /></div></div><Button fullWidth size="lg" className="mt-6" disabled={!step1Valid} onClick={() => setStep(2)} icon={<ArrowRight size={18} />}>Lanjut</Button></div>}
        {step === 2 && <div className="card p-6 animate-slide-up"><h1 className="font-display font-bold text-2xl text-white mb-1">Tentang Kamu</h1><p className="text-sm text-slate-400 mb-6">Role akan disimpan oleh backend Supabase.</p><div className="space-y-4"><div><label className="label">Saya adalah</label><div className="grid grid-cols-3 gap-2">{ROLE_OPTIONS.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => set('role', value)} className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${form.role === value ? 'border-moss-500 bg-moss-500/10' : 'border-white/10'}`}><Icon size={21} className={form.role === value ? 'text-moss-400' : 'text-slate-400'} /><span className="text-xs text-white">{label}</span></button>)}</div></div><div><label className="label">Foto Profil</label><div className="flex items-center gap-4"><div className="relative">{photoFile ? <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-16 h-16 rounded-full object-cover" /> : <Avatar name={form.displayName || 'U'} id="new" size={64} />}<button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-moss-600 flex items-center justify-center border-2 border-ink-900"><Camera size={13} className="text-white" /></button></div><div><button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-moss-400 hover:underline">{photoFile ? 'Ganti foto' : 'Upload foto (opsional)'}</button><p className="text-[10px] text-slate-600">JPG/PNG, maks 5MB</p></div></div><input ref={fileRef} type="file" accept="image/*" onChange={selectPhoto} className="hidden" /></div><div><label className="label">Nama Lengkap</label><input className="input" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} /></div><div><label className="label">Username</label><input className="input" value={form.username} onChange={(e) => set('username', e.target.value.replace(/\s/g, '').toLowerCase())} placeholder="username" /></div><div><label className="label">Tanggal Lahir</label><input type="date" className="input" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} /></div><div><label className="label">Sekolah / Institusi</label><div className="relative"><School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input className="input pl-9" value={form.school} onChange={(e) => set('school', e.target.value)} /></div></div>{form.role === 'pelajar' && <div><label className="label">Jenjang</label><select className="input" value={form.educationLevel} onChange={(e) => set('educationLevel', e.target.value as EducationLevel)}><option value="">Pilih jenjang...</option>{Object.entries(LEVEL_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></div>}</div><div className="flex gap-2 mt-6"><Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft size={18} />}>Kembali</Button><Button fullWidth disabled={!step2Valid} onClick={() => setStep(3)}>Lanjut</Button></div></div>}
        {step === 3 && <div className="card p-6 animate-slide-up"><h1 className="font-display font-bold text-2xl text-white mb-1">Kategori Favorit</h1><p className="text-sm text-slate-400 mb-6">Preferensi disimpan bersama pendaftaran akun.</p><div className="grid grid-cols-2 gap-2">{Object.entries(CATEGORY_LABELS).map(([key,label]) => { const selected = form.favoriteCategories.includes(key as CompetitionCategory); return <button key={key} onClick={() => toggleCategory(key as CompetitionCategory)} className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-between ${selected ? 'border-moss-500 bg-moss-500/10 text-moss-300' : 'border-white/10 text-slate-300'}`}>{label}{selected && <Check size={16} />}</button>; })}</div><div className="flex gap-2 mt-6"><Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft size={18} />}>Kembali</Button><Button fullWidth loading={loading} onClick={() => void handleSubmit()}>Selesai</Button></div></div>}
        <p className="text-xs text-slate-600 text-center mt-4">Admin tidak tersedia pada pendaftaran publik dan hanya dapat diberikan melalui backend.</p>
      </div></div>
    </div>
  );
}
