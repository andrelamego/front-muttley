import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveLoginDestination,
  getDefaultRouteForRole,
} from '../src/modules/auth/domain/loginDestinationPolicy.ts'

test('getDefaultRouteForRole retorna rotas padrão por papel', () => {
  assert.equal(getDefaultRouteForRole('ADMIN'), '/admin/inicio')
  assert.equal(getDefaultRouteForRole('USER'), '/user/inicio')
})

test('fallback seguro quando destino for nulo, indefinido ou vazio', () => {
  assert.equal(resolveLoginDestination(null, 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination(undefined, 'ADMIN'), '/admin/inicio')
  assert.equal(resolveLoginDestination('', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('   ', 'ADMIN'), '/admin/inicio')
})

test('bloqueia open redirect e URLs externas maliciosas', () => {
  const evilUrls = [
    'https://attacker.example.com',
    'http://phishing.site/admin',
    '//attacker.example.com/roubo',
    '\\\\attacker.example.com\\path',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
  ]

  for (const evil of evilUrls) {
    assert.equal(
      resolveLoginDestination(evil, 'USER'),
      '/user/inicio',
      `Deveria bloquear ${evil} para USER`
    )
    assert.equal(
      resolveLoginDestination(evil, 'ADMIN'),
      '/admin/inicio',
      `Deveria bloquear ${evil} para ADMIN`
    )
  }
})

test('bloqueia retorno para a própria página de login para evitar loops', () => {
  assert.equal(resolveLoginDestination('/login', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/login?returnTo=/admin', 'ADMIN'), '/admin/inicio')
  assert.equal(resolveLoginDestination('/login#topo', 'USER'), '/user/inicio')
})

test('USER tentando acessar rotas de ADMIN é encaminhado com segurança para /user/inicio', () => {
  assert.equal(resolveLoginDestination('/admin', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/admin/inicio', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/admin/eventos', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/admin/eventos/novo', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/admin/eventos/42/editar', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/admin/eventos/42/concluir', 'USER'), '/user/inicio')
})

test('ADMIN acessando rotas de ADMIN tem o destino preservado com query e hash', () => {
  assert.equal(resolveLoginDestination('/admin/inicio', 'ADMIN'), '/admin/inicio')
  assert.equal(
    resolveLoginDestination('/admin/eventos?status=EM_ANDAMENTO', 'ADMIN'),
    '/admin/eventos?status=EM_ANDAMENTO'
  )
  assert.equal(
    resolveLoginDestination('/admin/eventos/15/editar#dados', 'ADMIN'),
    '/admin/eventos/15/editar#dados'
  )
})

test('USER e ADMIN acessando rotas de participante (/user) têm o destino respeitado', () => {
  assert.equal(resolveLoginDestination('/user/inicio', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/user/certificados', 'USER'), '/user/certificados')
  assert.equal(resolveLoginDestination('/user/medalhas', 'USER'), '/user/medalhas')
  assert.equal(resolveLoginDestination('/user/inicio', 'ADMIN'), '/user/inicio')
})

test('rotas públicas (/eventos, /certificados, /) são permitidas para qualquer perfil autenticado', () => {
  assert.equal(resolveLoginDestination('/', 'USER'), '/')
  assert.equal(resolveLoginDestination('/eventos', 'USER'), '/eventos')
  assert.equal(resolveLoginDestination('/eventos/10', 'USER'), '/eventos/10')
  assert.equal(
    resolveLoginDestination('/eventos/10/confirmar-presenca?token=abc', 'USER'),
    '/eventos/10/confirmar-presenca?token=abc'
  )
  assert.equal(
    resolveLoginDestination('/certificados/CERT-2026-XYZ', 'USER'),
    '/certificados/CERT-2026-XYZ'
  )

  assert.equal(resolveLoginDestination('/eventos', 'ADMIN'), '/eventos')
  assert.equal(resolveLoginDestination('/eventos/10', 'ADMIN'), '/eventos/10')
})

test('rotas desconhecidas ou não mapeadas caem no fallback do perfil', () => {
  assert.equal(resolveLoginDestination('/desconhecido', 'USER'), '/user/inicio')
  assert.equal(resolveLoginDestination('/random/path', 'ADMIN'), '/admin/inicio')
})
