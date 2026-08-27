import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User, AppNotification, Order, Award, Certificate, Comment, FeedPost } from '@/types';
import { supabase } from '@/lib/supabase';
import { signIn, signUp, signOut } from '@/services/auth.service';
import { getProfileById, updateProfile as updateProfileRecord } from '@/services/profile.service';
import { hydrateRuntime, mapProfileToUser } from '@/services/runtime.service';
import { demoAwards, demoCertificates, demoFeed, demoNotifications, demoOrders, demoUsers } from '@/data/live';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  notifications: AppNotification[];
  awards: Award[];
  certificates: Certificate[];
  orders: Order[];
  feed: FeedPost[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: Partial<User> & { email: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  addOrder: (order: Order) => void;
  togglePostLike: (postId: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string, replyId?: string) => Promise<void>;
  addComment: (postId: string, body: string, parentId?: string) => Promise<void>;
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppState | null>(null);
const GUEST_KEY = 'sykabelajar_guest_mode_v1';

function syncCollectionsIntoReactState(setters: {
  setNotifications: (v: AppNotification[]) => void;
  setAwards: (v: Award[]) => void;
  setCertificates: (v: Certificate[]) => void;
  setOrders: (v: Order[]) => void;
  setFeed: (v: FeedPost[]) => void;
}) {
  setters.setNotifications([...demoNotifications]);
  setters.setAwards([...demoAwards]);
  setters.setCertificates([...demoCertificates]);
  setters.setOrders([...demoOrders]);
  setters.setFeed([...demoFeed]);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<{ id: string; email?: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const refresh = useCallback(async (userId?: string, email?: string) => {
    try {
      await hydrateRuntime(userId);
      if (userId) {
        const fresh = await getProfileById(userId);
        if (fresh) {
          const liveEntry = demoUsers.find((item) => item.id === userId);
          const mapped = mapProfileToUser(fresh, email);
          setUser({ ...mapped, points: liveEntry?.points ?? mapped.points, rank: liveEntry?.rank ?? mapped.rank });
        }
      } else {
        setUser(null);
      }
      syncCollectionsIntoReactState({ setNotifications, setAwards, setCertificates, setOrders, setFeed });
      return true;
    } catch (error) {
      console.error('[SykaBelajar] runtime hydration failed', error);
      syncCollectionsIntoReactState({ setNotifications, setAwards, setCertificates, setOrders, setFeed });
      return false;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      if (data.session?.user) {
        setAuthUser({ id: data.session.user.id, email: data.session.user.email });
        setIsGuest(false);
        localStorage.removeItem(GUEST_KEY);
        await refresh(data.session.user.id, data.session.user.email);
      } else {
        setAuthUser(null);
        await refresh();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!alive) return;
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email });
        setIsGuest(false);
        localStorage.removeItem(GUEST_KEY);
        await refresh(session.user.id, session.user.email);
      } else {
        setAuthUser(null);
        setUser(null);
        if (!isGuest) await refresh();
      }
    });

    return () => { alive = false; subscription.subscription.unsubscribe(); };
  }, [refresh, isGuest]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((x) => x.id !== id)), 3500);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn(email.trim(), password);
      if (!result.user) return { ok: false, error: 'Login gagal: sesi pengguna tidak tersedia.' };
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? 'Email atau password tidak valid.' };
    }
  }, []);

  const register = useCallback(async (data: Partial<User> & { email: string; password: string }) => {
    try {
      await signUp(data.email.trim(), data.password, {
        username: data.username ?? '', full_name: data.displayName ?? '', account_type: data.role === 'guru' ? 'teacher' : 'student',
        birth_date: data.birthDate, institution: data.school, grade: data.educationLevel,
      });
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? 'Pendaftaran gagal.' };
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, '1'); setIsGuest(true); setAuthUser(null); setUser(null); void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await signOut(); } finally {
      localStorage.removeItem(GUEST_KEY); setAuthUser(null); setUser(null); setIsGuest(false); void refresh();
    }
  }, [refresh]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!authUser) return;
    const patch: Record<string, unknown> = {};
    if (data.username !== undefined) patch.username = data.username;
    if (data.displayName !== undefined) patch.full_name = data.displayName;
    if (data.bio !== undefined) patch.bio = data.bio;
    if (data.school !== undefined) patch.institution = data.school;
    if (data.birthDate !== undefined) patch.birth_date = data.birthDate;
    if (data.profilePhoto !== undefined) patch.avatar_url = data.profilePhoto;
    if (data.educationLevel !== undefined) patch.grade = data.educationLevel;
    const fresh = await updateProfileRecord(authUser.id, patch);
    const liveEntry = demoUsers.find((item) => item.id === authUser.id);
    const mapped = mapProfileToUser(fresh, authUser.email);
    setUser({ ...mapped, points: liveEntry?.points ?? mapped.points, rank: liveEntry?.rank ?? mapped.rank });
  }, [authUser]);

  const markNotificationRead = useCallback(async (id: string) => {
    if (!authUser) return;
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', authUser.id);
    if (error) throw error;
    setNotifications((items) => items.map((n) => n.id === id ? { ...n, read: true } : n));
  }, [authUser]);

  const markAllNotificationsRead = useCallback(async () => {
    if (!authUser) return;
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', authUser.id).is('read_at', null);
    if (error) throw error;
    setNotifications((items) => items.map((n) => ({ ...n, read: true })));
  }, [authUser]);

  const addPoints = useCallback(async (_points: number) => {
    throw new Error('XP hanya boleh diberikan oleh backend/server-authoritative workflows.');
  }, []);

  const addNotification = useCallback(async (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!authUser) return;
    const { data, error } = await supabase.from('notifications').insert({ user_id: authUser.id, type: n.type, title: n.title, body: n.body, data: { link: n.link, icon: n.icon } }).select('*').single();
    if (error) throw error;
    setNotifications((items) => [{ id: data.id, type: data.type, title: data.title, body: data.body ?? '', createdAt: data.created_at, read: false, link: data.data?.link }, ...items]);
  }, [authUser]);

  const addOrder = useCallback((order: Order) => setOrders((items) => [order, ...items]), []);

  const togglePostLike = useCallback(async (postId: string) => {
    if (!authUser) return;
    const { data: existing, error: lookupError } = await supabase.from('post_likes').select('post_id').eq('post_id', postId).eq('user_id', authUser.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', authUser.id); if (error) throw error;
    } else {
      const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: authUser.id }); if (error) throw error;
    }
    await refresh(authUser.id, authUser.email);
  }, [authUser, refresh]);

  const toggleCommentLike = useCallback(async (_postId: string, commentId: string) => {
    if (!authUser) return;
    const { data: existing, error: lookupError } = await supabase.from('comment_likes').select('comment_id').eq('comment_id', commentId).eq('user_id', authUser.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', authUser.id); if (error) throw error;
    } else {
      const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: authUser.id }); if (error) throw error;
    }
    await refresh(authUser.id, authUser.email);
  }, [authUser, refresh]);

  const addComment = useCallback(async (postId: string, body: string, parentId?: string) => {
    if (!authUser || !body.trim()) return;
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: authUser.id, parent_id: parentId ?? null, body: body.trim() });
    if (error) throw error;
    await refresh(authUser.id, authUser.email);
  }, [authUser, refresh]);

  const value = useMemo<AppState>(() => ({ user, isAuthenticated: !!authUser, isGuest, notifications, awards, certificates, orders, feed, login, register, loginAsGuest, logout, updateProfile, markNotificationRead, markAllNotificationsRead, addPoints, addNotification, addOrder, togglePostLike, toggleCommentLike, addComment, toast }), [user, authUser, isGuest, notifications, awards, certificates, orders, feed, login, register, loginAsGuest, logout, updateProfile, markNotificationRead, markAllNotificationsRead, addPoints, addNotification, addOrder, togglePostLike, toggleCommentLike, addComment, toast]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-xl shadow-pop text-sm font-medium animate-slide-up flex items-center gap-2 ${t.type === 'success' ? 'bg-moss-600 text-white' : t.type === 'error' ? 'bg-err text-white' : 'bg-ink-700 text-white'}`}><span className="w-1.5 h-1.5 rounded-full bg-white/80" />{t.message}</div>)}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
