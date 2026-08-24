import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Flame, Clock, Check, RotateCcw, Award,
  ChevronRight, Loader2, Zap, BookOpen, Trophy,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import { demoDailyTasks } from '@/data/demo';
import { countdown } from '@/lib/utils';
import { fireConfetti } from '@/components/ui/Confetti';
import type { DailyTask } from '@/types';

export function DailyTasksPage() {
  const { toast, addPoints, addNotification } = useApp();
  const [tasks, setTasks] = useState<DailyTask[]>(demoDailyTasks);
  const [activeQuiz, setActiveQuiz] = useState<DailyTask | null>(null);

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleQuizComplete = (taskId: string, score: number, total: number) => {
    const task = tasks.find((t) => t.id === taskId)!;
    setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, completed: true } : t));
    setActiveQuiz(null);
    addPoints(task.points);
    fireConfetti();
    toast(`Quiz selesai! Skor ${score}/${total}. +${task.points} poin diraih!`, 'success');
    addNotification({
      type: 'daily-reminder',
      title: 'Daily Task Selesai!',
      body: `${task.title} selesai. +${task.points} poin ditambahkan ke akunmu.`,
      link: '/daily-tasks',
      icon: 'check',
    });
  };

  const handleClaimTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)!;
    setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, completed: true } : t));
    addPoints(task.points);
    fireConfetti();
    toast(`+${task.points} poin diraih!`, 'success');
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalPoints = tasks.filter((t) => t.completed).reduce((s, t) => s + t.points, 0);

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3">
        <h2 className="font-display font-bold text-lg text-white">Daily Tasks</h2>
        <p className="text-xs text-slate-500">{today}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Streak banner */}
        <Card className="p-4 bg-gradient-to-r from-amber-500/15 to-transparent border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Flame size={28} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Streak 30 Hari!</p>
              <p className="text-xs text-slate-400">Kerjakan minimal 1 task hari ini untuk menjaga streak</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">30</p>
              <p className="text-[10px] text-slate-500">hari</p>
            </div>
          </div>
        </Card>

        {/* Progress summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-slate-500 mb-1">Task Selesai</p>
            <p className="text-2xl font-bold text-white">{completedCount}/{tasks.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500 mb-1">Poin Hari Ini</p>
            <p className="text-2xl font-bold gradient-text">+{totalPoints}</p>
          </Card>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDoQuiz={() => setActiveQuiz(task)} onClaim={() => handleClaimTask(task.id)} />
          ))}
        </div>
      </div>

      {activeQuiz && activeQuiz.quiz && (
        <QuizModal task={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={(score, total) => handleQuizComplete(activeQuiz.id, score, total)} />
      )}
    </div>
  );
}

function TaskCard({ task, onDoQuiz, onClaim }: {
  task: DailyTask;
  onDoQuiz: () => void;
  onClaim: () => void;
}) {
  const cd = countdown(task.expiresAt);
  const typeIcons = {
    quiz: <Zap size={18} className="text-sky-400" />,
    assignment: <BookOpen size={18} className="text-moss-400" />,
    streak: <Flame size={18} className="text-amber-400" />,
  };
  const typeColors = {
    quiz: 'from-sky-500/10',
    assignment: 'from-moss-500/10',
    streak: 'from-amber-500/10',
  };

  return (
    <Card className={`p-4 bg-gradient-to-r ${typeColors[task.type]} to-transparent ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-ink-800 flex items-center justify-center shrink-0">
          {typeIcons[task.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-sm text-white">{task.title}</h3>
            {task.completed && <Badge color="moss"><Check size={10} /> Selesai</Badge>}
          </div>
          <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-moss-300 font-semibold">+{task.points} poin</span>
            {!task.completed && !cd.expired && (
              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={11} /> Berakhir {cd.hours}j {cd.minutes}m lagi</span>
            )}
            {task.type === 'quiz' && !task.completed && task.maxRetry > 0 && (
              <span className="text-xs text-slate-600">Retry {task.retryUsed}/{task.maxRetry}</span>
            )}
          </div>
        </div>
      </div>
      {!task.completed && (
        <div className="mt-3 pl-[52px]">
          {task.type === 'quiz' && task.quiz ? (
            <Button size="sm" onClick={onDoQuiz} icon={<Zap size={14} />}>Kerjakan Quiz</Button>
          ) : task.type === 'streak' ? (
            <Button size="sm" disabled icon={<Check size={14} />}>Streak Aktif</Button>
          ) : (
            <Button size="sm" onClick={onClaim} icon={<Award size={14} />}>Klaim Poin</Button>
          )}
        </div>
      )}
    </Card>
  );
}

function QuizModal({ task, onClose, onComplete }: {
  task: DailyTask;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}) {
  const questions = task.quiz?.questions || [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [retryUsed, setRetryUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const score = questions.filter((qq) => answers[qq.id] === qq.correctOptionId).length;

  const handleNext = () => {
    if (isLast) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setShowResult(true);
      }, 600);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrent(0);
    setShowResult(false);
    setRetryUsed((r) => r + 1);
  };

  if (showResult) {
    const passed = score >= Math.ceil(questions.length * 0.6);
    return (
      <Modal open onClose={onClose} title="Hasil Quiz" size="md">
        <div className="text-center py-6">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-moss-500/20' : 'bg-amber-500/20'}`}>
            {passed ? <Trophy size={36} className="text-moss-400" /> : <RotateCcw size={36} className="text-amber-400" />}
          </div>
          <p className="text-3xl font-bold text-white mb-1">{score}/{questions.length}</p>
          <p className="text-sm text-slate-400 mb-6">{passed ? 'Quiz berhasil!' : 'Belum lulus, coba lagi yuk!'}</p>

          {/* Answer review */}
          <div className="text-left space-y-2 mb-6">
            {questions.map((qq, i) => {
              const userAns = answers[qq.id];
              const correct = userAns === qq.correctOptionId;
              return (
                <div key={qq.id} className={`p-3 rounded-xl border ${correct ? 'border-moss-500/30 bg-moss-500/5' : 'border-err/30 bg-err/5'}`}>
                  <p className="text-xs text-slate-300 mb-1">{i + 1}. {qq.prompt}</p>
                  <p className={`text-xs ${correct ? 'text-moss-300' : 'text-red-300'}`}>
                    {correct ? 'Benar!' : `Jawaban: ${qq.options.find(o => o.id === qq.correctOptionId)?.label}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            {!passed && retryUsed < (task.maxRetry - task.retryUsed) && (
              <Button variant="outline" fullWidth onClick={handleRetry} icon={<RotateCcw size={16} />}>Retry ({retryUsed}/{task.maxRetry})</Button>
            )}
            <Button fullWidth onClick={() => onComplete(score, questions.length)}>Klaim {task.points} Poin</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={task.title} size="md">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Soal {current + 1}/{questions.length}</span>
        <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
          <div className="h-full gradient-moss transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="py-2">
        <p className="text-sm text-white font-medium mb-4 leading-relaxed">{q.prompt}</p>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
              className={`w-full text-left px-3.5 py-3 rounded-xl border-2 transition flex items-center gap-3 ${
                answers[q.id] === opt.id ? 'border-moss-500 bg-moss-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[q.id] === opt.id ? 'border-moss-500' : 'border-slate-600'}`}>
                {answers[q.id] === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-moss-500" />}
              </div>
              <span className={`text-sm ${answers[q.id] === opt.id ? 'text-moss-200' : 'text-slate-300'}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        {current > 0 && <Button variant="outline" onClick={() => setCurrent((c) => c - 1)}>Sebelumnya</Button>}
        <Button fullWidth loading={submitting} disabled={!answers[q.id]} onClick={handleNext}>
          {isLast ? 'Submit Quiz' : 'Selanjutnya'}
        </Button>
      </div>
    </Modal>
  );
}
