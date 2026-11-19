import test from 'node:test'
import assert from 'node:assert/strict'
import { addDays, addMonths } from './dates.js'
import { buildSchedule, summarize } from './loan.js'

const loan = {
  principal: 10000, file_fee: 500, total: 11000,
  freq: 'weekly', custom_days: null, installments: 10, start_date: '2026-09-28',
}

test('first EMI is one period after the loan date', () => {
  assert.equal(buildSchedule(loan)[0].date, '2026-10-05')
  assert.equal(buildSchedule({ ...loan, freq: 'daily' })[0].date, '2026-09-29')
  assert.equal(buildSchedule({ ...loan, freq: 'monthly' })[0].date, '2026-10-28')
  assert.equal(buildSchedule({ ...loan, freq: 'custom', custom_days: 15 })[0].date, '2026-10-13')
})

test('date helpers', () => {
  assert.equal(addDays('2026-11-18', 7), '2026-11-25')
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
})

test('pending, overdue and profit', () => {
  const s = summarize(loan, [{ amount: 5500 }], '2026-11-18')
  assert.equal(s.pending, 5500)
  assert.equal(s.overdue, 2200)
  assert.equal(s.expectedProfit, 1500)
  assert.equal(s.profitSoFar, -4000)
  assert.equal(s.schedule[5].status, 'overdue')
})

test('installments add up to the total', () => {
  const t = buildSchedule({ ...loan, total: 10001, installments: 3 }).reduce((a, r) => a + r.amount, 0)
  assert.equal(t, 10001)
})
