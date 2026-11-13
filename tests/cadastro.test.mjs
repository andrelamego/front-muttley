import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cpfValido,
  formatarCpf,
  formatarTelefone,
  validarSolicitacao,
  validarConclusao,
  tokenDoConvite,
} from '../src/modules/auth/domain/cadastro.ts'

test('formata CPF enquanto digita e ignora o que não é número', () => {
  assert.equal(formatarCpf('123'), '123')
  assert.equal(formatarCpf('1234'), '123.4')
  assert.equal(formatarCpf('12345678909'), '123.456.789-09')
  assert.equal(formatarCpf('123.456.789-0912'), '123.456.789-09')
})

test('valida dígitos do CPF', () => {
  assert.equal(cpfValido('123.456.789-09'), true)
  assert.equal(cpfValido('12345678900'), false)
  assert.equal(cpfValido('111.111.111-11'), false)
  assert.equal(cpfValido('123'), false)
})

test('formata telefone fixo e celular', () => {
  assert.equal(formatarTelefone('1133334444'), '(11) 3333-4444')
  assert.equal(formatarTelefone('11987654321'), '(11) 98765-4321')
  assert.equal(formatarTelefone('11'), '(11')
})

test('pedido de cadastro exige nome e email válido', () => {
  assert.deepEqual(validarSolicitacao({ nome: ' ', email: 'x' }), {
    nome: 'Informe seu nome.',
    email: 'Informe um email válido.',
  })
  assert.deepEqual(
    validarSolicitacao({ nome: 'Ana', email: 'ana@fatec.example' }),
    {}
  )
})

test('conclusão exige telefone, CPF válido, senha e confirmação igual', () => {
  const base = {
    nome: 'Ana',
    email: 'ana@fatec.example',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-09',
    senha: 'segredo',
    confirmacao: 'segredo',
  }
  assert.deepEqual(validarConclusao(base), {})
  assert.deepEqual(
    validarConclusao({
      ...base,
      telefone: '(11) 9',
      cpf: '123.456.789-00',
      senha: '',
      confirmacao: 'x',
    }),
    {
      telefone: 'Informe o telefone com DDD.',
      cpf: 'CPF inválido.',
      senha: 'Crie uma senha.',
      confirmacao: 'As senhas não conferem.',
    }
  )
})

test('lê o token do link do convite (?id=) ou de ?token=', () => {
  assert.equal(tokenDoConvite('?id=abc123'), 'abc123')
  assert.equal(tokenDoConvite('?token=xyz'), 'xyz')
  assert.equal(tokenDoConvite(''), null)
  assert.equal(tokenDoConvite('?id=%20'), null)
})
