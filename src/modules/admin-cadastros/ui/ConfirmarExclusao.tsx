import React, { useState } from 'react'
import { HttpError } from '../../../shared/http'
import { toast } from '../../../shared/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/ui/shadcn/alert-dialog'

export interface ConfirmarExclusaoProps {
  /** Nome do que será excluído; null mantém o diálogo fechado. */
  nome: string | null
  tipo: string
  onFechar: () => void
  onExcluir: () => Promise<void>
  /** Id do elemento que recebe o foco ao fechar. */
  idRetorno?: string
}

/** Pergunta antes de excluir e explica o conflito quando o registro ainda está em uso. */
export const ConfirmarExclusao: React.FC<ConfirmarExclusaoProps> = ({
  nome,
  tipo,
  onFechar,
  onExcluir,
  idRetorno,
}) => {
  const [excluindo, setExcluindo] = useState(false)

  const excluir = async () => {
    setExcluindo(true)
    try {
      await onExcluir()
      toast.success(`${tipo[0].toUpperCase()}${tipo.slice(1)} excluído`)
      onFechar()
    } catch (err) {
      toast.error(
        err instanceof HttpError && err.status === 409
          ? `Não dá para excluir: este ${tipo} ainda está ligado a eventos, inscrições ou outros cadastros.`
          : err instanceof Error
            ? err.message
            : 'Não foi possível excluir.'
      )
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <AlertDialog
      open={nome !== null}
      onOpenChange={(aberto) => !aberto && !excluindo && onFechar()}
    >
      <AlertDialogContent
        onCloseAutoFocus={(e) => {
          // Aberto por estado, não por um Trigger: o Radix não sabe para onde devolver o foco.
          if (!idRetorno) return
          e.preventDefault()
          document.getElementById(idRetorno)?.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {tipo}?</AlertDialogTitle>
          <AlertDialogDescription>
            “{nome}” será removido de forma permanente. Essa ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={excluindo}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={excluindo}
            onClick={(e) => {
              e.preventDefault() // fecha só depois da resposta da API
              void excluir()
            }}
          >
            {excluindo ? 'Excluindo…' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
