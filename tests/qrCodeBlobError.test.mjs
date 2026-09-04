import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBlobErrorMessage } from '../src/modules/admin-eventos/domain/qrCodeErrorUtils.ts'

test('trata status 503 com mensagem clara de indisponibilidade', async () => {
  const error503 = { response: { status: 503 } }
  const message = await parseBlobErrorMessage(error503, 'Erro padrão')
  assert.equal(message, 'Serviço gerador de QR Code temporariamente indisponível. Tente novamente em instantes.')
})

test('trata status 404 com mensagem de evento não encontrado', async () => {
  const error404 = { response: { status: 404 } }
  const message = await parseBlobErrorMessage(error404, 'Erro padrão')
  assert.equal(message, 'Evento não encontrado para geração de QR Code.')
})

test('trata status 401 e 403 com mensagens adequadas de autorização', async () => {
  const error401 = { response: { status: 401 } }
  assert.equal(
    await parseBlobErrorMessage(error401, 'Erro padrão'),
    'Sessão expirada. Faça login novamente para continuar.'
  )

  const error403 = { response: { status: 403 } }
  assert.equal(
    await parseBlobErrorMessage(error403, 'Erro padrão'),
    'Você não possui permissão administrativa para acessar este QR Code.'
  )
})

test('extrai mensagem amigável de Blob com JSON', async () => {
  const jsonBody = JSON.stringify({ erro: 'Inscrições ainda não abertas para este evento.' })
  const blob = new Blob([jsonBody], { type: 'application/json' })
  const errorWithBlob = { response: { status: 400, data: blob } }

  const message = await parseBlobErrorMessage(errorWithBlob, 'Erro padrão')
  assert.equal(message, 'Inscrições ainda não abertas para este evento.')
})

test('sanitiza e não expõe SQL ou exceptions internas de Blob com JSON', async () => {
  const jsonBody = JSON.stringify({ erro: 'org.hibernate.exception.SQLGrammarException: select * from eventos' })
  const blob = new Blob([jsonBody], { type: 'application/json' })
  const errorWithSql = { response: { status: 500, data: blob } }

  const message = await parseBlobErrorMessage(errorWithSql, 'Erro padrão de servidor')
  assert.equal(message, 'Erro padrão de servidor')
})
