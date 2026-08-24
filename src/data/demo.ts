import type {
  User, Competition, Question, DailyTask, Certificate, Award,
  AppNotification, Order, FeedPost, LeaderboardEntry, Emblem, Comment,
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

const EMBLEM_DEFS: Record<string, Emblem> = {
  n1: { id: 'n1', name: 'Emblem Nasional 1', competitionTitle: 'Olimpiade Matematika Nusantara 2026', position: 'Juara 1', color: 'from-amber-400 to-amber-600', icon: 'trophy' },
  n2: { id: 'n2', name: 'Emblem Nasional 2', competitionTitle: 'Olimpiade Matematika Nusantara 2026', position: 'Juara 2', color: 'from-slate-300 to-slate-500', icon: 'medal' },
  n3: { id: 'n3', name: 'Emblem Nasional 3', competitionTitle: 'Olimpiade Matematika Nusantara 2026', position: 'Juara 3', color: 'from-amber-600 to-amber-800', icon: 'medal' },
  p1: { id: 'p1', name: 'Emblem Provinsi 1', competitionTitle: 'Lomba Sains Provinsi Jawa Barat', position: 'Juara 1', color: 'from-moss-400 to-moss-600', icon: 'trophy' },
  p2: { id: 'p2', name: 'Emblem Provinsi 2', competitionTitle: 'Lomba Sains Provinsi Jawa Barat', position: 'Juara 2', color: 'from-sky-400 to-sky-600', icon: 'medal' },
  k1: { id: 'k1', name: 'Emblem Kabupaten 1', competitionTitle: 'Cerdas Cermat Kabupaten Bandung', position: 'Juara 1', color: 'from-violet-400 to-violet-600', icon: 'award' },
  k2: { id: 'k2', name: 'Emblem Kabupaten 2', competitionTitle: 'Cerdas Cermat Kabupaten Bandung', position: 'Juara 2', color: 'from-rose-400 to-rose-600', icon: 'award' },
  streak30: { id: 'streak30', name: 'Streak 30 Hari', competitionTitle: 'Daily Tasks', position: 'Dedikasi 30 Hari', color: 'from-moss-400 to-teal-deep', icon: 'flame' },
  top10: { id: 'top10', name: 'Top 10 Nasional', competitionTitle: 'Leaderboard Nasional', position: 'Peringkat 10 Besar', color: 'from-moss-400 to-teal-deep', icon: 'star' },
};

export function getEmblem(id: string): Emblem | undefined {
  return EMBLEM_DEFS[id];
}

export const demoUsers: User[] = [
  {
    id: 'u-me', username: 'arunaputra', email: 'aruna@sykabelajar.id', displayName: 'Aruna Putra',
    role: 'pelajar', bio: 'Suka matematika & sains. Target uji kompetensi nasional.',
    school: 'SMP Negeri 1 Bandung', educationLevel: 'smp', birthDate: '2011-05-15',
    points: 4820, rank: 7, joinedAt: '2025-01-12', favoriteCategories: ['mtk', 'ipa', 'tech'],
    badges: ['Streak 30 Hari', 'Top 10 Nasional'], emblems: [EMBLEM_DEFS.p1, EMBLEM_DEFS.streak30, EMBLEM_DEFS.top10],
    followers: 312, following: 184, verified: true, pembina: 'Bu Ratna Wulandari',
    coverPhoto: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=1200&q=80',
  },
  {
    id: 'u-1', username: 'cendekia_mira', email: 'mira@demo.id', displayName: 'Mira Cendekia',
    role: 'pelajar', school: 'MTs Negeri 2 Jakarta', educationLevel: 'smp', birthDate: '2010-08-22',
    points: 9100, rank: 1, joinedAt: '2024-09-01', favoriteCategories: ['mtk', 'ipa'],
    badges: ['Streak 100 Hari', 'Juara Nasional'], emblems: [EMBLEM_DEFS.n1, EMBLEM_DEFS.n3, EMBLEM_DEFS.p1, EMBLEM_DEFS.k1],
    followers: 1820, following: 120, pembina: 'Pak Hadi Suganda',
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a89557410?w=1200&q=80',
  },
  {
    id: 'u-2', username: 'bagaskara', email: 'baga@demo.id', displayName: 'Bagaskara Wibawa',
    role: 'pelajar', school: 'SMA Negeri 8 Surabaya', educationLevel: 'sma', birthDate: '2009-03-10',
    points: 8450, rank: 2, joinedAt: '2024-08-15', favoriteCategories: ['tech', 'mtk'],
    badges: ['Top 3 Nasional'], emblems: [EMBLEM_DEFS.n2, EMBLEM_DEFS.p1, EMBLEM_DEFS.k2],
    followers: 940, following: 210, pembina: 'Bu Sinta Marlina',
    coverPhoto: 'https://images.unsplash.com/photo-1635776062764-e025d2b99c53?w=1200&q=80',
  },
  {
    id: 'u-3', username: 'larasati', email: 'lara@demo.id', displayName: 'Larasati Ayu',
    role: 'pelajar', school: 'SMP Negeri 3 Yogyakarta', educationLevel: 'smp', birthDate: '2011-11-30',
    points: 7320, rank: 3, joinedAt: '2024-10-02', favoriteCategories: ['bindo', 'seni'],
    badges: ['Streak 60 Hari'], emblems: [EMBLEM_DEFS.n3, EMBLEM_DEFS.p2, EMBLEM_DEFS.k1],
    followers: 670, following: 90, pembina: 'Pak Yusuf',
    coverPhoto: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92de9?w=1200&q=80',
  },
  {
    id: 'u-4', username: 'dimas_pratama', email: 'dimas@demo.id', displayName: 'Dimas Pratama',
    role: 'pelajar', school: 'SMA Negeri 5 Malang', educationLevel: 'sma', birthDate: '2008-07-18',
    points: 6810, rank: 4, joinedAt: '2024-09-20', favoriteCategories: ['olahraga', 'ipa'],
    badges: ['Atlet Cerdas'], emblems: [EMBLEM_DEFS.p1, EMBLEM_DEFS.k2],
    followers: 430, following: 300, pembina: 'Pak Bayu',
    coverPhoto: 'https://images.unsplash.com/photo-1635776062834-3b4d4b5a92de9?w=1200&q=80',
  },
  {
    id: 'u-5', username: 'naila_zahra', email: 'naila@demo.id', displayName: 'Naila Zahra',
    role: 'pelajar', school: 'MA Negeri 1 Garut', educationLevel: 'sma', birthDate: '2008-12-01',
    points: 6200, rank: 5, joinedAt: '2024-11-01', favoriteCategories: ['ips', 'bindo'],
    badges: ['Streak 45 Hari'], emblems: [EMBLEM_DEFS.p2, EMBLEM_DEFS.streak30],
    followers: 510, following: 150, pembina: 'Bu Hindun',
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a89557410?w=1200&q=80',
  },
  {
    id: 'u-6', username: 'rafly_hidayat', email: 'rafly@demo.id', displayName: 'Rafly Hidayat',
    role: 'pelajar', school: 'SMP Negeri 4 Bekasi', educationLevel: 'smp', birthDate: '2010-04-25',
    points: 5400, rank: 6, joinedAt: '2024-12-10', favoriteCategories: ['mtk', 'tech'],
    badges: ['Juara Wilayah'], emblems: [EMBLEM_DEFS.k1],
    followers: 280, following: 175, pembina: 'Pak Eko',
  },
  {
    id: 'u-7', username: 'keysha_n', email: 'keysha@demo.id', displayName: 'Keysha Najwa',
    role: 'pelajar', school: 'SD Negeri 2 Solo', educationLevel: 'sd', birthDate: '2013-09-14',
    points: 4400, rank: 8, joinedAt: '2025-01-05', favoriteCategories: ['ipa', 'mtk'],
    badges: ['Streak 20 Hari'], emblems: [EMBLEM_DEFS.streak30],
    followers: 190, following: 60, pembina: 'Bu Ani',
  },
  {
    id: 'u-8', username: 'gala_saputra', email: 'gala@demo.id', displayName: 'Gala Saputra',
    role: 'pelajar', school: 'MTs Negeri 1 Bandung', educationLevel: 'smp', birthDate: '2011-02-08',
    points: 3950, rank: 9, joinedAt: '2025-02-01', favoriteCategories: ['lingkungan', 'ipa'],
    badges: ['Eco Warrior'], emblems: [EMBLEM_DEFS.k2],
    followers: 140, following: 88, pembina: 'Pak Dedi',
  },
  {
    id: 'u-9', username: 'anindya_p', email: 'anindya@demo.id', displayName: 'Anindya Pertiwi',
    role: 'pelajar', school: 'SMA Negeri 1 Denpasar', educationLevel: 'sma', birthDate: '2009-06-19',
    points: 3500, rank: 10, joinedAt: '2025-02-14', favoriteCategories: ['bing', 'seni'],
    badges: ['Public Speaker'], emblems: [],
    followers: 220, following: 130, pembina: 'Bu Luh',
  },
  {
    id: 'u-10', username: 'bu_ratna', email: 'ratna@demo.id', displayName: 'Bu Ratna Wulandari',
    role: 'guru', school: 'SMP Negeri 1 Bandung',
    points: 0, rank: 0, joinedAt: '2024-08-01', favoriteCategories: ['mtk', 'ipa'],
    badges: ['Pembimbing Hebat'], emblems: [], followers: 540, following: 20, verified: true,
  },
];

const demoComments1: Comment[] = [
  { id: 'cm-1', postId: 'f-5', userId: 'u-1', authorName: 'Mira Cendekia', authorUsername: 'cendekia_mira', authorId: 'u-1', body: 'Pasti ikut! Target juara 1 nih.', createdAt: '2026-08-04T13:00:00', likes: 45, liked: false, replies: [
    { id: 'cm-1r1', postId: 'f-5', userId: 'u-2', authorName: 'Bagaskara Wibawa', authorUsername: 'bagaskara', authorId: 'u-2', body: 'Semangat Mira! Aku juga ikut.', createdAt: '2026-08-04T13:15:00', likes: 12, liked: false, replies: [] },
  ] },
  { id: 'cm-2', postId: 'f-5', userId: 'u-7', authorName: 'Keysha Najwa', authorUsername: 'keysha_n', authorId: 'u-7', body: 'Kak, apakah kelas 6 SD boleh ikut?', createdAt: '2026-08-04T14:00:00', likes: 8, liked: false, replies: [
    { id: 'cm-2r1', postId: 'f-5', userId: 'u-10', authorName: 'Bu Ratna Wulandari', authorUsername: 'bu_ratna', authorId: 'u-10', body: 'Boleh, Nak. Baca juknisnya ya.', createdAt: '2026-08-04T14:30:00', likes: 20, liked: false, replies: [] },
  ] },
  { id: 'cm-3', postId: 'f-5', userId: 'u-4', authorName: 'Dimas Pratama', authorUsername: 'dimas_pratama', authorId: 'u-4', body: 'Soalnya susah gak ya?', createdAt: '2026-08-04T15:00:00', likes: 5, liked: false, replies: [] },
];

const demoComments2: Comment[] = [
  { id: 'cm-4', postId: 'f-1', userId: 'u-2', authorName: 'Bagaskara Wibawa', authorUsername: 'bagaskara', authorId: 'u-2', body: 'Luar biasa Mira! Inspirasi banget.', createdAt: '2026-08-05T07:00:00', likes: 30, liked: false, replies: [] },
  { id: 'cm-5', postId: 'f-1', userId: 'u-5', authorName: 'Naila Zahra', authorUsername: 'naila_zahra', authorId: 'u-5', body: ' target kayak gitu juga!', createdAt: '2026-08-05T07:30:00', likes: 15, liked: false, replies: [
    { id: 'cm-5r1', postId: 'f-1', userId: 'u-1', authorName: 'Mira Cendekia', authorUsername: 'cendekia_mira', authorId: 'u-1', body: 'Semangat Naila, konsisten ya!', createdAt: '2026-08-05T08:00:00', likes: 10, liked: false, replies: [] },
  ] },
];

const demoComments3: Comment[] = [
  { id: 'cm-6', postId: 'f-2', userId: 'u-9', authorName: 'Anindya Pertiwi', authorUsername: 'anindya_p', authorId: 'u-9', body: 'Esai bahasa Inggris, menantang sekali!', createdAt: '2026-08-05T06:00:00', likes: 12, liked: false, replies: [] },
];

export const demoCompetitions: Competition[] = [
  {
    id: 'c-1', slug: 'lomba-matematika-nasional-2026',
    title: 'Uji Kompetensi Matematika Nasional 2026',
    category: 'mtk',
    shortDesc: 'Uji kompetensi matematika tingkat nasional non-formal untuk pelajar SD–SMA sederajat.',
    description:
      'Uji Kompetensi Matematika Nasional kembali untuk ke-5 kalinya! Program ini menguji kemampuan penalaran, aljabar, geometri, dan kombinatorika dalam dua babak: penyisihan online dan final. Terbuka untuk semua jenjang kelas 4 SD sampai 3 SMA sederajat.',
    juknis:
      '1. Twibbon wajib dipasang & diposting ke IG/TikTok sebelum mendaftar.\n2. Babak penyisihan: 30 soal pilihan ganda, durasi 60 menit.\n3. Babak final: 5 soal esai, durasi 90 menit.\n4. Nilai akhir = 70% penyisihan + 30% final.\n5. Peserta wajib menggunakan identitas asli.',
    juknisPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    prizes: [
      { position: '1st', detail: 'Sertifikat Juara 1 Nasional', emblems: ['n1'], points: 1500 },
      { position: '2nd', detail: 'Sertifikat Juara 2 Nasional', emblems: ['n2'], points: 1000 },
      { position: '3rd', detail: 'Sertifikat Juara 3 Nasional', emblems: ['n3'], points: 750 },
      { position: 'Harapan', detail: 'Sertifikat Keikutsertaan', emblems: [], points: 400 },
    ],
    points: 300,
    startDate: '2026-08-20', endDate: '2026-09-05', registrationDeadline: '2026-08-18',
    status: 'open', participants: 2840, level: 'SD 4–6 s/d SMA 1–3 Sederajat',
    twibbonUrl: 'https://images.unsplash.com/photo-1503676267431-0d269eb00dca?w=800&q=80',
    hasQuestions: true, featured: true,
  },
  {
    id: 'c-2', slug: 'lomba-karya-tulis-ilmiah-sains',
    title: 'Uji Kompetensi Karya Tulis Ilmiah Sains Muda 2026',
    category: 'ipa',
    shortDesc: 'Tulis karya ilmiah tentang solusi lingkungan & energi terbarukan.',
    description:
      'Uji kompetensi KTI Sains Muda mengajak pelajar untuk menuangkan ide kreatif dalam bentuk karya tulis ilmiah bertema "Solusi Lingkungan & Energi Terbarukan untuk Indonesia". Karya dikumpulkan dalam format PDF maksimal 10 halaman.',
    juknis:
      '1. Twibbon wajib.\n2. Karya dikirim format PDF A4, font Times New Roman 12.\n3. Maksimal 10 halaman.\n4. Penilaian: orisinalitas 40%, sistematika 30%, manfaat 30%.',
    juknisPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    prizes: [
      { position: '1st', detail: 'Sertifikat Juara 1', emblems: ['p1'], points: 1200 },
      { position: '2nd', detail: 'Sertifikat Juara 2', emblems: ['p2'], points: 800 },
      { position: '3rd', detail: 'Sertifikat Juara 3', emblems: [], points: 500 },
    ],
    points: 250,
    startDate: '2026-08-25', endDate: '2026-09-30', registrationDeadline: '2026-08-22',
    status: 'open', participants: 1120, level: 'SMP – SMA Sederajat',
    twibbonUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    hasQuestions: false, featured: true,
  },
  {
    id: 'c-3', slug: 'coding-challenge-pemula',
    title: 'Uji Kompetensi Coding Pemula: Web Kita',
    category: 'tech',
    shortDesc: 'Buat halaman web sederhana bertema pendidikan dan raih poin besar.',
    description:
      'Uji kompetensi coding pemula cocok untuk pelajar yang baru mengenal HTML, CSS, dan JavaScript. Buatlah satu halaman web bertema pendidikan, kumpulkan link repository, dan jelaskan idemu dalam 3 menit video.',
    juknis:
      '1. Twibbon wajib.\n2. Submit link GitHub + video penjelasan max 3 menit.\n3. Hanya untuk pemula.\n4. Penilaian: kreativitas 40%, fungsionalitas 40%, presentasi 20%.',
    juknisPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    prizes: [
      { position: '1st', detail: 'Sertifikat Juara 1', emblems: ['p1'], points: 1000 },
      { position: '2nd', detail: 'Sertifikat Juara 2', emblems: ['p2'], points: 600 },
      { position: '3rd', detail: 'Sertifikat Juara 3', emblems: [], points: 400 },
    ],
    points: 200,
    startDate: '2026-08-10', endDate: '2026-08-30', registrationDeadline: '2026-08-08',
    status: 'in-progress', participants: 680, level: 'SMP – SMA Sederajat',
    twibbonUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    hasQuestions: false,
  },
  {
    id: 'c-4', slug: 'lomba-esai-bahasa-inggris',
    title: 'Uji Kompetensi English Essay: My Future',
    category: 'bing',
    shortDesc: 'Tulis esai bahasa Inggris bertema "My Future Career" maks 500 kata.',
    description:
      'Asah kemampuan menulis bahasa Inggris dengan esai bertema "My Future Career". Esai dinilai dari grammar, struktur, dan orisinalitas ide.',
    juknis:
      '1. Twibbon wajib.\n2. Esai 300–500 kata, bahasa Inggris.\n3. Submit via form (file .docx).\n4. Dilarang menggunakan AI generatif.',
    juknisPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    prizes: [
      { position: '1st', detail: 'Sertifikat Juara 1', emblems: ['p1'], points: 800 },
      { position: '2nd', detail: 'Sertifikat Juara 2', emblems: ['p2'], points: 500 },
      { position: '3rd', detail: 'Sertifikat Juara 3', emblems: [], points: 300 },
    ],
    points: 150,
    startDate: '2026-09-01', endDate: '2026-09-20', registrationDeadline: '2026-08-28',
    status: 'upcoming', participants: 420, level: 'SMP – SMA Sederajat',
    twibbonUrl: 'https://images.unsplash.com/photo-1503676513-9aae6f6f7b6e?w=800&q=80',
    hasQuestions: true,
  },
  {
    id: 'c-5', slug: 'lomba-poster-edukasi-lingkungan',
    title: 'Uji Kompetensi Poster Edukasi Lingkungan Digital',
    category: 'lingkungan',
    shortDesc: 'Desain poster digital edukasi tentang pengelolaan sampah.',
    description:
      'Uji kompetensi poster digital mengajak pelajar menyuarakan isu lingkungan melalui karya visual. Tema tahun ini: "Kelola Sampah, Selamatkan Bumi".',
    juknis:
      '1. Twibbon wajib.\n2. Poster ukuran A3 (300dpi), format JPG/PNG.\n3. Maksimal 1 karya per peserta.\n4. Penilaian online voting 40% + juri 60%.',
    juknisPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    prizes: [
      { position: '1st', detail: 'Sertifikat Juara 1', emblems: ['p1'], points: 700 },
      { position: '2nd', detail: 'Sertifikat Juara 2', emblems: ['p2'], points: 450 },
      { position: '3rd', detail: 'Sertifikat Juara 3', emblems: [], points: 300 },
    ],
    points: 180,
    startDate: '2026-08-15', endDate: '2026-09-15', registrationDeadline: '2026-08-13',
    status: 'open', participants: 540, level: 'SD 4–6 s/d SMA 1–3 Sederajat',
    twibbonUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
    hasQuestions: false,
  },
];

export const demoQuestions: Record<string, Question[]> = {
  'c-1': [
    { id: 'q1', type: 'multiple-choice', prompt: 'Hasil dari 7 × 8 + 4 adalah...', required: true, points: 10, options: [{ id: 'a', label: '58' }, { id: 'b', label: '60' }, { id: 'c', label: '56' }, { id: 'd', label: '64' }], correctOptionId: 'b', explanation: '7×8 = 56, lalu 56 + 4 = 60.' },
    { id: 'q2', type: 'multiple-choice', prompt: 'Jika x + 5 = 12, maka nilai x adalah...', required: true, points: 10, options: [{ id: 'a', label: '5' }, { id: 'b', label: '6' }, { id: 'c', label: '7' }, { id: 'd', label: '8' }], correctOptionId: 'c', explanation: 'x = 12 − 5 = 7.' },
    { id: 'q3', type: 'multiple-choice', prompt: 'Banyaknya sisi pada kubus adalah...', required: true, points: 10, options: [{ id: 'a', label: '4' }, { id: 'b', label: '6' }, { id: 'c', label: '8' }, { id: 'd', label: '12' }], correctOptionId: 'b', explanation: 'Kubus memiliki 6 sisi persegi.' },
    { id: 'q4', type: 'short-answer', prompt: 'Tuliskan rumus luas lingkaran (gunakan ).', required: true, points: 15, correctText: ' × r × r' },
    { id: 'q5', type: 'essay', prompt: 'Jelaskan perbedaan antara barisan aritmatika dan barisan geometri.', required: true, points: 25 },
  ],
};

export const demoDailyTasks: DailyTask[] = [
  {
    id: 'dt-1', title: 'Quiz Cerdas Cermat: IPA', type: 'quiz',
    description: '5 soal IPA ringan untuk pagi ini. Klaim poin instan!',
    points: 50, date: '2026-08-05', expiresAt: '2026-08-05T23:59:00',
    completed: false, retryUsed: 0, maxRetry: 3,
    quiz: {
      questions: [
        { id: 'dq1', prompt: 'Planet terdekat dengan matahari adalah...', options: [{ id: 'a', label: 'Venus' }, { id: 'b', label: 'Merkurius' }, { id: 'c', label: 'Bumi' }, { id: 'd', label: 'Mars' }], correctOptionId: 'b', explanation: 'Merkurius adalah planet terdekat dengan matahari.' },
        { id: 'dq2', prompt: 'Air terdiri dari dua unsur, yaitu...', options: [{ id: 'a', label: 'Hidrogen & Oksigen' }, { id: 'b', label: 'Karbon & Oksigen' }, { id: 'c', label: 'Nitrogen & Hidrogen' }, { id: 'd', label: 'Oksigen & Helium' }], correctOptionId: 'a' },
        { id: 'dq3', prompt: 'Proses tumbuhan membuat makanan disebut...', options: [{ id: 'a', label: 'Respirasi' }, { id: 'b', label: 'Fotosintesis' }, { id: 'c', label: 'Transpirasi' }, { id: 'd', label: 'Fermentasi' }], correctOptionId: 'b' },
        { id: 'dq4', prompt: 'Satuan energi dalam SI adalah...', options: [{ id: 'a', label: 'Watt' }, { id: 'b', label: 'Joule' }, { id: 'c', label: 'Newton' }, { id: 'd', label: 'Pascal' }], correctOptionId: 'b' },
        { id: 'dq5', prompt: 'Tulang terpanjang dalam tubuh manusia adalah...', options: [{ id: 'a', label: 'Tulang paha (femur)' }, { id: 'b', label: 'Tulang lengan' }, { id: 'c', label: 'Tulang belakang' }, { id: 'd', label: 'Tulang betis' }], correctOptionId: 'a' },
      ],
    },
  },
  {
    id: 'dt-2', title: 'Tantangan Streak 30 Hari', type: 'streak',
    description: 'Kerjakan minimal 1 task setiap hari untuk menjaga streak!',
    points: 20, date: '2026-08-05', expiresAt: '2026-08-05T23:59:00',
    completed: true, retryUsed: 0, maxRetry: 0,
  },
  {
    id: 'dt-3', title: 'Assignment: Baca 1 Artikel Edukasi', type: 'assignment',
    description: 'Baca artikel pendidikan dan rangkum dalam 3 kalimat.',
    points: 30, date: '2026-08-05', expiresAt: '2026-08-05T23:59:00',
    completed: false, retryUsed: 0, maxRetry: 1,
  },
  {
    id: 'dt-4', title: 'Quiz Kosakata Bahasa Inggris', type: 'quiz',
    description: 'Tebak 5 kosakata bahasa Inggris hari ini.',
    points: 40, date: '2026-08-05', expiresAt: '2026-08-05T23:59:00',
    completed: false, retryUsed: 0, maxRetry: 3,
    quiz: {
      questions: [
        { id: 'dq1', prompt: 'Apa arti dari "diligent"?', options: [{ id: 'a', label: 'Malas' }, { id: 'b', label: 'Rajin' }, { id: 'c', label: 'Marah' }, { id: 'd', label: 'Sedih' }], correctOptionId: 'b' },
        { id: 'dq2', prompt: 'Apa arti dari "ancient"?', options: [{ id: 'a', label: 'Modern' }, { id: 'b', label: 'Kuno' }, { id: 'c', label: 'Baru' }, { id: 'd', label: 'Cepat' }], correctOptionId: 'b' },
        { id: 'dq3', prompt: 'Apa arti dari "brave"?', options: [{ id: 'a', label: 'Penakut' }, { id: 'b', label: 'Berani' }, { id: 'c', label: 'Cerdas' }, { id: 'd', label: 'Lucu' }], correctOptionId: 'b' },
      ],
    },
  },
];

export const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u-1', username: 'cendekia_mira', displayName: 'Mira Cendekia', points: 9100, school: 'MTs Negeri 2 Jakarta', educationLevel: 'smp', classGrade: 2, pembina: 'Pak Hadi Suganda', emblems: [EMBLEM_DEFS.n1, EMBLEM_DEFS.n3, EMBLEM_DEFS.p1, EMBLEM_DEFS.k1], change: 0 },
  { rank: 2, userId: 'u-2', username: 'bagaskara', displayName: 'Bagaskara Wibawa', points: 8450, school: 'SMA Negeri 8 Surabaya', educationLevel: 'sma', classGrade: 3, pembina: 'Bu Sinta Marlina', emblems: [EMBLEM_DEFS.n2, EMBLEM_DEFS.p1, EMBLEM_DEFS.k2], change: 1 },
  { rank: 3, userId: 'u-3', username: 'larasati', displayName: 'Larasati Ayu', points: 7320, school: 'SMP Negeri 3 Yogyakarta', educationLevel: 'smp', classGrade: 1, pembina: 'Pak Yusuf', emblems: [EMBLEM_DEFS.n3, EMBLEM_DEFS.p2, EMBLEM_DEFS.k1], change: -1 },
  { rank: 4, userId: 'u-4', username: 'dimas_pratama', displayName: 'Dimas Pratama', points: 6810, school: 'SMA Negeri 5 Malang', educationLevel: 'sma', classGrade: 2, pembina: 'Pak Bayu', emblems: [EMBLEM_DEFS.p1, EMBLEM_DEFS.k2], change: 0 },
  { rank: 5, userId: 'u-5', username: 'naila_zahra', displayName: 'Naila Zahra', points: 6200, school: 'MA Negeri 1 Garut', educationLevel: 'sma', classGrade: 1, pembina: 'Bu Hindun', emblems: [EMBLEM_DEFS.p2, EMBLEM_DEFS.streak30], change: 2 },
  { rank: 6, userId: 'u-6', username: 'rafly_hidayat', displayName: 'Rafly Hidayat', points: 5400, school: 'SMP Negeri 4 Bekasi', educationLevel: 'smp', classGrade: 3, pembina: 'Pak Eko', emblems: [EMBLEM_DEFS.k1], change: 0 },
  { rank: 7, userId: 'u-me', username: 'arunaputra', displayName: 'Aruna Putra', points: 4820, school: 'SMP Negeri 1 Bandung', educationLevel: 'smp', classGrade: 2, pembina: 'Bu Ratna Wulandari', emblems: [EMBLEM_DEFS.p1, EMBLEM_DEFS.streak30, EMBLEM_DEFS.top10], change: 1, isCurrentUser: true },
  { rank: 8, userId: 'u-7', username: 'keysha_n', displayName: 'Keysha Najwa', points: 4400, school: 'SD Negeri 2 Solo', educationLevel: 'sd', classGrade: 6, pembina: 'Bu Ani', emblems: [EMBLEM_DEFS.streak30], change: -1 },
  { rank: 9, userId: 'u-8', username: 'gala_saputra', displayName: 'Gala Saputra', points: 3950, school: 'MTs Negeri 1 Bandung', educationLevel: 'smp', classGrade: 1, pembina: 'Pak Dedi', emblems: [EMBLEM_DEFS.k2], change: 0 },
  { rank: 10, userId: 'u-9', username: 'anindya_p', displayName: 'Anindya Pertiwi', points: 3500, school: 'SMA Negeri 1 Denpasar', educationLevel: 'sma', classGrade: 1, pembina: 'Bu Luh', emblems: [], change: 3 },
];

export const demoCertificates: Certificate[] = [
  { id: 'cert-1', code: 'SBJ-2026-001234', userId: 'u-me', competitionId: 'c-5', competitionTitle: 'Poster Edukasi Lingkungan Digital', type: 'winner', rank: 1, score: 96, issuedAt: '2026-07-20', verified: true },
  { id: 'cert-2', code: 'SBJ-2026-001198', userId: 'u-me', competitionId: 'c-1', competitionTitle: 'Uji Kompetensi Matematika Nasional 2025', type: 'finalist', rank: 8, score: 82, issuedAt: '2026-06-15', verified: true },
  { id: 'cert-3', code: 'SBJ-2026-001056', userId: 'u-me', competitionId: 'c-2', competitionTitle: 'KTI Sains Muda 2025', type: 'participant', score: 75, issuedAt: '2026-05-30', verified: true },
  { id: 'cert-4', code: 'SBJ-2026-000842', userId: 'u-me', competitionId: 'c-3', competitionTitle: 'Coding Challenge Pemula 2025', type: 'achievement', score: 88, issuedAt: '2026-04-12', verified: true },
];

export const demoAwards: Award[] = [
  { id: 'a-1', type: 'certificate', title: 'Juara 1 Poster Lingkungan', subtitle: 'Poster Edukasi Lingkungan Digital', date: '2026-07-20', competitionId: 'c-5', certificateId: 'cert-1', color: 'from-moss-500 to-teal-deep', emblems: ['p1'], points: 700 },
  { id: 'a-2', type: 'medal', title: 'Medali Finalis', subtitle: 'Uji Kompetensi Matematika Nasional 2025', date: '2026-06-15', competitionId: 'c-1', color: 'from-amber-500 to-amber-700', emblems: ['n3'], points: 750 },
  { id: 'a-3', type: 'certificate', title: 'Sertifikat Partisipasi', subtitle: 'KTI Sains Muda 2025', date: '2026-05-30', competitionId: 'c-2', certificateId: 'cert-3', color: 'from-sky-500 to-sky-700', emblems: [], points: 250 },
  { id: 'a-4', type: 'badge', title: 'Streak 30 Hari', subtitle: 'Konsisten 30 hari berturut-turut', date: '2026-07-01', color: 'from-moss-400 to-moss-700', emblems: ['streak30'], points: 20 },
  { id: 'a-5', type: 'certificate', title: 'Penghargaan Coding', subtitle: 'Coding Challenge Pemula 2025', date: '2026-04-12', competitionId: 'c-3', certificateId: 'cert-4', color: 'from-violet-500 to-violet-700', emblems: [], points: 200 },
  { id: 'a-6', type: 'badge', title: 'Top 10 Nasional', subtitle: 'Masuk peringkat 10 besar nasional', date: '2026-06-01', color: 'from-moss-400 to-teal-deep', emblems: ['top10'], points: 0 },
];

export const demoNotifications: AppNotification[] = [
  { id: 'n-1', type: 'registration-approved', title: 'Pendaftaran Disetujui!', body: 'Pendaftaranmu di Uji Kompetensi Matematika Nasional 2026 telah disetujui admin. Selamat bergabung!', createdAt: '2026-08-05T09:30:00', read: false, link: '/lomba/lomba-matematika-nasional-2026', icon: 'check' },
  { id: 'n-2', type: 'competition-start', title: 'Lomba Dimulai Hari Ini', body: 'Uji Kompetensi Coding Pemula telah dimulai. Kerjakan sebelum 30 Agustus!', createdAt: '2026-08-05T08:00:00', read: false, link: '/lomba/coding-challenge-pemula', icon: 'play' },
  { id: 'n-3', type: 'rank-up', title: 'Peringkat Naik!', body: 'Selamat! Kamu naik ke peringkat #7 nasional. Pertahankan!', createdAt: '2026-08-04T18:20:00', read: true, link: '/leaderboard', icon: 'trending-up' },
  { id: 'n-4', type: 'result-out', title: 'Hasil Keluar', body: 'Hasil Poster Edukasi Lingkungan Digital telah diumumkan. Kamu meraih Juara 1!', createdAt: '2026-07-20T15:00:00', read: true, link: '/awards', icon: 'trophy' },
  { id: 'n-5', type: 'order-update', title: 'Pesanan Dikirim', body: 'Pesanan cetak sertifikat #SBJ-ORD-0023 telah dikirim via JNE. Lacak pesananmu.', createdAt: '2026-07-18T10:00:00', read: true, link: '/orders', icon: 'truck' },
  { id: 'n-6', type: 'daily-reminder', title: 'Daily Task Menunggu', body: 'Quiz Cerdas Cermat IPA hari ini belum dikerjakan. Klaim 50 poin sebelum tenggat!', createdAt: '2026-08-05T07:00:00', read: false, link: '/daily-tasks', icon: 'clock' },
];

export const demoOrders: Order[] = [
  { id: 'o-1', code: 'SBJ-ORD-0023', payCode: '482', userId: 'u-me', items: [{ id: 'oi-1', category: 'sertifikat', itemName: 'Sertifikat Juara 1 Poster Lingkungan Digital', quantity: 1, price: 25000 }], total: 25000, status: 'shipped', address: 'Jl. Merdeka No. 45, Bandung, Jawa Barat 40123', trackingNumber: 'JNE0098771123', createdAt: '2026-07-16', updatedAt: '2026-07-18' },
  { id: 'o-2', code: 'SBJ-ORD-0024', payCode: '715', userId: 'u-me', items: [{ id: 'oi-2', category: 'medali', itemName: 'Medali Finalis Uji Kompetensi Matematika', quantity: 1, price: 75000 }], total: 75000, status: 'pending', address: 'Jl. Merdeka No. 45, Bandung, Jawa Barat 40123', createdAt: '2026-08-03', updatedAt: '2026-08-03' },
];

export const demoFeed: FeedPost[] = [
  { id: 'f-5', userId: 'u-10', competitionId: 'c-1', competitionSlug: 'lomba-matematika-nasional-2026', type: 'competition', title: 'Uji Kompetensi Matematika Nasional 2026 Dibuka!', body: 'Lomba matematika terbesar kembali! 30 soal penyisihan + 5 esai final. Buka untuk semua jenjang SD s/d SMA sederajat. Daftar sebelum 18 Agustus!', createdAt: '2026-08-04T12:00:00', likes: 890, reposts: 180, liked: false, meta: 'Lomba', image: 'https://images.unsplash.com/photo-1503676267431-0d269eb00dca?w=800&q=80', comments: demoComments1 },
  { id: 'f-2', userId: 'u-10', competitionId: 'c-4', competitionSlug: 'lomba-esai-bahasa-inggris', type: 'competition', title: 'English Essay Challenge: My Future', body: 'Buat yang suka menulis bahasa Inggris, jangan lewatkan English Essay Challenge: My Future. Daftar sebelum 28 Agustus!', createdAt: '2026-08-05T05:30:00', likes: 320, reposts: 45, liked: false, meta: 'Lomba', image: 'https://images.unsplash.com/photo-1503676513-9aae6f6f7b6e?w=800&q=80', comments: demoComments3 },
  { id: 'f-1', userId: 'u-1', type: 'achievement', title: 'Naik ke Peringkat #1 Nasional!', body: 'Alhamdulillah, setelah 100 hari streak, akhirnya saya mencapai peringkat #1. Terima kasih sykabelajar.id untuk semua lombanya!', createdAt: '2026-08-05T06:45:00', likes: 1240, reposts: 210, liked: false, meta: 'Prestasi', comments: demoComments2 },
  { id: 'f-3', userId: 'u-4', type: 'achievement', title: 'Juara 3 Coding Challenge 2025', body: 'Senang banget bisa juara 3! Awalnya cuma iseng belajar coding di sini, ternyata berasil. Gas terus teman-teman!', createdAt: '2026-08-04T20:10:00', likes: 560, reposts: 30, liked: false, meta: 'Prestasi', comments: [] },
  { id: 'f-4', userId: 'u-5', type: 'achievement', title: 'Streak 45 Hari Tercapai!', body: 'Kerjakan daily task setiap hari, konsisten itu kunci. Siapa yang juga lagi streak?', createdAt: '2026-08-04T16:00:00', likes: 410, reposts: 12, liked: false, meta: 'Prestasi', comments: [] },
  { id: 'f-6', userId: 'u-8', type: 'achievement', title: 'Eco Warrior Badge Didapat!', body: 'Senang dapat badge baru dari lomba poster lingkungan. Yuk jaga bumi mulai dari hal kecil.', createdAt: '2026-08-03T19:20:00', likes: 280, reposts: 22, liked: false, meta: 'Prestasi', comments: [] },
];

export const PRINT_CATALOG = [
  { category: 'sertifikat' as const, name: 'Sertifikat Uji Kompetensi Matematika Nasional', price: 25000, preview: 'https://images.unsplash.com/photo-1567521464027-f127ff1444e0?w=400&q=80' },
  { category: 'sertifikat' as const, name: 'Sertifikat Juara 1 Poster Lingkungan Digital', price: 25000, preview: 'https://images.unsplash.com/photo-1551038247-3d9af20df556?w=400&q=80' },
  { category: 'sertifikat' as const, name: 'Sertifikat Partisipasi KTI Sains Muda', price: 25000, preview: 'https://images.unsplash.com/photo-1554224155-67235b3e86c2?w=400&q=80' },
  { category: 'sertifikat' as const, name: 'Sertifikat Penghargaan Coding Challenge', price: 25000, preview: 'https://images.unsplash.com/photo-1607799903789-3f9a0e8e7c7c?w=400&q=80' },
  { category: 'medali' as const, name: 'Medali Juara Uji Kompetensi Matematika', price: 75000, preview: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=400&q=80' },
  { category: 'medali' as const, name: 'Medali Finalis Poster Lingkungan', price: 75000, preview: 'https://images.unsplash.com/photo-1597717062530-eb9b50f3a3a1?w=400&q=80' },
  { category: 'emblem' as const, name: 'Emblem Nasional Uji Kompetensi', price: 15000, preview: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80' },
  { category: 'emblem' as const, name: 'Emblem Provinsi Lomba Sains', price: 15000, preview: 'https://images.unsplash.com/photo-1612790907041-6d9f8e2e9c7d?w=400&q=80' },
  { category: 'emblem' as const, name: 'Emblem Kabupaten Cerdas Cermat', price: 15000, preview: 'https://images.unsplash.com/photo-1606914468433-6dbe5e4e4a8e?w=400&q=80' },
];

export const PRICING = { certificate: 25000, medal: 75000, emblem: 15000 };

export const WA_NUMBER = '6281234567890';
