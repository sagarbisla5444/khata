import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const PAGE = 1000 // Supabase returns at most 1000 rows per request, so we page.

async function fetchAll(table, onlyLive) {
  const all = []
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from(table).select('*').order('id').range(from, from + PAGE - 1)
    if (onlyLive) q = q.is('deleted_at', null)
    const { data, error } = await q
    if (error) throw new Error(`${table}: ${error.message}`)
    all.push(...data)
    if (data.length < PAGE) return all
  }
}

let cache = null

async function load() {
  const [agents, customers, loans, payments] = await Promise.all([
    fetchAll('agents', false), fetchAll('customers', true), fetchAll('loans', true), fetchAll('payments', true),
  ])
  loans.forEach((l) => ['principal', 'file_fee', 'total'].forEach((k) => (l[k] = Number(l[k]))))
  payments.forEach((p) => (p.amount = Number(p.amount)))
  cache = { agents, customers, loans, payments, at: new Date() }
  return cache
}

// Admin data is read live from Supabase (needs internet). Shows the last loaded copy while refreshing.
export function useAdmin() {
  const [s, setS] = useState({ data: cache, loading: true, error: null })
  const reload = useCallback(async () => {
    setS((x) => ({ ...x, loading: true, error: null }))
    try { setS({ data: await load(), loading: false, error: null }) }
    catch (e) { setS((x) => ({ ...x, loading: false, error: e.message })) }
  }, [])
  useEffect(() => { reload() }, [reload])
  return { ...s, reload }
}

export async function setAgentPlan(id, plan, expiry) {
  const { data, error } = await supabase.from('agents')
    .update({ plan, plan_expiry: plan === 'pro' ? expiry : null }).eq('id', id).select()
  if (error) throw new Error(error.message)
  if (!data.length) throw new Error('Not allowed. Is this account an admin?')
}
