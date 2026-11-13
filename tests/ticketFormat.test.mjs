import test from 'node:test'
import assert from 'node:assert/strict'
import { getTicketDateParts } from '../src/modules/eventos/domain/ticketFormat.ts'

test('canhoto mostra dia, mês abreviado e hora cheia', () => {
  assert.deepEqual(getTicketDateParts('2026-11-13', '19:00:00'), {
    dia: '13',
    mes: 'nov',
    horario: '19h',
  })
})

test('dia e hora sem zero à esquerda e minutos quando houver', () => {
  assert.deepEqual(getTicketDateParts('2026-03-05', '09:30'), {
    dia: '5',
    mes: 'mar',
    horario: '9h30',
  })
})

test('evento sem horário não mostra selo de hora', () => {
  assert.deepEqual(getTicketDateParts('2026-11-13', null), {
    dia: '13',
    mes: 'nov',
    horario: null,
  })
})
