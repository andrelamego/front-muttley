import test from 'node:test'
import assert from 'node:assert/strict'
import {
  barrasDoCodigo,
  formatarNumeroIngresso,
} from '../src/shared/lib/codigoBarras.ts'

test('o mesmo número gera sempre as mesmas barras, e números diferentes, barras diferentes', () => {
  assert.deepEqual(barrasDoCodigo(304), barrasDoCodigo(304))
  assert.notDeepEqual(barrasDoCodigo(304), barrasDoCodigo(305))
})

test('entre 28 e 36 barras, com duas guias em cada ponta', () => {
  for (const n of [0, 1, 304, 999999]) {
    const barras = barrasDoCodigo(n)
    const comuns = barras.filter((b) => !b.guia)
    assert.ok(comuns.length >= 28 && comuns.length <= 36, `${n}: ${comuns.length}`)
    assert.deepEqual(
      barras.map((b) => b.guia).filter((g, i, l) => i < 2 || i >= l.length - 2),
      [true, true, true, true]
    )
  }
})

test('número da inscrição com seis dígitos', () => {
  assert.equal(formatarNumeroIngresso(304), 'Nº 000304')
  assert.equal(formatarNumeroIngresso(1234567), 'Nº 1234567')
})
