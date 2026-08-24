import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Repeat2, Share2, Trophy, CalendarCheck,
  MoreHorizontal, Sparkles, Flame, Bookmark, ChevronRight,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { CommentsSection } from '@/components/ui/Comments';
import { useApp } from '@/store/AppContext';
import { demoCompetitions, demoDailyTasks, demoUsers } from '@/data/demo';
import { timeAgo } from '@/lib/utils';
import type { FeedPost } from '@/types';

export function HomePage() {
  const { feed, togglePostLike, toast, isGuest } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState<'lomba' | 'prestasi'>('lomba');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [tab]);

  const filtered = tab === 'lomba' ? feed.filter((p) => p.type === 'competition') : feed.filter((p) => p.type === 'achievement');

  const toggleExpand = (id: string) => {
    setExpandedPost((prev) => (prev === id ? null : id));
  };

  const openCompetition = demoCompetitions.find((c) => c.status === 'open');
  const todayTask = demoDailyTasks.find((t) => !t.completed);

  return (
    <div>
      <div className="sticky top-0 md:top-0 z-20 glass border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white">Beranda</h2>
          <Sparkles size={18} className="text-moss-400" />
        </div>
        <div className="flex">
          {(['lomba', 'prestasi'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition relative ${tab === t ? 'text-moss-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t === 'lomba' ? 'Lomba' : 'Prestasi'}
              {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-moss-400 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Quick action cards */}
      {!isGuest && (
        <div className="px-4 py-4 space-y-3">
          {openCompetition && (
            <Link to={`/lomba/${openCompetition.slug}`}>
              <Card hover className="p-4 flex items-center gap-4 bg-gradient-to-r from-moss-500/10 to-transparent">
                <div className="w-12 h-12 rounded-xl bg-moss-500/20 flex items-center justify-center shrink-0">
                  <Trophy size={22} className="text-moss-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Uji Kompetensi Terbuka Hari Ini</p>
                  <p className="text-xs text-slate-400 truncate">{openCompetition.title}</p>
                </div>
                <Badge color="moss">+{openCompetition.points} poin</Badge>
              </Card>
            </Link>
          )}
          {todayTask && (
            <Link to="/daily-tasks">
              <Card hover className="p-4 flex items-center gap-4 bg-gradient-to-r from-amber-500/10 to-transparent">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Flame size={22} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Daily Task Menunggu</p>
                  <p className="text-xs text-slate-400 truncate">{todayTask.title} · +{todayTask.points} poin</p>
                </div>
                <Badge color="warn">Kerjakan</Badge>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="px-4 space-y-4 pb-4">
        {loading ? (
          <SkeletonList count={4} />
        ) : (
          filtered.map((post) => {
            const author = demoUsers.find((u) => u.id === post.userId) ?? demoUsers[0];
            const isExpanded = expandedPost === post.id;
            return (
              <FeedCard
                key={post.id}
                post={post}
                authorName={author.displayName}
                authorId={author.id}
                authorUsername={author.username}
                authorPhoto={author.profilePhoto}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpand(post.id)}
                onLike={() => togglePostLike(post.id)}
                onShare={() => toast('Link disalin ke clipboard', 'info')}
                onOpenCompetition={() => post.competitionSlug && navigate(`/lomba/${post.competitionSlug}`)}
                isGuest={isGuest}
              />
            );
          })
        )}
        {!hasMore && <p className="text-center text-sm text-slate-600 py-8">Sudah sampai akhir feed</p>}
      </div>
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return <div className="space-y-4">{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}</div>;
}

function FeedCard({ post, authorName, authorId, authorUsername, authorPhoto, isExpanded, onToggleExpand, onLike, onShare, onOpenCompetition, isGuest }: {
  post: FeedPost;
  authorName: string;
  authorId: string;
  authorUsername: string;
  authorPhoto?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLike: () => void;
  onShare: () => void;
  onOpenCompetition: () => void;
  isGuest: boolean;
}) {
  const typeIcon = {
    achievement: <Trophy size={14} className="text-amber-400" />,
    competition: <Trophy size={14} className="text-moss-400" />,
    'daily-task': <CalendarCheck size={14} className="text-sky-400" />,
    post: <Trophy size={14} className="text-slate-400" />,
  };
  const typeColor = {
    achievement: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    competition: 'bg-moss-500/15 text-moss-300 border-moss-500/20',
    'daily-task': 'bg-sky-500/15 text-sky-300 border-sky-500/20',
    post: 'bg-ink-700 text-slate-300 border-white/10',
  };
  const totalComments = post.comments.length + post.comments.reduce((s, c) => s + c.replies.length, 0);

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex gap-3">
        <Link to={`/profile/${authorUsername}`}><Avatar name={authorName} id={authorId} size={44} src={authorPhoto} /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link to={`/profile/${authorUsername}`} className="text-sm font-semibold text-white hover:underline truncate">{authorName}</Link>
            <span className={`chip ${typeColor[post.type]} text-[10px]`}>{typeIcon[post.type]} {post.meta}</span>
            <span className="text-xs text-slate-600">· {timeAgo(post.createdAt)}</span>
            <button className="ml-auto p-1 rounded-lg hover:bg-white/5 text-slate-600"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-slate-500 mb-1">@{authorUsername}</p>

          {post.type === 'competition' && post.competitionSlug ? (
            <button onClick={onOpenCompetition} className="text-left w-full">
              <h3 className="font-display font-semibold text-[15px] text-white mb-1.5 hover:text-moss-300 transition">{post.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">{post.body}</p>
              {post.image && (
                <div className="rounded-xl overflow-hidden mb-1 border border-white/5">
                  <img src={post.image} alt={post.title} className="w-full max-h-80 object-cover" />
                </div>
              )}
              <p className="text-xs text-moss-400 flex items-center gap-1 mt-2 hover:underline">
                Lihat detail uji kompetensi <ChevronRight size={14} />
              </p>
            </button>
          ) : (
            <>
              <h3 className="font-display font-semibold text-[15px] text-white mb-1.5">{post.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">{post.body}</p>
              {post.image && (
                <div className="rounded-xl overflow-hidden mb-1 border border-white/5">
                  <img src={post.image} alt={post.title} className="w-full max-h-80 object-cover" />
                </div>
              )}
            </>
          )}

          {post.type === 'achievement' && (
            <div className="rounded-xl border border-moss-500/20 bg-moss-500/5 p-3 mb-3 flex items-center gap-3">
              <Trophy size={20} className="text-amber-400 shrink-0" />
              <p className="text-xs text-moss-200">Prestasi ini diverifikasi via sertifikat resmi sykabelajar.id</p>
            </div>
          )}

          <div className="flex items-center justify-between max-w-xs text-slate-500">
            <button onClick={onLike} disabled={isGuest} className={`flex items-center gap-1.5 text-xs hover:text-moss-300 transition ${post.liked ? 'text-moss-400' : ''} ${isGuest ? 'opacity-50' : ''}`}>
              <Heart size={16} className={post.liked ? 'fill-moss-400' : ''} /> {post.likes}
            </button>
            <button onClick={onToggleExpand} className="flex items-center gap-1.5 text-xs hover:text-sky-300 transition">
              <MessageCircle size={16} /> {totalComments}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-moss-300 transition">
              <Repeat2 size={16} /> {post.reposts}
            </button>
            <button onClick={onShare} className="flex items-center gap-1.5 text-xs hover:text-moss-300 transition">
              <Share2 size={16} />
            </button>
            <button className="hover:text-moss-300 transition">
              <Bookmark size={16} />
            </button>
          </div>

          {isExpanded && <CommentsSection postId={post.id} comments={post.comments} />}
        </div>
      </div>
    </Card>
  );
}
