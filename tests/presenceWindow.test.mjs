import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getPresenceWindow,
  isWithinPresenceWindow,
  formatPresenceWindow,
} from '../src/modules/eventos/domain/presenceWindow.ts'

const at = (h, m) => new Date(2026, 10, 13, h, m, 0)

test('janela abre 10 minutos antes do início e fecha 10 minutos após o fim', () => {
  const janela = getPresenceWindow('2026-11-13', '19:00:00', '21:00:00')
  assert.equal(janela.abre.getTime(), at(18, 50).getTime())
  assert.equal(janela.fecha.getTime(), at(21, 10).getTime())
})

test('limite de abertura conta como aberto', () => {
  assert.equal(
    isWithinPresenceWindow('2026-11-13', '19:00', '21:00', at(18, 50)),
    true
  )
})

test('limite de fechamento conta como aberto', () => {
  assert.equal(
    isWithinPresenceWindow('2026-11-13', '19:00', '21:00', at(21, 10)),
    true
  )
})

test('um minuto antes ou depois da janela fica fechado', () => {
  assert.equal(
    isWithinPresenceWindow('2026-11-13', '19:00', '21:00', at(18, 49)),
    false
  )
  assert.equal(
    isWithinPresenceWindow('2026-11-13', '19:00', '21:00', at(21, 11)),
    false
  )
})

test('campos ausentes ou data inválida não abrem janela', () => {
  assert.equal(getPresenceWindow(null, '19:00', '21:00'), null)
  assert.equal(getPresenceWindow('2026-11-13', '19:00', undefined), null)
  assert.equal(getPresenceWindow('2026-13-45', '19:00', '21:00'), null)
  assert.equal(getPresenceWindow('2026-02-30', '19:00', '21:00'), null)
  assert.equal(isWithinPresenceWindow(undefined, undefined, undefined), false)
})

test('texto da janela usa horas no formato brasileiro', () => {
  const janela = getPresenceWindow('2026-11-13', '19:00:00', '21:00:00')
  assert.equal(formatPresenceWindow(janela), 'Disponível das 18h50 às 21h10')
})
