import { useState } from 'react'
import { signIn, signUp } from '../lib/auth.js'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [v, setV] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  async function run(fn) {
    setBusy(true)
    setErr('')
    try { await fn() } catch (e) {
      const msg = e.message || JSON.stringify(e)
      setErr(msg)
      console.error('LOGIN_ERR', msg, e)
    } finally { setBusy(false) }
  }
  async function testConn() {
    setErr('')
    setBusy(true)
    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
        headers: { apikey: import.meta.env.VITE_SUPABASE_KEY }
      })
      setErr(`✅ Reached Supabase! Status: ${res.status}`)
    } catch (e) {
      setErr(`❌ Cannot reach Supabase: ${e.message}`)
    } finally { setBusy(false) }
  }

  const login = () => run(() => signIn(v.email.trim(), v.password))
  const create = () => run(async () => {
    if (!v.name.trim()) throw new Error('Enter your name.')
    if ((await signUp(v.email.trim(), v.password, v.name.trim())) === 'confirm') alert('Account created. Confirm your email, then log in.')
  })

  return (
    <main style={{ maxWidth: 380, paddingTop: 48 }}>
      <h2>Khata</h2>
      <p className="mut">Loan ledger for agents. Works offline and backs up when online.</p>
      <div className="card">
        <label htmlFor="n">Name (new accounts only)</label><input id="n" value={v.name} onChange={set('name')} />
        <label htmlFor="e">Email</label><input id="e" type="email" value={v.email} onChange={set('email')} />
        <label htmlFor="p">Password (6+ characters)</label><input id="p" type="password" value={v.password} onChange={set('password')} />
        {err && <p style={{ color: 'red', fontSize: 13, wordBreak: 'break-word', marginTop: 8 }}>❌ {err}</p>}
        <div className="actions">
          <button className="btn" disabled={busy} onClick={login}>Log in</button>
          <button className="btn ghost" disabled={busy} onClick={create}>Create account</button>
          <button className="btn ghost" disabled={busy} onClick={testConn} style={{marginTop:8,fontSize:12}}>Test connection</button>
        </div>
      </div>
    </main>
  )
}
