import React from 'react'
import { m } from 'motion/react'
import { Award, QrCode, Search, Ticket as TicketIcone } from 'lucide-react'
import { Revelar } from './movimento'

const ETAPAS = [
  {
    icone: Search,
    titulo: 'Encontre um evento',
    texto:
      'Palestras, oficinas e workshops organizados por disciplina, com data, local e vagas.',
  },
  {
    icone: TicketIcone,
    titulo: 'Inscreva-se',
    texto:
      'A vaga é sua na hora. O ingresso fica no seu painel com o número da inscrição.',
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
      'Quando a coordenação conclui o evento, o certificado sai com código de validação.',
  },
] as const

/** As quatro etapas, ligadas por um picote que se desenha ao aparecer na tela. */
export const SecaoComoFunciona: React.FC = () => (
  <section
    id="fluxo-academico"
    aria-labelledby="fluxo-titulo"
    className="scroll-mt-20 py-20 lg:py-28"
  >
    <Revelar className="max-w-2xl">
      <h2
        id="fluxo-titulo"
        className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl"
      >
        Do ingresso ao certificado, em quatro passos
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
        Sem planilha, sem lista de papel e sem esperar alguém digitar seu nome
        num documento.
      </p>
    </Revelar>

    <div className="relative mt-14">
      {/* Picote ligando as etapas no desktop: revela da esquerda para a direita */}
      <m.div
        aria-hidden="true"
        className="absolute top-7 left-[12.5%] hidden w-3/4 border-t-2 border-dashed border-[var(--color-primary)] lg:block"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
      />
      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {ETAPAS.map(({ icone: Icone, titulo, texto }, i) => (
          <m.li
            key={titulo}
            className="relative flex flex-col items-start lg:items-center lg:text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.25 + i * 0.18,
            }}
          >
            <span className="relative grid size-14 place-items-center rounded-full bg-[var(--color-primary)] text-white ring-8 ring-[var(--color-bg-page)]">
              <Icone className="size-6" aria-hidden />
              <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-[var(--color-signal)] text-xs font-bold text-[var(--color-signal-ink)] tabular-nums">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-5 font-display text-xl font-bold">{titulo}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {texto}
            </p>
          </m.li>
        ))}
      </ol>
    </div>
  </section>
)
