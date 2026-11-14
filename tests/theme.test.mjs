import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isTheme,
  resolveInitialTheme,
} from '../src/shared/theme/themePolicy.ts'

test('tema salvo tem prioridade sobre a preferência do sistema', () => {
  assert.equal(resolveInitialTheme('light', true), 'light')
  assert.equal(resolveInitialTheme('dark', false), 'dark')
})

test('preferência do sistema define o primeiro tema quando não há escolha salva', () => {
  assert.equal(resolveInitialTheme(null, true), 'dark')
  assert.equal(resolveInitialTheme(null, false), 'light')
})

test('valores inválidos salvos são ignorados com segurança', () => {
  assert.equal(isTheme('sepia'), false)
  assert.equal(resolveInitialTheme('sepia', true), 'dark')
})
