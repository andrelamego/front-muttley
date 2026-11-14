import React, { useRef } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button, EditIcon, TrashIcon } from '../../../shared/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/ui/shadcn/dropdown-menu'

export interface AcoesRegistroProps {
  /** Id do botão, usado para devolver o foco quando o formulário ou a confirmação fecham. */
  id: string
  /** Ex.: "Ações de Ana Souza". */
  rotulo: string
  onEditar: () => void
  onExcluir: () => void
  /** Motivo para não oferecer a exclusão (ex.: a própria conta). */
  exclusaoBloqueada?: string
}

/** Menu "…" de uma linha ou cartão: editar e excluir. */
export const AcoesRegistro: React.FC<AcoesRegistroProps> = ({
  id,
  rotulo,
  onEditar,
  onExcluir,
  exclusaoBloqueada,
}) => {
  // Os itens abrem um painel ou diálogo; o menu não deve roubar o foco de volta ao fechar.
  const abrindoRef = useRef(false)
  const abrir = (acao: () => void) => () => {
    abrindoRef.current = true
    acao()
  }

  return (
    // modal={false}: o menu abre um dialog; sem isso o Radix trava o ponteiro da página
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          variant="ghost"
          size="sm"
          aria-label={rotulo}
          title="Mais ações"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onCloseAutoFocus={(e) => {
          if (abrindoRef.current) {
            e.preventDefault()
            abrindoRef.current = false
          }
        }}
      >
        <DropdownMenuItem onSelect={abrir(onEditar)}>
          <EditIcon size={16} />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={Boolean(exclusaoBloqueada)}
          title={exclusaoBloqueada}
          onSelect={abrir(onExcluir)}
        >
          <TrashIcon size={16} />
          {exclusaoBloqueada ?? 'Excluir'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
