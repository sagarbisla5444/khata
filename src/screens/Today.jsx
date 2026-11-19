import { formatINR as f } from '../logic/money.js'
import { totals, overdueList } from '../logic/portfolio.js'
import { today } from '../logic/dates.js'
import ReminderButton from '../components/ReminderButton.jsx'

export default function Today({ data, plan, go }) {
  const t = totals(data.items)
  const od = overdueList(data.items)
  const collectedToday = data.payments.filter((p) => p.paid_on === today()).reduce((a, p) => a + Number(p.amount), 0)

  return (
    <>
      <h2>Today</h2>
      <div className="grid">
        <div className="stat big span2"><small>Pending to collect</small><b>{f(t.pending)}</b></div>
        <div className="stat"><small>Collected today</small><b>{f(collectedToday)}</b></div>
        <div className="stat"><small>Cash given out</small><b>{f(t.given)}</b></div>
        <div className="stat big"><small>Net profit, all customers</small><b>{f(t.expectedProfit)}</b></div>
        <div className="stat"><small>Profit so far</small><b className={t.profitSoFar < 0 ? 'bad' : 'ok'}>{f(t.profitSoFar)}</b></div>
      </div>
      <h3>To collect now ({od.length})</h3>
      {od.length === 0 && <div className="card mut">Nothing overdue.</div>}
      {od.map(({ loan, s }) => {
        const c = data.customers.find((x) => x.id === loan.customer_id)
        return (
          <div className="card" key={loan.id}>
            <div className="row link" onClick={() => go('loan', loan.id)}>
              <div><b>{c.name}</b><div className="mut">{c.phone}</div></div>
              <b className="bad">{f(s.overdue)}</b>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <span className="mut">Installment {f(s.installment)}</span>
              <ReminderButton customer={c} s={s} plan={plan} go={go} />
            </div>
          </div>
        )
      })}
    </>
  )
}
