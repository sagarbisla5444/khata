import { summarize } from './loan.js'
import { totals } from './portfolio.js'
import { today } from './dates.js'

// d = { agents, customers, loans, payments } fetched by the admin screen (all agents).
export function agentRows(d, asOf = today()) {
  const byLoan = new Map()
  for (const p of d.payments) {
    if (!byLoan.has(p.loan_id)) byLoan.set(p.loan_id, [])
    byLoan.get(p.loan_id).push(p)
  }
  return d.agents.map((agent) => {
    const customers = d.customers.filter((c) => c.agent_id === agent.id)
    const ids = new Set(customers.map((c) => c.id))
    const items = d.loans
      .filter((l) => l.agent_id === agent.id && ids.has(l.customer_id))
      .map((loan) => ({ loan, s: summarize(loan, byLoan.get(loan.id) || [], asOf) }))
    const proActive = agent.plan === 'pro' && !!agent.plan_expiry && agent.plan_expiry >= asOf
    return { agent, customers, items, t: totals(items), proActive }
  })
}
