import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../shared/ui'

interface CarrosselEventosProps {
  titulo: string
  descricao?: string
  children: React.ReactNode
}

/**
 * Prateleira com rolagem horizontal nativa: o dedo arrasta com a física do
 * navegador e o encaixe para no início de cada ingresso. No desktop, as setas
 * avançam uma tela por vez e somem quando não há para onde ir.
 */
export const CarrosselEventos: React.FC<CarrosselEventosProps> = ({
  titulo,
  descricao,
  children,
}) => {
  const idTitulo = useId()
  const trilho = useRef<HTMLUListElement>(null)
  const [limites, setLimites] = useState({ inicio: true, fim: true })

  const medir = useCallback(() => {
    const el = trilho.current
    if (!el) return
    // 2px de folga: o arredondamento de subpixel deixa sobras no fim da rolagem.
    setLimites({
      inicio: el.scrollLeft <= 2,
      fim: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    })
  }, [])

  useEffect(() => {
    const el = trilho.current
    if (!el) return
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [medir, children])

  const rolar = (sentido: 1 | -1) => {
    const el = trilho.current
    if (!el) return
    const reduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    el.scrollBy({
      left: sentido * el.clientWidth * 0.9,
      behavior: reduzido ? 'auto' : 'smooth',
    })
  }

  const rolavel = !(limites.inicio && limites.fim)

  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            id={idTitulo}
            className="font-display text-xl font-bold text-[var(--color-text-primary)]"
          >
            {titulo}
          </h2>
          {descricao && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {descricao}
            </p>
          )}
        </div>
        {rolavel && (
          <div className="hidden shrink-0 gap-2 sm:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => rolar(-1)}
              disabled={limites.inicio}
              aria-label={`Voltar em ${titulo}`}
              className="size-9 p-0"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rolar(1)}
              disabled={limites.fim}
              aria-label={`Avançar em ${titulo}`}
              className="size-9 p-0"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
      {/* No celular o trilho encosta nas bordas e o próximo ingresso aparece pela metade, sinalizando que dá para arrastar. */}
      <ul
        ref={trilho}
        onScroll={medir}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:gap-5 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {React.Children.map(children, (filho) => (
          <li className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
            {filho}
          </li>
        ))}
      </ul>
    </section>
  )
}
