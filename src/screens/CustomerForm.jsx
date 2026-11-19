import { useState } from 'react'
import { addCustomer } from '../data/repo.js'
import { isValidPhone } from '../logic/money.js'

const digits = (s) => s.replace(/\D/g, '').slice(0, 10)

export default function CustomerForm({ go }) {
  const [v, setV] = useState({ name: '', phone: '', alt_phone: '', address: '' })
  const set = (k, fn = (x) => x) => (e) => setV({ ...v, [k]: fn(e.target.value) })

  async function save() {
    if (!v.name.trim()) return alert('Name is required.')
    if (!isValidPhone(v.phone)) return alert('Phone must be exactly 10 digits.')
    if (v.alt_phone && !isValidPhone(v.alt_phone)) return alert('Alternate phone must be 10 digits, or leave it empty.')
    const c = await addCustomer({ ...v, name: v.name.trim() })
    go('customer', c.id)
  }

  return (
    <>
      <h2>New customer</h2>
      <div className="card">
        <label htmlFor="n">Name</label><input id="n" value={v.name} onChange={set('name')} />
        <label htmlFor="p">Phone (10 digits)</label><input id="p" inputMode="numeric" value={v.phone} onChange={set('phone', digits)} />
        <label htmlFor="a">Alternate phone (optional)</label><input id="a" inputMode="numeric" value={v.alt_phone} onChange={set('alt_phone', digits)} />
        <label htmlFor="d">Address</label><textarea id="d" rows="2" value={v.address} onChange={set('address')} />
        <div className="actions">
          <button className="btn" onClick={save}>Save customer</button>
          <button className="btn ghost" onClick={() => go('customers')}>Cancel</button>
        </div>
      </div>
    </>
  )
}
