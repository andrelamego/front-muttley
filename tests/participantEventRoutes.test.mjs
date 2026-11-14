import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildEventPath,
  buildPresencePath,
  PARTICIPANT_EVENTS_PATH,
} from '../src/modules/eventos/domain/eventRoutes.ts'

test('exploração autenticada permanece sob o painel do participante', () => {
  assert.equal(PARTICIPANT_EVENTS_PATH, '/user/eventos')
  assert.equal(buildEventPath(PARTICIPANT_EVENTS_PATH, 42), '/user/eventos/42')
  assert.equal(
    buildPresencePath(PARTICIPANT_EVENTS_PATH, 42),
    '/user/eventos/42/confirmar-presenca'
  )
})
