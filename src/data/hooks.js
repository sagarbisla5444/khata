import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'
import { summarize } from '../logic/loan.js'
import { planState } from '../logic/plan.js'

const alive = (table) => () => db[table].filter((r) => !r.deleted_at).toArray()

// Everything the screens need, kept live from the local database.
export function usePortfolio() {
  const customers = useLiveQuery(alive('customers'), [], [])
  const allLoans = useLiveQuery(alive('loans'), [], [])
  const payments = useLiveQuery(alive('payments'), [], [])
  return useMemo(() => {
    const ids = new Set(customers.map((c) => c.id))
    const loans = allLoans.filter((l) => ids.has(l.customer_id))
    const items = loans.map((loan) => ({
      loan,
      s: summarize(loan, payments.filter((p) => p.loan_id === loan.id)),
    }))
    return { customers, loans, payments, items }
  }, [customers, allLoans, payments])
}

// The plan comes from the server (agents table) and is cached on the device by sync.
const planRow = () => useLiveQuery(async () => (await db.meta.get('plan'))?.value ?? null, [], null)
export const usePlanInfo = () => ({ raw: planRow() })
export const usePlan = () => planState(planRow()).plan
export const usePlanState = () => { const raw = planRow(); return { raw, ...planState(raw) } }
