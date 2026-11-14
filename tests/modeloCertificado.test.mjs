import test from 'node:test'
import assert from 'node:assert/strict'
import {
  inserirMarcador,
  marcadoresDesconhecidos,
  validarModelo,
} from '../src/modules/admin-cadastros/domain/modeloCertificado.ts'

const valido = {
  instituicao: 'Fatec Zona Leste',
  titulo: 'Certificado de participação',
  texto: 'Participou de {evento}.',
  cargoAssinatura: 'Coordenação',
  corPrincipal: '#2236e0',
  corDestaque: '#FFD93B',
  leiaute: 'INGRESSO',
  logoBase64: null,
  logoMime: null,
}

test('modelo válido não tem erros; campos vazios, longos e cores fora do formato têm', () => {
  assert.deepEqual(validarModelo(valido), {})
  const erros = validarModelo({
    ...valido,
    titulo: ' ',
    texto: 'x'.repeat(601),
    corPrincipal: 'blue',
    corDestaque: '#fff',
  })
  assert.deepEqual(Object.keys(erros).sort(), [
    'corDestaque',
    'corPrincipal',
    'texto',
    'titulo',
  ])
  assert.equal(erros.texto, 'Use até 600 caracteres.')
})

test('insere o marcador no cursor, substituindo a seleção', () => {
  assert.deepEqual(inserirMarcador('Olá !', 4, 4, '{nome}'), {
    texto: 'Olá {nome}!',
    cursor: 10,
  })
  assert.deepEqual(inserirMarcador('de X em', 3, 4, '{evento}'), {
    texto: 'de {evento} em',
    cursor: 11,
  })
})

test('aponta marcadores escritos errado, sem repetir', () => {
  assert.deepEqual(
    marcadoresDesconhecidos('{nome} {Nome} {evnto} {Nome} {data}'),
    ['{Nome}', '{evnto}']
  )
})
