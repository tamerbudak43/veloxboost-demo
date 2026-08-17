import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { career, careerRewardAccrual } from '@/lib/db/schema'
import { safeNumber } from '@/lib/format'

export async function ensureCareerRewardAccrual(userId: string, careerCode: string) {
  const [rank] = await db.select().from(career).where(eq(career.code, careerCode)).limit(1)
  if (!rank) return { total: 0, accrued: 0, pending: 0, history: [] as never[] }
  const history = await db.select().from(careerRewardAccrual)
    .where(eq(careerRewardAccrual.userId, userId)).orderBy(desc(careerRewardAccrual.createdAt))
  const existing = history.find((row) => row.careerCode === careerCode)
  const accrued = history.filter((row) => row.status !== 'reversed').reduce((sum, row) => sum + safeNumber(row.deltaAmount), 0)
  const total = safeNumber(rank.careerReward)
  if (!existing && total > accrued) {
    await db.insert(careerRewardAccrual).values({
      userId, careerCode, totalEntitlement: String(total), previouslyAccrued: String(accrued), deltaAmount: String(total - accrued), status: 'pending',
    }).onConflictDoNothing()
  }
  const updated = existing ? history : await db.select().from(careerRewardAccrual)
    .where(eq(careerRewardAccrual.userId, userId)).orderBy(desc(careerRewardAccrual.createdAt))
  return {
    total,
    accrued: updated.filter((row) => row.status !== 'reversed').reduce((sum, row) => sum + safeNumber(row.deltaAmount), 0),
    pending: updated.filter((row) => row.status === 'pending').reduce((sum, row) => sum + safeNumber(row.deltaAmount), 0),
    history: updated,
  }
}
