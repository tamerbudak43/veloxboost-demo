/**
 * VELOX shared numeric + currency formatting.
 * Every value rendered in the UI must pass through here so the app never
 * throws on undefined / null / string / NaN values coming from the API or DB.
 */

/** Returns the value if it is an array, otherwise an empty typed array. */
export function safeArray<T>(value: T[]): T[]
export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function safeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === 'string') {
    // tolerate "1.234,56" and "1,234.56" style inputs by stripping grouping
    const normalized = value.replace(/\s/g, '').replace(/,/g, '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Format a plain number with grouping, using Turkish locale (1.234,56).
 */
export function formatNumber(value: unknown, fractionDigits = 2): string {
  const n = safeNumber(value)
  return n.toLocaleString('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/**
 * Format a value as a USDT amount. VELOX is USDT-only, always suffix "USDT".
 * Default 4 fraction digits to match the platform accounting style.
 */
export function formatUSDT(value: unknown, fractionDigits = 4): string {
  return `${formatNumber(value, fractionDigits)} USDT`
}

/**
 * Percentage with a % suffix. Guards against zero denominators upstream.
 */
export function formatPercent(value: unknown, fractionDigits = 2): string {
  return `${formatNumber(value, fractionDigits)}%`
}

/**
 * Safe percentage of a part over a whole. Returns 0 when the whole is 0.
 */
export function percentOf(part: unknown, whole: unknown): number {
  const w = safeNumber(whole)
  if (w === 0) return 0
  return (safeNumber(part) / w) * 100
}

/**
 * Clamp a progress value into the 0-100 range.
 */
export function clampProgress(value: unknown): number {
  const n = safeNumber(value)
  return Math.min(100, Math.max(0, n))
}

/**
 * Format a date/time value defensively. Returns "-" when unparseable.
 */
export function formatDateTime(value: unknown): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value: unknown): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format seconds as MM:SS (or HH:MM:SS when over an hour).
 */
export function formatCountdown(totalSeconds: unknown): string {
  const s = Math.max(0, Math.floor(safeNumber(totalSeconds)))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(minutes)}:${pad(seconds)}`
}
