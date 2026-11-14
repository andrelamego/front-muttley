import test from 'node:test'
import assert from 'node:assert/strict'
import { deDataIso, paraDataIso } from '../src/shared/lib/datas.ts'

test('lê AAAA-MM-DD como data de calendário local, sem trocar o dia', () => {
  const d = deDataIso('2026-11-13')
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 10)
  assert.equal(d.getDate(), 13)
})

test('volta para AAAA-MM-DD com zeros à esquerda', () => {
  assert.equal(paraDataIso(new Date(2026, 2, 5, 23, 59)), '2026-03-05')
})

test('texto vazio ou inválido não vira data', () => {
  assert.equal(deDataIso(''), undefined)
  assert.equal(deDataIso('2026-02-30'), undefined)
  assert.equal(deDataIso('13/11/2026'), undefined)
})
