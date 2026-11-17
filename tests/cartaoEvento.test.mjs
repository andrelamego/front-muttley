import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cartaoEventoSvg,
  quebrarLinhas,
} from '../src/modules/eventos/domain/cartaoEvento.ts'

test('quebra o tema por palavras e corta com reticências', () => {
  assert.deepEqual(quebrarLinhas('Carreira e portfólio em tecnologia', 20, 3), [
    'Carreira e portfólio',
    'em tecnologia',
  ])
  assert.deepEqual(quebrarLinhas('um dois três quatro', 4, 2), ['um', 'dois…'])
})

test('cartão do evento escapa o texto e traz data e tema', () => {
  const svg = decodeURIComponent(
    cartaoEventoSvg({
      id: 1,
      tema: 'Segurança <script> & cia',
      descricao: null,
      data: '2026-11-22',
      horarioInicio: '19:00:00',
      horarioFim: '21:00:00',
      modalidade: 'PRESENCIAL',
      status: 'CRIADO',
      disciplina: null,
      local: 'Auditório',
      inscricoesEncerradas: false,
    }).replace('data:image/svg+xml;charset=utf-8,', '')
  )
  assert.match(svg, />22</)
  assert.match(svg, />NOV</)
  assert.match(svg, />19h</)
  assert.match(svg, /Auditório · Presencial/)
  assert.match(svg, /&#60;script&#62;/)
  assert.match(svg, /&#38;/)
  assert.doesNotMatch(svg, /<script>/)
})

test('a paleta do cartão acompanha o tema', () => {
  const evento = {
    id: 1,
    tema: 'Evento',
    descricao: null,
    data: '2026-11-22',
    horarioInicio: '19:00:00',
    horarioFim: '21:00:00',
    modalidade: 'ONLINE',
    status: 'CRIADO',
    disciplina: null,
    local: null,
    inscricoesEncerradas: false,
  }
  const svg = (paleta) => decodeURIComponent(cartaoEventoSvg(evento, paleta))
  assert.match(svg('papel'), /fill="#f4f5f8"/)
  assert.match(svg('tinta'), /fill="#1a1d2a"/)
  assert.doesNotMatch(svg('tinta'), /fill="#f4f5f8"/)
})
