import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Maximize, Minimize, X } from 'lucide-react'
import {
  getAdminEventoByIdApi,
  getEventParticipationsApi,
  getEventQrCodeConfirmacaoBlobApi,
  parseBlobErrorMessage,
} from '../api/adminEventosApi'
import type { AdminEvento } from '../domain/adminEventoTypes'
import { situacaoPresenca, type FasePresenca } from '../domain/telao'
import { getPresenceWindow } from '../../eventos'
import { Logo, SkeletonBlock } from '../../../shared/ui'
import { cn } from '../../../shared/lib/utils'

const ATUALIZAR_PRESENCAS_MS = 15_000

const INSTRUCAO: Record<FasePresenca, string> = {
  aberta: 'Aponte a câmera do celular para o código e confirme sua presença.',
  antes: 'O código libera a confirmação quando a janela de presença abrir.',
  encerrada: 'A confirmação de presença deste evento já foi encerrada.',
  indisponivel:
    'A confirmação de presença não está disponível para este evento.',
}

const nomeDe = (valor?: { nome: string } | string | null) =>
  typeof valor === 'string' ? valor : (valor?.nome ?? null)

/** Relógio que avança a cada segundo. */
const useAgora = () => {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setAgora(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return agora
}

/** Pede ao navegador para não apagar a tela enquanto o telão está aberto. */
const useTelaSempreLigada = () => {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let trava: WakeLockSentinel | null = null
    const pedir = () => {
      if (document.visibilityState !== 'visible') return
      navigator.wakeLock
        .request('screen')
        .then((t) => (trava = t))
        .catch(() => {}) // sem permissão ou bateria baixa: o telão segue funcionando
    }
    pedir()
    document.addEventListener('visibilitychange', pedir)
    return () => {
      document.removeEventListener('visibilitychange', pedir)
      trava?.release().catch(() => {})
    }
  }, [])
}

const useTelaCheia = () => {
  const [ativa, setAtiva] = useState(() => Boolean(document.fullscreenElement))
  useEffect(() => {
    const sync = () => setAtiva(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  const alternar = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen().catch(() => {})
  }
  return { ativa, alternar }
}

type EstadoQr = { url: string } | { erro: string } | null

export const EventoTelaoPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const agora = useAgora()
  const telaCheia = useTelaCheia()
  useTelaSempreLigada()

  const [evento, setEvento] = useState<AdminEvento | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [presencas, setPresencas] = useState<{
    presentes: number
    inscritos: number
  } | null>(null)
  const [qr, setQr] = useState<EstadoQr>(null)
  const [tentativaQr, setTentativaQr] = useState(0)

  useEffect(() => {
    let ativo = true
    getAdminEventoByIdApi(id)
      .then((ev) => ativo && setEvento(ev))
      .catch((e: unknown) => {
        if (ativo)
          setErro(
            e instanceof Error ? e.message : 'Não foi possível abrir o evento.'
          )
      })
    return () => {
      ativo = false
    }
  }, [id])

  // Contagem ao vivo: quem escaneia o QR aparece aqui na próxima atualização.
  useEffect(() => {
    let ativo = true
    const atualizar = () =>
      getEventParticipationsApi(id)
        .then((ps) => {
          if (ativo)
            setPresencas({
              presentes: ps.filter((p) => p.presente).length,
              inscritos: ps.length,
            })
        })
        .catch(() => {}) // mantém o último número; a próxima rodada tenta de novo
    atualizar()
    const t = window.setInterval(atualizar, ATUALIZAR_PRESENCAS_MS)
    return () => {
      ativo = false
      window.clearInterval(t)
    }
  }, [id])

  useEffect(() => {
    let ativo = true
    let url: string | null = null
    getEventQrCodeConfirmacaoBlobApi(id)
      .then((blob) => {
        if (!ativo) return
        url = URL.createObjectURL(blob)
        setQr({ url })
      })
      .catch(async (e: unknown) => {
        const mensagem = await parseBlobErrorMessage(
          e,
          'Não foi possível gerar o QR Code de presença.'
        )
        if (ativo) setQr({ erro: mensagem })
      })
    return () => {
      ativo = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [id, tentativaQr])

  if (erro) {
    return (
      <main className="min-h-dvh grid place-items-center bg-[var(--sidebar)] text-white p-8 text-center">
        <div className="space-y-4">
          <p className="font-display text-3xl font-bold">
            Não foi possível abrir o telão
          </p>
          <p className="text-[var(--sidebar-foreground)]">{erro}</p>
          <Link
            to={`/admin/eventos/${id}`}
            className="underline underline-offset-4"
          >
            Voltar para o evento
          </Link>
        </div>
      </main>
    )
  }

  const janela = evento
    ? getPresenceWindow(evento.data, evento.horarioInicio, evento.horarioFim)
    : null
  const situacao = evento
    ? situacaoPresenca(janela, evento.status, agora)
    : null
  const aberta = situacao?.fase === 'aberta'
  const fracao =
    presencas && presencas.inscritos > 0
      ? presencas.presentes / presencas.inscritos
      : 0

  return (
    <main className="min-h-dvh flex flex-col bg-[var(--sidebar)] text-white">
      <header className="flex items-center justify-between px-8 lg:px-14 pt-8">
        <Logo className="h-9 w-auto" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={telaCheia.alternar}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--sidebar-foreground)] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[var(--color-signal)]"
          >
            {telaCheia.ativa ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
            {telaCheia.ativa ? 'Sair da tela cheia' : 'Tela cheia'}
          </button>
          <Link
            to={`/admin/eventos/${id}`}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--sidebar-foreground)] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[var(--color-signal)]"
          >
            <X className="size-4" />
            Fechar telão
          </Link>
        </div>
      </header>

      <div className="entrada flex-1 grid lg:grid-cols-[1fr_auto] items-center gap-12 lg:gap-20 px-8 lg:px-14 py-10">
        <section className="min-w-0 flex flex-col gap-8" aria-live="polite">
          {evento && situacao ? (
            <>
              <span
                className={cn(
                  'self-start inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-lg font-semibold',
                  aberta
                    ? 'bg-[var(--color-signal)] text-[var(--color-signal-ink)]'
                    : 'border border-white/30 text-[var(--sidebar-foreground)]'
                )}
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full',
                    aberta ? 'bg-current animate-pulse' : 'bg-white/40'
                  )}
                  aria-hidden
                />
                {situacao.texto}
              </span>
              <h1 className="font-display font-bold leading-[1.02] text-[clamp(2.5rem,5.2vw,5.5rem)] text-balance">
                {evento.tema}
              </h1>
              <p className="text-xl text-[var(--sidebar-foreground)]">
                {[
                  `${evento.horarioInicio?.slice(0, 5)} às ${evento.horarioFim?.slice(0, 5)}`,
                  nomeDe(evento.local),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="text-2xl lg:text-3xl font-medium max-w-[28ch]">
                {INSTRUCAO[situacao.fase]}
              </p>
            </>
          ) : (
            <>
              <SkeletonBlock className="h-10 w-72 bg-white/10" />
              <SkeletonBlock className="h-32 w-full bg-white/10" />
            </>
          )}

          <div className="flex flex-wrap items-end gap-x-14 gap-y-6 pt-4">
            <time
              dateTime={agora.toISOString()}
              className="font-display font-bold tabular-nums text-[clamp(3rem,6vw,6rem)] leading-none"
            >
              {agora.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
            {presencas && (
              <div className="min-w-[16rem] flex-1 max-w-md">
                <p className="text-xl">
                  <span className="font-display text-4xl font-bold tabular-nums">
                    {presencas.presentes}
                  </span>{' '}
                  <span className="text-[var(--sidebar-foreground)]">
                    de {presencas.inscritos} presentes
                  </span>
                </p>
                <div className="mt-3 h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-signal)] transition-[width] duration-700"
                    style={{ width: `${Math.round(fracao * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="justify-self-center rounded-[var(--radius-lg)] bg-white p-6 shadow-2xl">
          {qr && 'url' in qr ? (
            <img
              src={qr.url}
              alt={
                evento
                  ? `QR Code de confirmação de presença do evento ${evento.tema}`
                  : 'QR Code de confirmação de presença'
              }
              className={cn(
                'size-[min(62vh,40vw)] min-w-64 min-h-64 object-contain transition-[opacity,filter] duration-500',
                // Fora da janela o servidor recusa a presença: o código esmaece para ninguém escanear à toa.
                situacao && !aberta && 'opacity-20 grayscale'
              )}
            />
          ) : qr && 'erro' in qr ? (
            <div className="size-[min(62vh,40vw)] min-w-64 min-h-64 grid place-items-center text-center text-[var(--color-signal-ink)] p-6">
              <div className="space-y-4">
                <p>{qr.erro}</p>
                <button
                  type="button"
                  onClick={() => setTentativaQr((n) => n + 1)}
                  className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-white font-semibold"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <SkeletonBlock
              className="size-[min(62vh,40vw)] min-w-64 min-h-64"
              aria-label="Gerando QR Code"
            />
          )}
        </div>
      </div>
    </main>
  )
}
