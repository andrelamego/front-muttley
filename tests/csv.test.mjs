import test from 'node:test'
import assert from 'node:assert/strict'
import { paraCsv } from '../src/shared/lib/csv.ts'

test('gera CSV com ponto e vírgula e BOM para o Excel em português', () => {
  const csv = paraCsv([
    ['Nome', 'Presente'],
    ['Ana', 'Sim'],
  ])
  assert.equal(csv, '﻿Nome;Presente\r\nAna;Sim')
})

test('envolve em aspas valores com separador, aspas ou quebra de linha', () => {
  const csv = paraCsv([['Silva; Ana', 'diz "oi"', 'linha\nnova', null]])
  assert.equal(csv, '﻿"Silva; Ana";"diz ""oi""";"linha\nnova";')
})

test('neutraliza valores que o Excel executaria como fórmula', () => {
  assert.equal(paraCsv([['=1+1', '+55 11', '-x', '@a']]), "﻿'=1+1;'+55 11;'-x;'@a")
})
