import { formatINR as f } from './money.js'

export const reminderText = (c, s) =>
  `Hello ${c.name}, this is a reminder: your pending amount is ${f(s.pending)}` +
  `${s.overdue ? ` (${f(s.overdue)} overdue)` : ''}. Please pay your installment of ${f(s.installment)}. Thank you.`

export const whatsappUrl = (c, s) => `https://wa.me/91${c.phone}?text=${encodeURIComponent(reminderText(c, s))}`
