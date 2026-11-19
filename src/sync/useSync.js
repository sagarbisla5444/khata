import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'
import { subscribe } from './sync.js'

export function useSync() {
  const [s, setS] = useState({})
  useEffect(() => subscribe(setS), [])
  const pending = useLiveQuery(() => db.outbox.count(), [], 0)
  return { ...s, pending }
}
