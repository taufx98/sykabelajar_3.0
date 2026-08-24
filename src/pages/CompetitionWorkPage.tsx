import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Check, AlertCircle, Upload, FileText,
  Send, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { demoCompetitions, demoQuestions } from '@/data/demo';
import { fireConfetti } from '@/components/ui/Confetti';
import type { Question } from '@/types';

export function CompetitionWorkPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast, addNotification } = useApp();
  const competition = demoCompetitions.find((c) => c.slug === slug);
  const questions = competition ? demoQuestions[competition.id] || [] : [];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 min
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit();
  }, [timeLeft]);

  if (!competition) {
    return <div className="p-8 text-center text-slate-400">Lomba tidak ditemukan.</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Lomba ini tidak memiliki soal online. Silakan submit karya via link eksternal.</p>
        <Link to={`/lomba/${competition.slug}`}><Button variant="ghost" className="mt-4">Kembali</Button></Link>
      </div>
    );
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const setAnswer = (qid: string, value: string) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setSavedFlash(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavedFlash(false), 1500);
  };

  const answeredCount = Object.keys(answers).filter((k) => answers[k]).length;
  const requiredLeft = questions.filter((q) => q.required && !answers[q.id]).length;

  const handleSubmit = () => {
    if (requiredLeft > 0) {
      toast(`Masih ada ${requiredLeft} soal wajib belum dijawab`, 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      fireConfetti();
      toast('Jawaban berhasil dikirim! Menunggu penilaian.', 'success');
      addNotification({
        type: 'result-out',
        title: 'Jawaban Diterima',
        body: `Jawabanmu untuk ${competition.title} telah terkirim. Status: Menunggu penilaian.`,
        link: `/lomba/${competition.slug}`,
        icon: 'check',
      });
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-moss-500/20 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-moss-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Jawaban Terkirim!</h2>
          <p className="text-sm text-slate-400 mb-4">Status: <Badge color="warn">Menunggu Penilaian</Badge></p>
          <p className="text-sm text-slate-400 mb-6">Hasil akan diumumkan setelah admin selesai menilai. Kamu akan mendapat notifikasi.</p>
          <div className="flex gap-2">
            <Link to="/home" className="flex-1"><Button variant="outline" fullWidth>Beranda</Button></Link>
            <Link to={`/lomba/${competition.slug}`} className="flex-1"><Button fullWidth>Detail Lomba</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Sticky timer header */}
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={20} className="text-slate-300" /></button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-sm text-white truncate">{competition.title}</h2>
          <p className="text-xs text-slate-500">{answeredCount}/{questions.length} terjawab</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${timeLeft < 300 ? 'bg-err/15 text-red-300' : 'bg-moss-500/15 text-moss-300'}`}>
          <Clock size={14} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* Saved indicator */}
      {savedFlash && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 chip bg-moss-500/20 text-moss-300 border border-moss-500/30 animate-slide-down">
          <Check size={12} /> Jawaban tersimpan
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
        <Card className="p-4 bg-sky-500/5 border-sky-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-sky-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300">Baca soal dengan teliti. Jawaban tersimpan otomatis. Jangan refresh halaman sebelum submit.</p>
          </div>
        </Card>

        {questions.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} answer={answers[q.id] || ''} onChange={(v) => setAnswer(q.id, v)} />
        ))}

        <div className="sticky bottom-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{answeredCount}/{questions.length} dijawab</p>
              {requiredLeft > 0 ? (
                <p className="text-xs text-amber-400">{requiredLeft} soal wajib belum dijawab</p>
              ) : (
                <p className="text-xs text-moss-400">Semua soal wajib terjawab</p>
              )}
            </div>
            <Button loading={submitting} onClick={handleSubmit} icon={<Send size={16} />}>Submit Jawaban</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, answer, onChange }: {
  question: Question;
  index: number;
  answer: string;
  onChange: (v: string) => void;
}) {
  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-moss-500/15 flex items-center justify-center text-xs font-bold text-moss-300 shrink-0">{index + 1}</div>
        <div className="flex-1">
          <p className="text-sm text-white font-medium leading-relaxed">{question.prompt}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge>{question.points} poin</Badge>
            {question.required && <Badge color="warn">Wajib</Badge>}
          </div>
        </div>
      </div>

      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-2 pl-10">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl border-2 transition flex items-center gap-3 ${
                answer === opt.id ? 'border-moss-500 bg-moss-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answer === opt.id ? 'border-moss-500' : 'border-slate-600'}`}>
                {answer === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-moss-500" />}
              </div>
              <span className={`text-sm ${answer === opt.id ? 'text-moss-200' : 'text-slate-300'}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'short-answer' && (
        <div className="pl-10">
          <input className="input" placeholder="Tulis jawaban singkat..." value={answer} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}

      {question.type === 'essay' && (
        <div className="pl-10">
          <textarea className="input min-h-[120px] resize-y" placeholder="Tulis esaimu di sini..." value={answer} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}

      {question.type === 'file-upload' && (
        <div className="pl-10">
          <button className="w-full border-2 border-dashed border-white/10 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-moss-500/40 transition">
            <Upload size={24} className="text-slate-500" />
            <span className="text-sm text-slate-400">Upload file jawaban</span>
            <span className="text-xs text-slate-600">PDF/DOCX/JPG, maks 10MB</span>
          </button>
        </div>
      )}
    </Card>
  );
}
