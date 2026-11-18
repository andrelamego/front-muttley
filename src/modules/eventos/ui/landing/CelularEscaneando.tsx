import React from 'react'
import { m, useTransform, type MotionValue } from 'motion/react'
import { Check, QrCode } from 'lucide-react'

/**
 * Celular com a câmera aberta lendo o QR Code do telão. varredura (0 → 1) desce a
 * linha de leitura; confirmado (0 → 1) mostra a presença confirmada na tela.
 */
export const CelularEscaneando: React.FC<{
  varredura: MotionValue<number>
  confirmado: MotionValue<number>
}> = ({ varredura, confirmado }) => {
  const linhaY = useTransform(varredura, (v) => `${v * 100}%`)
  const enquadramento = useTransform(confirmado, (v) => 1 - v * 0.6)

  return (
    <div className="relative h-44 w-24 rounded-[1.4rem] bg-[#0e1330] p-1.5 shadow-[0_24px_48px_-16px_rgb(14_19_48/0.6)] ring-1 ring-white/10 sm:h-52 sm:w-28">
      {/* Câmera frontal */}
      <span className="absolute top-2 left-1/2 z-10 h-1.5 w-8 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full overflow-hidden rounded-[1.05rem] bg-[#1b2140]">
        {/* Visor da câmera com o QR enquadrado */}
        <m.div
          className="absolute inset-x-3 top-1/2 aspect-square -translate-y-1/2"
          style={{ opacity: enquadramento }}
        >
          <div className="absolute inset-1.5 grid place-items-center rounded-sm bg-white">
            <QrCode
              className="size-full p-1 text-[#0e1330]"
              strokeWidth={1.6}
            />
          </div>
          {/* Marcas de enquadramento nos cantos */}
          <span className="absolute top-0 left-0 size-3 rounded-tl-sm border-t-2 border-l-2 border-[#ffd93b]" />
          <span className="absolute top-0 right-0 size-3 rounded-tr-sm border-t-2 border-r-2 border-[#ffd93b]" />
          <span className="absolute bottom-0 left-0 size-3 rounded-bl-sm border-b-2 border-l-2 border-[#ffd93b]" />
          <span className="absolute right-0 bottom-0 size-3 rounded-br-sm border-r-2 border-b-2 border-[#ffd93b]" />
          {/* Linha de leitura */}
          <m.span
            className="absolute inset-x-0.5 h-0.5 rounded-full bg-[#ffd93b] shadow-[0_0_10px_2px_rgb(255_217_59/0.7)]"
            style={{ top: linhaY }}
          />
        </m.div>
        {/* Confirmação */}
        <m.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#1b2140]/85 px-1 text-center"
          style={{ opacity: confirmado }}
        >
          <span className="grid size-9 place-items-center rounded-full bg-[#1f9d55] text-white">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <span className="text-[10px] leading-tight font-bold text-white">
            Presença confirmada
          </span>
        </m.div>
      </div>
    </div>
  )
}
