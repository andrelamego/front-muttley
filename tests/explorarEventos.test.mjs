import test from 'node:test'
import assert from 'node:assert/strict'
import {
  secoesExplorar,
  somarDias,
  hojeLocal,
} from '../src/modules/eventos/domain/explorarEventos.ts'

const ev = (id, data, disciplina = null, inscricoesEncerradas = false) => ({
  id,
  tema: `Evento ${id}`,
  data,
  disciplina,
  inscricoesEncerradas,
})

const chaves = (secoes) => secoes.map((s) => s.chave)
const ids = (secao) => secao.eventos.map((e) => e.id)

test('somarDias atravessa o fim do mês e do ano', () => {
  assert.equal(somarDias('2026-11-28', 7), '2026-12-05')
  assert.equal(somarDias('2026-12-30', 3), '2027-01-02')
})

test('hojeLocal usa a data do relógio local com zeros', () => {
  assert.equal(hojeLocal(new Date(2026, 0, 5, 23, 59)), '2026-01-05')
})

test('sem histórico: semana, disciplinas por eventos abertos e outros no fim', () => {
  const secoes = secoesExplorar(
    [
      ev(1, '2026-11-16', 'Banco de Dados'),
      ev(6, '2026-12-20', 'Redes'),
      ev(2, '2026-12-10', 'Eng. de Software'),
      ev(3, '2026-12-11', 'Eng. de Software'),
      ev(4, '2026-11-20'),
      ev(5, '2026-11-15', 'Banco de Dados', true),
    ],
    { hoje: '2026-11-14' }
  )
  assert.deepEqual(chaves(secoes), [
    'semana',
    'disciplina:Eng. de Software',
    'disciplina:Banco de Dados',
    'outros',
  ])
  // encerrado não entra em "próximos 7 dias"
  assert.deepEqual(ids(secoes[0]), [1, 4])
  // na disciplina, abertos antes dos encerrados mesmo que mais tarde
  assert.deepEqual(ids(secoes[2]), [1, 5])
  assert.equal(secoes[2].descricao, '1 evento com inscrições abertas')
  // Redes tem um evento só: vai para a prateleira final, junto do sem disciplina
  assert.equal(secoes[3].titulo, 'Mais eventos')
  assert.deepEqual(ids(secoes[3]), [4, 6])
})

test('para você recomenda pelas disciplinas do histórico e pula inscritos e encerrados', () => {
  const secoes = secoesExplorar(
    [
      ev(1, '2026-12-01', 'Banco de Dados'),
      ev(2, '2026-12-02', 'Banco de Dados'),
      ev(3, '2026-12-03', 'Banco de Dados', true),
      ev(4, '2026-12-04', 'Redes'),
    ],
    {
      hoje: '2026-11-14',
      disciplinasDaPessoa: ['Banco de Dados', 'IA', 'Banco de Dados'],
      inscritos: new Set([2]),
    }
  )
  assert.equal(secoes[0].chave, 'para-voce')
  assert.deepEqual(ids(secoes[0]), [1])
  assert.equal(
    secoes[0].descricao,
    'Porque você se inscreveu em eventos de Banco de Dados'
  )
})

test('sem nenhum evento recomendável, "Para você" não aparece', () => {
  const secoes = secoesExplorar([ev(1, '2026-12-01', 'Redes')], {
    hoje: '2026-11-14',
    disciplinasDaPessoa: ['IA'],
  })
  assert.ok(!chaves(secoes).includes('para-voce'))
})

test('sem disciplina nenhuma, a prateleira única se chama Programação', () => {
  const secoes = secoesExplorar([ev(1, '2027-01-10')], { hoje: '2026-11-14' })
  assert.deepEqual(
    secoes.map((s) => s.titulo),
    ['Programação']
  )
})
