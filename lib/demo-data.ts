/**
 * Centralized VELOX demo data source.
 * Used only as a safe fallback when real database data is unavailable.
 * Never scatter demo values across components — import from here.
 */

import type {
  Accrual,
  AdminKpi,
  AdminUser,
  ArbitrageBalance,
  ArbitragePhase,
  ArbitrageTrade,
  Challenge,
  CommissionLevel,
  InvestmentContract,
  MarketOffer,
  Operation,
  Partner,
  PartnerBoost,
  Qualification,
  TeamVolume,
  WithdrawalRequest,
} from './types'

export const demoUser = {
  id: 'usr_demo',
  name: 'VELOX Yatırımcı',
  veloxId: 'VLX-100482',
  referralCode: 'VLX100482',
  career: 'GOLD',
  nextCareer: 'PLATINUM',
  language: 'TR',
}

export const demoBalance: ArbitrageBalance = {
  id: 'bal_demo',
  userId: demoUser.id,
  tradingBalance: 3017.94,
  incomeBalance: 21.496,
  updatedAt: new Date().toISOString(),
}

export const demoNetwork = {
  personalVolume: 5200,
  directVolume: 12400,
  teamVolume: 48750,
  strongLegVolume: 31200,
  otherLegVolume: 17550,
  qualifiedVolume: 26800,
  careerVolume: 48750,
  directPartners: 4,
  activePartners: 4,
  qualifiedPartners: 2,
  totalNetwork: 37,
  networkEarnings: 842.6218,
}

/** Active phase ends ~48:32 from now — structured for backend values. */
export const demoPhase: ArbitragePhase = {
  id: 'phase_demo',
  phaseNumber: 1287,
  startsAt: new Date(Date.now() - 60_000).toISOString(),
  endsAt: new Date(Date.now() + (48 * 60 + 32) * 1000).toISOString(),
  status: 'active',
}

export const demoBuyOffers: MarketOffer[] = [
  { id: 'b1', usdtVolume: 4820.5, ethPrice: 2418.62, ethVolume: 1.9931 },
  { id: 'b2', usdtVolume: 3155.0, ethPrice: 2418.7, ethVolume: 1.3044 },
  { id: 'b3', usdtVolume: 2210.75, ethPrice: 2418.88, ethVolume: 0.9139 },
  { id: 'b4', usdtVolume: 1580.2, ethPrice: 2419.05, ethVolume: 0.6532 },
  { id: 'b5', usdtVolume: 990.0, ethPrice: 2419.31, ethVolume: 0.4092 },
]

export const demoSellOffers: MarketOffer[] = [
  { id: 's1', ethVolume: 2.1044, ethPrice: 2421.94, usdtVolume: 5096.9 },
  { id: 's2', ethVolume: 1.4302, ethPrice: 2421.7, usdtVolume: 3463.9 },
  { id: 's3', ethVolume: 0.8817, ethPrice: 2421.42, usdtVolume: 2135.0 },
  { id: 's4', ethVolume: 0.5533, ethPrice: 2421.15, usdtVolume: 1339.6 },
  { id: 's5', ethVolume: 0.3120, ethPrice: 2420.88, usdtVolume: 755.3 },
]

export const demoExchanges = ['NEXORA', 'SAKURA', 'BITCIRAZ', 'CXI'] as const

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()

export const demoTrades: ArbitrageTrade[] = [
  {
    id: 't1', userId: demoUser.id, phaseId: demoPhase.id,
    buyExchange: 'BITCIRAZ', sellExchange: 'CXI',
    buyPrice: 2418.62, sellPrice: 2421.94, buyVolume: 1210.4, sellVolume: 1216.1,
    grossSpread: 5.71, netSpread: 4.28, status: 'completed', createdAt: minutesAgo(12),
  },
  {
    id: 't2', userId: demoUser.id, phaseId: demoPhase.id,
    buyExchange: 'NEXORA', sellExchange: 'SAKURA',
    buyPrice: 2417.9, sellPrice: 2420.55, buyVolume: 880.0, sellVolume: 883.7,
    grossSpread: 3.7, netSpread: 2.77, status: 'completed', createdAt: minutesAgo(34),
  },
  {
    id: 't3', userId: demoUser.id, phaseId: demoPhase.id,
    buyExchange: 'SAKURA', sellExchange: 'BITCIRAZ',
    buyPrice: 2419.1, sellPrice: 2422.3, buyVolume: 1540.6, sellVolume: 1547.1,
    grossSpread: 6.5, netSpread: 4.88, status: 'completed', createdAt: minutesAgo(58),
  },
  {
    id: 't4', userId: demoUser.id, phaseId: demoPhase.id,
    buyExchange: 'CXI', sellExchange: 'NEXORA',
    buyPrice: 2418.0, sellPrice: 2420.9, buyVolume: 640.2, sellVolume: 642.5,
    grossSpread: 2.3, netSpread: 1.72, status: 'completed', createdAt: minutesAgo(96),
  },
]

export const demoAccruals: Accrual[] = [
  {
    id: 'a1', userId: demoUser.id, contractId: 'c1', contractNumber: 'VLX-INV-000001',
    sourceType: 'Arbitraj Tahakkuku', grossAmount: 12.4, netAmount: 10.8883,
    status: 'Serbest', calculatedAt: minutesAgo(120), releaseAt: minutesAgo(30), paidAt: null,
  },
  {
    id: 'a2', userId: demoUser.id, contractId: 'c2', contractNumber: 'VLX-INV-000002',
    sourceType: 'Ağ Komisyonu', grossAmount: 6.2, netAmount: 5.44,
    status: 'Tahakkuk Etti', calculatedAt: minutesAgo(90), releaseAt: new Date(now + 3600_000).toISOString(), paidAt: null,
  },
]

export const demoOperations: Operation[] = [
  { id: 'o1', userId: demoUser.id, contractId: 'c1', operationType: 'Tahakkuk', amount: 10.8883, poolName: 'Dahili ağ', createdAt: minutesAgo(30) },
  { id: 'o2', userId: demoUser.id, contractId: 'c1', operationType: 'Yatırım', amount: 650, poolName: 'Arbitraj havuzu', createdAt: minutesAgo(1440) },
  { id: 'o3', userId: demoUser.id, contractId: 'c2', operationType: 'Yeniden yatırım', amount: 82, poolName: 'Arbitraj havuzu', createdAt: minutesAgo(2880) },
  { id: 'o4', userId: demoUser.id, contractId: null, operationType: 'İç transfer', amount: 21.496, poolName: 'Gelir bakiyesi', createdAt: minutesAgo(4320) },
]

export const demoContracts: InvestmentContract[] = [
  {
    id: 'c1', contractNumber: 'VLX-INV-000001', userId: demoUser.id,
    initialAmount: 100, currentEarnings: 82, totalPaid: 182, targetAmount: 300,
    remainingAmount: 118, progress: 60.67, startDate: minutesAgo(43200), completedAt: null,
    status: 'Active', createdAt: minutesAgo(43200),
  },
  {
    id: 'c2', contractNumber: 'VLX-INV-000002', userId: demoUser.id,
    initialAmount: 250, currentEarnings: 141.5, totalPaid: 141.5, targetAmount: 750,
    remainingAmount: 608.5, progress: 18.87, startDate: minutesAgo(21600), completedAt: null,
    status: 'Active', createdAt: minutesAgo(21600),
  },
  {
    id: 'c3', contractNumber: 'VLX-INV-000003', userId: demoUser.id,
    initialAmount: 650, currentEarnings: 650, totalPaid: 1950, targetAmount: 1950,
    remainingAmount: 0, progress: 100, startDate: minutesAgo(86400), completedAt: minutesAgo(1440),
    status: 'Completed', createdAt: minutesAgo(86400),
  },
]

export const demoTotalPool = 39255.3

/* ----------------------------- Network layer ----------------------------- */

export const careerRanks = [
  'STARTER',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'CROWN',
] as const

/**
 * 33-level commission architecture.
 * Rates taper from deep to shallow; levels unlock as career rank rises.
 * Values are deterministic (no Math.random) so SSR/CSR stay in sync.
 */
export const demoCommissionLevels: CommissionLevel[] = Array.from({ length: 33 }, (_, i) => {
  const level = i + 1
  // First levels pay the most, deep levels a flat small rate.
  const rate =
    level <= 1 ? 8 : level <= 3 ? 5 : level <= 6 ? 3 : level <= 12 ? 1.5 : level <= 20 ? 0.75 : 0.4
  // Career gate: every ~5 levels needs the next rank.
  const gateIndex = Math.min(careerRanks.length - 1, Math.floor((level - 1) / 5))
  const requiredCareer = careerRanks[gateIndex]
  const unlocked = level <= 14 // demo user (GOLD) has unlocked 14 levels
  const partners = unlocked ? Math.max(0, Math.round(18 / Math.sqrt(level))) : 0
  const levelVolume = unlocked ? Math.round((9200 / level) * 10) / 10 : 0
  const earned = unlocked ? Math.round(levelVolume * (rate / 100) * 100) / 100 : 0
  return { level, rate, requiredCareer, partners, levelVolume, earned, unlocked }
})

export const demoPartners: Partner[] = [
  {
    id: 'p1', name: 'Ada Yılmaz', veloxId: 'VLX-100513', avatarSeed: 'ada',
    level: 1, status: 'qualified', career: 'SILVER',
    personalVolume: 1800, teamVolume: 14200, directCount: 3, joinedAt: '2026-03-11',
  },
  {
    id: 'p2', name: 'Kerem Demir', veloxId: 'VLX-100547', avatarSeed: 'kerem',
    level: 1, status: 'active', career: 'BRONZE',
    personalVolume: 950, teamVolume: 6100, directCount: 2, joinedAt: '2026-04-02',
  },
  {
    id: 'p3', name: 'Selin Kaya', veloxId: 'VLX-100562', avatarSeed: 'selin',
    level: 1, status: 'qualified', career: 'GOLD',
    personalVolume: 2400, teamVolume: 21500, directCount: 4, joinedAt: '2026-02-18',
  },
  {
    id: 'p4', name: 'Mert Aydın', veloxId: 'VLX-100590', avatarSeed: 'mert',
    level: 1, status: 'inactive', career: 'STARTER',
    personalVolume: 0, teamVolume: 0, directCount: 0, joinedAt: '2026-05-21',
  },
  {
    id: 'p5', name: 'Deniz Şahin', veloxId: 'VLX-100611', avatarSeed: 'deniz',
    level: 2, status: 'active', career: 'BRONZE',
    personalVolume: 700, teamVolume: 3200, directCount: 1, joinedAt: '2026-04-19',
  },
  {
    id: 'p6', name: 'Ece Çelik', veloxId: 'VLX-100634', avatarSeed: 'ece',
    level: 2, status: 'qualified', career: 'SILVER',
    personalVolume: 1500, teamVolume: 8800, directCount: 2, joinedAt: '2026-03-30',
  },
]

export const demoTeamVolume: TeamVolume = {
  personalVolume: 5200,
  totalTeamVolume: 48750,
  strongLeg: 31200,
  weakLeg: 17550,
  legs: [
    { id: 'leg-a', name: 'Bacak A (Güçlü)', volume: 31200, partners: 21 },
    { id: 'leg-b', name: 'Bacak B', volume: 12400, partners: 11 },
    { id: 'leg-c', name: 'Bacak C', volume: 5150, partners: 5 },
  ],
  qualifiedVolume: 26800,
}

export const demoQualifications: Qualification[] = [
  { id: 'q1', label: 'Kişisel hacim', current: 5200, target: 5000, unit: 'USDT', met: true },
  { id: 'q2', label: 'Zayıf bacak hacmi', current: 17550, target: 25000, unit: 'USDT', met: false },
  { id: 'q3', label: 'Aktif direkt ortak', current: 4, target: 5, unit: 'count', met: false },
  { id: 'q4', label: 'Nitelikli bacak', current: 2, target: 3, unit: 'legs', met: false },
]

/* -------------------------- Boost & Challenge ---------------------------- */

export const demoBoosts: PartnerBoost[] = [
  {
    id: 'b1',
    title: 'Hızlı Başlangıç Boost',
    description: 'İlk 30 gün içinde 10.000 USDT ekip hacmine ulaş, komisyonun 2 kat.',
    multiplier: 2,
    progress: 7400,
    target: 10000,
    unit: 'USDT',
    reward: 480,
    endsAt: '2026-08-24T23:59:00Z',
    status: 'active',
  },
  {
    id: 'b2',
    title: 'Direkt Ortak Boost',
    description: 'Bu ay 5 aktif direkt ortak davet et, sabit 250 USDT ödül kazan.',
    multiplier: 1.5,
    progress: 4,
    target: 5,
    unit: 'count',
    reward: 250,
    endsAt: '2026-08-31T23:59:00Z',
    status: 'active',
  },
  {
    id: 'b3',
    title: 'Zayıf Bacak Boost',
    description: 'Zayıf bacakta 25.000 USDT hacme ulaş, komisyonun 1.75 kat.',
    multiplier: 1.75,
    progress: 25000,
    target: 25000,
    unit: 'USDT',
    reward: 610,
    endsAt: '2026-07-31T23:59:00Z',
    status: 'completed',
  },
  {
    id: 'b4',
    title: 'Elmas Sezon Boost',
    description: 'DIAMOND rütbesine ulaştığında açılır. Sezon boyu 3 kat komisyon.',
    multiplier: 3,
    progress: 0,
    target: 1,
    unit: 'count',
    reward: 0,
    endsAt: '2026-12-31T23:59:00Z',
    status: 'locked',
  },
]

export const demoChallenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Ağustos Hacim Yarışı',
    description: 'Ay boyunca en yüksek ekip hacmini üreten ilk 10 ortak ödül havuzunu paylaşır.',
    metric: 'Ekip hacmi (USDT)',
    prizePool: 15000,
    endsAt: '2026-08-31T23:59:00Z',
    myRank: 4,
    myScore: 48750,
    leaderboard: [
      { rank: 1, name: 'Selin Kaya', veloxId: 'VLX-100562', score: 128400, prize: 5000 },
      { rank: 2, name: 'Emir Toprak', veloxId: 'VLX-100128', score: 96200, prize: 3000 },
      { rank: 3, name: 'Ada Yılmaz', veloxId: 'VLX-100513', score: 71500, prize: 2000 },
      { rank: 4, name: 'Sen', veloxId: 'VLX-100482', score: 48750, prize: 1200 },
      { rank: 5, name: 'Kerem Demir', veloxId: 'VLX-100547', score: 41000, prize: 900 },
      { rank: 6, name: 'Ece Çelik', veloxId: 'VLX-100634', score: 33800, prize: 700 },
      { rank: 7, name: 'Deniz Şahin', veloxId: 'VLX-100611', score: 24500, prize: 600 },
      { rank: 8, name: 'Mert Aydın', veloxId: 'VLX-100590', score: 18200, prize: 400 },
    ],
  },
  {
    id: 'c2',
    title: 'Yeni Ortak Sprinti',
    description: 'İki hafta içinde en çok aktif yeni ortak davet eden ortaklar arasında sıralan.',
    metric: 'Aktif yeni ortak',
    prizePool: 5000,
    endsAt: '2026-08-18T23:59:00Z',
    myRank: 2,
    myScore: 6,
    leaderboard: [
      { rank: 1, name: 'Emir Toprak', veloxId: 'VLX-100128', score: 9, prize: 2000 },
      { rank: 2, name: 'Sen', veloxId: 'VLX-100482', score: 6, prize: 1200 },
      { rank: 3, name: 'Selin Kaya', veloxId: 'VLX-100562', score: 5, prize: 800 },
      { rank: 4, name: 'Ada Yılmaz', veloxId: 'VLX-100513', score: 4, prize: 600 },
      { rank: 5, name: 'Ece Çelik', veloxId: 'VLX-100634', score: 3, prize: 400 },
    ],
  },
]

/* ------------------------------ Admin layer ----------------------------- */

export const demoAdminKpi: AdminKpi = {
  totalUsers: 4218,
  activeUsers: 2967,
  totalDeposits: 1_284_500,
  totalWithdrawals: 742_180,
  poolBalance: 542_320,
  pendingWithdrawals: 12,
  activeContracts: 3184,
  dailyVolume: 96_540,
}

export const demoAdminUsers: AdminUser[] = [
  {
    id: 'u1', name: 'Ada Yılmaz', veloxId: 'VLX-100513', email: 'ada@example.com',
    career: 'SILVER', balance: 4820.5, status: 'active', kyc: 'verified', joinedAt: '2026-03-11',
  },
  {
    id: 'u2', name: 'Kerem Demir', veloxId: 'VLX-100547', email: 'kerem@example.com',
    career: 'BRONZE', balance: 1290, status: 'active', kyc: 'verified', joinedAt: '2026-04-02',
  },
  {
    id: 'u3', name: 'Selin Kaya', veloxId: 'VLX-100562', email: 'selin@example.com',
    career: 'GOLD', balance: 15230.75, status: 'active', kyc: 'verified', joinedAt: '2026-02-18',
  },
  {
    id: 'u4', name: 'Mert Aydın', veloxId: 'VLX-100590', email: 'mert@example.com',
    career: 'STARTER', balance: 0, status: 'suspended', kyc: 'rejected', joinedAt: '2026-05-21',
  },
  {
    id: 'u5', name: 'Deniz Şahin', veloxId: 'VLX-100611', email: 'deniz@example.com',
    career: 'BRONZE', balance: 640.2, status: 'active', kyc: 'pending', joinedAt: '2026-04-19',
  },
  {
    id: 'u6', name: 'Ece Çelik', veloxId: 'VLX-100634', email: 'ece@example.com',
    career: 'SILVER', balance: 3110, status: 'active', kyc: 'verified', joinedAt: '2026-03-30',
  },
  {
    id: 'u7', name: 'Emir Toprak', veloxId: 'VLX-100128', email: 'emir@example.com',
    career: 'DIAMOND', balance: 41250, status: 'active', kyc: 'verified', joinedAt: '2025-11-08',
  },
  {
    id: 'u8', name: 'Nil Arslan', veloxId: 'VLX-100702', email: 'nil@example.com',
    career: 'STARTER', balance: 120, status: 'pending', kyc: 'pending', joinedAt: '2026-08-01',
  },
]

export const demoWithdrawalQueue: WithdrawalRequest[] = [
  {
    id: 'w1', userName: 'Selin Kaya', veloxId: 'VLX-100562', amount: 2500, fee: 25, net: 2475,
    address: 'TVx9kQ2m7VELOXusdtTRC20dEm0Addr55aB', network: 'TRC20', status: 'pending',
    requestedAt: '2026-08-09T08:14:00Z',
  },
  {
    id: 'w2', userName: 'Emir Toprak', veloxId: 'VLX-100128', amount: 8000, fee: 80, net: 7920,
    address: 'TKp2LmVELOX7usdt99TRC20xQeR4Addr71cD', network: 'TRC20', status: 'pending',
    requestedAt: '2026-08-09T07:52:00Z',
  },
  {
    id: 'w3', userName: 'Ada Yılmaz', veloxId: 'VLX-100513', amount: 500, fee: 5, net: 495,
    address: '0xVELOX9aF2usdtERC20Bnb552Addr0x8812eF', network: 'BEP20', status: 'pending',
    requestedAt: '2026-08-09T06:30:00Z',
  },
  {
    id: 'w4', userName: 'Ece Çelik', veloxId: 'VLX-100634', amount: 1200, fee: 12, net: 1188,
    address: 'TZr8VELOXusdt5TRC20mLw2Addr66kP01xY', network: 'TRC20', status: 'approved',
    requestedAt: '2026-08-08T19:10:00Z',
  },
  {
    id: 'w5', userName: 'Mert Aydın', veloxId: 'VLX-100590', amount: 3000, fee: 30, net: 2970,
    address: 'TWq1VELOXusdt2TRC20zXc9Addr44jN22aB', network: 'TRC20', status: 'rejected',
    requestedAt: '2026-08-08T14:02:00Z',
  },
]

/** 30-day platform volume trend (deterministic). */
export const demoAdminVolumeTrend: { day: number; value: number }[] = Array.from(
  { length: 30 },
  (_, i) => ({
    day: i + 1,
    // smooth deterministic wave, no Math.random
    value: Math.round(60000 + Math.sin(i / 3) * 18000 + i * 900),
  }),
)
