import { useState } from 'react'
import { addPayment, softDelete } from '../data/repo.js'
import { formatINR as f } from '../logic/money.js'
import { today, fmtDate } from '../logic/dates.js'
import ReminderButton from '../components/ReminderButton.jsx'

const LABEL = { paid: 'Paid', overdue: 'Overdue', upcoming: 'Upcoming' }
const CLASS = { paid: 'ok', overdue: 'bad', upcoming: '' }

export default function LoanDetail({ data, plan, go, id }) {
  const item = data.items.find((i) => i.loan.id === id)
  const [amount, setAmount] = useState('')
  if (!item) return <div className="card mut">Loan not found. <button className="btn sm" onClick={() => go('customers')}>Back</button></div>

  const { loan, s } = item
  const c = data.customers.find((x) => x.id === loan.customer_id)
  const pays = data.payments.filter((p) => p.loan_id === id).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

  async function pay() {
    const a = +(amount || s.installment)
    if (!a || a <= 0) return alert('Enter a payment amount.')
    await addPayment({ loan_id: id, amount: a, paid_on: today() })
    setAmount('')
  }
  async function removePayment(p) {
    if (confirm(`Remove the payment of ${f(p.amount)} on ${fmtDate(p.paid_on)}?`)) await softDelete('payments', p.id)
  }
  async function removeLoan() {
    if (!confirm('Delete this loan and its payments from your list?')) return
    await softDelete('loans', id)
    go('customer', c.id)
  }

  return (
    <>
      <div className="row">
        <h2>{c.name}</h2>
        <span><button className="btn sm" onClick={() => go('editLoan', id)}>Edit loan</button>{' '}
          <button className="btn ghost sm" onClick={() => go('customer', c.id)}>Back</button></span>
      </div>
      <div className="grid">
        <div className="stat big"><small>Pending</small><b>{f(s.pending)}</b></div>
        <div className="stat"><small>Overdue</small><b className={s.overdue ? 'bad' : ''}>{f(s.overdue)}</b></div>
        <div className="stat"><small>Expected profit</small><b>{f(s.expectedProfit)}</b></div>
        <div className="stat"><small>Profit so far</small><b className={s.profitSoFar < 0 ? 'bad' : 'ok'}>{f(s.profitSoFar)}</b></div>
      </div>
      <div className="card mut">
        Loan {f(loan.principal)} · file charge {f(loan.file_fee)} · received {f(s.cashGiven)}<br />
        Total {f(loan.total)} · paid {f(s.paid)} · loan date {fmtDate(loan.start_date)}
      </div>
      {s.closed ? (
        <div className="card ok"><b>Loan closed. All dues are paid.</b></div>
      ) : (
        <div className="card">
          <label htmlFor="pa">Record payment</label>
          <div className="row">
            <input id="pa" type="number" placeholder={String(s.installment)} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button className="btn" onClick={pay}>Save</button>
          </div>
          <div className="mut">Leave empty to record one installment ({f(s.installment)}).</div>
        </div>
      )}
      <ReminderButton customer={c} s={s} plan={plan} go={go} label="Send WhatsApp reminder" />
      <h3>Payments</h3>
      {pays.length === 0 && <div className="mut">No payments yet.</div>}
      {pays.map((p) => (
        <div className="row mut" key={p.id}>
          <span>{fmtDate(p.paid_on)}</span>
          <span><b>{f(p.amount)}</b> <button className="link-btn" onClick={() => removePayment(p)}>remove</button></span>
        </div>
      ))}
      <h3>Schedule</h3>
      <div className="card wrap">
        <table>
          <thead><tr><th>#</th><th>Due</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {s.schedule.map((r) => (
              <tr key={r.no}><td>{r.no}</td><td>{fmtDate(r.date)}</td><td>{f(r.amount)}</td><td className={CLASS[r.status]}>{LABEL[r.status]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions"><button className="btn ghost sm" onClick={removeLoan}>Delete loan</button></div>
    </>
  )
}
