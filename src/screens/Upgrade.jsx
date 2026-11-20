import { useCallback, useEffect, useState } from 'react'
import { usePlanState } from '../data/hooks.js'
import { myRequests, submitUpgrade } from '../data/upgrade.js'
import { syncNow } from '../sync/sync.js'
import { useSync } from '../sync/useSync.js'
import { PAY, PRO_PRICE_MONTH } from '../config.js'
import { MONTH_CHOICES, amountFor, cleanUtr, isValidUtr, upiLink } from '../logic/upgrade.js'
import { formatINR as f } from '../logic/money.js'
import { fmtDate } from '../logic/dates.js'

const when = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Upgrade({ go }) {
  const { plan, reason, raw } = usePlanState()
  const s = useSync()
  const [reqs, setReqs] = useState(null)
  const [err, setErr] = useState('')
  const [months, setMonths] = useState(1)
  const [utr, setUtr] = useState('')
  const [busy, setBusy] = useState(false)
  const [qrOk, setQrOk] = useState(true)

  const load = useCallback(async () => {
    try {
      const r = await myRequests()
      setReqs(r); setErr('')
      if (r[0]?.status === 'approved') syncNow() // pick up the new plan right away
    } catch (e) { setErr(e.message) }
  }, [])
  useEffect(() => { load() }, [load])

  const last = reqs?.[0]
  const amount = amountFor(months)
  const offline = s.online === false

  async function submit() {
    if (!confirm(`Send ${f(amount)} payment with reference ${utr} for approval?`)) return
    setBusy(true)
    try { await submitUpgrade(months, utr); setUtr(''); await load() }
    catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }
  async function check() { setBusy(true); await load(); await syncNow(); setBusy(false) }

  const head = (
    <div className="row">
      <h2>Upgrade to Pro</h2>
      <button className="btn ghost sm" onClick={() => go('plan')}>Back</button>
    </div>
  )

  if (!reqs && !err) return <>{head}<div className="card mut">Loading…</div></>

  if (last?.status === 'pending') {
    return (
      <>
        {head}
        <div className="card">
          <b>Waiting for admin approval</b>
          <div className="mut">{f(last.amount)} for {last.months} month{last.months > 1 ? 's' : ''} · reference {last.utr} · sent {when(last.created_at)}</div>
          <p className="mut">The admin checks that your payment arrived, then Pro starts. Tap Check status after a while.</p>
          {err && <div className="bad">{err}</div>}
          <div className="actions"><button className="btn" onClick={check} disabled={busy || offline}>{busy ? 'Checking…' : 'Check status'}</button></div>
        </div>
      </>
    )
  }

  const link = upiLink(PAY, amount)
  return (
    <>
      {head}
      {plan === 'pro' && <div className="card ok">Pro is active until {fmtDate(raw.expiry)}. Paying now adds time on top.</div>}
      {reason === 'expired' && <div className="card bad">Your Pro plan expired on {fmtDate(raw.expiry)}.</div>}
      {last?.status === 'rejected' && <div className="card bad"><b>Your last request was rejected.</b> {last.note}</div>}
      {last?.status === 'approved' && plan !== 'pro' && <div className="card mut">Approved on {when(last.decided_at)}. Updating your plan…</div>}
      {offline && <div className="card bad">You are offline. Connect to the internet to pay and send the request.</div>}
      {err && <div className="card bad">{err}</div>}

      <div className="card">
        <b>1. Choose how long</b>
        <div className="actions" style={{ flexWrap: 'wrap' }}>
          {MONTH_CHOICES.map((m) => (
            <button key={m} className={'btn' + (m === months ? '' : ' ghost')} onClick={() => setMonths(m)}>{m} mo</button>
          ))}
        </div>
        <p className="mut">{f(PRO_PRICE_MONTH)} per month. You pay <b>{f(amount)}</b>.</p>
      </div>

      <div className="card">
        <b>2. Pay {f(amount)} by UPI</b>
        {qrOk
          ? <img src={PAY.qrImage} alt="UPI payment QR" onError={() => setQrOk(false)} style={{ display: 'block', width: '100%', maxWidth: 280, margin: '12px auto' }} />
          : <div className="bad" style={{ margin: '10px 0' }}>The payment QR is not set up yet. Please contact the app owner.</div>}
        {PAY.upiId && <div className="mut">UPI ID: <b>{PAY.upiId}</b></div>}
        {link && <div className="actions"><a className="btn" href={link} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Pay with UPI app</a></div>}
        <p className="mut">On this phone? A phone cannot scan its own screen. Take a screenshot, open your UPI app and choose scan from gallery, then type the amount above.</p>
      </div>

      <div className="card">
        <b>3. Enter the payment reference</b>
        <label htmlFor="utr">12-digit UPI reference (UTR / transaction ID)</label>
        <input id="utr" inputMode="numeric" autoComplete="off" value={utr} onChange={(e) => setUtr(cleanUtr(e.target.value))} placeholder="e.g. 412345678901" />
        <div className="mut">{utr.length}/12 digits. You can find it in your payment app under the transaction details.</div>
        <div className="actions">
          <button className="btn" disabled={busy || offline || !qrOk || !isValidUtr(utr)} onClick={submit}>{busy ? 'Sending…' : 'Send for approval'}</button>
        </div>
      </div>
    </>
  )
}
