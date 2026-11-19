import { db } from '../lib/db.js'

// Every write goes to the local database AND adds a marker to the outbox,
// in one transaction. The sync step (later) sends outbox rows to Supabase.
const now = () => new Date().toISOString()

async function save(table, row) {
  const rec = { ...row, updated_at: now(), deleted_at: row.deleted_at ?? null }
  await db.transaction('rw', db[table], db.outbox, async () => {
    await db[table].put(rec)
    await db.outbox.add({ table, row_id: rec.id })
  })
  return rec
}

const create = (table, data) =>
  save(table, { ...data, id: crypto.randomUUID(), created_at: now() })

export const addCustomer = (c) =>
  create('customers', { name: c.name, phone: c.phone, alt_phone: c.alt_phone || null, address: c.address || null })

export const addLoan = (l) => create('loans', l)

export async function updateLoan(id, changes) {
  const old = await db.loans.get(id)
  return save('loans', { ...old, ...changes })
}

// Payments are only ever added (or soft-deleted), never edited, to protect the money history.
export const addPayment = (p) => create('payments', p)

export async function softDelete(table, id) {
  const old = await db[table].get(id)
  return save(table, { ...old, deleted_at: now() })
}

export const liveCustomers = () =>
  db.customers.filter((c) => !c.deleted_at).toArray()
