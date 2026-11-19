// All dates are 'YYYY-MM-DD' strings in the device's LOCAL time.
// (Using toISOString() shifts dates by a day in India, so we never use it.)
const pad = (n) => String(n).padStart(2, '0')

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const today = () => ymd(new Date())
const parse = (s) => new Date(`${s}T00:00:00`)

export function addDays(s, n) {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}

// Same date next month; 31 Jan + 1 month = 28/29 Feb (not March).
export function addMonths(s, n) {
  const d = parse(s)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return ymd(d)
}

// '2026-11-25' -> '25 Nov 2026'
export const fmtDate = (s) =>
  parse(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
