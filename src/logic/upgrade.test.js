import test from 'node:test'
import assert from 'node:assert/strict'
import { amountFor, cleanUtr, isValidUtr, upiLink, MONTH_CHOICES } from './upgrade.js'
import { PRO_PRICE_MONTH } from '../config.js'

test('amount is months x monthly price', () => {
  assert.equal(amountFor(1), PRO_PRICE_MONTH)
  assert.equal(amountFor(3), 3 * PRO_PRICE_MONTH)
  assert.deepEqual(MONTH_CHOICES, [1, 3, 6, 12])
})

test('payment reference must be exactly 12 digits', () => {
  assert.equal(isValidUtr('123456789012'), true)
  for (const bad of ['', '12345678901', '1234567890123', '12345678901a', ' 123456789012', null, undefined]) {
    assert.equal(isValidUtr(bad), false, String(bad))
  }
})

test('cleanUtr strips non-digits and caps at 12', () => {
  assert.equal(cleanUtr('1234 5678-9012 99'), '123456789012')
  assert.equal(cleanUtr('abc'), '')
  assert.equal(cleanUtr(null), '')
})

test('UPI link only exists when a UPI id is set, and encodes the amount', () => {
  assert.equal(upiLink({ upiId: '', payee: 'X' }, 699), '')
  const l = upiLink({ upiId: 'me@bank', payee: 'Khata Pro Co' }, 2097)
  assert.match(l, /^upi:\/\/pay\?/)
  assert.match(l, /pa=me%40bank/)
  assert.match(l, /am=2097\.00/)
  assert.match(l, /pn=Khata%20Pro%20Co/)
  assert.match(l, /cu=INR/)
})
