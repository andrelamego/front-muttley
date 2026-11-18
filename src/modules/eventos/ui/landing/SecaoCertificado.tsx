import React from 'react'
// Arquivo importado direto: o índice de certificados depende do módulo de eventos.
import { FormValidarCertificado } from '../../../certificados/ui/FormValidarCertificado'
import { Revelar } from './movimento'

/** Miniatura do certificado no leiaute Ingresso, o mesmo do PDF emitido. */
export const MiniaturaCertificado: React.FC<{ legenda?: boolean }> = ({
  legenda = true,
}) => (
  <figure className="relative">
    <div className="flex overflow-hidden rounded-md bg-white text-[#0e1330] shadow-[0_30px_60px_-30px_rgb(14_19_48/0.45)] -rotate-2">
      <div className="flex-1 p-6 sm:p-8">
        <p className="text-xs font-bold text-[#2236e0]">Fatec</p>
        <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.12em] text-[#2236e0]">
          Certificado de participação
        </p>
        <p className="mt-3 text-xs text-[#5a5f7a]">Conferido a</p>
        <p className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
          Seu nome aqui
        </p>
        <span className="mt-3 block h-1 w-12 rounded-full bg-[#ffd93b]" />
        <p className="mt-3 text-xs leading-relaxed text-[#3a3f5c]">
          Participou como <strong>participante</strong> do evento{' '}
          <strong>Oficina de Git para Iniciantes</strong>, com carga horária de{' '}
          <strong>2 horas</strong>.
        </p>
        <div className="mt-6 w-32 border-t border-[#0e1330]/40 pt-1 text-[10px] text-[#5a5f7a]">
          Coordenação do curso
        </div>
      </div>
      <div className="relative flex w-24 flex-col items-center bg-[#2236e0] px-2 py-6 text-white sm:w-28">
        <span className="absolute -left-2.5 top-1/3 size-5 rounded-full bg-white" />
        <span className="font-display text-4xl font-extrabold leading-none">
          16
        </span>
        <span className="mt-1 text-xs font-bold">NOV 2026</span>
        <span className="mt-auto break-all text-center font-mono text-[9px] leading-snug opacity-85">
          8f166ceb-1c2d
        </span>
      </div>
    </div>
    {legenda && (
      <figcaption className="mt-5 text-center text-xs text-[var(--color-text-muted)]">
        Exemplo de certificado no leiaute Ingresso
      </figcaption>
    )}
  </figure>
)

export const SecaoCertificado: React.FC = () => {
  return (
    <section
      id="validar"
      aria-labelledby="certificado-titulo"
      className="scroll-mt-20 py-20 lg:py-28"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Revelar className="order-2 lg:order-1">
          <MiniaturaCertificado />
        </Revelar>
        <Revelar className="order-1 lg:order-2" atraso={0.1}>
          <h2
            id="certificado-titulo"
            className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl"
          >
            Um certificado que qualquer pessoa confere
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
            Cada certificado tem um código. Quem recebe o documento, como a
            secretaria ou uma empresa, digita o código aqui e vê se ele é
            verdadeiro, sem precisar de conta.
          </p>
          <FormValidarCertificado className="mt-8" />
        </Revelar>
      </div>
    </section>
  )
}
