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

// Fixed for the phase-1 test run. This is presentation-only test data and is
// never credited to a wallet or transmitted as a payment instruction.
export const DEMO_DAILY_SYSTEM_RATE = 2.6
export const DEMO_DAILY_DISTRIBUTION_AVERAGE = 1.7
export const DEMO_DAILY_DISTRIBUTION_MIN = 1.4
export const DEMO_DAILY_DISTRIBUTION_MAX = 2.2

const TIME_ZONE = 'Europe/Istanbul'

function parts(date: Date) {
  const values = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => values.find((item) => item.type === type)?.value ?? '00'
  return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}

function dayRotation(day: string) {
  let total = 0
  for (const character of day) total += character.charCodeAt(0)
  return total % 8
}

export function getDemoMarketScenarios(now = new Date()): DemoMarketScenario[] {
  const { day, hour } = parts(now)
  const activeSlot = Math.min(7, Math.floor(hour / 3))
  // Sum = 13.6, so each calendar day's eight slots average exactly 1.70%.
  const rates = [1.4, 1.5, 1.6, 1.7, 2.2, 1.9, 1.8, 1.5]
  const rotation = dayRotation(day)
  return Array.from({ length: 8 }, (_, slot) => {
    const start = String(slot * 3).padStart(2, '0')
    const end = String(slot === 7 ? 24 : (slot + 1) * 3).padStart(2, '0')
    return { slot, label: `${start}:00–${end}:00`, rate: rates[(slot + rotation) % rates.length], active: slot === activeSlot }
  })
}
