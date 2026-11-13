import { ToggleGroup, ToggleGroupItem } from './shadcn/toggle-group'

export interface OpcaoFiltro<T extends string> {
  valor: T
  rotulo: string
  /** Quantidade mostrada ao lado do rótulo, quando fizer sentido. */
  total?: number
}

export interface FiltroSegmentadoProps<T extends string> {
  rotulo: string
  valor: T
  opcoes: OpcaoFiltro<T>[]
  onChange: (valor: T) => void
  className?: string
}

/** Escolha única entre filtros (toggle-group do shadcn): setas navegam, sempre há um ativo. */
export function FiltroSegmentado<T extends string>({
  rotulo,
  valor,
  opcoes,
  onChange,
  className = '',
}: FiltroSegmentadoProps<T>) {
  return (
    <ToggleGroup
      type="single"
      aria-label={rotulo}
      value={valor}
      // O Radix devolve '' ao clicar no item ativo; o filtro mantém a escolha.
      onValueChange={(v) => v && onChange(v as T)}
      className={`flex flex-wrap gap-1 rounded-md bg-[var(--color-bg-subtle)] p-1 ${className}`}
    >
      {opcoes.map((op) => (
        <ToggleGroupItem
          key={op.valor}
          value={op.valor}
          className="h-9 rounded-sm px-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] data-[state=on]:bg-[var(--color-bg-surface)] data-[state=on]:text-[var(--color-primary-text)] data-[state=on]:shadow-sm"
        >
          {op.rotulo}
          {op.total !== undefined && (
            <span className="tabular-nums text-xs opacity-70">{op.total}</span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
