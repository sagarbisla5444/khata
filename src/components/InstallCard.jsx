import { useEffect, useState } from 'react'

// "Install app" card for the Plan tab. Hidden once the app is already installed.
export default function InstallCard() {
  const [evt, setEvt] = useState(null)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setEvt(e) }
    const onInstalled = () => setEvt(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (standalone || window.Capacitor?.isNativePlatform?.()) return null

  async function install() {
    evt.prompt()
    await evt.userChoice
    setEvt(null)
  }

  return (
    <div className="card">
      <b>Install Khata on this device</b>
      <p className="mut">Get an app icon and open Khata even with no internet.</p>
      {evt ? (
        <button className="btn" onClick={install}>Install app</button>
      ) : (
        <p className="mut">
          {ios ? 'On iPhone: tap the Share button, then "Add to Home Screen".' : 'In Chrome: open the menu (⋮), then choose "Install app" or "Add to Home screen".'}
        </p>
      )}
    </div>
  )
}
