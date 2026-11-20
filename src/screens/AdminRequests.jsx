import { useCallback, useEffect, useState } from 'react'
import { allRequests, approveUpgrade, rejectUpgrade } from '../data/upgrade.js'
import { formatINR as f } from '../logic/money.js'

const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const who = (r) => r.agent.name || r.agent.email || 'Unknown agent'

export default function AdminRequests({ go }) {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    try { setRows(await allRequests()); setErr('') } catch (e) { setErr(e.message) }
  }, [])
  useEffect(() => { load() }, [load])

  async function act(id, fn) {
    setBusy(id)
    try { await fn(); await load() } catch (e) { alert(e.message); await load() } finally { setBusy('') }
  }
  const approve = (r) => {
    if (!confirm(`Approve ${who(r)}?\n\nFirst check your UPI or bank app: ${f(r.amount)} with reference ${r.utr} must have arrived.`)) return
    act(r.id, () => approveUpgrade(r.id))
  }
  const reject = (r) => {
    const note = prompt('Reason for rejecting (the agent will see this):', 'Payment not found.')
    if (note === null) return
    act(r.id, () => rejectUpgrade(r.id, note))
  }

  const pending = (rows || []).filter((r) => r.status === 'pending')
  const done = (rows || []).filter((r) => r.status !== 'pending').slice(0, 20)

  return (
    <>
      <div className="row">
        <h2>Upgrade requests</h2>
        <span>
          <button className="btn ghost sm" onClick={load}>Refresh</button>{' '}
          <button className="btn ghost sm" onClick={() => go('admin')}>Back</button>
        </span>
      </div>
      {err && <div className="card bad">{err}</div>}
      {!rows && !err && <div className="card mut">Loading…</div>}

      {rows && <h3>Waiting ({pending.length})</h3>}
      {rows && pending.length === 0 && <div className="card mut">No requests waiting.</div>}
      {pending.map((r) => (
        <div className="card" key={r.id}>
          <div className="row"><b>{who(r)}</b><b>{f(r.amount)}</b></div>
          <div className="mut">{r.agent.email} · {r.months} month{r.months > 1 ? 's' : ''} · sent {when(r.created_at)}</div>
          <div>Reference: <b>{r.utr}</b></div>
          <div className="actions">
            <button className="btn" disabled={busy === r.id} onClick={() => approve(r)}>Approve</button>
            <button className="btn ghost" disabled={busy === r.id} onClick={() => reject(r)}>Reject</button>
          </div>
        </div>
      ))}

      {done.length > 0 && <h3>Recent</h3>}
      {done.map((r) => (
        <div className="card" key={r.id}>
          <div className="row"><b>{who(r)}</b><span className={r.status === 'approved' ? 'ok' : 'bad'}>{r.status}</span></div>
          <div className="mut">{f(r.amount)} · {r.months} mo · {r.utr} · {r.decided_at ? when(r.decided_at) : ''}{r.note ? ` · ${r.note}` : ''}</div>
        </div>
      ))}
    </>
  )
}
