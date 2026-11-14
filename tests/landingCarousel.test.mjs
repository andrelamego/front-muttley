import test from 'node:test'
import assert from 'node:assert/strict'
import {
  sortEventosByDate,
  formatDateSafe,
} from '../src/modules/eventos/domain/carouselLogic.ts'

test('sortEventosByDate ordena eventos em ordem cronologica ascendente', () => {
  const input = [
    { id: 1, tema: 'Evento C', data: '2026-10-15' },
    { id: 2, tema: 'Evento A', data: '2026-09-04' },
    { id: 3, tema: 'Evento B', data: '2026-09-20' },
  ]

  const sorted = sortEventosByDate(input)

  assert.equal(sorted[0].id, 2)
  assert.equal(sorted[1].id, 3)
  assert.equal(sorted[2].id, 1)
  // Garante que o array de entrada nao foi mutado
  assert.equal(input[0].id, 1)
})

test('formatDateSafe formata datas de calendario sem alteracao de dia por fuso horario', () => {
  assert.equal(formatDateSafe(''), '-')
  assert.equal(formatDateSafe('2026-09-04').includes('04'), true)
  assert.equal(
    formatDateSafe('2026-09-04').toLowerCase().includes('setembro'),
    true
  )
  assert.equal(formatDateSafe('2026-09-04').includes('2026'), true)
})
