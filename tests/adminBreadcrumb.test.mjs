import test from 'node:test'
import assert from 'node:assert/strict'
import { getAdminBreadcrumb } from '../src/app/layouts/adminBreadcrumb.ts'

test('páginas de primeiro nível mostram só o próprio nome', () => {
  assert.deepEqual(getAdminBreadcrumb('/admin/inicio'), [{ label: 'Painel' }])
  assert.deepEqual(getAdminBreadcrumb('/admin/pessoas'), [{ label: 'Pessoas' }])
})

test('páginas de evento ficam sob Eventos, com link de volta', () => {
  assert.deepEqual(getAdminBreadcrumb('/admin/eventos/novo'), [
    { label: 'Eventos', to: '/admin/eventos' },
    { label: 'Criar evento' },
  ])
  assert.deepEqual(getAdminBreadcrumb('/admin/eventos/40003/editar'), [
    { label: 'Eventos', to: '/admin/eventos' },
    { label: 'Editar evento' },
  ])
  assert.deepEqual(getAdminBreadcrumb('/admin/eventos/40003/concluir/'), [
    { label: 'Eventos', to: '/admin/eventos' },
    { label: 'Concluir evento' },
  ])
})

test('rota desconhecida cai em Coordenação', () => {
  assert.deepEqual(getAdminBreadcrumb('/admin/outra'), [
    { label: 'Coordenação' },
  ])
})
