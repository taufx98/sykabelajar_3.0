import { supabase } from '@/lib/supabase';
import { demoAwards, demoCertificates, demoCompetitions, demoDailyTasks, demoFeed, demoLeaderboard, demoNotifications, demoOrders, demoUsers } from '@/data/live';
import type { Award, AppNotification, Certificate, Competition, DailyTask, FeedPost, LeaderboardEntry, Order, User } from '@/types';
import { getProfileById } from '@/services/profile.service';
import { listPublicCompetitions, getRegistrationsForCompetition } from '@/services/competition.service';

export function resetRuntimeCollections() {
  demoUsers.length = 0;
  demoCompetitions.length = 0;
  demoDailyTasks.length = 0;
  demoLeaderboard.length = 0;
  demoAwards.length = 0;
  demoCertificates.length = 0;
  demoNotifications.length = 0;
  demoOrders.length = 0;
  demoFeed.length = 0;
  for (const key of Object.keys((awaitableQuestions() as object))) delete (awaitableQuestions() as Record<string, unknown>)[key];
}

function awaitableQuestions(): Record<string, unknown> {
  // Kept as a tiny indirection so the runtime module never owns a second data source.
  return {};
}

function mapCompetitionStatus(status: string): Competition['status'] {
  if (status === 'REGISTRATION_OPEN') return 'open';
  if (status === 'LIVE') return 'in-progress';
  if (status === 'RESULT_PUBLISHED' || status === 'ARCHIVED') return 'completed';
  return 'upcoming';
}

function mapAccountRole(accountType: string | null | undefined): User['role'] {
  return accountType === 'teacher' ? 'guru' : 'pelajar';
}

export function mapProfileToUser(profile: any, email = ''): User {
  return {
    id: profile.id,
    username: profile.username ?? '',
    email,
    displayName: profile.full_name ?? profile.username ?? 'Pengguna',
    role: mapAccountRole(profile.account_type),
    bio: profile.bio ?? undefined,
    school: profile.institution ?? undefined,
    educationLevel: profile.grade?.toLowerCase().startsWith('sd') ? 'sd' : profile.grade?.toLowerCase().startsWith('smp') ? 'smp' : profile.grade ? 'sma' : undefined,
    birthDate: profile.birth_date ?? undefined,
    points: 0,
    rank: 0,
    joinedAt: profile.created_at,
    favoriteCategories: [],
    profilePhoto: profile.avatar_url ?? undefined,
    badges: [],
    emblems: [],
    followers: 0,
    following: 0,
    verified: profile.status === 'ACTIVE',
  };
}

export async function loadUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
  if (error) throw error;

  const users = (data ?? []).map((profile) => mapProfileToUser(profile));
  demoUsers.push(...users);

  const { data: ledger, error: ledgerError } = await supabase.from('xp_ledger').select('user_id,amount');
  if (!ledgerError) {
    const xpByUser = new Map<string, number>();
    for (const row of ledger ?? []) xpByUser.set(row.user_id, (xpByUser.get(row.user_id) ?? 0) + Number(row.amount ?? 0));
    for (const user of demoUsers) user.points = xpByUser.get(user.id) ?? 0;
  }

  const sorted = [...demoUsers].sort((a, b) => b.points - a.points);
  sorted.forEach((user, index) => { user.rank = user.points > 0 ? index + 1 : 0; });
  demoLeaderboard.push(...sorted.map((u) => ({
    rank: u.rank,
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    profilePhoto: u.profilePhoto,
    points: u.points,
    school: u.school,
    educationLevel: u.educationLevel,
    emblems: u.emblems,
    change: 0,
  })) as LeaderboardEntry[]);
}

export async function loadCompetitions() {
  const rows = await listPublicCompetitions();
  const mapped: Competition[] = [];
  for (const row of rows) {
    let participants = 0;
    try {
      const registrations = await getRegistrationsForCompetition(row.id);
      participants = registrations.length;
    } catch {
      participants = 0;
    }
    mapped.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: (row.category || 'mtk') as Competition['category'],
      posterUrl: row.poster_url ?? undefined,
      shortDesc: row.short_description ?? '',
      description: row.description ?? '',
      juknis: row.juknis_url ?? '',
      juknisPdfUrl: row.juknis_url ?? undefined,
      prizes: [],
      points: 0,
      startDate: row.starts_at ?? row.created_at,
      endDate: row.ends_at ?? row.announcement_at ?? row.created_at,
      registrationDeadline: row.registration_ends_at ?? row.starts_at ?? row.created_at,
      status: mapCompetitionStatus(row.status),
      participants,
      level: 'Nasional',
      twibbonUrl: '',
      hasQuestions: false,
      featured: row.status === 'REGISTRATION_OPEN' || row.status === 'LIVE',
    });
  }
  demoCompetitions.push(...mapped);
}

export async function loadNotifications(userId: string) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  demoNotifications.push(...((data ?? []).map((n: any) => ({
    id: n.id,
    type: n.type as AppNotification['type'],
    title: n.title,
    body: n.body ?? '',
    createdAt: n.created_at,
    read: !!n.read_at,
    link: n.data?.link,
  }))));
}

export async function loadAwards(userId: string) {
  const { data, error } = await supabase.from('awards').select('*').eq('user_id', userId).order('issued_at', { ascending: false });
  if (error) throw error;
  demoAwards.push(...((data ?? []).map((a: any) => ({
    id: a.id,
    type: 'medal' as Award['type'],
    title: a.title,
    subtitle: a.rank_code ?? '',
    date: a.issued_at,
    competitionId: a.competition_id ?? undefined,
    imageUrl: a.emblem_url ?? undefined,
    color: 'from-moss-400 to-moss-600',
    points: Number(a.points ?? 0),
  }))));
}

export async function loadCertificates(userId: string) {
  const { data, error } = await supabase.from('certificates').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  demoCertificates.push(...((data ?? []).map((c: any) => ({
    id: c.id,
    code: c.id,
    userId: c.user_id,
    competitionId: c.competition_id,
    competitionTitle: '',
    type: 'participant' as Certificate['type'],
    issuedAt: c.created_at,
    verified: c.status === 'PUBLISHED',
  }))));
}

export async function loadOrders(userId: string) {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  demoOrders.push(...((data ?? []).map((o: any) => ({
    id: o.id,
    code: o.id,
    payCode: '',
    userId: o.user_id,
    items: (o.order_items ?? []).map((i: any) => ({ id: i.id, category: 'sertifikat', itemName: i.name, quantity: i.quantity, price: Number(i.unit_price ?? 0) })),
    total: Number(o.total ?? 0),
    status: String(o.status ?? 'DRAFT').toLowerCase() as Order['status'],
    address: o.address_id ?? '',
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }))));
}

export async function loadFeed() {
  const { data, error } = await supabase.from('posts').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  demoFeed.push(...((data ?? []).map((p: any) => ({
    id: p.id,
    userId: p.author_user_id,
    competitionId: p.competition_id ?? undefined,
    title: p.title,
    body: p.body,
    createdAt: p.created_at,
    likes: 0,
    reposts: 0,
    image: p.cover_url ?? undefined,
    type: p.competition_id ? 'competition' : 'post',
    meta: p.competition_id ? 'Lomba' : 'Post',
    comments: [],
  } as FeedPost))));
}

export async function loadDailyTasks() {
  const { data, error } = await supabase.from('daily_tasks').select('*').eq('is_active', true).order('sort_order', { ascending: true });
  if (error) throw error;
  demoDailyTasks.push(...((data ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    type: t.task_type as DailyTask['type'],
    description: t.description ?? '',
    points: Number(t.points ?? 0),
    date: t.starts_at ?? t.created_at,
    expiresAt: t.ends_at ?? t.created_at,
    completed: false,
    retryUsed: 0,
    maxRetry: t.max_claims_per_user ?? 1,
  }))));
}

export async function hydrateRuntime(userId?: string) {
  resetRuntimeCollections();
  await Promise.all([
    loadUsers(),
    loadCompetitions(),
    loadFeed(),
    loadDailyTasks(),
    ...(userId ? [loadNotifications(userId), loadAwards(userId), loadCertificates(userId), loadOrders(userId)] : []),
  ]);
  if (userId) {
    const user = await getProfileById(userId).catch(() => null);
    return user;
  }
  return null;
}
