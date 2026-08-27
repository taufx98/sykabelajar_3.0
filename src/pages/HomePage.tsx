import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, ChevronRight, Eye, Flame, Heart, MessageCircle, Repeat2, Share2, Sparkles, Trophy, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CommentsSection } from '@/components/ui/Comments';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CATEGORY_LABELS } from '@/data/catalog';
import { listPublishedPosts, togglePostLike, type SocialPost } from '@/services/social.service';
import { getPublicCompetitions, type PublicLeaderboardRow } from '@/services/platform.service';
import { timeAgo } from '@/lib/utils';

export function HomePage() {
  const { user, isGuest, notifications, toast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'lomba' | 'prestasi'>('lomba');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<PublicLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [nextPosts, nextCompetitions, nextLeaders] = await Promise.all([listPublishedPosts(30), getPublicCompetitions(5), (async()=>{ const { data, error } = await import('@/lib/supabase').then(({ supabase }) => supabase.rpc('get_public_leaderboard', { p_limit: 5 })); if (error) throw error; return (data ?? []) as PublicLeaderboardRow[]; })()]);
      setPosts(nextPosts); setCompetitions(nextCompetitions); setLeaders(nextLeaders);
    } catch (error: any) { toast(error?.message ?? 'Beranda gagal dimuat.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    if (tab === 'lomba') return posts.filter((post) => Boolean(post.competition_id));
    return posts.filter((post) => !post.competition_id);
  }, [posts, tab]);
  const unread = notifications.filter((n) => !n.read).slice(0, 5);
  const nextCompetition = competitions.find((c: any) => ['REGISTRATION_OPEN','LIVE'].includes(String(c.status))) ?? competitions[0];

  const handleLike = async (postId: string) => {
    if (isGuest || !user) { toast('Masuk untuk menyukai postingan.', 'info'); return; }
    try { await togglePostLike(postId); await load(); } catch (error: any) { toast(error?.message ?? 'Gagal memperbarui like.', 'error'); }
  };

  return <div>
    <div className="sticky top-0 z-20 glass border-b border-white/5"><div className="px-4 py-3 flex items-center justify-between"><h2 className="font-display font-bold text-lg text-white">Beranda</h2><Sparkles size={18} className="text-moss-400"/></div><div className="flex">{(['lomba','prestasi'] as const).map((item)=><button key={item} onClick={()=>setTab(item)} className={`flex-1 py-3 text-sm font-medium relative ${tab===item?'text-moss-300':'text-slate-500 hover:text-slate-300'}`}>{item==='lomba'?'Lomba':'Prestasi'}{tab===item&&<span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 w-12 bg-moss-400 rounded-full"/>}</button>)}</div></div>

    <div className="px-4 py-4"><div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
      <main className="space-y-4">
        {!isGuest && nextCompetition && <Link to={`/lomba/${nextCompetition.slug}`}><Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-moss-500/10 to-transparent"><div className="w-12 h-12 rounded-xl bg-moss-500/20 flex items-center justify-center shrink-0"><Trophy size={22} className="text-moss-400"/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white">{String(nextCompetition.status)==='LIVE'?'Uji Kompetensi sedang berlangsung':'Uji Kompetensi terbuka'}</p><p className="text-xs text-slate-400 truncate">{nextCompetition.title}</p></div><Badge color="moss">Lihat</Badge></Card></Link>}
        {!isGuest && <Link to="/daily-tasks"><Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-amber-500/10 to-transparent"><div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0"><Flame size={22} className="text-amber-400"/></div><div className="flex-1"><p className="text-sm font-semibold text-white">Daily Tasks</p><p className="text-xs text-slate-400">Bangun XP melalui aktivitas harian.</p></div><Badge color="warn">Kerjakan</Badge></Card></Link>}

        {loading ? <div className="space-y-4"><SkeletonCard/><SkeletonCard/><SkeletonCard/></div> : filtered.length ? filtered.map((post)=><FeedPostCard key={post.id} post={post} expanded={expandedPost===post.id} onExpand={()=>setExpandedPost((id)=>id===post.id?null:post.id)} onLike={()=>void handleLike(post.id)} onOpen={()=>post.competition_slug&&navigate(`/lomba/${post.competition_slug}`)} isGuest={isGuest}/>) : <Card className="p-10 text-center"><Trophy size={34} className="mx-auto text-slate-600 mb-3"/><p className="text-sm text-slate-400">{tab==='lomba'?'Belum ada postingan lomba publik.':'Belum ada postingan prestasi.'}</p></Card>}
      </main>

      <aside className="space-y-4 lg:sticky lg:top-[108px]">
        <Card className="p-4"><div className="flex items-center justify-between mb-3"><div><p className="text-xs text-slate-500">Personal</p><h3 className="font-display font-semibold text-white">Notifikasi kamu</h3></div><Link to="/notifications" className="text-xs text-moss-400">Lihat semua</Link></div>{unread.length ? <div className="space-y-2">{unread.map((n)=><Link to={n.link??'/notifications'} key={n.id} className="block rounded-xl border border-white/5 bg-ink-800/35 p-3 hover:border-moss-500/20"><p className="text-xs font-semibold text-white line-clamp-1">{n.title}</p><p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.body}</p><span className="text-[10px] text-slate-600 mt-2 block">{timeAgo(n.createdAt)}</span></Link>)}</div> : <p className="text-xs text-slate-500 py-4 text-center">Tidak ada notifikasi baru.</p>}</Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-3"><div><p className="text-xs text-slate-500">Peringkat</p><h3 className="font-display font-semibold text-white">Top 5 XP Global</h3></div><Link to="/leaderboard" className="text-xs text-moss-400">Semua</Link></div><div className="space-y-2.5">{leaders.map((u)=><div key={u.user_id} className="flex items-center gap-2"><div className="w-6 text-center text-[10px] text-slate-500">{u.rank}</div><Avatar name={u.display_name||u.username||'U'} id={u.user_id} size={30} src={u.avatar_url||undefined}/><div className="min-w-0 flex-1"><p className="text-xs text-white truncate">{u.display_name||u.username}</p><p className="text-[10px] text-slate-500 truncate">{u.institution||'—'}</p></div><span className="text-xs font-semibold text-moss-300">{Number(u.xp||0).toLocaleString('id-ID')}</span></div>)}{!leaders.length&&<p className="text-xs text-slate-500 text-center py-4">Belum ada data XP.</p>}</div></Card>
      </aside>
    </div></div>
  </div>;
}

function FeedPostCard({ post, expanded, onExpand, onLike, onOpen, isGuest }: { post: SocialPost; expanded:boolean; onExpand:()=>void; onLike:()=>void; onOpen:()=>void; isGuest:boolean }) {
  const author = post.author_name || 'Pengguna';
  const total = post.comments;
  return <Card className="p-4 animate-fade-in"><div className="flex gap-3"><Link to={`/profile/${post.author_username}`}><Avatar name={author} id={post.author_user_id} size={44} src={post.avatar_url??undefined}/></Link><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><Link to={`/profile/${post.author_username}`} className="text-sm font-semibold text-white hover:text-moss-300 truncate">{author}</Link><span className="chip bg-moss-500/10 text-moss-300 border border-moss-500/20 text-[10px]">{post.competition_id?'Lomba':'Prestasi'}</span><span className="text-xs text-slate-600">· {timeAgo(post.created_at)}</span></div><p className="text-xs text-slate-500 mb-2">@{post.author_username}</p>{post.competition_id?<button onClick={onOpen} className="text-left w-full"><h3 className="font-display font-semibold text-[15px] text-white mb-1.5 hover:text-moss-300">{post.title}</h3><p className="text-sm text-slate-300 leading-relaxed mb-3">{post.body}</p>{post.cover_url&&<img src={post.cover_url} alt={post.title} loading="lazy" className="w-full max-h-96 object-cover rounded-xl border border-white/5"/>}<p className="text-xs text-moss-400 flex items-center gap-1 mt-3">Lihat detail uji kompetensi <ChevronRight size={14}/></p></button>:<><h3 className="font-display font-semibold text-[15px] text-white mb-1.5">{post.title}</h3><p className="text-sm text-slate-300 leading-relaxed mb-3 whitespace-pre-line">{post.body}</p>{post.cover_url&&<img src={post.cover_url} alt={post.title} loading="lazy" className="w-full max-h-96 object-cover rounded-xl border border-white/5"/>}</>}<div className="flex items-center justify-between max-w-md text-slate-500 mt-3"><button onClick={onLike} disabled={isGuest} className={`flex items-center gap-1.5 text-xs ${post.liked?'text-moss-400':''}`}><Heart size={16} className={post.liked?'fill-moss-400':''}/>{post.likes}</button><button onClick={onExpand} className="flex items-center gap-1.5 text-xs"><MessageCircle size={16}/>{total}</button><span className="flex items-center gap-1.5 text-xs"><Repeat2 size={16}/>{0}</span><button onClick={()=>{void navigator.clipboard?.writeText(window.location.href);}} className="flex items-center gap-1.5 text-xs"><Share2 size={16}/></button></div>{expanded&&<CommentsSection postId={post.id}/>}</div></div></Card>;
}
