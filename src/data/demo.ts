// Compatibility shim only. No demo/mock records live here.
// Runtime collections are empty until populated by Supabase adapters.
export {
  liveUsers as demoUsers,
  liveCompetitions as demoCompetitions,
  liveDailyTasks as demoDailyTasks,
  liveLeaderboard as demoLeaderboard,
  liveAwards as demoAwards,
  liveCertificates as demoCertificates,
  liveNotifications as demoNotifications,
  liveOrders as demoOrders,
  liveFeed as demoFeed,
  liveQuestions as demoQuestions,
  printCatalog as PRINT_CATALOG,
  CATEGORY_LABELS,
  LEVEL_LABELS,
  getEmblem,
  WA_NUMBER,
} from './live';
