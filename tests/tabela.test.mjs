import test from 'node:test'
import assert from 'node:assert/strict'
import { ordenarPor, paginar } from '../src/shared/lib/tabela.ts'

const pessoas = [
  { nome: 'Úrsula', perfil: 'USER' },
  { nome: 'ana', perfil: 'ADMIN' },
  { nome: 'Bruno', perfil: 'USER' },
  { nome: null, perfil: 'USER' },
]

test('ordena texto em português, sem diferenciar maiúsculas e acentos', () => {
  const nomes = ordenarPor(pessoas, 'nome', 'asc').map((p) => p.nome)
  assert.deepEqual(nomes, ['ana', 'Bruno', 'Úrsula', null])
})

test('ordem decrescente mantém vazios no fim e não altera a lista original', () => {
  const nomes = ordenarPor(pessoas, 'nome', 'desc').map((p) => p.nome)
  assert.deepEqual(nomes, ['Úrsula', 'Bruno', 'ana', null])
  assert.equal(pessoas[0].nome, 'Úrsula')
})

test('pagina e informa o total de páginas', () => {
  const itens = Array.from({ length: 32 }, (_, i) => i + 1)
  const p2 = paginar(itens, 2, 15)
  assert.deepEqual(
    p2.itens,
    Array.from({ length: 15 }, (_, i) => i + 16)
  )
  assert.equal(p2.pagina, 2)
  assert.equal(p2.totalPaginas, 3)
})

test('página fora do intervalo é ajustada e lista vazia tem uma página', () => {
  assert.equal(paginar([1, 2, 3], 9, 2).pagina, 2)
  assert.equal(paginar([1, 2, 3], 0, 2).pagina, 1)
  assert.deepEqual(paginar([], 1, 15), {
    itens: [],
    pagina: 1,
    totalPaginas: 1,
  })
})
