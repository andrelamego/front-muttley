import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')

const readBlock = (selector) => {
  const start = css.indexOf(selector)
  assert.notEqual(start, -1, `bloco ${selector} ausente`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  const vars = {}
  for (const [, name, value] of css
    .slice(open + 1, close)
    .matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[name] = value.trim().toLowerCase()
  }
  return vars
}

const light = readBlock(':root {')
const dark = { ...light, ...readBlock(":root[data-theme='dark']") }

const luminance = (hex) => {
  const m = /^#([0-9a-f]{6})$/.exec(hex)
  assert.ok(m, `cor não é hex de 6 dígitos: ${hex}`)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const pares = [
  ['--color-text-primary', '--color-bg-surface'],
  ['--color-text-secondary', '--color-bg-surface'],
  ['--color-text-muted', '--color-bg-surface'],
  ['--color-text-muted', '--color-bg-page'],
  ['--color-primary-contrast', '--color-primary'],
  ['--color-primary-text', '--color-bg-surface'],
  ['--color-signal-ink', '--color-signal'],
  ['--color-success-text', '--color-success-bg'],
  ['--color-danger-text', '--color-danger-bg'],
  ['--color-warning-text', '--color-warning-bg'],
]

const checkPairs = (tokens) => {
  for (const [fg, bg] of pares) {
    const ratio = contrast(tokens[fg], tokens[bg])
    assert.ok(ratio >= 4.5, `${fg} sobre ${bg}: ${ratio.toFixed(2)}:1`)
  }
}

test('tema claro: pares de texto passam AA', () => checkPairs(light))

test('tema escuro: pares de texto passam AA', () => checkPairs(dark))

test('valores-chave do tema claro seguem a identidade Ingresso', () => {
  assert.equal(light['--color-primary'], '#2236e0')
  assert.equal(light['--color-signal'], '#ffd93b')
  assert.equal(light['--color-text-primary'], '#0e1330')
  assert.equal(light['--color-bg-page'], '#eef0f6')
  assert.equal(light['--radius-sm'], '10px')
  assert.equal(light['--radius-md'], '14px')
  assert.equal(light['--radius-lg'], '18px')
})
