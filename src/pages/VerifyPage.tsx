import { Link, useParams } from 'react-router-dom';
import {
  ShieldCheck, QrCode, Download, Share2, Award, Trophy,
  GraduationCap, ArrowLeft, CheckCircle2, Calendar, Hash,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { formatShortDate } from '@/lib/utils';

export function VerifyPage() {
  const { code } = useParams();
  const { certificates } = useApp();
  const cert = certificates.find((c) => c.code === code) || certificates[0];

  return (
    <div className="min-h-screen">
      <header className="glass border-b border-white/5 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-moss flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">sykabelajar<span className="text-moss-400">.id</span></span>
        </Link>
        <Link to="/login"><Button variant="ghost" size="sm">Masuk</Button></Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Verified status */}
        <Card className="p-6 text-center mb-4 bg-moss-500/5 border-moss-500/20 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-moss-500/20 flex items-center justify-center mx-auto mb-3 animate-glow">
            <ShieldCheck size={32} className="text-moss-400" />
          </div>
          <h1 className="font-display font-bold text-xl text-white mb-1">Terverifikasi ASLI</h1>
          <p className="text-sm text-slate-400">Sertifikat ini sah dan terdaftar di sistem sykabelajar.id</p>
          <div className="inline-flex items-center gap-1.5 mt-3 chip bg-moss-500/15 text-moss-300 border border-moss-500/20">
            <CheckCircle2 size={12} /> Status: Valid
          </div>
        </Card>

        {/* Certificate view */}
        <Card className="p-0 overflow-hidden mb-4">
          <div className="aspect-[4/3] bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-moss-500/30 p-6 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-moss-500 blur-3xl" />
            </div>
            <div className="relative text-center flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 rounded-xl gradient-moss flex items-center justify-center mb-4">
                <Trophy size={28} className="text-white" />
              </div>
              <p className="text-xs text-moss-400 uppercase tracking-widest mb-2">
                {cert.type === 'winner' ? 'Sertifikat Juara' : cert.type === 'finalist' ? 'Sertifikat Finalis' : 'Sertifikat Partisipasi'}
              </p>
              <p className="text-xs text-slate-500 mb-1">Diberikan kepada</p>
              <p className="font-display font-bold text-xl md:text-2xl text-white mb-3">Aruna Putra</p>
              <p className="text-sm text-slate-300 max-w-md mb-4">{cert.competitionTitle}</p>
              {cert.rank && (
                <Badge color="moss"><Trophy size={10} /> Peringkat #{cert.rank}</Badge>
              )}
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Skor</p>
                  <p className="text-xs text-white font-semibold">{cert.score}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Tanggal</p>
                  <p className="text-xs text-white">{formatShortDate(cert.issuedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Info grid */}
        <Card className="p-4 mb-4">
          <h3 className="font-display font-semibold text-sm text-white mb-3">Informasi Sertifikat</h3>
          <div className="space-y-3">
            <InfoRow icon={<Hash size={16} />} label="Kode Sertifikat" value={cert.code} />
            <InfoRow icon={<Award size={16} />} label="Lomba" value={cert.competitionTitle} />
            <InfoRow icon={<Trophy size={16} />} label="Peringkat" value={cert.rank ? `#${cert.rank}` : 'Peserta'} />
            <InfoRow icon={<Calendar size={16} />} label="Tanggal Terbit" value={formatShortDate(cert.issuedAt)} />
            <InfoRow icon={<ShieldCheck size={16} />} label="Status Verifikasi" value="Terverifikasi ASLI" />
          </div>
        </Card>

        {/* QR code */}
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500 mb-3">Scan QR code untuk verifikasi cepat</p>
          <div className="inline-block p-3 bg-white rounded-xl">
            <QrPlaceholder />
          </div>
          <p className="text-[10px] text-slate-600 mt-2 font-mono">{cert.code}</p>
        </Card>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" fullWidth icon={<Download size={16} />}>Download PDF</Button>
          <Button variant="outline" fullWidth icon={<Share2 size={16} />}>Bagikan</Button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Halaman verifikasi publik sykabelajar.id · Dapat diakses tanpa login
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center text-moss-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function QrPlaceholder() {
  // Simple QR-like pattern
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,0,0,1,1,0,1,0,1,0,1],
    [0,1,0,1,1,0,0,1,1,0,0,1,0,1,0,1,0],
    [1,1,0,0,1,1,1,0,1,1,0,0,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,1,0,1,1,1,0,1,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,0,0,1,0,0,1,1,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,1,1,1,1],
  ];
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${pattern[0].length}, 1fr)` }}>
      {pattern.flat().map((cell, i) => (
        <div key={i} className={cell ? 'bg-ink-950' : 'bg-white'} style={{ width: 8, height: 8 }} />
      ))}
    </div>
  );
}
