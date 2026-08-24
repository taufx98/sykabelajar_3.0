import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, toast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      toast('Isi email dan password', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.ok) {
        toast('Selamat datang kembali!', 'success');
        navigate('/home');
      } else {
        toast(result.error || 'Login gagal', 'error');
      }
    }, 600);
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
        <Link to="/register" className="text-sm text-slate-400 hover:text-white">Belum punya akun? <span className="text-moss-400">Daftar</span></Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="card p-6 md:p-8 animate-slide-up">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Masuk</h1>
            <p className="text-sm text-slate-400 mb-6">Lanjutkan perjalanan edukasimu</p>

            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" className="input pl-9" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="password" className="input pl-9" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </div>
              </div>
              <button onClick={() => setShowForgot(true)} className="text-xs text-moss-400 hover:underline">Lupa password?</button>
            </div>

            <Button fullWidth size="lg" className="mt-6" loading={loading} onClick={handleLogin} icon={<ArrowRight size={18} />}>
              Masuk
            </Button>

            <div className="mt-5 p-3 rounded-xl bg-ink-800/50 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Demo — coba akun ini:</p>
              <p className="text-xs text-moss-300 font-mono">aruna@sykabelajar.id · (password bebas)</p>
            </div>
          </div>

          {showForgot && (
            <div className="card p-4 mt-3 animate-slide-down">
              <p className="text-sm text-slate-300 mb-2">Reset password</p>
              <p className="text-xs text-slate-500 mb-3">Masukkan email, kami kirim link reset (demo: link tidak benar-benar dikirim).</p>
              <input className="input mb-2" placeholder="Email kamu" />
              <Button fullWidth size="sm" onClick={() => { toast('Link reset dikirim (demo)', 'success'); setShowForgot(false); }}>Kirim Link Reset</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
