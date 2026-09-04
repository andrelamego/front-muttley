import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../src/shared/http/httpError.ts'

test('HttpError normaliza erros de validação da API Spring (array erros)', () => {
  const error = HttpError.fromAxiosError({
    response: {
      status: 400,
      data: {
        erros: ['email: Email e obrigatorio', 'senha: Senha e obrigatoria'],
      },
    },
  })

  assert.equal(error.status, 400)
  assert.deepEqual(error.validationErrors, [
    'email: Email e obrigatorio',
    'senha: Senha e obrigatoria',
  ])
  assert.equal(
    error.message,
    'email: Email e obrigatorio\nsenha: Senha e obrigatoria'
  )
})

test('HttpError normaliza erro de negócio da API (campo erro)', () => {
  const error = HttpError.fromAxiosError({
    response: {
      status: 409,
      data: {
        erro: 'Inscrições encerradas: capacidade máxima atingida.',
      },
    },
  })

  assert.equal(error.status, 409)
  assert.equal(error.message, 'Inscrições encerradas: capacidade máxima atingida.')
})

test('HttpError normaliza mensagem de erro de autenticação (campo message)', () => {
  const error = HttpError.fromAxiosError({
    response: {
      status: 401,
      data: {
        message: 'Email ou senha invalidos',
      },
    },
  })

  assert.equal(error.status, 401)
  assert.equal(error.message, 'Email ou senha invalidos')
})

test('HttpError aplica mensagens padrão adequadas por status quando corpo estiver vazio', () => {
  const error401 = HttpError.fromAxiosError({ response: { status: 401, data: null } })
  assert.equal(error401.message, 'Email ou senha inválidos.')

  const error403 = HttpError.fromAxiosError({ response: { status: 403, data: null } })
  assert.equal(
    error403.message,
    'Acesso negado. Você não possui permissão para executar esta ação.'
  )

  const error404 = HttpError.fromAxiosError({ response: { status: 404, data: null } })
  assert.equal(error404.message, 'O recurso solicitado não foi encontrado.')

  const error409 = HttpError.fromAxiosError({ response: { status: 409, data: null } })
  assert.equal(
    error409.message,
    'Conflito de estado ou registro já existente.'
  )

  const error500 = HttpError.fromAxiosError({ response: { status: 500, data: null } })
  assert.equal(
    error500.message,
    'Serviço temporariamente indisponível. Tente novamente.'
  )
})
