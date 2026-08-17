/**
 * VELOX sponsor-based network types.
 * The network has UNLIMITED direct partners per member and up to 33 depth
 * levels. There is no forced/binary matrix.
 */

export type MemberStatus = 'active' | 'inactive' | 'qualified'

/** A single node in the sponsor network (flat record form). */
export interface NetworkMember {
  id: string
  name: string
  veloxId: string
  /** parent (sponsor) id — null only for the root member */
  sponsorId: string | null
  /** distance from the root member (0 = root, 1 = direct partner, …) */
  depth: number
  /** id of the top-level branch (direct partner of root) this member sits under */
  legRootId: string
  status: MemberStatus
  career: string
  personalInvestment: number
  personalVolume: number
  joinedAt: string
}

/** Sponsor tree node (nested form) for the graphical explorer. */
export interface SponsorTreeNode {
  id: string
  name: string
  veloxId: string
  status: MemberStatus
  career: string
  personalVolume: number
  teamVolume: number
  directCount: number
  totalDownline: number
  depth: number
  isSelf: boolean
  isStrongLeg: boolean
  children: SponsorTreeNode[]
}

/** Per-branch (leg) aggregate. */
export interface LegSummary {
  id: string
  partnerName: string
  partnerVeloxId: string
  members: number
  active: number
  qualified: number
  volume: number
  percentOfTeam: number
  isStrongLeg: boolean
}

/** Per-depth-level aggregate (levels 1..33). */
export interface DepthRow {
  level: number
  members: number
  active: number
  qualified: number
  volume: number
  investment: number
  commissionRate: number
  unlocked: boolean
}

/** Top-of-page network summary. */
export interface NetworkSummary {
  totalNetwork: number
  directPartners: number
  activePartners: number
  qualifiedPartners: number
  personalVolume: number
  directVolume: number
  teamVolume: number
  strongLegVolume: number
  otherLegVolume: number
  /** Largest direct sponsor branch. */
  longLegVolume: number
  /** Sum of all direct branches except the longest branch. */
  shortLegVolume: number
  currentCareer: string
}

/** Career definition + its requirement thresholds (from DB). */
export interface CareerDef {
  id: number
  code: string
  name: string
  displayOrder: number
  unlockedDepth: number
  dailyWithdrawalLimit: number
  careerReward: number
  requirements: {
    requiredPersonalPartners: number
    requiredActivePartners: number
    requiredQualifiedPartners: number
    requiredPersonalInvestment: number
    requiredPersonalVolume: number
    requiredDirectVolume: number
    requiredTeamVolume: number
    requiredStrongLegVolume: number
    requiredOtherLegVolume: number
  }
}

/** A single requirement row shown on the career progression page. */
export interface RequirementProgress {
  key: string
  label: string
  current: number
  required: number
  progress: number
  met: boolean
  format: 'count' | 'usdt'
}

/** Result of the career qualification engine. */
export interface CareerProgress {
  currentCareer: CareerDef
  nextCareer: CareerDef | null
  progress: number
  requirements: RequirementProgress[]
}

/** Independently configurable cashback qualification tier. */
export interface CashbackTierDef {
  id: number
  code: string
  name: string
  displayOrder: number
  fromDepth: number
  toDepth: number
  requiredTeamVolume: number
  requiredDirectPartners: number
  cashbackAmount: number
  dailyWithdrawalLimit: number
  enabled: boolean
}

export interface CashbackQualification {
  currentTier: CashbackTierDef | null
  nextTier: CashbackTierDef | null
  eligible: boolean
  requirements: RequirementProgress[]
}

/** Transparent demo-only finance projection; never a wallet or payment record. */
export interface DemoFinanceSummary {
  grossSystemIncome: number
  memberYieldAllocation: number
  networkCommissionAllocation: number
  cashbackAllocation: number
  totalPlannedDistribution: number
  simulatedReserve: number
  simulatedPaymentQueue: number
}

/** Network commission (earnings) row. */
export interface CommissionRow {
  id: string
  date: string
  sourceName: string
  sourceVeloxId: string
  depth: number
  sourceVolume: number
  rate: number
  commission: number
  career: string
  status: 'Paid' | 'Approved' | 'Qualified' | 'Pending' | 'Rejected'
}
