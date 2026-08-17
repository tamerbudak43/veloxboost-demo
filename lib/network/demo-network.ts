import type { MemberStatus, NetworkMember } from './types'

/**
 * Deterministic VELOX demo network.
 *
 * Root member: Tamer Budak (VLX1905) with SEVEN unlimited-width sponsor
 * branches of different sizes (Ahmet is the strong leg). Generated with a
 * seeded PRNG so the data is stable across server renders. Depth reaches ~6
 * levels; the architecture itself supports up to 33.
 */

// --- seeded RNG (mulberry32) ----------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  'Ahmet', 'Ayşe', 'Can', 'Murat', 'Selin', 'Burak', 'Mehmet', 'Elif', 'Deniz',
  'Zeynep', 'Emre', 'Merve', 'Kaan', 'Ece', 'Ali', 'Fatma', 'Hakan', 'Buse',
  'Onur', 'Gizem', 'Serkan', 'Derya', 'Tolga', 'Pınar', 'Barış', 'Sena',
  'Volkan', 'Aslı', 'Cem', 'Nur', 'Yusuf', 'İrem', 'Kerem', 'Melis', 'Uğur',
]
const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Aydın', 'Çelik', 'Öztürk', 'Arslan',
  'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan',
  'Şimşek', 'Polat', 'Korkmaz', 'Erdoğan', 'Yıldız', 'Aksoy', 'Taş', 'Bulut',
]

const CAREERS = ['STARTER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

// Target subtree sizes for each of the 7 branches (Ahmet = strong leg).
const BRANCH_TARGETS = [78, 35, 24, 18, 12, 9, 6]
const BRANCH_ROOTS = [
  'Ahmet Yılmaz', 'Ayşe Kaya', 'Can Demir', 'Murat Şahin',
  'Selin Aydın', 'Burak Çelik', 'Mehmet Öztürk',
]

const MAX_DEMO_DEPTH = 6

function pickStatus(rand: () => number): MemberStatus {
  const r = rand()
  if (r < 0.55) return 'qualified'
  if (r < 0.85) return 'active'
  return 'inactive'
}

function pickCareer(rand: () => number, depth: number): string {
  // shallower members tend to have higher careers
  const ceiling = Math.max(1, CAREERS.length - depth)
  return CAREERS[Math.floor(rand() * ceiling)]
}

interface BuiltNetwork {
  rootId: string
  members: NetworkMember[]
}

let cached: BuiltNetwork | null = null

export function getDemoNetwork(): BuiltNetwork {
  if (cached) return cached

  const rand = mulberry32(19051905)
  const members: NetworkMember[] = []
  let counter = 1045

  const nextVeloxId = () => `VLX${counter++}`
  const fullName = () =>
    `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${
      LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    }`

  const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

  // Root
  const rootId = 'demo-root'
  members.push({
    id: rootId,
    name: 'Tamer Budak',
    veloxId: 'VLX1905',
    sponsorId: null,
    depth: 0,
    legRootId: rootId,
    status: 'qualified',
    career: 'GOLD',
    personalInvestment: 5000,
    personalVolume: 5000,
    joinedAt: daysAgo(420),
  })

  BRANCH_ROOTS.forEach((branchName, bi) => {
    const branchRootId = `demo-b${bi}`
    const target = BRANCH_TARGETS[bi]
    // The direct partner (depth 1)
    members.push({
      id: branchRootId,
      name: branchName,
      veloxId: nextVeloxId(),
      sponsorId: rootId,
      depth: 1,
      legRootId: branchRootId,
      status: bi < 5 ? 'qualified' : 'active',
      career: pickCareer(rand, 1),
      personalInvestment: 1000 + Math.floor(rand() * 1500),
      personalVolume: 400 + Math.floor(rand() * 1200),
      joinedAt: daysAgo(360 - bi * 20),
    })

    // Breadth-first fill of this branch until we hit the target size.
    let built = 1
    const queue: { id: string; depth: number }[] = [{ id: branchRootId, depth: 1 }]
    while (queue.length > 0 && built < target) {
      const parent = queue.shift() as { id: string; depth: number }
      if (parent.depth >= MAX_DEMO_DEPTH) continue
      // wider near the top of the strong legs, narrower deeper / weaker legs
      const remaining = target - built
      const maxKids = Math.min(remaining, parent.depth === 1 ? 5 : 4)
      const kids = 1 + Math.floor(rand() * maxKids)
      for (let k = 0; k < kids && built < target; k++) {
        const id = `demo-b${bi}-${built}`
        const depth = parent.depth + 1
        members.push({
          id,
          name: fullName(),
          veloxId: nextVeloxId(),
          sponsorId: parent.id,
          depth,
          legRootId: branchRootId,
          status: pickStatus(rand),
          career: pickCareer(rand, depth),
          personalInvestment: 250 + Math.floor(rand() * 900),
          personalVolume: 150 + Math.floor(rand() * 850),
          joinedAt: daysAgo(Math.floor(rand() * 300)),
        })
        queue.push({ id, depth })
        built++
      }
    }
  })

  cached = { rootId, members }
  return cached
}
