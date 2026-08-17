/**
 * Intraday market-scenario values for the VELOX demo. Eight three-hour slots
 * are derived deterministically from the Istanbul calendar date, so a refresh
 * never changes an already displayed scenario. These values are presentation
 * data only: they never create balances, payouts, or withdrawal rights.
 */
export type DemoMarketScenario = {
  slot: number
  label: string
  rate: number
  active: boolean
}

const TIME_ZONE = 'Europe/Istanbul'

function parts(date: Date) {
  const values = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => values.find((item) => item.type === type)?.value ?? '00'
  return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}

function stableUnit(key: string) {
  let hash = 2166136261
  for (const char of key) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

function rateFor(day: string, slot: number) {
  return Math.round((1.4 + stableUnit(`${day}:velox-demo:${slot}`) * 0.7) * 100) / 100
}

export function getDemoMarketScenarios(now = new Date()): DemoMarketScenario[] {
  const { day, hour } = parts(now)
  const activeSlot = Math.min(7, Math.floor(hour / 3))
  return Array.from({ length: 8 }, (_, slot) => {
    const start = String(slot * 3).padStart(2, '0')
    const end = String(slot === 7 ? 24 : (slot + 1) * 3).padStart(2, '0')
    return { slot, label: `${start}:00–${end}:00`, rate: rateFor(day, slot), active: slot === activeSlot }
  })
}
