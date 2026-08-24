import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, AppNotification, Order, Award, Certificate, Comment, FeedPost } from '@/types';
import { demoUsers, demoAwards, demoCertificates, demoNotifications, demoOrders, demoFeed } from '@/data/demo';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  notifications: AppNotification[];
  awards: Award[];
  certificates: Certificate[];
  orders: Order[];
  feed: FeedPost[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (data: Partial<User> & { email: string; password: string }) => { ok: boolean; error?: string };
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addPoints: (points: number) => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  addOrder: (order: Order) => void;
  togglePostLike: (postId: string) => void;
  toggleCommentLike: (postId: string, commentId: string, replyId?: string) => void;
  addComment: (postId: string, body: string, parentId?: string) => void;
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'sykabelajar_session_v2';

interface StoredSession {
  userId: string | null;
  isGuest: boolean;
  customUser: User | null;
}

function loadSession(): StoredSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredSession;
  } catch {}
  return { userId: null, isGuest: false, customUser: null };
}

function saveSession(s: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const ALL_USERS = [...demoUsers];

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession>(() => loadSession());
  const [customUser, setCustomUser] = useState<User | null>(session.customUser);
  const [notifications, setNotifications] = useState<AppNotification[]>(demoNotifications);
  const [awards] = useState<Award[]>(demoAwards);
  const [certificates] = useState<Certificate[]>(demoCertificates);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [feed, setFeed] = useState<FeedPost[]>(demoFeed);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const currentUser: User | null =
    session.userId === 'custom' && customUser ? customUser : ALL_USERS.find((u) => u.id === session.userId) ?? null;

  useEffect(() => {
    saveSession({ userId: session.userId, isGuest: session.isGuest, customUser });
  }, [session, customUser]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const login = useCallback((email: string, _password: string) => {
    const found = ALL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: 'Email belum terdaftar. Coba aruna@sykabelajar.id' };
    setSession({ userId: found.id, isGuest: false, customUser: null });
    return { ok: true };
  }, []);

  const register = useCallback((data: Partial<User> & { email: string; password: string }) => {
    if (ALL_USERS.some((u) => u.email.toLowerCase() === data.email!.toLowerCase())) {
      return { ok: false, error: 'Email sudah terdaftar. Silakan login.' };
    }
    const newUser: User = {
      id: 'custom',
      username: data.username || ('user' + Math.floor(Math.random() * 9999)),
      email: data.email,
      displayName: data.displayName || data.username || 'Pengguna Baru',
      role: data.role || 'pelajar',
      bio: '',
      school: data.school,
      educationLevel: data.educationLevel,
      birthDate: data.birthDate,
      profilePhoto: data.profilePhoto,
      points: 0,
      rank: 0,
      joinedAt: new Date().toISOString().slice(0, 10),
      favoriteCategories: data.favoriteCategories || [],
      badges: [],
      emblems: [],
      followers: 0,
      following: 0,
    };
    setCustomUser(newUser);
    setSession({ userId: 'custom', isGuest: false, customUser: newUser });
    return { ok: true };
  }, []);

  const loginAsGuest = useCallback(() => {
    setSession({ userId: null, isGuest: true, customUser: null });
  }, []);

  const logout = useCallback(() => {
    setSession({ userId: null, isGuest: false, customUser: null });
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      if (session.userId === 'custom') {
        setCustomUser(updated);
      }
    }
  }, [currentUser, session.userId]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  const addPoints = useCallback((points: number) => {
    if (session.userId === 'custom' && customUser) {
      setCustomUser({ ...customUser, points: customUser.points + points });
    }
  }, [customUser, session.userId]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications((ns) => [
      { ...n, id: 'n-' + Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), read: false },
      ...ns,
    ]);
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((os) => [order, ...os]);
  }, []);

  const togglePostLike = useCallback((postId: string) => {
    setFeed((posts) => posts.map((p) => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  }, []);

  const toggleCommentLike = useCallback((postId: string, commentId: string, replyId?: string) => {
    setFeed((posts) => posts.map((p) => {
      if (p.id !== postId) return p;
      const mapComment = (c: Comment): Comment => {
        if (replyId) {
          return {
            ...c,
            replies: c.replies.map((r) => r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r),
          };
        }
        return c.id === commentId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c;
      };
      return { ...p, comments: p.comments.map(mapComment) };
    }));
  }, []);

  const addComment = useCallback((postId: string, body: string, parentId?: string) => {
    const u = currentUser;
    if (!u || !body.trim()) return;
    const showcase = u.showcaseEmblems && u.showcaseEmblems.length > 0
      ? u.showcaseEmblems.slice(0, 3)
      : u.emblems.slice(0, 3).map((e) => e.id);
    const newComment: Comment = {
      id: 'cm-' + Math.random().toString(36).slice(2),
      postId,
      userId: u.id,
      authorName: u.displayName,
      authorUsername: u.username,
      authorId: u.id,
      authorEmblems: showcase,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      replies: [],
    };
    setFeed((posts) => posts.map((p) => {
      if (p.id !== postId) return p;
      if (parentId) {
        return {
          ...p,
          comments: p.comments.map((c) => c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c),
        };
      }
      return { ...p, comments: [...p.comments, newComment] };
    }));
  }, [currentUser]);

  const value: AppState = {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isGuest: session.isGuest,
    notifications,
    awards,
    certificates,
    orders,
    feed,
    login,
    register,
    loginAsGuest,
    logout,
    updateProfile,
    markNotificationRead,
    markAllNotificationsRead,
    addPoints,
    addNotification,
    addOrder,
    togglePostLike,
    toggleCommentLike,
    addComment,
    toast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </AppContext.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[] }) {
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-pop text-sm font-medium animate-slide-up flex items-center gap-2 ${
            t.type === 'success'
              ? 'bg-moss-600 text-white'
              : t.type === 'error'
                ? 'bg-err text-white'
                : 'bg-ink-700 text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
