import { ymd } from './dates.js'

// Pro stops working if the phone has not checked with the server for this many days.
export const GRACE_DAYS = 7

// `p` = what the server last told us: { plan, expiry: 'YYYY-MM-DD' | null, checkedAt: ISO time }
export function planState(p, now = new Date()) {
  if (!p || typeof p !== 'object' || p.plan !== 'pro' || !p.expiry) return { plan: 'regular', reason: null }
  if (p.expiry < ymd(now)) return { plan: 'regular', reason: 'expired' }
  if (now - new Date(p.checkedAt) > GRACE_DAYS * 86400000) return { plan: 'regular', reason: 'unverified' }
  return { plan: 'pro', reason: null }
}
