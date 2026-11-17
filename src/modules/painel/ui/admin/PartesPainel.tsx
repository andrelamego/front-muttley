import React, { useId } from 'react'
import { alturas } from '../../domain/painelAdmin'

/** Bloco do painel: superfície lisa com título e, opcional, uma ação à direita. */
export const Bloco: React.FC<{
  titulo: string
  descricao?: string
  acao?: React.ReactNode
  className?: string
  children: React.ReactNode
}> = ({ titulo, descricao, acao, className = '', children }) => {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={`rounded-md bg-[var(--color-bg-surface)] p-5 ${className}`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="font-display text-lg font-bold">
            {titulo}
          </h2>
          {descricao && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {descricao}
            </p>
          )}
        </div>
        {acao}
      </div>
      {children}
    </section>
  )
}

/** Número do semestre com o valor do semestre anterior para comparar. */
export const Indicador: React.FC<{
  rotulo: string
  valor: number
  anterior?: number
  semestreAnterior?: string
  sufixo?: string
}> = ({ rotulo, valor, anterior, semestreAnterior, sufixo = '' }) => {
  const diferenca = anterior === undefined ? 0 : valor - anterior
  return (
    <div className="rounded-md bg-[var(--color-bg-surface)] p-5">
      <p className="text-sm text-[var(--color-text-secondary)]">{rotulo}</p>
      <p className="mt-2 font-display text-4xl font-extrabold leading-none tabular-nums [font-variation-settings:'wdth'_75]">
        {valor.toLocaleString('pt-BR')}
        {sufixo}
      </p>
      {anterior !== undefined && semestreAnterior && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {diferenca !== 0 && (
            <span
              className={`font-semibold ${diferenca > 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}
            >
              {diferenca > 0 ? '▲' : '▼'}{' '}
              {Math.abs(diferenca).toLocaleString('pt-BR')}
              {sufixo === '%' ? ' p.p.' : ''}
            </span>
          )}{' '}
          {semestreAnterior}: {anterior.toLocaleString('pt-BR')}
          {sufixo}
        </p>
      )}
    </div>
  )
}

/** Barra horizontal de uma medida, com o texto do valor ao lado (a cor nunca carrega sozinha). */
export const Barra: React.FC<{
  rotulo: React.ReactNode
  valor: string
  percentual: number
  extra?: React.ReactNode
}> = ({ rotulo, valor, percentual, extra }) => (
  <li>
    <span className="flex items-baseline justify-between gap-3 text-sm">
      <span className="min-w-0 truncate">{rotulo}</span>
      <span className="flex shrink-0 items-center gap-2">
        {extra}
        <b className="tabular-nums">{valor}</b>
      </span>
    </span>
    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-[var(--color-primary-subtle)]">
      <span
        className="block h-full rounded-full bg-[var(--color-primary)]"
        style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }}
      />
    </span>
  </li>
)

/**
 * Gráfico de barras pequeno de uma série mensal. O valor aparece ao passar o
 * mouse ou focar a barra; a tabela escondida dá os números ao leitor de tela.
 */
export const GraficoMensal: React.FC<{
  titulo: string
  meses: { mes: string; rotulo: string; valor: number }[]
}> = ({ titulo, meses }) => {
  const h = alturas(meses.map((m) => m.valor))
  const total = meses.reduce((s, m) => s + m.valor, 0)
  return (
    <figure>
      <figcaption className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{titulo}</span>
        <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
          {total.toLocaleString('pt-BR')} em 6 meses
        </span>
      </figcaption>
      <div
        aria-hidden="true"
        className="mt-3 grid h-32 grid-cols-6 items-end gap-2 border-b border-[var(--color-border)]"
      >
        {meses.map((m, i) => (
          <div
            key={m.mes}
            className="group relative flex h-full items-end justify-center"
          >
            <span
              className="w-full max-w-9 rounded-t-[4px] bg-[var(--color-primary)] transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(h[i], m.valor > 0 ? 3 : 0)}%` }}
            />
            <span className="pointer-events-none absolute -top-7 rounded-sm bg-[var(--color-text-primary)] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-bg-surface)] opacity-0 tabular-nums transition-opacity group-hover:opacity-100">
              {m.valor}
            </span>
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="mt-1.5 grid grid-cols-6 gap-2 text-center text-xs text-[var(--color-text-muted)]"
      >
        {meses.map((m) => (
          <span key={m.mes}>{m.rotulo}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{titulo} por mês</caption>
        <tbody>
          {meses.map((m) => (
            <tr key={m.mes}>
              <th scope="row">{m.rotulo}</th>
              <td>{m.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
