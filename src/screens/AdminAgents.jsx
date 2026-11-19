import { useState } from 'react'
import { useAdmin } from '../data/admin.js'
import { agentRows } from '../logic/admin.js'
import { formatINR as f } from '../logic/money.js'
import { fmtDate } from '../logic/dates.js'
import AdminCustomer from '../components/AdminCustomer.jsx'

const has = (text, q) => text.toLowerCase().includes(q)

export default function AdminAgents({ go }) {
  const { data, loading, error, reload } = useAdmin()
  const [q, setQ] = useState('')
  if (!data) {
    return error
      ? <div className="card bad">{error}<div className="actions"><button className="btn sm" onClick={reload}>Try again</button></div></div>
      : <div className="card mut">Loading agents…</div>
  }
  const rows = agentRows(data)
  const pending = rows.reduce((a, r) => a + r.t.pending, 0)
  const s = q.trim().toLowerCase()

  // Keep an agent if their name/email matches (show all their customers) or any customer matches.
  const shown = rows
    .map((r) => {
      const agentMatch = !s || has((r.agent.name || '') + (r.agent.email || ''), s)
      const customers = agentMatch ? r.customers : r.customers.filter((c) => has(c.name + c.phone, s))
      return { ...r, shownCustomers: customers, keep: agentMatch || customers.length > 0 }
    })
    .filter((r) => r.keep)

  return (
    <>
      <div className="row">
        <h2>Agents ({rows.length})</h2>
        <button className="btn ghost sm" onClick={reload} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="card bad">{error}</div>}
      <div className="grid">
        <div className="stat big"><small>Pro agents</small><b>{rows.filter((r) => r.proActive).length}</b></div>
        <div className="stat"><small>Total customers</small><b>{data.customers.length}</b></div>
        <div className="stat span2"><small>Pending across all agents</small><b>{f(pending)}</b></div>
      </div>
      <label htmlFor="aq">Search agent, customer or phone</label>
      <input id="aq" value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ height: 14 }} />

      {shown.length === 0 && <div className="card mut">Nothing found.</div>}
      {shown.map(({ agent, customers, shownCustomers, items, t, proActive }) => (
        <section className="agent" key={agent.id}>
          <div className="row agenthead">
            <div>
              <b>{agent.name || 'No name'}</b> <span className="tag">{proActive ? 'PRO' : 'REGULAR'}</span>
              <div className="mut">
                {agent.email || 'no email'} · {customers.length} customers · pending {f(t.pending)}
                {proActive ? ` · Pro till ${fmtDate(agent.plan_expiry)}` : ''}
              </div>
            </div>
            <button className="btn ghost sm" onClick={() => go('adminAgent', agent.id)}>Manage</button>
          </div>
          <div className="agentbody">
            {shownCustomers.length === 0 && <div className="mut">No customers yet.</div>}
            {shownCustomers.map((c) => (
              <AdminCustomer key={c.id} c={c} items={items.filter((i) => i.loan.customer_id === c.id)} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
