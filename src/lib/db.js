import Dexie from 'dexie'

// Local database on the phone/browser. Field names match the Supabase columns
// so syncing later is a straight copy.
export const db = new Dexie('khata')

db.version(1).stores({
  customers: 'id, phone, updated_at',
  loans: 'id, customer_id, updated_at',
  payments: 'id, loan_id, updated_at',
  outbox: '++seq', // changes waiting to be sent to Supabase
  meta: 'key',     // last sync time, cached plan, etc.
})
