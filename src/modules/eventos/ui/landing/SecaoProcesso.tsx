import React, { useRef, useState } from 'react'
import {
  m,
  transform,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Award, Medal, QrCode, Ticket as TicketIcone } from 'lucide-react'
import { IngressoDestacavel } from './IngressoDestacavel'
import { CelularEscaneando } from './CelularEscaneando'
// Arquivos importados direto: o índice de medalhas depende do módulo de eventos.
import { MoedaTrilha } from '../../../medalhas/ui/MoedaTrilha'
import type { Trilha } from '../../../medalhas/domain/conquistas'
import { MiniaturaCertificado } from './SecaoCertificado'

const PASSOS = [
  {
    icone: TicketIcone,
    titulo: 'Inscreva-se',
    texto:
      'Escolha uma palestra ou oficina e garanta a vaga. O ingresso fica no seu painel, com o número da inscrição.',
  },
  {
    icone: QrCode,
    titulo: 'Confirme a presença',
    texto:
      'No dia, aponte a câmera para o QR Code do telão, de 10 minutos antes até 10 minutos depois do fim.',
  },
  {
    icone: Award,
    titulo: 'Receba o certificado',
    texto:
      'Quando a coordenação conclui o evento, o certificado sai com um código que qualquer pessoa pode validar.',
  },
  {
    icone: Medal,
    titulo: 'Ganhe medalhas',
    texto:
      'Cada presença conta para as suas trilhas. Ao bater um marco, a medalha sobe de bronze para prata e para ouro.',
  },
] as const

// Exemplo ilustrativo: a primeira medalha de quem acabou de participar.
const MOEDA_BRONZE: Trilha = {
  chave: 'geral',
  titulo: 'Participação',
  metrica: 'PRESENCAS',
  valor: 1,
  nivel: 'BRONZE',
  proximoNivel: 'PRATA',
  proximoMarco: 10,
  marcos: [1, 10, 25],
}

/**
 * Mapeia o progresso da rolagem para um valor. A forma de função tira a motion do
 * modo acelerado por ViewTimeline, que nesta seção calculava os intervalos errado.
 */
const useFaixa = (p: MotionValue<number>, entrada: number[], saida: number[]) =>
  useTransform(p, (v) => transform(v, entrada, saida))

/** Versão parada, para quem prefere menos movimento: os quatro passos em lista. */
const ProcessoParado: React.FC = () => (
  <section
    id="fluxo-academico"
    aria-labelledby="processo-titulo"
    className="scroll-mt-20 py-20 lg:py-28"
  >
    <h2
      id="processo-titulo"
      className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
    >
      Do ingresso à medalha
    </h2>
    <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {PASSOS.map(({ icone: Icone, titulo, texto }, i) => (
        <li key={titulo}>
          <span className="relative grid size-12 place-items-center rounded-full bg-[var(--color-primary)] text-white">
            <Icone className="size-5" aria-hidden />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold">
            {i + 1}. {titulo}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {texto}
          </p>
        </li>
      ))}
    </ol>
  </section>
)

/**
 * O caminho de quem participa, contado pela rolagem: o palco fica preso na tela
 * e cada trecho da rolagem avança um passo. Depende da posição, não do tempo.
 */
const ProcessoAnimado: React.FC = () => {
  const alvo = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({
    target: alvo,
    offset: ['start start', 'end end'],
  })
  const [passo, setPasso] = useState(0)
  useMotionValueEvent(p, 'change', (v) => {
    setPasso(Math.min(3, Math.floor(v * 4)))
  })

  // 1. o ingresso entra; quando o certificado chega, desce para abrir espaço
  const ingressoOpacidade = useFaixa(p, [0, 0.06], [0, 1])
  const ingressoY = useFaixa(p, [0, 0.06, 0.5, 0.62], [40, 0, 0, 120])
  // 2. o QR Code aparece; o celular entra, lê o código e confirma a presença
  const qrOpacidade = useFaixa(p, [0.22, 0.3, 0.5, 0.56], [0, 1, 1, 0])
  const qrX = useFaixa(p, [0.22, 0.3], [40, 0])
  const celularOpacidade = useFaixa(p, [0.28, 0.33, 0.5, 0.56], [0, 1, 1, 0])
  const celularY = useFaixa(p, [0.28, 0.34, 0.5, 0.56], [160, 0, 0, 120])
  const celularGiro = useFaixa(p, [0.28, 0.34], [-24, -10])
  const varredura = useFaixa(p, [0.34, 0.42], [0, 1])
  const confirmado = useFaixa(p, [0.42, 0.44], [0, 1])
  // ...e, com a presença confirmada, o canhoto se destaca, como na entrada de um evento
  const destaque = useFaixa(p, [0.42, 0.56], [0, 1])
  // 3. o certificado sobe por trás do ingresso
  const certOpacidade = useFaixa(p, [0.5, 0.58], [0, 1])
  const certY = useFaixa(p, [0.5, 0.62], [80, 0])
  // 4. a moeda gira e entra
  const moedaOpacidade = useFaixa(p, [0.75, 0.8], [0, 1])
  const moedaGiro = useFaixa(p, [0.75, 0.88], [180, 0])
  const moedaEscala = useFaixa(p, [0.75, 0.88], [0.4, 1])

  return (
    <section
      ref={alvo}
      id="fluxo-academico"
      aria-labelledby="processo-titulo"
      className="relative h-[400vh]"
    >
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2
              id="processo-titulo"
              className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
            >
              Do ingresso à medalha
            </h2>
            <ol className="mt-8 flex flex-col gap-5" aria-live="polite">
              {PASSOS.map(({ icone: Icone, titulo, texto }, i) => {
                const ativo = i === passo
                return (
                  <li
                    key={titulo}
                    aria-current={ativo ? 'step' : undefined}
                    className={`flex gap-4 transition-opacity duration-300 ${ativo ? 'opacity-100' : 'opacity-35 max-lg:hidden'}`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-300 ${ativo ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'}`}
                    >
                      <Icone className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-display text-xl font-bold">
                        {titulo}
                      </span>
                      <span
                        className={`mt-1 block leading-relaxed text-[var(--color-text-secondary)] ${ativo ? '' : 'lg:hidden'}`}
                      >
                        {texto}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
            {/* Progresso dos passos no celular, onde só o passo atual aparece */}
            <div className="mt-5 flex gap-1.5 lg:hidden" aria-hidden="true">
              {PASSOS.map((passoItem, i) => (
                <span
                  key={passoItem.titulo}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= passo ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-muted)]'}`}
                />
              ))}
            </div>
          </div>

          {/* Palco: decorativo, o texto ao lado já conta cada passo */}
          <div
            aria-hidden="true"
            className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]"
          >
            <m.div
              className="absolute inset-x-0 top-0 origin-top scale-90"
              style={{ opacity: certOpacidade, y: certY }}
            >
              <MiniaturaCertificado legenda={false} />
            </m.div>
            <m.div
              className="absolute inset-x-0 top-[30%] z-10"
              style={{ opacity: ingressoOpacidade, y: ingressoY }}
            >
              <IngressoDestacavel
                progresso={destaque}
                tema="Oficina de Git para Iniciantes"
                local="Laboratório de integração · Presencial"
                dia="16"
                mes="nov"
                horario="20h"
                numero={590}
              />
            </m.div>
            <m.div
              className="absolute -top-4 right-28 z-30 sm:right-32"
              style={{
                opacity: celularOpacidade,
                y: celularY,
                rotate: celularGiro,
              }}
            >
              <CelularEscaneando
                varredura={varredura}
                confirmado={confirmado}
              />
            </m.div>
            <m.div
              className="absolute top-0 right-0 z-20 rounded-md bg-white p-3 shadow-[0_20px_40px_-20px_rgb(14_19_48/0.5)]"
              style={{ opacity: qrOpacidade, x: qrX }}
            >
              <QrCode className="size-24 text-[#0e1330]" strokeWidth={1.4} />
            </m.div>
            <m.div
              className="absolute -top-8 -right-4 z-20"
              style={{
                opacity: moedaOpacidade,
                rotateY: moedaGiro,
                scale: moedaEscala,
                transformPerspective: 600,
              }}
            >
              <MoedaTrilha trilha={MOEDA_BRONZE} tamanho={112} semAnel />
            </m.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const SecaoProcesso: React.FC = () =>
  useReducedMotion() ? <ProcessoParado /> : <ProcessoAnimado />
