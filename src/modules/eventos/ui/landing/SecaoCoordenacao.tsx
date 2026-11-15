import React from 'react'
import { FileSignature, MonitorUp, ScanLine } from 'lucide-react'
import { Contador, Revelar } from './movimento'

const TAMANHO_QR = 21

/** Padrão de QR Code só para ilustrar: os três quadrados de canto e um miolo fixo. */
const CELULAS = (() => {
  const canto = (x: number, y: number) =>
    (x < 7 && y < 7) ||
    (x >= TAMANHO_QR - 7 && y < 7) ||
    (x < 7 && y >= TAMANHO_QR - 7)
  const celulas: [number, number][] = []
  for (let y = 0; y < TAMANHO_QR; y += 1)
    for (let x = 0; x < TAMANHO_QR; x += 1) {
      if (canto(x, y)) continue
      if ((x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0) celulas.push([x, y])
    }
  return celulas
})()

const QuadradoCanto: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    <rect x={x} y={y} width="7" height="7" fill="#0e1330" />
    <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
    <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0e1330" />
  </>
)

/** O telão do evento: QR Code da presença e o contador subindo. */
const Telao: React.FC = () => (
  <figure>
    <div className="rounded-md bg-[#0c1029] p-3 shadow-[0_30px_60px_-30px_rgb(14_19_48/0.6)]">
      <div className="grid grid-cols-[auto_1fr] items-center gap-6 rounded-sm bg-[#2236e0] p-6 text-white sm:p-8">
        <svg
          viewBox={`-1 -1 ${TAMANHO_QR + 2} ${TAMANHO_QR + 2}`}
          className="size-32 rounded-sm bg-white sm:size-40"
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          <QuadradoCanto x={0} y={0} />
          <QuadradoCanto x={TAMANHO_QR - 7} y={0} />
          <QuadradoCanto x={0} y={TAMANHO_QR - 7} />
          {CELULAS.map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill="#0e1330"
            />
          ))}
        </svg>
        <div>
          <p className="text-sm font-semibold opacity-80">
            Aponte a câmera para confirmar
          </p>
          <p className="mt-3 font-display text-6xl font-extrabold leading-none tabular-nums sm:text-7xl">
            <Contador ate={37} />
          </p>
          <p className="mt-1 text-sm opacity-80">presentes até agora</p>
          <span className="mt-4 inline-block rounded-full bg-[#ffd93b] px-3 py-1 text-xs font-bold text-[#0e1330]">
            Presença aberta
          </span>
        </div>
      </div>
    </div>
    <figcaption className="mt-5 text-center text-xs text-[var(--color-text-muted)]">
      Ilustração do modo telão
    </figcaption>
  </figure>
)

const RECURSOS = [
  {
    icone: MonitorUp,
    titulo: 'Modo telão',
    texto:
      'Projete o QR Code na sala e acompanhe as presenças chegando em tempo real.',
  },
  {
    icone: ScanLine,
    titulo: 'Presença sem lista de papel',
    texto:
      'Cada pessoa confirma pelo próprio celular, dentro da janela do horário do evento.',
  },
  {
    icone: FileSignature,
    titulo: 'Certificados de uma vez',
    texto:
      'Ao concluir o evento com a assinatura, os certificados saem para todos os presentes.',
  },
] as const

export const SecaoCoordenacao: React.FC = () => (
  <section aria-labelledby="coordenacao-titulo" className="py-20 lg:py-28">
    <div className="grid items-center gap-14 lg:grid-cols-2">
      <Revelar>
        <h2
          id="coordenacao-titulo"
          className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl"
        >
          Para quem organiza, o dia do evento fica simples
        </h2>
        <ul className="mt-8 flex flex-col gap-6">
          {RECURSOS.map(({ icone: Icone, titulo, texto }) => (
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
        </ul>
      </Revelar>
      <Revelar atraso={0.1}>
        <Telao />
      </Revelar>
    </div>
  </section>
)
