/**
 * VELOX network service — builds the summary, sponsor tree, depth breakdown
 * and member list for the network explorer. Pure functions over a flat member
 * list plus DB-loaded commission levels.
 */
import { safeArray, safeNumber } from '@/lib/format'
import type { CommissionLevelDef } from '@/lib/network/config'
import type {
  DepthRow,
  NetworkMember,
  NetworkSummary,
  SponsorTreeNode,
} from '@/lib/network/types'
import {
  childrenMap,
  descendantsOf,
  directPartners,
  legSummaries,
  sumPersonalVolume,
  volumeBreakdown,
} from './volume.service'

export const MAX_NETWORK_DEPTH = 33

export function networkSummary(
  members: NetworkMember[],
  rootId: string,
  currentCareer: string,
): NetworkSummary {
  const kids = childrenMap(members)
  const directs = directPartners(members, rootId, kids)
  const downline = descendantsOf(members, rootId, kids)
  const vol = volumeBreakdown(members, rootId)

  return {
    totalNetwork: downline.length,
    directPartners: directs.length,
    activePartners: directs.filter((d) => d.status === 'active' || d.status === 'qualified').length,
    qualifiedPartners: directs.filter((d) => d.status === 'qualified').length,
    personalVolume: vol.personalVolume,
    directVolume: vol.directVolume,
    teamVolume: vol.teamVolume,
    strongLegVolume: vol.strongLegVolume,
    otherLegVolume: vol.otherLegVolume,
    currentCareer,
  }
}

/**
 * Builds the sponsor tree (nested). Nodes carry their subtree aggregates so
 * the UI can show team volume / downline counts without recomputation.
 */
export function buildSponsorTree(members: NetworkMember[], rootId: string): SponsorTreeNode | null {
  const list = safeArray<NetworkMember>(members)
  const kids = childrenMap(list)
  const root = list.find((m) => m.id === rootId)
  if (!root) return null

  // Determine the strong leg (top branch with highest volume).
  const legs = legSummaries(list, rootId)
  const strongLegRootId = legs.find((l) => l.isStrongLeg)?.id ?? null

  function build(node: NetworkMember): SponsorTreeNode {
    const childNodes = (kids.get(node.id) ?? []).map(build)
    const downline = descendantsOf(list, node.id, kids)
    return {
      id: node.id,
      name: node.name,
      veloxId: node.veloxId,
      status: node.status,
      career: node.career,
      personalVolume: safeNumber(node.personalVolume),
      teamVolume: sumPersonalVolume(downline),
      directCount: (kids.get(node.id) ?? []).length,
      totalDownline: downline.length,
      depth: node.depth,
      isSelf: node.id === rootId,
      isStrongLeg: node.id === strongLegRootId,
      children: childNodes,
    }
  }

  return build(root)
}

/**
 * Depth breakdown for levels 1..33 relative to the root member. Commission
 * rate + unlocked flag come from DB config and the member's current career.
 */
export function buildDepthRows(
  members: NetworkMember[],
  rootId: string,
  commissionLevels: CommissionLevelDef[],
  unlockedDepth: number,
): DepthRow[] {
  const list = safeArray<NetworkMember>(members)
  const kids = childrenMap(list)
  const downline = descendantsOf(list, rootId, kids)
  const rootDepth = list.find((m) => m.id === rootId)?.depth ?? 0

  const rateByLevel = new Map(commissionLevels.map((c) => [c.level, c]))
  const rows: DepthRow[] = []

  for (let level = 1; level <= MAX_NETWORK_DEPTH; level++) {
    const atLevel = downline.filter((m) => m.depth - rootDepth === level)
    const cfg = rateByLevel.get(level)
    rows.push({
      level,
      members: atLevel.length,
      active: atLevel.filter((m) => m.status === 'active' || m.status === 'qualified').length,
      qualified: atLevel.filter((m) => m.status === 'qualified').length,
      volume: sumPersonalVolume(atLevel),
      commissionRate: cfg?.enabled ? cfg.percentage : 0,
      unlocked: level <= unlockedDepth,
    })
  }

  return rows
}

export interface NetworkListRow {
  id: string
  name: string
  veloxId: string
  level: number
  status: NetworkMember['status']
  career: string
  personalVolume: number
  teamVolume: number
  joinedAt: string
}

/** Flat member list (direct + full downline) for the list view. */
export function buildMemberList(members: NetworkMember[], rootId: string): NetworkListRow[] {
  const list = safeArray<NetworkMember>(members)
  const kids = childrenMap(list)
  const rootDepth = list.find((m) => m.id === rootId)?.depth ?? 0
  const downline = descendantsOf(list, rootId, kids)

  return downline
    .map((m) => ({
      id: m.id,
      name: m.name,
      veloxId: m.veloxId,
      level: m.depth - rootDepth,
      status: m.status,
      career: m.career,
      personalVolume: safeNumber(m.personalVolume),
      teamVolume: sumPersonalVolume(descendantsOf(list, m.id, kids)),
      joinedAt: m.joinedAt,
    }))
    .sort((a, b) => a.level - b.level || b.teamVolume - a.teamVolume)
}
