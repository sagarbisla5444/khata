import test from 'node:test'
import assert from 'node:assert/strict'
import { summarize } from './loan.js'
import { totals, overdueList, forCustomer } from './portfolio.js'

const mk = (id, cid, paid) => {
  const loan = { id, customer_id: cid, principal: 10000, file_fee: 500, total: 11000, freq: 'weekly', custom_days: null, installments: 10, start_date: '2026-09-28' }
  return { loan, s: summarize(loan, [{ amount: paid }], '2026-11-18') }
}

test('net profit adds up every customer', () => {
  const items = [mk('a', 'c1', 5500), mk('b', 'c2', 11000)]
  const t = totals(items)
  assert.equal(t.expectedProfit, 3000)
  assert.equal(t.profitSoFar, -4000 + 1500)
  assert.equal(t.pending, 5500) // closed loan not counted
  assert.equal(overdueList(items).length, 1)
  assert.equal(forCustomer(items, 'c2').length, 1)
})
