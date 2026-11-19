import { useState } from 'react'
import { useAdmin, setAgentPlan } from '../data/admin.js'
import { agentRows } from '../logic/admin.js'
import { formatINR as f } from '../logic/money.js'
import { today, addDays, fmtDate } from '../logic/dates.js'
import AdminCustomer from '../components/AdminCustomer.jsx'

export default function AdminAgent({ go, id }) {
  const { data, reload } = useAdmin()
  const [edit, setEdit] = useState(null)
  if (!data) return <div className="card mut">Loading…</div>
  const row = agentRows(data).find((r) => r.agent.id === id)
  if (!row) return <div className="card mut">Agent not found. <button className="btn sm" onClick={() => go('admin')}>Back</button></div>

  const { agent, customers, items, t, proActive } = row
  const v = edit || { plan: agent.plan || 'regular', expiry: agent.plan_expiry || addDays(today(), 30) }
  const set = (k) => (e) => setEdit({ ...v, [k]: e.target.value })
  const extend = () => {
    const from = v.expiry && v.expiry > today() ? v.expiry : today()
    setEdit({ plan: 'pro', expiry: addDays(from, 30) })
  }

  async function save() {
    try { await setAgentPlan(agent.id, v.plan, v.expiry); setEdit(null); await reload() }
    catch (e) { alert(e.message) }
  }

  return (
    <>
      <div className="row">
        <h2>{agent.name || 'No name'}</h2>
        <button className="btn ghost sm" onClick={() => go('admin')}>Back</button>
      </div>
      <div className="card">
        <div>{agent.email}</div>
        <div className="mut">{customers.length} customers · {items.length} loans</div>
      </div>
      <div className="grid">
        <div className="stat big"><small>Pending</small><b>{f(t.pending)}</b></div>
        <div className="stat"><small>Collected</small><b>{f(t.collected)}</b></div>
        <div className="stat"><small>Expected profit</small><b>{f(t.expectedProfit)}</b></div>
        <div className="stat"><small>Profit so far</small><b className={t.profitSoFar < 0 ? 'bad' : 'ok'}>{f(t.profitSoFar)}</b></div>
      </div>

      <h3>Plan</h3>
      <div className="card">
        <div className="mut">Now: {proActive ? `Pro until ${fmtDate(agent.plan_expiry)}` : 'Regular'}</div>
        <div className="two">
          <div><label htmlFor="pl">Plan</label>
            <select id="pl" value={v.plan} onChange={set('plan')}><option value="regular">Regular</option><option value="pro">Pro</option></select></div>
          <div><label htmlFor="ex">Pro expiry</label>
            <input id="ex" type="date" value={v.expiry} disabled={v.plan !== 'pro'} onChange={set('expiry')} /></div>
        </div>
        <div className="actions">
          <button className="btn" onClick={save}>Save plan</button>
          <button className="btn ghost" onClick={extend}>Pro + 30 days</button>
        </div>
      </div>

      <h3>Customers ({customers.length})</h3>
      {customers.length === 0 && <div className="card mut">No customers yet.</div>}
      {customers.map((c) => (
        <AdminCustomer key={c.id} c={c} items={items.filter((i) => i.loan.customer_id === c.id)} />
      ))}
      <p className="mut">Admin view is read-only for customer data.</p>
    </>
  )
}
