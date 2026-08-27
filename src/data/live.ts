import type {
  Award,
  AppNotification,
  Certificate,
  Competition,
  DailyTask,
  FeedPost,
  LeaderboardEntry,
  Order,
  User,
  Question,
  Emblem,
} from '@/types';

export const CATEGORY_LABELS: Record<string, string> = {
  mtk: 'Matematika',
  ipa: 'Sains & IPA',
  ips: 'Sosial & IPS',
  bindo: 'Bahasa Indonesia',
  bing: 'Bahasa Inggris',
  seni: 'Seni & Budaya',
  olahraga: 'Olahraga',
  tech: 'Teknologi',
  lingkungan: 'Lingkungan',
};

export const LEVEL_LABELS: Record<string, string> = {
  sd: 'SD 4–6 Sederajat',
  smp: 'SMP 1–3 Sederajat',
  sma: 'SMA 1–3 Sederajat',
};

// These are runtime collections populated only from Supabase.
// They intentionally start empty: no fallback/demo records exist.
export const demoUsers: User[] = [];
export const demoCompetitions: Competition[] = [];
export const demoDailyTasks: DailyTask[] = [];
export const demoLeaderboard: LeaderboardEntry[] = [];
export const demoAwards: Award[] = [];
export const demoCertificates: Certificate[] = [];
export const demoNotifications: AppNotification[] = [];
export const demoOrders: Order[] = [];
export const demoFeed: FeedPost[] = [];
export const demoQuestions: Record<string, Question[]> = {};

export function getEmblem(_id: string): Emblem | undefined {
  return undefined;
}
