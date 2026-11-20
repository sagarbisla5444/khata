import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// These need internet: a payment request is not something to queue offline.
const nice = (e) => (/failed to fetch|network/i.test(e.message || '') ? 'No internet. Connect and try again.' : e.message)

async function call(fn, args) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new Error(nice(error))
  return data
}

// ----- agent -----
export const submitUpgrade = (months, utr) => call('request_upgrade', { p_months: months, p_utr: utr })

export async function myRequests() {
  const { data, error } = await supabase.from('upgrade_requests').select('*').order('created_at', { ascending: false }).limit(5)
  if (error) throw new Error(nice(error))
  return data.map((r) => ({ ...r, amount: Number(r.amount) }))
}

// ----- admin -----
export async function allRequests() {
  const [reqs, agents] = await Promise.all([
    supabase.from('upgrade_requests').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('agents').select('id,name,email'),
  ])
  const err = reqs.error || agents.error
  if (err) throw new Error(nice(err))
  const who = new Map(agents.data.map((a) => [a.id, a]))
  return reqs.data.map((r) => ({ ...r, amount: Number(r.amount), agent: who.get(r.agent_id) || {} }))
}

export const approveUpgrade = (id) => call('approve_upgrade', { p_id: id })
export const rejectUpgrade = (id, note) => call('reject_upgrade', { p_id: id, p_note: note })

// How many requests are waiting (for the admin's badge). Re-checks whenever `key` changes.
export function usePendingCount(enabled, key) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!enabled) return
    let live = true
    supabase.from('upgrade_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      .then(({ count, error }) => { if (live && !error) setN(count || 0) }, () => {})
    return () => { live = false }
  }, [enabled, key])
  return n
}
