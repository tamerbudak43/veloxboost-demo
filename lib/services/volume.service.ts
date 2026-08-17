/**
 * VELOX volume engine — pure calculations over a flat NetworkMember list.
 * No React, no DB. All numeric access goes through safeNumber().
 */
import { safeArray, safeNumber } from '@/lib/format'
import type { LegSummary, NetworkMember } from '@/lib/network/types'

/** Map of parent id → direct children. */
export function childrenMap(members: NetworkMember[]): Map<string, NetworkMember[]> {
  const map = new Map<string, NetworkMember[]>()
  for (const m of safeArray<NetworkMember>(members)) {
    if (!m.sponsorId) continue
    const list = map.get(m.sponsorId) ?? []
    list.push(m)
    map.set(m.sponsorId, list)
  }
  return map
}

/** All descendants of `id` (excludes the node itself). */
export function descendantsOf(
  members: NetworkMember[],
  id: string,
  kids = childrenMap(members),
): NetworkMember[] {
  const out: NetworkMember[] = []
  const queue = [...(kids.get(id) ?? [])]
  while (queue.length > 0) {
    const node = queue.shift() as NetworkMember
    out.push(node)
    const c = kids.get(node.id)
    if (c) queue.push(...c)
  }
  return out
}

export function sumPersonalVolume(members: NetworkMember[]): number {
  return safeArray<NetworkMember>(members).reduce((acc, m) => acc + safeNumber(m.personalVolume), 0)
}

/** Direct partners (depth 1 relative to `id`). */
export function directPartners(
  members: NetworkMember[],
  id: string,
  kids = childrenMap(members),
): NetworkMember[] {
  return kids.get(id) ?? []
}

/**
 * Per-branch leg summaries for the root member. Each direct partner defines a
 * leg containing that partner and their entire downline. The highest-volume
 * leg is flagged as the strong leg.
 */
export function legSummaries(members: NetworkMember[], rootId: string): LegSummary[] {
  const kids = childrenMap(members)
  const directs = directPartners(members, rootId, kids)

  const legs: LegSummary[] = directs.map((d) => {
    const branch = [d, ...descendantsOf(members, d.id, kids)]
    const volume = sumPersonalVolume(branch)
    return {
      id: d.id,
      partnerName: d.name,
      partnerVeloxId: d.veloxId,
      members: branch.length,
      active: branch.filter((m) => m.status === 'active' || m.status === 'qualified').length,
      qualified: branch.filter((m) => m.status === 'qualified').length,
      volume,
      percentOfTeam: 0,
      isStrongLeg: false,
    }
  })

  const teamVolume = legs.reduce((acc, l) => acc + l.volume, 0)
  let strongIdx = -1
  let strongVol = -1
  legs.forEach((l, i) => {
    l.percentOfTeam = teamVolume > 0 ? (l.volume / teamVolume) * 100 : 0
    if (l.volume > strongVol) {
      strongVol = l.volume
      strongIdx = i
    }
  })
  if (strongIdx >= 0) legs[strongIdx].isStrongLeg = true

  return legs.sort((a, b) => b.volume - a.volume)
}

export interface VolumeBreakdown {
  personalVolume: number
  directVolume: number
  teamVolume: number
  strongLegVolume: number
  otherLegVolume: number
}

/** Aggregate personal / direct / team / strong-leg / other-leg volumes. */
export function volumeBreakdown(members: NetworkMember[], rootId: string): VolumeBreakdown {
  const kids = childrenMap(members)
  const root = safeArray<NetworkMember>(members).find((m) => m.id === rootId)
  const directs = directPartners(members, rootId, kids)
  const legs = legSummaries(members, rootId)

  const teamVolume = legs.reduce((acc, l) => acc + l.volume, 0)
  const strongLegVolume = legs.reduce((acc, l) => Math.max(acc, l.volume), 0)

  return {
    personalVolume: safeNumber(root?.personalVolume),
    directVolume: sumPersonalVolume(directs),
    teamVolume,
    strongLegVolume,
    otherLegVolume: Math.max(0, teamVolume - strongLegVolume),
  }
}
