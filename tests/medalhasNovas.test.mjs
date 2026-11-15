import test from 'node:test'
import assert from 'node:assert/strict'
import {
  medalhasConquistadas,
  medalhasNovas,
} from '../src/modules/medalhas/domain/medalhasNovas.ts'

const trilha = (chave, nivel) => ({ chave, titulo: chave, nivel })
const conquistas = {
  trilhas: [trilha('geral', 'PRATA'), trilha('horas', null)],
  especiais: [{ tipo: 'DIAMANTE', titulo: 'Diamante 2026/2' }],
  disputas: [],
}

test('cada nível de trilha e cada especial vira uma medalha; trilha sem nível não conta', () => {
  assert.deepEqual(
    medalhasConquistadas(conquistas).map((m) => m.chave),
    ['especial:DIAMANTE:Diamante 2026/2', 'trilha:geral:PRATA']
  )
})

test('primeira visita não revela o histórico', () => {
  assert.deepEqual(medalhasNovas(medalhasConquistadas(conquistas), null), [])
})

test('revela só o que não estava entre as vistas, inclusive subir de nível', () => {
  const novas = medalhasNovas(medalhasConquistadas(conquistas), [
    'trilha:geral:BRONZE',
    'especial:DIAMANTE:Diamante 2026/2',
  ])
  assert.deepEqual(
    novas.map((m) => m.chave),
    ['trilha:geral:PRATA']
  )
})
