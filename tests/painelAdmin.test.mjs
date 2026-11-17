import test from 'node:test'
import assert from 'node:assert/strict'
import {
  situacaoOcupacao,
  alturas,
} from '../src/modules/painel/domain/painelAdmin.ts'

const HOJE = '2026-11-15'

test('lotado e quase lotado valem em qualquer data', () => {
  assert.equal(
    situacaoOcupacao({ percentual: 100, data: '2026-12-20' }, HOJE),
    'LOTADO'
  )
  assert.equal(
    situacaoOcupacao({ percentual: 120, data: '2026-12-20' }, HOJE),
    'LOTADO'
  )
  assert.equal(
    situacaoOcupacao({ percentual: 85, data: '2026-12-20' }, HOJE),
    'QUASE_LOTADO'
  )
})

test('baixa procura só a até 3 dias do evento', () => {
  assert.equal(
    situacaoOcupacao({ percentual: 10, data: '2026-11-18' }, HOJE),
    'BAIXA_PROCURA'
  )
  assert.equal(
    situacaoOcupacao({ percentual: 10, data: '2026-11-19' }, HOJE),
    null
  )
  assert.equal(
    situacaoOcupacao({ percentual: 30, data: '2026-11-16' }, HOJE),
    null
  )
})

test('sem capacidade no local, não há situação', () => {
  assert.equal(situacaoOcupacao({ percentual: null, data: HOJE }, HOJE), null)
})

test('alturas proporcionais ao maior, e zero quando tudo é zero', () => {
  assert.deepEqual(alturas([2, 4, 0]), [50, 100, 0])
  assert.deepEqual(alturas([0, 0]), [0, 0])
})
