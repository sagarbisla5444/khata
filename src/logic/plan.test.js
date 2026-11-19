import test from 'node:test'
import assert from 'node:assert/strict'
import { planState } from './plan.js'

const now = new Date('2026-11-19T10:00:00')

test('plan rules', () => {
  const ok = { plan: 'pro', expiry: '2026-12-01', checkedAt: '2026-11-18T10:00:00' }
  assert.equal(planState(ok, now).plan, 'pro')
  assert.deepEqual(planState({ ...ok, expiry: '2026-11-01' }, now), { plan: 'regular', reason: 'expired' })
  assert.deepEqual(planState({ ...ok, checkedAt: '2026-11-01T10:00:00' }, now), { plan: 'regular', reason: 'unverified' })
  assert.equal(planState({ plan: 'regular', expiry: null, checkedAt: '2026-11-18T10:00:00' }, now).plan, 'regular')
  assert.equal(planState(undefined, now).plan, 'regular')
  assert.equal(planState('pro', now).plan, 'regular') // old test-toggle value is ignored
})
