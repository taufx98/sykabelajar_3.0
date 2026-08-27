import type { Award, AppNotification, Certificate, Competition, DailyTask, FeedPost, LeaderboardEntry, Order, User, Question, Emblem } from '@/types';

/** Runtime-only containers. They start empty and are populated exclusively from Supabase services. */
export const liveUsers: User[] = [];
export const liveCompetitions: Competition[] = [];
export const liveDailyTasks: DailyTask[] = [];
export const liveLeaderboard: LeaderboardEntry[] = [];
export const liveAwards: Award[] = [];
export const liveCertificates: Certificate[] = [];
export const liveNotifications: AppNotification[] = [];
export const liveOrders: Order[] = [];
export const liveFeed: FeedPost[] = [];
export const liveQuestions: Record<string, Question[]> = {};
export interface PrintCatalogItem { id: string; category: 'sertifikat' | 'medali' | 'emblem'; name: string; price: number; preview?: string; }
export const printCatalog: PrintCatalogItem[] = [];

export const CATEGORY_LABELS: Record<string, string> = {
  mtk: 'Matematika', ipa: 'Sains & IPA', ips: 'Sosial & IPS', bindo: 'Bahasa Indonesia', bing: 'Bahasa Inggris',
  seni: 'Seni & Budaya', olahraga: 'Olahraga', tech: 'Teknologi', lingkungan: 'Lingkungan',
};
export const LEVEL_LABELS: Record<string, string> = { sd: 'SD 4–6 Sederajat', smp: 'SMP 1–3 Sederajat', sma: 'SMA 1–3 Sederajat' };
export function getEmblem(_id: string): Emblem | undefined { return undefined; }
