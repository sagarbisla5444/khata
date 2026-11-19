import { useState } from 'react'
import { addLoan, updateLoan } from '../data/repo.js'
import { buildSchedule } from '../logic/loan.js'
import { formatINR as f } from '../logic/money.js'
import { today, fmtDate } from '../logic/dates.js'

// mode 'newLoan': id = customer id.  mode 'editLoan': id = loan id.
export default function LoanForm({ data, go, id, mode }) {
  const editing = mode === 'editLoan'
  const loan = editing ? data.loans.find((l) => l.id === id) : null
  const customerId = editing ? loan?.customer_id : id

  const [v, setV] = useState(() =>
    loan
      ? { principal: loan.principal, file_fee: loan.file_fee, total: loan.total, freq: loan.freq,
          custom_days: loan.custom_days ?? 15, installments: loan.installments, start_date: loan.start_date }
      : { principal: '', file_fee: 0, total: '', freq: 'daily', custom_days: 15, installments: 10, start_date: today() }
  )
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  const p = +v.principal || 0
  const fee = +v.file_fee || 0
  const total = +v.total || p
  const n = +v.installments || 0
  const row = {
    principal: p, file_fee: fee, total, freq: v.freq,
    custom_days: v.freq === 'custom' ? +v.custom_days || 1 : null,
    installments: n, start_date: v.start_date || today(),
  }
  const first = p > 0 && n > 0 ? buildSchedule(row)[0] : null

  async function save() {
    if (!p || n < 1) return alert('Enter the loan amount and number of installments.')
    const rec = editing ? await updateLoan(id, row) : await addLoan({ customer_id: customerId, ...row })
    go('loan', rec.id)
  }

  return (
    <>
      <h2>{editing ? 'Edit loan' : 'New loan'}</h2>
      <div className="card">
        <div className="two">
          <div><label htmlFor="p">Loan amount</label><input id="p" type="number" value={v.principal} onChange={set('principal')} /></div>
          <div><label htmlFor="f">File charge (deducted)</label><input id="f" type="number" value={v.file_fee} onChange={set('file_fee')} /></div>
        </div>
        <label htmlFor="t">Total to collect (add interest if any)</label>
        <input id="t" type="number" value={v.total} onChange={set('total')} placeholder="same as loan amount if no interest" />
        <div className="two">
          <div>
            <label htmlFor="q">Collection</label>
            <select id="q" value={v.freq} onChange={set('freq')}>
              <option value="daily">Daily</option><option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option><option value="custom">Custom days</option>
            </select>
          </div>
          <div><label htmlFor="n">Installments</label><input id="n" type="number" value={v.installments} onChange={set('installments')} /></div>
        </div>
        {v.freq === 'custom' && (<><label htmlFor="cd">Days between installments</label><input id="cd" type="number" value={v.custom_days} onChange={set('custom_days')} /></>)}
        <label htmlFor="s">Loan date</label>
        <input id="s" type="date" value={v.start_date} onChange={set('start_date')} />
        {first && (
          <div className="card preview">
            Customer receives <b>{f(p - fee)}</b><br />
            Collect <b>{f(total)}</b> in {n} installments of <b>{f(first.amount)}</b><br />
            First installment due <b>{fmtDate(first.date)}</b><br />
            Expected profit <b>{f(total - (p - fee))}</b>
          </div>
        )}
        <div className="actions">
          <button className="btn" onClick={save}>{editing ? 'Save changes' : 'Save loan'}</button>
          <button className="btn ghost" onClick={() => (editing ? go('loan', id) : go('customer', customerId))}>Cancel</button>
        </div>
      </div>
    </>
  )
}
