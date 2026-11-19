import { useSync } from '../sync/useSync.js'
import { syncNow } from '../sync/sync.js'

export default function SyncChip() {
  const s = useSync()
  const text = s.online === false ? 'Offline' : s.syncing ? 'Syncing…' : s.error ? 'Sync error' : s.pending ? `${s.pending} waiting` : 'Synced'
  return <button className="chip" onClick={syncNow} title={s.error || 'Tap to sync now'}>{text}</button>
}
