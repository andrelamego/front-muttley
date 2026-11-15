import test from 'node:test'
import assert from 'node:assert/strict'
import {
  conflitos,
  consequencias,
  copiarDe,
  idDe,
  proximoDiaUtil,
  somarMinutos,
  validarEvento,
} from '../src/modules/admin-eventos/domain/formularioEvento.ts'

const valores = {
  tema: 'Oficina de Git',
  descricao: '',
  data: '2026-11-20',
  horarioInicio: '19:00',
  horarioFim: '21:30',
  modalidade: 'PRESENCIAL',
  localId: '3',
  disciplinaId: '2',
  patrocinadorId: '1',
}
const hoje = new Date(2026, 10, 14, 15, 0)

test('soma minutos sem passar da meia-noite', () => {
  assert.equal(somarMinutos('19:00', 150), '21:30')
  assert.equal(somarMinutos('09:45', 60), '10:45')
  assert.equal(somarMinutos('23:00', 120), null)
})

test('próximo dia útil pula o fim de semana', () => {
  assert.equal(proximoDiaUtil(new Date(2026, 10, 12)), '2026-11-13') // quinta → sexta
  assert.equal(proximoDiaUtil(new Date(2026, 10, 13)), '2026-11-16') // sexta → segunda
  assert.equal(proximoDiaUtil(new Date(2026, 10, 14)), '2026-11-16') // sábado → segunda
})

test('id vem do campo solto ou do objeto da relação', () => {
  assert.equal(idDe(7, null), '7')
  assert.equal(idDe(null, { id: 3, nome: 'Sala' }), '3')
  assert.equal(idDe(undefined, 'Sala'), '')
})

test('validação exige o que a API exige e recusa data passada e horário invertido', () => {
  assert.deepEqual(validarEvento(valores, hoje), {})
  const erros = validarEvento(
    {
      ...valores,
      tema: ' ',
      data: '2026-11-13',
      horarioFim: '18:00',
      localId: '',
      disciplinaId: '',
      patrocinadorId: '',
    },
    hoje
  )
  assert.deepEqual(Object.keys(erros).sort(), [
    'data',
    'disciplinaId',
    'horarioFim',
    'localId',
    'patrocinadorId',
    'tema',
  ])
  assert.equal(
    validarEvento({ ...valores, data: '2026-11-14' }, hoje).data,
    undefined
  )
})

test('consequências descrevem a janela de presença e o prazo de inscrição', () => {
  assert.deepEqual(consequencias(valores), {
    presenca: 'A presença fica liberada das 18h50 às 21h40.',
    inscricoes: 'As inscrições ficam abertas até o início, às 19h00 de 20/11.',
  })
  assert.equal(consequencias({ ...valores, horarioFim: '18:00' }), null)
})

test('conflito é mesmo local, mesmo dia e horário sobreposto', () => {
  const ev = (id, inicio, fim, extra = {}) => ({
    id,
    data: '2026-11-20',
    horarioInicio: inicio,
    horarioFim: fim,
    status: 'CRIADO',
    localId: null,
    local: { id: 3, nome: 'Auditório' },
    ...extra,
  })
  const eventos = [
    ev(1, '20:00:00', '22:00:00'),
    ev(2, '17:00:00', '19:00:00'), // termina quando o novo começa
    ev(3, '19:30:00', '20:00:00', { status: 'CANCELADO' }),
    ev(4, '19:00:00', '21:00:00', { local: { id: 9 } }),
    ev(5, '19:00:00', '21:00:00'),
  ]
  assert.deepEqual(
    conflitos(eventos, valores, 5).map((e) => e.id),
    [1]
  )
})

test('cópia reaproveita tudo menos a data', () => {
  const copia = copiarDe({
    id: 1,
    tema: 'Semana de TI',
    descricao: '-',
    data: '2026-03-10',
    horarioInicio: '09:00:00',
    horarioFim: '11:00:00',
    modalidade: 'HIBRIDO',
    status: 'FINALIZADO',
    localId: null,
    disciplinaId: null,
    patrocinadorId: null,
    local: { id: 3 },
    disciplina: { id: 2 },
    patrocinador: { id: 1 },
  })
  assert.deepEqual(copia, {
    tema: 'Semana de TI',
    descricao: '',
    horarioInicio: '09:00',
    horarioFim: '11:00',
    modalidade: 'HIBRIDO',
    localId: '3',
    disciplinaId: '2',
    patrocinadorId: '1',
  })
  assert.equal('data' in copia, false)
})

test('buscarPessoas acha por nome ou e-mail, sem acento, e pula quem já foi escolhido', async () => {
  const { buscarPessoas } =
    await import('../src/modules/admin-eventos/domain/formularioEvento.ts')
  const pessoas = [
    { id: 1, nome: 'João Silva', email: 'joao@fatec.sp.gov.br' },
    { id: 2, nome: 'Ana Joana Prado', email: 'ana@fatec.sp.gov.br' },
    { id: 3, nome: 'Beatriz Lima', email: 'bia.joao@fatec.sp.gov.br' },
    { id: 4, nome: 'Joaquim Reis', email: 'jr@fatec.sp.gov.br' },
  ]
  // começo de nome ou de sobrenome antes de quem só contém no e-mail
  assert.deepEqual(
    buscarPessoas(pessoas, 'joa', new Set()).map((p) => p.id),
    [2, 1, 4, 3]
  )
  assert.deepEqual(
    buscarPessoas(pessoas, 'JOÃO', new Set([1])).map((p) => p.id),
    [3]
  )
  assert.deepEqual(buscarPessoas(pessoas, '   ', new Set()), [])
})
