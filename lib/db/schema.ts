import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  numeric,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// `member` holds each user's VELOX network profile. Queries are scoped by the
// plain `userId` column (no RLS on Neon). No FK constraints on app columns so
// the schema stays easy to iterate on.

export const member = pgTable('member', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  // Public display + invite identifiers
  veloxId: text('veloxId').notNull().unique(),
  referralCode: text('referralCode').notNull().unique(),
  // Direct referrer (for commissions) — stores the sponsor's userId.
  // VELOX is a sponsor-based network with UNLIMITED direct partners.
  sponsorId: text('sponsorId'),
  // LEGACY (unused): binary placement columns kept only so old data migrates
  // cleanly. The new sponsor-based engine does NOT depend on them.
  placementId: text('placementId'),
  leg: text('leg'),
  // Profile / gamification
  role: text('role').notNull().default('member'), // 'member' | 'admin'
  status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'qualified'
  career: text('career').notNull().default('STARTER'),
  personalVolume: numeric('personalVolume').notNull().default('0'),
  teamVolume: numeric('teamVolume').notNull().default('0'),
  leftVolume: numeric('leftVolume').notNull().default('0'),
  rightVolume: numeric('rightVolume').notNull().default('0'),
  balance: numeric('balance').notNull().default('0'),
  directCount: integer('directCount').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- Network engine tables -------------------------------------------------
// Closure table: one row per ancestor→descendant pair with the depth between
// them (1..33). Enables fast team-size / depth / volume aggregation without
// recursively walking the tree in the browser.
export const networkClosure = pgTable(
  'network_closure',
  {
    id: serial('id').primaryKey(),
    ancestorUserId: text('ancestorUserId').notNull(),
    descendantUserId: text('descendantUserId').notNull(),
    depth: integer('depth').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('network_closure_ancestor_descendant_uq').on(
      table.ancestorUserId,
      table.descendantUserId,
    ),
    index('network_closure_ancestor_depth_idx').on(table.ancestorUserId, table.depth),
    index('network_closure_descendant_idx').on(table.descendantUserId),
  ],
)

// Career ladder — real DB entities, admin-configurable (not hard-coded text).
export const career = pgTable('career', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  displayOrder: integer('displayOrder').notNull().default(0),
  unlockedDepth: integer('unlockedDepth').notNull().default(3),
  dailyWithdrawalLimit: numeric('dailyWithdrawalLimit').notNull().default('0'),
  careerReward: numeric('careerReward').notNull().default('0'),
  enabled: boolean('enabled').notNull().default(true),
})

// Per-career qualification thresholds — every field is admin-editable.
export const careerRequirement = pgTable('career_requirement', {
  id: serial('id').primaryKey(),
  careerId: integer('careerId').notNull(),
  requiredPersonalPartners: integer('requiredPersonalPartners').notNull().default(0),
  requiredActivePartners: integer('requiredActivePartners').notNull().default(0),
  requiredQualifiedPartners: integer('requiredQualifiedPartners').notNull().default(0),
  requiredPersonalInvestment: numeric('requiredPersonalInvestment').notNull().default('0'),
  requiredPersonalVolume: numeric('requiredPersonalVolume').notNull().default('0'),
  requiredDirectVolume: numeric('requiredDirectVolume').notNull().default('0'),
  requiredTeamVolume: numeric('requiredTeamVolume').notNull().default('0'),
  requiredStrongLegVolume: numeric('requiredStrongLegVolume').notNull().default('0'),
  requiredOtherLegVolume: numeric('requiredOtherLegVolume').notNull().default('0'),
})

// Commission depth ladder 1..33 — configurable rate + required career.
export const commissionLevel = pgTable('commission_level', {
  id: serial('id').primaryKey(),
  level: integer('level').notNull().unique(),
  percentage: numeric('percentage').notNull().default('0'),
  requiredCareerCode: text('requiredCareerCode').notNull().default('STARTER'),
  enabled: boolean('enabled').notNull().default(true),
})

// Withdrawal requests feed the admin approval queue.
export const withdrawal = pgTable('withdrawal', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  userName: text('userName').notNull(),
  veloxId: text('veloxId').notNull(),
  amount: numeric('amount').notNull(),
  fee: numeric('fee').notNull().default('0'),
  net: numeric('net').notNull(),
  address: text('address').notNull(),
  network: text('network').notNull().default('TRC20'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Each verified USDT investment can have one immutable member-facing receipt.
// It is deliberately an operational transaction record, not a tax invoice.
export const investmentReceipt = pgTable(
  'investment_receipt',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    receiptNumber: text('receiptNumber').notNull().unique(),
    amount: numeric('amount').notNull(),
    asset: text('asset').notNull().default('USDT'),
    network: text('network').notNull().default('TRC20'),
    receivingAddress: text('receivingAddress').notNull(),
    transactionHash: text('transactionHash'),
    status: text('status').notNull().default('pending'), // pending | confirmed | rejected
    issuedAt: timestamp('issuedAt').notNull().defaultNow(),
    confirmedAt: timestamp('confirmedAt'),
  },
  (table) => [
    index('investment_receipt_user_issued_idx').on(table.userId, table.issuedAt),
    index('investment_receipt_status_idx').on(table.status, table.issuedAt),
  ],
)

// Immutable record of each cumulative career-reward entitlement. The unique
// user/career key prevents a rank from creating the same reward twice.
export const careerRewardAccrual = pgTable(
  'career_reward_accrual',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    careerCode: text('careerCode').notNull(),
    totalEntitlement: numeric('totalEntitlement').notNull(),
    previouslyAccrued: numeric('previouslyAccrued').notNull().default('0'),
    deltaAmount: numeric('deltaAmount').notNull(),
    status: text('status').notNull().default('pending'), // pending | approved | paid | reversed
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('career_reward_accrual_user_career_uq').on(table.userId, table.careerCode),
    index('career_reward_accrual_user_created_idx').on(table.userId, table.createdAt),
  ],
)

// Separate immutable-looking test ledger for the phase-1 simulator. This is
// intentionally not used by wallet, payment, auth or production operations.
export const demoLedgerEntry = pgTable(
  'demo_ledger_entry',
  {
    id: serial('id').primaryKey(),
    runKey: text('run_key').notNull(),
    userId: text('user_id').notNull(),
    userName: text('user_name').notNull(),
    veloxId: text('velox_id').notNull(),
    entryType: text('entry_type').notNull(),
    amount: numeric('amount').notNull(),
    status: text('status').notNull().default('demo_recorded'),
    reference: text('reference').notNull(),
    occurredAt: timestamp('occurred_at').notNull().defaultNow(),
  },
  (table) => [
    index('demo_ledger_entry_run_idx').on(table.runKey, table.occurredAt),
    index('demo_ledger_entry_user_idx').on(table.userId, table.occurredAt),
  ],
)
