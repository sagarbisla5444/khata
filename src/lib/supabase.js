import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY
if (!url || !key) {
  throw new Error('Missing Supabase settings. Create a .env file (copy .env.example), then restart npm run dev.')
}

// On Android Capacitor, window.fetch is patched by CapacitorHttp when
// enabled in capacitor.config.json. If not patched, we fall back to XHR
// which works in the WebView where fetch may be blocked cross-origin.
function capacitorFetch(input, init = {}) {
  // If CapacitorHttp has patched fetch, it will handle this natively.
  // Otherwise fall back to XHR-based fetch to bypass WebView CORS block.
  const isNative = window.Capacitor?.isNativePlatform?.()
  if (!isNative) return fetch(input, init)

  return new Promise((resolve, reject) => {
    const url = typeof input === 'string' ? input : input.url
    const method = (init.method || 'GET').toUpperCase()
    const headers = { ...(init.headers || {}) }
    const body = init.body

    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))
    xhr.responseType = 'arraybuffer'

    xhr.onload = () => {
      const resHeaders = new Headers()
      xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(line => {
        const [key, ...rest] = line.split(': ')
        if (key) resHeaders.set(key, rest.join(': '))
      })
      resolve(new Response(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: resHeaders,
      }))
    }
    xhr.onerror = () => reject(new TypeError('Network request failed (XHR)'))
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'))
    xhr.timeout = 30000
    xhr.send(body || null)
  })
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'khata-auth',
  },
  global: {
    headers: { 'X-Client-Info': 'khata-android' },
    fetch: capacitorFetch,
  },
})
