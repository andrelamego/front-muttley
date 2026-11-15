import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../../../shared/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../shared/ui/shadcn/dialog'
import { NOME_NIVEL, unidade, type Conquistas } from '../domain/conquistas'
import {
  medalhasConquistadas,
  medalhasNovas,
  type MedalhaNova,
} from '../domain/medalhasNovas'
import { MoedaTrilha } from './MoedaTrilha'
import { MedalhaEspecial } from './MedalhaEspecial'

// Lista do que a pessoa já viu, por aparelho. É só o momento de comemoração:
// perder o registro nunca esconde uma medalha, que continua na página.
const chaveVistas = (idPessoa: string | number) =>
  `muttley:medalhas-vistas:${idPessoa}`

const lerVistas = (idPessoa: string | number): string[] | null => {
  try {
    const bruto = localStorage.getItem(chaveVistas(idPessoa))
    return bruto ? (JSON.parse(bruto) as string[]) : null
  } catch {
    return null
  }
}

const gravarVistas = (idPessoa: string | number, chaves: string[]) => {
  try {
    localStorage.setItem(chaveVistas(idPessoa), JSON.stringify(chaves))
  } catch {
    // Sem armazenamento (aba privada), a revelação só não se lembra.
  }
}

const textos = (m: MedalhaNova) =>
  m.tipo === 'trilha'
    ? {
        titulo: `Medalha de ${NOME_NIVEL[m.trilha.nivel!].toLowerCase()} em ${m.trilha.titulo}`,
        descricao: `Você chegou a ${unidade(m.trilha, m.trilha.valor)}.`,
      }
    : { titulo: m.especial.titulo, descricao: m.especial.descricao }

/** A moeda entra girando, um brilho atravessa e, nas especiais, raios giram atrás. */
const Moeda: React.FC<{ medalha: MedalhaNova }> = ({ medalha }) => {
  const reduzido = useReducedMotion()
  const especial = medalha.tipo === 'especial'
  return (
    <div className="relative grid size-44 place-items-center">
      {especial && !reduzido && (
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-60 [background:repeating-conic-gradient(var(--color-signal)_0deg_5deg,transparent_5deg_20deg)] [mask:radial-gradient(closest-side,transparent_42%,#000_55%,transparent_100%)]"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.6, rotate: 360 }}
          transition={{
            opacity: { delay: 0.5, duration: 0.6 },
            rotate: { duration: 24, ease: 'linear', repeat: Infinity },
          }}
        />
      )}
      <motion.div
        className="relative overflow-hidden rounded-full"
        style={{ transformPerspective: 600 }}
        initial={reduzido ? false : { rotateY: 180, scale: 0.6, opacity: 0 }}
        animate={{ rotateY: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      >
        {medalha.tipo === 'trilha' ? (
          <MoedaTrilha trilha={medalha.trilha} tamanho={120} semAnel />
        ) : (
          <MedalhaEspecial especial={medalha.especial} tamanho={120} />
        )}
        {!reduzido && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 [background:linear-gradient(105deg,transparent_38%,rgb(255_255_255/0.75)_50%,transparent_62%)]"
            initial={{ x: '-130%' }}
            animate={{ x: '130%' }}
            transition={{ delay: 0.7, duration: 0.7, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  )
}

/**
 * Comemora as medalhas conquistadas desde a última visita, uma de cada vez.
 * Fechar o diálogo marca todas como vistas.
 */
export const RevelacaoMedalha: React.FC<{
  conquistas: Conquistas
  idPessoa: string | number
}> = ({ conquistas, idPessoa }) => {
  const conquistadas = medalhasConquistadas(conquistas)
  const [fila, setFila] = useState(() =>
    medalhasNovas(conquistadas, lerVistas(idPessoa))
  )
  const [indice, setIndice] = useState(0)
  const reduzido = useReducedMotion()

  // Primeira visita: guarda o que já existe para só comemorar o que vier depois.
  useEffect(() => {
    if (lerVistas(idPessoa) === null)
      gravarVistas(
        idPessoa,
        medalhasConquistadas(conquistas).map((m) => m.chave)
      )
  }, [conquistas, idPessoa])

  const fechar = () => {
    gravarVistas(
      idPessoa,
      conquistadas.map((m) => m.chave)
    )
    setFila([])
  }

  const atual = fila[indice]
  if (!atual) return null
  const { titulo, descricao } = textos(atual)
  const ultima = indice === fila.length - 1

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && fechar()}>
      <DialogContent className="flex flex-col items-center gap-4 text-center sm:max-w-sm">
        <p className="text-sm font-semibold text-[var(--color-primary-text)]">
          {fila.length > 1
            ? `Medalha nova · ${indice + 1} de ${fila.length}`
            : 'Medalha nova'}
        </p>
        {/* key: cada medalha remonta e anima do começo */}
        <Moeda key={atual.chave} medalha={atual} />
        <motion.div
          key={`${atual.chave}-texto`}
          className="flex flex-col gap-1"
          initial={reduzido ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3, ease: 'easeOut' }}
        >
          <DialogTitle className="font-display text-2xl font-bold leading-tight">
            {titulo}
          </DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </motion.div>
        <Button
          className="mt-2 w-full"
          onClick={() => (ultima ? fechar() : setIndice(indice + 1))}
        >
          {ultima ? 'Continuar' : 'Próxima medalha'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
