import test from 'node:test'
import assert from 'node:assert/strict'
import {
  progresso,
  proximaMeta,
  totalMedalhas,
  unidade,
} from '../src/modules/medalhas/domain/conquistas.ts'

const trilha = (valor, proximoMarco, marcos = [1, 10, 25], extra = {}) => ({
  chave: 'geral',
  titulo: 'Participação',
  metrica: 'PRESENCAS',
  valor,
  nivel: null,
  proximoNivel: null,
  proximoMarco,
  marcos,
  ...extra,
})

test('progresso conta a partir do marco já alcançado', () => {
  assert.equal(progresso(trilha(0, 1)), 0)
  assert.equal(progresso(trilha(4, 10)), 3 / 9) // de 1 até 10
  assert.equal(progresso(trilha(40, null)), 1)
})

test('próxima meta é a trilha mais perto de subir, ignorando as completas', () => {
  const geral = trilha(9, 10)
  const horas = trilha(12, 30, [10, 30, 60], { chave: 'horas' })
  const completa = trilha(30, null, [1, 5, 10], { chave: 'disciplina:Redes' })
  assert.equal(proximaMeta([horas, completa, geral]).chave, 'geral')
  assert.equal(proximaMeta([completa]), null)
})

test('unidades e total de medalhas', () => {
  assert.equal(unidade({ metrica: 'HORAS' }, 12), '12 h')
  assert.equal(unidade({ metrica: 'PRESENCAS' }, 1), '1 presença')
  assert.equal(
    totalMedalhas({
      trilhas: [trilha(3, 10, [1, 10, 25], { nivel: 'BRONZE' }), trilha(0, 1)],
      especiais: [{ tipo: 'PALESTRANTE' }],
      disputas: [],
    }),
    2
  )
})

test('concordância de "falta" e separação das disputas', async () => {
  const { faltam, separarDisputas } =
    await import('../src/modules/medalhas/domain/conquistas.ts')
  assert.equal(faltam({ metrica: 'PRESENCAS' }, 1), 'Falta 1 presença')
  assert.equal(faltam({ metrica: 'HORAS' }, 23), 'Faltam 23 h')
  const d = (valor) => ({
    titulo: String(valor),
    semestre: '2026/2',
    posicao: 1,
    valor,
    minimo: 3,
  })
  const { principais, outras } = separarDisputas([d(5), d(2), d(1)])
  assert.deepEqual(
    principais.map((x) => x.valor),
    [5, 2]
  )
  assert.deepEqual(
    outras.map((x) => x.valor),
    [1]
  )
})

test('sigla e emblema das moedas', async () => {
  const { sigla, emblema } =
    await import('../src/modules/medalhas/domain/conquistas.ts')
  assert.equal(sigla('Banco de Dados'), 'BD')
  assert.equal(sigla('Interação Humano-Computador'), 'IH')
  assert.equal(sigla('Redes'), 'RE')
  assert.equal(emblema({ chave: 'geral', titulo: 'Participação' }), 'P')
  assert.equal(emblema({ chave: 'horas', titulo: 'Horas' }), 'h')
  assert.equal(
    emblema({
      chave: 'disciplina:Ciência de Dados',
      titulo: 'Ciência de Dados',
    }),
    'CD'
  )
})
