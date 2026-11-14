import test from 'node:test'
import assert from 'node:assert/strict'
import { situacaoPresenca } from '../src/modules/admin-eventos/domain/telao.ts'
import { getPresenceWindow } from '../src/modules/eventos/domain/presenceWindow.ts'

const at = (h, m) => new Date(2026, 10, 13, h, m, 0)
const janela = getPresenceWindow('2026-11-13', '19:00', '21:30')

test('antes da janela avisa quando a presença abre', () => {
  assert.deepEqual(situacaoPresenca(janela, 'CRIADO', at(18, 30)), {
    fase: 'antes',
    texto: 'Presença abre às 18h50',
  })
})

test('dentro da janela, inclusive nos limites, mostra até quando fica aberta', () => {
  for (const agora of [at(18, 50), at(20, 0), at(21, 40)]) {
    assert.deepEqual(situacaoPresenca(janela, 'EM_ANDAMENTO', agora), {
      fase: 'aberta',
      texto: 'Presença aberta até 21h40',
    })
  }
})

test('depois da janela informa o encerramento', () => {
  assert.equal(
    situacaoPresenca(janela, 'EM_ANDAMENTO', at(21, 41)).fase,
    'encerrada'
  )
})

test('evento finalizado ou cancelado prevalece sobre o horário', () => {
  assert.equal(
    situacaoPresenca(janela, 'FINALIZADO', at(20, 0)).texto,
    'Evento encerrado'
  )
  assert.equal(
    situacaoPresenca(janela, 'CANCELADO', at(20, 0)).fase,
    'indisponivel'
  )
})

test('sem horário não há janela', () => {
  assert.equal(situacaoPresenca(null, 'CRIADO', at(20, 0)).fase, 'indisponivel')
})
