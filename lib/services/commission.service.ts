/**
 * VELOX network commission engine. Produces the member's earning history from
 * eligible downline volume, respecting the career-unlocked commission depth
 * and the configured per-level rate.
 */
import { safeArray, safeNumber } from '@/lib/format'
import type { CommissionLevelDef } from '@/lib/network/config'
import type { CommissionRow, NetworkMember } from '@/lib/network/types'
import { childrenMap, descendantsOf } from './volume.service'

const STATUSES: CommissionRow['status'][] = ['Paid', 'Paid', 'Approved', 'Qualified', 'Pending']

/**
 * Builds commission rows for each downline member within the unlocked depth.
 * Commission = source personal volume × level rate. Deterministic ordering by
 * most recent join date.
 */
export function buildEarnings(
  members: NetworkMember[],
  rootId: string,
  currentCareer: string,
  commissionLevels: CommissionLevelDef[],
  unlockedDepth: number,
  limit = 40,
): CommissionRow[] {
  const list = safeArray<NetworkMember>(members)
  const kids = childrenMap(list)
  const rootDepth = list.find((m) => m.id === rootId)?.depth ?? 0
  const downline = descendantsOf(list, rootId, kids)
  const rateByLevel = new Map(commissionLevels.map((c) => [c.level, c]))

  const rows: CommissionRow[] = []
  for (const m of downline) {
    const level = m.depth - rootDepth
    if (level < 1 || level > unlockedDepth) continue
    const cfg = rateByLevel.get(level)
    if (!cfg || !cfg.enabled) continue
    const sourceVolume = safeNumber(m.personalVolume)
    const rate = cfg.percentage
    const commission = (sourceVolume * rate) / 100
    if (commission <= 0) continue
    rows.push({
      id: `com-${m.id}`,
      date: m.joinedAt,
      sourceName: m.name,
      sourceVeloxId: m.veloxId,
      depth: level,
      sourceVolume,
      rate,
      commission,
      career: currentCareer,
      status: STATUSES[level % STATUSES.length],
    })
  }

  return rows
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function totalEarnings(rows: CommissionRow[]): number {
  return safeArray<CommissionRow>(rows).reduce((acc, r) => acc + safeNumber(r.commission), 0)
}
