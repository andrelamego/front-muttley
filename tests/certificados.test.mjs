import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLinkedInCertUrl } from '../src/modules/certificados/domain/certificadoTypes.ts'

test('buildLinkedInCertUrl gera link oficial de certificação do LinkedIn com parâmetros corretos', () => {
  const url = buildLinkedInCertUrl(
    'Semana de Tecnologia FATEC 2026',
    'uuid-cert-12345',
    '2026-05-15'
  )

  assert.ok(url.startsWith('https://www.linkedin.com/profile/add?'))
  assert.ok(url.includes('startTask=CERTIFICATION_NAME'))
  assert.ok(
    url.includes('name=Semana%20de%20Tecnologia%20FATEC%202026')
  )
  assert.ok(url.includes('organizationName=FATEC%20Zona%20Leste'))
  assert.ok(url.includes('certId=uuid-cert-12345'))
  assert.ok(url.includes('issueYear=2026'))
  assert.ok(url.includes('issueMonth=5'))
})

test('buildLinkedInCertUrl funciona mesmo sem data de emissão informada', () => {
  const url = buildLinkedInCertUrl(
    'Palestra de Arquitetura de Software',
    'uuid-cert-99999',
    undefined
  )

  assert.ok(url.startsWith('https://www.linkedin.com/profile/add?'))
  assert.ok(
    url.includes('name=Palestra%20de%20Arquitetura%20de%20Software')
  )
  assert.ok(url.includes('certId=uuid-cert-99999'))
  assert.strictEqual(url.includes('issueYear='), false)
  assert.strictEqual(url.includes('issueMonth='), false)
})
