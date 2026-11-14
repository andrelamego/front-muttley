import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CAMPOS_CADASTRO,
  CAMPOS_PESSOA,
  paraPayload,
  validarValores,
  valoresDe,
} from '../src/modules/admin-cadastros/domain/formularios.ts'

test('campos obrigatórios vazios recebem mensagem; opcionais não', () => {
  const erros = validarValores(CAMPOS_CADASTRO.disciplinas, {
    nome: ' ',
    descricao: 'Algo',
    turno: '',
    id_professor: '',
  })
  assert.deepEqual(Object.keys(erros).sort(), ['nome', 'turno'])
})

test('valida email, CPF e números', () => {
  const erros = validarValores(CAMPOS_PESSOA, {
    nome: 'Ana',
    email: 'ana@',
    telefone: '(11) 91234-5678',
    cpf: '111.111.111-11',
  })
  assert.deepEqual(Object.keys(erros).sort(), ['cpf', 'email'])
  assert.ok(
    validarValores(CAMPOS_CADASTRO.locais, {
      nome: 'Sala',
      descricao: 'x',
      capacidade: '0',
      enderecoId: '1',
    }).capacidade
  )
})

test('payload converte números e ids e manda vazio como null', () => {
  assert.deepEqual(
    paraPayload(CAMPOS_CADASTRO.disciplinas, {
      nome: ' Banco de dados ',
      descricao: 'SQL',
      turno: 'NORTUNO',
      id_professor: '',
    }),
    {
      nome: 'Banco de dados',
      descricao: 'SQL',
      turno: 'NORTUNO',
      id_professor: null,
    }
  )
  assert.deepEqual(
    paraPayload(CAMPOS_CADASTRO.locais, {
      nome: 'Sala',
      descricao: 'x',
      capacidade: '40',
      enderecoId: '7',
    }),
    { nome: 'Sala', descricao: 'x', capacidade: 40, enderecoId: 7 }
  )
  assert.equal(
    paraPayload(CAMPOS_CADASTRO.patrocinadores, { valorPatrocinio: '1500,50' })
      .valorPatrocinio,
    1500.5
  )
})

test('preenche a edição a partir do registro, incluindo relações e máscaras', () => {
  assert.deepEqual(
    valoresDe(CAMPOS_CADASTRO.locais, {
      nome: 'Auditório',
      descricao: null,
      capacidade: 120,
      endereco: { id: 3, cidade: 'São Paulo' },
    }),
    { nome: 'Auditório', descricao: '', capacidade: '120', enderecoId: '3' }
  )
  assert.equal(
    valoresDe(CAMPOS_PESSOA, { cpf: '52998224725', telefone: '11912345678' })
      .cpf,
    '529.982.247-25'
  )
  assert.equal(valoresDe(CAMPOS_PESSOA, null).nome, '')
})
