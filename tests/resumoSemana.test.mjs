import test from 'node:test'
import assert from 'node:assert/strict'
import { formatResumoSemana } from '../src/modules/painel/domain/resumoSemana.ts'

test('semana sem eventos', () => {
  assert.equal(formatResumoSemana(0), 'Nenhum evento acontece esta semana.')
})

test('um evento na semana usa singular', () => {
  assert.equal(formatResumoSemana(1), '1 evento acontece esta semana.')
})

test('vários eventos usam plural', () => {
  assert.equal(formatResumoSemana(4), '4 eventos acontecem esta semana.')
})
