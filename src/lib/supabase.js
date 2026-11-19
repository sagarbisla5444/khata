import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY
if (!url || !key) {
  throw new Error('Missing Supabase settings. Create a .env file (copy .env.example), then restart npm run dev.')
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
    // CapacitorHttp (enabled in capacitor.config.json) patches window.fetch
    // to route requests through native HTTP, bypassing WebView CORS restrictions.
    // No custom fetch override needed.
  },
})