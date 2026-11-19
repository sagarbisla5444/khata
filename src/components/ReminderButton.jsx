import { whatsappUrl } from '../logic/reminder.js'

export default function ReminderButton({ customer, s, plan, go, label = 'Send reminder' }) {
  function click() {
    if (plan !== 'pro') {
      alert('Customer reminders are a Pro feature.')
      return go('plan')
    }
    window.open(whatsappUrl(customer, s), '_blank')
  }
  return <button className="btn ghost sm" onClick={click}>{plan === 'pro' ? label : '🔒 ' + label}</button>
}
