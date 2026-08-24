import { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar, Award, Trophy, BarChart3, Edit2,
  Share2, User as UserIcon, GraduationCap, School,
  Camera, MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/Badge';
import { EmblemRow, EmblemPopup, EmblemIcon } from '@/components/ui/Emblem';
import { useApp } from '@/store/AppContext';
import { demoUsers, demoAwards, demoCompetitions, LEVEL_LABELS, CATEGORY_LABELS, getEmblem } from '@/data/demo';
import { formatShortDate } from '@/lib/utils';
import type { Emblem } from '@/types';

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, toast, updateProfile } = useApp();
  const [tab, setTab] = useState<'prestasi' | 'lomba' | 'statistik'>('prestasi');
  const [popupEmblem, setPopupEmblem] = useState<Emblem | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const profile = demoUsers.find((u) => u.username === username) || currentUser;
  if (!profile) return null;

  const isOwn = currentUser?.username === profile.username;
  const userAwards = demoAwards;
  const userCompetitions = demoCompetitions.slice(0, 3);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Ukuran foto maksimal 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (isOwn) {
        updateProfile({ coverPhoto: reader.result as string });
        toast('Foto sampul diperbarui', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-sm text-white truncate">{profile.displayName}</h2>
          <p className="text-xs text-slate-500">@{profile.username}</p>
        </div>
        {isOwn && (
          <Link to="/profile/edit"><Button size="sm" variant="outline" icon={<Edit2 size={14} />}>Edit</Button></Link>
        )}
      </div>

      {/* Cover photo — editable */}
      <div className="relative h-32 md:h-40 bg-gradient-to-br from-ink-700 via-ink-800 to-moss-900/30 group">
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        )}
        {isOwn && (
          <button
            onClick={() => coverRef.current?.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
          >
            <Camera size={14} /> Ganti Sampul
          </button>
        )}
        <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      </div>

      {/* Centered avatar */}
      <div className="flex justify-center -mt-12 relative">
        <Avatar name={profile.displayName} id={profile.id} size={88} ring src={profile.profilePhoto || profile.avatarUrl} />
      </div>

      <div className="px-4 pt-3 pb-4 space-y-4">
        <div className="text-center">
          {/* Name + username */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="font-display font-bold text-xl text-white">{profile.displayName}</h1>
            {profile.verified && <BadgeCheck />}
          </div>
          <p className="text-sm text-slate-500">@{profile.username}</p>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">{profile.bio || 'Belum ada bio'}</p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-slate-500">
            {profile.school && (
              <span className="flex items-center gap-1"><School size={12} /> {profile.school}</span>
            )}
            {profile.educationLevel && (
              <span className="flex items-center gap-1"><GraduationCap size={12} /> {LEVEL_LABELS[profile.educationLevel]}</span>
            )}
            {profile.birthDate && (
              <span className="flex items-center gap-1"><Calendar size={12} /> Lahir {formatShortDate(profile.birthDate)}</span>
            )}
            {profile.pembina && (
              <span className="flex items-center gap-1"><UserIcon size={12} /> Pembina: {profile.pembina}</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-3">
            <div>
              <span className="text-sm font-bold text-white">{profile.following}</span>
              <span className="text-xs text-slate-500"> Mengikuti</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white">{profile.followers}</span>
              <span className="text-xs text-slate-500"> Pengikut</span>
            </div>
          </div>

          {!isOwn && (
            <div className="flex gap-2 mt-4 justify-center">
              <Button size="sm">Ikuti</Button>
              <Button size="sm" variant="outline" icon={<Share2 size={14} />}>Bagikan</Button>
            </div>
          )}
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <p className="text-lg font-bold text-white">{profile.points.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-slate-500">Total Poin</p>
          </Card>
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-0.5"><RankBadge rank={profile.rank} size="sm" /></div>
            <p className="text-[10px] text-slate-500">Peringkat #{profile.rank}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-lg font-bold text-white">{userAwards.length}</p>
            <p className="text-[10px] text-slate-500">Awards</p>
          </Card>
        </div>

        {/* Emblems */}
        {profile.emblems.length > 0 && (
          <Card className="p-4">
            <h3 className="font-display font-semibold text-sm text-white mb-3 flex items-center gap-2">
              <Award size={16} className="text-moss-400" /> Emblem ({profile.emblems.length})
            </h3>
            <EmblemRow emblemIds={profile.emblems.map((e) => e.id)} maxStatic={6} size={28} />
          </Card>
        )}

        {/* Badges */}
        <Card className="p-4">
          <h3 className="font-display font-semibold text-sm text-white mb-3 flex items-center gap-2">
            <Award size={16} className="text-moss-400" /> Badge
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((b) => (
              <Badge key={b} color="moss">{b}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-semibold text-sm text-white mb-3">Kategori Favorit</h3>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteCategories.map((c) => (
              <Badge key={c} color="info">{CATEGORY_LABELS[c]}</Badge>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {([
            { key: 'prestasi', label: 'Prestasi' },
            { key: 'lomba', label: 'Lomba' },
            { key: 'statistik', label: 'Statistik' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition relative ${tab === t.key ? 'text-moss-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-moss-400 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'prestasi' && (
          <div className="space-y-3">
            {userAwards.map((a) => (
              <Card key={a.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}>
                    {a.type === 'medal' ? <Trophy size={20} className="text-white" /> : <Award size={20} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                    <p className="text-xs text-slate-500 truncate">{a.subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {a.points && a.points > 0 && (
                      <p className="text-xs font-semibold text-moss-300">+{a.points}</p>
                    )}
                    <span className="text-xs text-slate-600">{formatShortDate(a.date)}</span>
                  </div>
                </div>
                {/* Emblems earned from this award */}
                {a.emblems && a.emblems.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 pl-[60px]">
                    <span className="text-[10px] text-slate-600 mr-1">Emblem:</span>
                    {a.emblems.map((eid) => {
                      const emblem = getEmblem(eid);
                      return emblem ? (
                        <button key={eid} onClick={() => setPopupEmblem(emblem)} className="transition-transform hover:scale-110">
                          <EmblemIcon emblem={emblem} size={20} />
                        </button>
                      ) : null;
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {tab === 'lomba' && (
          <div className="space-y-3">
            {userCompetitions.map((c) => (
              <Link key={c.id} to={`/lomba/${c.slug}`}>
                <Card hover className="p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-ink-800 overflow-hidden shrink-0">
                    <img src={c.twibbonUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                    <p className="text-xs text-slate-500">{CATEGORY_LABELS[c.category]}</p>
                  </div>
                  <Badge color={c.status === 'completed' ? 'default' : 'moss'}>
                    {c.status === 'in-progress' ? 'Berlangsung' : c.status === 'open' ? 'Terbuka' : c.status === 'completed' ? 'Selesai' : 'Segera'}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {tab === 'statistik' && (
          <div className="space-y-3">
            <Card className="p-4">
              <h3 className="font-display font-semibold text-sm text-white mb-3">Statistik Performa</h3>
              <div className="space-y-3">
                {[
                  { label: 'Uji kompetensi diikuti', value: '12', max: 20 },
                  { label: 'Uji kompetensi dimenangkan', value: '3', max: 12 },
                  { label: 'Daily tasks selesai', value: '145', max: 200 },
                  { label: 'Streak terpanjang', value: '30', max: 100 },
                  { label: 'Rata-rata skor', value: '82%', max: 100 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{s.label}</span>
                      <span className="text-xs font-semibold text-white">{s.value}</span>
                    </div>
                    <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
                      <div className="h-full gradient-moss rounded-full" style={{ width: `${(parseInt(s.value) / s.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-display font-semibold text-sm text-white mb-3">Distribusi Kategori</h3>
              <div className="space-y-2">
                {[
                  { cat: 'mtk', pct: 40 },
                  { cat: 'ipa', pct: 30 },
                  { cat: 'tech', pct: 20 },
                  { cat: 'bindo', pct: 10 },
                ].map((d) => (
                  <div key={d.cat} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-24">{CATEGORY_LABELS[d.cat]}</span>
                    <div className="flex-1 h-2 bg-ink-700 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-8">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <EmblemPopup emblem={popupEmblem} onClose={() => setPopupEmblem(null)} />
    </div>
  );
}

function BadgeCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-moss-400 shrink-0">
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
