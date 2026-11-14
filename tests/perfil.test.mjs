import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validarDadosPerfil,
  validarTrocaSenha,
} from '../src/modules/auth/domain/perfil.ts'

test('dados do perfil exigem nome e telefone com DDD', () => {
  assert.deepEqual(
    validarDadosPerfil({ nome: 'Ana', telefone: '(11) 91234-5678' }),
    {}
  )
  assert.deepEqual(
    validarDadosPerfil({ nome: 'Ana', telefone: '(11) 3456-7890' }),
    {}
  )
  assert.deepEqual(
    Object.keys(
      validarDadosPerfil({ nome: '  ', telefone: '91234-5678' })
    ).sort(),
    ['nome', 'telefone']
  )
})

test('troca de senha confere preenchimento, diferença e confirmação', () => {
  assert.deepEqual(
    validarTrocaSenha({ senhaAtual: 'a', novaSenha: 'b', confirmacao: 'b' }),
    {}
  )
  assert.deepEqual(
    Object.keys(
      validarTrocaSenha({ senhaAtual: '', novaSenha: '', confirmacao: 'x' })
    ).sort(),
    ['confirmacao', 'novaSenha', 'senhaAtual']
  )
  assert.equal(
    validarTrocaSenha({ senhaAtual: 'a', novaSenha: 'a', confirmacao: 'a' })
      .novaSenha,
    'A nova senha precisa ser diferente da atual.'
  )
})
