import { usePlanState } from '../data/hooks.js'
import { signOut } from '../lib/auth.js'
import { syncNow } from '../sync/sync.js'
import { useSync } from '../sync/useSync.js'
import { fmtDate } from '../logic/dates.js'
import InstallCard from '../components/InstallCard.jsx'
import { PRO_PRICE_MONTH } from '../config.js'

export default function Plan({ agent, go }) {
  const { plan, reason, raw } = usePlanState()
  const pro = plan === 'pro'
  const s = useSync()

  async function logout() {
    const warn = s.pending ? `${s.pending} changes are not backed up yet and will be lost. Log out anyway?` : 'Log out? Data stays safe in your cloud backup.'
    if (confirm(warn)) await signOut()
  }

  return (
    <>
      <h2>Your plan</h2>
      {pro && <div className="card ok"><b>Pro is active until {fmtDate(raw.expiry)}.</b></div>}
      {reason === 'expired' && <div className="card bad"><b>Your Pro plan expired on {fmtDate(raw.expiry)}.</b> You are on Regular. Renew below.</div>}
      {reason === 'unverified' && <div className="card bad"><b>Pro is paused.</b> Connect to the internet so the app can verify your plan.</div>}
      <div className={'card plan' + (pro ? '' : ' cur')}>
        <div className="row"><b>Regular</b><b>₹299/mo</b></div>
        <ul><li>Up to 20 customers</li><li>Loans, payments, pending tracking</li><li>Daily collection list</li></ul>
      </div>
      <div className={'card plan' + (pro ? ' cur' : '')}>
        <div className="row"><b>Pro</b><b>₹{PRO_PRICE_MONTH}/mo</b></div>
        <ul><li>Unlimited customers</li><li>WhatsApp reminders to customers</li><li>Everything in Regular</li></ul>
        <p className="mut">Coming next: receipts, reports, Excel export, staff logins, penalty rules.</p>
        <div className="actions">
          <button className="btn" style={{ width: '100%' }} onClick={() => go('upgrade')}>{pro ? 'Extend Pro' : `Select Pro · ₹${PRO_PRICE_MONTH}/mo`}</button>
        </div>
        {!pro && <p className="mut">You pay by UPI, send the payment reference, and Pro starts once the admin approves it.</p>}
      </div>
      <InstallCard />
      <h3>Account and backup</h3>
      <div className="card">
        <div><b>{agent.email}</b></div>
        <div className="mut">
          {s.online === false ? 'Offline. ' : ''}
          {s.lastSync ? `Last backup ${new Date(s.lastSync).toLocaleString('en-IN')}` : 'Not backed up yet'} · {s.pending || 0} changes waiting
        </div>
        {s.error && <div className="bad">{s.error}</div>}
        <div className="actions">
          <button className="btn" onClick={syncNow} disabled={s.syncing}>{s.syncing ? 'Syncing…' : 'Sync now'}</button>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </div>
    </>
  )
}
