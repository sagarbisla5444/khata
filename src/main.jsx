import React from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './styles.css'

// In the installed Android app the files are already inside the app, so the web offline cache is only for browsers.
if (!window.Capacitor?.isNativePlatform?.()) registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(<App />)
