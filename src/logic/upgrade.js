import { PRO_PRICE_MONTH } from '../config.js'

export const MONTH_CHOICES = [1, 3, 6, 12]

export const amountFor = (months) => months * PRO_PRICE_MONTH

// UPI payment references (UTR) are exactly 12 digits.
export const cleanUtr = (s) => String(s ?? '').replace(/\D/g, '').slice(0, 12)
export const isValidUtr = (s) => /^\d{12}$/.test(String(s ?? ''))

// Link that opens the UPI app on the phone with the amount filled in. '' if no UPI id is configured.
export function upiLink({ upiId, payee }, amount) {
  if (!upiId) return ''
  const q = new URLSearchParams({ pa: upiId, pn: payee || 'Khata', am: amount.toFixed(2), cu: 'INR', tn: 'Khata Pro' })
  return 'upi://pay?' + q.toString().replace(/\+/g, '%20')
}
