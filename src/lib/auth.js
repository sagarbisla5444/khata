import { supabase } from './supabase.js'
import { db } from './db.js'

// Wipe everything stored on this device (used when a different agent logs in or on log out).
export async function wipeLocal() {
  await db.transaction('rw', [db.customers, db.loans, db.payments, db.outbox, db.meta], async () => {
    await Promise.all([db.customers.clear(), db.loans.clear(), db.payments.clear(), db.outbox.clear(), db.meta.clear()])
  })
}

// Remember who is logged in on the device so the app still opens when offline.
async function adopt(user) {
  const prev = (await db.meta.get('agent'))?.value
  if (prev && prev.id !== user.id) await wipeLocal() // never mix two agents' data
  await db.meta.put({ key: 'agent', value: { id: user.id, email: user.email } })
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  await adopt(data.user)
}

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
  if (error) throw error
  if (!data.session) return 'confirm'
  await adopt(data.user)
  return 'ok'
}

export async function signOut() {
  await supabase.auth.signOut()
  await wipeLocal()
}
