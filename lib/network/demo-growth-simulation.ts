import type { NetworkMember } from './types'

/**
 * Seven-day, deterministic test dataset for the VELOX demo.
 *
 * It is intentionally UI-only: it creates neither auth users nor database
 * records and it never creates wallet, payout, withdrawal or commission-ledger
 * entries.  Re-rendering produces the same sponsor graph for the same root.
 */
export const DEMO_GROWTH_DAYS = 7
export const DEMO_STARTING_REGISTRATIONS = 10
export const DEMO_DAILY_GROWTH_RATE = 30

export type DemoRegistrantType = 'investor' | 'leader' | 'starter'

export type DemoGrowthDay = {
  day: number
  label: string
  registrations: number
  totalNetwork: number
  teamInvestment: number
  investors: number
  leaders: number
  starters: number
  cashbackPreview: number
  isCurrent: boolean
  isFuture: boolean
}

export type DemoGrowthSimulation = {
  enabled: true
  growthRate: number
  currentDay: number
  days: DemoGrowthDay[]
  projectedCareer: string
  cashbackPreview: number
  disclaimer: string
}

function istanbulDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function simulationDay() {
  // Set VELOX_DEMO_SIMULATION_START_DATE in Vercel to restart the 7-day
  // exercise. This fallback starts the current demo cycle on 17 Aug 2026.
  const start = process.env.VELOX_DEMO_SIMULATION_START_DATE ?? '2026-08-17'
  const today = istanbulDayKey()
  const elapsed = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1
  return Math.max(1, Math.min(DEMO_GROWTH_DAYS, Number.isFinite(elapsed) ? elapsed : 1))
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = ['Deniz', 'Ece', 'Mert', 'Selin', 'Barış', 'İrem', 'Kaan', 'Buse', 'Emre', 'Derya', 'Kerem', 'Zeynep', 'Can', 'Elif', 'Tolga', 'Merve']
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Aydın', 'Çelik', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin']

function targetNetworkForDay(day: number) {
  return Math.round(DEMO_STARTING_REGISTRATIONS * Math.pow(1 + DEMO_DAILY_GROWTH_RATE / 100, day - 1))
}

function cashbackFor(volume: number) {
  if (volume >= 45_000) return 300
  if (volume >= 15_000) return 200
  if (volume >= 5_000) return 100
  return 0
}

function careerFor(totalNetwork: number, teamInvestment: number) {
  if (totalNetwork >= 150 && teamInvestment >= 45_000) return 'GOLD'
  if (totalNetwork >= 75 && teamInvestment >= 20_000) return 'SILVER'
  if (totalNetwork >= 25) return 'BRONZE'
  return 'STARTER'
}

function categoryFor(index: number): DemoRegistrantType {
  // Exact, stable long-run mix: 16% investors, 3% leaders, remainder starters.
  const bucket = index % 100
  if (bucket < 16) return 'investor'
  if (bucket < 19) return 'leader'
  return 'starter'
}

export function buildDemoGrowthSimulation(root: {
  userId: string
  name: string
  veloxId: string
  career: string
}): { members: NetworkMember[]; simulation: DemoGrowthSimulation } {
  const seed = [...root.userId].reduce((value, character) => value + character.charCodeAt(0), 1905)
  const random = mulberry32(seed)
  const now = new Date()
  const members: NetworkMember[] = [{
    id: root.userId,
    name: root.name,
    veloxId: root.veloxId,
    sponsorId: null,
    depth: 0,
    legRootId: root.userId,
    status: 'qualified',
    career: root.career,
    personalInvestment: 0,
    personalVolume: 0,
    joinedAt: new Date(now.getTime() - 8 * 86_400_000).toISOString(),
  }]

  const days: DemoGrowthDay[] = []
  const currentDay = simulationDay()
  let activeMembers = [...members]
  let serial = 1
  let investorCount = 0
  let leaderCount = 0
  let starterCount = 0

  for (let day = 1; day <= DEMO_GROWTH_DAYS; day++) {
    // The total network, rather than the daily intake, grows about 30% from
    // one snapshot to the next: 10 → 13 → 17 → 22 → 29 → 37 → 48.
    const registrations = Math.max(0, targetNetworkForDay(day) - (members.length - 1))
    for (let slot = 0; slot < registrations; slot++) {
      const type = categoryFor(serial - 1)
      const investment = type === 'investor'
        ? 1000 + Math.round(random() * 2500)
        : type === 'leader'
          ? 750 + Math.round(random() * 450)
          : 100 + Math.round(random() * 900)
      const parentIndex = members.length === 1
        ? 0
        // New registrations appear under earlier registrations only. The
        // first few are direct referrals, later ones spread into the network.
        : (serial <= 10 ? 0 : Math.floor(random() * Math.max(1, members.length - 1)) + 1)
      const sponsor = members[parentIndex] ?? members[0]
      const depth = Math.min(33, sponsor.depth + 1)
      const id = `demo-sim-${day}-${serial}`
      const name = `${FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(random() * LAST_NAMES.length)]}`
      const joinedAt = new Date(now.getTime() - (DEMO_GROWTH_DAYS - day) * 86_400_000 - slot * 3_600_000).toISOString()

      members.push({
        id,
        name,
        veloxId: `SIM${String(1000 + serial)}`,
        sponsorId: sponsor.id,
        depth,
        legRootId: sponsor.depth === 0 ? id : sponsor.legRootId,
        status: type === 'starter' && serial % 5 === 0 ? 'active' : 'qualified',
        career: type === 'leader' ? 'GOLD' : type === 'investor' ? 'SILVER' : serial % 3 === 0 ? 'BRONZE' : 'STARTER',
        personalInvestment: investment,
        personalVolume: investment,
        joinedAt,
      })
      if (type === 'investor') investorCount++
      else if (type === 'leader') leaderCount++
      else starterCount++
      serial++
    }

    const downline = members.slice(1)
    const teamInvestment = downline.reduce((total, item) => total + item.personalInvestment, 0)
    days.push({
      day,
      label: `${day}. gün`,
      registrations,
      totalNetwork: downline.length,
      teamInvestment,
      investors: investorCount,
      leaders: leaderCount,
      starters: starterCount,
      cashbackPreview: cashbackFor(teamInvestment),
      isCurrent: day === currentDay,
      isFuture: day > currentDay,
    })
    if (day === currentDay) activeMembers = [...members]
  }

  const latest = days[currentDay - 1]
  return {
    members: activeMembers,
    simulation: {
      enabled: true,
      growthRate: DEMO_DAILY_GROWTH_RATE,
      currentDay,
      days,
      projectedCareer: careerFor(latest.totalNetwork, latest.teamInvestment),
      cashbackPreview: latest.cashbackPreview,
      disclaimer: 'Bu veri yalnızca demo simülasyonudur; üye hesabı, para yatırma, komisyon, cashback bakiyesi veya çekim kaydı oluşturmaz.',
    },
  }
}
