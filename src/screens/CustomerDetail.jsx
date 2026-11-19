import { formatINR as f } from '../logic/money.js'
import { fmtDate } from '../logic/dates.js'
import { forCustomer, totals } from '../logic/portfolio.js'
import { softDelete } from '../data/repo.js'

export default function CustomerDetail({ data, go, id }) {
  const c = data.customers.find((x) => x.id === id)
  if (!c) return <div className="card mut">Customer not found. <button className="btn sm" onClick={() => go('customers')}>Back</button></div>
  const items = forCustomer(data.items, id)
  const t = totals(items)

  async function remove() {
    if (!confirm(`Delete ${c.name} and hide all their loans?`)) return
    await softDelete('customers', id)
    go('customers')
  }

  return (
    <>
      <div className="row">
        <h2>{c.name}</h2>
        <button className="btn sm" onClick={() => go('newLoan', id)}>New loan</button>
      </div>
      <div className="card">
        <div>{c.phone}{c.alt_phone ? ` · ${c.alt_phone}` : ''}</div>
        <div className="mut">{c.address || 'No address'}</div>
      </div>
      <div className="grid">
        <div className="stat big"><small>Expected profit</small><b>{f(t.expectedProfit)}</b></div>
        <div className="stat"><small>Profit so far</small><b className={t.profitSoFar < 0 ? 'bad' : 'ok'}>{f(t.profitSoFar)}</b></div>
      </div>
      <h3>Loans</h3>
      {items.length === 0 && <div className="card mut">No loans yet.</div>}
      {items.map(({ loan, s }) => (
        <div className="card row link" key={loan.id} onClick={() => go('loan', loan.id)}>
          <div>
            <b>{f(loan.principal)}</b> <span className="pill">{loan.freq === 'custom' ? `every ${loan.custom_days} days` : loan.freq}</span>
            <div className="mut">Loan date {fmtDate(loan.start_date)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <b className={s.closed ? 'ok' : s.overdue ? 'bad' : ''}>{s.closed ? 'Closed' : f(s.pending)}</b>
            <div className="mut">pending</div>
          </div>
        </div>
      ))}
      <div className="actions"><button className="btn ghost sm" onClick={remove}>Delete customer</button></div>
    </>
  )
}
