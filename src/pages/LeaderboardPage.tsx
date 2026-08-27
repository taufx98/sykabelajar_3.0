import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/Badge';
import { EmblemRow } from '@/components/ui/Emblem';
import { demoLeaderboard, LEVEL_LABELS } from '@/data/demo';
import { useApp } from '@/store/AppContext';
import type { LeaderboardEntry, EducationLevel } from '@/types';

type TabValue = 'global' | EducationLevel | `grade-${number}`;

const LEVEL_GRADES: Record<EducationLevel, number[]> = {
  sd: [4, 5, 6],
  smp: [7, 8, 9],
  sma: [1, 2, 3],
};

const GRADE_LABEL: Record<number, string> = {
  4: 'Kls 4', 5: 'Kls 5', 6: 'Kls 6',
  7: 'Kls 7', 8: 'Kls 8', 9: 'Kls 9',
  1: 'Kls 1', 2: 'Kls 2', 3: 'Kls 3',
};

const PODIUM_STYLES = [
  { card: 'border-amber-500/40 bg-gradient-to-b from-amber-500/15 to-amber-500/5', rankText: 'text-amber-300', pointsText: 'text-amber-400', badge: 'bg-amber-500 text-ink-900' },
  { card: 'border-slate-400/30 bg-gradient-to-b from-slate-400/10 to-slate-400/5', rankText: 'text-slate-200', pointsText: 'text-slate-200', badge: 'bg-slate-400 text-ink-900' },
  { card: 'border-orange-600/30 bg-gradient-to-b from-orange-600/10 to-orange-600/5', rankText: 'text-orange-400', pointsText: 'text-orange-400', badge: 'bg-orange-600 text-white' },
];

export function LeaderboardPage() {
  const { user } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>(demoLeaderboard);
  const [tab, setTab] = useState<TabValue>('global');

  useEffect(() => {
    const interval = setInterval(() => {
      setEntries((prev) => {
        const updated = prev.map((e) => ({ ...e, points: e.points + Math.floor(Math.random() * 30) }));
        const sorted = [...updated].sort((a, b) => b.points - a.points);
        return sorted.map((e, i) => ({ ...e, change: e.rank - (i + 1), rank: i + 1 }));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filterEntries(entries, tab);
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const tabs = buildTabs(tab);

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3">
        <h2 className="font-display font-bold text-lg text-white">Papan Peringkat</h2>
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${tab === t.value ? 'bg-moss-500/15 text-moss-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-moss-400 shrink-0 pl-2">
            <span className="w-2 h-2 rounded-full bg-moss-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-2">
            <TopBox entry={top3[1]} place={2} order="order-2" />
            <TopBox entry={top3[0]} place={1} order="order-1" />
            <TopBox entry={top3[2]} place={3} order="order-3" />
          </div>
        )}

        <div className="space-y-2">
          {rest.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </div>

        {user && user.rank > 10 && tab === 'global' && (
          <Card className="p-4 border-moss-500/30 bg-moss-500/5 mt-4">
            <div className="flex items-center gap-3">
              <RankBadge rank={user.rank} />
              <Avatar name={user.displayName} id={user.id} size={36} ring src={user.profilePhoto} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{user.displayName} (Kamu)</p>
                <p className="text-xs text-slate-500">{user.school}</p>
              </div>
              <span className="text-sm font-semibold text-moss-300">{user.points.toLocaleString('id-ID')}</span>
            </div>
          </Card>
        )}

        <p className="text-center text-xs text-slate-600 pt-4">
          Peringkat diperbarui otomatis. Klik emblem untuk lihat detail prestasi.
        </p>
      </div>
    </div>
  );
}

function getLevelForGrade(grade: number): EducationLevel {
  if (grade >= 4 && grade <= 6) return 'sd';
  if (grade >= 7 && grade <= 9) return 'smp';
  return 'sma';
}

function buildTabs(current: TabValue): { label: string; value: TabValue }[] {
  const base: { label: string; value: TabValue }[] = [
    { label: 'Global', value: 'global' },
    { label: 'SD', value: 'sd' },
    { label: 'SMP', value: 'smp' },
    { label: 'SMA', value: 'sma' },
  ];

  if (current === 'global') return base;

  const level: EducationLevel = current.startsWith('grade-')
    ? getLevelForGrade(Number(current.replace('grade-', '')))
    : current as EducationLevel;
  const grades = LEVEL_GRADES[level];
  const gradeTabs = grades.map((g) => ({ label: GRADE_LABEL[g], value: `grade-${g}` as TabValue }));

  const idx = base.findIndex((b) => b.value === level);
  return [...base.slice(0, idx + 1), ...gradeTabs, ...base.slice(idx + 1)];
}

function filterEntries(entries: LeaderboardEntry[], tab: TabValue): LeaderboardEntry[] {
  if (tab === 'global') return entries;
  if (tab.startsWith('grade-')) {
    const grade = parseInt(tab.replace('grade-', ''), 10);
    const level = grade >= 4 && grade <= 6 ? 'sd' : grade >= 7 && grade <= 9 ? 'smp' : 'sma';
    return entries.filter((e) => e.educationLevel === level && e.classGrade === grade);
  }
  return entries.filter((e) => e.educationLevel === tab);
}

function TopBox({ entry, place, order }: { entry: LeaderboardEntry; place: 1 | 2 | 3; order: string }) {
  const style = PODIUM_STYLES[place - 1];
  const maxEmblems = place === 1 ? 5 : place === 2 ? 4 : 3;

  return (
    <div className={`${order} flex flex-col`}>
      <div className={`card p-3 flex flex-col items-center ${style.card}`}>
        <div className="relative w-full mb-2">
          <div className="rounded-xl overflow-hidden bg-ink-800" style={{ aspectRatio: '4/5' }}>
            <img
              src={entry.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`}
              alt={entry.displayName}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5">
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-display font-bold text-sm shadow-lg ${style.badge}`}>
              {place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'}
            </span>
          </div>
        </div>

        <Link to={`/profile/${entry.username}`} className="text-center w-full">
          <p className={`text-xs font-bold truncate ${place === 1 ? 'text-amber-300' : 'text-white'}`}>{entry.displayName}</p>
          <p className="text-[10px] text-slate-500 truncate">@{entry.username}</p>
        </Link>

        <p className="text-[10px] text-slate-500 text-center truncate max-w-full mt-0.5">{entry.school}</p>
        {entry.pembina && <p className="text-[9px] text-slate-600 text-center truncate max-w-full">Pembina: {entry.pembina}</p>}

        <div className="mt-2 w-full min-h-[24px] flex items-center justify-center overflow-hidden">
          <EmblemRow emblemIds={entry.emblems.map((e) => e.id)} maxStatic={maxEmblems} size={20} />
        </div>

        <div className="mt-2 text-center">
          <p className={`text-sm font-bold ${style.pointsText}`}>{entry.points.toLocaleString('id-ID')}</p>
          <p className="text-[9px] text-slate-600">total poin</p>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const changeIcon = entry.change > 0 ? <TrendingUp size={12} className="text-moss-400" /> :
    entry.change < 0 ? <TrendingDown size={12} className="text-red-400" /> :
    <Minus size={12} className="text-slate-600" />;
  const changeText = entry.change !== 0 ? Math.abs(entry.change) : '';

  return (
    <Card className={`p-3 transition-all duration-500 ${entry.isCurrentUser ? 'border-moss-500/40 bg-moss-500/5' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 text-center">
          <span className="text-sm font-bold text-slate-300">{entry.rank}</span>
        </div>
        <Link to={`/profile/${entry.username}`}>
          <Avatar name={entry.displayName} id={entry.userId} size={36} ring={entry.isCurrentUser} src={entry.profilePhoto} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${entry.username}`}>
            <p className={`text-sm font-semibold truncate ${entry.isCurrentUser ? 'text-moss-300' : 'text-white'}`}>
              {entry.displayName} {entry.isCurrentUser && <span className="text-xs text-moss-400">(Kamu)</span>}
            </p>
            <p className="text-xs text-slate-500 truncate">{entry.school}</p>
          </Link>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {changeIcon}{changeText}
        </div>
        <span className="text-sm font-semibold text-moss-300 tabular-nums w-16 text-right">{entry.points.toLocaleString('id-ID')}</span>
      </div>
    </Card>
  );
}
