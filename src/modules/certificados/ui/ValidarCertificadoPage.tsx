import React from 'react'
import { BadgeCheck, FileSearch, Keyboard } from 'lucide-react'
import { FormValidarCertificado } from './FormValidarCertificado'

const PASSOS = [
  {
    icone: FileSearch,
    titulo: 'Ache o código no certificado',
    texto:
      'Fica no canhoto do certificado, logo abaixo da data, ou no rodapé, no modelo clássico.',
  },
  {
    icone: Keyboard,
    titulo: 'Digite o código',
    texto:
      'Copie o código para o campo acima, sem espaços. O endereço desta consulta também vem impresso no certificado.',
  },
  {
    icone: BadgeCheck,
    titulo: 'Confira os dados',
    texto:
      'Se o código existir, você vê o nome, o evento, a data e a carga horária registrados pela Fatec.',
  },
] as const

/** Página pública para conferir a autenticidade de um certificado pelo código. */
export const ValidarCertificadoPage: React.FC = () => (
  <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
    <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl">
      Validar certificado
    </h1>
    <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
      Recebeu um certificado de evento da Fatec emitido pelo Muttley? Digite o
      código de validação para confirmar que ele é verdadeiro. Não precisa de
      conta.
    </p>

    <FormValidarCertificado className="mt-8" />

    <h2 className="mt-14 font-display text-2xl font-bold">Como conferir</h2>
    <ol className="mt-6 flex flex-col gap-6">
      {PASSOS.map(({ icone: Icone, titulo, texto }) => (
        <li key={titulo} className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]">
            <Icone className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block font-display text-lg font-bold">
              {titulo}
            </span>
            <span className="mt-1 block text-[var(--color-text-secondary)]">
              {texto}
            </span>
          </span>
        </li>
      ))}
    </ol>

    <p className="mt-14 rounded-md bg-[var(--color-bg-surface)] p-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
      Se o código não for encontrado, confira se foi digitado sem espaços. Um
      certificado sem registro aqui não foi emitido pelo Muttley.
    </p>
  </div>
)
