import test from 'node:test'
import assert from 'node:assert/strict'
import { formatProximoEvento } from '../src/modules/painel/domain/proximoEvento.ts'

const hoje = new Date(2026, 10, 13, 15, 30)

test('evento no mesmo dia', () => {
  assert.equal(formatProximoEvento('2026-11-13', hoje), 'Seu próximo evento é hoje')
})

test('evento no dia seguinte', () => {
  assert.equal(formatProximoEvento('2026-11-14', hoje), 'Seu próximo evento é amanhã')
})

test('evento em outra data futura', () => {
  assert.equal(formatProximoEvento('2026-12-02', hoje), 'Seu próximo evento é em 2 de dez')
})

test('evento já passado vira o último evento', () => {
  assert.equal(formatProximoEvento('2026-03-05', hoje), 'Seu último evento foi em 5 de mar')
})
