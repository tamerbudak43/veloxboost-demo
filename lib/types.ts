/**
 * VELOX domain types. These mirror the intended backend/database schema so
 * the UI can be wired to real data later without shape changes.
 * All monetary values are USDT.
 */

export type ArbitragePhaseStatus = 'waiting' | 'active' | 'settling' | 'completed'

export interface ArbitrageBalance {
  id: string
  userId: string
  tradingBalance: number
  incomeBalance: number
  updatedAt: string
}

export interface ArbitragePhase {
  id: string
  phaseNumber: number
  startsAt: string
  endsAt: string
  status: ArbitragePhaseStatus
}

export type TradeStatus = 'active' | 'settling' | 'completed' | 'cancelled'

export interface ArbitrageTrade {
  id: string
  userId: string
  phaseId: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  buyVolume: number
  sellVolume: number
  grossSpread: number
  netSpread: number
  status: TradeStatus
  createdAt: string
}

export type AccrualStatus = 'Bekliyor' | 'Tahakkuk Etti' | 'Serbest' | 'Ödendi'

export interface Accrual {
  id: string
  userId: string
  contractId: string
  contractNumber: string
  sourceType: string
  grossAmount: number
  netAmount: number
  status: AccrualStatus
  calculatedAt: string
  releaseAt: string
  paidAt: string | null
}

export type OperationType =
  | 'Yatırım'
  | 'Yeniden yatırım'
  | 'Tahakkuk'
  | 'Çekim'

export interface Operation {
  id: string
  userId: string
  contractId: string | null
  operationType: OperationType
  amount: number
  poolName: string
  createdAt: string
}

export type InvestmentReceiptStatus = 'pending' | 'confirmed' | 'rejected'

export interface InvestmentReceipt {
  id: number
  receiptNumber: string
  amount: string
  asset: string
  network: string
  receivingAddress: string
  depositMemo: string | null
  transactionHash: string | null
  status: InvestmentReceiptStatus
  issuedAt: Date | string
  confirmedAt: Date | string | null
}

/** Live order-book style offer shown inside the buy/sell operational panels. */
export interface MarketOffer {
  id: string
  usdtVolume: number
  ethPrice: number
  ethVolume: number
}

/** A single partner in the referral tree. */
export interface Partner {
  id: string
  name: string
  veloxId: string
  avatarSeed: string
  level: number
  status: 'active' | 'inactive' | 'qualified'
  career: string
  personalVolume: number
  teamVolume: number
  directCount: number
  joinedAt: string
}

/** One row of the 33-level commission architecture. */
export interface CommissionLevel {
  level: number
  /** commission rate as a percentage of level turnover */
  rate: number
  /** career rank required to unlock this level */
  requiredCareer: string
  partners: number
  levelVolume: number
  earned: number
  unlocked: boolean
}

/** Team volume split into legs for binary-style qualification. */
export interface TeamVolume {
  personalVolume: number
  totalTeamVolume: number
  strongLeg: number
  weakLeg: number
  legs: { id: string; name: string; volume: number; partners: number }[]
  qualifiedVolume: number
}

/**
 * A node in the binary ("Metrix") tree. Each node holds up to two child slots
 * (left / right leg); empty slots render as open positions.
 */
export interface MatrixNode {
  id: string
  name: string
  veloxId: string
  avatarSeed: string
  status: 'active' | 'inactive' | 'qualified'
  career: string
  personalVolume: number
  teamVolume: number
  /** which leg this node occupies under its parent */
  leg?: 'left' | 'right' | null
  /** true only for the logged-in user at the root of the tree */
  isSelf?: boolean
  children: MatrixNode[]
}

/** A qualification requirement toward the next rank. */
export interface Qualification {
  id: string
  label: string
  current: number
  target: number
  unit: 'USDT' | 'count' | 'legs'
  met: boolean
}

/** A time-boxed boost that multiplies commission when a target is hit. */
export interface PartnerBoost {
  id: string
  title: string
  description: string
  multiplier: number
  progress: number
  target: number
  unit: 'USDT' | 'count'
  reward: number
  endsAt: string
  status: 'active' | 'completed' | 'locked'
}

/** A leaderboard-style challenge with ranked participants. */
export interface Challenge {
  id: string
  title: string
  description: string
  metric: string
  prizePool: number
  endsAt: string
  myRank: number
  myScore: number
  leaderboard: { rank: number; name: string; veloxId: string; score: number; prize: number }[]
}

/** Admin: a platform user row. */
export interface AdminUser {
  id: string
  name: string
  veloxId: string
  email: string
  career: string
  balance: number
  status: 'active' | 'suspended' | 'pending'
  kyc: 'verified' | 'pending' | 'rejected'
  joinedAt: string
}

/** Admin: a withdrawal awaiting review. */
export interface WithdrawalRequest {
  id: string
  userName: string
  veloxId: string
  amount: number
  fee: number
  net: number
  address: string
  network: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
}

/** Admin: platform-wide KPI snapshot. */
export interface AdminKpi {
  totalUsers: number
  activeUsers: number
  totalDeposits: number
  totalWithdrawals: number
  poolBalance: number
  pendingWithdrawals: number
  activeContracts: number
  dailyVolume: number
}

export type ContractStatus = 'Active' | 'Completed' | 'Paused' | 'Cancelled'

export interface InvestmentContract {
  id: string
  contractNumber: string
  userId: string
  initialAmount: number
  currentEarnings: number
  totalPaid: number
  targetAmount: number
  remainingAmount: number
  progress: number
  startDate: string
  completedAt: string | null
  status: ContractStatus
  createdAt: string
}
