import { today, addDays, addMonths } from './dates.js'

const STEP = { daily: 1, weekly: 7 }

// Installment i (1-based) is due i periods AFTER the loan date.
// Weekly loan on 18 Nov -> first EMI 25 Nov.
export function dueDate(loan, i) {
  if (loan.freq === 'monthly') return addMonths(loan.start_date, i)
  const step = loan.freq === 'custom' ? loan.custom_days : STEP[loan.freq]
  return addDays(loan.start_date, i * step)
}

export function buildSchedule(loan) {
  const n = loan.installments
  const inst = Math.ceil(loan.total / n)
  return Array.from({ length: n }, (_, k) => {
    const no = k + 1
    return { no, date: dueDate(loan, no), amount: no === n ? loan.total - inst * (n - 1) : inst }
  })
}

// Everything the screens need about one loan.
export function summarize(loan, payments = [], asOf = today()) {
  const paid = payments
    .filter((p) => !p.deleted_at)
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const schedule = buildSchedule(loan)

  let running = 0
  const rows = schedule.map((r) => {
    running += r.amount
    const status = running <= paid ? 'paid' : r.date <= asOf ? 'overdue' : 'upcoming'
    return { ...r, status }
  })

  const dueSoFar = schedule.filter((r) => r.date <= asOf).reduce((s, r) => s + r.amount, 0)
  const cashGiven = loan.principal - loan.file_fee

  return {
    schedule: rows,
    paid,
    pending: Math.max(0, loan.total - paid),
    overdue: Math.max(0, dueSoFar - paid),
    installment: schedule[0].amount,
    closed: loan.total - paid <= 0,
    cashGiven,
    expectedProfit: loan.total - cashGiven, // interest + file charge
    profitSoFar: paid - cashGiven,          // negative until cash given is recovered
  }
}
