import { supabase } from '../lib/supabase.js'
import { db } from '../lib/db.js'

const TABLES = ['customers', 'loans', 'payments'] // parents before children
const NUMBERS = { customers: [], loans: ['principal', 'file_fee', 'total'], payments: ['amount'] }
const PAGE = 500

// ---- tiny status store the screens can subscribe to ----
let state = { syncing: false, error: null, lastSync: null, online: navigator.onLine }
const subs = new Set()
const set = (patch) => { state = { ...state, ...patch }; subs.forEach((f) => f(state)) }
export function subscribe(f) { subs.add(f); f(state); return () => subs.delete(f) }

// ---- push: send local changes to Supabase ----
async function push(agentId) {
  const pending = await db.outbox.toArray()
  if (!pending.length) return
  const maxSeq = pending[pending.length - 1].seq
  for (const table of TABLES) {
    const ids = [...new Set(pending.filter((p) => p.table === table).map((p) => p.row_id))]
    const rows = (await db[table].bulkGet(ids)).filter(Boolean).map((r) => ({ ...r, agent_id: agentId }))
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from(table).upsert(rows.slice(i, i + 200))
      if (error) throw new Error(`${table}: ${error.message}`)
    }
  }
  // Only markers up to maxSeq are cleared; edits made during the push stay queued.
  await db.outbox.where('seq').belowOrEqual(maxSeq).delete()
}

// ---- pull: bring changes made elsewhere (other device, backup) onto this device ----
async function pull(agentId) {
  for (const table of TABLES) {
    let cursor = (await db.meta.get('cursor:' + table))?.value || null
    for (;;) {
      let q = supabase.from(table).select('*').eq('agent_id', agentId).order('updated_at', { ascending: true }).order('id', { ascending: true }).limit(PAGE)
      if (cursor) q = q.or(`updated_at.gt.${cursor.t},and(updated_at.eq.${cursor.t},id.gt.${cursor.id})`)
      const { data, error } = await q
      if (error) throw new Error(`${table}: ${error.message}`)
      if (!data.length) break

      await db.transaction('rw', db[table], db.outbox, async () => {
        // A row with unsent local edits is never overwritten: the local edit wins and is pushed next.
        const waiting = new Set((await db.outbox.toArray()).filter((p) => p.table === table).map((p) => p.row_id))
        const rows = data
          .filter((r) => !waiting.has(r.id))
          .map((r) => { NUMBERS[table].forEach((k) => (r[k] = Number(r[k]))); return r })
        await db[table].bulkPut(rows)
      })

      const last = data[data.length - 1]
      cursor = { t: last.updated_at, id: last.id }
      await db.meta.put({ key: 'cursor:' + table, value: cursor })
      if (data.length < PAGE) break
    }
  }
}

// ---- plan: ask the server which plan this agent is on, and remember it ----
async function pullPlan(agentId) {
  const { data, error } = await supabase.from('agents').select('plan, plan_expiry, is_admin').eq('id', agentId).maybeSingle()
  if (error) throw new Error('plan: ' + error.message)
  if (!data) return
  await db.meta.put({ key: 'plan', value: { plan: data.plan, expiry: data.plan_expiry, isAdmin: !!data.is_admin, checkedAt: new Date().toISOString() } })
}

// ---- run one sync (never two at once) ----
let running = false
let again = false
export async function syncNow() {
  if (running) { again = true; return }
  if (!navigator.onLine) return
  if (!(await db.meta.get('agent'))) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return set({ error: 'Please log out and log in again to sync.' })

  running = true
  set({ syncing: true, error: null })
  try {
    await push(session.user.id)
    await pull(session.user.id)
    await pullPlan(session.user.id)
    const t = new Date().toISOString()
    await db.meta.put({ key: 'lastSync', value: t })
    set({ lastSync: t })
  } catch (e) {
    set({ error: e.message || 'Sync failed' })
  } finally {
    running = false
    set({ syncing: false })
    if (again) { again = false; syncNow() }
  }
}

// ---- when to sync: after edits, when internet returns, and every minute ----
let started = false
export function startAutoSync() {
  if (started) return
  started = true
  let timer
  db.outbox.hook('creating', () => { clearTimeout(timer); timer = setTimeout(syncNow, 2000) })
  window.addEventListener('online', () => { set({ online: true }); syncNow() })
  window.addEventListener('offline', () => set({ online: false }))
  setInterval(syncNow, 60000)
  db.meta.get('lastSync').then((m) => m && set({ lastSync: m.value }))
  syncNow()
}
