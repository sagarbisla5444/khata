import test from 'node:test'
import assert from 'node:assert/strict'
import { agentRows } from './admin.js'

test('each agent only gets their own customers and totals', () => {
  const loan = (id, agent_id, customer_id) => ({ id, agent_id, customer_id, principal: 10000, file_fee: 500, total: 11000, freq: 'weekly', custom_days: null, installments: 10, start_date: '2026-09-28' })
  const d = {
    agents: [{ id: 'a1', plan: 'pro', plan_expiry: '2026-12-01' }, { id: 'a2', plan: 'regular', plan_expiry: null }],
    customers: [{ id: 'c1', agent_id: 'a1' }, { id: 'c2', agent_id: 'a1' }, { id: 'c3', agent_id: 'a2' }],
    loans: [loan('l1', 'a1', 'c1'), loan('l2', 'a2', 'c3')],
    payments: [{ loan_id: 'l1', amount: 5500 }],
  }
  const [a1, a2] = agentRows(d, '2026-11-18')
  assert.equal(a1.customers.length, 2)
  assert.equal(a1.t.pending, 5500)
  assert.equal(a1.proActive, true)
  assert.equal(a2.customers.length, 1)
  assert.equal(a2.t.pending, 11000)
  assert.equal(a2.proActive, false)
})
