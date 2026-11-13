import React, { useEffect, useState } from 'react'
import {
  getEventQrCodeConfirmacaoBlobApi,
  getEventQrCodeInscricaoBlobApi,
  parseBlobErrorMessage,
} from '../api/adminEventosApi'
import type { AdminEvento } from '../domain/adminEventoTypes'
import { Button, DownloadIcon, SkeletonBlock } from '../../../shared/ui'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/shadcn/dialog'
import { formatDateSafe } from '../../eventos'

type EstadoQr =
  | { status: 'carregando' }
  | { status: 'pronto'; url: string }
  | { status: 'erro'; mensagem: string }

/** Um QR Code: carrega ao montar e libera a imagem ao desmontar. Remontar (key) tenta de novo. */
const PainelQr: React.FC<{
  eventoId: number
  tema: string
  titulo: string
  descricao: string
  carregar: (id: number) => Promise<Blob>
  mensagemErro: string
  nomeArquivo: string
  onTentarDeNovo: () => void
}> = ({
  eventoId,
  tema,
  titulo,
  descricao,
  carregar,
  mensagemErro,
  nomeArquivo,
  onTentarDeNovo,
}) => {
  const [estado, setEstado] = useState<EstadoQr>({ status: 'carregando' })

  useEffect(() => {
    let ativo = true
    let url: string | null = null
    carregar(eventoId)
      .then((blob) => {
        if (!ativo) return
        url = URL.createObjectURL(blob)
        setEstado({ status: 'pronto', url })
      })
      .catch(async (err: unknown) => {
        const mensagem = await parseBlobErrorMessage(err, mensagemErro)
        if (ativo) setEstado({ status: 'erro', mensagem })
      })
    return () => {
      ativo = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [carregar, eventoId, mensagemErro])

  return (
    <div className="flex flex-col items-center gap-3 rounded-md bg-[var(--color-bg-subtle)] p-5 text-center min-h-[320px]">
      <div>
        <span className="block text-sm font-semibold">{titulo}</span>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {descricao}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {estado.status === 'carregando' && (
          <SkeletonBlock className="h-40 w-40" aria-label="Gerando QR Code" />
        )}
        {estado.status === 'erro' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-[var(--color-danger-text)]">
              {estado.mensagem}
            </p>
            <Button variant="outline" size="sm" onClick={onTentarDeNovo}>
              Tentar novamente
            </Button>
          </div>
        )}
        {estado.status === 'pronto' && (
          <img
            src={estado.url}
            alt={`${titulo}: QR Code do evento ${tema}`}
            className="h-40 w-40 rounded-md bg-white p-2 object-contain"
          />
        )}
      </div>

      {estado.status === 'pronto' && (
        <a href={estado.url} download={nomeArquivo} className="w-full">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<DownloadIcon size={14} />}
          >
            Baixar PNG
          </Button>
        </a>
      )}
    </div>
  )
}

export interface EventoQrDialogProps {
  /** Evento cujos QR Codes aparecem; null fecha o dialog. */
  evento: AdminEvento | null
  onClose: () => void
  /** Elemento que recebe o foco ao fechar (ex.: o botão que abriu o dialog). */
  focoAoFechar?: () => HTMLElement | null
}

export const EventoQrDialog: React.FC<EventoQrDialogProps> = ({
  evento,
  onClose,
  focoAoFechar,
}) => {
  const [tentativas, setTentativas] = useState({ inscricao: 0, presenca: 0 })

  return (
    <Dialog
      open={evento !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose()
      }}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onCloseAutoFocus={(e) => {
          const alvo = focoAoFechar?.()
          if (alvo) {
            e.preventDefault()
            alvo.focus()
          }
        }}
      >
        {evento && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                QR Codes do evento
              </DialogTitle>
              <DialogDescription className="line-clamp-1">
                {evento.tema} · {formatDateSafe(evento.data)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <PainelQr
                key={`inscricao-${evento.id}-${tentativas.inscricao}`}
                eventoId={evento.id}
                tema={evento.tema}
                titulo="Inscrição"
                descricao="Abre a página de inscrição do evento"
                carregar={getEventQrCodeInscricaoBlobApi}
                mensagemErro="Não foi possível gerar o QR Code de inscrição."
                nomeArquivo={`qrcode-inscricao-evento-${evento.id}.png`}
                onTentarDeNovo={() =>
                  setTentativas((t) => ({ ...t, inscricao: t.inscricao + 1 }))
                }
              />
              <PainelQr
                key={`presenca-${evento.id}-${tentativas.presenca}`}
                eventoId={evento.id}
                tema={evento.tema}
                titulo="Confirmar presença"
                descricao="Para ler com a câmera no local do evento"
                carregar={getEventQrCodeConfirmacaoBlobApi}
                mensagemErro="Não foi possível gerar o QR Code de presença."
                nomeArquivo={`qrcode-presenca-evento-${evento.id}.png`}
                onTentarDeNovo={() =>
                  setTentativas((t) => ({ ...t, presenca: t.presenca + 1 }))
                }
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
