import React, { useId, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { PessoaOption } from '../domain/adminEventoTypes'
import { buscarPessoas } from '../domain/formularioEvento'

/**
 * Escolha de um ou mais palestrantes entre as pessoas cadastradas: digita,
 * escolhe na lista (mouse ou setas + Enter) e cada escolhido vira uma etiqueta
 * removível. Combobox no padrão da ARIA, com a opção ativa anunciada.
 */
export const SeletorPalestrantes: React.FC<{
  id: string
  pessoas: PessoaOption[]
  selecionados: PessoaOption[]
  onChange: (pessoas: PessoaOption[]) => void
  descricaoId?: string
}> = ({ id, pessoas, selecionados, onChange, descricaoId }) => {
  const idLista = useId()
  const [termo, setTermo] = useState('')
  const [ativo, setAtivo] = useState(0)
  const [aberto, setAberto] = useState(false)

  const escolhidos = useMemo(
    () => new Set(selecionados.map((p) => p.id)),
    [selecionados]
  )
  const sugestoes = useMemo(
    () => buscarPessoas(pessoas, termo, escolhidos),
    [pessoas, termo, escolhidos]
  )
  const mostrarLista = aberto && termo.trim() !== ''

  const adicionar = (pessoa: PessoaOption) => {
    onChange([...selecionados, pessoa])
    setTermo('')
    setAtivo(0)
  }

  const teclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && sugestoes.length) {
      e.preventDefault()
      setAberto(true)
      setAtivo((a) => (a + 1) % sugestoes.length)
    } else if (e.key === 'ArrowUp' && sugestoes.length) {
      e.preventDefault()
      setAtivo((a) => (a - 1 + sugestoes.length) % sugestoes.length)
    } else if (e.key === 'Enter' && mostrarLista && sugestoes[ativo]) {
      // Enter escolhe a pessoa em vez de enviar o formulário.
      e.preventDefault()
      adicionar(sugestoes[ativo])
    } else if (e.key === 'Escape' && mostrarLista) {
      e.preventDefault()
      setAberto(false)
    } else if (e.key === 'Backspace' && !termo && selecionados.length) {
      onChange(selecionados.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {selecionados.length > 0 && (
        <ul
          aria-label="Palestrantes escolhidos"
          className="flex flex-wrap gap-2"
        >
          {selecionados.map((p) => (
            <li
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-subtle)] py-1 pr-1 pl-3 text-sm font-semibold text-[var(--color-primary-text)]"
            >
              {p.nome}
              <button
                type="button"
                onClick={() =>
                  onChange(selecionados.filter((s) => s.id !== p.id))
                }
                aria-label={`Remover ${p.nome} dos palestrantes`}
                className="grid size-6 place-items-center rounded-full hover:bg-[var(--color-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={
            mostrarLista && sugestoes[ativo]
              ? `${idLista}-${sugestoes[ativo].id}`
              : undefined
          }
          aria-describedby={descricaoId}
          autoComplete="off"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value)
            setAtivo(0)
            setAberto(true)
          }}
          onFocus={() => setAberto(true)}
          // Fecha depois do clique numa sugestão, que acontece no mousedown.
          onBlur={() => setAberto(false)}
          onKeyDown={teclar}
          placeholder="Buscar pessoa pelo nome ou e-mail"
          className="min-h-[44px] w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:outline-none"
        />
        {mostrarLista && (
          <ul
            id={idLista}
            role="listbox"
            aria-label="Pessoas encontradas"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-1 shadow-lg"
          >
            {sugestoes.length === 0 ? (
              <li className="px-3.5 py-2.5 text-sm text-[var(--color-text-secondary)]">
                Ninguém com esse nome. Cadastre a pessoa em Pessoas e volte
                aqui.
              </li>
            ) : (
              sugestoes.map((p, i) => (
                <li
                  key={p.id}
                  id={`${idLista}-${p.id}`}
                  role="option"
                  aria-selected={i === ativo}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    adicionar(p)
                  }}
                  onMouseEnter={() => setAtivo(i)}
                  className={`cursor-pointer px-3.5 py-2 text-sm ${i === ativo ? 'bg-[var(--color-bg-hover)]' : ''}`}
                >
                  <span className="block font-semibold">{p.nome}</span>
                  {p.email && (
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {p.email}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
