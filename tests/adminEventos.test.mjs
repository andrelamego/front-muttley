import test from 'node:test'
import assert from 'node:assert/strict'

function validateEventTime(horarioInicio, horarioFim) {
  if (!horarioInicio || !horarioFim) {
    return { valid: false, error: 'Horários obrigatórios' }
  }
  if (horarioInicio >= horarioFim) {
    return {
      valid: false,
      error: 'O horário de término deve ser posterior ao horário de início.',
    }
  }
  return { valid: true }
}

function calculateSelectedPresents(currentPresents, toggleId) {
  if (currentPresents.includes(toggleId)) {
    return currentPresents.filter((id) => id !== toggleId)
  }
  return [...currentPresents, toggleId]
}

function calculateSelectAllPresents(currentPresents, allVisibleIds, selectAll) {
  if (selectAll) {
    const set = new Set([...currentPresents, ...allVisibleIds])
    return Array.from(set)
  }
  return currentPresents.filter((id) => !allVisibleIds.includes(id))
}

test('validateEventTime rejeita quando horário de início for posterior ao de fim', () => {
  const result = validateEventTime('19:00', '18:00')
  assert.strictEqual(result.valid, false)
  assert.strictEqual(
    result.error,
    'O horário de término deve ser posterior ao horário de início.'
  )
})

test('validateEventTime rejeita quando horários forem idênticos', () => {
  const result = validateEventTime('14:00', '14:00')
  assert.strictEqual(result.valid, false)
})

test('validateEventTime aceita horários coerentes', () => {
  const result = validateEventTime('09:00', '12:30')
  assert.strictEqual(result.valid, true)
})

test('calculateSelectedPresents alterna presença individual corretamente', () => {
  let presents = [101, 102]

  // Adiciona 103
  presents = calculateSelectedPresents(presents, 103)
  assert.deepStrictEqual(presents, [101, 102, 103])

  // Remove 102
  presents = calculateSelectedPresents(presents, 102)
  assert.deepStrictEqual(presents, [101, 103])
})

test('calculateSelectAllPresents marca e desmarca conjunto visível sem duplicidade', () => {
  const current = [101, 105]
  const visible = [101, 102, 103]

  // Marcar todos visíveis
  const allSelected = calculateSelectAllPresents(current, visible, true)
  assert.deepStrictEqual(allSelected.sort(), [101, 102, 103, 105].sort())

  // Desmarcar todos visíveis
  const deselectVisible = calculateSelectAllPresents(allSelected, visible, false)
  assert.deepStrictEqual(deselectVisible, [105])
})
