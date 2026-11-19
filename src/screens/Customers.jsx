import { useState } from 'react'
import { formatINR as f } from '../logic/money.js'
import { forCustomer, totals } from '../logic/portfolio.js'

export const FREE_LIMIT = 20

export default function Customers({ data, plan, go }) {
  const [q, setQ] = useState('')
  const list = data.customers.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()))
  const limited = plan !== 'pro' && data.customers.length >= FREE_LIMIT

  function add() {
    if (limited) {
      alert(`Regular plan allows ${FREE_LIMIT} customers. Upgrade to Pro for unlimited.`)
      return go('plan')
    }
    go('newCustomer')
  }

  return (
    <>
      <div className="row">
        <h2>Customers ({data.customers.length}{plan === 'pro' ? '' : `/${FREE_LIMIT}`})</h2>
        <button className="btn sm" onClick={add}>Add customer</button>
      </div>
      <label htmlFor="q">Search by name or phone</label>
      <input id="q" value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ height: 12 }} />
      {list.length === 0 && <div className="card mut">No customers yet. Add your first one.</div>}
      {list.map((c) => {
        const t = totals(forCustomer(data.items, c.id))
        return (
          <div className="card row link" key={c.id} onClick={() => go('customer', c.id)}>
            <div><b>{c.name}</b><div className="mut">{c.phone}</div></div>
            <div style={{ textAlign: 'right' }}><b>{f(t.pending)}</b><div className="mut">profit {f(t.expectedProfit)}</div></div>
          </div>
        )
      })}
    </>
  )
}
