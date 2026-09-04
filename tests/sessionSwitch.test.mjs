import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveLoginDestination } from '../src/modules/auth/domain/loginDestinationPolicy.ts'

test('fluxo ADMIN -> sair -> login USER direciona com sucesso para /user/inicio', () => {
  // 1. ADMIN estava na rota administrativa
  const adminLastPath = '/admin/eventos'

  // 2. ADMIN encerra a sessao: o logout limpa a sessao e nao registra o pathname do admin como intencao
  // Caso alguma camada envie adminLastPath como returnTo:
  const destinationUser = resolveLoginDestination(adminLastPath, 'USER')

  // 3. A politica de destino barra a rota administrativa para o papel USER e manda com seguranca para /user/inicio
  assert.equal(destinationUser, '/user/inicio')
})

test('fluxo USER -> sair -> login ADMIN direciona com sucesso para /admin/inicio', () => {
  // 1. USER estava no painel de participante
  const userLastPath = '/user/inicio'

  // 2. ADMIN faz login subsequente sem destino especifico ou com returnTo generico
  const destinationAdminDefault = resolveLoginDestination(null, 'ADMIN')
  assert.equal(destinationAdminDefault, '/admin/inicio')

  // 3. Se um ADMIN acessar uma URL publica de evento, o destino e preservado
  const destinationAdminPublic = resolveLoginDestination('/eventos/42', 'ADMIN')
  assert.equal(destinationAdminPublic, '/eventos/42')
})

test('expiracao ou resposta tardia da sessao anterior nao contamina a rota do novo usuario', () => {
  // Simulando cenario onde havia uma requisicao com destino /admin/eventos/novo pendente
  const staleIntent = '/admin/eventos/novo'

  // Quando o novo usuario autentica como USER, a rota e bloqueada
  assert.equal(resolveLoginDestination(staleIntent, 'USER'), '/user/inicio')

  // E se autenticar como ADMIN, a rota e concedida
  assert.equal(resolveLoginDestination(staleIntent, 'ADMIN'), '/admin/eventos/novo')
})
