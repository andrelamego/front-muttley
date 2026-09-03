import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeAuthRole, getRoleFromToken } from '../src/utils/auth.ts'

// A leitura no navegador serve à interface. A autorização real é testada no backend.
const token = (claims) =>
  `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`

for (const [name, input, expected] of [
  ['ADMIN direto', 'ADMIN', 'ADMIN'],
  ['USER direto', 'USER', 'USER'],
  ['prefixo de authority', 'ROLE_ADMIN', 'ADMIN'],
  ['espaços e caixa', ' role_user ', 'USER'],
  ['lista de authorities', [{ authority: 'ROLE_USER' }], 'USER'],
  ['valores desconhecidos antes do papel', ['DESCONHECIDO', 'ADMIN'], 'ADMIN'],
  ['papel desconhecido', 'ROOT', null],
  ['papel ausente', null, null],
  ['valor numérico', 1, null],
]) {
  test(`normalização: ${name}`, () => {
    assert.equal(normalizeAuthRole(input), expected)
  })
}

test('papel do JWT emitido pelo backend', () => {
  assert.equal(getRoleFromToken(token({ sub: 'teste@example.invalid', userId: 7, role: 'ADMIN' })), 'ADMIN')
})

for (const [claim, value] of [
  ['roles', ['USER']],
  ['authorities', [{ authority: 'ROLE_USER' }]],
  ['scope', 'USER'],
]) {
  test(`compatibilidade do claim ${claim}`, () => {
    assert.equal(getRoleFromToken(token({ [claim]: value })), 'USER')
  })
}

test('papel desconhecido no JWT não habilita interface administrativa', () => {
  assert.equal(getRoleFromToken(token({ role: 'ROOT' })), null)
})

for (const value of [null, '', 'sem-payload', 'a.%%%.b', 'a.e30.b']) {
  test(`JWT ausente ou inválido: ${String(value)}`, () => {
    assert.equal(getRoleFromToken(value), null)
  })
}

test('claim role tem prioridade sobre alternativas', () => {
  assert.equal(getRoleFromToken(token({ role: 'USER', authorities: ['ROLE_ADMIN'] })), 'USER')
})
