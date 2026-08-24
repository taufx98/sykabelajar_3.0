import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, ArrowLeft, Check, User as UserIcon,
  School, Calendar, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useApp } from '@/store/AppContext';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/data/demo';
import type { Role, EducationLevel, CompetitionCategory } from '@/types';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, toast } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'pelajar' as Role,
    displayName: '',
    username: '',
    birthDate: '',
    school: '',
    educationLevel: '' as EducationLevel | '',
    profilePhoto: '',
    favoriteCategories: [] as CompetitionCategory[],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCategory = (cat: CompetitionCategory) => {
    setForm((f) => ({
      ...f,
      favoriteCategories: f.favoriteCategories.includes(cat)
        ? f.favoriteCategories.filter((c) => c !== cat)
        : [...f.favoriteCategories, cat],
    }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Ukuran foto maksimal 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('profilePhoto', reader.result as string);
    reader.readAsDataURL(file);
  };

  const step1Valid = form.email && form.password.length >= 6 && form.password === form.confirmPassword;
  const step2Valid =
    form.displayName &&
    form.username &&
    form.birthDate &&
    form.school &&
    (form.role === 'guru' || form.educationLevel);

  const handleSubmit = () => {
    if (form.favoriteCategories.length === 0) {
      toast('Pilih minimal 1 kategori lomba favorit', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        username: form.username,
        role: form.role,
        school: form.school,
        birthDate: form.birthDate,
        educationLevel: form.educationLevel || undefined,
        profilePhoto: form.profilePhoto || undefined,
        favoriteCategories: form.favoriteCategories,
      });
      setLoading(false);
      if (result.ok) {
        toast('Pendaftaran berhasil! Selamat datang', 'success');
        navigate('/home');
      } else {
        toast(result.error || 'Pendaftaran gagal', 'error');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 h-16 flex items-center justify-between border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-moss flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">sykabelajar<span className="text-moss-400">.id</span></span>
        </Link>
        <Link to="/login" className="text-sm text-slate-400 hover:text-white">Sudah punya akun? <span className="text-moss-400">Masuk</span></Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-ink-700">
                <div className={`h-full transition-all duration-500 ${s <= step ? 'gradient-moss' : ''}`} style={{ width: s <= step ? '100%' : '0%' }} />
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="card p-6 animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-1">Buat Akun</h1>
              <p className="text-sm text-slate-400 mb-6">Mulai perjalanan lombamu di sini</p>

              <div className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="nama@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" placeholder="Minimal 6 karakter" value={form.password} onChange={(e) => set('password', e.target.value)} />
                </div>
                <div>
                  <label className="label">Konfirmasi Password</label>
                  <input type="password" className="input" placeholder="Ulangi password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
                </div>
                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-400">Password tidak cocok</p>
                )}
              </div>

              <Button fullWidth size="lg" className="mt-6" disabled={!step1Valid} onClick={() => setStep(2)} icon={<ArrowRight size={18} />}>
                Lanjut
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6 animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-1">Tentang Kamu</h1>
              <p className="text-sm text-slate-400 mb-6">Lengkapi data diri dan sekolahmu</p>

              <div className="space-y-4">
                {/* Role selector */}
                <div>
                  <label className="label">Saya adalah</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['pelajar', 'guru'] as Role[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => set('role', r)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          form.role === r ? 'border-moss-500 bg-moss-500/10' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <UserIcon size={24} className={form.role === r ? 'text-moss-400' : 'text-slate-400'} />
                        <span className={`text-sm font-medium ${form.role === r ? 'text-moss-300' : 'text-slate-300'}`}>
                          {r === 'pelajar' ? 'Pelajar' : 'Guru'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile photo upload */}
                <div>
                  <label className="label">Foto Profil</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {form.profilePhoto ? (
                        <img src={form.profilePhoto} alt="Preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-moss-500/30" />
                      ) : (
                        <Avatar name={form.displayName || 'U'} id="new" size={64} />
                      )}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-moss-600 flex items-center justify-center border-2 border-ink-900 hover:bg-moss-500 transition"
                      >
                        <Camera size={13} className="text-white" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-moss-400 hover:underline">
                        {form.profilePhoto ? 'Ganti foto' : 'Upload foto (opsional)'}
                      </button>
                      <p className="text-[10px] text-slate-600 mt-0.5">JPG/PNG, maks 5MB</p>
                    </div>
                    {form.profilePhoto && (
                      <button type="button" onClick={() => set('profilePhoto', '')} className="text-xs text-red-400 hover:text-red-300">Hapus</button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </div>

                <div>
                  <label className="label">Nama Lengkap</label>
                  <input className="input" placeholder="Nama tampilan" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} />
                </div>

                <div>
                  <label className="label">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                    <input className="input pl-7" placeholder="username" value={form.username} onChange={(e) => set('username', e.target.value.replace(/\s/g, '').toLowerCase())} />
                  </div>
                </div>

                <div>
                  <label className="label">Tanggal Lahir</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="date" className="input pl-9" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                  </div>
                </div>

                {/* School — shown for both roles */}
                <div>
                  <label className="label">Nama Sekolah / Institusi</label>
                  <div className="relative">
                    <School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input pl-9" placeholder="cth. SMP Negeri 1 Bandung" value={form.school} onChange={(e) => set('school', e.target.value)} />
                  </div>
                </div>

                {/* Education level dropdown — only for pelajar */}
                {form.role === 'pelajar' && (
                  <div>
                    <label className="label">Jenjang Kelas</label>
                    <select
                      className="input appearance-none cursor-pointer"
                      value={form.educationLevel}
                      onChange={(e) => set('educationLevel', e.target.value as EducationLevel)}
                    >
                      <option value="">Pilih jenjang...</option>
                      {(['sd', 'smp', 'sma'] as EducationLevel[]).map((lv) => (
                        <option key={lv} value={lv}>{LEVEL_LABELS[lv]}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft size={18} />}>Kembali</Button>
                <Button fullWidth disabled={!step2Valid} onClick={() => setStep(3)}>Lanjut</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-6 animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-1">Kategori Favorit</h1>
              <p className="text-sm text-slate-400 mb-6">Pilih lomba yang paling kamu minati</p>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const selected = form.favoriteCategories.includes(key as CompetitionCategory);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleCategory(key as CompetitionCategory)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                        selected ? 'border-moss-500 bg-moss-500/10 text-moss-300' : 'border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {label}
                      {selected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft size={18} />}>Kembali</Button>
                <Button fullWidth loading={loading} onClick={handleSubmit}>Selesai</Button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-600 text-center mt-4">
            Dengan mendaftar, kamu menyetujui Ketentuan Layanan & Kebijakan Privasi sykabelajar.id
          </p>
        </div>
      </div>
    </div>
  );
}
