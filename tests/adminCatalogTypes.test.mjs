import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatAdminDate,
  includesSearch,
  normalizeAdminList,
} from '../src/modules/admin-cadastros/domain/adminCatalogTypes.ts'

test('normaliza respostas administrativas em lista direta ou página', () => {
  const records = [{ id: 1 }, { id: 2 }]
  assert.deepEqual(normalizeAdminList(records), records)
  assert.deepEqual(normalizeAdminList({ content: records }), records)
  assert.deepEqual(normalizeAdminList({ content: null }), [])
  assert.deepEqual(normalizeAdminList(undefined), [])
})

test('formata data ISO sem deslocamento de fuso horário', () => {
  assert.equal(formatAdminDate('2026-09-04'), '04/09/2026')
  assert.equal(formatAdminDate('2026-09-04T18:30:00'), '04/09/2026')
  assert.equal(formatAdminDate(), 'Não informada')
})

test('busca administrativa ignora caixa e acentos são preservados', () => {
  assert.equal(includesSearch(['Maria Silva', 'maria@email.com'], 'SILVA'), true)
  assert.equal(includesSearch(['Certificação'], 'certificação'), true)
  assert.equal(includesSearch(['Evento'], 'pessoa'), false)
  assert.equal(includesSearch([], ''), true)
})
