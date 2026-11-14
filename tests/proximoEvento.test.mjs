import test from 'node:test'
import assert from 'node:assert/strict'
import { formatProximoEvento } from '../src/modules/painel/domain/proximoEvento.ts'

const hoje = new Date(2026, 10, 13, 15, 30)

test('evento no mesmo dia', () => {
  assert.equal(
    formatProximoEvento('2026-11-13', hoje),
    'Seu próximo evento é hoje'
  )
})

test('evento no dia seguinte', () => {
  assert.equal(
    formatProximoEvento('2026-11-14', hoje),
    'Seu próximo evento é amanhã'
  )
})

test('evento em outra data futura', () => {
  assert.equal(
    formatProximoEvento('2026-12-02', hoje),
    'Seu próximo evento é em 2 de dez'
  )
})

test('evento já passado vira o último evento', () => {
  assert.equal(
    formatProximoEvento('2026-03-05', hoje),
    'Seu último evento foi em 5 de mar'
  )
})

const { selecionarEventoDestaque } =
  await import('../src/modules/painel/domain/proximoEvento.ts')

const part = (id, data, hi = '19:00', hf = '21:00', status = 'ABERTO') => ({
  id,
  inscricao: id,
  tipo: null,
  evento: {
    id,
    tema: `E${id}`,
    descricao: null,
    data,
    horarioInicio: hi,
    horarioFim: hf,
    modalidade: 'PRESENCIAL',
    status,
    disciplina: null,
    local: null,
  },
})

test('destaca o próximo evento futuro e lista só os futuros depois dele', () => {
  const r = selecionarEventoDestaque(
    [part(3, '2026-11-20'), part(1, '2026-10-01'), part(2, '2026-11-15')],
    hoje
  )
  assert.equal(r.destaque.id, 2)
  assert.equal(r.passado, false)
  assert.deepEqual(
    r.depois.map((p) => p.id),
    [3]
  )
})

test('sem eventos futuros, destaca o mais recente dos passados', () => {
  const r = selecionarEventoDestaque(
    [part(1, '2026-03-05'), part(2, '2026-10-01'), part(3, '2026-06-10')],
    hoje
  )
  assert.equal(r.destaque.id, 2)
  assert.equal(r.passado, true)
  assert.deepEqual(r.depois, [])
})

test('evento com presença aberta tem prioridade e cancelados são ignorados', () => {
  const r = selecionarEventoDestaque(
    [
      part(1, '2026-11-13', '15:00', '17:00'),
      part(2, '2026-11-13', '09:00', '10:00', 'CANCELADO'),
    ],
    hoje
  )
  assert.equal(r.destaque.id, 1)
  assert.equal(r.passado, false)
})

test('sem participações válidas não há destaque', () => {
  const r = selecionarEventoDestaque(
    [part(1, '2026-12-01', '19:00', '21:00', 'CANCELADO')],
    hoje
  )
  assert.equal(r.destaque, undefined)
  assert.deepEqual(r.depois, [])
})
