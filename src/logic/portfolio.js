// Totals across many loans. `items` = [{ loan, s }] where s = summarize(loan, payments).
const sum = (a, f) => a.reduce((t, x) => t + f(x), 0)

export function totals(items) {
  const active = items.filter((i) => !i.s.closed)
  return {
    pending: sum(active, (i) => i.s.pending),
    given: sum(items, (i) => i.s.cashGiven),
    collected: sum(items, (i) => i.s.paid),
    expectedProfit: sum(items, (i) => i.s.expectedProfit),
    profitSoFar: sum(items, (i) => i.s.profitSoFar),
  }
}

export const forCustomer = (items, customerId) => items.filter((i) => i.loan.customer_id === customerId)

export const overdueList = (items) =>
  items.filter((i) => !i.s.closed && i.s.overdue > 0).sort((a, b) => b.s.overdue - a.s.overdue)
