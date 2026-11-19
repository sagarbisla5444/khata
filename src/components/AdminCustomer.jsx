import { formatINR as f } from '../logic/money.js'
import { fmtDate } from '../logic/dates.js'

// One customer (read-only) with their loans; `items` = that customer's [{ loan, s }].
export default function AdminCustomer({ c, items }) {
  const pend = items.reduce((a, i) => a + (i.s.closed ? 0 : i.s.pending), 0)
  return (
    <details className="card">
      <summary><b>{c.name}</b> · {c.phone} <span style={{ float: 'right' }}><b>{f(pend)}</b></span></summary>
      <div className="mut" style={{ marginTop: 8 }}>{c.alt_phone ? `Alt ${c.alt_phone} · ` : ''}{c.address || 'No address'}</div>
      {items.length === 0 && <div className="mut">No loans.</div>}
      {items.map(({ loan, s }) => (
        <div className="row" key={loan.id} style={{ marginTop: 6 }}>
          <span>{f(loan.principal)} <span className="pill">{loan.freq}</span> <span className="mut">{fmtDate(loan.start_date)}</span></span>
          <span className={s.closed ? 'ok' : s.overdue ? 'bad' : ''}>{s.closed ? 'Closed' : `${f(s.pending)} left`}{s.overdue ? ` · ${f(s.overdue)} overdue` : ''}</span>
        </div>
      ))}
    </details>
  )
}
