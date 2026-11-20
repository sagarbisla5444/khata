import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './lib/db.js'
import { usePortfolio, usePlanState } from './data/hooks.js'
import { startAutoSync } from './sync/sync.js'
import SyncChip from './components/SyncChip.jsx'
import Login from './screens/Login.jsx'
import Today from './screens/Today.jsx'
import Customers from './screens/Customers.jsx'
import CustomerForm from './screens/CustomerForm.jsx'
import CustomerDetail from './screens/CustomerDetail.jsx'
import LoanForm from './screens/LoanForm.jsx'
import LoanDetail from './screens/LoanDetail.jsx'
import Plan from './screens/Plan.jsx'
import AdminAgents from './screens/AdminAgents.jsx'
import AdminAgent from './screens/AdminAgent.jsx'
import Upgrade from './screens/Upgrade.jsx'
import AdminRequests from './screens/AdminRequests.jsx'
import { usePendingCount } from './data/upgrade.js'

const SCREENS = {
  today: Today, customers: Customers, newCustomer: CustomerForm, customer: CustomerDetail,
  newLoan: LoanForm, editLoan: LoanForm, loan: LoanDetail, plan: Plan, upgrade: Upgrade,
  admin: AdminAgents, adminAgent: AdminAgent, adminRequests: AdminRequests,
}
const TABS = [['today', 'Today'], ['customers', 'Customers'], ['plan', 'Plan']]

export default function App() {
  const [route, setRoute] = useState({ name: 'today' })
  const agent = useLiveQuery(async () => (await db.meta.get('agent'))?.value ?? null, [], undefined)
  const data = usePortfolio()
  const ps = usePlanState()
  const plan = ps.plan
  const isAdmin = !!ps.raw?.isAdmin
  const pending = usePendingCount(isAdmin, route.name) // upgrade requests waiting for the admin
  useEffect(() => { if (agent) startAutoSync() }, [agent])
  // The phone's Back button walks back through screens instead of closing the app.
  useEffect(() => {
    const onPop = (e) => setRoute(e.state || { name: 'today' })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (agent === undefined) return null // still reading the device
  if (agent === null) return <Login />

  const go = (name, id) => { history.pushState({ name, id }, ''); setRoute({ name, id }); window.scrollTo(0, 0) }
  const Screen = SCREENS[route.name]
  const tabs = isAdmin ? [...TABS, ['admin', 'Admin']] : TABS
  const tab = ['today', 'plan', 'admin'].includes(route.name) ? route.name
    : ['adminAgent', 'adminRequests'].includes(route.name) ? 'admin'
    : route.name === 'upgrade' ? 'plan' : 'customers'

  return (
    <>
      <header className="top">
        <b>Khata</b>
        <span className="right"><SyncChip /> <span className="tag">{plan === 'pro' ? 'PRO' : 'REGULAR'}</span></span>
      </header>
      <main>
        <Screen data={data} plan={plan} go={go} id={route.id} mode={route.name} agent={agent} pending={pending} />
      </main>
      <nav>
        {tabs.map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)}>{k === 'admin' && pending ? `${label} (${pending})` : label}</button>
        ))}
      </nav>
    </>
  )
}
