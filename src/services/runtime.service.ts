import { supabase } from '@/lib/supabase';
import { demoAwards, demoCertificates, demoCompetitions, demoDailyTasks, demoFeed, demoLeaderboard, demoNotifications, demoOrders, demoUsers, demoQuestions, PRINT_CATALOG, type PrintCatalogItem } from '@/data/live';
import type { Award, AppNotification, Certificate, Competition, DailyTask, FeedPost, LeaderboardEntry, User, Order } from '@/types';
import { getProfileById } from '@/services/profile.service';

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
  for (const key of Object.keys(demoQuestions)) delete demoQuestions[key];
  PRINT_CATALOG.length = 0;
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
    educationLevel: typeof profile.grade === 'string' && profile.grade.toLowerCase().startsWith('sd') ? 'sd' : typeof profile.grade === 'string' && profile.grade.toLowerCase().startsWith('smp') ? 'smp' : profile.grade ? 'sma' : undefined,
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
  const { data, error } = await supabase.rpc('get_public_leaderboard', { p_limit: 100 });
  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  demoLeaderboard.push(...rows.map((row, index) => ({
    rank: Number(row.rank ?? index + 1),
    userId: String(row.user_id),
    username: String(row.username ?? ''),
    displayName: String(row.display_name ?? row.username ?? 'Pengguna'),
    profilePhoto: row.avatar_url ? String(row.avatar_url) : undefined,
    points: Number(row.xp ?? 0),
    school: row.institution ? String(row.institution) : undefined,
    educationLevel: undefined,
    emblems: [],
    change: 0,
  })));
  demoUsers.push(...demoLeaderboard.map((u) => ({
    id: u.userId, username: u.username, email: '', displayName: u.displayName, role: 'pelajar' as const,
    school: u.school, educationLevel: u.educationLevel, points: u.points, rank: u.rank, joinedAt: '',
    favoriteCategories: [], profilePhoto: u.profilePhoto, badges: [], emblems: [], followers: 0, following: 0,
  })));
}

export async function loadCompetitions() {
  const { data, error } = await supabase.rpc('get_public_competitions');
  if (error) throw error;
  demoCompetitions.push(...((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), slug: String(row.slug ?? ''), title: String(row.title ?? ''),
    category: String(row.category ?? 'mtk') as Competition['category'], posterUrl: row.poster_url ? String(row.poster_url) : undefined,
    shortDesc: String(row.short_description ?? ''), description: String(row.description ?? ''),
    juknis: row.juknis_url ? String(row.juknis_url) : '', juknisPdfUrl: row.juknis_url ? String(row.juknis_url) : undefined,
    prizes: [], points: 0, startDate: String(row.starts_at ?? row.registration_starts_at ?? ''),
    endDate: String(row.ends_at ?? row.announcement_at ?? ''), registrationDeadline: String(row.registration_ends_at ?? ''),
    status: mapCompetitionStatus(String(row.status ?? 'PUBLISHED')), participants: Number(row.participant_count ?? 0),
    level: 'Nasional', twibbonUrl: '', hasQuestions: false,
    featured: ['REGISTRATION_OPEN', 'LIVE'].includes(String(row.status)),
  })));
}

export async function loadNotifications(userId: string) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  demoNotifications.push(...((data ?? []) as Array<Record<string, any>>).map((n) => ({ id: String(n.id), type: n.type as AppNotification['type'], title: String(n.title ?? ''), body: String(n.body ?? ''), createdAt: String(n.created_at), read: Boolean(n.read_at), link: n.data?.link })));
}

export async function loadAwards(userId: string) {
  const { data, error } = await supabase.from('awards').select('*').eq('user_id', userId).order('issued_at', { ascending: false });
  if (error) throw error;
  demoAwards.push(...((data ?? []) as Array<Record<string, any>>).map((a) => ({ id: String(a.id), type: 'medal' as Award['type'], title: String(a.title ?? ''), subtitle: String(a.rank_code ?? ''), date: String(a.issued_at ?? a.created_at), competitionId: a.competition_id ?? undefined, imageUrl: a.emblem_url ?? undefined, color: 'from-moss-400 to-moss-600', points: Number(a.points ?? 0) })));
}

export async function loadCertificates(userId: string) {
  const { data, error } = await supabase.from('certificates').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  demoCertificates.push(...((data ?? []) as Array<Record<string, any>>).map((c) => ({ id: String(c.id), code: String(c.verification_code ?? c.id), userId: String(c.user_id), competitionId: String(c.competition_id), competitionTitle: String(c.competition_title ?? ''), type: (c.certificate_type ?? 'participant') as Certificate['type'], issuedAt: String(c.issued_at ?? c.created_at), verified: ['PUBLISHED', 'VERIFIED'].includes(String(c.status)) })));
}

export async function loadOrders(userId: string) {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  demoOrders.push(...((data ?? []) as Array<Record<string, any>>).map((o) => ({ id: String(o.id), code: String(o.order_code ?? o.id), payCode: String(o.payment_code ?? ''), userId: String(o.user_id), items: (o.order_items ?? []).map((i: any) => ({ id: String(i.id), category: String(i.product_type ?? 'sertifikat') as Order['items'][number]['category'], itemName: String(i.name ?? ''), quantity: Number(i.quantity ?? 1), price: Number(i.unit_price ?? 0) })), total: Number(o.total ?? 0), status: String(o.status ?? 'DRAFT').toLowerCase() as Order['status'], address: String(o.address_id ?? ''), trackingNumber: o.tracking_number ? String(o.tracking_number) : undefined, createdAt: String(o.created_at), updatedAt: String(o.updated_at) })));
}

export async function loadFeed() {
  const { data, error } = await supabase.from('posts').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  demoFeed.push(...((data ?? []) as Array<Record<string, any>>).map((p) => ({ id: String(p.id), userId: String(p.author_user_id ?? p.user_id), competitionId: p.competition_id ?? undefined, competitionSlug: p.competition_slug ?? undefined, title: String(p.title ?? ''), body: String(p.body ?? p.content ?? ''), createdAt: String(p.created_at), likes: Number(p.likes_count ?? 0), reposts: Number(p.reposts_count ?? 0), image: p.cover_url ?? undefined, type: p.competition_id ? 'competition' : 'post', meta: p.competition_id ? 'Lomba' : 'Post', comments: [] })));
}

export async function loadDailyTasks(userId?: string) {
  if (!userId) return;
  const { data, error } = await supabase.from('daily_tasks').select('*').eq('is_active', true).order('sort_order', { ascending: true });
  if (error) throw error;
  demoDailyTasks.push(...((data ?? []) as Array<Record<string, any>>).map((t) => ({ id: String(t.id), title: String(t.title ?? ''), type: String(t.task_type ?? 'assignment') as DailyTask['type'], description: String(t.description ?? ''), points: Number(t.points ?? 0), date: String(t.starts_at ?? t.created_at), expiresAt: String(t.ends_at ?? t.created_at), completed: false, retryUsed: 0, maxRetry: Number(t.max_claims_per_user ?? 1) })));
}

export async function loadPrintCatalog() {
  const { data, error } = await supabase.from('commerce_products').select('id,product_type,name,price,image_url,is_active,sort_order').eq('is_active', true).order('sort_order', { ascending: true });
  if (error) throw error;
  const allowed = new Set(['sertifikat', 'medali', 'emblem']);
  PRINT_CATALOG.push(...((data ?? []) as Array<Record<string, any>>).filter((row) => allowed.has(String(row.product_type))).map((row) => ({ id: String(row.id), category: String(row.product_type) as PrintCatalogItem['category'], name: String(row.name ?? ''), price: Number(row.price ?? 0), preview: row.image_url ? String(row.image_url) : undefined })));
}

export async function hydrateRuntime(userId?: string) {
  resetRuntimeCollections();
  await Promise.all([loadUsers(), loadCompetitions(), loadFeed(), loadPrintCatalog(), ...(userId ? [loadNotifications(userId), loadAwards(userId), loadCertificates(userId), loadOrders(userId), loadDailyTasks(userId)] : [])]);
  return userId ? getProfileById(userId).catch(() => null) : null;
}
